'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { DateSingleKanbanPopover } from '@/components/ui/date-single-kanban-popover';
import { TimeMultiSelect } from '@/components/ui/time-multi-select';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTableChanges } from '@/components/providers/RealtimeProvider';
import {
  DEFAULT_TIMEZONE,
  localDateTimeToUtcISO,
  utcISOToLocalParts,
} from '@/lib/datetime';
import {
  fetchApplicantCard,
  updateApplicant,
  updateCard,
} from '@/services/cadastro';
import { listProfiles, type ProfileLite } from '@/services/profiles';
import { listForCard, type CardAttachment } from '@/services/attachments';
import {
  deleteParecer,
  editParecer,
  addParecer,
  type ParecerNote,
} from '@/services/parecer';
import { setCardDecision } from '@/services/kanban';
import type {
  ComposerDecision,
  ComposerValue,
} from '@/components/unified-composer/UnifiedComposer';
import { ParecerComposer } from '@/features/parecer/ParecerComposer';
import { LabelsPopover } from '@/features/labels/LabelsPopover';
import { TransferOperatorModal } from '@/features/kanban/components/TransferOperatorModal';
import { supabase } from '@/lib/supabase';
import { Field, Select } from './components/Fields';
import { AuditProvider } from '@/features/expanded-ficha/AuditContext';
import { PareceresList } from './components/PareceresList';
import { PLANO_OPTIONS, SVA_OPTIONS, VENC_OPTIONS } from './constants';
import type { AppModel, CardSnapshotPatch } from './types';
import type { PersonType } from '@/lib/types';
import { broadcastFichaPatch, useFichaSync } from '@/hooks/useFichaSync';
import { friendlyError } from '@/lib/errors';
import { fichaKeys, useFichaCache } from '@/hooks/useFichaCache';
import { PresenceBadges } from '@/components/ui/PresenceBadges';
import { PresenceCursors } from '@/components/ui/PresenceCursors';
import { PresenceProvider, usePresenceContext } from '@/features/presence/PresenceContext';

const AUTOSAVE_DEBOUNCE_MS = 300;
const FICHA_PATH = (pt: PersonType, id: string) =>
  `/ficha/${pt === 'PF' ? 'pf' : 'pj'}/${id}`;

const HORA_SLOTS = ['08:00', '10:00', '13:00', '15:00', '17:00'] as const;
// Pairs the user can pick together. Only 08↔10 and 13↔15 are valid combos;
// 17:00 has no partner and is always picked alone.
const HORA_PAIRS: [string, string][] = [
  ['08:00', '10:00'],
  ['13:00', '15:00'],
];

// Visual tokens that mirror Fields.tsx so DatePopover / TimeMultiSelect
// look identical to the regular <Field> inputs in the same row.
const MZ_FIELD_LABEL_CLS =
  'block mb-1.5 text-[14px] font-bold uppercase tracking-wide leading-none text-zinc-600';
const MZ_FIELD_TRIGGER_CLS =
  'h-10 w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-3 text-sm text-zinc-900 outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 transition-colors';

// Input masks (digitsOnly/formatCpf/formatCnpj/formatPhone/formatCep) were
// removed from this modal to mirror the free-typing behavior already adopted
// in the Expanded PF/PJ pages.

/**
 * Normalise hora_at coming from the DB (variants like "08:30", "08:30:00",
 * "08:30:00+00") down to the HH:MM that the picker understands.
 */
function normalizeHoraArr(raw: string[] | null | undefined): string[] {
  if (!raw) return [];
  return raw.map((s) => s.slice(0, 5));
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function EditarFichaModal({
  open,
  onClose,
  cardId,
  applicantId,
  onCardUpdate,
  historicoMode = false,
}: {
  open: boolean;
  onClose: () => void;
  cardId: string;
  applicantId: string;
  onStageChange?: () => void;
  onCardUpdate?: (patch: CardSnapshotPatch) => void;
  // When true the modal is read-only and the primary CTA is "Resgatar Ficha"
  // (opens the Expanded ficha) instead of "Analisar". Used by /historico.
  historicoMode?: boolean;
}) {
  const { role, user, profile } = useAuth();
  // historicoMode forces read-only regardless of role — the Histórico page
  // only allows viewing, never editing.
  const readOnly = historicoMode || role === 'leitor';
  // Only analista / gestor / instalador can author pareceres. Vendedor/leitor
  // see them read-only; the DB enforces via can_user_manage_card.
  const canWriteParecer =
    !readOnly && (role === 'analista' || role === 'gestor' || role === 'instalador');

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const { queryClient, patchApplicantCard, patchCard, invalidateCard } = useFichaCache();

  const [app, setApp] = useState<AppModel>({});
  const [personType, setPersonType] = useState<PersonType>('PF');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [createdBy, setCreatedBy] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [transferModal, setTransferModal] = useState<
    | { role: 'vendor' | 'analyst' }
    | null
  >(null);
  const [cardStage, setCardStage] = useState<string>('');
  const [cardArea, setCardArea] = useState<'comercial' | 'analise'>('comercial');
  const [dueAt, setDueAt] = useState<string>('');
  const [horaArr, setHoraArr] = useState<string[]>([]);
  const [periodo, setPeriodo] = useState<'manha' | 'tarde' | null>(null);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [pareceres, setPareceres] = useState<ParecerNote[]>([]);
  const [attachments, setAttachments] = useState<CardAttachment[]>([]);

  // (Composer state moved into ParecerComposer — single source of truth.)

  // dirty tracking so realtime payloads don't overwrite what the user is typing
  const pendingApp = useRef<Partial<AppModel>>({});
  const pendingCard = useRef<{
    due_at?: string | null;
    hora_at?: string[] | null;
    periodo?: 'manha' | 'tarde' | null;
  }>({});
  const dirtyApp = useRef<Set<keyof AppModel>>(new Set());
  const dirtyCard = useRef<Set<'due_at' | 'hora_at' | 'periodo'>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPF = personType === 'PF';

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open]);

  // Initial load whenever the modal opens for a new card.
  useEffect(() => {
    if (!open || !cardId || !applicantId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [{ applicant, card }, profs, atts, noteRes] = await Promise.all([
          // TanStack Query cache: 2nd+ open of the same card is instant.
          queryClient.fetchQuery({
            queryKey: fichaKeys.applicantCard(applicantId, cardId),
            queryFn: () => fetchApplicantCard(applicantId, cardId),
          }),
          queryClient.fetchQuery({
            queryKey: fichaKeys.profiles(),
            queryFn: () => listProfiles(),
            staleTime: 5 * 60 * 1000, // profiles barely change
          }),
          queryClient.fetchQuery({
            queryKey: fichaKeys.cardAttachments(cardId),
            queryFn: () => listForCard(cardId),
          }),
          supabase
            .from('kanban_cards')
            .select('reanalysis_notes')
            .eq('id', cardId)
            .single(),
        ]);
        if (cancelled) return;
        const { person_type, ...appFields } = applicant;
        setPersonType(person_type);
        setApp(appFields as AppModel);
        setCreatedAt(card.created_at);
        setCreatedBy(card.created_by ?? '');
        setVendorId(card.vendor_id ?? card.created_by ?? '');
        setAssigneeId(card.assignee_id ?? '');
        setCardStage((card.stage ?? '').toLowerCase());
        setCardArea((card.area === 'analise' ? 'analise' : 'comercial'));
        setProfiles(profs);
        setAttachments(atts);
        setPareceres(
          (noteRes.data?.reanalysis_notes ?? []) as ParecerNote[],
        );
        if (card.due_at) {
          const parts = utcISOToLocalParts(card.due_at, DEFAULT_TIMEZONE);
          setDueAt(parts.dateISO ?? '');
        } else {
          setDueAt('');
        }
        setHoraArr(normalizeHoraArr(card.hora_at));
        setPeriodo(card.periodo ?? null);
        dirtyApp.current.clear();
        dirtyCard.current.clear();
        pendingApp.current = {};
        pendingCard.current = {};
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Erro ao carregar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, cardId, applicantId]);

  // Refetch pareceres + attachments after a compose/edit/delete from PareceresList.
  const refreshPareceres = useCallback(async () => {
    if (!cardId) return;
    try {
      // Invalidate before fetching so the same data isn't reused if we
      // ever call this from a stale closure path.
      invalidateCard(cardId);
      const [atts, noteRes] = await Promise.all([
        listForCard(cardId),
        supabase
          .from('kanban_cards')
          .select('reanalysis_notes')
          .eq('id', cardId)
          .single(),
      ]);
      setAttachments(atts);
      const notes = (noteRes.data?.reanalysis_notes ?? []) as ParecerNote[];
      setPareceres(notes);
      if (notes.length > 0) broadcastFichaPatch('card', cardId, { reanalysis_notes: notes });
    } catch (e) {
      console.error('[editar-ficha] refreshPareceres', e);
    }
  }, [cardId, invalidateCard]);

  // ─────────── Controlled callbacks for the migrated <PareceresList> ───────────
  // The legacy list is fully controlled — it calls these for every write,
  // we wrap our services and refresh on success. cardId is captured by
  // closure (anti-P0 contract).
  const capturedCardId = cardId;

  const handleReply = useCallback(
    async (parentId: string, value: ComposerValue): Promise<string | null> => {
      try {
        const { noteId } = await addParecer(capturedCardId, value.text, {
          parentId,
          decision: value.decision ?? null,
        });
        await refreshPareceres();
        return noteId;
      } catch (e) {
        alert(friendlyError(e, 'Falha ao responder'));
        return null;
      }
    },
    [capturedCardId, refreshPareceres],
  );

  const handleEdit = useCallback(
    async (noteId: string, value: ComposerValue) => {
      try {
        await editParecer(capturedCardId, noteId, value.text, {
          decision: value.decision ?? null,
        });
        await refreshPareceres();
      } catch (e) {
        alert(friendlyError(e, 'Falha ao editar'));
        throw e;
      }
    },
    [capturedCardId, refreshPareceres],
  );

  const handleDelete = useCallback(
    async (noteId: string) => {
      try {
        await deleteParecer(capturedCardId, noteId);
        await refreshPareceres();
      } catch (e) {
        alert(friendlyError(e, 'Falha ao excluir'));
        throw e;
      }
    },
    [capturedCardId, refreshPareceres],
  );

  const handleDecisionChange = useCallback(
    async (decision: ComposerDecision | null) => {
      if (!decision) return;
      try {
        await setCardDecision(capturedCardId, decision);
      } catch (e) {
        alert(friendlyError(e, 'Falha ao aplicar decisão'));
      }
    },
    [capturedCardId],
  );

  // (Root composer logic moved into <ParecerComposer mode="create">.)

  // Realtime: applicants row
  useTableChanges({
    channelName: `rt-edit-app-${applicantId}`,
    table: 'applicants',
    filter: `id=eq.${applicantId}`,
    enabled: open,
    onChange: (payload) => {
      const next = (payload.new ?? null) as Partial<AppModel> | null;
      if (!next) return;
      setApp((prev) => {
        const merged: Record<string, unknown> = { ...prev };
        (Object.keys(next) as (keyof AppModel)[]).forEach((key) => {
          if (dirtyApp.current.has(key)) return;
          const v = next[key];
          if (typeof v !== 'undefined') merged[key] = v;
        });
        return merged as AppModel;
      });
    },
  });

  // Realtime: kanban_cards row
  useTableChanges({
    channelName: `rt-edit-card-${cardId}`,
    table: 'kanban_cards',
    filter: `id=eq.${cardId}`,
    enabled: open,
    onChange: (payload) => {
      const next = payload.new as
        | {
            reanalysis_notes?: ParecerNote[];
            due_at?: string | null;
            hora_at?: string[] | null;
            periodo?: 'manha' | 'tarde' | null;
            assignee_id?: string | null;
            vendor_id?: string | null;
          }
        | null;
      if (!next) return;
      if (next.reanalysis_notes !== undefined) {
        setPareceres(next.reanalysis_notes as ParecerNote[]);
      }
      if (!dirtyCard.current.has('due_at') && next.due_at !== undefined) {
        setDueAt(
          next.due_at
            ? (utcISOToLocalParts(next.due_at, DEFAULT_TIMEZONE).dateISO ?? '')
            : '',
        );
      }
      if (!dirtyCard.current.has('hora_at') && next.hora_at !== undefined) {
        setHoraArr(normalizeHoraArr(next.hora_at));
      }
      if (!dirtyCard.current.has('periodo') && next.periodo !== undefined) {
        setPeriodo(next.periodo);
      }
      if (next.assignee_id !== undefined) setAssigneeId(next.assignee_id ?? '');
      if (next.vendor_id !== undefined) setVendorId(next.vendor_id ?? '');
    },
  });

  const flushAutosave = useCallback(async () => {
    if (readOnly) {
      pendingApp.current = {};
      pendingCard.current = {};
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const appPatch = { ...pendingApp.current };
    const cardPatch = { ...pendingCard.current };
    pendingApp.current = {};
    pendingCard.current = {};
    if (Object.keys(appPatch).length === 0 && Object.keys(cardPatch).length === 0) {
      return;
    }
    setStatus('saving');
    try {
      const ops: Promise<unknown>[] = [];
      if (Object.keys(appPatch).length > 0) {
        ops.push(updateApplicant(applicantId, appPatch));
      }
      if (Object.keys(cardPatch).length > 0) {
        ops.push(updateCard(cardId, cardPatch));
      }
      await Promise.all(ops);
      dirtyApp.current.clear();
      dirtyCard.current.clear();
      setStatus('saved');
      // Emit summary patch back to the board for live card updates.
      if (onCardUpdate) {
        const out: CardSnapshotPatch = { id: cardId };
        if ('primary_name' in appPatch) out.applicantName = appPatch.primary_name ?? '';
        if ('cpf_cnpj' in appPatch) out.cpfCnpj = appPatch.cpf_cnpj ?? '';
        if ('phone' in appPatch) out.phone = appPatch.phone ?? '';
        if ('whatsapp' in appPatch) out.whatsapp = appPatch.whatsapp ?? '';
        if ('bairro' in appPatch) out.bairro = appPatch.bairro ?? '';
        if ('due_at' in cardPatch) out.dueAt = cardPatch.due_at ?? null;
        if ('hora_at' in cardPatch) out.horaAt = cardPatch.hora_at?.[0] ?? null;
        onCardUpdate(out);
      }
    } catch (e) {
      setStatus('error');
      console.error('[editar-ficha] autosave', e);
    }
  }, [applicantId, cardId, onCardUpdate, readOnly]);

  const scheduleAutosave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void flushAutosave();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [flushAutosave]);

  const queueAppPatch = useCallback(
    <K extends keyof AppModel>(key: K, value: AppModel[K]) => {
      if (readOnly) return;
      dirtyApp.current.add(key);
      pendingApp.current[key] = value;
      setApp((prev) => ({ ...prev, [key]: value }));
      patchApplicantCard(applicantId, cardId, { [key]: value });
      // Cross-tab echo so an Expanded PF/PJ open elsewhere updates instantly.
      broadcastFichaPatch('app', applicantId, { [key]: value });
      scheduleAutosave();
    },
    [readOnly, scheduleAutosave, applicantId, cardId, patchApplicantCard],
  );

  const queueCardPatch = useCallback(
    (
      key: 'due_at' | 'hora_at' | 'periodo',
      value: string | null | string[],
    ) => {
      if (readOnly) return;
      dirtyCard.current.add(key);
      if (key === 'due_at') pendingCard.current.due_at = value as string | null;
      else if (key === 'hora_at') pendingCard.current.hora_at = value as string[];
      else pendingCard.current.periodo = value as 'manha' | 'tarde' | null;
      broadcastFichaPatch('card', cardId, { [key]: value });
      scheduleAutosave();
    },
    [readOnly, scheduleAutosave, cardId],
  );

  // Listen for parecer updates broadcast by ParecerComposer in other tabs/views.
  useFichaSync('card', cardId ?? '', (patch) => {
    if (patch.reanalysis_notes) {
      setPareceres(patch.reanalysis_notes as ParecerNote[]);
    }
  });

  // Listen for cross-tab edits from Expanded PF/PJ open on the same applicant.
  useFichaSync('app', applicantId, (patch) => {
    setApp((prev) => {
      const merged: Record<string, unknown> = { ...prev };
      for (const k of Object.keys(patch) as (keyof AppModel)[]) {
        if (dirtyApp.current.has(k)) continue;
        merged[k] = patch[k as string];
      }
      return merged as AppModel;
    });
  });

  // Flush any pending writes when the modal closes.
  useEffect(() => {
    if (open) return;
    void flushAutosave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const vendorName = useMemo(() => {
    // vendor_id is the operational owner today; fall back to created_by for
    // any legacy card that somehow bypassed the backfill.
    const effective = vendorId || createdBy;
    if (!effective) return '';
    return profiles.find((p) => p.id === effective)?.full_name ?? '';
  }, [vendorId, createdBy, profiles]);

  const analystName = useMemo(() => {
    if (!assigneeId) return '';
    return profiles.find((p) => p.id === assigneeId)?.full_name ?? '';
  }, [assigneeId, profiles]);

  function openAnalisar() {
    if (!applicantId) return;
    window.open(FICHA_PATH(personType, applicantId), '_blank', 'noopener,noreferrer');
  }

  if (!open) return null;

  return (
    <PresenceProvider cardId={cardId} userId={user?.id} userName={profile?.full_name}>
    <AuditProvider applicantId={applicantId}>
      <div className="fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 sm:items-center">
        <div
          className="flex h-[90vh] w-[96vw] max-w-[1280px] flex-col overflow-hidden rounded-[28px] bg-[var(--neutro)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="header-editar-ficha relative flex items-center gap-4 bg-[var(--verde-primario)] py-6 pl-8 pr-6 text-white">
            <div className="flex items-center gap-5">
              <Image
                src="/wbr-logo.png"
                alt="WBR"
                width={128}
                height={128}
                priority
                style={{ width: 128, height: 128, objectFit: 'cover' }}
              />
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-semibold sm:text-2xl">
                  Editar Ficha
                </span>
                <span className="mt-1 text-sm text-emerald-50/90">
                  Consultar e atualizar dados essenciais
                </span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <ModalPresenceBadges />
              <ModalPresenceCursors />
              {status === 'saving' && (
                <span className="text-sm text-white/90">Salvando…</span>
              )}
              {status === 'error' && (
                <span className="text-sm text-red-200">Erro ao salvar</span>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/15"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 modal-scroll">
            {loading ? (
              <p className="m-auto text-sm text-zinc-500">Carregando…</p>
            ) : error ? (
              <p className="m-auto text-sm text-red-600">{error}</p>
            ) : (
              <div className="w-full">
                {/* Top action row: Etiquetas (left) — Analisar (right).
                    Kept OUTSIDE the read-only wrapper so the Resgatar Ficha
                    CTA stays clickable even when the modal opens in
                    historicoMode (where the rest of the form is locked). */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <LabelsPopover cardId={cardId} area={cardArea} disabled={readOnly || historicoMode} />

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-500">
                      Clique aqui para:
                    </span>
                    <button
                      type="button"
                      onClick={openAnalisar}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      {historicoMode ? 'Resgatar Ficha' : 'Analisar'}
                    </button>
                  </div>
                </div>

                <div
                  className={readOnly ? 'pointer-events-none opacity-80' : ''}
                >

                <div className="grid gap-4 sm:grid-cols-[3fr_2fr]">
                  <Field
                    label={isPF ? 'Nome do Cliente' : 'Razão Social'}
                    value={app.primary_name ?? ''}
                    onChange={(v) => queueAppPatch('primary_name', v)}
                    onBlur={() => void flushAutosave()}
                    auditField="primary_name"
                  />
                  <Field
                    label={isPF ? 'CPF' : 'CNPJ'}
                    value={app.cpf_cnpj ?? ''}
                    onChange={(v) => queueAppPatch('cpf_cnpj', v)}
                    onBlur={() => void flushAutosave()}
                    auditField="cpf_cnpj"
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Field
                    label="Telefone"
                    value={app.phone ?? ''}
                    onChange={(v) => queueAppPatch('phone', v)}
                    onBlur={() => void flushAutosave()}
                    auditField="phone"
                  />
                  <Field
                    label="Whatsapp"
                    value={app.whatsapp ?? ''}
                    onChange={(v) => queueAppPatch('whatsapp', v)}
                    onBlur={() => void flushAutosave()}
                    auditField="whatsapp"
                  />
                  <Field
                    label="E-mail"
                    value={app.email ?? ''}
                    onChange={(v) => queueAppPatch('email', v)}
                    onBlur={() => void flushAutosave()}
noUppercase
auditField="email"
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[5fr_2fr]">
                  <Field
                    label="Logradouro"
                    value={app.address_line ?? ''}
                    onChange={(v) => queueAppPatch('address_line', v)}
                    onBlur={() => void flushAutosave()}
                    auditField="address_line"
                  />
                  <Field
                    label="Número"
                    value={app.address_number ?? ''}
                    onChange={(v) => queueAppPatch('address_number', v)}
                    onBlur={() => void flushAutosave()}
                    auditField="address_number"
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Field
                    label="Complemento"
                    value={app.address_complement ?? ''}
                    onChange={(v) => queueAppPatch('address_complement', v)}
                    onBlur={() => void flushAutosave()}
                    auditField="address_complement"
                  />
                  <Field
                    label="Bairro"
                    value={app.bairro ?? ''}
                    onChange={(v) => queueAppPatch('bairro', v)}
                    onBlur={() => void flushAutosave()}
                    auditField="bairro"
                  />
                  <Field
                    label="CEP"
                    value={app.cep ?? ''}
                    onChange={(v) => queueAppPatch('cep', v)}
                    onBlur={() => void flushAutosave()}
                    auditField="cep"
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-4">
                  <Select
                    label="Plano de Internet"
                    value={app.plano_acesso ?? ''}
                    options={PLANO_OPTIONS}
                    onChange={(v) => queueAppPatch('plano_acesso', v)}
                  />
                  <Select
                    label="Dia de vencimento"
                    value={app.venc != null ? String(app.venc) : ''}
                    options={VENC_OPTIONS.map((v) => v)}
                    onChange={(v) =>
                      queueAppPatch('venc', v ? Number(v) : null)
                    }
                  />
                  <Select
                    label="SVA Avulso"
                    value={app.sva_avulso ?? ''}
                    options={SVA_OPTIONS}
                    onChange={(v) => queueAppPatch('sva_avulso', v)}
                  />
                  <Select
                    label="Carnê impresso"
                    value={app.carne_impresso ? 'Sim' : 'Não'}
                    options={['Sim', 'Não']}
                    onChange={(v) => queueAppPatch('carne_impresso', v === 'Sim')}
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Field
                    label="Feito em"
                    disabled
                    value={
                      createdAt
                        ? new Date(createdAt).toLocaleString('pt-BR')
                        : ''
                    }
                    onChange={() => {}}
                  />
                  <DateSingleKanbanPopover
                    label="Instalação agendada para"
                    labelClassName={MZ_FIELD_LABEL_CLS}
                    triggerClassName={MZ_FIELD_TRIGGER_CLS}
                    value={dueAt}
                    onChange={(dateIso) => {
                      setDueAt(dateIso ?? '');
                      const utc = dateIso
                        ? (localDateTimeToUtcISO(
                            dateIso,
                            '12:00',
                            DEFAULT_TIMEZONE,
                          ) ?? null)
                        : null;
                      queueCardPatch('due_at', utc);
                    }}
                    disabled={readOnly}
                  />
                  <TimeMultiSelect
                    label="Horário"
                    labelClassName={MZ_FIELD_LABEL_CLS}
                    triggerClassName={MZ_FIELD_TRIGGER_CLS}
                    times={HORA_SLOTS}
                    allowedPairs={HORA_PAIRS}
                    value={horaArr}
                    date={dueAt || undefined}
                    onChange={(arr) => {
                      setHoraArr(arr);
                      queueCardPatch(
                        'hora_at',
                        arr.length ? arr.map((t) => `${t}:00`) : null,
                      );
                      if (arr.length > 0 && periodo) {
                        setPeriodo(null);
                        queueCardPatch('periodo', null);
                      }
                    }}
                    periodos={['manha', 'tarde'] as const}
                    periodoLabels={{ manha: 'Manhã', tarde: 'Tarde' }}
                    periodoValue={periodo}
                    onPeriodoChange={(p) => {
                      setPeriodo(p as 'manha' | 'tarde' | null);
                      queueCardPatch('periodo', p);
                      if (p && horaArr.length > 0) {
                        setHoraArr([]);
                        queueCardPatch('hora_at', null);
                      }
                    }}
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      !readOnly && setTransferModal({ role: 'vendor' })
                    }
                    disabled={readOnly}
                    className="group block w-full text-left disabled:cursor-not-allowed"
                    title={readOnly ? undefined : 'Clique para transferir'}
                  >
                    <div className="pointer-events-none">
                      <Field
                        label="Responsável Equipe Comercial"
                        disabled
                        value={vendorName}
                        onChange={() => {}}
                      />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      !readOnly &&
                      assigneeId &&
                      setTransferModal({ role: 'analyst' })
                    }
                    disabled={readOnly || !assigneeId}
                    className="group block w-full text-left disabled:cursor-not-allowed"
                    title={
                      readOnly
                        ? undefined
                        : assigneeId
                          ? 'Clique para transferir'
                          : 'Só é válido quando existe analista atribuído'
                    }
                  >
                    <div className="pointer-events-none">
                      <Field
                        label="Responsável Equipe Cadastro"
                        disabled
                        value={analystName}
                        onChange={() => {}}
                      />
                    </div>
                  </button>
                </div>

                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-700">
                    Parecer
                  </h3>

                  {canWriteParecer && (
                    <div className="mb-4">
                      <ParecerComposer
                        key={`root-${cardId}`}
                        mode="create"
                        cardId={cardId}
                        applicantId={applicantId}
                        profiles={profiles}
                        currentUserId={user?.id ?? null}
                        onSuccess={refreshPareceres}
                        cardStage={cardStage}
                      />
                    </div>
                  )}

                  <PareceresList
                    cardId={cardId}
                    notes={pareceres}
                    attachments={attachments}
                    profiles={profiles}
                    applicantName={app.primary_name ?? null}
                    currentUserId={user?.id ?? null}
                    canWrite={canWriteParecer}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDecisionChange={handleDecisionChange}
                    onAttachmentUploaded={refreshPareceres}
                  />
                </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {transferModal && (
        <TransferOperatorModal
          open={!!transferModal}
          onClose={() => setTransferModal(null)}
          role={transferModal.role}
          cardId={cardId}
          currentId={
            transferModal.role === 'vendor'
              ? vendorId || createdBy || null
              : assigneeId || null
          }
          profiles={profiles}
          onTransferred={(newId) => {
            if (transferModal.role === 'vendor') {
              setVendorId(newId);
              patchCard(applicantId, cardId, { vendor_id: newId });
            } else {
              setAssigneeId(newId);
              patchCard(applicantId, cardId, { assignee_id: newId });
            }
          }}
        />
      )}
    </AuditProvider>
    </PresenceProvider>
  );
}

function ModalPresenceBadges() {
  const ctx = usePresenceContext();
  return <PresenceBadges peers={ctx?.peers ?? []} />;
}

function ModalPresenceCursors() {
  const ctx = usePresenceContext();
  return <PresenceCursors cursors={ctx?.peerCursors ?? []} />;
}
