-- Rollback de 20261030120000_applicants_sva_avulso_multipla.sql.
-- Fichas que existiam antes voltam ao valor exato do snapshot; fichas novas
-- ficam com as opções unidas por ' + '.

ALTER TABLE public.applicants
  ALTER COLUMN sva_avulso TYPE text
  USING array_to_string(sva_avulso, ' + ');

UPDATE public.applicants a
   SET sva_avulso = b.sva_avulso
  FROM public.backup_sva_avulso_20261030 b
 WHERE b.id = a.id
   AND a.sva_avulso IS DISTINCT FROM b.sva_avulso
   AND (a.sva_avulso IS NULL OR position(' + ' in a.sva_avulso) = 0);
