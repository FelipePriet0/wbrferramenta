-- =========================================================================
-- 12. Revert "cancel archives" — cancelling no longer sends to Histórico.
--
-- New rule: a cancelled card lives in the Canceladas column of the Análise
-- board until someone manually finalises it. Only Finalizados gets
-- auto-archived to Histórico. This gives the analysis team full visibility
-- of cancelled fichas before they disappear.
--
-- Changes:
--   1. change_stage on 'canceladas' no longer sets archived_at.
--   2. list_historico goes back to listing only finalised cards.
--   3. Backfill: cards that were archived in migration 11 are revived
--      (archived_at → NULL) so they show up on the Análise board again.
-- =========================================================================

-- 1. change_stage — cancel without archiving.
CREATE OR REPLACE FUNCTION public.change_stage(
  p_card_id uuid,
  p_area kanban_area,
  p_stage text,
  p_reason text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
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

  -- Cancellation: needs a reason; lands in Canceladas column of Análise.
  -- (No archived_at — stays visible to the analysis team.)
  IF v_new_stage = 'canceladas' THEN
    IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
      RAISE EXCEPTION 'reason_required';
    END IF;
    UPDATE public.kanban_cards
    SET area = 'analise',
        stage = 'canceladas',
        cancel_reason = p_reason,
        cancelled_at = now(),
        cancelled_by = v_uid,
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

  -- Ingress: recebidos → preenchidas
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

  -- Finalization (the only path that leads to Histórico, via auto-archive).
  IF v_new_stage = 'finalizados' THEN
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
$$;

-- 2. list_historico — only finalised cards (cancelled ones stay on the board).
--    We keep the wider return shape (cancel_reason, cancelled_at) for
--    forward compat, but the filter narrows again to 'finalizados'.
DROP FUNCTION IF EXISTS public.list_historico(text, timestamptz, timestamptz, text, uuid);
CREATE FUNCTION public.list_historico(
  p_search text DEFAULT NULL,
  p_date_start timestamptz DEFAULT NULL,
  p_date_end timestamptz DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_responsavel uuid DEFAULT NULL
) RETURNS TABLE (
  id uuid,
  applicant_id uuid,
  applicant_name text,
  cpf_cnpj text,
  final_decision text,
  finalized_at timestamptz,
  archived_at timestamptz,
  cancel_reason text,
  cancelled_at timestamptz,
  vendedor_id uuid,
  vendedor_name text,
  analista_id uuid,
  analista_name text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT
    c.id,
    a.id           AS applicant_id,
    a.primary_name AS applicant_name,
    a.cpf_cnpj,
    c.final_decision,
    c.finalized_at,
    c.archived_at,
    c.cancel_reason,
    c.cancelled_at,
    v.id           AS vendedor_id,
    v.full_name    AS vendedor_name,
    n.id           AS analista_id,
    n.full_name    AS analista_name
  FROM public.kanban_cards c
  JOIN public.applicants a ON a.id = c.applicant_id
  LEFT JOIN public.profiles v ON v.id = c.created_by
  LEFT JOIN public.profiles n ON n.id = c.assignee_id
  WHERE c.area = 'analise'
    AND lower(c.stage) = 'finalizados'
    AND c.archived_at IS NOT NULL
    AND c.deleted_at IS NULL
    AND (p_search IS NULL
         OR public.norm_text(a.primary_name) LIKE '%' || public.norm_text(p_search) || '%'
         OR a.cpf_cnpj ILIKE '%' || p_search || '%')
    AND (p_date_start IS NULL OR c.finalized_at >= p_date_start)
    AND (p_date_end   IS NULL OR c.finalized_at <= p_date_end)
    AND (p_status IS NULL OR p_status = ''
         OR lower(p_status) = lower(coalesce(c.final_decision, '')))
    AND (p_responsavel IS NULL OR c.created_by = p_responsavel OR c.assignee_id = p_responsavel)
  ORDER BY c.finalized_at DESC NULLS LAST, c.id;
$$;

-- 3. Backfill rollback — revive cards that migration 11 archived on cancel.
--    They go back to the Canceladas column of Análise.
UPDATE public.kanban_cards
SET archived_at = NULL,
    updated_at = now()
WHERE lower(stage) = 'canceladas'
  AND archived_at IS NOT NULL;
