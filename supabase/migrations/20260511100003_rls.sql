-- =========================================================================
-- 03. Row Level Security
-- All policies use (SELECT auth.uid()) to avoid auth_rls_initplan.
-- One permissive policy per (table, command) to avoid multiple_permissive_policies.
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_fichas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pj_fichas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards           ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_attachments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_labels            ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_label_assignments ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- user_has_role anchor function (SECURITY DEFINER, single overload)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.user_has_role(p_roles user_role[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = ANY(p_roles)
  );
$$;

GRANT EXECUTE ON FUNCTION public.user_has_role(user_role[]) TO authenticated, anon, service_role;

-- =========================================================================
-- profiles
-- =========================================================================
CREATE POLICY profiles_select ON profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY profiles_insert_self ON profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY profiles_update_self ON profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id AND role <> 'leitor')
  WITH CHECK ((SELECT auth.uid()) = id);

-- service_role can manage all profiles (Supabase auth admin)
CREATE POLICY profiles_service_role_all ON profiles
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =========================================================================
-- applicants
-- =========================================================================
CREATE POLICY applicants_select ON applicants
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY applicants_insert ON applicants
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

CREATE POLICY applicants_update ON applicants
  FOR UPDATE TO authenticated
  USING (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

CREATE POLICY applicants_no_delete ON applicants
  FOR DELETE TO authenticated
  USING (false);

-- =========================================================================
-- pf_fichas
-- =========================================================================
CREATE POLICY pf_fichas_select ON pf_fichas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY pf_fichas_insert ON pf_fichas
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

CREATE POLICY pf_fichas_update ON pf_fichas
  FOR UPDATE TO authenticated
  USING (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

CREATE POLICY pf_fichas_no_delete ON pf_fichas
  FOR DELETE TO authenticated USING (false);

-- =========================================================================
-- pj_fichas
-- =========================================================================
CREATE POLICY pj_fichas_select ON pj_fichas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY pj_fichas_insert ON pj_fichas
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

CREATE POLICY pj_fichas_update ON pj_fichas
  FOR UPDATE TO authenticated
  USING (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

CREATE POLICY pj_fichas_no_delete ON pj_fichas
  FOR DELETE TO authenticated USING (false);

-- =========================================================================
-- kanban_cards
-- =========================================================================
CREATE POLICY kanban_cards_select ON kanban_cards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY kanban_cards_insert ON kanban_cards
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

-- Single permissive UPDATE policy; never on stage 'entrada'
CREATE POLICY kanban_cards_update ON kanban_cards
  FOR UPDATE TO authenticated
  USING (
    public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[])
    AND lower(stage) <> 'entrada'
  )
  WITH CHECK (
    public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[])
  );

CREATE POLICY kanban_cards_no_delete ON kanban_cards
  FOR DELETE TO authenticated USING (false);

-- =========================================================================
-- card_attachments
-- =========================================================================
CREATE POLICY card_attachments_select ON card_attachments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY card_attachments_insert ON card_attachments
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

CREATE POLICY card_attachments_update ON card_attachments
  FOR UPDATE TO authenticated
  USING (
    (author_id = (SELECT auth.uid()))
    OR public.user_has_role(ARRAY['gestor','instalador']::user_role[])
  )
  WITH CHECK (
    (author_id = (SELECT auth.uid()))
    OR public.user_has_role(ARRAY['gestor','instalador']::user_role[])
  );

CREATE POLICY card_attachments_delete ON card_attachments
  FOR DELETE TO authenticated
  USING (
    (author_id = (SELECT auth.uid()))
    OR public.user_has_role(ARRAY['gestor','instalador']::user_role[])
  );

-- =========================================================================
-- deletion_log
-- =========================================================================
CREATE POLICY deletion_log_select ON deletion_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY deletion_log_insert ON deletion_log
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['analista','gestor','instalador']::user_role[]));

-- =========================================================================
-- card_labels (CRUD = gestor only)
-- =========================================================================
CREATE POLICY card_labels_select ON card_labels
  FOR SELECT TO authenticated USING (true);

CREATE POLICY card_labels_insert ON card_labels
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['gestor']::user_role[]));

CREATE POLICY card_labels_update ON card_labels
  FOR UPDATE TO authenticated
  USING (public.user_has_role(ARRAY['gestor']::user_role[]))
  WITH CHECK (public.user_has_role(ARRAY['gestor']::user_role[]));

-- soft-delete via UPDATE; no hard DELETE allowed
CREATE POLICY card_labels_no_delete ON card_labels
  FOR DELETE TO authenticated USING (false);

-- =========================================================================
-- card_label_assignments
-- =========================================================================
CREATE POLICY cla_select ON card_label_assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY cla_insert ON card_label_assignments
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

CREATE POLICY cla_delete ON card_label_assignments
  FOR DELETE TO authenticated
  USING (public.user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));
