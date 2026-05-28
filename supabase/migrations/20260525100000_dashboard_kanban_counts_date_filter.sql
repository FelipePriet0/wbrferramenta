-- Migration: dashboard_kanban_counts — adiciona filtro opcional de período (p_start / p_end)
--
-- Motivação: o dashboard passou a expor filtro global de período que deve afetar
-- todos os componentes, incluindo os KPI cards. A RPC precisa receber p_start e
-- p_end opcionais e filtrar por created_at quando fornecidos.
--
-- Sem datas → comportamento anterior (conta tudo).
-- Com datas  → conta apenas cards criados dentro do intervalo.
--
-- ATENÇÃO: CREATE OR REPLACE não pode adicionar parâmetros a uma função existente
-- no PostgreSQL — assinaturas diferentes = overloads diferentes. Por isso fazemos
-- DROP da assinatura antiga antes de criar a nova, evitando ambiguidade no PostgREST.

DROP FUNCTION IF EXISTS public.dashboard_kanban_counts(kanban_area, timestamptz);

CREATE OR REPLACE FUNCTION public.dashboard_kanban_counts(
  p_area  kanban_area,
  p_now   timestamptz DEFAULT now(),
  p_start timestamptz DEFAULT NULL,
  p_end   timestamptz DEFAULT NULL
) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT jsonb_object_agg(stage, n)
  FROM (
    SELECT lower(stage) AS stage, count(*)::int AS n
    FROM public.kanban_cards
    WHERE area = p_area
      AND deleted_at  IS NULL
      AND archived_at IS NULL
      AND (p_start IS NULL OR created_at >= p_start)
      AND (p_end   IS NULL OR created_at <= p_end)
    GROUP BY lower(stage)
  ) s;
$$;

GRANT EXECUTE ON FUNCTION public.dashboard_kanban_counts(kanban_area, timestamptz, timestamptz, timestamptz) TO authenticated;
