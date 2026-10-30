-- SVA Avulso passa a aceitar várias opções (ex.: IP Público + Premiere).
-- Pedido da Stéfane (WBRNET) em 29/10/2026. Precedente: kanban_cards.hora_at text[].
-- 'XXXXX' era o "sem SVA" do select de escolha única e vira NULL.
-- Snapshot para rollback exato: backup_sva_avulso_20261030 (ver _rollback).

SET lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS public.backup_sva_avulso_20261030 AS
  SELECT id, sva_avulso FROM public.applicants;

ALTER TABLE public.backup_sva_avulso_20261030 ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.applicants
  ALTER COLUMN sva_avulso TYPE text[]
  USING CASE
    WHEN coalesce(trim(sva_avulso), '') IN ('', 'XXXXX') THEN NULL
    ELSE ARRAY[sva_avulso]
  END;
