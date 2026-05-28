-- Remove a sobrecarga de 2 parâmetros de set_card_decision.
-- A versão de 3 parâmetros (p_revert_reason text DEFAULT NULL) cobre chamadas
-- com 2 ou 3 args. Ter as duas causava erro "is not unique" quando add_parecer
-- chamava set_card_decision(uuid, kanban_decision_status) internamente.
-- Rollback: 20260528110001_drop_set_card_decision_2param_rollback.sql
DROP FUNCTION IF EXISTS public.set_card_decision(uuid, kanban_decision_status);
