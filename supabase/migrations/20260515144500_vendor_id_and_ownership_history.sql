-- Mudança A: transferência de operador (vendedor/analista) com histórico.
--
-- Aditiva (zero-downtime). Aplicada em produção em chunks para evitar deadlock
-- com sessões ativas dos vendedores/analistas no kanban_cards.
--
-- 1. vendor_id em kanban_cards (mutável, separado do created_by que é audit).
-- 2. Backfill: fichas existentes começam com vendor_id = created_by.
-- 3. Tabela card_ownership_history pra registrar toda transferência (vendor + analyst).
-- 4. Trigger AFTER UPDATE em vendor_id/assignee_id pra alimentar o histórico.
-- 5. RPCs criar_ficha_*_atomic estendidas pra setar vendor_id no INSERT do card.

ALTER TABLE public.kanban_cards
  ADD COLUMN vendor_id uuid REFERENCES public.profiles(id);

UPDATE public.kanban_cards SET vendor_id = created_by WHERE vendor_id IS NULL;

CREATE TABLE public.card_ownership_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('vendor', 'analyst')),
  from_id uuid REFERENCES public.profiles(id),
  to_id uuid REFERENCES public.profiles(id),
  changed_by uuid REFERENCES public.profiles(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_coh_card_id ON public.card_ownership_history(card_id);
CREATE INDEX idx_coh_changed_at ON public.card_ownership_history(changed_at DESC);

ALTER TABLE public.card_ownership_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY coh_select ON public.card_ownership_history
  FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.trg_log_card_ownership_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
BEGIN
  IF NEW.vendor_id IS DISTINCT FROM OLD.vendor_id THEN
    INSERT INTO public.card_ownership_history (card_id, role, from_id, to_id, changed_by)
    VALUES (NEW.id, 'vendor', OLD.vendor_id, NEW.vendor_id, v_uid);
  END IF;
  IF NEW.assignee_id IS DISTINCT FROM OLD.assignee_id THEN
    INSERT INTO public.card_ownership_history (card_id, role, from_id, to_id, changed_by)
    VALUES (NEW.id, 'analyst', OLD.assignee_id, NEW.assignee_id, v_uid);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER kanban_cards_log_ownership_change
AFTER UPDATE OF vendor_id, assignee_id ON public.kanban_cards
FOR EACH ROW EXECUTE FUNCTION public.trg_log_card_ownership_change();

CREATE OR REPLACE FUNCTION public.criar_ficha_pf_atomic(
  p_user_id uuid, p_primary_name text, p_cpf_cnpj text,
  p_phone text, p_whatsapp text, p_email text,
  p_birth_date text DEFAULT NULL, p_naturalidade text DEFAULT NULL, p_uf_naturalidade text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE v_app_id uuid; v_ficha_id uuid; v_card_id uuid;
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
  INSERT INTO public.kanban_cards (applicant_id, person_type, area, stage, created_by, vendor_id)
  VALUES (v_app_id, 'PF', 'comercial', 'feitas', p_user_id, p_user_id)
  RETURNING id INTO v_card_id;
  RETURN jsonb_build_object('applicant_id', v_app_id, 'ficha_id', v_ficha_id, 'card_id', v_card_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.criar_ficha_pj_atomic(
  p_user_id uuid, p_primary_name text, p_cpf_cnpj text,
  p_phone text, p_whatsapp text, p_email text, p_nome_fantasia text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE v_app_id uuid; v_ficha_id uuid; v_card_id uuid;
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
  INSERT INTO public.kanban_cards (applicant_id, person_type, area, stage, created_by, vendor_id)
  VALUES (v_app_id, 'PJ', 'comercial', 'feitas', p_user_id, p_user_id)
  RETURNING id INTO v_card_id;
  RETURN jsonb_build_object('applicant_id', v_app_id, 'ficha_id', v_ficha_id, 'card_id', v_card_id);
END;
$function$;
