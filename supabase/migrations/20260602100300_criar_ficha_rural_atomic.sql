-- RPC atômica para criar ficha Rural (applicants + rural_fichas + kanban_cards).
-- Clone de criar_ficha_pf_atomic, com person_type 'Rural' e insert em rural_fichas.
-- Mesma guarda de role (vendedor/analista/gestor/instalador) e mesmo retorno.

CREATE OR REPLACE FUNCTION public.criar_ficha_rural_atomic(
  p_user_id uuid,
  p_primary_name text,
  p_cpf_cnpj text,
  p_phone text,
  p_whatsapp text,
  p_email text,
  p_birth_date text DEFAULT NULL::text,
  p_naturalidade text DEFAULT NULL::text,
  p_uf_naturalidade text DEFAULT NULL::text
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE v_app_id uuid; v_ficha_id uuid; v_card_id uuid;
BEGIN
  IF NOT public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;
  INSERT INTO public.applicants (person_type, primary_name, cpf_cnpj, phone, whatsapp, email)
  VALUES ('Rural', p_primary_name, p_cpf_cnpj, p_phone, p_whatsapp, p_email)
  RETURNING id INTO v_app_id;
  INSERT INTO public.rural_fichas (applicant_id, birth_date, naturalidade, uf_naturalidade)
  VALUES (v_app_id, p_birth_date, p_naturalidade, p_uf_naturalidade)
  RETURNING id INTO v_ficha_id;
  INSERT INTO public.kanban_cards (applicant_id, person_type, area, stage, created_by, vendor_id)
  VALUES (v_app_id, 'Rural', 'comercial', 'feitas', p_user_id, p_user_id)
  RETURNING id INTO v_card_id;
  RETURN jsonb_build_object('applicant_id', v_app_id, 'ficha_id', v_ficha_id, 'card_id', v_card_id);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.criar_ficha_rural_atomic(uuid, text, text, text, text, text, text, text, text) TO authenticated;
