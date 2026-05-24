'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BarPoint } from '@/services/metricas';

type Props = { data: BarPoint[]; loading: boolean };

export function FichasBarChart({ data, loading }: Props) {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-zinc-800">Fichas criadas</h3>

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
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
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
              formatter={(v) => [v, 'Fichas']}
            />
            <Bar
              dataKey="count"
              name="Fichas"
              fill="var(--preto)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
