-- Adiciona person_type ao resultado de list_historico.
-- Necessário para o Eye do histórico rotear para /ficha/pf/ ou /ficha/pj/.
-- Rollback: 20260527120001_list_historico_add_person_type_rollback.sql

DROP FUNCTION IF EXISTS public.list_historico(text, timestamptz, timestamptz, text, uuid);

CREATE FUNCTION public.list_historico(
  p_search text DEFAULT NULL,
  p_date_start timestamptz DEFAULT NULL,
  p_date_end timestamptz DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_responsavel uuid DEFAULT NULL
) RETURNS TABLE (
  id uuid,
  applicant_id uuid,
  applicant_name text,
  cpf_cnpj text,
  person_type text,
  final_decision text,
  finalized_at timestamptz,
  archived_at timestamptz,
  cancel_reason text,
  cancelled_at timestamptz,
  vendedor_id uuid,
  vendedor_name text,
  analista_id uuid,
  analista_name text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT
    c.id,
    a.id           AS applicant_id,
    a.primary_name AS applicant_name,
    a.cpf_cnpj,
    c.person_type::text,
    c.final_decision,
    c.finalized_at,
    c.archived_at,
    c.cancel_reason,
    c.cancelled_at,
    v.id           AS vendedor_id,
    v.full_name    AS vendedor_name,
    n.id           AS analista_id,
    n.full_name    AS analista_name
  FROM public.kanban_cards c
  JOIN public.applicants a ON a.id = c.applicant_id
  LEFT JOIN public.profiles v ON v.id = c.created_by
  LEFT JOIN public.profiles n ON n.id = c.assignee_id
  WHERE c.area = 'analise'
    AND lower(c.stage) = 'finalizados'
    AND c.archived_at IS NOT NULL
    AND c.deleted_at IS NULL
    AND (p_search IS NULL
         OR public.norm_text(a.primary_name) LIKE '%' || public.norm_text(p_search) || '%'
         OR a.cpf_cnpj ILIKE '%' || p_search || '%')
    AND (p_date_start IS NULL OR c.finalized_at >= p_date_start)
    AND (p_date_end   IS NULL OR c.finalized_at <= p_date_end)
    AND (p_status IS NULL OR p_status = ''
         OR lower(p_status) = lower(coalesce(c.final_decision, '')))
    AND (p_responsavel IS NULL OR c.created_by = p_responsavel OR c.assignee_id = p_responsavel)
  ORDER BY c.finalized_at DESC NULLS LAST, c.id;
$$;

GRANT EXECUTE ON FUNCTION public.list_historico(text, timestamptz, timestamptz, text, uuid) TO authenticated;
