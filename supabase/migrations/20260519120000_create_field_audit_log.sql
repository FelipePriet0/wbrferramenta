-- Tabela de histórico completo de alterações por campo.
-- ROLLBACK: supabase/migrations/20260519120001_create_field_audit_log_rollback.sql

CREATE TABLE public.field_audit_log (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  applicant_id  uuid        NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
  table_name    text        NOT NULL,
  field         text        NOT NULL,
  old_value     text,
  new_value     text,
  by_id         uuid,
  by_name       text,
  action        text        CHECK (action IN ('preenchido', 'atualizado', 'apagado')),
  at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fal_applicant_field ON public.field_audit_log (applicant_id, field);
CREATE INDEX idx_fal_applicant_at    ON public.field_audit_log (applicant_id, at DESC);

ALTER TABLE public.field_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "autenticados podem ler histórico"
  ON public.field_audit_log FOR SELECT
  TO authenticated
  USING (true);
