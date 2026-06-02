-- ROLLBACK de 20260602100200_trigger_field_audit_log_rural_fichas.sql
-- Remove o trigger e a função de field_audit do rural_fichas.

DROP TRIGGER IF EXISTS trg_field_audit_log_rural_fichas ON public.rural_fichas;
DROP FUNCTION IF EXISTS public.trg_field_audit_log_rural_fichas();
