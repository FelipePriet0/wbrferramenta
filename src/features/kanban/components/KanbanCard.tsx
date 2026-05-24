'use client';

import { useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertTriangle,
  AtSign,
  Calendar,
  Clock,
  Flame,
  MapPin,
  MoreVertical,
  Phone,
  Siren,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/components/providers/AuthProvider';
import { UrgenteMotivoModal } from '@/features/labels/UrgenteMotivoModal';
import { CanceladaMotivoModal } from '@/features/labels/CanceladaMotivoModal';
import type { KanbanCard as Card } from '@/features/kanban/types';

// Mirrors LabelsPopover's chip palette so the card visual matches the picker.
const LABEL_CHIP_BG: Record<string, string> = {
  azul: 'bg-blue-500 border-blue-500',
  vermelho: 'bg-red-500 border-red-500',
  amarelo: 'bg-yellow-500 border-yellow-500',
};
const LABEL_CHIP_FALLBACK = 'bg-zinc-500 border-zinc-500';

// Per-label icon override (mirrors LabelsPopover.LABEL_ICON).
const LABEL_ICON: Record<string, LucideIcon> = {
  Urgente: Siren,
  Cancelada: AlertTriangle,
};

export function KanbanCard({
  card,
  onOpen,
  onMove,
  readOnly = false,
}: {
  card: Card;
  onOpen: () => void;
  onMove: () => void;
  readOnly?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: card.id, disabled: readOnly });
  const style = {
    transform: CSS.Translate.toString(transform),
    willChange: 'transform, opacity',
    zIndex: isDragging ? 1000 : undefined,
    boxShadow: '0 6px 16px rgba(30,41,59,0.06)',
    opacity: isDragging ? 0 : 1,
  } as React.CSSProperties;
  const [menuOpen, setMenuOpen] = useState(false);
  const [urgenteOpen, setUrgenteOpen] = useState<{ labelId: string } | null>(
    null,
  );
  const [canceladaOpen, setCanceladaOpen] = useState<{ labelId: string } | null>(
    null,
  );
  const { user } = useAuth();
  const pressAt = useRef(0);

  const isOverdue = (() => {
    if (!card?.dueAt) return false;
    try {
      return new Date(card.dueAt).getTime() < Date.now();
    } catch {
      return false;
    }
  })();

  // Precedência: Mencionado+Atrasado > Mencionado > Urgente > Cancelada >
  // Atrasado > Preenchida > Padrão. Urgente outranks Cancelada (a ficha
  // pode estar cancelada mas marcada como urgente pra revisão urgente).
  const cardClass =
    card.isMentioned && isOverdue
      ? 'kanban-card rounded-2xl border border-orange-300 bg-emerald-50 p-3 shadow-[0_6px_16px_rgba(251,146,60,0.15)] transition hover:shadow-[0_10px_24px_rgba(251,146,60,0.25)]'
      : card.isMentioned
        ? 'kanban-card rounded-2xl border border-emerald-300 bg-emerald-50 p-3 shadow-[0_6px_16px_rgba(16,185,129,0.15)] transition hover:shadow-[0_10px_24px_rgba(16,185,129,0.25)]'
        : card.hasLabelUrgente
          ? 'kanban-card rounded-2xl border border-red-300 bg-red-50 p-3 shadow-[0_6px_16px_rgba(239,68,68,0.15)] transition hover:shadow-[0_10px_24px_rgba(239,68,68,0.25)]'
          : card.hasLabelCancelada
            ? 'kanban-card rounded-2xl border border-yellow-300 bg-yellow-50 p-3 shadow-[0_6px_16px_rgba(234,179,8,0.15)] transition hover:shadow-[0_10px_24px_rgba(234,179,8,0.25)]'
            : isOverdue
              ? 'kanban-card rounded-2xl border border-orange-300 bg-orange-50 p-3 shadow-[0_6px_16px_rgba(251,146,60,0.15)] transition hover:shadow-[0_10px_24px_rgba(251,146,60,0.25)]'
              : card.hasLabelPreenchida
                ? 'kanban-card rounded-2xl border border-blue-300 bg-blue-50 p-3 shadow-[0_6px_16px_rgba(59,130,246,0.15)] transition hover:shadow-[0_10px_24px_rgba(59,130,246,0.25)]'
                : 'kanban-card rounded-2xl border border-emerald-100/40 bg-white p-3 shadow-[0_6px_16px_rgba(30,41,59,0.06)] transition hover:shadow-[0_10px_24px_rgba(30,41,59,0.10)]';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cardClass}
      onPointerDown={() => {
        pressAt.current = performance.now();
      }}
      onClick={(e) => {
        if (isDragging) return;
        const el = e.target as HTMLElement;
        if (
          el &&
          el.closest(
            '[data-ignore-card-click], [data-action-button], [role="menuitem"], button, a, input, textarea, select, [contenteditable="true"]',
          )
        )
          return;
        onOpen();
      }}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1" role="button">
          <div
            className="mb-0.5 truncate text-[13px] font-semibold text-zinc-900"
            title={card.applicantName}
          >
            {card.applicantName}
          </div>
          <div className="truncate text-[11px] text-zinc-500" title={card.cpfCnpj}>
            CPF: {card.cpfCnpj}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {card.isMentioned && (
            <span
              className="text-emerald-600"
              title="Você foi mencionado"
              aria-label="Mencionado"
              data-ignore-card-click
            >
              <AtSign className="h-4 w-4" />
            </span>
          )}
          {isOverdue && (
            <span
              className="text-orange-500"
              title="Atrasado"
              aria-label="Atrasado"
              data-ignore-card-click
            >
              <Flame className="h-4 w-4" />
            </span>
          )}
          {!readOnly && (
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  className="ml-1 rounded p-1 text-emerald-600 hover:bg-emerald-50"
                  aria-label="Ações do card"
                  data-ignore-card-click
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[180px] rounded-lg border-0 bg-white p-0 shadow-lg"
                side="right"
                align="end"
                sideOffset={6}
              >
                <div className="py-1">
                  <button
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50"
                    onClick={() => {
                      setMenuOpen(false);
                      onMove();
                    }}
                  >
                    Mover…
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {card.labels && card.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {card.labels.map((label) => {
            const Icon = LABEL_ICON[label.name] ?? Tag;
            const isUrgente = label.name === 'Urgente';
            const isCancelada = label.name === 'Cancelada';
            const chipClass = `inline-flex h-5 items-center gap-1 rounded-none border px-2 text-[10px] font-semibold text-white shadow-sm ${
              LABEL_CHIP_BG[label.color] ?? LABEL_CHIP_FALLBACK
            }`;
            if (isUrgente || isCancelada) {
              return (
                <button
                  key={label.id}
                  type="button"
                  title={
                    isUrgente
                      ? 'Clique para ver o motivo da urgência'
                      : 'Clique para ver o motivo do cancelamento'
                  }
                  data-ignore-card-click
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isUrgente) setUrgenteOpen({ labelId: label.id });
                    else setCanceladaOpen({ labelId: label.id });
                  }}
                  className={`${chipClass} cursor-pointer hover:opacity-90`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">{label.name}</span>
                </button>
              );
            }
            return (
              <span
                key={label.id}
                title={label.name}
                className={chipClass}
              >
                <Icon className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{label.name}</span>
              </span>
            );
          })}
        </div>
      )}

      {urgenteOpen && user?.id && (
        <UrgenteMotivoModal
          open={!!urgenteOpen}
          onClose={() => setUrgenteOpen(null)}
          mode="view"
          cardId={card.id}
          labelId={urgenteOpen.labelId}
          currentUserId={user.id}
        />
      )}

      {canceladaOpen && (
        <CanceladaMotivoModal
          open={!!canceladaOpen}
          onClose={() => setCanceladaOpen(null)}
          cardId={card.id}
          currentUserId={user?.id ?? null}
        />
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-zinc-700">
        {card.phone && (
          <span
            className="inline-flex max-w-full items-center gap-1.5"
            title={card.phone}
          >
            <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{card.phone}</span>
          </span>
        )}
        {card.whatsapp && (
          <span
            className="inline-flex max-w-full items-center gap-1.5"
            title={card.whatsapp}
          >
            <img
              src="/whatsapp.svg"
              alt="WhatsApp"
              className="h-3.5 w-3.5 shrink-0"
            />
            <span className="truncate">{card.whatsapp}</span>
          </span>
        )}
        {card.bairro && (
          <span
            className="inline-flex max-w-full items-center gap-1.5"
            title={`Bairro: ${card.bairro}`}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">Bairro: {card.bairro}</span>
          </span>
        )}
        {card.horaAt && (
          <span
            className="inline-flex max-w-full items-center gap-1.5"
            title={card.horaAt}
          >
            <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{card.horaAt}</span>
          </span>
        )}
        {card.dueAt && (
          <span className="inline-flex max-w-full items-center gap-1.5 whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            Ag.: {new Date(card.dueAt).toLocaleDateString()}
          </span>
        )}
      </div>
      {card.extraAction}
    </div>
  );
}
