-- =========================================================================
-- 06. Indexes — only those backed by a query
-- =========================================================================

-- applicants
CREATE INDEX idx_applicants_cpf_cnpj           ON applicants (cpf_cnpj);
CREATE INDEX idx_applicants_name_trgm          ON applicants USING GIN (public.f_unaccent(primary_name) extensions.gin_trgm_ops);
CREATE INDEX idx_applicants_representante      ON applicants (representante_mz);

-- pf_fichas / pj_fichas (FKs queried)
CREATE INDEX idx_pf_fichas_deleted_by          ON pf_fichas (deleted_by);
CREATE INDEX idx_pj_fichas_deleted_by          ON pj_fichas (deleted_by);

-- kanban_cards
CREATE INDEX idx_kanban_cards_area_stage       ON kanban_cards (area, lower(stage));
CREATE INDEX idx_kanban_cards_assignee         ON kanban_cards (assignee_id);
CREATE INDEX idx_kanban_cards_applicant        ON kanban_cards (applicant_id);
CREATE INDEX idx_kanban_cards_created_by       ON kanban_cards (created_by);
CREATE INDEX idx_kanban_cards_decision         ON kanban_cards (decision_status);
CREATE INDEX idx_kanban_cards_decision_at      ON kanban_cards (decision_at);
CREATE INDEX idx_kanban_cards_finalized_at     ON kanban_cards (finalized_at);
CREATE INDEX idx_kanban_cards_alive            ON kanban_cards (area, lower(stage))
  WHERE deleted_at IS NULL AND archived_at IS NULL;
CREATE INDEX idx_kanban_cards_hora_at          ON kanban_cards USING GIN (hora_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_kanban_cards_reanalysis_notes ON kanban_cards USING GIN (reanalysis_notes jsonb_path_ops);
CREATE INDEX idx_kanban_cards_decision_by      ON kanban_cards (decision_by);
CREATE INDEX idx_kanban_cards_finalized_by     ON kanban_cards (finalized_by);
CREATE INDEX idx_kanban_cards_cancelled_by     ON kanban_cards (cancelled_by);
CREATE INDEX idx_kanban_cards_deleted_by       ON kanban_cards (deleted_by);

-- card_attachments
CREATE INDEX idx_card_attachments_card_note    ON card_attachments (card_id, note_id);
CREATE INDEX idx_card_attachments_author       ON card_attachments (author_id);
CREATE INDEX idx_card_attachments_applicant    ON card_attachments (applicant_id);
CREATE INDEX idx_card_attachments_deleted_by   ON card_attachments (deleted_by);

-- card_labels / assignments
CREATE INDEX idx_card_labels_active            ON card_labels (active) WHERE deleted_at IS NULL;
CREATE INDEX idx_card_labels_created_by        ON card_labels (created_by);
CREATE INDEX idx_card_labels_deleted_by        ON card_labels (deleted_by);
CREATE INDEX idx_cla_card                      ON card_label_assignments (card_id);
CREATE INDEX idx_cla_label                     ON card_label_assignments (label_id);
CREATE INDEX idx_cla_assigned_by               ON card_label_assignments (assigned_by);

-- deletion_log
CREATE INDEX idx_deletion_log_table_record     ON deletion_log (table_name, record_id);
CREATE INDEX idx_deletion_log_deleted_by       ON deletion_log (deleted_by);
