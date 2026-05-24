-- =========================================================================
-- 11. Canceling a card archives it on the spot.
--
-- A cancelled ficha is a dead ficha — it should leave both kanbans
-- immediately and land in the Histórico. To make that happen:
--
--   1. change_stage(..., 'canceladas', ...) now also sets archived_at = now().
--   2. list_historico starts including stage='canceladas' alongside 'finalizados'.
--   3. Any existing cancelled-but-not-archived cards are backfilled.
--
-- The UI side will drop the Canceladas column from both boards and add
-- "Cancelar ficha" to each card's "..." menu.
-- =========================================================================

-- 1. change_stage — archive on cancel.
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

  -- entrada is write-only via criar_ficha_*_atomic / API ingestion.
  IF v_new_stage = 'entrada' AND v_old_stage <> 'entrada' THEN
    RAISE EXCEPTION 'invalid_stage';
  END IF;

  IF public.user_has_role(ARRAY['vendedor']::user_role[])
     AND (v_new_stage = 'entrada' OR v_old_stage = 'entrada') THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  -- Cancellation: needs a reason; goes straight to histórico (archived).
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
        archived_at = now(),   -- ← NEW: cancel = instantly archived
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

  -- Finalization
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

-- 2. list_historico — include cancelled cards alongside finalised ones.
--    DROP first because we're adding columns to the OUT signature.
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
    COALESCE(c.final_decision,
             CASE WHEN lower(c.stage) = 'canceladas' THEN 'cancelada' END) AS final_decision,
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
  WHERE c.archived_at IS NOT NULL
    AND c.deleted_at IS NULL
    AND lower(c.stage) IN ('finalizados', 'canceladas')
    AND (p_search IS NULL
         OR public.norm_text(a.primary_name) LIKE '%' || public.norm_text(p_search) || '%'
         OR a.cpf_cnpj ILIKE '%' || p_search || '%')
    AND (p_date_start IS NULL OR COALESCE(c.finalized_at, c.cancelled_at) >= p_date_start)
    AND (p_date_end   IS NULL OR COALESCE(c.finalized_at, c.cancelled_at) <= p_date_end)
    AND (p_status IS NULL OR p_status = ''
         OR lower(p_status) = lower(coalesce(c.final_decision, ''))
         OR (lower(p_status) = 'cancelada' AND lower(c.stage) = 'canceladas'))
    AND (p_responsavel IS NULL OR c.created_by = p_responsavel OR c.assignee_id = p_responsavel)
  ORDER BY COALESCE(c.finalized_at, c.cancelled_at) DESC NULLS LAST, c.id;
$$;

-- 3. Backfill: existing cancelled cards that aren't archived yet.
UPDATE public.kanban_cards
SET archived_at = COALESCE(cancelled_at, updated_at, now())
WHERE lower(stage) = 'canceladas'
  AND archived_at IS NULL;
