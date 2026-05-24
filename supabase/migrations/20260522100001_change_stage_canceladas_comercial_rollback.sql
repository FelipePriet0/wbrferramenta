-- ROLLBACK: Restaura change_stage para o estado anterior à migration 20260522100000
-- Rodar este arquivo caso algo dê errado após a migration de canceladas comercial → análise

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

  IF v_old_stage = 'canceladas' AND v_new_stage <> 'finalizados' THEN
    IF NOT public.user_has_role(ARRAY['vendedor','analista','gestor']::user_role[]) THEN
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

  IF v_new_stage = 'recebidos' AND v_old_stage <> 'recebidos' THEN
    UPDATE public.kanban_cards
    SET area = p_area,
        stage = 'recebidos',
        assignee_id = NULL,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

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

  UPDATE public.kanban_cards
  SET area = p_area, stage = v_new_stage, updated_at = now()
  WHERE id = p_card_id;
END;
$function$;
