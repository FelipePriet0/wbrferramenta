-- Fichas arquivadas (archived_at IS NOT NULL) não podem ser editadas via UPDATE direto.
-- restore_card é SECURITY DEFINER → ignora RLS, continua funcionando.
-- Rollback: 20260527100001_archived_cards_rls_guard_rollback.sql

DROP POLICY kanban_cards_update ON public.kanban_cards;

CREATE POLICY kanban_cards_update ON public.kanban_cards
  FOR UPDATE TO authenticated
  USING (
    public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[])
    AND lower(stage) <> 'entrada'
    AND archived_at IS NULL
  )
  WITH CHECK (
    public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[])
  );
