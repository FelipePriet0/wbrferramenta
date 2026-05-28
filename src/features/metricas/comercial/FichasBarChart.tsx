'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BarPoint } from '@/services/metricas';
import type { KanbanArea } from '@/lib/types';

type Props = { data: BarPoint[]; loading: boolean; area: KanbanArea };

const SERIES_COMERCIAL = [
  { key: 'count',      name: 'Fichas',     color: 'var(--preto)' },
  { key: 'canceladas', name: 'Canceladas', color: '#a1a1aa' },
  { key: 'concluidas', name: 'Concluídas', color: 'var(--color-primary)' },
] as const;

const SERIES_ANALISE = [
  { key: 'count',      name: 'Fichas',     color: 'var(--preto)' },
  { key: 'canceladas', name: 'Canceladas', color: '#a1a1aa' },
  { key: 'negadas',    name: 'Negadas',    color: '#dc2626' },
  { key: 'aprovadas',  name: 'Aprovadas',  color: 'var(--color-primary)' },
] as const;

export function FichasBarChart({ data, loading, area }: Props) {
  const series = area === 'comercial' ? SERIES_COMERCIAL : SERIES_ANALISE;
  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-zinc-800">Fichas por período</h3>

      {loading ? (
        <div className="flex h-[220px] items-center justify-center text-xs text-zinc-400">
          Carregando…
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-xs text-zinc-400">
          Sem dados para o período selecionado.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={40}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f4f4f5' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e4e4e7',
                fontSize: 12,
                padding: '6px 10px',
              }}
            />
            <Legend
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            {series.map(({ key, name, color }) => (
              <Bar
                key={key}
                dataKey={key}
                name={name}
                fill={color}
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
