'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UserAvatar } from '@/components/ui/avatar';
import { getLiveTableData, type GamificacaoRow } from '@/services/metricas';
import type { KanbanArea } from '@/lib/types';

type Props = {
  area: KanbanArea;
  vendorId?: string;
  refreshKey?: number;
};

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const MEDALS = ['🥇', '🥈', '🥉'];

const ROW_BG: Record<number, string> = {
  0: 'bg-amber-50 hover:bg-amber-100/70',
  1: 'bg-zinc-100/80 hover:bg-zinc-200/60',
  2: 'bg-orange-50 hover:bg-orange-100/70',
};

export function GamificacaoTable({ area, vendorId, refreshKey }: Props) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [rows, setRows] = useState<GamificacaoRow[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const selectedDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const isCurrentMonth = monthOffset === 0;

  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
    .format(selectedDate)
    .replace(/^\w/, (c) => c.toUpperCase());

  const rangeStart = fmtDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const rangeEnd = fmtDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLiveTableData(area, vendorId || undefined, { start: rangeStart, end: rangeEnd });
      setRows(data);
    } catch (e) {
      console.error('[GamificacaoTable]', e);
    } finally {
      setLoading(false);
    }
  }, [area, vendorId, rangeStart, rangeEnd]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="rounded-t-xl px-4 py-3" style={{ background: 'var(--preto)' }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">🏆</span>
            <h3 className="text-base font-bold text-white">Ranking Mensal Mznet</h3>
          </div>

          {/* Navegação de mês */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setMonthOffset((o) => o - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[72px] text-center text-sm font-semibold text-white">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => setMonthOffset((o) => o + 1)}
              disabled={isCurrentMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/80 transition hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-xs text-zinc-400">
            Carregando…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-xs text-zinc-400">
            Nenhuma ficha concluída em {monthLabel}.
          </div>
        ) : (
          <ul>
            {rows.map((row, i) => (
              <li
                key={row.user_id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  ROW_BG[i] ?? 'hover:bg-zinc-50'
                } ${i < rows.length - 1 ? 'border-b border-zinc-50' : ''}`}
              >
                {/* Posição */}
                <div className="flex w-7 flex-shrink-0 items-center justify-center">
                  {i < 3 ? (
                    <span className="text-xl leading-none">{MEDALS[i]}</span>
                  ) : (
                    <span className="text-sm font-semibold text-zinc-400">{i + 1}</span>
                  )}
                </div>

                {/* Avatar + Nome + badge */}
                <UserAvatar name={row.user_name} size="xs" className="flex-shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-zinc-800">
                    {row.user_name}
                  </span>
                  {row.feitas > 0 && (
                    <span className="w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      +{row.feitas} concluídas
                    </span>
                  )}
                </div>

                {/* Total */}
                <span
                  className="flex-shrink-0 rounded-md px-2.5 py-1 text-sm font-bold tabular-nums text-white"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {row.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
