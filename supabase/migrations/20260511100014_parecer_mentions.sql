-- =========================================================================
-- 14. Persist parecer mentions properly.
--
-- Until now add_parecer hard-coded `mentions: []`, so list_my_mention_cards
-- never found a single match — and the kanban card never lit up green for
-- the mentioned analyst. The fix:
--   1. add_parecer learns a new p_mentions jsonb parameter (defaults to []).
--   2. edit_parecer learns the same, so editing can refresh the list.
-- The note shape stays compatible — only the field stops being empty.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.add_parecer(
  p_card_id uuid,
  p_text text,
  p_parent_id text DEFAULT NULL,
  p_decision kanban_decision_status DEFAULT NULL,
  p_mentions jsonb DEFAULT '[]'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_name text;
  v_role user_role;
  v_note_id text := gen_random_uuid()::text;
  v_parent jsonb;
  v_thread_id text;
  v_level int := 0;
  v_note jsonb;
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
    'id', v_note_id,
    'text', p_text,
    'mentions', coalesce(p_mentions, '[]'::jsonb),
    'author_id', v_uid::text,
    'author_name', v_name,
    'author_role', v_role::text,
    'created_at', to_jsonb(now()),
    'parent_id', to_jsonb(p_parent_id),
    'level', v_level,
    'thread_id', v_thread_id,
    'is_thread_starter', (p_parent_id IS NULL),
    'decision', to_jsonb(p_decision)
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

GRANT EXECUTE ON FUNCTION public.add_parecer(uuid, text, text, kanban_decision_status, jsonb) TO authenticated;

-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.edit_parecer(
  p_card_id uuid,
  p_note_id text,
  p_text text,
  p_decision kanban_decision_status DEFAULT NULL,
  p_mentions jsonb DEFAULT NULL  -- NULL = keep existing mentions untouched
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_name text;
  v_notes jsonb;
  v_new jsonb := '[]'::jsonb;
  v_node jsonb;
  v_patch jsonb;
  v_matched boolean := false;
BEGIN
  SELECT full_name INTO v_name FROM public.profiles WHERE id = v_uid;

  PERFORM 1 FROM public.kanban_cards WHERE id = p_card_id FOR UPDATE;
  SELECT coalesce(reanalysis_notes, '[]'::jsonb) INTO v_notes FROM public.kanban_cards WHERE id = p_card_id;

  FOR v_node IN SELECT jsonb_array_elements(v_notes) LOOP
    IF (v_node->>'id') = p_note_id THEN
      IF (v_node->>'author_id') <> v_uid::text THEN
        RAISE EXCEPTION 'not_author';
      END IF;
      v_patch := jsonb_build_object(
        'text', p_text,
        'updated_by_id', v_uid::text,
        'updated_by_name', v_name,
        'updated_at', to_jsonb(now()),
        'decision', to_jsonb(p_decision)
      );
      IF p_mentions IS NOT NULL THEN
        v_patch := v_patch || jsonb_build_object('mentions', p_mentions);
      END IF;
      v_node := v_node || v_patch;
      v_matched := true;
    END IF;
    v_new := v_new || jsonb_build_array(v_node);
  END LOOP;

  IF NOT v_matched THEN RAISE EXCEPTION 'note_not_found'; END IF;

  UPDATE public.kanban_cards SET reanalysis_notes = v_new, updated_at = now() WHERE id = p_card_id;

  IF p_decision IS NOT NULL THEN
    PERFORM public.set_card_decision(p_card_id, p_decision);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.edit_parecer(uuid, text, text, kanban_decision_status, jsonb) TO authenticated;
