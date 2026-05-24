'use client';

import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { KPISnapshot } from '@/services/metricas';
import type { KanbanArea } from '@/lib/types';

type Props = { kpi: KPISnapshot; loading: boolean; area: KanbanArea };

const HATCH_ID = 'canceladasHatch';
const LEGEND_HATCH_ID = 'legendHatch';

type SegmentConfig = {
  key: string;
  label: string;
  fill: string;
  dotColor: string;
  isHatch: boolean;
};

const COMERCIAL_SEGMENTS: SegmentConfig[] = [
  { key: 'concluidas', label: 'Concluídas', fill: 'var(--color-primary)', dotColor: 'var(--color-primary)', isHatch: false },
  { key: 'canceladas', label: 'Canceladas',  fill: `url(#${HATCH_ID})`,   dotColor: '#9ca3af',             isHatch: true  },
];

const ANALISE_SEGMENTS: SegmentConfig[] = [
  { key: 'aprovados', label: 'Aprovadas',  fill: 'var(--color-primary)', dotColor: 'var(--color-primary)', isHatch: false },
  { key: 'negados',   label: 'Negadas',    fill: `url(#${HATCH_ID})`,   dotColor: '#9ca3af',             isHatch: true  },
];

type HoveredSegment = { label: string; value: number; pct: number } | null;

export function ConversaoGauge({ kpi, loading, area }: Props) {
  const [hovered, setHovered] = useState<HoveredSegment>(null);
  const segments = area === 'comercial' ? COMERCIAL_SEGMENTS : ANALISE_SEGMENTS;

  const numeratorKey = area === 'comercial' ? 'concluidas' : 'aprovados';
  const denominatorKey = area === 'comercial' ? 'canceladas' : 'negados';

  const numerator = kpi[numeratorKey] ?? 0;
  const denominator = numerator + (kpi[denominatorKey] ?? 0);
  const taxa = denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

  const data = segments
    .map((seg) => ({ ...seg, value: kpi[seg.key] ?? 0 }))
    .filter((d) => d.value > 0);

  const chartData =
    denominator > 0
      ? data
      : [{ key: 'empty', label: '', fill: '#e4e4e7', dotColor: '#e4e4e7', isHatch: false, value: 1 }];

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-800">Taxa de conversão</h3>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-xs text-zinc-400">
          Carregando…
        </div>
      ) : (
        <>
          <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
            <defs>
              <pattern id={HATCH_ID} patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(-45)">
                <line x1="0" y1="0" x2="0" y2="7" stroke="#9ca3af" strokeWidth="2.5" />
              </pattern>
              <pattern id={LEGEND_HATCH_ID} patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(-45)">
                <line x1="0" y1="0" x2="0" y2="3" stroke="#9ca3af" strokeWidth="1.5" />
              </pattern>
            </defs>
          </svg>

          <div className="relative mt-3" style={{ height: 160 }}>
            {/* Tooltip customizado — fixo no topo, centralizado */}
            {hovered && (
              <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg">
                <p className="text-[11px] font-semibold text-zinc-600">{hovered.label}</p>
                <p className="text-lg font-bold leading-tight text-zinc-900">{hovered.value}</p>
                <p className="text-[11px] text-zinc-400">{hovered.pct}%</p>
              </div>
            )}

            <ResponsiveContainer width="100%" height={160}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={62}
                  outerRadius={100}
                  cornerRadius={8}
                  paddingAngle={denominator > 0 ? 2 : 0}
                  dataKey="value"
                  stroke="none"
                  onMouseEnter={(data) => {
                    if (denominator > 0) {
                      const d = data as unknown as { label: string; value: number };
                      setHovered({
                        label: d.label,
                        value: d.value,
                        pct: Math.round((d.value / denominator) * 100),
                      });
                    }
                  }}
                  onMouseLeave={() => setHovered(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center pb-1">
              <span className="text-3xl font-bold leading-none text-zinc-900">{taxa}%</span>
              <span className="mt-1 text-[11px] text-zinc-400">Taxa atual</span>
            </div>
          </div>

          {denominator > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
              {data.map((d) => (
                <div key={d.key} className="flex items-center gap-1.5">
                  {d.isHatch ? (
                    <svg width={10} height={10} viewBox="0 0 10 10" className="shrink-0">
                      <circle cx="5" cy="5" r="5" fill={`url(#${LEGEND_HATCH_ID})`} />
                    </svg>
                  ) : (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.dotColor }} />
                  )}
                  <span className="text-[11px] text-zinc-500">{d.label}</span>
                </div>
              ))}
            </div>
          )}

          {denominator === 0 && (
            <p className="mt-4 text-center text-xs text-zinc-400">Sem desfechos registrados ainda.</p>
          )}
        </>
      )}
    </div>
  );
}
