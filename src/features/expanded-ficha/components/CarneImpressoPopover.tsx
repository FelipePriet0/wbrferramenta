'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const OPTIONS = [
  { value: true, label: 'Sim' },
  { value: false, label: 'Não' },
] as const;

// Campo "Carnê Impresso" no estilo Adobe (h-[27px], bg-blue-100 — mesma
// altura dos campos da ficha) com um gatilho de popover no canto direito.
export function CarneImpressoPopover({
  value,
  onChange,
  disabled,
}: {
  value?: boolean | null;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = value == null ? '' : value ? 'Sim' : 'Não';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className="relative h-[27px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 pl-1 pr-5 text-left text-[10px] text-zinc-900 outline-none focus:border-zinc-600 disabled:cursor-not-allowed"
        >
          <span className="block truncate">{selected}</span>
          <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-32 p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => {
              onChange?.(o.value);
              setOpen(false);
            }}
            className="block w-full rounded px-2 py-1.5 text-left text-[11px] hover:bg-zinc-100"
          >
            {o.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
