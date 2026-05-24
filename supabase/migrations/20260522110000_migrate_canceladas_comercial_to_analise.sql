-- Move os 16 cards históricos de comercial/canceladas para analise/canceladas,
-- alinhando o estado passado com o novo comportamento do change_stage RPC.
-- Rollback: 20260522110001_migrate_canceladas_comercial_to_analise_rollback.sql

UPDATE public.kanban_cards
SET area       = 'analise',
    updated_at = now()
WHERE area  = 'comercial'
  AND stage = 'canceladas';
