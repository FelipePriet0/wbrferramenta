-- Rollback: dashboard_kanban_counts — reverte para assinatura original sem filtro de período

DROP FUNCTION IF EXISTS public.dashboard_kanban_counts(kanban_area, timestamptz, timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.dashboard_kanban_counts(
  p_area kanban_area,
  p_now  timestamptz DEFAULT now()
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
    GROUP BY lower(stage)
  ) s;
$$;

GRANT EXECUTE ON FUNCTION public.dashboard_kanban_counts(kanban_area, timestamptz) TO authenticated;
