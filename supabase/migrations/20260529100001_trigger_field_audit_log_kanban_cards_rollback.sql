-- ROLLBACK de 20260529100000_trigger_field_audit_log_kanban_cards.sql
DROP TRIGGER IF EXISTS trg_field_audit_log_kanban_cards ON public.kanban_cards;
DROP FUNCTION IF EXISTS public.trg_field_audit_log_kanban_cards();
