import { supabase } from '@/lib/supabase';
import type { KanbanArea } from '@/lib/types';

// One row returned by list_historico — keys mirror the function's TABLE result.
export interface HistoricoRow {
  id: string;
  applicant_id: string;
  applicant_name: string | null;
  cpf_cnpj: string | null;
  person_type: 'PF' | 'PJ' | null;
  final_decision: string | null;
  finalized_at: string | null;
  archived_at: string | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  vendedor_id: string | null;
  vendedor_name: string | null;
  analista_id: string | null;
  analista_name: string | null;
}

export type HistoricoFilters = {
  search?: string | null;
  dateStart?: string | null; // ISO timestamptz
  dateEnd?: string | null;
  status?: string | null; // 'aprovados' | 'negados' | 'canceladas' | ''
  responsavel?: string | null; // profile UUID
};

export async function listHistorico(
  filters: HistoricoFilters = {},
): Promise<HistoricoRow[]> {
  const { data, error } = await supabase.rpc('list_historico', {
    p_search: filters.search?.trim() || null,
    p_date_start: filters.dateStart || null,
    p_date_end: filters.dateEnd || null,
    p_status: filters.status || null,
    p_responsavel: filters.responsavel || null,
  });
  if (error) throw new Error(error.message);
  return (data as HistoricoRow[] | null) ?? [];
}

// Returned by get_historico_details — used by row enrichment when the row's
// analista_name comes back null or the status looks off. The DB function
// builds a wide jsonb; only the fields we read are typed here.
export interface HistoricoDetails {
  applicant?: { person_type?: 'PF' | 'PJ' } | null;
  card?: {
    decision_status?: string | null;
    final_decision?: string | null;
  } | null;
  pareceres?: {
    author_id?: string | null;
    author_name?: string | null;
    decision?: string | null;
    created_at?: string | null;
  }[];
  [k: string]: unknown;
}

export async function getHistoricoDetails(
  cardId: string,
): Promise<HistoricoDetails | null> {
  const { data, error } = await supabase.rpc('get_historico_details', {
    p_card_id: cardId,
  });
  if (error) throw new Error(error.message);
  return (data as HistoricoDetails | null) ?? null;
}

export async function restoreCard(
  cardId: string,
  area: KanbanArea,
  stage: string,
): Promise<void> {
  const { error } = await supabase.rpc('restore_card', {
    p_card_id: cardId,
    p_area: area,
    p_stage: stage,
  });
  if (error) throw new Error(error.message);
}
