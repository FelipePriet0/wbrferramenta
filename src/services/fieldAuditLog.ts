import { supabase } from '@/lib/supabase';

export type FieldHistoryEntry = {
  id: number;
  table_name: string;
  old_value: string | null;
  new_value: string | null;
  by_name: string | null;
  action: 'preenchido' | 'atualizado' | 'apagado' | null;
  at: string;
};

export async function fetchFieldHistory(
  applicantId: string,
  field: string,
): Promise<FieldHistoryEntry[]> {
  const { data, error } = await supabase
    .from('field_audit_log')
    .select('id, table_name, old_value, new_value, by_name, action, at')
    .eq('applicant_id', applicantId)
    .eq('field', field)
    .order('at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as FieldHistoryEntry[];
}
