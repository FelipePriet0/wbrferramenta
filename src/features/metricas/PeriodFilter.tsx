'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { KanbanRangeCalendar } from '@/components/app/kanban-range-calendar';
import { parseDateOnly } from '@/lib/datetime';
import type { DateRangeValue } from '@/components/ui/date-range-popover';

type Preset = 'dia' | 'semana' | 'mes' | 'ano';

const PRESETS: { value: Preset; label: string }[] = [
  { value: 'dia', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'ano', label: 'Ano' },
];

function presetRange(preset: Preset): DateRangeValue {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const now = new Date();
  const end = fmt(now);
  if (preset === 'dia') return { start: end, end };
  const start = new Date(now);
  if (preset === 'semana') start.setDate(now.getDate() - 6);
  else if (preset === 'mes') start.setDate(now.getDate() - 29);
  else start.setFullYear(now.getFullYear() - 1);
  start.setHours(0, 0, 0, 0);
  return { start: fmt(start), end };
}

function formatRange(r: DateRangeValue): string | null {
  if (!r.start) return null;
  const s = parseDateOnly(r.start);
  const e = parseDateOnly(r.end);
  if (!s) return null;
  const f = (d: Date) => format(d, 'dd/MM/yy');
  if (e && r.end !== r.start) return `${f(s)} – ${f(e)}`;
  return f(s);
}

type Props = {
  dateRange: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
};

export function PeriodFilter({ dateRange, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<Preset | null>('mes');

  const rangeLabel = formatRange(dateRange);

  const handlePreset = (preset: Preset) => {
    setActivePreset(preset);
    onChange(presetRange(preset));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-white transition"
          style={{ background: 'var(--preto)', border: '1px solid var(--preto)' }}
        >
          <CalendarIcon className="h-4 w-4 text-white/70" />
          {rangeLabel ?? 'Selecionar Período'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-0 p-0 shadow-xl" align="start">
        <div className="p-3">
          {/* Quick-preset row */}
          <div className="mb-3 flex gap-1">
            {PRESETS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => handlePreset(o.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activePreset === o.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Full calendar */}
          <KanbanRangeCalendar
            value={dateRange}
            onChange={(next) => {
              setActivePreset(null);
              onChange(next);
              if (next.start && next.end) setOpen(false);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
