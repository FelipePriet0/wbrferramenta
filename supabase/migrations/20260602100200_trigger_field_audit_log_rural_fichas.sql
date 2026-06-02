-- Trigger AFTER UPDATE em rural_fichas → insere em field_audit_log.
-- Clone exato de trg_field_audit_log_pf_fichas, trocando o literal 'pf_fichas' por 'rural_fichas'.
-- ROLLBACK: 20260602100201_trigger_field_audit_log_rural_fichas_rollback.sql

CREATE OR REPLACE FUNCTION public.trg_field_audit_log_rural_fichas()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
        NEW.applicant_id, 'rural_fichas', v_key,
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
$function$;

CREATE TRIGGER trg_field_audit_log_rural_fichas
  AFTER UPDATE ON public.rural_fichas
  FOR EACH ROW EXECUTE FUNCTION public.trg_field_audit_log_rural_fichas();
