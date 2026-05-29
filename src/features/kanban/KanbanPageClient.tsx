'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X as XIcon } from 'lucide-react';
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard';
import { NovaFichaCTA } from '@/features/cadastro/components/NovaFichaCTA';
import { FilterCTA, type AppliedFilters } from '@/components/app/filter-cta';
import { useAuth } from '@/components/providers/AuthProvider';
import { listCards } from '@/services/kanban';
import { pasteNormalizeSpaces } from '@/lib/utils';
import { listHistorico } from '@/services/historico';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

type FoundElsewhere =
  | { kind: 'other-tab'; area: 'analise' }
  | { kind: 'historico' };

function KanbanPageInner() {
  const { role } = useAuth();
  const readOnly = role === 'leitor';
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get('busca') ?? '',
  );
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get('busca') ?? '',
  );
  const [filters, setFilters] = useState<AppliedFilters>({ responsaveis: [] });
  const [foundElsewhere, setFoundElsewhere] = useState<FoundElsewhere | null>(null);

  // Refs instead of state: no re-render on toggle → no new handleNoResults
  // reference → no re-entrancy loop in the board's onNoResults effect.
  const checkingRef = useRef(false);
  const activeTermRef = useRef('');
  const suppressedTermRef = useRef('');

  // Debounce searchInput → searchTerm (350ms)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      suppressedTermRef.current = '';
      setSearchTerm(searchInput);
      setFoundElsewhere(null);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const handleNoResults = useCallback(
    async (term: string) => {
      if (checkingRef.current) return;
      if (term === suppressedTermRef.current) return;
      checkingRef.current = true;
      activeTermRef.current = term;
      try {
        const [otherCards, historicoRows] = await Promise.all([
          listCards('analise', { searchTerm: term }),
          listHistorico({ search: term }),
        ]);
        // Discard stale results if the search was cleared while in-flight.
        if (activeTermRef.current !== term) return;
        if (otherCards.length > 0) {
          setFoundElsewhere({ kind: 'other-tab', area: 'analise' });
        } else if (historicoRows.length > 0) {
          setFoundElsewhere({ kind: 'historico' });
        }
      } catch {
        // silently ignore lookup errors
      } finally {
        checkingRef.current = false;
      }
    },
    [],
  );

  const handleGoElsewhere = () => {
    if (!foundElsewhere) return;

    const term = searchTerm;
    // Suppress re-trigger: if the user comes back with this term still in the
    // input, handleNoResults will skip it rather than re-opening the dialog.
    suppressedTermRef.current = term;
    activeTermRef.current = '';
    setFoundElsewhere(null);

    if (foundElsewhere.kind === 'other-tab') {
      const qs = searchParams.toString();
      router.push(`/kanban/analise${qs ? `?${qs}` : ''}`);
    } else {
      router.push(
        `/historico${term ? `?busca=${encodeURIComponent(term)}` : ''}`,
      );
    }
  };

  const dialogTitle =
    foundElsewhere?.kind === 'other-tab'
      ? 'Essa ficha está na aba Análise'
      : 'Essa ficha está finalizada em Histórico';

  return (
    <section
      id="kanban-page-root"
      className="flex h-full min-h-0 flex-1 flex-col"
    >
      {/* Header: grid 3 colunas (1fr | auto | 1fr) para que as abas
          fiquem sempre centradas e os chips nunca invadam o centro. */}
      <div className="mb-4 grid items-start gap-4" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
        {/* Esquerda — cresce livremente dentro do 1fr */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPaste={pasteNormalizeSpaces}
              placeholder="Buscar por cliente…"
              className="h-9 w-60 rounded-md border border-zinc-300 bg-white pl-8 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchTerm('');
                  setFoundElsewhere(null);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                aria-label="Limpar busca"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <FilterCTA searchTerm={searchTerm} onFiltersChange={setFilters} />
        </div>

        {/* Centro: abas — coluna auto, sempre centralizada */}
        <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5">
          <button
            type="button"
            className="rounded-md px-4 py-1.5 text-sm font-medium shadow-sm transition-colors"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            aria-current="page"
          >
            Comercial
          </button>
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('busca');
              const qs = params.toString();
              router.push(`/kanban/analise${qs ? `?${qs}` : ''}`);
            }}
            className="rounded-md px-4 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-[#FF6600] hover:text-white"
          >
            Análise
          </button>
        </div>

        {/* Direita — alinhado à direita dentro do 1fr */}
        <div className="flex justify-end">
          {!readOnly && <NovaFichaCTA />}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <KanbanBoard
          area="comercial"
          readOnly={readOnly}
          filters={filters}
          onNoResults={handleNoResults}
        />
      </div>

      {/* Dialog: ficha encontrada em outro lugar */}
      <Dialog
        open={!!foundElsewhere}
        onOpenChange={(open) => {
          if (!open) {
            activeTermRef.current = '';
            setFoundElsewhere(null);
            setSearchInput('');
            setSearchTerm('');
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleGoElsewhere}
              className="rounded-md px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Ir até lá
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function KanbanPageClient() {
  return (
    <Suspense>
      <KanbanPageInner />
    </Suspense>
  );
}
