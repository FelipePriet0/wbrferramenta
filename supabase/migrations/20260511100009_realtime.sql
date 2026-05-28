-- =========================================================================
-- 09. Realtime publication
-- Wrapped in exception handlers so this migration is idempotent and
-- branch-safe: Supabase branches may already have tables in the publication
-- (from snapshot), which would cause "relation already member of publication".
-- =========================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'applicants', 'kanban_cards', 'pf_fichas', 'pj_fichas',
    'profiles', 'card_attachments', 'card_label_assignments'
  ]
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    EXCEPTION WHEN duplicate_object THEN
      NULL; -- already in publication, skip
    END;
  END LOOP;
END;
$$;

-- REPLICA IDENTITY FULL where the front needs the full payload on UPDATE/DELETE
ALTER TABLE kanban_cards           REPLICA IDENTITY FULL;
ALTER TABLE card_attachments       REPLICA IDENTITY FULL;
ALTER TABLE card_label_assignments REPLICA IDENTITY FULL;
