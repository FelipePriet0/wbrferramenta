import { supabase } from '@/lib/supabase';

export interface CardLabel {
  id: string;
  name: string;
  color: string;
}

const PREENCHIDA = 'Preenchida';

export async function listLabels(): Promise<CardLabel[]> {
  const { data, error } = await supabase
    .from('card_labels')
    .select('id, name, color')
    .eq('active', true)
    .is('deleted_at', null)
    .order('name');
  if (error) throw new Error(error.message);
  return (data as CardLabel[] | null) ?? [];
}

export async function listAssignmentsForCard(
  cardId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('card_label_assignments')
    .select('label_id')
    .eq('card_id', cardId);
  if (error) throw new Error(error.message);
  return ((data as { label_id: string }[] | null) ?? []).map((r) => r.label_id);
}

// Bulk load for the kanban board. Returns Map<cardId, labelId[]>.
export async function listAssignmentsForCards(
  cardIds: string[],
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  if (cardIds.length === 0) return result;
  const { data, error } = await supabase
    .from('card_label_assignments')
    .select('card_id, label_id')
    .in('card_id', cardIds);
  if (error) throw new Error(error.message);
  for (const row of (data as { card_id: string; label_id: string }[] | null) ??
    []) {
    const arr = result.get(row.card_id);
    if (arr) arr.push(row.label_id);
    else result.set(row.card_id, [row.label_id]);
  }
  return result;
}

// Set of card IDs that have the "Preenchida" label. Used by the kanban for the
// blue visual variant. Single round-trip — join against card_labels by name so
// we don't need to know the label_id up front.
export async function listPreenchidaCardIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('card_label_assignments')
    .select('card_id, card_labels!inner(name, active, deleted_at)')
    .eq('card_labels.name', PREENCHIDA)
    .eq('card_labels.active', true)
    .is('card_labels.deleted_at', null);
  if (error) throw new Error(error.message);
  return ((data as { card_id: string }[] | null) ?? []).map((r) => r.card_id);
}

export async function assignLabel(
  cardId: string,
  labelId: string,
  assignedBy: string,
): Promise<void> {
  const { error } = await supabase
    .from('card_label_assignments')
    .insert({ card_id: cardId, label_id: labelId, assigned_by: assignedBy });
  // UNIQUE(card_id, label_id) → 23505 when toggling fast. Treat as no-op.
  if (error && error.code !== '23505') throw new Error(error.message);
}

// Atomic insert of the Urgente assignment + persistence of the reason on
// kanban_cards. Server-side RPC keeps both writes in the same transaction
// and infers the author from auth.uid().
export async function assignUrgentWithReason(
  cardId: string,
  labelId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase.rpc('assign_urgent_with_reason', {
    p_card_id: cardId,
    p_label_id: labelId,
    p_reason: reason,
  });
  if (error) throw new Error(error.message);
}

// Only the original author of the Urgente reason can edit it (RBAC enforced
// in the RPC). Other roles get RAISE EXCEPTION 'not_owner'.
export async function updateUrgentReason(
  cardId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase.rpc('update_urgent_reason', {
    p_card_id: cardId,
    p_reason: reason,
  });
  if (error) throw new Error(error.message);
}

// Read the urgent reason metadata for a single card — used by KanbanCard
// when the user clicks the "Urgente" chip to open the read-only modal.
// Read the cancellation metadata for a card — used by CanceladaMotivoModal
// when the user clicks the "Cancelada" chip. Returns nulls if the card is
// not (or never was) in canceladas.
export async function updateCancelReason(
  cardId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase
    .from('kanban_cards')
    .update({ cancel_reason: reason })
    .eq('id', cardId);
  if (error) throw new Error(error.message);
}

export async function fetchCancelReason(
  cardId: string,
): Promise<{
  reason: string | null;
  by: string | null;
  at: string | null;
}> {
  const { data, error } = await supabase
    .from('kanban_cards')
    .select('cancel_reason, cancelled_by, cancelled_at')
    .eq('id', cardId)
    .single();
  if (error) throw new Error(error.message);
  const row = data as {
    cancel_reason: string | null;
    cancelled_by: string | null;
    cancelled_at: string | null;
  };
  return {
    reason: row.cancel_reason,
    by: row.cancelled_by,
    at: row.cancelled_at,
  };
}

export async function fetchUrgentReason(
  cardId: string,
): Promise<{
  reason: string | null;
  by: string | null;
  at: string | null;
}> {
  const { data, error } = await supabase
    .from('kanban_cards')
    .select('urgent_reason, urgent_reason_by, urgent_reason_at')
    .eq('id', cardId)
    .single();
  if (error) throw new Error(error.message);
  const row = data as {
    urgent_reason: string | null;
    urgent_reason_by: string | null;
    urgent_reason_at: string | null;
  };
  return {
    reason: row.urgent_reason,
    by: row.urgent_reason_by,
    at: row.urgent_reason_at,
  };
}

export async function unassignLabel(
  cardId: string,
  labelId: string,
): Promise<void> {
  const { error } = await supabase
    .from('card_label_assignments')
    .delete()
    .eq('card_id', cardId)
    .eq('label_id', labelId);
  if (error) throw new Error(error.message);
}
