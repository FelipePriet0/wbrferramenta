-- Mudança 1: etiqueta "Urgente" com motivo opcional.
--
-- 3 colunas em kanban_cards guardam o texto + autor + timestamp.
-- Trigger zera as 3 quando a assignment "Urgente" é removida (regra: "se deletaram,
-- a urgência sumiu"). Duas RPCs garantem atomicidade (INSERT + UPDATE em
-- mesma transação) e RBAC (só o autor edita o próprio motivo).

-- 1) Colunas em kanban_cards.
ALTER TABLE public.kanban_cards
  ADD COLUMN urgent_reason text,
  ADD COLUMN urgent_reason_by uuid REFERENCES public.profiles(id),
  ADD COLUMN urgent_reason_at timestamptz;

-- 2) Trigger function: ao deletar assignment de "Urgente", zera os 3 campos.
CREATE OR REPLACE FUNCTION public.trg_clear_urgent_reason_on_unassign()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_label_name text;
BEGIN
  SELECT name INTO v_label_name
  FROM public.card_labels
  WHERE id = OLD.label_id;

  IF v_label_name = 'Urgente' THEN
    UPDATE public.kanban_cards
    SET urgent_reason = NULL,
        urgent_reason_by = NULL,
        urgent_reason_at = NULL,
        updated_at = now()
    WHERE id = OLD.card_id;
  END IF;

  RETURN OLD;
END;
$function$;

-- 3) Trigger AFTER DELETE em card_label_assignments.
CREATE TRIGGER card_label_assignments_clear_urgent_reason_on_delete
AFTER DELETE ON public.card_label_assignments
FOR EACH ROW EXECUTE FUNCTION public.trg_clear_urgent_reason_on_unassign();

-- 4) RPC atômica: assign Urgente + grava motivo.
CREATE OR REPLACE FUNCTION public.assign_urgent_with_reason(
  p_card_id uuid,
  p_label_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
BEGIN
  IF NOT public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'reason_required';
  END IF;

  INSERT INTO public.card_label_assignments (card_id, label_id, assigned_by)
  VALUES (p_card_id, p_label_id, v_uid)
  ON CONFLICT (card_id, label_id) DO NOTHING;

  UPDATE public.kanban_cards
  SET urgent_reason = p_reason,
      urgent_reason_by = v_uid,
      urgent_reason_at = now(),
      updated_at = now()
  WHERE id = p_card_id;
END;
$function$;

-- 5) RPC: atualizar o motivo (apenas o autor original — RBAC no servidor).
CREATE OR REPLACE FUNCTION public.update_urgent_reason(
  p_card_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_author uuid;
BEGIN
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'reason_required';
  END IF;

  SELECT urgent_reason_by INTO v_author
  FROM public.kanban_cards WHERE id = p_card_id;

  IF v_author IS NULL THEN RAISE EXCEPTION 'not_urgent'; END IF;
  IF v_author <> v_uid THEN RAISE EXCEPTION 'not_owner'; END IF;

  UPDATE public.kanban_cards
  SET urgent_reason = p_reason,
      urgent_reason_at = now(),
      updated_at = now()
  WHERE id = p_card_id;
END;
$function$;
