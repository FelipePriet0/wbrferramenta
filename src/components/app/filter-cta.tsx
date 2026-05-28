'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  AtSign,
  Calendar,
  ListFilter,
  X as XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { type DateRangeValue } from '@/components/ui/date-range-popover';
import Filters, {
  AnimateChangeInHeight,
  Filter,
  FilterOperator,
  FilterOption,
  FilterType,
  filterViewOptions,
  filterViewToFilterOptions,
} from '@/components/ui/filters';
import { UserAvatar } from '@/components/ui/avatar';
import { KanbanRangeCalendar } from '@/components/app/kanban-range-calendar';
import { cn } from '@/lib/utils';
import { listProfiles } from '@/services/profiles';

type CachedResponsavel = {
  id: string | null;
  full_name: string | null;
  role: string | null;
};

export type AppliedFilters = {
  responsaveis: string[];
  prazo?: { start: string; end?: string };
  hora?: string[];
  myMentions?: boolean;
  searchTerm?: string;
};

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function getResponsavelIcon(name: string | undefined | null) {
  if (!name) return undefined;
  return <UserAvatar name={name} size="xs" />;
}

function buildResponsavelOptions(profiles: CachedResponsavel[]): FilterOption[] {
  const seen = new Set<string>();
  const unique: CachedResponsavel[] = [];
  for (const p of profiles) {
    const id = p.id ?? undefined;
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(p);
  }
  return unique.map((profile) => ({
    name: profile.full_name ?? '—',
    icon: getResponsavelIcon(profile.full_name ?? undefined),
    value: profile.id ?? undefined,
  }));
}

export function FilterCTA({
  onFiltersChange,
  searchTerm: searchTermProp,
}: {
  onFiltersChange?: (filters: AppliedFilters) => void;
  searchTerm?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = React.useState(false);
  const [selectedView, setSelectedView] = React.useState<FilterType | null>(null);
  const [commandInput, setCommandInput] = React.useState('');
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const [filters, setFilters] = React.useState<Filter[]>(() => {
    const initial: Filter[] = [];
    const hora = searchParams.get('hora');
    const prazoInicio = searchParams.get('prazo');
    const prazoFim = searchParams.get('prazo_fim');
    const responsavel = searchParams.get('responsavel');
    if (hora) {
      initial.push({
        id: 'hora',
        type: FilterType.HORARIO,
        operator: FilterOperator.IS,
        value: hora.split(',').map((h) => (h.length === 5 ? h : h.slice(0, 5))),
      });
    }
    if (prazoInicio) {
      const start = prazoInicio.trim();
      const end = prazoFim?.trim();
      if (start) {
        const values =
          end && end !== start
            ? start < end ? [start, end] : [end, start]
            : [start];
        initial.push({
          id: 'prazo',
          type: FilterType.PRAZO,
          operator: FilterOperator.IS,
          value: values,
        });
      }
    }
    if (responsavel) {
      const ids = responsavel.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        initial.push({
          id: 'responsavel',
          type: FilterType.RESPONSAVEL,
          operator: FilterOperator.IS,
          value: ids,
        });
      }
    }
    return initial;
  });
  const [responsavelOptions, setResponsavelOptions] = React.useState<FilterOption[]>(
    filterViewToFilterOptions[FilterType.RESPONSAVEL],
  );
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [popoverRect, setPopoverRect] = React.useState<DOMRect | null>(null);
  const calendarContainerRef = React.useRef<HTMLDivElement | null>(null);
  const popoverContentRef = React.useRef<HTMLDivElement | null>(null);

  const updatePopoverRect = React.useCallback(() => {
    if (popoverContentRef.current) {
      setPopoverRect(popoverContentRef.current.getBoundingClientRect());
    }
  }, []);

  // Keep clicks inside the side calendar from closing the popover.
  const handleCalendarInteractOutside = React.useCallback((event: Event) => {
    const customEvent = event as unknown as {
      target: EventTarget;
      detail?: { originalEvent?: Event };
      preventDefault: () => void;
    };
    const originalEvent = customEvent.detail?.originalEvent ?? (event as Event);
    const target = (originalEvent?.target ?? customEvent.target) as Node | null;
    if (target && calendarContainerRef.current?.contains(target)) {
      customEvent.preventDefault();
    }
  }, []);

  const animationFrameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!open && !calendarOpen) return;
    updatePopoverRect();
    if (!calendarOpen) return;
    let observer: ResizeObserver | null = null;
    if (typeof window !== 'undefined') {
      observer = new ResizeObserver(() => updatePopoverRect());
      if (popoverContentRef.current) {
        observer.observe(popoverContentRef.current);
      }
      window.addEventListener('resize', updatePopoverRect);
      window.addEventListener('scroll', updatePopoverRect, true);
      const loop = () => {
        updatePopoverRect();
        animationFrameRef.current = requestAnimationFrame(loop);
      };
      animationFrameRef.current = requestAnimationFrame(loop);
    }
    return () => {
      observer?.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updatePopoverRect);
        window.removeEventListener('scroll', updatePopoverRect, true);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    };
  }, [calendarOpen, open, updatePopoverRect]);

  // Load profiles for the Responsável filter, with sessionStorage cache.
  React.useEffect(() => {
    let mounted = true;
    async function loadResponsaveis() {
      const cacheKey = 'responsavel-options-all';
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as CachedResponsavel[];
            const options = buildResponsavelOptions(parsed);
            if (options.length > 0 && mounted) {
              filterViewToFilterOptions[FilterType.RESPONSAVEL] = options;
              setResponsavelOptions(options);
              return;
            }
          } catch (err) {
            console.warn('[filter] bad responsavel cache', err);
          }
        }
        const profiles = await listProfiles({
          roles: ['vendedor', 'analista', 'gestor'],
        });
        const cachedProfiles: CachedResponsavel[] = profiles.map((p) => ({
          id: p.id,
          full_name: p.full_name,
          role: p.role,
        }));
        const options = buildResponsavelOptions(cachedProfiles);
        if (mounted) {
          filterViewToFilterOptions[FilterType.RESPONSAVEL] = options;
          setResponsavelOptions(options);
          sessionStorage.setItem(cacheKey, JSON.stringify(cachedProfiles));
        }
      } catch (err) {
        console.error('[filter] loadResponsaveis', err);
        if (mounted) {
          const fallback = buildResponsavelOptions([]);
          filterViewToFilterOptions[FilterType.RESPONSAVEL] = fallback;
          setResponsavelOptions(fallback);
        }
      }
    }
    loadResponsaveis();
    return () => {
      mounted = false;
    };
  }, []);


  const searchParamsStr = React.useMemo(
    () => searchParams?.toString() ?? '',
    [searchParams],
  );
  const [myMentions, setMyMentions] = React.useState<boolean>(
    () => searchParams.get('minhas_mencoes') === '1',
  );

  const prazoFilter = React.useMemo(
    () => filters.find((f) => f.type === FilterType.PRAZO),
    [filters],
  );
  const prazoValues = prazoFilter?.value ?? [];
  const prazoStartValue = prazoValues[0];
  const prazoEndValue = prazoValues[1];

  const prazoRange = React.useMemo<DateRangeValue>(
    () => ({ start: prazoStartValue, end: prazoEndValue }),
    [prazoStartValue, prazoEndValue],
  );

  const handlePrazoChange = React.useCallback((next: DateRangeValue) => {
    const nextStart = next.start?.trim();
    const nextEnd = next.end?.trim();
    setFilters((prev) => {
      const index = prev.findIndex((f) => f.type === FilterType.PRAZO);
      if (!nextStart) {
        if (index === -1) return prev;
        const clone = [...prev];
        clone.splice(index, 1);
        return clone;
      }
      const inOrder =
        nextEnd && nextStart && nextEnd < nextStart
          ? [nextEnd, nextStart]
          : [nextStart, nextEnd];
      const sanitized = inOrder.filter(Boolean) as string[];
      if (index === -1) {
        return [
          ...prev,
          {
            id: 'prazo',
            type: FilterType.PRAZO,
            operator: FilterOperator.IS,
            value: sanitized.length === 1 ? [sanitized[0]] : sanitized,
          },
        ];
      }
      const clone = [...prev];
      clone[index] = {
        ...clone[index],
        value: sanitized.length === 1 ? [sanitized[0]] : sanitized,
      };
      return clone;
    });
  }, []);

  // Push filter state into URL params + emit onFiltersChange to consumers.
  // searchTermProp comes from the parent's standalone search input.
  React.useEffect(() => {
    const params = new URLSearchParams(searchParamsStr);

    const horaFilter = filters.find((f) => f.type === FilterType.HORARIO);
    const horas = (horaFilter?.value ?? []).filter(Boolean);

    const responsavelFilter = filters.find((f) => f.type === FilterType.RESPONSAVEL);
    const responsavelIds = Array.from(
      new Set(responsavelFilter?.value?.filter(Boolean) ?? []),
    );

    const activeSearchTerm = searchTermProp?.trim();

    onFiltersChange?.({
      responsaveis: responsavelIds,
      prazo: prazoStartValue
        ? { start: prazoStartValue, end: prazoEndValue }
        : undefined,
      hora: horas.length > 0 ? horas : undefined,
      myMentions,
      searchTerm: activeSearchTerm && activeSearchTerm.length > 0 ? activeSearchTerm : undefined,
    });

    // Rewrite URL params.
    params.delete('hora');
    params.delete('prazo');
    params.delete('prazo_fim');
    params.delete('responsavel');
    params.delete('busca');
    params.delete('minhas_mencoes');

    if (horas.length > 0) params.set('hora', horas.join(','));
    if (prazoStartValue) {
      params.set('prazo', prazoStartValue);
      if (prazoEndValue && prazoEndValue !== prazoStartValue) {
        params.set('prazo_fim', prazoEndValue);
      }
    }
    if (responsavelIds.length > 0) {
      params.set('responsavel', responsavelIds.join(','));
    }
    if (activeSearchTerm && activeSearchTerm.length > 0) params.set('busca', activeSearchTerm);
    if (myMentions) params.set('minhas_mencoes', '1');

    const qs = params.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    const currentUrl =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '';
    if (nextUrl !== currentUrl) {
      router.replace(nextUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters,
    myMentions,
    prazoStartValue,
    prazoEndValue,
    pathname,
    searchTermProp,
  ]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filters
        filters={filters}
        setFilters={setFilters}
        options={{ responsavel: responsavelOptions }}
      />
      {myMentions && (
        <div
          className="inline-flex h-9 items-center gap-2 rounded-none px-3 text-xs text-white shadow-sm"
          style={{
            backgroundColor: 'var(--color-primary)',
            border: '1px solid var(--color-primary)',
          }}
        >
          <div className="inline-flex items-center gap-1">
            <AtSign className="size-4" />
            <span className="font-semibold">Minhas menções</span>
          </div>
          <button
            type="button"
            onClick={() => setMyMentions(false)}
            className="inline-flex h-5 w-5 items-center justify-center rounded-none text-white transition"
            style={{
              backgroundColor: 'var(--color-primary)',
              border: '1px solid transparent',
            }}
            aria-label="Remover filtro Minhas menções"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      )}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setCalendarOpen(false);
            setSelectedView(null);
            setCommandInput('');
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'filter-cta-hover group flex h-9 items-center gap-1.5 text-sm transition-all duration-200',
              filters.length > 0 && 'w-9',
            )}
            style={{
              paddingLeft: '18px',
              paddingRight: '18px',
              borderRadius: '10px',
            }}
          >
            <ListFilter className="filter-icon size-6 shrink-0 text-muted-foreground transition-all" />
            {filters.length === 0 && 'Filtros'}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          ref={popoverContentRef}
          className="popover-content w-[200px] rounded-lg border-0 bg-white p-0 shadow-lg"
          side="right"
          align="start"
          sideOffset={12}
          onInteractOutside={handleCalendarInteractOutside}
          onPointerDownOutside={handleCalendarInteractOutside}
          onFocusOutside={handleCalendarInteractOutside}
        >
          <AnimateChangeInHeight>
            <Command className="rounded-lg">
              <CommandInput
                placeholder="Filtros..."
                className="command-input h-9 !border-0 !border-b-0"
                value={commandInput}
                onInputCapture={(e) => {
                  setCommandInput(e.currentTarget.value);
                }}
                ref={commandInputRef}
              />
              <CommandList className="p-1">
                {selectedView && (
                  <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                )}
                {selectedView ? (
                  <>
                    <CommandItem
                      className="group command-item mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-gray-700 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700"
                      value="voltar"
                      onSelect={() => {
                        setSelectedView(null);
                        setCommandInput('');
                        commandInputRef.current?.focus();
                      }}
                    >
                      <ArrowLeft className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">Voltar</span>
                    </CommandItem>
                    <CommandGroup className="p-0">
                      {(filterViewToFilterOptions[selectedView] ?? []).map(
                        (filter: FilterOption) => {
                          const storedValue = filter.value ?? filter.name;
                          return (
                            <CommandItem
                              className="group command-item mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-gray-700 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700"
                              key={storedValue}
                              value={filter.name}
                              onSelect={() => {
                                setFilters((prev) => {
                                  const index = prev.findIndex(
                                    (f) => f.type === selectedView,
                                  );
                                  if (index >= 0) {
                                    const next = [...prev];
                                    const existing = next[index];
                                    const nextValues = Array.from(
                                      new Set([
                                        ...(existing.value ?? []),
                                        storedValue,
                                      ]),
                                    );
                                    next[index] = {
                                      ...existing,
                                      value: nextValues,
                                    };
                                    return next;
                                  }
                                  return [
                                    ...prev,
                                    {
                                      id: newId(),
                                      type: selectedView,
                                      operator: FilterOperator.IS,
                                      value: [storedValue],
                                    },
                                  ];
                                });
                                setTimeout(() => {
                                  setSelectedView(null);
                                  setCommandInput('');
                                }, 200);
                                setOpen(false);
                              }}
                            >
                              {filter.icon}
                              <span className="text-sm font-medium">
                                {filter.name}
                              </span>
                              {filter.label && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {filter.label}
                                </span>
                              )}
                            </CommandItem>
                          );
                        },
                      )}
                    </CommandGroup>
                  </>
                ) : (
                  <>
                    <CommandGroup className="p-0">
                      {filterViewOptions
                        .flat()
                        .filter(
                          (filter: FilterOption) =>
                            filter.name !== FilterType.PRAZO &&
                            filter.name !== FilterType.BUSCAR &&
                            filter.name !== FilterType.AREA,
                        )
                        .map((filter: FilterOption) => (
                          <CommandItem
                            className="group command-item mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-gray-700 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700"
                            key={filter.name}
                            value={filter.name}
                            onSelect={(currentValue) => {
                              setSelectedView(currentValue as FilterType);
                              setCommandInput('');
                              commandInputRef.current?.focus();
                              setCalendarOpen(false);
                            }}
                          >
                            {filter.icon}
                            <span className="text-sm font-medium">
                              {filter.name}
                            </span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandItem
                      value="minhas-mencoes"
                      className="group command-item mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-gray-700 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700"
                      onSelect={() => setMyMentions((v) => !v)}
                    >
                      <AtSign
                        className={cn(
                          'size-4 shrink-0',
                          myMentions ? 'text-emerald-600' : 'text-muted-foreground',
                        )}
                      />
                      <span className="text-sm font-medium">Minhas menções</span>
                    </CommandItem>
                    <CommandItem
                      value="toggle-calendar"
                      className="group command-item mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-gray-700 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700"
                      onSelect={() => setCalendarOpen((prev) => !prev)}
                    >
                      <Calendar className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {calendarOpen ? 'Fechar calendário' : 'Selecionar período'}
                      </span>
                    </CommandItem>
                  </>
                )}
              </CommandList>
            </Command>
          </AnimateChangeInHeight>
        </PopoverContent>
      </Popover>
      {calendarOpen && (
        <div
          ref={calendarContainerRef}
          className="z-[99]"
          style={
            popoverRect
              ? {
                  position: 'fixed',
                  top: popoverRect.top,
                  left: popoverRect.right + 16,
                }
              : undefined
          }
        >
          <KanbanRangeCalendar
            value={prazoRange}
            onChange={(next) => handlePrazoChange(next)}
          />
        </div>
      )}
    </div>
  );
}
