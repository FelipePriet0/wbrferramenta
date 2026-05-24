-- =========================================================================
-- 02. Tables (9 in public)
-- =========================================================================

-- 1) profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role user_role NOT NULL DEFAULT 'leitor',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) applicants
CREATE TABLE applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_type person_type NOT NULL,
  primary_name text NOT NULL,
  cpf_cnpj text,
  phone text,
  whatsapp text,
  email text,
  address_line text,
  address_number text,
  address_complement text,
  bairro text,
  cep text,
  plano_acesso text,
  venc smallint CHECK (venc IS NULL OR venc IN (5,10,15,20,25)),
  carne_impresso boolean,
  sva_avulso text,
  quem_solicitou text,
  telefone_solicitante text,
  protocolo_mk text,
  meio app_meio,
  info_spc text,
  info_pesquisador text,
  info_relevantes text,
  info_mk text,
  parecer_analise text,
  representante_mz uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) pf_fichas
CREATE TABLE pf_fichas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL UNIQUE REFERENCES applicants(id) ON DELETE CASCADE,
  -- Pessoais
  birth_date date,
  naturalidade text,
  uf_naturalidade text,
  idade smallint CHECK (idade IS NULL OR (idade BETWEEN 0 AND 130)),
  do_ps text,
  cond text,
  -- Endereco/moradia
  tempo_endereco text,
  tipo_moradia pf_tipo_moradia,
  tipo_moradia_obs text,
  endereco_do_ps text,
  unica_no_lote boolean,
  unica_no_lote_obs text,
  com_quem_reside text,
  nas_outras pf_nas_outras,
  tem_contrato boolean,
  enviou_contrato boolean,
  nome_de text,
  enviou_comprovante boolean,
  tipo_comprovante pf_tipo_comprovante,
  nome_comprovante text,
  nome_locador text,
  telefone_locador text,
  -- Internet atual
  tem_internet_fixa boolean,
  empresa_internet text,
  plano_internet text,
  valor_internet text,
  observacoes text,
  -- Profissional
  profissao text,
  empresa text,
  vinculo pf_vinculo,
  vinculo_obs text,
  emprego_do_ps text,
  -- Conjuge
  estado_civil pf_estado_civil,
  conjuge_obs text,
  conjuge_nome text,
  conjuge_telefone text,
  conjuge_whatsapp text,
  conjuge_cpf text,
  conjuge_naturalidade text,
  conjuge_uf text,
  conjuge_idade smallint CHECK (conjuge_idade IS NULL OR (conjuge_idade BETWEEN 0 AND 130)),
  conjuge_do_ps text,
  -- Pais
  pai_nome text,
  pai_reside text,
  pai_telefone text,
  mae_nome text,
  mae_reside text,
  mae_telefone text,
  -- Referencias
  ref1_nome text,
  ref1_parentesco text,
  ref1_reside text,
  ref1_telefone text,
  ref2_nome text,
  ref2_parentesco text,
  ref2_reside text,
  ref2_telefone text,
  -- Soft-delete
  deleted_at timestamptz,
  deleted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  deletion_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) pj_fichas
CREATE TABLE pj_fichas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL UNIQUE REFERENCES applicants(id) ON DELETE CASCADE,
  -- Empresa
  data_abertura date,
  nome_fantasia text,
  nome_fachada text,
  area_atuacao text,
  tipo_imovel pj_tipo_imovel,
  obs_tipo_imovel text,
  tempo_endereco text,
  tipo_estabelecimento pj_tipo_estabelecimento,
  obs_estabelecimento text,
  end_ps text,
  fones_ps text,
  -- Comprovacao
  enviou_comprovante boolean,
  tipo_comprovante pj_tipo_comprovante,
  nome_comprovante text,
  -- Internet atual
  possui_internet boolean,
  operadora_internet text,
  plano_internet text,
  valor_internet text,
  -- Documentacao
  contrato_social boolean,
  obs_contrato_social text,
  -- Socios (3)
  socio1_nome text,
  socio1_cpf text,
  socio1_telefone text,
  socio2_nome text,
  socio2_cpf text,
  socio2_telefone text,
  socio3_nome text,
  socio3_cpf text,
  socio3_telefone text,
  -- Soft-delete
  deleted_at timestamptz,
  deleted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  deletion_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5) kanban_cards
CREATE TABLE kanban_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES applicants(id) ON DELETE RESTRICT,
  person_type person_type NOT NULL,
  area kanban_area NOT NULL DEFAULT 'comercial',
  stage text NOT NULL DEFAULT 'entrada',
  assignee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  received_at timestamptz,
  due_at timestamptz,
  decision_at timestamptz,
  finalized_at timestamptz,
  archived_at timestamptz,
  cancelled_at timestamptz,
  hora_at text[],
  decision_status kanban_decision_status,
  decision_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  final_decision text,
  finalized_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  cancel_reason text,
  cancelled_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reanalysis_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  deletion_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6) card_attachments
CREATE TABLE card_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  note_id text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author_name text,
  author_role user_role,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  file_type text,
  file_extension text,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  deletion_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7) deletion_log
CREATE TABLE deletion_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  deleted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  record_snapshot jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8) card_labels
CREATE TABLE card_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9) card_label_assignments
CREATE TABLE card_label_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES card_labels(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (card_id, label_id)
);
