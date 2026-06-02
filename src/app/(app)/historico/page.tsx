'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye,
  RotateCw,
  Search as SearchIcon,
  X as XIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { pasteNormalizeSpaces } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFichaCache } from '@/hooks/useFichaCache';
import { fichaKeys } from '@/hooks/useFichaCache';
import { listProfiles, type ProfileLite } from '@/services/profiles';
import {
  listHistorico,
  type HistoricoRow,
} from '@/services/historico';
import { RestaurarFichaModal } from '@/features/historico/RestaurarFichaModal';
import {
  HistoricoFilterCTA,
  type HistoricoFiltersValue,
  type HistoricoStatus,
} from '@/features/historico/HistoricoFilterCTA';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  aprovado: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-700' },
  aprovados: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-700' },
  negado: { label: 'Negado', className: 'bg-red-100 text-red-700' },
  negados: { label: 'Negado', className: 'bg-red-100 text-red-700' },
  cancelada: { label: 'Cancelada', className: 'bg-zinc-200 text-zinc-700' },
  canceladas: { label: 'Cancelada', className: 'bg-zinc-200 text-zinc-700' },
};

function startOfDayUtcISO(date?: string | null): string | null {
  if (!date) return null;
  const d = new Date(`${date}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function endOfDayUtcISO(date?: string | null): string | null {
  if (!date) return null;
  const d = new Date(`${date}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalize(s: string | null | undefined): string {
  return (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function rowDecisionLabel(row: HistoricoRow): { label: string; tone: string } {
  const raw = row.final_decision?.toLowerCase().trim();
  const archivedCancelled =
    row.archived_at && !row.finalized_at ? 'cancelada' : null;
  const key = raw || archivedCancelled || '';
  const meta = STATUS_LABEL[key];
  if (meta) return { label: meta.label, tone: meta.className };
  return { label: '—', tone: 'bg-zinc-100 text-zinc-600' };
}

function rowDecisionDate(row: HistoricoRow): string {
  const iso = row.finalized_at ?? row.cancelled_at ?? null;
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
}

function HistoricoPageInner() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { queryClient } = useFichaCache();
  const searchParams = useSearchParams();

  // URL is the single source of truth for the search query.
  // `inputValue` mirrors what the user is typing; it only becomes the search
  // term when Enter is pressed or the clear button is clicked (both update URL).
  const urlBusca = searchParams.get('busca') ?? '';
  const [inputValue, setInputValue] = useState(urlBusca);

  // Keep the input in sync when the URL param changes externally (e.g. browser
  // back/forward, or "Ir até lá" navigation from Kanban).
  useEffect(() => {
    setInputValue(urlBusca);
  }, [urlBusca]);

  const [filters, setFilters] = useState<HistoricoFiltersValue>(() => {
    const status = (searchParams.get('status') ?? '') as HistoricoFiltersValue['status'];
    const dateStart = searchParams.get('dateStart') ?? undefined;
    const dateEnd = searchParams.get('dateEnd') ?? undefined;
    return {
      dateRange: dateStart ? { start: dateStart, end: dateEnd ?? dateStart } : undefined,
      status: (['aprovados', 'negados', 'canceladas'] as const).includes(status as never)
        ? status
        : '',
      responsavel: '',
    };
  });
  const dateRange = filters.dateRange;
  const status: HistoricoStatus = filters.status;
  const responsavel = filters.responsavel;

  // Server response
  const [rows, setRows] = useState<HistoricoRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [restore, setRestore] = useState<{
    cardId: string;
    name: string | null;
  } | null>(null);

  // fetchRows reads its `search` argument directly — no closure over `inputValue`
  // or `urlBusca`. Load effects pass the URL param explicitly.
  const fetchRows = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listHistorico({
        search,
        dateStart: startOfDayUtcISO(dateRange?.start),
        dateEnd: endOfDayUtcISO(dateRange?.end ?? dateRange?.start),
        status: status || null,
        responsavel: responsavel || null,
      });
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  }, [dateRange?.start, dateRange?.end, status, responsavel]);

  // This effect is the ONLY place that triggers server fetches.
  // It fires whenever the URL `busca` param or any filter changes.
  useEffect(() => {
    if (authLoading || !user) return;
    void fetchRows(urlBusca);
  }, [authLoading, user, urlBusca, fetchRows]);

  // Profiles for the responsavel filter — cached globally via fichaKeys.
  useEffect(() => {
    if (authLoading || !user) return;
    void (async () => {
      try {
        const p = await queryClient.fetchQuery({
          queryKey: fichaKeys.profiles(),
          queryFn: () => listProfiles(),
          staleTime: 5 * 60 * 1000,
        });
        setProfiles(p);
      } catch (e) {
        console.error('[historico] profiles', e);
      }
    })();
  }, [authLoading, user, queryClient]);

  // Debounce: after 350ms of no typing, push inputValue to the URL exactly
  // like Enter does. Guard prevents a redundant replace when the URL is
  // already up to date (e.g. the urlBusca→inputValue sync effect firing).
  const inputDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current);
    inputDebounceRef.current = setTimeout(() => {
      const trimmed = inputValue.trim();
      const params = new URLSearchParams(window.location.search);
      if (trimmed === (params.get('busca') ?? '')) return;
      if (trimmed) {
        params.set('busca', trimmed);
      } else {
        params.delete('busca');
      }
      const qs = params.toString();
      router.replace(qs ? `/historico?${qs}` : '/historico');
    }, 350);
    return () => {
      if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current);
    };
  }, [inputValue, router]);

  // Commit the current input to the URL — this triggers the fetch effect.
  const commitSearch = useCallback(() => {
    const trimmed = inputValue.trim();
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (trimmed) {
      current.set('busca', trimmed);
    } else {
      current.delete('busca');
    }
    router.replace(`/historico?${current.toString()}`);
  }, [inputValue, searchParams, router]);

  const clearSearch = useCallback(() => {
    setInputValue('');
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete('busca');
    const qs = current.toString();
    router.replace(qs ? `/historico?${qs}` : '/historico');
  }, [searchParams, router]);

  // Client-side narrow while typing (instant feedback without a roundtrip per
  // keystroke). The debounce above triggers a server refetch after 350ms.
  const filteredRows = useMemo(() => {
    if (!inputValue.trim()) return rows;
    const needle = normalize(inputValue);
    return rows.filter(
      (r) =>
        normalize(r.applicant_name).includes(needle) ||
        normalize(r.cpf_cnpj).includes(needle),
    );
  }, [inputValue, rows]);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header + filtros */}
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold text-zinc-800">Histórico</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPaste={pasteNormalizeSpaces}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitSearch();
              }}
              placeholder="Buscar por cliente ou documento…"
              className="h-9 w-72 rounded-md border border-zinc-300 bg-white pl-8 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
            {inputValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                aria-label="Limpar busca"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <HistoricoFilterCTA
            value={filters}
            onChange={(next) => setFilters(next)}
            profiles={profiles}
          />
        </div>
      </div>

      {/* Tabela — visual match com originui table-03 (striped, sem borders,
          headers em uppercase muted, primeira/última td com radius) */}
      <div className="relative w-full flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead
            className="[&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <tr className="hover:bg-transparent">
              <th className="w-12 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white">
                Ver
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white">
                Cliente
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white">
                Documento
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white">
                Status da análise
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white">
                Equipe Comercial
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white">
                Equipe Cadastro
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white">
                Data da Decisão
              </th>
              <th className="w-32 px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-white">
                Restaurar
              </th>
            </tr>
          </thead>
          {/* Spacer row to separate header from body, matches originui table-03 */}
          <tbody className="table-row h-2" aria-hidden="true" />
          <tbody className="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
            {loading && rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-12 text-center text-sm text-zinc-500">
                  Carregando histórico…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-3 py-12 text-center text-sm text-red-600">
                  {error}
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-12 text-center text-sm text-zinc-500">
                  Nenhuma ficha encontrada para os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const decision = rowDecisionLabel(row);
                return (
                  <tr
                    key={row.id}
                    className="border-none odd:bg-zinc-100/60 odd:hover:bg-zinc-100/60 hover:bg-transparent"
                  >
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const type =
                            row.person_type === 'PJ'
                              ? 'pj'
                              : row.person_type === 'Rural'
                                ? 'rural'
                                : 'pf';
                          window.open(
                            `/ficha/${type}/${row.applicant_id}?card=${row.id}`,
                            '_blank',
                            'noopener,noreferrer',
                          );
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:bg-emerald-100 hover:text-emerald-700"
                        aria-label={`Ver detalhes de ${row.applicant_name ?? 'ficha'}`}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="max-w-[260px] px-3 py-2.5 font-medium text-zinc-900">
                      <div
                        className="truncate"
                        title={row.applicant_name ?? undefined}
                      >
                        {row.applicant_name ?? '—'}
                      </div>
                    </td>
                    <td className="max-w-[180px] px-3 py-2.5 text-zinc-700">
                      <div className="truncate" title={row.cpf_cnpj ?? undefined}>
                        {row.cpf_cnpj ?? '—'}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${decision.tone}`}
                      >
                        {decision.label}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-3 py-2.5 text-zinc-700">
                      <div
                        className="truncate"
                        title={row.vendedor_name ?? undefined}
                      >
                        {row.vendedor_name ?? '—'}
                      </div>
                    </td>
                    <td className="max-w-[200px] px-3 py-2.5 text-zinc-700">
                      <div
                        className="truncate"
                        title={row.analista_name ?? undefined}
                      >
                        {row.analista_name ?? '—'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-zinc-700">
                      {rowDecisionDate(row)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setRestore({
                            cardId: row.id,
                            name: row.applicant_name,
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        Restaurar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Bottom spacer + footer com total — match originui table-03 */}
          <tbody className="table-row h-2" aria-hidden="true" />
          {filteredRows.length > 0 && (
            <tfoot className="bg-transparent">
              <tr className="hover:bg-transparent">
                <td
                  colSpan={7}
                  className="px-3 py-2 text-xs font-medium text-zinc-600"
                >
                  Total
                </td>
                <td className="px-3 py-2 text-right text-xs font-semibold text-zinc-700">
                  {filteredRows.length}{' '}
                  {filteredRows.length === 1 ? 'ficha' : 'fichas'}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Popover "Restaurar" */}
      <RestaurarFichaModal
        open={!!restore}
        onClose={() => setRestore(null)}
        cardId={restore?.cardId ?? ''}
        applicantName={restore?.name}
        onRestored={(area) => {
          window.open(
            area === 'analise' ? '/kanban/analise' : '/kanban/comercial',
            '_blank',
            'noopener,noreferrer',
          );
          void fetchRows(urlBusca);
        }}
      />
    </div>
  );
}

export default function HistoricoPage() {
  return (
    <Suspense>
      <HistoricoPageInner />
    </Suspense>
  );
}
