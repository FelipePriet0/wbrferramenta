import { supabase } from '@/lib/supabase';
import type { KanbanArea } from '@/lib/types';
import type { DateRangeValue } from '@/components/ui/date-range-popover';
import { dashboardKanbanCounts } from './kanban';

export type KPISnapshot = Record<string, number>;

export type GamificacaoRow = {
  user_id: string;
  user_name: string;
  preenchidas: number;
  feitas: number;
  aguardando: number;
  canceladas: number;
  aprovadas: number;
  total: number;
};

export type BarPoint = {
  label: string;
  count: number;
  concluidas: number;
  aprovadas: number;
  negadas: number;
  canceladas: number;
};

// ---------------------------------------------------------------------------
// KPI Snapshot
// ---------------------------------------------------------------------------

// Conta fichas concluídas no comercial: cards em area=analise com vendor_id preenchido
// (a RPC change_stage move o card atomicamente de comercial→analise ao concluir).
async function countComercialConcluidas(
  vendorId?: string,
  dateRange?: DateRangeValue,
): Promise<number> {
  let q = supabase
    .from('kanban_cards')
    .select('*', { count: 'exact', head: true })
    .eq('area', 'analise')
    .not('vendor_id', 'is', null)
    .is('deleted_at', null);
  if (vendorId) q = q.eq('vendor_id', vendorId);
  // Concluídas: filtra por received_at (momento em que o vendedor concluiu a ficha)
  if (dateRange?.start) q = q.gte('received_at', new Date(`${dateRange.start}T00:00:00`).toISOString());
  if (dateRange?.end)   q = q.lte('received_at', new Date(`${dateRange.end}T23:59:59`).toISOString());
  const { count } = await q;
  return count ?? 0;
}

// Conta fichas canceladas no comercial: cards com stage='canceladas' e received_at IS NULL
// (received_at nulo = nunca chegou a ser recebida pela análise = foi cancelada no fluxo comercial).
// Cards com received_at preenchido foram cancelados dentro da análise — não contam aqui.
async function countComercialCanceladas(
  vendorId?: string,
  dateRange?: DateRangeValue,
): Promise<number> {
  let q = supabase
    .from('kanban_cards')
    .select('*', { count: 'exact', head: true })
    .eq('stage', 'canceladas')
    .is('received_at', null)
    .is('deleted_at', null);
  if (vendorId) q = q.eq('vendor_id', vendorId);
  if (dateRange?.start) q = q.gte('created_at', new Date(`${dateRange.start}T00:00:00`).toISOString());
  if (dateRange?.end)   q = q.lte('created_at', new Date(`${dateRange.end}T23:59:59`).toISOString());
  const { count } = await q;
  return count ?? 0;
}

// Análise — fichas recebidas no período (filtro por received_at).
// Inclui pipeline ativo e histórico: o que importa é quando chegou à análise.
async function countAnaliseRecebidos(
  vendorId?: string,
  dateRange?: DateRangeValue,
): Promise<number> {
  let q = supabase
    .from('kanban_cards')
    .select('*', { count: 'exact', head: true })
    .eq('area', 'analise')
    .not('received_at', 'is', null)
    .is('deleted_at', null);
  if (vendorId) q = q.eq('assignee_id', vendorId);
  if (dateRange?.start) q = q.gte('received_at', new Date(`${dateRange.start}T00:00:00`).toISOString());
  if (dateRange?.end)   q = q.lte('received_at', new Date(`${dateRange.end}T23:59:59`).toISOString());
  const { count } = await q;
  return count ?? 0;
}

// Análise — fichas finalizadas (arquivadas) com o desfecho especificado no período.
// Cards no histórico têm stage='finalizados'; o desfecho real fica em final_decision.
async function countAnaliseArquivadas(
  finalDecision: string,
  vendorId?: string,
  dateRange?: DateRangeValue,
): Promise<number> {
  let q = supabase
    .from('kanban_cards')
    .select('*', { count: 'exact', head: true })
    .eq('area', 'analise')
    .eq('final_decision', finalDecision)
    .not('archived_at', 'is', null)
    .is('deleted_at', null);
  if (vendorId) q = q.eq('assignee_id', vendorId);
  if (dateRange?.start) q = q.gte('archived_at', new Date(`${dateRange.start}T00:00:00`).toISOString());
  if (dateRange?.end)   q = q.lte('archived_at', new Date(`${dateRange.end}T23:59:59`).toISOString());
  const { count } = await q;
  return count ?? 0;
}

export async function getKPISnapshot(
  area: KanbanArea,
  vendorId?: string,
  dateRange?: DateRangeValue,
): Promise<KPISnapshot> {
  // Análise: KPIs lidos diretamente do histórico (archived_at), sem o RPC que
  // filtra archived_at IS NULL. Isso garante que fichas já finalizadas sejam
  // contadas corretamente.
  if (area === 'analise') {
    const vid = vendorId || undefined;
    const [recebidos, canceladas_analise, negados, aprovados] = await Promise.all([
      countAnaliseRecebidos(vid, dateRange),
      countAnaliseArquivadas('canceladas', vid, dateRange),
      countAnaliseArquivadas('negados', vid, dateRange),
      countAnaliseArquivadas('aprovados', vid, dateRange),
    ]);
    return { recebidos, canceladas_analise, negados, aprovados };
  }

  // Comercial — pipeline ativo via RPC + concluídas/canceladas via queries diretas.
  if (!vendorId) {
    const counts = await dashboardKanbanCounts('comercial', dateRange);
    counts.concluidas = await countComercialConcluidas(undefined, dateRange);
    counts.canceladas = await countComercialCanceladas(undefined, dateRange);
    return counts;
  }

  // Comercial filtrado por vendor: conta por stage no pipeline ativo.
  let q = supabase
    .from('kanban_cards')
    .select('stage')
    .eq('area', 'comercial')
    .eq('vendor_id', vendorId)
    .is('deleted_at', null)
    .is('archived_at', null);

  if (dateRange?.start) q = q.gte('created_at', new Date(`${dateRange.start}T00:00:00`).toISOString());
  if (dateRange?.end)   q = q.lte('created_at', new Date(`${dateRange.end}T23:59:59`).toISOString());

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const card of (data as { stage: string }[]) ?? []) {
    counts[card.stage] = (counts[card.stage] ?? 0) + 1;
  }
  counts.concluidas = await countComercialConcluidas(vendorId, dateRange);
  counts.canceladas = await countComercialCanceladas(vendorId, dateRange);
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
      preenchidas: 0,
      feitas: concluidas,
      aguardando: 0,
      canceladas: 0,
      aprovadas: 0,
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
      preenchidas: 0,
      feitas: counts.feitas,
      aguardando: counts.aguardando,
      canceladas: counts.canceladas,
      aprovadas: 0,
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
// Live pipeline (LiveKanbanTable) — kanban por colaborador com filtros opcionais.
// Comercial: feitas / aguardando / canceladas em area=comercial.
// Análise: em_analise+preenchidas / reanalise / negados em area=analise.
// ---------------------------------------------------------------------------
export async function getLivePipelineData(
  area: KanbanArea,
  vendorId?: string,
  dateRange?: DateRangeValue,
): Promise<GamificacaoRow[]> {
  const profileMap = await fetchProfiles();
  const userMap = new Map<string, { preenchidas: number; feitas: number; aguardando: number; canceladas: number; aprovadas: number }>();

  const ensure = (id: string) => {
    if (!userMap.has(id)) userMap.set(id, { preenchidas: 0, feitas: 0, aguardando: 0, canceladas: 0, aprovadas: 0 });
    return userMap.get(id)!;
  };

  if (area === 'analise') {
    let q = supabase
      .from('kanban_cards')
      .select('stage, assignee_id')
      .eq('area', 'analise')
      .is('deleted_at', null)
      .is('archived_at', null);
    if (vendorId) q = q.eq('assignee_id', vendorId);
    if (dateRange?.start) q = q.gte('created_at', new Date(`${dateRange.start}T00:00:00`).toISOString());
    if (dateRange?.end)   q = q.lte('created_at', new Date(`${dateRange.end}T23:59:59`).toISOString());

    const { data, error } = await q;
    if (error) throw new Error(error.message);

    for (const card of (data as { stage: string; assignee_id: string | null }[]) ?? []) {
      if (!card.assignee_id) continue;
      const cur = ensure(card.assignee_id);
      if (card.stage === 'preenchidas')  cur.preenchidas++;
      else if (card.stage === 'em_analise') cur.feitas++;
      else if (card.stage === 'reanalise')  cur.aguardando++;
      else if (card.stage === 'negados')    cur.canceladas++;
      else if (card.stage === 'aprovados')  cur.aprovadas++;
    }

    return Array.from(userMap.entries())
      .map(([userId, counts]) => ({
        user_id: userId,
        user_name: profileMap.get(userId) ?? 'Desconhecido',
        preenchidas: counts.preenchidas,
        feitas: counts.feitas,
        aguardando: counts.aguardando,
        canceladas: counts.canceladas,
        aprovadas: counts.aprovadas,
        total: counts.preenchidas + counts.feitas + counts.aguardando + counts.canceladas + counts.aprovadas,
      }))
      .sort((a, b) => b.total - a.total);
  }

  // ---------------------------------------------------------------------------
  // Comercial — 3 queries paralelas com fontes de dados distintas:
  // A) area='comercial': feitas + aguardando (pipeline ativo do vendedor)
  // B) area='analise', received_at IS NOT NULL: concluídas pelo vendedor
  // C) area='analise', stage='canceladas', received_at IS NULL: canceladas no fluxo comercial
  // Canceladas comerciais ficam em area='analise' porque a RPC change_stage
  // move o card de area ao cancelar (received_at IS NULL = nunca chegou à análise).
  // ---------------------------------------------------------------------------

  // A: pipeline ativo comercial
  let qA = supabase
    .from('kanban_cards')
    .select('stage, vendor_id')
    .eq('area', 'comercial')
    .is('deleted_at', null)
    .is('archived_at', null);
  if (vendorId) qA = qA.eq('vendor_id', vendorId);
  if (dateRange?.start) qA = qA.gte('created_at', new Date(`${dateRange.start}T00:00:00`).toISOString());
  if (dateRange?.end)   qA = qA.lte('created_at', new Date(`${dateRange.end}T23:59:59`).toISOString());

  // B: concluídas (enviadas à análise pelo vendedor no período)
  let qB = supabase
    .from('kanban_cards')
    .select('vendor_id')
    .eq('area', 'analise')
    .not('vendor_id', 'is', null)
    .not('received_at', 'is', null)
    .is('deleted_at', null)
    .is('archived_at', null);
  if (vendorId) qB = qB.eq('vendor_id', vendorId);
  if (dateRange?.start) qB = qB.gte('received_at', new Date(`${dateRange.start}T00:00:00`).toISOString());
  if (dateRange?.end)   qB = qB.lte('received_at', new Date(`${dateRange.end}T23:59:59`).toISOString());

  // C: canceladas no fluxo comercial (nunca chegaram à análise)
  let qC = supabase
    .from('kanban_cards')
    .select('vendor_id')
    .eq('stage', 'canceladas')
    .not('vendor_id', 'is', null)
    .is('received_at', null)
    .is('deleted_at', null);
  if (vendorId) qC = qC.eq('vendor_id', vendorId);
  if (dateRange?.start) qC = qC.gte('created_at', new Date(`${dateRange.start}T00:00:00`).toISOString());
  if (dateRange?.end)   qC = qC.lte('created_at', new Date(`${dateRange.end}T23:59:59`).toISOString());

  const [resA, resB, resC] = await Promise.all([qA, qB, qC]);
  if (resA.error) throw new Error(resA.error.message);
  if (resB.error) throw new Error(resB.error.message);
  if (resC.error) throw new Error(resC.error.message);

  for (const card of (resA.data as { stage: string; vendor_id: string }[]) ?? []) {
    const cur = ensure(card.vendor_id);
    if (card.stage === 'feitas')     cur.feitas++;
    else if (card.stage === 'aguardando') cur.aguardando++;
  }
  for (const card of (resB.data as { vendor_id: string }[]) ?? []) {
    ensure(card.vendor_id).aprovadas++;
  }
  for (const card of (resC.data as { vendor_id: string }[]) ?? []) {
    ensure(card.vendor_id).canceladas++;
  }

  return Array.from(userMap.entries())
    .map(([userId, counts]) => ({
      user_id: userId,
      user_name: profileMap.get(userId) ?? 'Desconhecido',
      preenchidas: counts.preenchidas,
      feitas: counts.feitas,
      aguardando: counts.aguardando,
      canceladas: counts.canceladas,
      aprovadas: counts.aprovadas,
      total: counts.feitas + counts.aguardando + counts.canceladas + counts.aprovadas,
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

const APROVADOS_STAGES = new Set(['aprovados']);
const NEGADOS_STAGES   = new Set(['negados']);
const CANCELADAS_STAGES = new Set(['canceladas']);

type BucketVal = { count: number; concluidas: number; aprovadas: number; negadas: number; canceladas: number };
const zeroBucket = (): BucketVal => ({ count: 0, concluidas: 0, aprovadas: 0, negadas: 0, canceladas: 0 });

function addCardToBucket(map: Map<string, BucketVal>, key: string, stage: string) {
  if (!map.has(key)) map.set(key, zeroBucket());
  const b = map.get(key)!;
  b.count++;
  if (APROVADOS_STAGES.has(stage))  b.aprovadas++;
  if (NEGADOS_STAGES.has(stage))    b.negadas++;
  if (CANCELADAS_STAGES.has(stage)) b.canceladas++;
}

function buildRangedSeries(
  cards: { ts: string; stage: string }[],
  range: DateRangeValue,
): BarPoint[] {
  const start = new Date(`${range.start}T00:00:00`);
  const end = range.end ? new Date(`${range.end}T23:59:59`) : new Date();
  const trunc = rangeToTrunc(start, end);
  const rawBuckets = generateBuckets(start, end, trunc);
  const buckets = new Map<string, BucketVal>(
    Array.from(rawBuckets.keys()).map((k) => [k, zeroBucket()]),
  );
  for (const card of cards) {
    const key = bucketKey(new Date(card.ts), trunc);
    if (buckets.has(key)) addCardToBucket(buckets, key, card.stage);
  }
  return Array.from(buckets.entries()).map(([label, b]) => ({ label, ...b }));
}

function buildAllTimeSeries(cards: { ts: string; stage: string }[]): BarPoint[] {
  const monthMap = new Map<string, { label: string } & BucketVal>();
  for (const card of cards) {
    const d = new Date(card.ts);
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' })
      .format(d)
      .replace('.', '');
    if (!monthMap.has(sortKey)) monthMap.set(sortKey, { label, ...zeroBucket() });
    const b = monthMap.get(sortKey)!;
    b.count++;
    if (APROVADOS_STAGES.has(card.stage))  b.aprovadas++;
    if (NEGADOS_STAGES.has(card.stage))    b.negadas++;
    if (CANCELADAS_STAGES.has(card.stage)) b.canceladas++;
  }
  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, entry]) => entry);
}

// ---------------------------------------------------------------------------
// Comercial time series — 3 queries paralelas com timestamps distintos:
// Fichas (created_at) | Canceladas (cancelled_at) | Concluídas (received_at)
// ---------------------------------------------------------------------------
async function getTimeSeriesComercial(
  range: DateRangeValue,
  vendorId?: string,
): Promise<BarPoint[]> {
  const hasRange = !!range.start;
  const start = hasRange ? new Date(`${range.start}T00:00:00`) : null;
  const end   = hasRange ? (range.end ? new Date(`${range.end}T23:59:59`) : new Date()) : null;

  // A: fichas criadas (todas, incluindo as que depois saíram do area=comercial)
  let qA = supabase
    .from('kanban_cards')
    .select('created_at')
    .not('vendor_id', 'is', null)
    .is('deleted_at', null);
  if (vendorId) qA = qA.eq('vendor_id', vendorId);
  if (start && end) qA = qA.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());

  // B: canceladas no fluxo comercial (received_at IS NULL = nunca chegou à análise)
  let qB = supabase
    .from('kanban_cards')
    .select('cancelled_at')
    .eq('stage', 'canceladas')
    .is('received_at', null)
    .is('deleted_at', null);
  if (vendorId) qB = qB.eq('vendor_id', vendorId);
  if (start && end) qB = qB.gte('cancelled_at', start.toISOString()).lte('cancelled_at', end.toISOString());

  // C: concluídas pelo vendedor (received_at preenchido = enviou para análise)
  let qC = supabase
    .from('kanban_cards')
    .select('received_at')
    .not('vendor_id', 'is', null)
    .not('received_at', 'is', null)
    .is('deleted_at', null);
  if (vendorId) qC = qC.eq('vendor_id', vendorId);
  if (start && end) qC = qC.gte('received_at', start.toISOString()).lte('received_at', end.toISOString());

  const [resA, resB, resC] = await Promise.all([qA, qB, qC]);
  if (resA.error) throw new Error(resA.error.message);
  if (resB.error) throw new Error(resB.error.message);
  if (resC.error) throw new Error(resC.error.message);

  type BucketMap = Map<string, BarPoint>;

  function makeBuckets(s: Date, e: Date): BucketMap {
    const trunc = rangeToTrunc(s, e);
    const raw = generateBuckets(s, e, trunc);
    return new Map(Array.from(raw.keys()).map((k) => [k, { label: k, count: 0, concluidas: 0, aprovadas: 0, negadas: 0, canceladas: 0 }]));
  }

  if (hasRange && start && end) {
    const trunc = rangeToTrunc(start, end);
    const buckets = makeBuckets(start, end);

    for (const c of resA.data as { created_at: string }[]) {
      const key = bucketKey(new Date(c.created_at), trunc);
      if (buckets.has(key)) buckets.get(key)!.count++;
    }
    for (const c of resB.data as { cancelled_at: string | null }[]) {
      if (!c.cancelled_at) continue;
      const key = bucketKey(new Date(c.cancelled_at), trunc);
      if (buckets.has(key)) buckets.get(key)!.canceladas++;
    }
    for (const c of resC.data as { received_at: string }[]) {
      const key = bucketKey(new Date(c.received_at), trunc);
      if (buckets.has(key)) buckets.get(key)!.concluidas++;
    }

    return Array.from(buckets.values());
  }

  // Sem range → agrupa por mês (all-time)
  const monthMap = new Map<string, BarPoint>();

  function ensureMonth(ts: string): BarPoint {
    const d = new Date(ts);
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap.has(sortKey)) {
      const label = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(d).replace('.', '');
      monthMap.set(sortKey, { label, count: 0, concluidas: 0, aprovadas: 0, negadas: 0, canceladas: 0 });
    }
    return monthMap.get(sortKey)!;
  }

  for (const c of resA.data as { created_at: string }[])            ensureMonth(c.created_at).count++;
  for (const c of resB.data as { cancelled_at: string | null }[]) { if (c.cancelled_at) ensureMonth(c.cancelled_at).canceladas++; }
  for (const c of resC.data as { received_at: string }[])           ensureMonth(c.received_at).concluidas++;

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, entry]) => entry);
}

export async function getTimeSeries(
  area: KanbanArea,
  range: DateRangeValue,
  vendorId?: string,
): Promise<BarPoint[]> {
  const hasRange = !!range.start;

  if (area === 'analise') {
    // Análise: bucketa por archived_at — mostra quando as fichas foram finalizadas.
    // Cards no histórico têm stage='finalizados'; o desfecho real fica em final_decision.
    let q = supabase
      .from('kanban_cards')
      .select('archived_at, final_decision')
      .eq('area', 'analise')
      .not('archived_at', 'is', null)
      .is('deleted_at', null);

    if (hasRange) {
      const start = new Date(`${range.start}T00:00:00`);
      const end = range.end ? new Date(`${range.end}T23:59:59`) : new Date();
      q = q.gte('archived_at', start.toISOString()).lte('archived_at', end.toISOString());
    }
    if (vendorId) q = q.eq('assignee_id', vendorId);

    const { data, error } = await q;
    if (error) throw new Error(error.message);

    const cards = (data as { archived_at: string; final_decision: string | null }[]).map((c) => ({
      ts: c.archived_at,
      stage: c.final_decision ?? '',
    }));

    return hasRange ? buildRangedSeries(cards, range) : buildAllTimeSeries(cards);
  }

  return getTimeSeriesComercial(range, vendorId);
}
