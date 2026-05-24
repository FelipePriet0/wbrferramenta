"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Agenda feature was removed in the rewrite; no slot is ever "full" anymore.
async function loadFullSlots(_dateISO: string): Promise<Set<string>> {
  return new Set();
}

export function TimeMultiSelect({
  label,
  labelClassName,
  times,
  value,
  onChange,
  className,
  triggerClassName,
  allowedPairs,
  date,
  periodos,
  periodoLabels,
  periodoValue,
  onPeriodoChange,
}: {
  label: string;
  labelClassName?: string;
  times: readonly string[]; // 'HH:MM'
  value: string[]; // selected 'HH:MM'
  onChange: (vals: string[]) => void;
  className?: string;
  triggerClassName?: string;
  allowedPairs?: [string, string][]; // ex: [["08:30","10:30"],["13:30","15:30"]]
  date?: string; // yyyy-MM-dd — usado para buscar slots cheios
  periodos?: readonly string[]; // ex: ['manha','tarde'] — when present, two extra chips render below the slots
  periodoLabels?: Record<string, string>; // ex: { manha: 'Manhã', tarde: 'Tarde' }
  periodoValue?: string | null;
  onPeriodoChange?: (p: string | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [fullSlots, setFullSlots] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!open || !date) { setFullSlots(new Set()); return; }
    loadFullSlots(date).then(setFullSlots);
  }, [open, date]);

  // Given a slot, return its partner in allowedPairs (looks both sides).
  // Lets the user pick either slot of a pair first and complete it backwards.
  function partnerOf(v: string): string | undefined {
    for (const [a, b] of allowedPairs || []) {
      if (a === v) return b;
      if (b === v) return a;
    }
    return undefined;
  }

  function normalizeSelection(arr: string[]): string[] {
    if (arr.length !== 2) return arr;
    for (const [a, b] of allowedPairs || []) {
      if (arr.includes(a) && arr.includes(b)) return [a, b];
    }
    return arr;
  }

  // Toggling a slot. Período and horários são exclusivos: selecionar
  // qualquer horário limpa o período atual.
  function toggleTime(v: string) {
    const has = value.includes(v);
    let next: string[];
    if (has) {
      next = value.filter((x) => x !== v);
    } else if (value.length === 0) {
      next = [v];
    } else if (value.length === 1) {
      const partner = partnerOf(value[0]);
      if (!partner || v !== partner) return; // bloqueia combinação inválida
      next = normalizeSelection([value[0], v]);
    } else {
      return; // já tem 2 — não adiciona
    }
    onChange(next);
    if (periodoValue && onPeriodoChange) onPeriodoChange(null);
  }

  function togglePeriodo(p: string) {
    if (!onPeriodoChange) return;
    if (periodoValue === p) {
      onPeriodoChange(null);
    } else {
      onPeriodoChange(p);
      if (value.length > 0) onChange([]);
    }
  }

  const labelText = (() => {
    if (periodoValue && periodoLabels?.[periodoValue]) {
      return periodoLabels[periodoValue];
    }
    if (value.length === 0) return "Selecionar horário";
    if (value.length === 1) return value[0];
    const norm = normalizeSelection(value);
    return `${norm[0]} e ${norm[1]}`;
  })();

  return (
    <div className={className}>
      <div className="w-full">
        <div className={labelClassName ?? "field-label text-h1"}>{label}</div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={triggerClassName
                ? `flex w-full items-center justify-between text-left outline-none ${triggerClassName}`
                : "flex h-12 w-full items-center justify-between rounded-lg border border-zinc-300 bg-white px-5 py-3 text-left text-sm text-zinc-900 shadow-none outline-none focus-visible:border-emerald-600 focus-visible:ring-[3px] focus-visible:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              }
              style={triggerClassName ? undefined : { boxShadow: "0 1px 4px rgba(24, 50, 71, 0.08)" }}
            >
              <span className="truncate">{labelText}</span>
              <span aria-hidden className="ml-2 inline-block align-middle" style={{ color: 'var(--verde-primario)', transform: 'rotate(90deg)' }}>&gt;</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={6} className="mz-time-popover w-[260px] rounded-md border border-zinc-200 bg-white p-2 shadow-md dark:border-zinc-800 dark:bg-zinc-950">
            <div className="space-y-1">
              {times.map((t) => {
                const active = value.includes(t);
                const isFull = fullSlots.has(t) && !active;
                const fullTitle = isFull
                  ? `Não há mais vagas para esse horário no dia ${date ? date.split("-").reverse().join("/") : ""}`
                  : undefined;

                let disabled = isFull;
                if (!active && !isFull) {
                  if (value.length >= 2) disabled = true;
                  else if (value.length === 1) {
                    const partner = partnerOf(value[0]);
                    disabled = !partner || t !== partner;
                  }
                }

                const btn = (
                  <button
                    key={t}
                    onClick={() => !disabled && toggleTime(t)}
                    disabled={disabled}
                    className={[
                      "group w-full flex items-center justify-between rounded-sm px-2 py-2 text-sm mz-time-item",
                      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                      active ? "bg-[var(--verde-primario)] text-white mz-time-item--active" : "text-zinc-800 hover:bg-[var(--verde-primario)] hover:text-white dark:text-zinc-100",
                      isFull ? "bg-zinc-100 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-500" : "",
                    ].join(" ")}
                  >
                    <span className="group-hover:text-white mz-time-label">{t}</span>
                    <span
                      className={[
                        "ml-auto inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm border mz-time-checkbox",
                        "group-hover:border-white",
                      ].join(" ")}
                      style={{ borderColor: active ? 'white' : isFull ? '#d4d4d8' : 'var(--verde-primario)' }}
                    >
                      {active && (
                        <svg viewBox="0 0 24 24" width="14" height="14" className="group-hover:text-white" style={{ color: 'white' }}>
                          <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                );

                return isFull ? (
                  <span key={t} className="relative block w-full cursor-not-allowed group/full">
                    {btn}
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden w-max max-w-[220px] -translate-x-1/2 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-center text-xs leading-snug text-zinc-700 shadow-lg group-hover/full:block dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                      {fullTitle}
                    </span>
                  </span>
                ) : btn;
              })}
              {periodos && periodos.length > 0 && (
                <>
                  <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
                  {periodos.map((p) => {
                    const active = periodoValue === p;
                    return (
                      <button
                        key={p}
                        onClick={() => togglePeriodo(p)}
                        className={[
                          "group w-full flex items-center justify-between rounded-sm px-2 py-2 text-sm mz-time-item",
                          "cursor-pointer",
                          active ? "bg-[var(--verde-primario)] text-white mz-time-item--active" : "text-zinc-800 hover:bg-[var(--verde-primario)] hover:text-white dark:text-zinc-100",
                        ].join(" ")}
                        type="button"
                      >
                        <span className="group-hover:text-white mz-time-label">{periodoLabels?.[p] ?? p}</span>
                        <span
                          className={[
                            "ml-auto inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm border mz-time-checkbox",
                            "group-hover:border-white",
                          ].join(" ")}
                          style={{ borderColor: active ? 'white' : 'var(--verde-primario)' }}
                        >
                          {active && (
                            <svg viewBox="0 0 24 24" width="14" height="14" className="group-hover:text-white" style={{ color: 'white' }}>
                              <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
