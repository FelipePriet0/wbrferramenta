'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Calendar, MapPin, MessageCircle, Phone } from 'lucide-react';
import { KanbanColumn } from '@/features/kanban/components/KanbanColumn';
import { CancelModal } from '@/features/kanban/components/CancelModal';
import { RevertCancelModal } from '@/features/kanban/components/RevertCancelModal';
import { MoveModal } from '@/features/kanban/components/MoveModal';
import { EditarFichaModal } from '@/features/editar-ficha/EditarFichaModal';
import {
  changeStage,
  listCards,
  listMyMentionCards,
} from '@/services/kanban';
import { listAssignmentsForCards, listLabels } from '@/services/labels';
import { friendlyError } from '@/lib/errors';
import type { AppliedFilters } from '@/components/app/filter-cta';
import { useTableChanges } from '@/components/providers/RealtimeProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFichaCache } from '@/hooks/useFichaCache';
import { useMentionReads } from '@/hooks/useMentionReads';
import type { KanbanArea } from '@/lib/types';
import type { KanbanCard } from '@/features/kanban/types';

type ColumnConfig = {
  key: string;
  title: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'orange';
};

const COMERCIAL_COLUMNS: ColumnConfig[] = [
  { key: 'entrada', title: 'Entrada', color: 'blue' },
  { key: 'feitas', title: 'Feitas / Cadastrar no MK', color: 'green' },
  { key: 'aguardando', title: 'Aguardando documentos', color: 'amber' },
  { key: 'canceladas', title: 'Canceladas', color: 'red' },
  { key: 'concluidas', title: 'Concluídas', color: 'purple' },
];

const EMPTY_GROUPS: Record<string, KanbanCard[]> = Object.fromEntries(
  COMERCIAL_COLUMNS.map((c) => [c.key, []]),
);

export function KanbanBoard({
  area = 'comercial',
  readOnly = false,
  filters,
  onCardsChange,
  onNoResults,
}: {
  area?: KanbanArea;
  readOnly?: boolean;
  filters?: AppliedFilters;
  onCardsChange?: (cards: KanbanCard[]) => void;
  onNoResults?: (searchTerm: string) => void;
}) {
  const { user } = useAuth();
  const { hasReadAt, markRead, loaded: readsLoaded } = useMentionReads(user?.id);

  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [fetching, setFetching] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [move, setMove] = useState<{ id: string; currentStage?: string } | null>(null);
  const [cancel, setCancel] = useState<{ id: string; applicantId?: string } | null>(null);
  const [revert, setRevert] = useState<{ id: string; targetStage: string; targetLabel?: string } | null>(null);
  const [edit, setEdit] = useState<{ cardId: string; applicantId: string } | null>(
    null,
  );

  const sensors = useSensors(
    // Trello-style: drag activates only after 8px so a tap opens the modal.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const [reloadVersion, setReloadVersion] = useState(0);
  const reload = useCallback(() => {
    setReloadVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setFetching(true);
    (async () => {
      try {
        const [rows, mentionMap, labelCatalog] = await Promise.all([
          listCards(area, {
            searchTerm: filters?.searchTerm,
            responsaveis: filters?.responsaveis,
            hora: filters?.hora,
            dateStart: filters?.prazo?.start,
            dateEnd: filters?.prazo?.end ?? filters?.prazo?.start,
          }),
          listMyMentionCards().catch(() => new Map<string, string>()),
          listLabels().catch(() => []),
        ]);
        if (cancelled) return;
        // Second round-trip: assignments need cardIds from the first batch.
        // Catalog + assignments give us both the chip data and the
        // "Preenchida" flag in one shot — no separate listPreenchidaCardIds.
        const assignmentMap = await listAssignmentsForCards(
          rows.map((r) => r.id),
        ).catch(() => new Map<string, string[]>());
        if (cancelled) return;
        const labelById = new Map(labelCatalog.map((l) => [l.id, l]));
        // The "mentioned" highlight (border/icon) lights up when there is a
        // mention this user hasn't acknowledged AT-OR-AFTER its timestamp.
        // Opening a card stamps readAt = now; a fresh mention later carries
        // a newer timestamp and re-lights the card.
        let data = rows.map((c) => {
          const latest = mentionMap.get(c.id);
          const labelIds = assignmentMap.get(c.id) ?? [];
          const labels = labelIds
            .map((id) => labelById.get(id))
            .filter((l): l is NonNullable<typeof l> => !!l);
          return {
            ...c,
            isMentioned: !!latest && !hasReadAt(c.id, latest),
            labels,
            hasLabelPreenchida: labels.some((l) => l.name === 'Preenchida'),
            hasLabelUrgente: labels.some((l) => l.name === 'Urgente'),
            hasLabelCancelada: labels.some((l) => l.name === 'Cancelada'),
          };
        });
        if (filters?.myMentions) data = data.filter((c) => mentionMap.has(c.id));
        setCards(data);
        if (!cancelled) setFetching(false);
      } catch (e) {
        console.error('[kanban] reload', e);
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    area,
    reloadVersion,
    readsLoaded,
    hasReadAt,
    filters?.searchTerm,
    filters?.responsaveis,
    filters?.hora,
    filters?.prazo?.start,
    filters?.prazo?.end,
    filters?.myMentions,
  ]);

  // Refetch when a new ficha is created via the +Nova ficha flow OR when
  // a label is assigned/unassigned anywhere (custom event from LabelsPopover
  // covers the case where realtime races a modal-overlay unmount cycle).
  useEffect(() => {
    const handler = () => reload();
    window.addEventListener('mz-card-created', handler);
    window.addEventListener('mz-labels-changed', handler);
    return () => {
      window.removeEventListener('mz-card-created', handler);
      window.removeEventListener('mz-labels-changed', handler);
    };
  }, [reload]);

  useEffect(() => {
    onCardsChange?.(cards);
  }, [cards, onCardsChange]);

  useEffect(() => {
    if (fetching) return;
    const term = filters?.searchTerm?.trim();
    if (!term) return;
    if (cards.length === 0) {
      onNoResults?.(term);
    }
  }, [fetching, cards, filters?.searchTerm, onNoResults]);

  // Safety net for cross-user sync: realtime is the primary path (~500ms),
  // but if a postgres_changes event ever gets dropped (network blip,
  // websocket reconnect), a 10s poll + a refetch on tab focus guarantees
  // that labels/mentions/cards converge without needing F5.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') reload();
    };
    const id = setInterval(tick, 10_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [reload]);

  // Realtime: any change in this board's area triggers a refetch.
  // Cheap and correct; we can optimize to patch in place later if needed.
  // Also bust the EditarFichaModal cache for the affected card so when the
  // user reopens the modal it reads fresh data (e.g. assignee_id cleared
  // after a return-to-Recebidos move).
  const { invalidateApplicantCardByCardId } = useFichaCache();
  const onRealtimeChange = useCallback(
    (payload: { new?: { id?: string } } | undefined) => {
      reload();
      const cardId = payload?.new?.id;
      if (cardId) invalidateApplicantCardByCardId(cardId);
    },
    [reload, invalidateApplicantCardByCardId],
  );

  useTableChanges({
    channelName: `rt-kanban-cards-${area}`,
    table: 'kanban_cards',
    filter: `area=eq.${area}`,
    onChange: onRealtimeChange,
  });

  // Etiquetas: any change in card_label_assignments may flip the blue
  // visual on a card in this board. No filter — table is small and reloads
  // are cheap.
  useTableChanges({
    channelName: `rt-card-label-assignments-${area}`,
    table: 'card_label_assignments',
    onChange: onRealtimeChange,
  });

  const grouped = useMemo(() => {
    const g: Record<string, KanbanCard[]> = { ...EMPTY_GROUPS };
    for (const key of Object.keys(g)) g[key] = [];
    for (const c of cards) {
      const k = (c.stage ?? '').toLowerCase();
      if (g[k]) g[k].push(c);
    }
    return g;
  }, [cards]);

  const openCard = useCallback(
    (c: KanbanCard) => {
      if (!c.applicantId) return;
      if (c.isMentioned) {
        markRead(c.id);
        setCards((prev) =>
          prev.map((x) => (x.id === c.id ? { ...x, isMentioned: false } : x)),
        );
      }
      setEdit({ cardId: c.id, applicantId: c.applicantId });
    },
    [markRead],
  );

  const openMove = useCallback(
    (c: KanbanCard) => {
      if (readOnly) return;
      setMove({ id: c.id, currentStage: c.stage });
    },
    [readOnly],
  );

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      if (readOnly) return;
      setActiveId(String(active.id));
    },
    [readOnly],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      if (readOnly) return;
      const { active, over } = event;
      if (!over) return;
      const cardId = String(active.id);
      const target = String(over.id);
      if (target === 'entrada') {
        alert('Entrada não recebe cards.');
        return;
      }
      if (target === 'canceladas') {
        const applicantId = cards.find((c) => c.id === cardId)?.applicantId;
        setCancel({ id: cardId, applicantId });
        return;
      }
      const draggedCard = cards.find((c) => c.id === cardId);
      if (
        draggedCard?.stage === 'canceladas' &&
        target !== 'finalizados' &&
        target !== 'canceladas'
      ) {
        const targetLabel = COMERCIAL_COLUMNS.find((col) => col.key === target)?.title ?? target;
        setRevert({ id: cardId, targetStage: target, targetLabel });
        return;
      }
      try {
        await changeStage(cardId, area, target);
        // Bust the EditarFichaModal cache immediately — don't wait for the
        // kanban_cards realtime payload to arrive (which may lag behind the
        // user's next click).
        invalidateApplicantCardByCardId(cardId);
        await reload();
      } catch (e) {
        alert(friendlyError(e, 'Falha ao mover'));
      }
    },
    [area, readOnly, reload, invalidateApplicantCardByCardId],
  );

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <DndContext
        sensors={sensors}
        autoScroll
        onDragStart={handleDragStart}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-visible pb-6">
          <div className="flex min-h-full w-max items-start gap-6 pr-6">
            {COMERCIAL_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.key}
                droppableId={column.key}
                title={column.title}
                cards={(grouped[column.key] ?? []).map((c) => ({
                  ...c,
                  onOpen: () => openCard(c),
                  onMove: () => openMove(c),
                }))}
                color={column.color}
                count={(grouped[column.key] ?? []).length}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
          {activeCard ? (
            <div className="pointer-events-none rounded-2xl border border-emerald-100/40 bg-white p-3 shadow-[0_6px_16px_rgba(30,41,59,0.06)]">
              <div className="mb-0.5 truncate text-[13px] font-semibold text-zinc-900">
                {activeCard.applicantName}
              </div>
              <div className="text-[11px] text-zinc-500">CPF: {activeCard.cpfCnpj}</div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-zinc-700">
                {activeCard.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                    {activeCard.phone}
                  </span>
                )}
                {activeCard.whatsapp && (
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-zinc-400" />
                    WhatsApp
                  </span>
                )}
                {activeCard.bairro && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    Bairro: {activeCard.bairro}
                  </span>
                )}
                {activeCard.dueAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    Ag.: {new Date(activeCard.dueAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {!readOnly && (
        <>
          <MoveModal
            key={move?.id ?? 'none'}
            open={!!move}
            onClose={() => setMove(null)}
            cardId={move?.id ?? ''}
            currentStage={move?.currentStage}
            presetArea={area}
            onMoved={reload}
          />
          <CancelModal
            open={!!cancel}
            onClose={() => setCancel(null)}
            cardId={cancel?.id ?? ''}
            applicantId={cancel?.applicantId}
            area={area}
            onCancelled={reload}
          />
          <RevertCancelModal
            open={!!revert}
            onClose={() => setRevert(null)}
            cardId={revert?.id ?? ''}
            area={area}
            targetStage={revert?.targetStage ?? ''}
            targetLabel={revert?.targetLabel}
            onReverted={reload}
          />
        </>
      )}

      <EditarFichaModal
        open={!!edit}
        onClose={() => setEdit(null)}
        cardId={edit?.cardId ?? ''}
        applicantId={edit?.applicantId ?? ''}
        onStageChange={reload}
      />
    </div>
  );
}
