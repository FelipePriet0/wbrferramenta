-- ROLLBACK de 20260519150000_trigger_field_audit_log_pj_fichas.sql
DROP TRIGGER IF EXISTS trg_field_audit_log_pj_fichas ON public.pj_fichas;
DROP FUNCTION IF EXISTS public.trg_field_audit_log_pj_fichas();
