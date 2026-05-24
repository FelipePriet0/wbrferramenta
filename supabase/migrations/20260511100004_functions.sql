-- =========================================================================
-- 04. Functions (helpers + RPCs)
-- All functions: SET search_path = public, extensions
-- =========================================================================

-- -------------------------------------------------------------------------
-- Helpers
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_installer()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT public.user_has_role(ARRAY['instalador']::user_role[]);
$$;

CREATE OR REPLACE FUNCTION public.f_unaccent(t text)
RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = public, extensions
AS $$
  SELECT extensions.unaccent('extensions.unaccent', t);
$$;

CREATE OR REPLACE FUNCTION public.norm_text(t text)
RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = public, extensions
AS $$
  SELECT lower(public.f_unaccent(coalesce(t, '')));
$$;

CREATE OR REPLACE FUNCTION public.normalize_user_role(src text)
RETURNS user_role
LANGUAGE sql IMMUTABLE
SET search_path = public, extensions
AS $$
  SELECT CASE lower(coalesce(src, ''))
    WHEN 'vendedor'   THEN 'vendedor'::user_role
    WHEN 'analista'   THEN 'analista'::user_role
    WHEN 'gestor'     THEN 'gestor'::user_role
    WHEN 'instalador' THEN 'instalador'::user_role
    WHEN 'leitor'     THEN 'leitor'::user_role
    ELSE 'leitor'::user_role
  END;
$$;

-- can_user_manage_card: analista/gestor/instalador can decide; others NO
CREATE OR REPLACE FUNCTION public.can_user_manage_card(p_card_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT public.user_has_role(ARRAY['analista','gestor','instalador']::user_role[])
    AND EXISTS (SELECT 1 FROM public.kanban_cards WHERE id = p_card_id);
$$;

-- -------------------------------------------------------------------------
-- Generic trigger functions
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at_generic()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_deletion_generic()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_reason text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.deleted_at IS NOT NULL AND (OLD.deleted_at IS NULL OR OLD.deleted_at <> NEW.deleted_at) THEN
      BEGIN v_reason := NEW.deletion_reason; EXCEPTION WHEN undefined_column THEN v_reason := NULL; END;
      INSERT INTO public.deletion_log (table_name, record_id, deleted_by, record_snapshot, reason)
      VALUES (TG_TABLE_NAME, NEW.id, v_uid, to_jsonb(NEW), v_reason);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    BEGIN v_reason := OLD.deletion_reason; EXCEPTION WHEN undefined_column THEN v_reason := NULL; END;
    INSERT INTO public.deletion_log (table_name, record_id, deleted_by, record_snapshot, reason)
    VALUES (TG_TABLE_NAME, OLD.id, v_uid, to_jsonb(OLD), v_reason);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_representante_mz()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
BEGIN
  IF NEW.representante_mz IS NULL AND v_uid IS NOT NULL THEN
    NEW.representante_mz := v_uid;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_card_attachments_set_author()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
BEGIN
  IF NEW.author_id IS NULL THEN NEW.author_id := v_uid; END IF;
  IF NEW.author_name IS NULL OR NEW.author_role IS NULL THEN
    SELECT full_name, role INTO NEW.author_name, NEW.author_role
    FROM public.profiles WHERE id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_kanban_normalize()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  NEW.stage := lower(coalesce(NEW.stage, 'entrada'));
  RETURN NEW;
END;
$$;

-- -------------------------------------------------------------------------
-- Auth → profiles sync
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.email),
    public.normalize_user_role(NEW.raw_user_meta_data->>'role')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_from_auth()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.profiles
  SET full_name = coalesce(NEW.raw_user_meta_data->>'full_name', full_name),
      updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- =========================================================================
-- RPCs
-- =========================================================================

-- -------------------------------------------------------------------------
-- criar_ficha_pf_atomic
-- -------------------------------------------------------------------------
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
  VALUES (v_app_id, 'PF', 'comercial', 'entrada', p_user_id)
  RETURNING id INTO v_card_id;

  RETURN jsonb_build_object('applicant_id', v_app_id, 'ficha_id', v_ficha_id, 'card_id', v_card_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_ficha_pf_atomic(uuid, text, text, text, text, text, date, text, text) TO authenticated;

-- -------------------------------------------------------------------------
-- criar_ficha_pj_atomic
-- -------------------------------------------------------------------------
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
  VALUES (v_app_id, 'PJ', 'comercial', 'entrada', p_user_id)
  RETURNING id INTO v_card_id;

  RETURN jsonb_build_object('applicant_id', v_app_id, 'ficha_id', v_ficha_id, 'card_id', v_card_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_ficha_pj_atomic(uuid, text, text, text, text, text, text) TO authenticated;

-- -------------------------------------------------------------------------
-- change_stage: move card with rules
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.change_stage(
  p_card_id uuid,
  p_area kanban_area,
  p_stage text,
  p_reason text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
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

  -- entrada is write-only (only set by criar_ficha_*_atomic)
  IF v_new_stage = 'entrada' AND v_old_stage <> 'entrada' THEN
    RAISE EXCEPTION 'invalid_stage';
  END IF;

  -- vendedor cannot move to/from entrada
  IF public.user_has_role(ARRAY['vendedor']::user_role[])
     AND (v_new_stage = 'entrada' OR v_old_stage = 'entrada') THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  -- cancellation requires reason
  IF v_new_stage = 'canceladas' THEN
    IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
      RAISE EXCEPTION 'reason_required';
    END IF;
    UPDATE public.kanban_cards
    SET area = 'analise',
        stage = 'canceladas',
        cancel_reason = p_reason,
        cancelled_at = now(),
        cancelled_by = v_uid,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  -- promotion: comercial/concluidas → analise/recebidos
  IF p_area = 'comercial' AND v_new_stage = 'concluidas' THEN
    UPDATE public.kanban_cards
    SET area = 'analise',
        stage = 'recebidos',
        received_at = COALESCE(received_at, now()),
        assignee_id = NULL,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  -- ingress: recebidos → preenchidas (assign current user)
  IF p_area = 'analise' AND v_new_stage = 'preenchidas' AND v_old_stage = 'recebidos' THEN
    IF NOT public.user_has_role(ARRAY['analista','gestor']::user_role[]) THEN
      RAISE EXCEPTION 'not_allowed';
    END IF;
    UPDATE public.kanban_cards
    SET area = 'analise',
        stage = 'preenchidas',
        assignee_id = v_uid,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  -- finalization
  IF v_new_stage = 'finalizados' THEN
    UPDATE public.kanban_cards
    SET area = p_area,
        stage = 'finalizados',
        final_decision = v_old_stage,
        finalized_at = now(),
        finalized_by = v_uid,
        updated_at = now()
    WHERE id = p_card_id;
    RETURN;
  END IF;

  -- fallback: simple move
  UPDATE public.kanban_cards
  SET area = p_area, stage = v_new_stage, updated_at = now()
  WHERE id = p_card_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.change_stage(uuid, kanban_area, text, text) TO authenticated;

-- -------------------------------------------------------------------------
-- set_card_decision
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_card_decision(
  p_card_id uuid,
  p_decision kanban_decision_status
) RETURNS void
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
  SET area = 'analise',
      stage = v_target_stage,
      decision_status = p_decision,
      decision_at = now(),
      decision_by = v_uid,
      updated_at = now()
  WHERE id = p_card_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_card_decision(uuid, kanban_decision_status) TO authenticated;

-- -------------------------------------------------------------------------
-- soft_delete_card
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
  SET deleted_at = now(),
      deleted_by = v_uid,
      deletion_reason = p_reason,
      updated_at = now()
  WHERE id = p_card_id AND deleted_at IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.soft_delete_card(uuid, text) TO authenticated;

-- -------------------------------------------------------------------------
-- restore_card: bring back from histórico
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.restore_card(
  p_card_id uuid,
  p_area kanban_area,
  p_stage text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_target text := lower(coalesce(p_stage, ''));
BEGIN
  IF NOT public.user_has_role(ARRAY['analista','gestor']::user_role[]) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  PERFORM 1 FROM public.kanban_cards WHERE id = p_card_id FOR UPDATE;

  UPDATE public.kanban_cards
  SET area = p_area,
      stage = v_target,
      archived_at = NULL,
      finalized_at = NULL,
      finalized_by = NULL,
      final_decision = NULL,
      cancelled_at = CASE WHEN v_target = 'canceladas' THEN cancelled_at ELSE NULL END,
      updated_at = now()
  WHERE id = p_card_id;

  INSERT INTO public.deletion_log (table_name, record_id, deleted_by, record_snapshot, reason)
  VALUES ('kanban_cards_restore', p_card_id, v_uid,
          jsonb_build_object('area', p_area, 'stage', v_target),
          'restore_card');
END;
$$;

GRANT EXECUTE ON FUNCTION public.restore_card(uuid, kanban_area, text) TO authenticated;

-- -------------------------------------------------------------------------
-- dashboard_kanban_counts
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.dashboard_kanban_counts(
  p_area kanban_area,
  p_now timestamptz DEFAULT now()
) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT jsonb_object_agg(stage, n)
  FROM (
    SELECT lower(stage) AS stage, count(*)::int AS n
    FROM public.kanban_cards
    WHERE area = p_area
      AND deleted_at IS NULL
      AND archived_at IS NULL
    GROUP BY lower(stage)
  ) s;
$$;

GRANT EXECUTE ON FUNCTION public.dashboard_kanban_counts(kanban_area, timestamptz) TO authenticated;

-- -------------------------------------------------------------------------
-- Parecer RPCs: add / edit / delete
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_parecer(
  p_card_id uuid,
  p_text text,
  p_parent_id text DEFAULT NULL,
  p_decision kanban_decision_status DEFAULT NULL
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
    'mentions', '[]'::jsonb,
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

GRANT EXECUTE ON FUNCTION public.add_parecer(uuid, text, text, kanban_decision_status) TO authenticated;

CREATE OR REPLACE FUNCTION public.edit_parecer(
  p_card_id uuid,
  p_note_id text,
  p_text text,
  p_decision kanban_decision_status DEFAULT NULL
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
      v_node := v_node
        || jsonb_build_object('text', p_text,
                              'updated_by_id', v_uid::text,
                              'updated_by_name', v_name,
                              'updated_at', to_jsonb(now()),
                              'decision', to_jsonb(p_decision));
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

GRANT EXECUTE ON FUNCTION public.edit_parecer(uuid, text, text, kanban_decision_status) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_parecer(p_card_id uuid, p_note_id text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_notes jsonb;
  v_new jsonb := '[]'::jsonb;
  v_node jsonb;
BEGIN
  PERFORM 1 FROM public.kanban_cards WHERE id = p_card_id FOR UPDATE;
  SELECT coalesce(reanalysis_notes, '[]'::jsonb) INTO v_notes FROM public.kanban_cards WHERE id = p_card_id;

  FOR v_node IN SELECT jsonb_array_elements(v_notes) LOOP
    IF (v_node->>'id') = p_note_id THEN
      IF (v_node->>'author_id') <> v_uid::text THEN
        RAISE EXCEPTION 'not_author';
      END IF;
      v_node := v_node || jsonb_build_object('deleted', true);
    END IF;
    v_new := v_new || jsonb_build_array(v_node);
  END LOOP;

  UPDATE public.kanban_cards SET reanalysis_notes = v_new, updated_at = now() WHERE id = p_card_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_parecer(uuid, text) TO authenticated;

-- -------------------------------------------------------------------------
-- list_my_mention_cards
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_my_mention_cards()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT DISTINCT c.id
  FROM public.kanban_cards c,
       jsonb_array_elements(coalesce(c.reanalysis_notes, '[]'::jsonb)) p,
       jsonb_array_elements(coalesce(p->'mentions', '[]'::jsonb)) m
  WHERE m->>'id' = (SELECT auth.uid())::text
    AND coalesce((p->>'deleted')::bool, false) = false
    AND c.deleted_at IS NULL
    AND c.archived_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.list_my_mention_cards() TO authenticated;

-- -------------------------------------------------------------------------
-- Histórico RPCs
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_historico(
  p_search text DEFAULT NULL,
  p_date_start timestamptz DEFAULT NULL,
  p_date_end timestamptz DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_responsavel uuid DEFAULT NULL
) RETURNS TABLE (
  id uuid,
  applicant_id uuid,
  applicant_name text,
  cpf_cnpj text,
  final_decision text,
  finalized_at timestamptz,
  archived_at timestamptz,
  vendedor_id uuid,
  vendedor_name text,
  analista_id uuid,
  analista_name text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT
    c.id,
    a.id           AS applicant_id,
    a.primary_name AS applicant_name,
    a.cpf_cnpj,
    c.final_decision,
    c.finalized_at,
    c.archived_at,
    v.id           AS vendedor_id,
    v.full_name    AS vendedor_name,
    n.id           AS analista_id,
    n.full_name    AS analista_name
  FROM public.kanban_cards c
  JOIN public.applicants a ON a.id = c.applicant_id
  LEFT JOIN public.profiles v ON v.id = c.created_by
  LEFT JOIN public.profiles n ON n.id = c.assignee_id
  WHERE c.area = 'analise'
    AND lower(c.stage) = 'finalizados'
    AND c.archived_at IS NOT NULL
    AND c.deleted_at IS NULL
    AND (p_search IS NULL
         OR public.norm_text(a.primary_name) LIKE '%' || public.norm_text(p_search) || '%'
         OR a.cpf_cnpj ILIKE '%' || p_search || '%')
    AND (p_date_start IS NULL OR c.finalized_at >= p_date_start)
    AND (p_date_end   IS NULL OR c.finalized_at <= p_date_end)
    AND (p_status IS NULL OR p_status = '' OR lower(p_status) = lower(coalesce(c.final_decision, '')))
    AND (p_responsavel IS NULL OR c.created_by = p_responsavel OR c.assignee_id = p_responsavel)
  ORDER BY c.finalized_at DESC NULLS LAST, c.id;
$$;

GRANT EXECUTE ON FUNCTION public.list_historico(text, timestamptz, timestamptz, text, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_historico_details(p_card_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT jsonb_build_object(
    'card', to_jsonb(c),
    'applicant', to_jsonb(a),
    'pf_ficha', to_jsonb(pf),
    'pj_ficha', to_jsonb(pj),
    'pareceres', c.reanalysis_notes
  )
  FROM public.kanban_cards c
  JOIN public.applicants a ON a.id = c.applicant_id
  LEFT JOIN public.pf_fichas pf ON pf.applicant_id = a.id
  LEFT JOIN public.pj_fichas pj ON pj.applicant_id = a.id
  WHERE c.id = p_card_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_historico_details(uuid) TO authenticated;
