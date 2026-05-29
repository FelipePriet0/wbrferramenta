'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ban,
  CheckCircle2,
  Clock4,
  FileCheck,
  FileText,
  FolderOpen,
  Inbox,
  LayoutDashboard,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import type { DateRangeValue } from '@/components/ui/date-range-popover';
import { KPICard } from '@/features/metricas/KPICard';
import { ColaboradorFilter } from '@/features/metricas/ColaboradorFilter';
import { PeriodFilter } from '@/features/metricas/PeriodFilter';
import { LiveKanbanTable } from '@/features/metricas/LiveKanbanTable';
import { GamificacaoTable } from '@/features/metricas/comercial/GamificacaoTable';
import { FichasBarChart } from '@/features/metricas/comercial/FichasBarChart';
import { ConversaoGauge } from '@/features/metricas/comercial/ConversaoGauge';
import {
  getKPISnapshot,
  getTimeSeries,
  type KPISnapshot,
  type BarPoint,
} from '@/services/metricas';

type Tab = 'comercial' | 'analise';

function defaultRange(): DateRangeValue {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: fmt(start), end: fmt(now) };
}

function buildHistoricoUrl(
  status: 'canceladas' | 'aprovados' | 'negados' | null,
  dateRange: DateRangeValue,
): string {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (dateRange.start) {
    params.set('dateStart', dateRange.start);
    params.set('dateEnd', dateRange.end ?? dateRange.start);
  }
  return `/historico?${params.toString()}`;
}

export default function MetricasPage() {
  const { role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('comercial');
  const [dateRange, setDateRange] = useState<DateRangeValue>(defaultRange);
  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');

  const [kpi, setKpi] = useState<KPISnapshot>({});
  const [kpiLoading, setKpiLoading] = useState(true);

  const [timeSeries, setTimeSeries] = useState<BarPoint[]>([]);
  const [tsLoading, setTsLoading] = useState(true);

  const loadKPI = useCallback(async () => {
    setKpiLoading(true);
    try {
      const data = await getKPISnapshot(tab, vendorId || undefined, dateRange);
      setKpi(data);
    } catch (e) {
      console.error('[metricas] kpi', e);
    } finally {
      setKpiLoading(false);
    }
  }, [tab, vendorId, dateRange]);

  const loadTimeSeries = useCallback(async () => {
    setTsLoading(true);
    try {
      const data = await getTimeSeries(tab, dateRange, vendorId || undefined);
      setTimeSeries(data);
    } catch (e) {
      console.error('[metricas] ts', e);
    } finally {
      setTsLoading(false);
    }
  }, [tab, dateRange, vendorId]);

  useEffect(() => {
    if (authLoading || role !== 'gestor') return;
    void loadKPI();
  }, [authLoading, role, loadKPI]);

  useEffect(() => {
    if (authLoading || role !== 'gestor') return;
    void loadTimeSeries();
  }, [authLoading, role, loadTimeSeries]);

  // Ref estável → sempre aponta para os loaders com os filtros mais recentes
  const loadersRef = useRef({ loadKPI, loadTimeSeries });
  useEffect(() => {
    loadersRef.current = { loadKPI, loadTimeSeries };
  }, [loadKPI, loadTimeSeries]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onRealtimeChange = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const { loadKPI: kpi, loadTimeSeries: ts } = loadersRef.current;
      void kpi();
      void ts();
    }, 300);
  }, []);

  useEffect(() => {
    if (role !== 'gestor') return;
    const channel = supabase
      .channel('metricas-kpi-ts')
      .on(
        'postgres_changes' as never,
        { event: '*', schema: 'public', table: 'kanban_cards' } as never,
        () => { onRealtimeChange(); },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [role, onRealtimeChange]);

  if (authLoading) return null;

  if (role !== 'gestor') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-500">
        <LayoutDashboard className="h-10 w-10 text-zinc-300" />
        <p className="text-sm">Acesso restrito a gestores.</p>
      </div>
    );
  }

  const isComercial = tab === 'comercial';

  return (
    <div className="flex flex-col gap-5">
      {/* Header: filtros (esquerda) + tabs centralizadas */}
      <div className="relative flex items-center justify-center">
        {/* Filtros — ancorados à esquerda */}
        <div className="absolute left-0 flex items-center gap-2">
          <ColaboradorFilter
            value={vendorId}
            label={vendorName}
            area={tab}
            onChange={(id, name) => {
              setVendorId(id);
              setVendorName(name);
            }}
          />
          <PeriodFilter dateRange={dateRange} onChange={setDateRange} />
        </div>

        {/* Tabs Comercial | Análise — centro da página */}
        <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5">
          {(['comercial', 'analise'] as Tab[]).map((t) => {
            const isActive = tab === t;
            const activeBg = t === 'comercial' ? 'var(--color-primary)' : '#FF6600';
            return (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setVendorId(''); setVendorName(''); }}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'shadow-sm' : 'text-zinc-500'
                }`}
                style={isActive ? { backgroundColor: activeBg, color: 'white' } : undefined}
              >
                {t === 'comercial' ? 'Comercial' : 'Análise'}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      {isComercial ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KPICard
            title="Não enviadas"
            value={kpiLoading ? '—' : ((kpi.entrada ?? 0) + (kpi.feitas ?? 0) + (kpi.aguardando ?? 0))}
            subtitle="Total em fluxo (pipeline ativo)"
            icon={FolderOpen}
            tone="featured"
          />
          <KPICard
            title="Em Entrada"
            value={kpiLoading ? '—' : (kpi.entrada ?? 0)}
            subtitle="Aguardando início"
            icon={Inbox}
            tone="neutral"
          />
          <KPICard
            title="Feitas"
            value={kpiLoading ? '—' : (kpi.feitas ?? 0)}
            subtitle="Prontas para envio"
            icon={FileCheck}
            tone="good"
          />
          <KPICard
            title="Aguard. Docs"
            value={kpiLoading ? '—' : (kpi.aguardando ?? 0)}
            subtitle="Pendentes de documentação"
            icon={Clock4}
            tone="warn"
          />
          <KPICard
            title="Canceladas"
            value={kpiLoading ? '—' : (kpi.canceladas ?? 0)}
            subtitle="Clique para ver no histórico"
            icon={Ban}
            tone="bad"
            onClick={() => router.push(buildHistoricoUrl('canceladas', dateRange))}
          />
          <KPICard
            title="Concluídas"
            value={kpiLoading ? '—' : (kpi.concluidas ?? 0)}
            subtitle="Clique para ver no histórico"
            icon={CheckCircle2}
            tone="good"
            onClick={() => router.push(buildHistoricoUrl(null, dateRange))}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KPICard
            title="Recebidos"
            value={kpiLoading ? '—' : (kpi.recebidos ?? 0)}
            subtitle="Total recebido pela análise"
            icon={Inbox}
            tone="featured"
          />
          <KPICard
            title="Canceladas"
            value={kpiLoading ? '—' : (kpi.canceladas_analise ?? 0)}
            subtitle="Canceladas durante análise"
            icon={Ban}
            tone="bad"
          />
          <KPICard
            title="Negadas"
            value={kpiLoading ? '—' : (kpi.negados ?? 0)}
            subtitle="Clique para ver no histórico"
            icon={FileCheck}
            tone="bad"
            onClick={() => router.push(buildHistoricoUrl('negados', dateRange))}
          />
          <KPICard
            title="Aprovadas"
            value={kpiLoading ? '—' : (kpi.aprovados ?? 0)}
            subtitle="Clique para ver no histórico"
            icon={CheckCircle2}
            tone="good"
            onClick={() => router.push(buildHistoricoUrl('aprovados', dateRange))}
          />
        </div>
      )}

      {isComercial ? (
        /* Comercial: ranking ocupa coluna direita, live kanban abaixo dos charts */
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FichasBarChart data={timeSeries} loading={tsLoading} area={tab} />
              </div>
              <ConversaoGauge kpi={kpi} loading={kpiLoading} area={tab} />
            </div>
            <LiveKanbanTable area={tab} vendorId={vendorId} dateRange={dateRange} />
          </div>
          <div className="self-start">
            <GamificacaoTable area={tab} dateRange={dateRange} />
          </div>
        </div>
      ) : (
        /* Análise: sem ranking, live kanban abaixo dos charts */
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <FichasBarChart data={timeSeries} loading={tsLoading} area={tab} />
            </div>
            <ConversaoGauge kpi={kpi} loading={kpiLoading} area={tab} />
          </div>
          <LiveKanbanTable area={tab} dateRange={dateRange} />
        </>
      )}
    </div>
  );
}
