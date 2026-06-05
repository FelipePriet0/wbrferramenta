-- Rollback de 20260605200000_como_conheceu_options_e_applicants_fk.sql

ALTER TABLE public.applicants
  DROP COLUMN IF EXISTS como_conheceu_id;

-- As policies caem junto com a tabela.
DROP TABLE IF EXISTS public.como_conheceu_options;
