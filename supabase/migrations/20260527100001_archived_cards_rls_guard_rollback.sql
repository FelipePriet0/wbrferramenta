-- Rollback de 20260527100000: restaura policy sem restrição de archived_at.

DROP POLICY kanban_cards_update ON public.kanban_cards;

CREATE POLICY kanban_cards_update ON public.kanban_cards
  FOR UPDATE TO authenticated
  USING (
    public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[])
    AND lower(stage) <> 'entrada'
  )
  WITH CHECK (
    public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[])
  );
