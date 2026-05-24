-- =========================================================================
-- 10. Cards from "+ Nova ficha" land in 'feitas', not 'entrada'.
--
-- Reason: stage 'entrada' is write-only by API ingestion (online lead forms
-- from the website). Manual creation via the front-end always starts in
-- 'feitas / cadastrar no MK', which is where the vendedor begins working.
-- The RLS rule that blocks UPDATE on entrada stays untouched — entrada
-- remains move-out-only via change_stage.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.criar_ficha_pf_atomic(
  p_user_id uuid,
  p_primary_name text,
  p_cpf_cnpj text,
  p_phone text,
  p_whatsapp text,
  p_email text,
  p_birth_date date DEFAULT NULL,
  p_naturalidade text DEFAULT NULL,
  p_uf_naturalidade text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_app_id uuid;
  v_ficha_id uuid;
  v_card_id uuid;
BEGIN
  IF NOT public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  INSERT INTO public.applicants (person_type, primary_name, cpf_cnpj, phone, whatsapp, email)
  VALUES ('PF', p_primary_name, p_cpf_cnpj, p_phone, p_whatsapp, p_email)
  RETURNING id INTO v_app_id;

  INSERT INTO public.pf_fichas (applicant_id, birth_date, naturalidade, uf_naturalidade)
  VALUES (v_app_id, p_birth_date, p_naturalidade, p_uf_naturalidade)
  RETURNING id INTO v_ficha_id;

  INSERT INTO public.kanban_cards (applicant_id, person_type, area, stage, created_by)
  VALUES (v_app_id, 'PF', 'comercial', 'feitas', p_user_id)
  RETURNING id INTO v_card_id;

  RETURN jsonb_build_object('applicant_id', v_app_id, 'ficha_id', v_ficha_id, 'card_id', v_card_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.criar_ficha_pj_atomic(
  p_user_id uuid,
  p_primary_name text,
  p_cpf_cnpj text,
  p_phone text,
  p_whatsapp text,
  p_email text,
  p_nome_fantasia text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_app_id uuid;
  v_ficha_id uuid;
  v_card_id uuid;
BEGIN
  IF NOT public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  INSERT INTO public.applicants (person_type, primary_name, cpf_cnpj, phone, whatsapp, email)
  VALUES ('PJ', p_primary_name, p_cpf_cnpj, p_phone, p_whatsapp, p_email)
  RETURNING id INTO v_app_id;

  INSERT INTO public.pj_fichas (applicant_id, nome_fantasia)
  VALUES (v_app_id, p_nome_fantasia)
  RETURNING id INTO v_ficha_id;

  INSERT INTO public.kanban_cards (applicant_id, person_type, area, stage, created_by)
  VALUES (v_app_id, 'PJ', 'comercial', 'feitas', p_user_id)
  RETURNING id INTO v_card_id;

  RETURN jsonb_build_object('applicant_id', v_app_id, 'ficha_id', v_ficha_id, 'card_id', v_card_id);
END;
$$;
