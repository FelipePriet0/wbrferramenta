import { supabase } from '@/lib/supabase';

// Transfer ownership of a card to another vendor. The new vendor must be a
// profile with role 'vendedor'. The DB trigger trg_log_card_ownership_change
// will automatically record the move in card_ownership_history.
export async function transferVendor(
  cardId: string,
  newVendorId: string,
): Promise<void> {
  const { error } = await supabase
    .from('kanban_cards')
    .update({ vendor_id: newVendorId })
    .eq('id', cardId);
  if (error) throw new Error(error.message);
}

// Transfer the analyst (assignee). New analyst must be a profile with role
// 'analista' or 'gestor' (gestor also analyses per project rules). The same
// history trigger records this transfer as role='analyst'.
export async function transferAnalyst(
  cardId: string,
  newAnalystId: string,
): Promise<void> {
  const { error } = await supabase
    .from('kanban_cards')
    .update({ assignee_id: newAnalystId })
    .eq('id', cardId);
  if (error) throw new Error(error.message);
}

// Read the transfer history for a card. Newest first.
export type OwnershipHistoryRow = {
  id: string;
  card_id: string;
  role: 'vendor' | 'analyst';
  from_id: string | null;
  to_id: string | null;
  changed_by: string | null;
  changed_at: string;
};

export async function fetchOwnershipHistory(
  cardId: string,
): Promise<OwnershipHistoryRow[]> {
  const { data, error } = await supabase
    .from('card_ownership_history')
    .select('id, card_id, role, from_id, to_id, changed_by, changed_at')
    .eq('card_id', cardId)
    .order('changed_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as OwnershipHistoryRow[] | null) ?? [];
}
