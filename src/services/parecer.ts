import { supabase } from '@/lib/supabase';
import type { KanbanDecisionStatus } from '@/lib/types';

export interface ParecerMention {
  id: string;
  label: string;
}

/**
 * Shape stored inside kanban_cards.reanalysis_notes (one entry per parecer).
 * The DB-side functions handle generating id, timestamps, level/thread_id.
 */
export interface ParecerNote {
  id: string;
  text: string;
  mentions: ParecerMention[];
  author_id: string | null;
  author_name: string | null;
  author_role: string | null;
  created_at: string;
  parent_id: string | null;
  level: number;
  thread_id: string;
  is_thread_starter: boolean;
  decision: KanbanDecisionStatus | null;
  // edit/delete metadata added in-place
  updated_by_id?: string;
  updated_by_name?: string;
  updated_at?: string;
  deleted?: boolean;
}

/**
 * Append a new parecer to the card. If decision is supplied, set_card_decision
 * is also chained inside the RPC (the card moves to the matching stage).
 *
 * @param cardId   captured by caller in closure — never read from a global.
 *                 This is the single source of truth that prevents the P0 bug
 *                 of parecer text leaking between fichas.
 */
export async function addParecer(
  cardId: string,
  text: string,
  opts: {
    parentId?: string | null;
    decision?: KanbanDecisionStatus | null;
    mentions?: ParecerMention[];
  } = {},
): Promise<{ noteId: string; threadId: string }> {
  const { data, error } = await supabase.rpc('add_parecer', {
    p_card_id: cardId,
    p_text: text,
    p_parent_id: opts.parentId ?? null,
    p_decision: opts.decision ?? null,
    p_mentions: opts.mentions ?? [],
  });
  if (error) throw new Error(error.message);
  const obj = data as { note_id: string; thread_id: string };
  return { noteId: obj.note_id, threadId: obj.thread_id };
}

/**
 * Edit a parecer in place. RLS-side: only the author can edit.
 * Optionally re-apply a decision (e.g. user edited and added /aprovado).
 */
export async function editParecer(
  cardId: string,
  noteId: string,
  text: string,
  opts: {
    decision?: KanbanDecisionStatus | null;
    mentions?: ParecerMention[];
  } = {},
): Promise<void> {
  const { error } = await supabase.rpc('edit_parecer', {
    p_card_id: cardId,
    p_note_id: noteId,
    p_text: text,
    p_decision: opts.decision ?? null,
    // null = keep existing mentions; an array replaces them.
    p_mentions: opts.mentions === undefined ? null : opts.mentions,
  });
  if (error) throw new Error(error.message);
}

/**
 * Soft-delete a parecer in place ({"deleted": true}). UI filters those out.
 */
export async function deleteParecer(cardId: string, noteId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_parecer', {
    p_card_id: cardId,
    p_note_id: noteId,
  });
  if (error) throw new Error(error.message);
}
