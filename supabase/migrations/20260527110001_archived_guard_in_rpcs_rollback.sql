-- Rollback de 20260527110000: restaura 8 RPCs sem guard de archived_at.

-- -------------------------------------------------------------------------
-- change_stage (versão de 20260522100000)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.change_stage(p_card_id uuid, p_area kanban_area, p_stage text, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_old_area kanban_area;
  v_old_stage text;
  v_new_stage text := lower(coalesce(p_stage, ''));
BEGIN
  IF NOT public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  SELECT area, lower(stage) INTO v_old_area, v_old_stage
  FROM public.kanban_cards WHERE id = p_card_id FOR UPDATE;

  IF v_old_area IS NULL THEN RAISE EXCEPTION 'card_not_found'; END IF;

  IF v_new_stage = 'entrada' AND v_old_stage <> 'entrada' THEN
    RAISE EXCEPTION 'invalid_stage';
  END IF;

  IF public.user_has_role(ARRAY['vendedor']::user_role[])
     AND (v_new_stage = 'entrada' OR v_old_stage = 'entrada') THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  IF v_new_stage = 'canceladas' THEN
    IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
      RAISE EXCEPTION 'reason_required';
    END IF;
    IF p_area = 'comercial' THEN
      UPDATE public.kanban_cards
      SET area = 'analise', stage = 'canceladas', cancel_reason = p_reason,
          cancelled_at = now(), cancelled_by = v_uid, updated_at = now()
      WHERE id = p_card_id;
    ELSE
      UPDATE public.kanban_cards
      SET area = p_area, stage = 'canceladas', cancel_reason = p_reason,
          cancelled_at = now(), cancelled_by = v_uid, updated_at = now()
      WHERE id = p_card_id;
    END IF;
    RETURN;
  END IF;

  IF v_old_stage = 'canceladas' AND v_new_stage <> 'finalizados' THEN
    IF NOT public.user_has_role(ARRAY['vendedor','analista','gestor']::user_role[]) THEN
      RAISE EXCEPTION 'not_allowed';
    END IF;
    IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
      RAISE EXCEPTION 'revert_reason_required';
    END IF;
    UPDATE public.kanban_cards
    SET area = p_area, stage = v_new_stage, reverted_at = now(), reverted_by = v_uid,
        revert_reason = p_reason, cancelled_at = NULL, cancelled_by = NULL,
        cancel_reason = NULL, updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  IF p_area = 'comercial' AND v_new_stage = 'concluidas' THEN
    UPDATE public.kanban_cards
    SET area = 'analise', stage = 'recebidos', received_at = COALESCE(received_at, now()),
        assignee_id = NULL, updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  IF v_new_stage = 'recebidos' AND v_old_stage <> 'recebidos' THEN
    UPDATE public.kanban_cards
    SET area = p_area, stage = 'recebidos', assignee_id = NULL, updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  IF p_area = 'analise' AND v_new_stage = 'preenchidas' AND v_old_stage = 'recebidos' THEN
    IF NOT public.user_has_role(ARRAY['analista','gestor']::user_role[]) THEN
      RAISE EXCEPTION 'not_allowed';
    END IF;
    UPDATE public.kanban_cards
    SET area = 'analise', stage = 'preenchidas', assignee_id = v_uid, updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  IF v_new_stage = 'finalizados' THEN
    IF v_old_stage NOT IN ('aprovados', 'negados', 'canceladas') THEN
      RAISE EXCEPTION 'pending_decision';
    END IF;
    UPDATE public.kanban_cards
    SET area = p_area, stage = 'finalizados', final_decision = v_old_stage,
        finalized_at = now(), finalized_by = v_uid, updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  UPDATE public.kanban_cards
  SET area = p_area, stage = v_new_stage, updated_at = now()
  WHERE id = p_card_id;
END;
$function$;

-- -------------------------------------------------------------------------
-- set_card_decision (versão original)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_card_decision(p_card_id uuid, p_decision kanban_decision_status)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_target_stage text;
BEGIN
  IF NOT public.can_user_manage_card(p_card_id) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  v_target_stage := CASE p_decision
    WHEN 'aprovado'  THEN 'aprovados'
    WHEN 'negado'    THEN 'negados'
    WHEN 'reanalise' THEN 'reanalise'
  END;

  UPDATE public.kanban_cards
  SET area = 'analise', stage = v_target_stage, decision_status = p_decision,
      decision_at = now(), decision_by = v_uid, updated_at = now()
  WHERE id = p_card_id;
END;
$$;

-- -------------------------------------------------------------------------
-- soft_delete_card (versão original)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soft_delete_card(p_card_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
BEGIN
  IF NOT public.user_has_role(ARRAY['analista','gestor','instalador']::user_role[]) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  UPDATE public.kanban_cards
  SET deleted_at = now(), deleted_by = v_uid, deletion_reason = p_reason, updated_at = now()
  WHERE id = p_card_id AND deleted_at IS NULL;
END;
$$;

-- -------------------------------------------------------------------------
-- add_parecer (versão original)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_parecer(
  p_card_id uuid, p_text text, p_parent_id text DEFAULT NULL, p_decision kanban_decision_status DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_name text; v_role user_role;
  v_note_id text := gen_random_uuid()::text;
  v_parent jsonb; v_thread_id text;
  v_level int := 0; v_note jsonb;
BEGIN
  IF NOT public.can_user_manage_card(p_card_id) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  SELECT full_name, role INTO v_name, v_role FROM public.profiles WHERE id = v_uid;
  PERFORM 1 FROM public.kanban_cards WHERE id = p_card_id FOR UPDATE;

  IF p_parent_id IS NOT NULL THEN
    SELECT note INTO v_parent
    FROM public.kanban_cards c,
         jsonb_array_elements(c.reanalysis_notes) note
    WHERE c.id = p_card_id AND note->>'id' = p_parent_id
    LIMIT 1;
    IF v_parent IS NULL THEN RAISE EXCEPTION 'parent_not_found'; END IF;
    v_thread_id := coalesce(v_parent->>'thread_id', v_parent->>'id');
    v_level := coalesce((v_parent->>'level')::int, 0) + 1;
  ELSE
    v_thread_id := v_note_id;
  END IF;

  v_note := jsonb_build_object(
    'id', v_note_id, 'text', p_text, 'mentions', '[]'::jsonb,
    'author_id', v_uid::text, 'author_name', v_name, 'author_role', v_role::text,
    'created_at', to_jsonb(now()), 'parent_id', to_jsonb(p_parent_id),
    'level', v_level, 'thread_id', v_thread_id,
    'is_thread_starter', (p_parent_id IS NULL), 'decision', to_jsonb(p_decision)
  );

  UPDATE public.kanban_cards
  SET reanalysis_notes = coalesce(reanalysis_notes, '[]'::jsonb) || jsonb_build_array(v_note),
      updated_at = now()
  WHERE id = p_card_id;

  IF p_decision IS NOT NULL THEN
    PERFORM public.set_card_decision(p_card_id, p_decision);
  END IF;

  RETURN jsonb_build_object('note_id', v_note_id, 'thread_id', v_thread_id);
END;
$$;

-- -------------------------------------------------------------------------
-- edit_parecer (versão original)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.edit_parecer(
  p_card_id uuid, p_note_id text, p_text text, p_decision kanban_decision_status DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_name text; v_notes jsonb;
  v_new jsonb := '[]'::jsonb; v_node jsonb; v_matched boolean := false;
BEGIN
  SELECT full_name INTO v_name FROM public.profiles WHERE id = v_uid;
  PERFORM 1 FROM public.kanban_cards WHERE id = p_card_id FOR UPDATE;
  SELECT coalesce(reanalysis_notes, '[]'::jsonb) INTO v_notes FROM public.kanban_cards WHERE id = p_card_id;

  FOR v_node IN SELECT jsonb_array_elements(v_notes) LOOP
    IF (v_node->>'id') = p_note_id THEN
      IF (v_node->>'author_id') <> v_uid::text THEN RAISE EXCEPTION 'not_author'; END IF;
      v_node := v_node || jsonb_build_object('text', p_text, 'updated_by_id', v_uid::text,
                                              'updated_by_name', v_name, 'updated_at', to_jsonb(now()),
                                              'decision', to_jsonb(p_decision));
      v_matched := true;
    END IF;
    v_new := v_new || jsonb_build_array(v_node);
  END LOOP;

  IF NOT v_matched THEN RAISE EXCEPTION 'note_not_found'; END IF;
  UPDATE public.kanban_cards SET reanalysis_notes = v_new, updated_at = now() WHERE id = p_card_id;
  IF p_decision IS NOT NULL THEN PERFORM public.set_card_decision(p_card_id, p_decision); END IF;
END;
$$;

-- -------------------------------------------------------------------------
-- delete_parecer (versão original)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_parecer(p_card_id uuid, p_note_id text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_notes jsonb; v_new jsonb := '[]'::jsonb; v_node jsonb;
BEGIN
  PERFORM 1 FROM public.kanban_cards WHERE id = p_card_id FOR UPDATE;
  SELECT coalesce(reanalysis_notes, '[]'::jsonb) INTO v_notes FROM public.kanban_cards WHERE id = p_card_id;

  FOR v_node IN SELECT jsonb_array_elements(v_notes) LOOP
    IF (v_node->>'id') = p_note_id THEN
      IF (v_node->>'author_id') <> v_uid::text THEN RAISE EXCEPTION 'not_author'; END IF;
      v_node := v_node || jsonb_build_object('deleted', true);
    END IF;
    v_new := v_new || jsonb_build_array(v_node);
  END LOOP;

  UPDATE public.kanban_cards SET reanalysis_notes = v_new, updated_at = now() WHERE id = p_card_id;
END;
$$;

-- -------------------------------------------------------------------------
-- assign_urgent_with_reason (versão original)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_urgent_with_reason(p_card_id uuid, p_label_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
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
  SET urgent_reason = p_reason, urgent_reason_by = v_uid, urgent_reason_at = now(), updated_at = now()
  WHERE id = p_card_id;
END;
$function$;

-- -------------------------------------------------------------------------
-- update_urgent_reason (versão original)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_urgent_reason(p_card_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_author uuid;
BEGIN
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'reason_required';
  END IF;
  SELECT urgent_reason_by INTO v_author FROM public.kanban_cards WHERE id = p_card_id;
  IF v_author IS NULL THEN RAISE EXCEPTION 'not_urgent'; END IF;
  IF v_author <> v_uid THEN RAISE EXCEPTION 'not_owner'; END IF;
  UPDATE public.kanban_cards
  SET urgent_reason = p_reason, urgent_reason_at = now(), updated_at = now()
  WHERE id = p_card_id;
END;
$function$;
