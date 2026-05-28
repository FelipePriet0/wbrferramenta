-- Recria set_card_decision com 3 parâmetros (p_revert_reason DEFAULT NULL).
-- A migration 20260528110000 removeu a versão 2-param assumindo que a versão
-- 3-param já existia, mas ela nunca foi criada em nenhuma migration.
-- Com DEFAULT NULL, chamadas com 2 args (add_parecer e frontend) continuam funcionando.

CREATE OR REPLACE FUNCTION public.set_card_decision(
  p_card_id       uuid,
  p_decision      kanban_decision_status,
  p_revert_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid          uuid := (SELECT auth.uid());
  v_target_stage text;
BEGIN
  IF NOT public.can_user_manage_card(p_card_id) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.kanban_cards
    WHERE id = p_card_id AND archived_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'card_archived';
  END IF;

  v_target_stage := CASE p_decision
    WHEN 'aprovado'  THEN 'aprovados'
    WHEN 'negado'    THEN 'negados'
    WHEN 'reanalise' THEN 'reanalise'
  END;

  UPDATE public.kanban_cards
  SET area            = 'analise',
      stage           = v_target_stage,
      decision_status = p_decision,
      decision_at     = now(),
      decision_by     = v_uid,
      updated_at      = now()
  WHERE id = p_card_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_card_decision(uuid, kanban_decision_status, text) TO authenticated;
