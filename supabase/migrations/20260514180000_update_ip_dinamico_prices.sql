-- Atualiza os preços antigos de IP Dinâmico em applicants.plano_acesso pra
-- bater com a constante PLANO_OPTIONS atualizada no front. Só toca linhas
-- com igualdade EXATA ao valor antigo — outros formatos ficam intocados.
--
-- Mapping:
--   150 Mega + IP Dinâmico - R$ 74,90   →  R$ 80,00
--   300 Mega + IP Dinâmico - R$ 89,90   →  R$ 90,00
--   600 Mega + IP Dinâmico - R$ 94,90   →  R$ 100,00
--   1000 Mega (1Gb) + IP Dinâmico - R$ 114,90  →  R$ 120,00
--
-- Rollback granular (caso precise): UPDATE WHERE id IN (...) usando o snapshot
-- registrado na conversa de aplicação — evita afetar fichas novas cadastradas
-- pós-migration com valor coincidente.

UPDATE public.applicants SET plano_acesso = '150 Mega + IP Dinâmico - R$ 80,00'
  WHERE plano_acesso = '150 Mega + IP Dinâmico - R$ 74,90';

UPDATE public.applicants SET plano_acesso = '300 Mega + IP Dinâmico - R$ 90,00'
  WHERE plano_acesso = '300 Mega + IP Dinâmico - R$ 89,90';

UPDATE public.applicants SET plano_acesso = '600 Mega + IP Dinâmico - R$ 100,00'
  WHERE plano_acesso = '600 Mega + IP Dinâmico - R$ 94,90';

UPDATE public.applicants SET plano_acesso = '1000 Mega (1Gb) + IP Dinâmico - R$ 120,00'
  WHERE plano_acesso = '1000 Mega (1Gb) + IP Dinâmico - R$ 114,90';
