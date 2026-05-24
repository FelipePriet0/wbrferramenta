import { supabase } from '@/lib/supabase';
import type { KanbanArea } from '@/lib/types';
import type { DateRangeValue } from '@/components/ui/date-range-popover';
import { dashboardKanbanCounts } from './kanban';

export type KPISnapshot = Record<string, number>;

export type GamificacaoRow = {
  user_id: string;
  user_name: string;
  feitas: number;
  aguardando: number;
  canceladas: number;
  total: number;
};

export type BarPoint = { label: string; count: number };

// ---------------------------------------------------------------------------
// KPI Snapshot
// ---------------------------------------------------------------------------

// Conta fichas concluídas no comercial: cards em area=analise com vendor_id preenchido
// (a RPC change_stage move o card atomicamente de comercial→analise ao concluir).
async function countComercialConcluidas(vendorId?: string): Promise<number> {
  let q = supabase
    .from('kanban_cards')
    .select('*', { count: 'exact', head: true })
    .eq('area', 'analise')
    .not('vendor_id', 'is', null)
    .is('deleted_at', null);
  if (vendorId) q = q.eq('vendor_id', vendorId);
  const { count } = await q;
  return count ?? 0;
}

export async function getKPISnapshot(
  area: KanbanArea,
  vendorId?: string,
): Promise<KPISnapshot> {
  if (!vendorId) {
    const counts = await dashboardKanbanCounts(area);
    if (area === 'comercial') {
      counts.concluidas = await countComercialConcluidas();
    }
    return counts;
  }

  // Vendor-filtered path: direct count grouped by stage.
  const col = area === 'comercial' ? 'vendor_id' : 'assignee_id';
  const { data, error } = await supabase
    .from('kanban_cards')
    .select('stage')
    .eq('area', area)
    .eq(col, vendorId)
    .is('deleted_at', null)
    .is('archived_at', null);

  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const card of (data as { stage: string }[]) ?? []) {
    counts[card.stage] = (counts[card.stage] ?? 0) + 1;
  }

  if (area === 'comercial') {
    counts.concluidas = await countComercialConcluidas(vendorId);
  }

  return counts;
}

// ---------------------------------------------------------------------------
// Live table (gamification)
// ---------------------------------------------------------------------------

type ProfileRow = { id: string; full_name: string | null };

async function fetchProfiles(): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('profiles').select('id, full_name');
  if (error) throw new Error(error.message);
  return new Map((data as ProfileRow[]).map((p) => [p.id, p.full_name ?? 'Desconhecido']));
}

// ---------------------------------------------------------------------------
// Comercial ranking: conta fichas concluídas por vendedor.
// Quando o vendedor move p/ "concluidas", a RPC change_stage atomicamente
// muda o card para area=analise, stage=recebidos, preservando vendor_id e
// setando received_at. Logo, contamos cards em analise com vendor_id != null,
// filtrados por received_at (= timestamp exato da conclusão).
// ---------------------------------------------------------------------------
async function getLiveTableComercial(
  vendorId?: string,
  range?: DateRangeValue,
): Promise<GamificacaoRow[]> {
  let q = supabase
    .from('kanban_cards')
    .select('vendor_id')
    .eq('area', 'analise')
    .not('vendor_id', 'is', null)
    .is('deleted_at', null);

  if (vendorId) q = q.eq('vendor_id', vendorId);

  if (range?.start) {
    const start = new Date(`${range.start}T00:00:00`);
    const end = range.end ? new Date(`${range.end}T23:59:59`) : new Date();
    q = q.gte('received_at', start.toISOString()).lte('received_at', end.toISOString());
  }

  const [cardsRes, profileMap] = await Promise.all([q, fetchProfiles()]);
  if (cardsRes.error) throw new Error(cardsRes.error.message);

  const userMap = new Map<string, number>();
  for (const card of (cardsRes.data as { vendor_id: string }[]) ?? []) {
    userMap.set(card.vendor_id, (userMap.get(card.vendor_id) ?? 0) + 1);
  }

  return Array.from(userMap.entries())
    .map(([userId, concluidas]) => ({
      user_id: userId,
      user_name: profileMap.get(userId) ?? 'Desconhecido',
      feitas: concluidas,
      aguardando: 0,
      canceladas: 0,
      total: concluidas,
    }))
    .sort((a, b) => b.total - a.total);
}

// ---------------------------------------------------------------------------
// Análise ranking: conta aprovados / reanálise / negados por analista.
// ---------------------------------------------------------------------------
async function getLiveTableAnalise(
  vendorId?: string,
  range?: DateRangeValue,
): Promise<GamificacaoRow[]> {
  type CardRow = { stage: string; assignee_id: string | null };

  let q = supabase
    .from('kanban_cards')
    .select('stage, assignee_id')
    .eq('area', 'analise')
    .is('deleted_at', null)
    .is('archived_at', null);

  if (vendorId) q = q.eq('assignee_id', vendorId);

  if (range?.start) {
    const start = new Date(`${range.start}T00:00:00`);
    const end = range.end ? new Date(`${range.end}T23:59:59`) : new Date();
    q = q.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
  }

  const [cardsRes, profileMap] = await Promise.all([q, fetchProfiles()]);
  if (cardsRes.error) throw new Error(cardsRes.error.message);

  const userMap = new Map<string, { feitas: number; aguardando: number; canceladas: number }>();

  for (const card of (cardsRes.data as CardRow[]) ?? []) {
    if (!card.assignee_id) continue;
    const cur = userMap.get(card.assignee_id) ?? { feitas: 0, aguardando: 0, canceladas: 0 };
    if (card.stage === 'aprovados') cur.feitas++;
    else if (card.stage === 'reanalise') cur.aguardando++;
    else if (card.stage === 'negados') cur.canceladas++;
    userMap.set(card.assignee_id, cur);
  }

  return Array.from(userMap.entries())
    .map(([userId, counts]) => ({
      user_id: userId,
      user_name: profileMap.get(userId) ?? 'Desconhecido',
      feitas: counts.feitas,
      aguardando: counts.aguardando,
      canceladas: counts.canceladas,
      total: counts.feitas + counts.aguardando + counts.canceladas,
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getLiveTableData(
  area: KanbanArea,
  vendorId?: string,
  range?: DateRangeValue,
): Promise<GamificacaoRow[]> {
  return area === 'comercial'
    ? getLiveTableComercial(vendorId, range)
    : getLiveTableAnalise(vendorId, range);
}

// ---------------------------------------------------------------------------
// Live pipeline (LiveKanbanTable) — estado atual do kanban por colaborador.
// Comercial: feitas / aguardando / canceladas em area=comercial.
// Análise: em_analise+preenchidas / reanalise / negados em area=analise.
// Sem filtro de período — reflete snapshot instantâneo do board.
// ---------------------------------------------------------------------------
export async function getLivePipelineData(area: KanbanArea): Promise<GamificacaoRow[]> {
  type CardRow = { stage: string; vendor_id: string | null; assignee_id: string | null };

  const { data, error } = await supabase
    .from('kanban_cards')
    .select('stage, vendor_id, assignee_id')
    .eq('area', area)
    .is('deleted_at', null)
    .is('archived_at', null);

  if (error) throw new Error(error.message);

  const profileMap = await fetchProfiles();
  const userMap = new Map<string, { feitas: number; aguardando: number; canceladas: number }>();

  for (const card of (data as CardRow[]) ?? []) {
    const userId = area === 'comercial' ? card.vendor_id : card.assignee_id;
    if (!userId) continue;

    const cur = userMap.get(userId) ?? { feitas: 0, aguardando: 0, canceladas: 0 };

    if (area === 'comercial') {
      if (card.stage === 'feitas') cur.feitas++;
      else if (card.stage === 'aguardando') cur.aguardando++;
      else if (card.stage === 'canceladas') cur.canceladas++;
    } else {
      if (card.stage === 'em_analise' || card.stage === 'preenchidas') cur.feitas++;
      else if (card.stage === 'reanalise') cur.aguardando++;
      else if (card.stage === 'negados') cur.canceladas++;
    }

    userMap.set(userId, cur);
  }

  return Array.from(userMap.entries())
    .map(([userId, counts]) => ({
      user_id: userId,
      user_name: profileMap.get(userId) ?? 'Desconhecido',
      feitas: counts.feitas,
      aguardando: counts.aguardando,
      canceladas: counts.canceladas,
      total: counts.feitas + counts.aguardando + counts.canceladas,
    }))
    .sort((a, b) => b.total - a.total);
}

// ---------------------------------------------------------------------------
// Time series (bar chart)
// ---------------------------------------------------------------------------

type Trunc = 'hour' | 'day' | 'month';

function rangeToTrunc(start: Date, end: Date): Trunc {
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return 'hour';
  if (diffDays <= 90) return 'day';
  return 'month';
}

function bucketKey(d: Date, trunc: Trunc): string {
  if (trunc === 'hour')
    return `${String(d.getHours()).padStart(2, '0')}h`;
  if (trunc === 'day')
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d).replace('.', '');
}

// Gera todos os buckets esperados para o intervalo com valor 0 (sem lacunas).
function generateBuckets(start: Date, end: Date, trunc: Trunc): Map<string, number> {
  const map = new Map<string, number>();

  if (trunc === 'hour') {
    // Dia → todas as 24 horas fixas (00h–23h)
    for (let h = 0; h < 24; h++) {
      map.set(`${String(h).padStart(2, '0')}h`, 0);
    }
  } else if (trunc === 'day') {
    // Semana / Mês → cada dia do intervalo
    const cur = new Date(start);
    cur.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);
    while (cur <= endDay) {
      map.set(bucketKey(new Date(cur), 'day'), 0);
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    // Ano → cada mês do intervalo (Jan–Dez)
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= endMonth) {
      map.set(bucketKey(new Date(cur), 'month'), 0);
      cur.setMonth(cur.getMonth() + 1);
    }
  }

  return map;
}

function weekRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function getTimeSeries(
  area: KanbanArea,
  range: DateRangeValue,
  vendorId?: string,
): Promise<BarPoint[]> {
  const { start, end } = range.start
    ? {
        start: new Date(`${range.start}T00:00:00`),
        end: range.end ? new Date(`${range.end}T23:59:59`) : new Date(),
      }
    : weekRange();

  const trunc = rangeToTrunc(start, end);

  let q = supabase
    .from('kanban_cards')
    .select('created_at')
    .eq('area', area)
    .is('deleted_at', null)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  if (vendorId) {
    const col = area === 'comercial' ? 'vendor_id' : 'assignee_id';
    q = q.eq(col, vendorId);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  // Pré-popula todos os buckets com 0, depois sobrepõe os dados reais.
  const buckets = generateBuckets(start, end, trunc);
  for (const card of (data as { created_at: string }[]) ?? []) {
    const key = bucketKey(new Date(card.created_at), trunc);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  // Map preserva ordem de inserção → já está em ordem cronológica.
  return Array.from(buckets.entries()).map(([label, count]) => ({ label, count }));
}
