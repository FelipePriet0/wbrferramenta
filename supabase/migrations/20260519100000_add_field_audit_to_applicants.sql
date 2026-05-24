-- Rastreia quem preencheu e quando em campos-chave da tabela applicants.
-- field_audit é um JSONB com uma entrada por campo: { by_id, by_name, at }.

ALTER TABLE public.applicants
  ADD COLUMN field_audit jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.trg_applicants_field_audit()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid   uuid        := auth.uid();
  v_name  text;
  v_audit jsonb;
  v_now   timestamptz := now();
BEGIN
  SELECT full_name INTO v_name FROM public.profiles WHERE id = v_uid;
  v_audit := coalesce(NEW.field_audit, '{}'::jsonb);

  IF NEW.info_spc IS DISTINCT FROM OLD.info_spc THEN
    v_audit := jsonb_set(v_audit, '{info_spc}',
      jsonb_build_object('by_id', v_uid::text, 'by_name', v_name, 'at', v_now));
  END IF;
  IF NEW.info_pesquisador IS DISTINCT FROM OLD.info_pesquisador THEN
    v_audit := jsonb_set(v_audit, '{info_pesquisador}',
      jsonb_build_object('by_id', v_uid::text, 'by_name', v_name, 'at', v_now));
  END IF;
  IF NEW.info_relevantes IS DISTINCT FROM OLD.info_relevantes THEN
    v_audit := jsonb_set(v_audit, '{info_relevantes}',
      jsonb_build_object('by_id', v_uid::text, 'by_name', v_name, 'at', v_now));
  END IF;
  IF NEW.info_mk IS DISTINCT FROM OLD.info_mk THEN
    v_audit := jsonb_set(v_audit, '{info_mk}',
      jsonb_build_object('by_id', v_uid::text, 'by_name', v_name, 'at', v_now));
  END IF;
  IF NEW.observacoes IS DISTINCT FROM OLD.observacoes THEN
    v_audit := jsonb_set(v_audit, '{observacoes}',
      jsonb_build_object('by_id', v_uid::text, 'by_name', v_name, 'at', v_now));
  END IF;

  NEW.field_audit := v_audit;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_applicants_field_audit
  BEFORE UPDATE ON public.applicants
  FOR EACH ROW EXECUTE FUNCTION public.trg_applicants_field_audit();
