-- =========================================================================
-- 09. Realtime publication
-- =========================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE applicants;
ALTER PUBLICATION supabase_realtime ADD TABLE kanban_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE pf_fichas;
ALTER PUBLICATION supabase_realtime ADD TABLE pj_fichas;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE card_attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE card_label_assignments;

-- REPLICA IDENTITY FULL where the front needs the full payload on UPDATE/DELETE
ALTER TABLE kanban_cards           REPLICA IDENTITY FULL;
ALTER TABLE card_attachments       REPLICA IDENTITY FULL;
ALTER TABLE card_label_assignments REPLICA IDENTITY FULL;
