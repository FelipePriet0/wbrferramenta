'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Plus,
  Siren,
  Tag,
  X as XIcon,
  type LucideIcon,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTableChanges } from '@/components/providers/RealtimeProvider';
import {
  assignLabel,
  listAssignmentsForCard,
  listLabels,
  unassignLabel,
  type CardLabel,
} from '@/services/labels';
import { UrgenteMotivoModal } from '@/features/labels/UrgenteMotivoModal';
import { CanceladaMotivoModal } from '@/features/labels/CanceladaMotivoModal';
import { ReverterPelaEtiquetaModal } from '@/features/labels/ReverterPelaEtiquetaModal';
import { CancelModal } from '@/features/kanban/components/CancelModal';
import { Modal } from '@/features/kanban/components/Modal';
import type { KanbanArea } from '@/lib/types';

// Tailwind classes per color token. Adding a new color = add a row here.
const COLOR_DOT: Record<string, string> = {
  azul: 'bg-blue-500',
  vermelho: 'bg-red-500',
  amarelo: 'bg-yellow-500',
};
const COLOR_DOT_FALLBACK = 'bg-zinc-400';

// Chip background + border per color token. Mirrors the kanban filter chip
// pattern (h-9, rounded-none, white text, shadow-sm).
const COLOR_CHIP: Record<string, string> = {
  azul: 'bg-blue-500 border-blue-500',
  vermelho: 'bg-red-500 border-red-500',
  amarelo: 'bg-yellow-500 border-yellow-500',
};
const COLOR_CHIP_FALLBACK = 'bg-zinc-500 border-zinc-500';

// Per-label icon override. The catalog is tiny so a name-keyed map is
// simpler than adding an icon column to card_labels.
const LABEL_ICON: Record<string, LucideIcon> = {
  Urgente: Siren,
  Cancelada: AlertTriangle,
};

export function LabelsPopover({
  cardId,
  area,
  disabled = false,
}: {
  cardId: string;
  // Current area of the card — used by the Cancelada flow so the CancelModal
  // calls change_stage with the source area (post-Cancelada migration the
  // RPC preserves area instead of hardcoding 'analise').
  area: KanbanArea;
  disabled?: boolean;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState<CardLabel[]>([]);
  const [assigned, setAssigned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    if (!cardId) return;
    setLoading(true);
    try {
      const [labels, ids] = await Promise.all([
        listLabels(),
        listAssignmentsForCard(cardId),
      ]);
      setCatalog(labels);
      setAssigned(new Set(ids));
    } catch (e) {
      console.error('[labels] reload', e);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  // Mount + cardId change: load catalog and current assignments so the chips
  // already appear before the popover is opened.
  useEffect(() => {
    void reload();
  }, [reload]);

  // Realtime: if the card moves stage, the trigger wipes assignments — pick
  // that up so chips and checkboxes stay in sync.
  useTableChanges({
    channelName: `rt-card-labels-${cardId}`,
    table: 'card_label_assignments',
    filter: `card_id=eq.${cardId}`,
    onChange: () => void reload(),
    enabled: !!cardId,
  });

  // Modal state for the "Urgente reason" flow — open when the user is
  // either applying Urgente (needs a reason) or clicked an already-assigned
  // chip to view/edit. Stays unrelated to other labels.
  const [urgenteModal, setUrgenteModal] = useState<
    | { mode: 'create' | 'view'; labelId: string }
    | null
  >(null);
  // Confirmation modal for removing the Urgente chip — a misclick on the X
  // would silently wipe the motivo (via the AFTER DELETE trigger), so we
  // gate the delete behind an explicit Yes/No prompt. Only applies to
  // Urgente; other labels keep the instant-toggle behaviour.
  const [urgenteRemove, setUrgenteRemove] = useState<
    { labelId: string } | null
  >(null);

  // Cancelada flow state:
  //   - canceladaCreate: open CancelModal (asks for motivo, then change_stage)
  //   - canceladaView: read-only modal showing the cancel_reason
  //   - canceladaRevert: open the full revert modal (area + stage + motivo)
  //     when the X on the chip is clicked. Removing the label = reverting
  //     the cancellation, so we need destination + reason.
  const [canceladaCreate, setCanceladaCreate] = useState(false);
  const [canceladaView, setCanceladaView] = useState(false);
  const [canceladaRevert, setCanceladaRevert] = useState(false);

  function dispatchLabelsChanged(labelId: string, action: 'assign' | 'unassign') {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('mz-labels-changed', {
        detail: { cardId, labelId, action },
      }),
    );
  }

  const toggle = useCallback(
    async (labelId: string) => {
      if (!user?.id || pending.has(labelId)) return;
      const wasAssigned = assigned.has(labelId);
      const label = catalog.find((l) => l.id === labelId);

      // Urgente: if applying, force the user to provide a motivo via modal.
      // The chip toggle skips the optimistic update — modal's onApplied will
      // sync via dispatchLabelsChanged after a successful RPC.
      if (!wasAssigned && label?.name === 'Urgente') {
        setUrgenteModal({ mode: 'create', labelId });
        return;
      }

      // Cancelada: applying the label is semantically "move the card to
      // Canceladas (same area) with a reason". CancelModal already handles
      // the RPC + reason; the trigger then auto-applies the chip. Toggle
      // skips the assignment write — we don't write the row directly.
      if (!wasAssigned && label?.name === 'Cancelada') {
        setCanceladaCreate(true);
        return;
      }

      setPending((prev) => new Set(prev).add(labelId));
      setAssigned((prev) => {
        const next = new Set(prev);
        if (wasAssigned) next.delete(labelId);
        else next.add(labelId);
        return next;
      });
      try {
        if (wasAssigned) await unassignLabel(cardId, labelId);
        else await assignLabel(cardId, labelId, user.id);
        // Realtime usually fans out the change, but when this popover is
        // inside an open modal sitting on top of the kanban the broadcast
        // can race the unmount cycle. Dispatch an explicit window event so
        // the kanban board (and any other listener) reloads its label sets
        // regardless of the realtime path. Belt-and-suspenders for the
        // "card stayed blue after clicking the chip's X" bug.
        dispatchLabelsChanged(labelId, wasAssigned ? 'unassign' : 'assign');
      } catch (e) {
        console.error('[labels] toggle', e);
        setAssigned((prev) => {
          const next = new Set(prev);
          if (wasAssigned) next.add(labelId);
          else next.delete(labelId);
          return next;
        });
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(labelId);
          return next;
        });
      }
    },
    [assigned, cardId, catalog, pending, user?.id],
  );

  const labelById = useMemo(() => {
    const m = new Map<string, CardLabel>();
    for (const l of catalog) m.set(l.id, l);
    return m;
  }, [catalog]);

  const assignedLabels = useMemo(() => {
    const out: CardLabel[] = [];
    for (const id of assigned) {
      const l = labelById.get(id);
      if (l) out.push(l);
    }
    return out;
  }, [assigned, labelById]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Etiqueta
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          {loading && catalog.length === 0 ? (
            <p className="px-2 py-1 text-xs text-zinc-500">Carregando…</p>
          ) : catalog.length === 0 ? (
            <p className="px-2 py-1 text-xs text-zinc-500">
              Sem etiquetas disponíveis.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {catalog.map((label) => {
                const isOn = assigned.has(label.id);
                const isPending = pending.has(label.id);
                return (
                  <li key={label.id}>
                    <button
                      type="button"
                      onClick={() => void toggle(label.id)}
                      disabled={isPending}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-60"
                    >
                      <span
                        className={`h-3 w-3 shrink-0 rounded-full ${
                          COLOR_DOT[label.color] ?? COLOR_DOT_FALLBACK
                        }`}
                      />
                      <span className="flex-1 truncate">{label.name}</span>
                      {isOn && (
                        <Check
                          className="h-4 w-4 shrink-0 text-emerald-600"
                          aria-label="Selecionado"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </PopoverContent>
      </Popover>

      {assignedLabels.map((label) => {
        const isPending = pending.has(label.id);
        const chipColor = COLOR_CHIP[label.color] ?? COLOR_CHIP_FALLBACK;
        const Icon = LABEL_ICON[label.name] ?? Tag;
        const isUrgente = label.name === 'Urgente';
        const isCancelada = label.name === 'Cancelada';
        const isClickable = isUrgente || isCancelada;
        return (
          <div
            key={label.id}
            className={`inline-flex h-9 items-center gap-2 rounded-none border px-3 text-xs text-white shadow-sm ${chipColor}`}
          >
            <button
              type="button"
              onClick={
                isUrgente
                  ? () => setUrgenteModal({ mode: 'view', labelId: label.id })
                  : isCancelada
                    ? () => setCanceladaView(true)
                    : undefined
              }
              disabled={!isClickable}
              className={`inline-flex items-center gap-1 text-white ${isClickable ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
              aria-label={
                isClickable
                  ? `Ver motivo da etiqueta ${label.name}`
                  : undefined
              }
            >
              <Icon className="size-4" />
              <span className="font-semibold">{label.name}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                // Urgente e Cancelada carregam motivo escrito; gate behind
                // confirm dialog para evitar misclick silencioso. Cancelada
                // adicionalmente é semanticamente "des-cancelar", então o
                // user precisa confirmar explicitamente.
                if (isUrgente) {
                  setUrgenteRemove({ labelId: label.id });
                } else if (isCancelada) {
                  setCanceladaRevert(true);
                } else {
                  void toggle(label.id);
                }
              }}
              disabled={disabled || isPending}
              className="inline-flex h-5 w-5 items-center justify-center rounded-none text-white transition disabled:opacity-50"
              aria-label={`Remover etiqueta ${label.name}`}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </div>
        );
      })}

      {urgenteModal && user?.id && (
        <UrgenteMotivoModal
          open={!!urgenteModal}
          onClose={() => setUrgenteModal(null)}
          mode={urgenteModal.mode}
          cardId={cardId}
          labelId={urgenteModal.labelId}
          currentUserId={user.id}
          onApplied={() => {
            // After a successful create, optimistically mark the chip as
            // assigned and notify the rest of the app. The realtime channel
            // will reconcile shortly after.
            setAssigned((prev) => {
              const next = new Set(prev);
              next.add(urgenteModal.labelId);
              return next;
            });
            dispatchLabelsChanged(urgenteModal.labelId, 'assign');
          }}
        />
      )}

      {urgenteRemove && (
        <Modal
          open={!!urgenteRemove}
          onClose={() => setUrgenteRemove(null)}
          title="Remover etiqueta Urgente?"
          dismissOnBackdrop={false}
        >
          <div className="space-y-3">
            <p className="text-sm text-zinc-700">
              O motivo registrado da urgência será <strong>apagado</strong> e
              esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUrgenteRemove(null)}
                className="h-9 rounded-[8px] border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = urgenteRemove.labelId;
                  setUrgenteRemove(null);
                  void toggle(id);
                }}
                className="h-9 rounded-[8px] bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
              >
                Remover
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancelada — create: aplica etiqueta = mover card pra canceladas
          com motivo. CancelModal já faz isso via change_stage RPC; a
          trigger no banco aplica a etiqueta automaticamente. */}
      {canceladaCreate && (
        <CancelModal
          open={canceladaCreate}
          onClose={() => setCanceladaCreate(false)}
          cardId={cardId}
          area={area}
          onCancelled={() => {
            // Optimistic, espelha o fluxo de revert: a trigger AFTER UPDATE
            // em kanban_cards insere a row em card_label_assignments, mas
            // o realtime pode demorar. Marcar como assigned aqui na hora
            // garante que a chip apareça imediatamente.
            const canceladaLabel = catalog.find((l) => l.name === 'Cancelada');
            if (canceladaLabel) {
              setAssigned((prev) => {
                const next = new Set(prev);
                next.add(canceladaLabel.id);
                return next;
              });
              dispatchLabelsChanged(canceladaLabel.id, 'assign');
            }
          }}
        />
      )}

      {/* Cancelada — view: read-only com cancel_reason + autor + data. */}
      {canceladaView && (
        <CanceladaMotivoModal
          open={canceladaView}
          onClose={() => setCanceladaView(false)}
          cardId={cardId}
          currentUserId={user?.id ?? null}
        />
      )}

      {/* Cancelada — X no chip = reverter cancelamento. Em vez de só
          remover a label (que deixaria o card em canceladas sem chip),
          abre o modal de reversão completo: usuário escolhe área +
          coluna de destino + motivo. change_stage faz o resto e a
          trigger remove a etiqueta automaticamente quando o stage sai
          de 'canceladas'. */}
      {canceladaRevert && (
        <ReverterPelaEtiquetaModal
          open={canceladaRevert}
          onClose={() => setCanceladaRevert(false)}
          cardId={cardId}
          onReverted={() => {
            // Optimistic: a trigger AFTER UPDATE em kanban_cards apaga a row
            // de card_label_assignments, mas o realtime pode demorar uns
            // segundos pra propagar. Tirar do Set local na hora garante que
            // a chip suma imediatamente, sem precisar fechar/reabrir o modal.
            const canceladaLabel = catalog.find((l) => l.name === 'Cancelada');
            if (canceladaLabel) {
              setAssigned((prev) => {
                const next = new Set(prev);
                next.delete(canceladaLabel.id);
                return next;
              });
              dispatchLabelsChanged(canceladaLabel.id, 'unassign');
            }
          }}
        />
      )}
    </div>
  );
}
