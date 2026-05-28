'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar as CalendarIcon,
  ListFilter,
  UserCircle,
  X as XIcon,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { UserAvatar } from '@/components/ui/avatar';
import { KanbanRangeCalendar } from '@/components/app/kanban-range-calendar';
import type { ProfileLite } from '@/services/profiles';

export type HistoricoStatus = '' | 'aprovados' | 'negados' | 'canceladas';

const STATUS_OPTIONS: { value: Exclude<HistoricoStatus, ''>; label: string }[] =
  [
    { value: 'aprovados', label: 'Aprovados' },
    { value: 'negados', label: 'Negados' },
    { value: 'canceladas', label: 'Canceladas' },
  ];

const STATUS_LABEL: Record<string, string> = {
  aprovados: 'Aprovados',
  negados: 'Negados',
  canceladas: 'Canceladas',
};

export type HistoricoFiltersValue = {
  dateRange?: { start?: string; end?: string };
  status: HistoricoStatus;
  responsavel: string; // profile UUID or ''
};

type View = 'root' | 'periodo' | 'status' | 'responsavel';

// Shared CommandItem className mirrors the kanban FilterCTA so the visual
// language is identical across pages.
const ITEM_CLS =
  'group command-item mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-gray-700 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700';

function formatDateRange(r: HistoricoFiltersValue['dateRange']): string {
  if (!r?.start) return '';
  const fmt = (iso: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    return m ? `${m[3]}/${m[2]}/${m[1].slice(-2)}` : iso;
  };
  const start = fmt(r.start);
  if (r.end && r.end !== r.start) return `${start} – ${fmt(r.end)}`;
  return start;
}

export function HistoricoFilterCTA({
  value,
  onChange,
  profiles,
}: {
  value: HistoricoFiltersValue;
  onChange: (next: HistoricoFiltersValue) => void;
  profiles: ProfileLite[];
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('root');

  const responsavelOptions = useMemo(
    () =>
      profiles.filter(
        (p) =>
          p.role === 'vendedor' ||
          p.role === 'analista' ||
          p.role === 'gestor',
      ),
    [profiles],
  );

  const responsavelLabel =
    responsavelOptions.find((p) => p.id === value.responsavel)?.full_name ?? '';

  const reset = () => {
    setOpen(false);
    setView('root');
  };

  const chipBaseStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Chip — Período */}
      {value.dateRange?.start && (
        <div
          className="inline-flex h-9 items-center gap-2 rounded-none px-3 text-xs text-white shadow-sm"
          style={chipBaseStyle}
        >
          <CalendarIcon className="size-4" />
          <span className="font-semibold">{formatDateRange(value.dateRange)}</span>
          <button
            type="button"
            onClick={() => onChange({ ...value, dateRange: undefined })}
            className="inline-flex h-5 w-5 items-center justify-center text-white"
            aria-label="Remover filtro de período"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Chip — Status */}
      {value.status && (
        <div
          className="inline-flex h-9 items-center gap-2 rounded-none px-3 text-xs text-white shadow-sm"
          style={chipBaseStyle}
        >
          <BadgeCheck className="size-4" />
          <span className="font-semibold">{STATUS_LABEL[value.status]}</span>
          <button
            type="button"
            onClick={() => onChange({ ...value, status: '' })}
            className="inline-flex h-5 w-5 items-center justify-center text-white"
            aria-label="Remover filtro de status"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Chip — Responsável */}
      {value.responsavel && (
        <div
          className="inline-flex h-9 items-center gap-2 rounded-none px-3 text-xs text-white shadow-sm"
          style={chipBaseStyle}
        >
          <UserAvatar name={responsavelLabel || '—'} size="xs" />
          <span className="font-semibold">{responsavelLabel || '—'}</span>
          <button
            type="button"
            onClick={() => onChange({ ...value, responsavel: '' })}
            className="inline-flex h-5 w-5 items-center justify-center text-white"
            aria-label="Remover filtro de responsável"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Botão Filtros */}
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setView('root');
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <ListFilter className="h-4 w-4" />
            Filtros
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={`${view === 'periodo' ? 'w-auto' : 'w-[260px]'} rounded-lg border-0 bg-white p-0 shadow-lg`}
          align="start"
        >
          {view === 'root' && (
            <Command className="rounded-lg">
              <CommandInput
                placeholder="Filtros..."
                className="command-input h-9 !border-0 !border-b-0"
              />
              <CommandList className="p-1">
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup className="p-0">
                  <CommandItem
                    value="Período"
                    onSelect={() => setView('periodo')}
                    className={ITEM_CLS}
                  >
                    <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium">Período</span>
                  </CommandItem>
                  <CommandItem
                    value="Status"
                    onSelect={() => setView('status')}
                    className={ITEM_CLS}
                  >
                    <BadgeCheck className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium">Status</span>
                  </CommandItem>
                  <CommandItem
                    value="Responsável"
                    onSelect={() => setView('responsavel')}
                    className={ITEM_CLS}
                  >
                    <UserCircle className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium">Responsável</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          )}

          {view === 'periodo' && (
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Período
                </p>
                {value.dateRange?.start && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...value, dateRange: undefined });
                      reset();
                    }}
                    className="text-[11px] font-medium text-zinc-500 hover:text-zinc-700"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <KanbanRangeCalendar
                value={value.dateRange ?? {}}
                onChange={(next) => {
                  onChange({ ...value, dateRange: next });
                  if (next.start && next.end) reset();
                }}
              />
            </div>
          )}

          {view === 'status' && (
            <Command className="rounded-lg">
              <CommandInput
                placeholder="Filtros..."
                className="command-input h-9 !border-0 !border-b-0"
              />
              <CommandList className="p-1">
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandItem
                  value="voltar"
                  onSelect={() => setView('root')}
                  className={ITEM_CLS}
                >
                  <ArrowLeft className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium">Voltar</span>
                </CommandItem>
                <CommandGroup className="p-0">
                  {STATUS_OPTIONS.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => {
                        onChange({ ...value, status: opt.value });
                        reset();
                      }}
                      className={ITEM_CLS}
                    >
                      <BadgeCheck className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}

          {view === 'responsavel' && (
            <Command className="rounded-lg">
              <CommandInput
                placeholder="Filtros..."
                className="command-input h-9 !border-0 !border-b-0"
              />
              <CommandList className="p-1">
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandItem
                  value="voltar"
                  onSelect={() => setView('root')}
                  className={ITEM_CLS}
                >
                  <ArrowLeft className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium">Voltar</span>
                </CommandItem>
                <CommandGroup className="p-0">
                  {responsavelOptions.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.full_name ?? '—'}
                      onSelect={() => {
                        onChange({ ...value, responsavel: p.id });
                        reset();
                      }}
                      className={ITEM_CLS}
                    >
                      <UserAvatar name={p.full_name ?? '—'} size="xs" />
                      <span className="text-sm font-medium">
                        {p.full_name ?? '—'}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
