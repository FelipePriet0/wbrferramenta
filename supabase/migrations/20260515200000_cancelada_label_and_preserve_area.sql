-- Mudança: etiqueta "Cancelada" com motivo + change_stage preserva area.
--
-- Aditiva (zero-downtime). Aplicada em produção em 4 chunks pra evitar
-- deadlock com sessões ativas. Os 3 cards atuais em canceladas receberam
-- backfill da nova etiqueta.
--
-- 1. Seed: card_labels +1 row (Cancelada / amarelo).
-- 2. Trigger estendida: auto-aplica Cancelada ao ENTRAR em 'canceladas',
--    auto-remove ao SAIR. Regra existente da Preenchida mantida.
-- 3. Backfill: aplica etiqueta nos cards já em canceladas.
-- 4. change_stage: SET area = p_area no bloco canceladas (era hardcoded
--    'analise'). Cancelamento via Kanban Comercial agora fica em
--    comercial/canceladas; cancelamento via Análise fica em analise/canceladas.

INSERT INTO public.card_labels (name, color, active)
VALUES ('Cancelada', 'amarelo', true);

CREATE OR REPLACE FUNCTION public.trg_clear_card_labels_on_stage_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_old_stage text := lower(coalesce(OLD.stage, ''));
  v_new_stage text := lower(coalesce(NEW.stage, ''));
  v_cancelada_id uuid;
BEGIN
  IF v_old_stage IS DISTINCT FROM v_new_stage
     OR OLD.area IS DISTINCT FROM NEW.area THEN

    -- Preenchida: cai em qualquer SAÍDA de 'preenchidas' (regra existente).
    IF v_old_stage = 'preenchidas' AND v_new_stage <> 'preenchidas' THEN
      DELETE FROM public.card_label_assignments cla
      USING public.card_labels cl
      WHERE cla.card_id = NEW.id
        AND cla.label_id = cl.id
        AND cl.name = 'Preenchida';
    END IF;

    -- Cancelada: AUTO-APLICA ao ENTRAR em 'canceladas'.
    IF v_new_stage = 'canceladas' AND v_old_stage <> 'canceladas' THEN
      SELECT id INTO v_cancelada_id
      FROM public.card_labels WHERE name = 'Cancelada' LIMIT 1;
      IF v_cancelada_id IS NOT NULL THEN
        INSERT INTO public.card_label_assignments (card_id, label_id, assigned_by)
        VALUES (NEW.id, v_cancelada_id, NEW.cancelled_by)
        ON CONFLICT (card_id, label_id) DO NOTHING;
      END IF;
    END IF;

    -- Cancelada: AUTO-REMOVE ao SAIR de 'canceladas' (ex: revert).
    IF v_old_stage = 'canceladas' AND v_new_stage <> 'canceladas' THEN
      DELETE FROM public.card_label_assignments cla
      USING public.card_labels cl
      WHERE cla.card_id = NEW.id
        AND cla.label_id = cl.id
        AND cl.name = 'Cancelada';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

INSERT INTO public.card_label_assignments (card_id, label_id, assigned_by)
SELECT k.id, cl.id, k.cancelled_by
FROM public.kanban_cards k, public.card_labels cl
WHERE k.stage = 'canceladas'
  AND k.deleted_at IS NULL
  AND cl.name = 'Cancelada'
ON CONFLICT (card_id, label_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.change_stage(p_card_id uuid, p_area kanban_area, p_stage text, p_reason text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_old_area kanban_area;
  v_old_stage text;
  v_new_stage text := lower(coalesce(p_stage, ''));
BEGIN
  IF NOT public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  SELECT area, lower(stage) INTO v_old_area, v_old_stage
  FROM public.kanban_cards WHERE id = p_card_id FOR UPDATE;

  IF v_old_area IS NULL THEN RAISE EXCEPTION 'card_not_found'; END IF;

  IF v_new_stage = 'entrada' AND v_old_stage <> 'entrada' THEN
    RAISE EXCEPTION 'invalid_stage';
  END IF;

  IF public.user_has_role(ARRAY['vendedor']::user_role[])
     AND (v_new_stage = 'entrada' OR v_old_stage = 'entrada') THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  -- Cancellation: needs a reason; preserves the source area (was hardcoded 'analise').
  IF v_new_stage = 'canceladas' THEN
    IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
      RAISE EXCEPTION 'reason_required';
    END IF;
    UPDATE public.kanban_cards
    SET area = p_area,
        stage = 'canceladas',
        cancel_reason = p_reason,
        cancelled_at = now(),
        cancelled_by = v_uid,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  -- Revert from Canceladas into any stage other than Finalizados/Canceladas.
  IF v_old_stage = 'canceladas' AND v_new_stage <> 'finalizados' THEN
    IF NOT public.user_has_role(ARRAY['analista','gestor']::user_role[]) THEN
      RAISE EXCEPTION 'not_allowed';
    END IF;
    IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
      RAISE EXCEPTION 'revert_reason_required';
    END IF;
    UPDATE public.kanban_cards
    SET area = p_area,
        stage = v_new_stage,
        reverted_at = now(),
        reverted_by = v_uid,
        revert_reason = p_reason,
        cancelled_at = NULL,
        cancelled_by = NULL,
        cancel_reason = NULL,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  -- Promotion comercial/concluidas → analise/recebidos
  IF p_area = 'comercial' AND v_new_stage = 'concluidas' THEN
    UPDATE public.kanban_cards
    SET area = 'analise',
        stage = 'recebidos',
        received_at = COALESCE(received_at, now()),
        assignee_id = NULL,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  -- Bug 11: voltar pra Recebidos zera assignee_id.
  IF v_new_stage = 'recebidos' AND v_old_stage <> 'recebidos' THEN
    UPDATE public.kanban_cards
    SET area = p_area,
        stage = 'recebidos',
        assignee_id = NULL,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  -- Ingress: recebidos → preenchidas (auto-assigns to current analyst).
  IF p_area = 'analise' AND v_new_stage = 'preenchidas' AND v_old_stage = 'recebidos' THEN
    IF NOT public.user_has_role(ARRAY['analista','gestor']::user_role[]) THEN
      RAISE EXCEPTION 'not_allowed';
    END IF;
    UPDATE public.kanban_cards
    SET area = 'analise',
        stage = 'preenchidas',
        assignee_id = v_uid,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  -- Finalization.
  IF v_new_stage = 'finalizados' THEN
    IF v_old_stage NOT IN ('aprovados', 'negados', 'canceladas') THEN
      RAISE EXCEPTION 'pending_decision';
    END IF;
    UPDATE public.kanban_cards
    SET area = p_area,
        stage = 'finalizados',
        final_decision = v_old_stage,
        finalized_at = now(),
        finalized_by = v_uid,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  -- Fallback: simple move.
  UPDATE public.kanban_cards
  SET area = p_area, stage = v_new_stage, updated_at = now()
  WHERE id = p_card_id;
END;
$function$;
