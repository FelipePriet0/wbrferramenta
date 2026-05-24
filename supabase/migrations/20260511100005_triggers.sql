-- =========================================================================
-- 05. Triggers
-- =========================================================================

-- updated_at on every table with writes
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_generic();

CREATE TRIGGER trg_applicants_updated_at
  BEFORE UPDATE ON applicants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_generic();

CREATE TRIGGER trg_pf_fichas_updated_at
  BEFORE UPDATE ON pf_fichas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_generic();

CREATE TRIGGER trg_pj_fichas_updated_at
  BEFORE UPDATE ON pj_fichas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_generic();

CREATE TRIGGER trg_kanban_cards_updated_at
  BEFORE UPDATE ON kanban_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_generic();

CREATE TRIGGER trg_card_attachments_updated_at
  BEFORE UPDATE ON card_attachments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_generic();

CREATE TRIGGER trg_card_labels_updated_at
  BEFORE UPDATE ON card_labels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_generic();

-- soft-delete audit
CREATE TRIGGER trg_kanban_cards_log_deletion
  AFTER UPDATE OR DELETE ON kanban_cards
  FOR EACH ROW EXECUTE FUNCTION public.log_deletion_generic();

CREATE TRIGGER trg_card_attachments_log_deletion
  AFTER UPDATE OR DELETE ON card_attachments
  FOR EACH ROW EXECUTE FUNCTION public.log_deletion_generic();

CREATE TRIGGER trg_pf_fichas_log_deletion
  AFTER UPDATE OR DELETE ON pf_fichas
  FOR EACH ROW EXECUTE FUNCTION public.log_deletion_generic();

CREATE TRIGGER trg_pj_fichas_log_deletion
  AFTER UPDATE OR DELETE ON pj_fichas
  FOR EACH ROW EXECUTE FUNCTION public.log_deletion_generic();

-- specific triggers
CREATE TRIGGER trg_applicants_set_representante
  BEFORE INSERT ON applicants
  FOR EACH ROW EXECUTE FUNCTION public.set_representante_mz();

CREATE TRIGGER trg_card_attachments_set_author
  BEFORE INSERT ON card_attachments
  FOR EACH ROW EXECUTE FUNCTION public.trg_card_attachments_set_author();

CREATE TRIGGER trg_kanban_normalize_stage
  BEFORE INSERT OR UPDATE ON kanban_cards
  FOR EACH ROW EXECUTE FUNCTION public.trg_kanban_normalize();

-- auth.users → profiles sync
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_auth();
