-- ROLLBACK de 20260519130000_trigger_field_audit_log_applicants.sql
DROP TRIGGER IF EXISTS trg_field_audit_log_applicants ON public.applicants;
DROP FUNCTION IF EXISTS public.trg_field_audit_log_applicants();
