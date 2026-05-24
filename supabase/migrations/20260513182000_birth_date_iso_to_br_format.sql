-- Converte pf_fichas.birth_date de ISO (YYYY-MM-DD) pra BR (DD/MM/YYYY).
--
-- Contexto: a coluna birth_date é text free-form (migration
-- 20260512132737_birth_date_text_free). O service de cadastro convertia
-- BR -> ISO antes de salvar, então o vendedor digitava "10/10/2004" mas
-- o banco guardava "2004-10-10" e a Expanded ficha mostrava o valor ISO,
-- atrapalhando o CTRL+C/V pro ERP. O service agora valida BR sem converter
-- (validateBrDate em src/services/cadastro.ts), e esta migration converte
-- os registros já gravados em ISO.
--
-- Regex estrita garante que linhas já em BR (ou outro formato) não são tocadas.

UPDATE public.pf_fichas
SET birth_date =
  substring(birth_date FROM 9 FOR 2) || '/' ||
  substring(birth_date FROM 6 FOR 2) || '/' ||
  substring(birth_date FROM 1 FOR 4)
WHERE birth_date ~ '^\d{4}-\d{2}-\d{2}$';
