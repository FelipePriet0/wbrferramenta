import { supabase } from '@/lib/supabase';
import type { KanbanArea, KanbanDecisionStatus } from '@/lib/types';
import type { KanbanCard } from '@/features/kanban/types';

export interface ListCardsOpts {
  hora?: string[];
  dateStart?: string;
  dateEnd?: string;
  responsaveis?: string[];
  searchTerm?: string;
}

type CardRow = {
  id: string;
  applicant_id: string;
  stage: string;
  area: KanbanArea;
  assignee_id: string | null;
  created_by: string | null;
  vendor_id: string | null;
  due_at: string | null;
  hora_at: string[] | null;
  periodo: 'manha' | 'tarde' | null;
  finalized_at: string | null;
  archived_at: string | null;
  created_at: string;
  applicants: {
    primary_name: string | null;
    cpf_cnpj: string | null;
    phone: string | null;
    whatsapp: string | null;
    bairro: string | null;
  } | null;
};

const CARD_COLUMNS =
  'id, applicant_id, stage, area, assignee_id, created_by, vendor_id, due_at, hora_at, periodo, finalized_at, archived_at, created_at, ' +
  'applicants(primary_name, cpf_cnpj, phone, whatsapp, bairro)';

function rowToCard(row: CardRow): KanbanCard {
  return {
    id: row.id,
    applicantId: row.applicant_id,
    applicantName: row.applicants?.primary_name ?? '—',
    cpfCnpj: row.applicants?.cpf_cnpj ?? '',
    phone: row.applicants?.phone ?? undefined,
    whatsapp: row.applicants?.whatsapp ?? undefined,
    bairro: row.applicants?.bairro ?? undefined,
    dueAt: row.due_at ?? undefined,
    horaAt: row.hora_at && row.hora_at.length > 0 ? row.hora_at[0] : undefined,
    periodo: row.periodo ?? undefined,
    finalizedAt: row.finalized_at ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    area: row.area,
    stage: (row.stage ?? '').toLowerCase(),
    assigneeId: row.assignee_id ?? undefined,
    vendorId: row.vendor_id ?? undefined,
  };
}

/**
 * Escape PostgREST ILIKE wildcards in user-provided search input.
 *
 * The ILIKE operator interprets `%` and `_` as wildcards, and `\` as the
 * escape character. We backslash-escape all three so a search for "10%"
 * matches the literal "10%", not "10<anything>".
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

function escapeIlike(term: string): string {
  return term.replace(/[\\%_]/g, '\\$&');
}

/**
 * Wrap a PostgREST or() value in double-quotes so commas, parentheses and
 * other syntax characters in user input don't break the logic-tree parser.
 * Internal backslashes and double-quotes are escaped first.
 */
function quoteOrValue(v: string): string {
  return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Lowercase + strip diacritics so the search term matches against
 * applicants.primary_name_norm (which is stored already normalised).
 * "João" → "joao", "Maria-Á" → "maria-a".
 */
function normalizeSearch(term: string): string {
  return term
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/**
 * List kanban_cards in a given area (commercial or analysis).
 *
 * Always filters: deleted_at IS NULL AND archived_at IS NULL (no zombies).
 * Optional filters (search, responsaveis, hora, dateStart, dateEnd) are
 * applied server-side. The "myMentions" filter is NOT here — it lives in
 * the page client as a client-side intersect (different data source).
 */
export async function listCards(
  area: KanbanArea,
  opts: ListCardsOpts = {},
): Promise<KanbanCard[]> {
  let q = supabase
    .from('kanban_cards')
    .select(CARD_COLUMNS)
    .eq('area', area)
    .is('deleted_at', null)
    .is('archived_at', null);

  if (opts.searchTerm && opts.searchTerm.trim().length > 0) {
    const raw = opts.searchTerm.trim();
    // primary_name_norm is lower(unaccent(primary_name)) — case + accent insensitive.
    const nameTerm = escapeIlike(normalizeSearch(raw));
    // cpf_cnpj is stored in mixed formats — some rows digits-only ("11043971610"),
    // some with dots/dashes ("110.439.716-10"). Search both: docTerm (digits-only)
    // covers the normalised rows; rawDoc (escaped original input) covers the rest.
    // quoteOrValue wraps each OR value in double-quotes so commas inside the term
    // don't break PostgREST's logic-tree parser.
    const docTerm = escapeIlike(raw.replace(/\D+/g, ''));
    const rawDoc = escapeIlike(raw);
    const ors = [`primary_name_norm.ilike.${quoteOrValue(`%${nameTerm}%`)}`];
    if (docTerm.length > 0) {
      ors.push(`cpf_cnpj.ilike.${quoteOrValue(`%${docTerm}%`)}`);
      if (rawDoc !== docTerm) ors.push(`cpf_cnpj.ilike.${quoteOrValue(`%${rawDoc}%`)}`);
    }
    q = q.or(ors.join(','), { referencedTable: 'applicants' });
  }
  if (opts.responsaveis && opts.responsaveis.length > 0) {
    const safe = opts.responsaveis.filter(isUuid);
    if (safe.length > 0) {
      const csv = safe.join(',');
      q = q.or(`assignee_id.in.(${csv}),vendor_id.in.(${csv})`);
    }
  }
  // due_at is timestamptz; the filter passes 'YYYY-MM-DD' (local Brasília
  // calendar day). Expand to the full BRT day so any timestamp on that
  // calendar date matches, regardless of the saved hour.
  if (opts.dateStart) q = q.gte('due_at', `${opts.dateStart}T00:00:00-03:00`);
  if (opts.dateEnd) q = q.lte('due_at', `${opts.dateEnd}T23:59:59.999-03:00`);

  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  let rows = (data as unknown as CardRow[]).filter(
    (r) => !opts.searchTerm || r.applicants !== null,
  );

  // Filter hora client-side: hora_at is text[] storing 'HH:MM:SS' and
  // supabase-js .contains()/.filter('cs',...) does not reliably escape ':'
  // for PostgREST's array literal parser. A linear scan over a board with
  // a few hundred rows is sub-millisecond and bypasses the encoder issue.
  if (opts.hora && opts.hora.length > 0) {
    // Each selected time is 'HH:MM'; stored values are 'HH:MM:SS'. Normalize
    // to 3-segment form and keep cards that contain ANY of the selected times.
    const horasWithSeconds = opts.hora.map((h) =>
      h.split(':').length >= 3 ? h : `${h}:00`,
    );
    rows = rows.filter(
      (r) => r.hora_at?.some((t) => horasWithSeconds.includes(t)) ?? false,
    );
  }

  return rows.map(rowToCard);
}

/**
 * Move a card across stages. The RPC handles all the side effects
 * (promotion to análise, cancellation timestamps, finalization, etc.).
 */
const MAX_REASON_LENGTH = 1_000;

export async function changeStage(
  cardId: string,
  area: KanbanArea,
  stage: string,
  reason?: string,
): Promise<void> {
  if (reason && reason.length > MAX_REASON_LENGTH) throw new Error('text_too_long');
  const { error } = await supabase.rpc('change_stage', {
    p_card_id: cardId,
    p_area: area,
    p_stage: stage,
    p_reason: reason ?? null,
  });
  if (error) throw new Error(error.message);
}

/**
 * Apply a decision (aprovado/negado/reanalise) to a card.
 *
 * Used by the parecer composer slash commands. The RPC moves the card
 * to the matching stage and records the decision metadata.
 */
export async function setCardDecision(
  cardId: string,
  decision: KanbanDecisionStatus,
): Promise<void> {
  const { error } = await supabase.rpc('set_card_decision', {
    p_card_id: cardId,
    p_decision: decision,
  });
  if (error) throw new Error(error.message);
}

/**
 * Soft-delete a card. Hard DELETE is blocked by RLS.
 */
export async function softDeleteCard(cardId: string, reason?: string): Promise<void> {
  if (reason && reason.length > MAX_REASON_LENGTH) throw new Error('text_too_long');
  const { error } = await supabase.rpc('soft_delete_card', {
    p_card_id: cardId,
    p_reason: reason ?? null,
  });
  if (error) throw new Error(error.message);
}

/**
 * Return per-stage counts for the dashboard strip at the top of the board.
 *
 * Result shape: `{ entrada: 3, feitas: 5, aguardando: 1, ... }`. Missing
 * stages aren't present — callers default to 0.
 */
export async function dashboardKanbanCounts(
  area: KanbanArea,
  dateRange?: { start?: string; end?: string },
): Promise<Record<string, number>> {
  const params: Record<string, string> = {
    p_area: area,
    p_now: new Date().toISOString(),
  };
  if (dateRange?.start) params.p_start = new Date(`${dateRange.start}T00:00:00`).toISOString();
  if (dateRange?.end)   params.p_end   = new Date(`${dateRange.end}T23:59:59`).toISOString();
  const { data, error } = await supabase.rpc('dashboard_kanban_counts', params);
  if (error) throw new Error(error.message);
  return (data as Record<string, number> | null) ?? {};
}

/**
 * Cards where the current user has been mentioned, paired with the timestamp
 * of the LATEST mention in each card. The frontend compares that timestamp
 * against the local "read at" stamp (IndexedDB) to decide whether to light up
 * the card again — fixing the "once read, never green again" bug.
 *
 * Returns a Map<cardId, latestMentionAt ISO>. Backs the "Minhas menções"
 * filter (Task #9) too — callers can read map.keys() when they only need the
 * id set.
 */
export async function listMyMentionCards(): Promise<Map<string, string>> {
  const { data, error } = await supabase.rpc('list_my_mention_cards');
  if (error) throw new Error(error.message);
  const out = new Map<string, string>();
  const rows = (data as { card_id: string; latest_mention_at: string }[] | null) ?? [];
  for (const row of rows) {
    if (row?.card_id) out.set(row.card_id, row.latest_mention_at);
  }
  return out;
}

/**
 * Find the active (non-cancelled, non-archived) card for an applicant in a given area.
 * Returns the card id or null if not found.
 */
export async function findActiveCardByApplicant(applicantId: string, area: KanbanArea): Promise<string | null> {
  const { data } = await supabase
    .from('kanban_cards')
    .select('id')
    .eq('applicant_id', applicantId)
    .eq('area', area)
    .neq('stage', 'canceladas')
    .is('archived_at', null)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Client-side auto-archive loop for Finalizados.
 *
 * Called every 20s by KanbanAnalisePageClient. Marks cards as archived
 * once they've been in 'finalizados' for `ttlSec` (default 60s) — at
 * that point they disappear from the board and show up in Histórico.
 *
 * Pure UPDATE; RLS allows analista/gestor/instalador to set archived_at.
 */
export async function autoArchiveFinalizados(ttlSec: number = 60): Promise<void> {
  const cutoff = new Date(Date.now() - ttlSec * 1000).toISOString();
  const { error } = await supabase
    .from('kanban_cards')
    .update({ archived_at: new Date().toISOString() })
    .eq('area', 'analise')
    .eq('stage', 'finalizados')
    .is('archived_at', null)
    .lt('finalized_at', cutoff);
  if (error) {
    // Non-fatal: just log so we don't spam the UI for a transient failure.
    console.error('[kanban] autoArchiveFinalizados', error);
  }
}
