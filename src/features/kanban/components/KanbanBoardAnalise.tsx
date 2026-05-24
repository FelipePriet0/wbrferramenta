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
import { friendlyError } from '@/lib/errors';
import { MoveModal } from '@/features/kanban/components/MoveModal';
import { EditarFichaModal } from '@/features/editar-ficha/EditarFichaModal';
import {
  autoArchiveFinalizados,
  changeStage,
  listCards,
  listMyMentionCards,
} from '@/services/kanban';
import { listAssignmentsForCards, listLabels } from '@/services/labels';
import type { AppliedFilters } from '@/components/app/filter-cta';
import { useTableChanges } from '@/components/providers/RealtimeProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFichaCache } from '@/hooks/useFichaCache';
import { useMentionReads } from '@/hooks/useMentionReads';
import type { KanbanCard } from '@/features/kanban/types';

type ColumnConfig = {
  key: string;
  title: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'orange';
};

const ANALISE_COLUMNS: ColumnConfig[] = [
  { key: 'recebidos', title: 'Recebidos', color: 'blue' },
  { key: 'preenchidas', title: 'Preenchidas', color: 'green' },
  { key: 'em_analise', title: 'Em Análise', color: 'orange' },
  { key: 'reanalise', title: 'Reanálise', color: 'amber' },
  { key: 'aprovados', title: 'Aprovados', color: 'green' },
  { key: 'negados', title: 'Negados', color: 'red' },
  { key: 'finalizados', title: 'Finalizados', color: 'purple' },
  { key: 'canceladas', title: 'Canceladas', color: 'red' },
];

const EMPTY_GROUPS: Record<string, KanbanCard[]> = Object.fromEntries(
  ANALISE_COLUMNS.map((c) => [c.key, []]),
);

const FINALIZADOS_TTL_SEC = Number(
  process.env.NEXT_PUBLIC_FINALIZADOS_TTL_SEC ?? 60,
);
const AUTO_ARCHIVE_TICK_MS = 20_000;

export function KanbanBoardAnalise({
  readOnly = false,
  filters,
  onCardsChange,
  onNoResults,
}: {
  readOnly?: boolean;
  filters?: AppliedFilters;
  onCardsChange?: (cards: KanbanCard[]) => void;
  onNoResults?: (searchTerm: string) => void;
}) {
  const { role, user } = useAuth();
  const canIngress = role === 'analista' || role === 'gestor';
  const { hasReadAt, markRead, loaded: readsLoaded } = useMentionReads(user?.id);

  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [fetching, setFetching] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [move, setMove] = useState<{ id: string } | null>(null);
  const [cancel, setCancel] = useState<{ id: string } | null>(null);
  const [revert, setRevert] = useState<{
    id: string;
    targetStage: string;
    targetLabel: string;
  } | null>(null);
  const [edit, setEdit] = useState<{ cardId: string; applicantId: string } | null>(
    null,
  );
  const [busyIngress, setBusyIngress] = useState<string | null>(null);

  const sensors = useSensors(
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
          listCards('analise', {
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
        // See KanbanBoard for the rationale: assignments map + catalog give
        // us both the chip data and the "Preenchida" flag in one pass.
        const assignmentMap = await listAssignmentsForCards(
          rows.map((r) => r.id),
        ).catch(() => new Map<string, string[]>());
        if (cancelled) return;
        const labelById = new Map(labelCatalog.map((l) => [l.id, l]));
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
        console.error('[kanban-analise] reload', e);
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
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

  // Refetch when a new ficha is created OR when a label is assigned/unassigned
  // anywhere (custom event from LabelsPopover — see KanbanBoard comment).
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

  // Safety net for cross-user sync (see KanbanBoard for full comment):
  // 10s poll while the tab is visible + refetch on tab focus, so labels
  // and mentions converge even if a realtime event is dropped.
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

  // Realtime: any change in area=analise triggers a refetch + busts the
  // EditarFichaModal cache for the affected card so reopening the modal
  // reads fresh data (e.g. assignee_id cleared on return-to-Recebidos).
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
    channelName: 'rt-kanban-cards-analise',
    table: 'kanban_cards',
    filter: 'area=eq.analise',
    onChange: onRealtimeChange,
  });

  // Etiquetas: any change in card_label_assignments may flip the blue
  // visual on a card in this board.
  useTableChanges({
    channelName: 'rt-card-label-assignments-analise',
    table: 'card_label_assignments',
    onChange: onRealtimeChange,
  });

  // Auto-archive loop for Finalizados — every 20s, marks cards older than
  // FINALIZADOS_TTL_SEC as archived. Pure UPDATE; realtime picks it up.
  const isAnalystOrAbove = role === 'analista' || role === 'gestor' || role === 'instalador';
  useEffect(() => {
    if (readOnly || !isAnalystOrAbove) return;
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await autoArchiveFinalizados(FINALIZADOS_TTL_SEC);
    };
    // Kick off once immediately, then tick.
    run();
    const id = setInterval(run, AUTO_ARCHIVE_TICK_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [readOnly, isAnalystOrAbove]);

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
      setMove({ id: c.id });
    },
    [readOnly],
  );

  const ingressar = useCallback(
    async (cardId: string) => {
      if (!canIngress || busyIngress) return;
      setBusyIngress(cardId);
      try {
        await changeStage(cardId, 'analise', 'preenchidas');
        invalidateApplicantCardByCardId(cardId);
        await reload();
      } catch (e) {
        alert(friendlyError(e, 'Não foi possível ingressar'));
      } finally {
        setBusyIngress(null);
      }
    },
    [canIngress, busyIngress, reload, invalidateApplicantCardByCardId],
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
      if (target === 'canceladas') {
        setCancel({ id: cardId });
        return;
      }
      // Reverting a cancelled card: any move OUT of "canceladas" that is not
      // "finalizados" requires a reason via the revert modal.
      const card = cards.find((c) => c.id === cardId);
      if (
        card?.stage === 'canceladas' &&
        target !== 'finalizados' &&
        target !== 'canceladas'
      ) {
        const targetLabel =
          ANALISE_COLUMNS.find((col) => col.key === target)?.title ?? target;
        setRevert({ id: cardId, targetStage: target, targetLabel });
        return;
      }
      try {
        await changeStage(cardId, 'analise', target);
        // Bust the EditarFichaModal cache immediately — don't wait for the
        // realtime payload (race against the user's next click).
        invalidateApplicantCardByCardId(cardId);
        await reload();
      } catch (e) {
        alert(friendlyError(e, 'Falha ao mover'));
      }
    },
    [readOnly, reload, cards, invalidateApplicantCardByCardId],
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
            {ANALISE_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.key}
                droppableId={column.key}
                title={column.title}
                cards={(grouped[column.key] ?? []).map((c) => ({
                  ...c,
                  onOpen: () => openCard(c),
                  onMove: () => openMove(c),
                  extraAction:
                    column.key === 'recebidos' && canIngress && !readOnly ? (
                      <button
                        type="button"
                        data-ignore-card-click
                        onClick={(e) => {
                          e.stopPropagation();
                          ingressar(c.id);
                        }}
                        disabled={busyIngress === c.id}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {busyIngress === c.id ? 'Ingressando…' : 'Ingressar'}
                      </button>
                    ) : undefined,
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
            open={!!move}
            onClose={() => setMove(null)}
            cardId={move?.id ?? ''}
            presetArea="analise"
            onMoved={reload}
          />
          <CancelModal
            open={!!cancel}
            onClose={() => setCancel(null)}
            cardId={cancel?.id ?? ''}
            area="analise"
            onCancelled={reload}
          />
          <RevertCancelModal
            open={!!revert}
            onClose={() => setRevert(null)}
            cardId={revert?.id ?? ''}
            area="analise"
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
