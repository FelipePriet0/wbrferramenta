"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export type SelectOption = string | { label: string; value: string; disabled?: boolean };

function getLabel(opt: SelectOption): { label: string; value?: string; disabled?: boolean } {
  if (typeof opt === "string") return { label: opt, value: opt, disabled: false };
  return opt;
}

export function SimpleSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
  triggerStyle,
  contentStyle,
  overrideLabel,
  flat,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  triggerStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  overrideLabel?: string;
  /**
   * Flat visual style used in EditarFicha (no border/shadow on trigger/content)
   */
  flat?: boolean;
}) {
  const current = options.find((o) => getLabel(o).value === value) as SelectOption | undefined;
  const currentLabel = overrideLabel ?? (current ? getLabel(current).label : (value || placeholder || ""));

  // Merge z-index from contentStyle with higher priority, remove z-50 class if custom z-index is provided
  const mergedContentStyle = React.useMemo(() => {
    return contentStyle || {};
  }, [contentStyle]);

  const contentClassNameMerged = React.useMemo(() => {
    // If custom z-index is provided, don't apply z-50 class (it would conflict)
    const hasCustomZIndex = contentStyle?.zIndex !== undefined;
    return cn(
      hasCustomZIndex ? "" : "z-[100]",
      "min-w-[12rem] overflow-hidden rounded-md bg-white text-zinc-900 mz-select-content dark:bg-zinc-950 dark:text-zinc-100",
      flat ? "border-0 shadow-none" : "border border-zinc-200 shadow-md dark:border-zinc-800",
      contentClassName,
    );
  }, [contentStyle, flat, contentClassName]);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "SimpleSelect-trigger flex h-12 w-full items-center justify-between rounded-lg bg-white px-5 py-3 text-sm text-zinc-900 outline-none select-text dark:bg-zinc-900 dark:text-zinc-100",
            flat ? "border-0 shadow-none focus-visible:ring-0 focus-visible:border-transparent" : "border border-zinc-300 shadow-sm focus-visible:border-emerald-600 focus-visible:ring-[3px] focus-visible:ring-emerald-600/20 dark:border-zinc-700",
            className,
            triggerClassName,
          )}
          style={triggerStyle}
        >
          <span className="truncate text-left select-text">{currentLabel}</span>
          <span
            aria-hidden
            className="ml-2 inline-block align-middle"
            style={{ color: 'var(--verde-primario)', transform: 'rotate(90deg)' }}
          >
            &gt;
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={typeof document !== 'undefined' ? document.body : undefined}>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className={contentClassNameMerged}
          style={mergedContentStyle}
        >
          <div className="max-h-[260px] overflow-auto p-1">
            {options.map((o, idx) => {
              const { label, value: val, disabled } = getLabel(o);
              if (!val || disabled) {
                return (
                  <div key={idx} className="px-2 py-1.5 text-xs font-semibold text-zinc-500 select-none">
                    {label}
                  </div>
                );
              }
              const isActive = val === value;
              return (
                <DropdownMenu.Item
                  key={val + idx}
                  onSelect={() => { onChange(val); }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "hover:bg-[var(--verde-primario)] hover:text-white",
                    isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200" : "text-zinc-800 dark:text-zinc-100",
                  )}
                >
                  <span className="truncate">{label}</span>
                </DropdownMenu.Item>
              );
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// Mesmo visual do SimpleSelect, mas cada item liga/desliga e o menu fica aberto.
export function SimpleMultiSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
  contentStyle,
  flat,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  flat?: boolean;
}) {
  const hasCustomZIndex = contentStyle?.zIndex !== undefined;
  const currentLabel = value.length ? value.join(" + ") : (placeholder ?? "");

  function toggle(val: string) {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  }

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          title={currentLabel}
          className={cn(
            "SimpleSelect-trigger flex h-12 w-full items-center justify-between rounded-lg bg-white px-5 py-3 text-sm text-zinc-900 outline-none select-text dark:bg-zinc-900 dark:text-zinc-100",
            flat ? "border-0 shadow-none focus-visible:ring-0 focus-visible:border-transparent" : "border border-zinc-300 shadow-sm focus-visible:border-emerald-600 focus-visible:ring-[3px] focus-visible:ring-emerald-600/20 dark:border-zinc-700",
            className,
            triggerClassName,
          )}
        >
          <span className="truncate text-left select-text">{currentLabel}</span>
          <span
            aria-hidden
            className="ml-2 inline-block align-middle"
            style={{ color: 'var(--verde-primario)', transform: 'rotate(90deg)' }}
          >
            &gt;
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={typeof document !== 'undefined' ? document.body : undefined}>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className={cn(
            hasCustomZIndex ? "" : "z-[100]",
            "min-w-[12rem] overflow-hidden rounded-md bg-white text-zinc-900 mz-select-content dark:bg-zinc-950 dark:text-zinc-100",
            flat ? "border-0 shadow-none" : "border border-zinc-200 shadow-md dark:border-zinc-800",
            contentClassName,
          )}
          style={contentStyle}
        >
          <div className="max-h-[260px] overflow-auto p-1">
            {options.map((o, idx) => {
              const { label, value: val, disabled } = getLabel(o);
              if (!val || disabled) {
                return (
                  <div key={idx} className="px-2 py-1.5 text-xs font-semibold text-zinc-500 select-none">
                    {label}
                  </div>
                );
              }
              const isChecked = value.includes(val);
              return (
                <DropdownMenu.CheckboxItem
                  key={val + idx}
                  checked={isChecked}
                  onSelect={(e) => { e.preventDefault(); toggle(val); }}
                  className={cn(
                    "group relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                    "hover:bg-[var(--verde-primario)] hover:text-white",
                    isChecked ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200" : "text-zinc-800 dark:text-zinc-100",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border text-[10px] leading-none",
                      isChecked ? "border-emerald-600 bg-emerald-600 text-white" : "border-zinc-400 bg-white group-hover:border-white",
                    )}
                  >
                    {isChecked ? "✓" : ""}
                  </span>
                  <span className="truncate">{label}</span>
                </DropdownMenu.CheckboxItem>
              );
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
