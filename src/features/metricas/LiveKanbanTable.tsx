'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock4, Ban, FileText, ThumbsUp } from 'lucide-react';
import type { KanbanArea } from '@/lib/types';
import type { DateRangeValue } from '@/components/ui/date-range-popover';
import { getLivePipelineData, type GamificacaoRow } from '@/services/metricas';
import { UserAvatar } from '@/components/ui/avatar';
import { useTableChanges } from '@/components/providers/RealtimeProvider';

type Props = { area: KanbanArea; vendorId?: string; dateRange: DateRangeValue };

const COLSPAN = { comercial: 7, analise: 8 } as const;

export function LiveKanbanTable({ area, vendorId, dateRange }: Props) {
  const [rows, setRows] = useState<GamificacaoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const colSpan = COLSPAN[area];

  const refresh = useCallback(async () => {
    try {
      const data = await getLivePipelineData(area, vendorId || undefined, dateRange?.start ? dateRange : undefined);
      setRows(data);
    } catch (e) {
      console.error('[LiveKanbanTable]', e);
    } finally {
      setLoading(false);
    }
  }, [area, vendorId, dateRange]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useTableChanges({
    channelName: `live-kanban-${area}`,
    table: 'kanban_cards',
    filter: `area=eq.${area}`,
    onChange: () => void refresh(),
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <h3 className="text-sm font-semibold text-zinc-800">Kanban Live</h3>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">#</th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Colaborador</th>
              {area === 'analise' ? (
                <>
                  <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Preenchidas</th>
                  <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Em Análise</th>
                  <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Reanálise</th>
                  <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Negadas</th>
                  <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Aprovadas</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Feitas</th>
                  <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Aguard. Docs</th>
                  <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Canceladas</th>
                  <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Concluídas</th>
                </>
              )}
              <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-xs text-zinc-400">Carregando…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-xs text-zinc-400">Nenhum colaborador com fichas ativas.</td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.user_id} className="border-b border-zinc-50 odd:bg-zinc-50/40 hover:bg-zinc-50">
                  <td className="px-4 py-2.5 text-xs font-medium text-zinc-400">{i + 1}</td>
                  <td className="max-w-[200px] px-4 py-2.5 font-medium text-zinc-800">
                    <div className="flex items-center gap-2 truncate">
                      <UserAvatar name={row.user_name} size="xs" className="flex-shrink-0" />
                      <span className="truncate">{row.user_name}</span>
                    </div>
                  </td>
                  {area === 'analise' ? (
                    <>
                      <td className="px-4 py-2.5 text-center text-sm tabular-nums text-zinc-500">
                        <div className="flex items-center justify-center gap-1">
                          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                          {row.preenchidas}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm tabular-nums text-blue-600">
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                          {row.feitas}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm tabular-nums text-amber-700">
                        <div className="flex items-center justify-center gap-1">
                          <Clock4 className="h-3.5 w-3.5 flex-shrink-0" />
                          {row.aguardando}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm tabular-nums text-red-600">
                        <div className="flex items-center justify-center gap-1">
                          <Ban className="h-3.5 w-3.5 flex-shrink-0" />
                          {row.canceladas}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm tabular-nums text-emerald-700">
                        <div className="flex items-center justify-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5 flex-shrink-0" />
                          {row.aprovadas}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 text-center text-sm tabular-nums text-emerald-700">
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                          {row.feitas}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm tabular-nums text-amber-700">
                        <div className="flex items-center justify-center gap-1">
                          <Clock4 className="h-3.5 w-3.5 flex-shrink-0" />
                          {row.aguardando}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm tabular-nums text-red-600">
                        <div className="flex items-center justify-center gap-1">
                          <Ban className="h-3.5 w-3.5 flex-shrink-0" />
                          {row.canceladas}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm tabular-nums text-blue-600">
                        <div className="flex items-center justify-center gap-1">
                          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                          {row.aprovadas}
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-2.5 text-center text-sm font-semibold tabular-nums text-zinc-900">
                    {row.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-zinc-100 bg-zinc-50">
                <td colSpan={2} className="px-4 py-2 text-xs font-medium text-zinc-500">Total geral</td>
                {area === 'analise' ? (
                  <>
                    <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-zinc-500">
                      {rows.reduce((s, r) => s + r.preenchidas, 0)}
                    </td>
                    <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-blue-600">
                      {rows.reduce((s, r) => s + r.feitas, 0)}
                    </td>
                    <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-amber-700">
                      {rows.reduce((s, r) => s + r.aguardando, 0)}
                    </td>
                    <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-red-600">
                      {rows.reduce((s, r) => s + r.canceladas, 0)}
                    </td>
                    <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-emerald-700">
                      {rows.reduce((s, r) => s + r.aprovadas, 0)}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-emerald-700">
                      {rows.reduce((s, r) => s + r.feitas, 0)}
                    </td>
                    <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-amber-700">
                      {rows.reduce((s, r) => s + r.aguardando, 0)}
                    </td>
                    <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-red-600">
                      {rows.reduce((s, r) => s + r.canceladas, 0)}
                    </td>
                    <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-blue-600">
                      {rows.reduce((s, r) => s + r.aprovadas, 0)}
                    </td>
                  </>
                )}
                <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-zinc-900">
                  {rows.reduce((s, r) => s + r.total, 0)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
