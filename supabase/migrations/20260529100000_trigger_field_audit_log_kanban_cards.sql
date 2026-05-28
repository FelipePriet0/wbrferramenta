-- Trigger AFTER UPDATE em kanban_cards → insere em field_audit_log.
-- Rastreia apenas os campos de agendamento: due_at, hora_at, periodo.
-- ROLLBACK: supabase/migrations/20260529100001_trigger_field_audit_log_kanban_cards_rollback.sql

CREATE OR REPLACE FUNCTION public.trg_field_audit_log_kanban_cards()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid     uuid   := auth.uid();
  v_name    text;
  v_old_val text;
  v_new_val text;
BEGIN
  SELECT full_name INTO v_name FROM public.profiles WHERE id = v_uid;

  -- due_at
  v_old_val := OLD.due_at::text;
  v_new_val := NEW.due_at::text;
  IF v_old_val IS DISTINCT FROM v_new_val THEN
    INSERT INTO public.field_audit_log
      (applicant_id, table_name, field, old_value, new_value, by_id, by_name, action)
    VALUES (
      NEW.applicant_id, 'kanban_cards', 'due_at',
      v_old_val, v_new_val, v_uid, v_name,
      CASE
        WHEN v_new_val IS NULL THEN 'apagado'
        WHEN v_old_val IS NULL THEN 'preenchido'
        ELSE 'atualizado'
      END
    );
  END IF;

  -- hora_at (array → serializa como texto para exibição)
  v_old_val := array_to_string(OLD.hora_at, ', ');
  v_new_val := array_to_string(NEW.hora_at, ', ');
  IF (OLD.hora_at IS DISTINCT FROM NEW.hora_at) THEN
    INSERT INTO public.field_audit_log
      (applicant_id, table_name, field, old_value, new_value, by_id, by_name, action)
    VALUES (
      NEW.applicant_id, 'kanban_cards', 'hora_at',
      nullif(v_old_val, ''), nullif(v_new_val, ''), v_uid, v_name,
      CASE
        WHEN coalesce(v_new_val, '') = '' THEN 'apagado'
        WHEN coalesce(v_old_val, '') = '' THEN 'preenchido'
        ELSE 'atualizado'
      END
    );
  END IF;

  -- periodo
  v_old_val := OLD.periodo::text;
  v_new_val := NEW.periodo::text;
  IF v_old_val IS DISTINCT FROM v_new_val THEN
    INSERT INTO public.field_audit_log
      (applicant_id, table_name, field, old_value, new_value, by_id, by_name, action)
    VALUES (
      NEW.applicant_id, 'kanban_cards', 'periodo',
      v_old_val, v_new_val, v_uid, v_name,
      CASE
        WHEN v_new_val IS NULL THEN 'apagado'
        WHEN v_old_val IS NULL THEN 'preenchido'
        ELSE 'atualizado'
      END
    );
  END IF;

  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_field_audit_log_kanban_cards
  AFTER UPDATE ON public.kanban_cards
  FOR EACH ROW EXECUTE FUNCTION public.trg_field_audit_log_kanban_cards();
