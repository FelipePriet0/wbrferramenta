-- ROLLBACK de 20260519140000_trigger_field_audit_log_pf_fichas.sql
DROP TRIGGER IF EXISTS trg_field_audit_log_pf_fichas ON public.pf_fichas;
DROP FUNCTION IF EXISTS public.trg_field_audit_log_pf_fichas();
