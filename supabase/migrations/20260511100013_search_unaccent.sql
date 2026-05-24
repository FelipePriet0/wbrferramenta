-- =========================================================================
-- 13. Accent-insensitive search on applicants.primary_name.
--
-- "Joao" should find "João". Implementation: a STORED generated column
-- with lower(unaccent(primary_name)) + a GIN trigram index on it.
-- The kanban service normalises the search term on the client and
-- ILIKEs against this normalised column directly via PostgREST.
--
-- Postgres treats unaccent() as STABLE by default — generated columns
-- require IMMUTABLE expressions. We declare a thin wrapper marked
-- IMMUTABLE ourselves; the unaccent dictionary doesn't change at runtime
-- in our setup, so this is safe.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.immutable_unaccent(t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
AS $$
  SELECT extensions.unaccent('extensions.unaccent', t)
$$;

GRANT EXECUTE ON FUNCTION public.immutable_unaccent(text) TO authenticated, anon, service_role;

ALTER TABLE public.applicants
  ADD COLUMN IF NOT EXISTS primary_name_norm text
    GENERATED ALWAYS AS (
      lower(public.immutable_unaccent(primary_name))
    ) STORED;

-- Move the trigram index onto the normalised column.
DROP INDEX IF EXISTS public.idx_applicants_name_trgm;
CREATE INDEX idx_applicants_name_trgm
  ON public.applicants
  USING GIN (primary_name_norm extensions.gin_trgm_ops);
