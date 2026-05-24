-- =========================================================================
-- 01. Extensions + Enums
-- =========================================================================

-- Extensions in dedicated schema
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;
-- pgcrypto, uuid-ossp, plpgsql, supabase_vault, pg_stat_statements already installed

-- Core enums
CREATE TYPE person_type AS ENUM ('PF', 'PJ');
CREATE TYPE kanban_area AS ENUM ('comercial', 'analise');
CREATE TYPE kanban_decision_status AS ENUM ('aprovado', 'negado', 'reanalise');
CREATE TYPE user_role AS ENUM ('vendedor', 'analista', 'gestor', 'instalador', 'leitor');
CREATE TYPE app_meio AS ENUM ('ligacao', 'whatsapp', 'presencial', 'whats_uber');

-- PF enums
CREATE TYPE pf_tipo_moradia AS ENUM ('propria', 'alugada', 'cedida', 'outros');
CREATE TYPE pf_nas_outras AS ENUM ('parentes', 'locador', 'so_conhecidos', 'nao_conhece');
CREATE TYPE pf_tipo_comprovante AS ENUM ('energia', 'agua', 'internet', 'outro');
CREATE TYPE pf_vinculo AS ENUM ('carteira_assinada', 'presta_servicos', 'contrato_trabalho', 'autonomo', 'concursado', 'outro');
CREATE TYPE pf_estado_civil AS ENUM ('solteiro', 'casado', 'amasiado', 'separado', 'viuvo');

-- PJ enums
CREATE TYPE pj_tipo_imovel AS ENUM ('comercio_terreo', 'comercio_sala', 'casa');
CREATE TYPE pj_tipo_estabelecimento AS ENUM ('propria', 'alugada', 'cedida', 'outros');
CREATE TYPE pj_tipo_comprovante AS ENUM ('energia', 'agua', 'internet', 'outro');
