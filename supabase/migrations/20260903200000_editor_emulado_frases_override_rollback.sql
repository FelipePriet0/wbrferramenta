-- Rollback de 20260903200000_editor_emulado_frases_override.sql
--
-- ⚠️ DESTRUTIVO: derruba a tabela e com ela TODO o histórico de edições de texto
-- da O.S. Como o desenho é "default no código + override esparso", derrubar isto
-- não quebra o gerador — ele volta a servir o texto padrão do catálogo. Mas o que
-- a líder do suporte editou some. Se houver linhas, exporte antes:
--   COPY (SELECT * FROM public.os_frase_overrides ORDER BY criado_em) TO STDOUT CSV HEADER;

DROP VIEW IF EXISTS public.os_frase_vigente;

DROP POLICY IF EXISTS os_frase_overrides_insert ON public.os_frase_overrides;
DROP POLICY IF EXISTS os_frase_overrides_select ON public.os_frase_overrides;

DROP INDEX IF EXISTS public.os_frase_overrides_modelo_idx;
DROP INDEX IF EXISTS public.os_frase_overrides_vigente_idx;

DROP TABLE IF EXISTS public.os_frase_overrides;
