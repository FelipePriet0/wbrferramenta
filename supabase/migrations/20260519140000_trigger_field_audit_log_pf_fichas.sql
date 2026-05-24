-- Trigger AFTER UPDATE em pf_fichas → insere em field_audit_log.
-- ROLLBACK: supabase/migrations/20260519140001_trigger_field_audit_log_pf_fichas_rollback.sql

CREATE OR REPLACE FUNCTION public.trg_field_audit_log_pf_fichas()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid     uuid   := auth.uid();
  v_name    text;
  v_old     jsonb  := to_jsonb(OLD);
  v_new     jsonb  := to_jsonb(NEW);
  v_key     text;
  v_old_val text;
  v_new_val text;
  v_skip    text[] := ARRAY[
    'id','applicant_id','created_at','updated_at',
    'deleted_at','deleted_by','deletion_reason'
  ];
BEGIN
  SELECT full_name INTO v_name FROM public.profiles WHERE id = v_uid;

  FOR v_key IN
    SELECT key FROM jsonb_each(v_new) WHERE key != ALL(v_skip)
  LOOP
    v_old_val := v_old ->> v_key;
    v_new_val := v_new ->> v_key;

    IF v_old_val IS DISTINCT FROM v_new_val THEN
      INSERT INTO public.field_audit_log
        (applicant_id, table_name, field, old_value, new_value, by_id, by_name, action)
      VALUES (
        NEW.applicant_id, 'pf_fichas', v_key,
        v_old_val, v_new_val, v_uid, v_name,
        CASE
          WHEN coalesce(trim(v_new_val), '') = '' THEN 'apagado'
          WHEN coalesce(trim(v_old_val), '') = '' THEN 'preenchido'
          ELSE 'atualizado'
        END
      );
    END IF;
  END LOOP;

  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_field_audit_log_pf_fichas
  AFTER UPDATE ON public.pf_fichas
  FOR EACH ROW EXECUTE FUNCTION public.trg_field_audit_log_pf_fichas();
