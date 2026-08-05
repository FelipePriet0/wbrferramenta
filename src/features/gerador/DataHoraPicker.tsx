'use client';

import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format, isValid, parse } from 'date-fns';
import { Calendar as CalendarIcon, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * Seletor de data + hora do Gerador de O.S. Calendário (esquerda) + coluna de
 * horário (direita), no estilo esmeralda do sistema. A saída é a string que os
 * renders esperam: "DD/MM/AAAA HH:MM" (parteData faz split por espaço). Sem hora,
 * emite só "DD/MM/AAAA".
 */

const dayPickerClassNames = {
  months: 'flex flex-col',
  month: 'space-y-1',
  caption: 'flex justify-center pt-1 relative items-center',
  caption_label: 'text-sm font-medium text-zinc-900 dark:text-zinc-100',
  nav: 'space-x-1 flex items-center',
  nav_button:
    'h-7 w-7 rounded-md border border-emerald-500/30 bg-transparent text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:border-emerald-400/30 dark:hover:bg-emerald-500/20',
  table: 'w-full border-collapse',
  head_row: 'flex',
  head_cell: 'w-8 rounded-md text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-300',
  row: 'flex w-full mt-1',
  cell: 'h-8 w-8 text-center text-sm p-0 relative',
  day: cn(
    'h-8 w-8 rounded-md text-sm text-zinc-900 transition-colors dark:text-zinc-100',
    'hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:hover:bg-emerald-500/20',
  ),
  day_selected: 'bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white',
  day_outside: 'pointer-events-none text-zinc-300 opacity-50 dark:text-zinc-600',
  day_today: 'border border-emerald-400 text-emerald-600 font-semibold',
};

/** Slots de 15 min de 06:00 a 21:45 (o operador também pode digitar hora livre). */
const HORARIOS = (() => {
  const out: string[] = [];
  for (let h = 6; h <= 21; h++) for (const m of [0, 15, 30, 45]) {
    out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return out;
})();

function partes(value: string): { data: string; hora: string } {
  const [d = '', h = ''] = String(value ?? '').trim().split(/\s+/);
  return { data: d, hora: h };
}

export function DataHoraPicker({
  value,
  onChange,
  placeholder,
  soData = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Só data (esconde a coluna de hora) — saída "DD/MM/AAAA". */
  soData?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data, hora } = partes(value);

  const selectedDate = useMemo(() => {
    const d = parse(data, 'dd/MM/yyyy', new Date());
    return isValid(d) && data ? d : undefined;
  }, [data]);

  const emit = (novaData: string, novaHora: string) => {
    const d = novaData || (novaHora ? format(new Date(), 'dd/MM/yyyy') : '');
    onChange(novaHora ? `${d} ${novaHora}`.trim() : d);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-xl border border-zinc-300/90 bg-white px-3.5 text-left text-[15px] text-zinc-900 outline-none transition focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <span className={cn('truncate', !value?.trim() && 'text-zinc-400')}>
            {value?.trim() || placeholder || (soData ? 'Selecionar data' : 'Selecionar data e hora')}
          </span>
          <CalendarIcon className="h-4 w-4 flex-shrink-0 text-zinc-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden rounded-xl border border-zinc-200 bg-white p-0 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        align="start"
        sideOffset={8}
      >
        <div className="flex">
          {/* Coluna esquerda — calendário */}
          <div className="border-r border-zinc-100 p-3 dark:border-zinc-800">
            <DayPicker
              mode="single"
              locale={ptBR}
              selected={selectedDate}
              defaultMonth={selectedDate}
              onSelect={(d) => {
                if (!d) return;
                emit(format(d, 'dd/MM/yyyy'), hora);
                if (soData) setOpen(false);
              }}
              numberOfMonths={1}
              classNames={dayPickerClassNames}
            />
          </div>

          {/* Coluna direita — hora */}
          {!soData && (
          <div className="flex w-[112px] flex-col">
            <div className="px-3 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Hora
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={hora}
              onChange={(e) => emit(data, e.target.value)}
              placeholder="HH:MM"
              className="mx-2 mb-1 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-center text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <div className="max-h-[248px] overflow-y-auto px-2 pb-2">
              {HORARIOS.map((hh) => {
                const ativo = hh === hora;
                return (
                  <button
                    key={hh}
                    type="button"
                    onClick={() => emit(data, hh)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors',
                      ativo
                        ? 'bg-emerald-600 font-semibold text-white'
                        : 'text-zinc-700 hover:bg-emerald-50 dark:text-zinc-200 dark:hover:bg-emerald-500/10',
                    )}
                  >
                    {hh}
                    {ativo && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
