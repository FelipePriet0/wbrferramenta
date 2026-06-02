-- Tabela rural_fichas (1:1 com applicants, tipo 'Rural'), espelhando pf_fichas com:
--   • campos renomeados (fazenda/localizacao/end_urbano/pertence_a/proprietario_patrao/tel_proprietario/obs_moradia)
--   • campos removidos (cond, comprovante×3, locador×2, contrato bools)
--   • campos novos (admissao)
-- Enums: reusa pf_vinculo/pf_estado_civil (idênticos); cria rural_tipo_moradia/rural_nas_outras (valores extras).
-- Também adiciona colunas taxa_instalacao/via em applicants (linha SVA / Solicitante do Rural).
-- Tudo aditivo. Único toque em objeto PROD existente: ADD COLUMN nullable em applicants (metadado, sem rewrite).

-- 1. Enums dedicados do Rural (isolados de PF/PJ)
CREATE TYPE public.rural_tipo_moradia AS ENUM ('propria', 'alugada', 'cedida', 'outros', 'arrendada');
CREATE TYPE public.rural_nas_outras  AS ENUM ('parentes', 'locador', 'so_conhecidos', 'nao_conhece', 'proprietario_local', 'demais_funcionarios');

-- 2. Tabela
CREATE TABLE public.rural_fichas (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id          uuid NOT NULL UNIQUE REFERENCES public.applicants(id) ON DELETE CASCADE,

  -- Pessoais
  birth_date            text,
  naturalidade          text,
  uf_naturalidade       text,
  idade                 smallint,
  do_ps                 text,

  -- Endereço rural (renomeados / novos)
  fazenda               text,   -- FAZENDA / SÍTIO / CHÁCARA
  localizacao           text,   -- LOCALIZAÇÃO
  end_urbano            text,   -- END. URBANO

  -- Moradia
  pertence_a            text,                       -- PERTENCE A (era tempo_endereco)
  tipo_moradia          public.rural_tipo_moradia,
  tipo_moradia_obs      text,
  endereco_do_ps        text,
  unica_no_lote         boolean,
  unica_no_lote_obs     text,
  com_quem_reside       text,
  nas_outras            public.rural_nas_outras,
  proprietario_patrao   text,                       -- PROPRIETÁRIO/PATRÃO (era tem_contrato bool)
  tel_proprietario      text,                       -- TEL (era enviou_contrato bool)
  obs_moradia           text,                       -- OBS (era nome_de)

  -- Internet
  tem_internet_fixa     boolean,
  empresa_internet      text,
  plano_internet        text,
  valor_internet        text,
  observacoes           text,

  -- Profissão / Renda
  profissao             text,
  empresa               text,
  vinculo               public.pf_vinculo,          -- reuso (valores idênticos a PF)
  admissao              text,                        -- NOVO (linha VÍNCULO | ADMISSÃO | OBS)
  vinculo_obs           text,
  emprego_do_ps         text,

  -- Cônjuge
  estado_civil          public.pf_estado_civil,     -- reuso
  conjuge_obs           text,
  conjuge_nome          text,
  conjuge_telefone      text,
  conjuge_whatsapp      text,
  conjuge_cpf           text,
  conjuge_naturalidade  text,
  conjuge_uf            text,
  conjuge_idade         smallint,
  conjuge_do_ps         text,

  -- Filiação
  pai_nome              text,
  pai_reside            text,
  pai_telefone          text,
  mae_nome              text,
  mae_reside            text,
  mae_telefone          text,

  -- Referências pessoais
  ref1_nome             text,
  ref1_parentesco       text,
  ref1_reside           text,
  ref1_telefone         text,
  ref2_nome             text,
  ref2_parentesco       text,
  ref2_reside           text,
  ref2_telefone         text,

  -- Soft-delete
  deleted_at            timestamptz,
  deleted_by            uuid,
  deletion_reason       text,

  -- Audit
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- 3. RLS (espelha pf_fichas)
ALTER TABLE public.rural_fichas ENABLE ROW LEVEL SECURITY;

CREATE POLICY rural_fichas_select ON public.rural_fichas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY rural_fichas_insert ON public.rural_fichas
  FOR INSERT TO authenticated
  WITH CHECK (user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

CREATE POLICY rural_fichas_update ON public.rural_fichas
  FOR UPDATE TO authenticated
  USING (user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]))
  WITH CHECK (user_has_role(ARRAY['vendedor','analista','gestor','instalador']::user_role[]));

CREATE POLICY rural_fichas_no_delete ON public.rural_fichas
  FOR DELETE TO authenticated USING (false);

-- 4. Triggers genéricos (mesmas funções usadas por pf_fichas)
CREATE TRIGGER trg_rural_fichas_updated_at
  BEFORE UPDATE ON public.rural_fichas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_generic();

CREATE TRIGGER trg_rural_fichas_log_deletion
  AFTER DELETE OR UPDATE ON public.rural_fichas
  FOR EACH ROW EXECUTE FUNCTION log_deletion_generic();

-- 5. Índice (espelha idx_pf_fichas_deleted_by)
CREATE INDEX idx_rural_fichas_deleted_by ON public.rural_fichas (deleted_by);

-- 6. Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rural_fichas;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 7. Colunas novas em applicants (linha SVA Avulso + linha Solicitante do Rural)
ALTER TABLE public.applicants
  ADD COLUMN IF NOT EXISTS taxa_instalacao text,
  ADD COLUMN IF NOT EXISTS via             text;
