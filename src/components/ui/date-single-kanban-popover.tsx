"use client";

import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { endOfMonth, startOfMonth } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { parseDateOnly } from "@/lib/datetime";
import { KanbanSingleCalendar } from "@/components/app/kanban-single-calendar";
import { format } from "date-fns";
import { ContextMenu } from "@/features/expanded-ficha/components/ContextMenu";
import { FieldHistoryModal } from "@/features/expanded-ficha/components/FieldHistoryModal";
import { useAuditApplicantId } from "@/features/expanded-ficha/AuditContext";

// Agenda feature was removed in the rewrite; no day is ever "full" anymore.
async function loadFullDays(_month: Date): Promise<Set<string>> {
  return new Set();
}

type DateSingleKanbanPopoverProps = {
  label?: string;
  labelClassName?: string;
  value?: string; // yyyy-MM-dd
  onChange: (value?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disablePast?: boolean;
  triggerClassName?: string;
  auditField?: string;
};

export function DateSingleKanbanPopover({ label, labelClassName, value, onChange, placeholder, disabled, disablePast, triggerClassName, auditField }: DateSingleKanbanPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [fullDays, setFullDays] = React.useState<Set<string>>(new Set());
  const [displayMonth, setDisplayMonth] = React.useState<Date>(() => parseDateOnly(value) || new Date());
  const [ctxMenu, setCtxMenu] = React.useState<{ x: number; y: number } | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const applicantId = useAuditApplicantId();

  const selectedDate = React.useMemo(() => parseDateOnly(value), [value]);
  const formatted = React.useMemo(() => (selectedDate ? format(selectedDate, "dd/MM/yyyy") : (placeholder || "Selecionar data")), [selectedDate, placeholder]);

  // Buscar disponibilidade quando o popover abre ou o mês exibido muda
  React.useEffect(() => {
    if (!open) return;
    loadFullDays(displayMonth).then(setFullDays);
  }, [open, displayMonth]);

  return (
    <div className="w-full">
      {label && <Label className={labelClassName ?? "field-label text-h1"}>{label}</Label>}
      <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            onContextMenu={auditField && applicantId ? (e) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); } : undefined}
            className={cn(
              "flex w-full items-center justify-between text-left outline-none transition",
              disabled && "cursor-not-allowed opacity-60",
              triggerClassName ||
                "h-12 rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm text-zinc-900 focus-visible:border-emerald-600 focus-visible:ring-[3px] focus-visible:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            )}
          >
            <span className="truncate">{formatted}</span>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              {selectedDate && (
                <X
                  className="h-4 w-4 hover:text-emerald-600 transition"
                  role="button"
                  aria-label="Limpar data"
                  onClick={(event) => { event.stopPropagation(); onChange(undefined); }}
                />
              )}
              <CalendarIcon className="h-4 w-4" />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-xl border-0 bg-white p-0 shadow-md dark:bg-zinc-950" align="start" sideOffset={8}>
          <KanbanSingleCalendar
            value={value}
            onChange={(v) => { onChange(v); setOpen(false); }}
            disablePast={disablePast}
            fullDays={fullDays}
            onMonthChange={(m) => setDisplayMonth(m)}
          />
        </PopoverContent>
      </Popover>

      {ctxMenu && (
        <ContextMenu
          pos={ctxMenu}
          items={[{ label: 'Histórico do campo', onClick: () => setHistoryOpen(true) }]}
          onClose={() => setCtxMenu(null)}
        />
      )}
      {historyOpen && auditField && applicantId && (
        <FieldHistoryModal
          applicantId={applicantId}
          field={auditField}
          fieldLabel={label ?? auditField}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
}
