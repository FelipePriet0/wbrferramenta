'use client';

import { useEffect, useRef, useState } from 'react';
import { UserRound, UsersRound, Check, ChevronDown } from 'lucide-react';

/**
 * Seletor "Tipo de solicitação" do Mud End — mesmo desenho do gerador
 * (barra em gradiente + menu com check), na paleta azul WBR.
 *  - Ícones: 'user-round' (titular) / 'users-round' (terceiro).
 */

const AZUL = '#0B42C6';

export type TipoOption = { value: string; label: string; icon?: string };

function OptIcon({ icon, className, color }: { icon?: string; className?: string; color?: string }) {
  const Cmp = icon === 'users-round' ? UsersRound : UserRound;
  return <Cmp className={className} strokeWidth={1.8} style={color ? { color } : undefined} />;
}

export function TipoSolicitacaoSelect({
  value, options, onChange,
}: {
  value: string;
  options: TipoOption[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sel = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-12 w-full items-center gap-2.5 rounded-[14px] pl-[14px] pr-9 text-left text-white"
        style={{ backgroundImage: 'linear-gradient(135deg, rgb(8,51,154) 0%, rgb(37,99,235) 100%)' }}
      >
        <OptIcon icon={sel?.icon} className="h-[22px] w-[22px] shrink-0" />
        <span className="flex-1 truncate text-[16px] font-bold uppercase leading-tight">{sel?.label}</span>
        <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[15px] text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                style={selected ? { backgroundColor: 'rgba(11,66,198,0.08)' } : undefined}
              >
                <OptIcon icon={o.icon} className="h-5 w-5 shrink-0" color={AZUL} />
                <span className="flex-1">{o.label}</span>
                {selected && <Check className="h-4 w-4 shrink-0" style={{ color: AZUL }} strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
