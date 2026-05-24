-- Mudança 3: novo textarea "Observações" abaixo de "Informações Relevantes do MK"
-- na Expanded PF e PJ. Coluna nullable, text livre — segue padrão dos demais
-- info_* (info_spc, info_pesquisador, info_relevantes, info_mk).

ALTER TABLE public.applicants
  ADD COLUMN observacoes text;
