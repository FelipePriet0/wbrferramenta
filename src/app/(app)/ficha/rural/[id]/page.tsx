'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useFieldHistory } from '@/hooks/useFieldHistory';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTableChanges } from '@/components/providers/RealtimeProvider';
import {
  fetchExpandedRural,
  updateApplicant,
  updateCard,
  updateRuralFicha,
} from '@/services/cadastro';
import { listProfiles, type ProfileLite } from '@/services/profiles';
import {
  listForCard,
  type CardAttachment,
} from '@/services/attachments';
import {
  addParecer,
  deleteParecer,
  editParecer,
  type ParecerNote,
} from '@/services/parecer';
import { setCardDecision } from '@/services/kanban';
import {
  RURAL_PLANO_OPTIONS,
  RURAL_SVA_OPTIONS,
  TAXA_INST_OPTIONS,
  VENC_OPTIONS,
  VIA_OPTIONS,
} from '@/features/editar-ficha/constants';
import { ParecerComposer } from '@/features/parecer/ParecerComposer';
import { PareceresList } from '@/features/editar-ficha/components/PareceresList';
import type {
  ComposerDecision,
  ComposerValue,
} from '@/components/unified-composer/UnifiedComposer';
import { DateSingleKanbanPopover } from '@/components/ui/date-single-kanban-popover';
import { TimeMultiSelect } from '@/components/ui/time-multi-select';
import {
  DEFAULT_TIMEZONE,
  localDateTimeToUtcISO,
  utcISOToLocalParts,
} from '@/lib/datetime';
import { broadcastFichaPatch, useFichaSync } from '@/hooks/useFichaSync';
import { fichaKeys, useFichaCache } from '@/hooks/useFichaCache';
import { friendlyError } from '@/lib/errors';
import { PresenceBadges } from '@/components/ui/PresenceBadges';
import { PresenceCursors } from '@/components/ui/PresenceCursors';
import { PresenceProvider, usePresenceContext } from '@/features/presence/PresenceContext';
import { formatCpf, formatDateBR, formatPhoneBR } from '@/lib/masks';
import { FreshFichaConfetti } from '@/components/effects/welcome-confetti';
import { AdobeField } from '@/features/expanded-ficha/components/AdobeField';
import { AdobeTextarea } from '@/features/expanded-ficha/components/AdobeTextarea';
import { AdobeCard } from '@/features/expanded-ficha/components/AdobeCard';
import { AdobeSelect } from '@/features/expanded-ficha/components/AdobeSelect';
import { VeiculoPopover } from '@/features/expanded-ficha/components/VeiculoPopover';
import {
  ESTADO_CIVIL,
  MEIO,
  RURAL_NAS_OUTRAS,
  RURAL_TIPO_MORADIA,
  SIM_NAO_BOOL,
  VINCULO,
} from '@/features/expanded-ficha/enums';
import type {
  ExpandedAppModel,
  ExpandedCard,
  FieldAudit,
  FieldStatus,
  RuralModel,
} from '@/features/expanded-ficha/types';
import { AuditProvider } from '@/features/expanded-ficha/AuditContext';

const AUTOSAVE_DEBOUNCE_MS = 300;
const ZOOM_KEY = 'form-zoom-rural';
const ZOOM_MIN = 0.75;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.05;

const HORA_SLOTS = ['08:00', '10:00', '13:00', '15:00', '17:00'] as const;
const HORA_PAIRS: [string, string][] = [
  ['08:00', '10:00'],
  ['13:00', '15:00'],
];

const SIM_NAO_OPTIONS = [...SIM_NAO_BOOL.uiOptions];

function normalizeHora(arr: string[] | null | undefined): string[] {
  return (arr ?? []).map((s) => s.slice(0, 5));
}

export default function ExpandedRuralPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const applicantId = params.id;
  const preferCardId = search.get('card');

  const { user, profile, role, loading: authLoading } = useAuth();
  const isLeitor = role === 'leitor';

  const [app, setApp] = useState<ExpandedAppModel>({});
  const [rural, setRural] = useState<RuralModel>({});
  const [card, setCard] = useState<ExpandedCard | null>(null);

  const readOnly = isLeitor || !!card?.archived_at;
  const canWriteParecer =
    !readOnly && (role === 'analista' || role === 'gestor');
  const [dueAt, setDueAt] = useState<string>('');
  const [horaArr, setHoraArr] = useState<string[]>([]);
  const [periodo, setPeriodo] = useState<'manha' | 'tarde' | null>(null);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [attachments, setAttachments] = useState<CardAttachment[]>([]);
  const [pareceres, setPareceres] = useState<ParecerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('');
  const [statusBy, setStatusBy] = useState<Record<string, FieldStatus>>({});
  const [zoom, setZoom] = useState<number>(1);
  const { queryClient, invalidateCard } = useFichaCache();
  // Slot host for the zoom controls, rendered into AppLayoutClient's header
  // (#mz-page-header-slot) via a Portal — keeps the zoom on the same line as
  // the breadcrumb without coupling the layout to this page.
  const [zoomSlot, setZoomSlot] = useState<HTMLElement | null>(null);
  const [undoSlot, setUndoSlot] = useState<HTMLElement | null>(null);
  const [presenceSlot, setPresenceSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setZoomSlot(document.getElementById('mz-page-header-slot'));
    setUndoSlot(document.getElementById('mz-undo-redo-slot'));
    setPresenceSlot(document.getElementById('mz-presence-slot'));
  }, []);


  const { push: historyPush, undo: historyUndo, redo: historyRedo, canUndo, canRedo, isUndoRedo } = useFieldHistory();
  const appRef = useRef(app);
  appRef.current = app;
  const ruralRef = useRef(rural);
  ruralRef.current = rural;

  const pendingApp = useRef<Partial<ExpandedAppModel>>({});
  const pendingRural = useRef<Partial<RuralModel>>({});
  const pendingCard = useRef<{
    due_at?: string | null;
    hora_at?: string[] | null;
    periodo?: 'manha' | 'tarde' | null;
  }>({});
  const dirtyApp = useRef<Set<keyof ExpandedAppModel>>(new Set());
  const dirtyRural = useRef<Set<keyof RuralModel>>(new Set());
  const dirtyCard = useRef<Set<'due_at' | 'hora_at' | 'periodo'>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFieldStatus = useCallback((key: string, s: FieldStatus) => {
    setStatusBy((prev) => {
      if (prev[key] === s) return prev;
      return { ...prev, [key]: s };
    });
  }, []);

  const flushAutosave = useCallback(async () => {
    if (readOnly) {
      pendingApp.current = {};
      pendingRural.current = {};
      pendingCard.current = {};
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const appPatch = { ...pendingApp.current };
    const ruralPatch = { ...pendingRural.current };
    const cardPatch = { ...pendingCard.current };
    pendingApp.current = {};
    pendingRural.current = {};
    pendingCard.current = {};
    const appKeys = Object.keys(appPatch);
    const ruralKeys = Object.keys(ruralPatch);
    const cardKeys = Object.keys(cardPatch);
    if (appKeys.length + ruralKeys.length + cardKeys.length === 0) return;

    setStatusText('Salvando…');
    [...appKeys, ...ruralKeys, ...cardKeys].forEach((k) =>
      setFieldStatus(k, 'pending'),
    );

    try {
      const ops: Promise<unknown>[] = [];
      if (appKeys.length) ops.push(updateApplicant(applicantId, appPatch));
      if (ruralKeys.length) ops.push(updateRuralFicha(applicantId, ruralPatch));
      if (cardKeys.length && card?.id) ops.push(updateCard(card.id, cardPatch));
      await Promise.all(ops);
      // Only remove dirty flags for keys NOT re-queued while the save was in-flight.
      // Clearing unconditionally would drop the guard on fields the user is still
      // typing, letting the realtime echo overwrite them and jump the cursor.
      for (const k of appKeys) {
        if (!(k in pendingApp.current)) dirtyApp.current.delete(k as keyof ExpandedAppModel);
      }
      for (const k of ruralKeys) {
        if (!(k in pendingRural.current)) dirtyRural.current.delete(k as keyof RuralModel);
      }
      for (const k of cardKeys) {
        if (!(k in pendingCard.current)) dirtyCard.current.delete(k as 'due_at' | 'hora_at' | 'periodo');
      }
      [...appKeys, ...ruralKeys, ...cardKeys].forEach((k) =>
        setFieldStatus(k, 'idle'),
      );
      setStatusText('Salvo');
      setTimeout(() => setStatusText(''), 1200);
      // Re-fetch field_audit so the "quem preencheu" footer aparece imediatamente.
      const AUDITED = new Set(['info_spc','info_pesquisador','info_relevantes','info_mk','observacoes']);
      if (appKeys.some((k) => AUDITED.has(k))) {
        supabase
          .from('applicants')
          .select('field_audit')
          .eq('id', applicantId)
          .single()
          .then(({ data }) => {
            if (data?.field_audit) {
              setApp((prev) => ({ ...prev, field_audit: data.field_audit as FieldAudit }));
            }
          });
      }
    } catch (e) {
      console.error('[expanded-rural] autosave', e);
      [...appKeys, ...ruralKeys, ...cardKeys].forEach((k) =>
        setFieldStatus(k, 'error'),
      );
      setStatusText('Erro ao salvar');
    }
  }, [applicantId, card?.id, readOnly, setFieldStatus]);

  const scheduleAutosave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void flushAutosave(), AUTOSAVE_DEBOUNCE_MS);
  }, [flushAutosave]);

  const queueApp = useCallback(
    <K extends keyof ExpandedAppModel>(key: K, value: ExpandedAppModel[K]) => {
      if (readOnly) return;
      const oldValue = appRef.current[key];
      dirtyApp.current.add(key);
      pendingApp.current[key] = value;
      setApp((prev) => ({ ...prev, [key]: value }));
      setFieldStatus(key as string, 'pending');
      broadcastFichaPatch('app', applicantId, { [key]: value });
      scheduleAutosave();
      historyPush(
        `app:${key as string}`,
        () => { if (!isUndoRedo.current) return; dirtyApp.current.add(key); pendingApp.current[key] = oldValue; setApp((prev) => ({ ...prev, [key]: oldValue })); setFieldStatus(key as string, 'pending'); broadcastFichaPatch('app', applicantId, { [key]: oldValue }); scheduleAutosave(); },
        () => { if (!isUndoRedo.current) return; dirtyApp.current.add(key); pendingApp.current[key] = value; setApp((prev) => ({ ...prev, [key]: value })); setFieldStatus(key as string, 'pending'); broadcastFichaPatch('app', applicantId, { [key]: value }); scheduleAutosave(); },
      );
    },
    [readOnly, scheduleAutosave, setFieldStatus, applicantId, historyPush, isUndoRedo],
  );

  const queueRural = useCallback(
    (patch: Partial<RuralModel>) => {
      if (readOnly) return;
      for (const k of Object.keys(patch) as (keyof RuralModel)[]) {
        dirtyRural.current.add(k);
        (pendingRural.current as Record<string, unknown>)[k] = patch[k];
        setFieldStatus(k as string, 'pending');
      }
      setRural((prev) => ({ ...prev, ...patch }));
      broadcastFichaPatch('rural', applicantId, patch as Record<string, unknown>);
      scheduleAutosave();
    },
    [readOnly, scheduleAutosave, setFieldStatus, applicantId],
  );

  const queueRuralField = useCallback(
    <K extends keyof RuralModel>(key: K, value: RuralModel[K]) => {
      const oldValue = ruralRef.current[key];
      queueRural({ [key]: value } as Partial<RuralModel>);
      historyPush(
        `rural:${key as string}`,
        () => { if (!isUndoRedo.current) return; dirtyRural.current.add(key); (pendingRural.current as Record<string, unknown>)[key as string] = oldValue; setRural((prev) => ({ ...prev, [key]: oldValue })); setFieldStatus(key as string, 'pending'); scheduleAutosave(); },
        () => { if (!isUndoRedo.current) return; dirtyRural.current.add(key); (pendingRural.current as Record<string, unknown>)[key as string] = value; setRural((prev) => ({ ...prev, [key]: value })); setFieldStatus(key as string, 'pending'); scheduleAutosave(); },
      );
    },
    [queueRural, historyPush, isUndoRedo, setFieldStatus, scheduleAutosave],
  );

  const queueCard = useCallback(
    (
      key: 'due_at' | 'hora_at' | 'periodo',
      value: string | null | string[],
    ) => {
      if (readOnly) return;
      dirtyCard.current.add(key);
      if (key === 'due_at') pendingCard.current.due_at = value as string | null;
      else if (key === 'hora_at') pendingCard.current.hora_at = value as string[];
      else pendingCard.current.periodo = value as 'manha' | 'tarde' | null;
      setFieldStatus(key, 'pending');
      if (card?.id) {
        broadcastFichaPatch('card', card.id, { [key]: value });
      }
      scheduleAutosave();
    },
    [readOnly, scheduleAutosave, setFieldStatus, card?.id],
  );

  // Listen for cross-tab edits and merge non-dirty fields into local state.
  useFichaSync('app', applicantId, (patch) => {
    setApp((prev) => {
      const merged: Record<string, unknown> = { ...prev };
      for (const k of Object.keys(patch) as (keyof ExpandedAppModel)[]) {
        if (dirtyApp.current.has(k)) continue;
        merged[k] = patch[k as string];
      }
      return merged as ExpandedAppModel;
    });
  });
  useFichaSync('rural', applicantId, (patch) => {
    setRural((prev) => {
      const merged: Record<string, unknown> = { ...prev };
      for (const k of Object.keys(patch) as (keyof RuralModel)[]) {
        if (dirtyRural.current.has(k)) continue;
        merged[k] = patch[k as string];
      }
      return merged as RuralModel;
    });
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError('Você precisa estar logado.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [bundle, profilesData] = await Promise.all([
          queryClient.fetchQuery({
            queryKey: fichaKeys.expandedRural(applicantId, preferCardId),
            queryFn: () => fetchExpandedRural(applicantId, preferCardId),
          }),
          queryClient.fetchQuery({
            queryKey: fichaKeys.profiles(),
            queryFn: () => listProfiles(),
            staleTime: 5 * 60 * 1000,
          }),
        ]);
        if (cancelled) return;
        setApp(bundle.applicant);
        setRural(bundle.rural);
        setCard(bundle.card);
        setProfiles(profilesData);
        if (bundle.card?.due_at) {
          const parts = utcISOToLocalParts(bundle.card.due_at, DEFAULT_TIMEZONE);
          setDueAt(parts.dateISO ?? '');
        }
        setHoraArr(normalizeHora(bundle.card?.hora_at));
        setPeriodo(bundle.card?.periodo ?? null);
        if (bundle.card?.id) {
          const [atts, notesRes] = await Promise.all([
            listForCard(bundle.card.id),
            supabase
              .from('kanban_cards')
              .select('reanalysis_notes')
              .eq('id', bundle.card.id)
              .maybeSingle(),
          ]);
          if (cancelled) return;
          setAttachments(atts);
          setPareceres(
            (notesRes.data?.reanalysis_notes ?? []) as ParecerNote[],
          );
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Erro ao carregar a ficha');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // user?.id (not the full user object) because Supabase Auth re-emits
    // session on visibility/token-refresh, which gives `user` a new identity
    // even when the id is the same. Without this, every alt+tab away and back
    // re-triggered fetchExpandedRural, calling setApp/setRural with the not-yet-
    // -saved row from the DB and "ghosting" the field the user just typed.
  }, [applicantId, preferCardId, authLoading, user?.id]);

  const cardId = card?.id ?? '';

  useFichaSync('card', cardId, (patch) => {
    if (patch.reanalysis_notes) {
      setPareceres(patch.reanalysis_notes as ParecerNote[]);
    }
  });

  const refreshPareceres = useCallback(async () => {
    if (!cardId) return;
    try {
      invalidateCard(cardId);
      const [atts, notesRes] = await Promise.all([
        listForCard(cardId),
        supabase
          .from('kanban_cards')
          .select('reanalysis_notes')
          .eq('id', cardId)
          .maybeSingle(),
      ]);
      setAttachments(atts);
      const notes = (notesRes.data?.reanalysis_notes ?? []) as ParecerNote[];
      setPareceres(notes);
      if (notes.length > 0) broadcastFichaPatch('card', cardId, { reanalysis_notes: notes });
    } catch (e) {
      console.error('[expanded-rural] refreshPareceres', e);
    }
  }, [cardId, invalidateCard]);

  useTableChanges({
    channelName: `rt-rural-app-${applicantId}`,
    table: 'applicants',
    filter: `id=eq.${applicantId}`,
    onChange: (payload) => {
      const next = payload.new as Partial<ExpandedAppModel> | null;
      if (!next) return;
      const focusedKey = (document.activeElement as HTMLElement)?.dataset?.fieldKey;
      setApp((prev) => {
        const merged: Record<string, unknown> = { ...prev };
        (Object.keys(next) as (keyof ExpandedAppModel)[]).forEach((k) => {
          if (dirtyApp.current.has(k)) return;
          if (k === focusedKey) return;
          if (typeof next[k] !== 'undefined') merged[k] = next[k];
        });
        return merged as ExpandedAppModel;
      });
    },
  });

  useTableChanges({
    channelName: `rt-rural-fichas-${applicantId}`,
    table: 'rural_fichas',
    filter: `applicant_id=eq.${applicantId}`,
    onChange: (payload) => {
      const next = payload.new as Partial<RuralModel> | null;
      if (!next) return;
      const focusedKey = (document.activeElement as HTMLElement)?.dataset?.fieldKey;
      setRural((prev) => {
        const merged: Record<string, unknown> = { ...prev };
        (Object.keys(next) as (keyof RuralModel)[]).forEach((k) => {
          if (dirtyRural.current.has(k)) return;
          if (k === focusedKey) return;
          if (typeof next[k] !== 'undefined') merged[k] = next[k];
        });
        return merged as RuralModel;
      });
    },
  });

  useTableChanges({
    channelName: `rt-rural-card-${cardId}`,
    table: 'kanban_cards',
    filter: `id=eq.${cardId}`,
    enabled: !!cardId,
    onChange: (payload) => {
      const next = payload.new as
        | {
            reanalysis_notes?: ParecerNote[];
            due_at?: string | null;
            hora_at?: string[] | null;
            periodo?: 'manha' | 'tarde' | null;
          }
        | null;
      if (!next) return;
      if (next.reanalysis_notes !== undefined) {
        setPareceres(next.reanalysis_notes as ParecerNote[]);
      }
      if (!dirtyCard.current.has('due_at') && next.due_at !== undefined) {
        if (next.due_at) {
          const parts = utcISOToLocalParts(next.due_at, DEFAULT_TIMEZONE);
          setDueAt(parts.dateISO ?? '');
        } else {
          setDueAt('');
        }
      }
      if (!dirtyCard.current.has('hora_at') && next.hora_at !== undefined) {
        setHoraArr(normalizeHora(next.hora_at));
      }
      if (!dirtyCard.current.has('periodo') && next.periodo !== undefined) {
        setPeriodo(next.periodo);
      }
    },
  });

  useEffect(() => {
    try {
      const v = parseFloat(localStorage.getItem(ZOOM_KEY) || '1');
      if (Number.isFinite(v) && v >= ZOOM_MIN && v <= ZOOM_MAX) setZoom(v);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(ZOOM_KEY, String(zoom));
    } catch {
      // ignore
    }
  }, [zoom]);


  // Flush pending writes on unmount, tab close, or visibility change so the
  // 1.8s autosave debounce never silently drops data.
  useEffect(() => {
    const flushNow = () => {
      void flushAutosave();
    };
    window.addEventListener('beforeunload', flushNow);
    document.addEventListener('visibilitychange', flushNow);
    return () => {
      window.removeEventListener('beforeunload', flushNow);
      document.removeEventListener('visibilitychange', flushNow);
      flushNow();
    };
  }, [flushAutosave]);

  // ─────────── Cascades ───────────
  // tipo_moradia stores the canonical lowercase enum value. A ficha Rural não
  // tem bloco de locador, então a troca de moradia apenas persiste o valor.
  const onChangeTipoMoradia = (canon: string | null) => {
    queueRuralField('tipo_moradia', canon);
  };

  // ─────────── Parecer handlers ───────────
  const capturedCardId = cardId;
  const handleReply = useCallback(
    async (parentId: string, value: ComposerValue): Promise<string | null> => {
      if (!capturedCardId) return null;
      try {
        const { noteId } = await addParecer(capturedCardId, value.text, {
          parentId,
          decision: value.decision ?? null,
          mentions: value.mentions
            ?.filter((m): m is { id: string; label: string } => !!m.id)
            .map((m) => ({ id: m.id, label: m.label })),
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
      if (!capturedCardId) return;
      try {
        await editParecer(capturedCardId, noteId, value.text, {
          decision: value.decision ?? null,
          mentions: value.mentions
            ?.filter((m): m is { id: string; label: string } => !!m.id)
            .map((m) => ({ id: m.id, label: m.label })),
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
      if (!capturedCardId) return;
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
      if (!capturedCardId || !decision) return;
      try {
        await setCardDecision(capturedCardId, decision);
      } catch (e) {
        alert(friendlyError(e, 'Falha ao aplicar decisão'));
      }
    },
    [capturedCardId],
  );

  const vendorName = useMemo(() => {
    if (!card?.vendor_id) return '';
    return profiles.find((p) => p.id === card.vendor_id)?.full_name ?? '';
  }, [card?.vendor_id, profiles]);

  const fa = (key: keyof FieldAudit) => {
    const e = app.field_audit?.[key];
    if (!e) return undefined;
    return { name: e.by_name, at: e.at, action: e.action };
  };

  const s = (k: string): FieldStatus => statusBy[k] ?? 'idle';

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Carregando ficha…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  const zoomControls = (
    <>
      <button
        type="button"
        onClick={() =>
          setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100))
        }
        className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
      >
        −
      </button>
      <button
        type="button"
        onClick={() => setZoom(1)}
        className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        onClick={() =>
          setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100))
        }
        className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
      >
        +
      </button>
    </>
  );

  return (
    <PresenceProvider cardId={cardId} userId={user?.id} userName={profile?.full_name}>
    <AuditProvider applicantId={applicantId}>
    {app.primary_name && <title>{app.primary_name} — WBRFerramenta</title>}
    <RuralPresenceCursors />
    <div className="form-zoom-wrap flex h-full flex-col overflow-x-hidden">
      <FreshFichaConfetti />
      {zoomSlot && createPortal(zoomControls, zoomSlot)}
      {presenceSlot && createPortal(<RuralPresenceBadges />, presenceSlot)}
      {undoSlot && createPortal(
        <>
          <button type="button" onClick={historyUndo} disabled={!canUndo} title="Desfazer" className="rounded-full p-1.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={historyRedo} disabled={!canRedo} title="Refazer" className="rounded-full p-1.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <Redo2 className="h-4 w-4" />
          </button>
        </>,
        undoSlot,
      )}

      <div className="form-zoom-scaler" style={{ zoom }}>
        <div
          id="mz-print-root"
          data-tipo="rural"
          data-id={applicantId}
          data-name={app.primary_name ?? ''}
          className={`mz-form ficha-pf expanded-portrait px-3 py-6 ${readOnly ? 'pointer-events-none opacity-85' : ''}`}
        >
          <div
            className="mb-4 h-5 text-sm font-medium"
            style={{
              color: 'var(--verde-primario)',
              opacity: statusText ? 1 : 0,
            }}
          >
            {statusText || ' '}
          </div>

          <AdobeCard>
            {/* Nome | CPF | Nasc | ID */}
            <div className="flex gap-x-[5px]">
              <AdobeField
                label="Nome"
                className="flex-[24] min-w-0"
                value={app.primary_name ?? ''}
                onChange={(v) => queueApp('primary_name', v)}
                status={s('primary_name')}
                auditField="primary_name"
              />
              <AdobeField
                label="CPF"
                className="flex-[8] min-w-0"
                value={app.cpf_cnpj ?? ''}
                onChange={(v) => queueApp('cpf_cnpj', formatCpf(v))}
                status={s('cpf_cnpj')}
                inputMode="numeric"
                auditField="cpf_cnpj"
              />
              <AdobeField
                label="Nasc"
                className="flex-[6] min-w-0"
                value={(rural.birth_date as string | null | undefined) ?? ''}
                onChange={(v) => queueRuralField('birth_date', formatDateBR(v))}
                status={s('birth_date')}
                inputMode="numeric"
                auditField="birth_date"
              />
              <AdobeField
                label="ID"
                className="flex-[3] min-w-0"
                value={rural.idade != null ? String(rural.idade) : ''}
                onChange={(v) => {
                  setRural((prev) => ({ ...prev, idade: v }));
                  if (v === '') queueRuralField('idade', null);
                  else {
                    const n = Number(v);
                    if (Number.isInteger(n) && n >= 0 && n <= 130) {
                      queueRuralField('idade', n);
                    }
                  }
                }}
                status={s('idade')}
                auditField="idade"
              />
            </div>
            {/* Tel | Whats | Do PS */}
            <div className="mt-4 flex gap-x-[5px] items-start">
              <AdobeField
                label="Tel"
                className="flex-[13] min-w-0"
                value={app.phone ?? ''}
                onChange={(v) => queueApp('phone', formatPhoneBR(v))}
                status={s('phone')}
                inputMode="tel"
                auditField="phone"
              />
              <AdobeField
                label="Whats"
                className="flex-[13] min-w-0"
                value={app.whatsapp ?? ''}
                onChange={(v) => queueApp('whatsapp', formatPhoneBR(v))}
                status={s('whatsapp')}
                inputMode="tel"
                auditField="whatsapp"
              />
              <AdobeField
                label="Do PS"
                className="flex-[41] min-w-0"
                value={rural.do_ps ?? ''}
                onChange={(v) => queueRuralField('do_ps', v)}
                red
                status={s('do_ps')}
                auditField="do_ps"
              />
            </div>
            {/* Natural | UF | E-mail */}
            <div className="mt-4 flex gap-x-[5px]">
              <AdobeField
                label="Natural"
                className="flex-[13] min-w-0"
                value={rural.naturalidade ?? ''}
                onChange={(v) => queueRuralField('naturalidade', v)}
                status={s('naturalidade')}
                auditField="naturalidade"
              />
              <AdobeField
                label="UF"
                className="flex-[4] min-w-0"
                value={rural.uf_naturalidade ?? ''}
                onChange={(v) => queueRuralField('uf_naturalidade', v)}
                status={s('uf_naturalidade')}
                auditField="uf_naturalidade"
              />
              <AdobeField
                label="E-mail"
                className="flex-[34] min-w-0"
                blue
                value={app.email ?? ''}
                onChange={(v) => queueApp('email', v)}
                status={s('email')}
noUppercase
auditField="email"
              />
            </div>
            {/* Fazenda / Sítio / Chácara | Localização | Compl */}
            <div className="mt-4 flex gap-x-[5px]">
              <AdobeField
                label="Fazenda / Sítio / Chácara"
                className="flex-[40] min-w-0"
                value={rural.fazenda ?? ''}
                onChange={(v) => queueRuralField('fazenda', v)}
                status={s('fazenda')}
                auditField="fazenda"
              />
              <AdobeField
                label="Localização"
                className="flex-[20] min-w-0"
                value={rural.localizacao ?? ''}
                onChange={(v) => queueRuralField('localizacao', v)}
                status={s('localizacao')}
                auditField="localizacao"
              />
              <AdobeField
                label="Compl"
                className="flex-[25] min-w-0"
                value={app.address_complement ?? ''}
                onChange={(v) => queueApp('address_complement', v)}
                status={s('address_complement')}
                auditField="address_complement"
              />
            </div>
            {/* End. Urbano | Pertence a */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <AdobeField
                label="End. Urbano"
                value={rural.end_urbano ?? ''}
                onChange={(v) => queueRuralField('end_urbano', v)}
                status={s('end_urbano')}
                auditField="end_urbano"
              />
              <AdobeField
                label="Pertence a"
                value={rural.pertence_a ?? ''}
                onChange={(v) => queueRuralField('pertence_a', v)}
                status={s('pertence_a')}
                auditField="pertence_a"
              />
            </div>
            {/* Do PS endereço (full) */}
            <div className="mt-4">
              <AdobeField
                label="Do PS"
                value={rural.endereco_do_ps ?? ''}
                onChange={(v) => queueRuralField('endereco_do_ps', v)}
                red
                status={s('endereco_do_ps')}
                auditField="endereco_do_ps"
              />
            </div>

            {/* ─────────── Relações de Residência ─────────── */}
            <div className="mt-4 space-y-[4px]">
              <div className="flex gap-x-[5px]">
                <AdobeSelect
                  className="flex-[13] min-w-0"
                  label="Moradia"
                  value={RURAL_TIPO_MORADIA.fromCanonical(rural.tipo_moradia)}
                  onChange={(ui) => onChangeTipoMoradia(RURAL_TIPO_MORADIA.toCanonical(ui))}
                  options={RURAL_TIPO_MORADIA.uiOptions}
                  status={s('tipo_moradia')}
                  auditField="tipo_moradia"
                />
                <AdobeField
                  label="Obs"
                  className="flex-[44] min-w-0"
                  value={rural.tipo_moradia_obs ?? ''}
                  onChange={(v) => queueRuralField('tipo_moradia_obs', v)}
                  status={s('tipo_moradia_obs')}
                  auditField="tipo_moradia_obs"
                />
              </div>
              <div className="flex gap-x-[5px]">
                <AdobeSelect
                  className="flex-[16] min-w-0"
                  label="Única no lote"
                  value={SIM_NAO_BOOL.fromCanonical(rural.unica_no_lote)}
                  onChange={(ui) =>
                    queueRuralField('unica_no_lote', SIM_NAO_BOOL.toCanonical(ui))
                  }
                  options={SIM_NAO_OPTIONS}
                  status={s('unica_no_lote')}
                  auditField="unica_no_lote"
                />
                <AdobeField
                  label="Obs"
                  className="flex-[49] min-w-0"
                  value={rural.unica_no_lote_obs ?? ''}
                  onChange={(v) => queueRuralField('unica_no_lote_obs', v)}
                  status={s('unica_no_lote_obs')}
                  auditField="unica_no_lote_obs"
                />
              </div>
              <div className="flex gap-x-[5px]">
                <AdobeField
                  label="Reside com"
                  className="flex-[2] min-w-0"
                  value={rural.com_quem_reside ?? ''}
                  onChange={(v) => queueRuralField('com_quem_reside', v)}
                  status={s('com_quem_reside')}
                  auditField="com_quem_reside"
                />
                <AdobeSelect
                  className="flex-[1] min-w-0"
                  label="Nas outras"
                  value={RURAL_NAS_OUTRAS.fromCanonical(rural.nas_outras)}
                  onChange={(ui) =>
                    queueRuralField('nas_outras', RURAL_NAS_OUTRAS.toCanonical(ui))
                  }
                  options={RURAL_NAS_OUTRAS.uiOptions}
                  status={s('nas_outras')}
                  auditField="nas_outras"
                />
              </div>
              <div className="flex gap-x-[5px]">
                <AdobeField
                  label="Proprietário/Patrão"
                  className="flex-[30] min-w-0"
                  value={rural.proprietario_patrao ?? ''}
                  onChange={(v) => queueRuralField('proprietario_patrao', v)}
                  status={s('proprietario_patrao')}
                  auditField="proprietario_patrao"
                />
                <AdobeField
                  label="Tel"
                  className="flex-[20] min-w-0"
                  value={rural.tel_proprietario ?? ''}
                  onChange={(v) => queueRuralField('tel_proprietario', v)}
                  inputMode="tel"
                  status={s('tel_proprietario')}
                  auditField="tel_proprietario"
                />
                <AdobeField
                  label="Obs"
                  className="flex-[31] min-w-0"
                  value={rural.obs_moradia ?? ''}
                  onChange={(v) => queueRuralField('obs_moradia', v)}
                  status={s('obs_moradia')}
                  auditField="obs_moradia"
                />
              </div>
              {/* Internet fixa | Empresa | Obs */}
              <div className="flex gap-x-[5px] items-start">
                <AdobeSelect
                  className="flex-[14] min-w-0"
                  label="Internet fixa"
                  value={SIM_NAO_BOOL.fromCanonical(rural.tem_internet_fixa)}
                  onChange={(ui) =>
                    queueRuralField('tem_internet_fixa', SIM_NAO_BOOL.toCanonical(ui))
                  }
                  options={SIM_NAO_OPTIONS}
                  status={s('tem_internet_fixa')}
                  auditField="tem_internet_fixa"
                />
                <AdobeField
                  label="Empresa"
                  className="flex-[19] min-w-0"
                  value={rural.empresa_internet ?? ''}
                  onChange={(v) => queueRuralField('empresa_internet', v)}
                  status={s('empresa_internet')}
                  auditField="empresa_internet"
                />
                <AdobeField
                  label="Obs"
                  className="flex-[21] min-w-0"
                  value={rural.observacoes ?? ''}
                  onChange={(v) => queueRuralField('observacoes', v)}
                  status={s('observacoes')}
                  auditField="observacoes"
                />
              </div>
            </div>

            {/* ─────────── Emprego/Renda ─────────── */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AdobeField
                  label="Profissão"
                  value={rural.profissao ?? ''}
                  onChange={(v) => queueRuralField('profissao', v)}
                  status={s('profissao')}
                  auditField="profissao"
                />
                <AdobeField
                  label="Empresa"
                  value={rural.empresa ?? ''}
                  onChange={(v) => queueRuralField('empresa', v)}
                  status={s('empresa')}
                  auditField="empresa"
                />
                <AdobeField
                  label="Tel"
                  value={rural.tel_empresa ?? ''}
                  onChange={(v) => queueRuralField('tel_empresa', v)}
                  inputMode="tel"
                  status={s('tel_empresa')}
                  auditField="tel_empresa"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AdobeSelect
                  label="Vínculo"
                  value={VINCULO.fromCanonical(rural.vinculo)}
                  onChange={(ui) =>
                    queueRuralField('vinculo', VINCULO.toCanonical(ui))
                  }
                  options={VINCULO.uiOptions}
                  status={s('vinculo')}
                  auditField="vinculo"
                />
                <AdobeField
                  label="Admissão"
                  value={rural.admissao ?? ''}
                  onChange={(v) => queueRuralField('admissao', v)}
                  status={s('admissao')}
                  auditField="admissao"
                />
                <AdobeField
                  label="Obs"
                  value={rural.vinculo_obs ?? ''}
                  onChange={(v) => queueRuralField('vinculo_obs', v)}
                  status={s('vinculo_obs')}
                  auditField="vinculo_obs"
                />
              </div>
              <AdobeField
                label="Do PS"
                value={rural.emprego_do_ps ?? ''}
                onChange={(v) => queueRuralField('emprego_do_ps', v)}
                red
                className="lg:col-span-4"
                status={s('emprego_do_ps')}
                auditField="emprego_do_ps"
              />
            </div>

            {/* ─────────── Cônjuge ─────────── */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdobeSelect
                label="Estado Civil"
                value={ESTADO_CIVIL.fromCanonical(rural.estado_civil)}
                onChange={(ui) =>
                  queueRuralField(
                    'estado_civil',
                    ESTADO_CIVIL.toCanonical(ui),
                  )
                }
                options={ESTADO_CIVIL.uiOptions}
                status={s('estado_civil')}
                  auditField="estado_civil"
              />
              <AdobeField
                label="Obs"
                className="lg:col-span-3"
                value={rural.conjuge_obs ?? ''}
                onChange={(v) => queueRuralField('conjuge_obs', v)}
                status={s('conjuge_obs')}
                auditField="conjuge_obs"
              />
              <AdobeField
                label="Nome"
                className="lg:col-span-2"
                value={rural.conjuge_nome ?? ''}
                onChange={(v) => queueRuralField('conjuge_nome', v)}
                status={s('conjuge_nome')}
                auditField="conjuge_nome"
              />
              <AdobeField
                label="Tel"
                value={rural.conjuge_telefone ?? ''}
                onChange={(v) => queueRuralField('conjuge_telefone', v)}
                status={s('conjuge_telefone')}
                auditField="conjuge_telefone"
              />
              <AdobeField
                label="Whats"
                value={rural.conjuge_whatsapp ?? ''}
                onChange={(v) => queueRuralField('conjuge_whatsapp', v)}
                status={s('conjuge_whatsapp')}
                auditField="conjuge_whatsapp"
              />
              <AdobeField
                label="CPF"
                value={rural.conjuge_cpf ?? ''}
                onChange={(v) => queueRuralField('conjuge_cpf', v)}
                status={s('conjuge_cpf')}
                auditField="conjuge_cpf"
              />
              <AdobeField
                label="Natural"
                value={rural.conjuge_naturalidade ?? ''}
                onChange={(v) => queueRuralField('conjuge_naturalidade', v)}
                status={s('conjuge_naturalidade')}
                auditField="conjuge_naturalidade"
              />
              <AdobeField
                label="UF"
                value={rural.conjuge_uf ?? ''}
                onChange={(v) => queueRuralField('conjuge_uf', v)}
                status={s('conjuge_uf')}
                auditField="conjuge_uf"
              />
              <AdobeField
                label="ID"
                value={rural.conjuge_idade != null ? String(rural.conjuge_idade) : ''}
                onChange={(v) => {
                  setRural((prev) => ({ ...prev, conjuge_idade: v }));
                  if (v === '') queueRuralField('conjuge_idade', null);
                  else {
                    const n = Number(v);
                    if (Number.isInteger(n) && n >= 0 && n <= 130) {
                      queueRuralField('conjuge_idade', n);
                    }
                  }
                }}
                status={s('conjuge_idade')}
                auditField="conjuge_idade"
              />
              <AdobeField
                label="Do PS"
                value={rural.conjuge_do_ps ?? ''}
                onChange={(v) => queueRuralField('conjuge_do_ps', v)}
                red
                className="lg:col-span-4"
                status={s('conjuge_do_ps')}
                auditField="conjuge_do_ps"
              />
            </div>

            {/* ─────────── SPC / Pesquisador ─────────── */}
            <div className="mt-4 grid grid-cols-1 gap-4">
              <AdobeTextarea
                label="Informações SPC"
                value={app.info_spc ?? ''}
                onChange={(v) => queueApp('info_spc', v)}
                red
                stack
                yellowLabel
                shrinkMin={0.1}
                status={s('info_spc')}
                textareaClassName="pf-textarea-short"
                autoGrow
                lastEdit={fa('info_spc')}
                auditField="info_spc"
              />
              <AdobeTextarea
                label="Informações do Pesquisador"
                value={app.info_pesquisador ?? ''}
                onChange={(v) => queueApp('info_pesquisador', v)}
                red
                stack
                yellowLabel
                shrinkMin={0.1}
                status={s('info_pesquisador')}
                textareaClassName="pf-textarea-short"
                autoGrow
                lastEdit={fa('info_pesquisador')}
                auditField="info_pesquisador"
              />
            </div>

            {/* ─────────── Filiação ─────────── */}
            <p className="mt-4 text-[14px] font-bold uppercase tracking-wide text-zinc-700 bg-yellow-200 px-1 py-0.5 rounded w-fit">
              FILIAÇÃO DO SOLICITANTE (SÓ PERGUNTAR SE SOLICITANTE TIVER MENOS DE 45ANOS)
            </p>
            <div className="space-y-[4px]">
              <div className="flex gap-x-[5px]">
                <AdobeField
                  label="Pai"
                  className="flex-[34] min-w-0"
                  value={rural.pai_nome ?? ''}
                  onChange={(v) => queueRuralField('pai_nome', v)}
                  status={s('pai_nome')}
                  auditField="pai_nome"
                />
                <AdobeField
                  label="Reside"
                  className="flex-[13] min-w-0"
                  value={rural.pai_reside ?? ''}
                  onChange={(v) => queueRuralField('pai_reside', v)}
                  status={s('pai_reside')}
                  auditField="pai_reside"
                />
                <AdobeField
                  label="Tel"
                  className="flex-[12] min-w-0"
                  value={rural.pai_telefone ?? ''}
                  onChange={(v) => queueRuralField('pai_telefone', v)}
                  status={s('pai_telefone')}
                  auditField="pai_telefone"
                />
              </div>
              <div className="flex gap-x-[5px]">
                <AdobeField
                  label="Mãe"
                  className="flex-[34] min-w-0"
                  value={rural.mae_nome ?? ''}
                  onChange={(v) => queueRuralField('mae_nome', v)}
                  status={s('mae_nome')}
                  auditField="mae_nome"
                />
                <AdobeField
                  label="Reside"
                  className="flex-[13] min-w-0"
                  value={rural.mae_reside ?? ''}
                  onChange={(v) => queueRuralField('mae_reside', v)}
                  status={s('mae_reside')}
                  auditField="mae_reside"
                />
                <AdobeField
                  label="Tel"
                  className="flex-[12] min-w-0"
                  value={rural.mae_telefone ?? ''}
                  onChange={(v) => queueRuralField('mae_telefone', v)}
                  status={s('mae_telefone')}
                  auditField="mae_telefone"
                />
              </div>
            </div>

            {/* ─────────── Referências Pessoais ─────────── */}
            <p className="mt-4 text-[14px] font-bold uppercase tracking-wide text-zinc-700 bg-yellow-200 px-1 py-0.5 rounded w-fit">
              REFERÊNCIAS PESSOAIS (DE PREFERÊNCIA PARENTES EM 1º GRAU)
            </p>
            <div className="space-y-[4px]">
              {[1, 2].map((n) => {
                const nomeKey = `ref${n}_nome` as keyof RuralModel;
                const parKey = `ref${n}_parentesco` as keyof RuralModel;
                const telKey = `ref${n}_telefone` as keyof RuralModel;
                const resKey = `ref${n}_reside` as keyof RuralModel;
                return (
                  <div key={n} className="flex gap-x-[5px]">
                    <AdobeField
                      label=""
                      className="flex-[24] min-w-0"
                      value={(rural[nomeKey] as string) ?? ''}
                      onChange={(v) =>
                        queueRuralField(nomeKey, v as RuralModel[typeof nomeKey])
                      }
                      status={s(nomeKey as string)}
                      auditField={nomeKey as string}
                    />
                    <AdobeField
                      label=""
                      className="flex-[10] min-w-0"
                      value={(rural[parKey] as string) ?? ''}
                      onChange={(v) =>
                        queueRuralField(parKey, v as RuralModel[typeof parKey])
                      }
                      status={s(parKey as string)}
                      auditField={parKey as string}
                    />
                    <AdobeField
                      label="Tel"
                      className="flex-[16] min-w-0"
                      value={(rural[telKey] as string) ?? ''}
                      onChange={(v) =>
                        queueRuralField(telKey, v as RuralModel[typeof telKey])
                      }
                      status={s(telKey as string)}
                      auditField={telKey as string}
                    />
                    <AdobeField
                      label="Reside"
                      className="flex-[16] min-w-0"
                      value={(rural[resKey] as string) ?? ''}
                      onChange={(v) =>
                        queueRuralField(resKey, v as RuralModel[typeof resKey])
                      }
                      status={s(resKey as string)}
                      auditField={resKey as string}
                    />
                  </div>
                );
              })}
            </div>

            {/* ─────────── Outras Informações / MK ─────────── */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="pf-highlight-row sm:col-span-2 lg:col-span-4 grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <label className="pf-highlight-field shrink-0 text-[9px] font-bold uppercase tracking-wide leading-none no-colon">
                    Plano escolhido
                  </label>
                  <div className="flex-1 min-w-0">
                    <AdobeSelect
                      value={app.plano_acesso ?? ''}
                      onChange={(v) => queueApp('plano_acesso', v)}
                      options={RURAL_PLANO_OPTIONS}
                      triggerClassName="h-[21px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900"
                      contentClassName="rounded-lg shadow-lg border-0"
                      status={s('plano_acesso')}
                  auditField="plano_acesso"
                    />
                  </div>
                  <label className="pf-highlight-field shrink-0 text-[9px] font-bold uppercase tracking-wide leading-none no-colon">
                    Venc
                  </label>
                  <div className="w-14 shrink-0">
                    <AdobeSelect
                      value={app.venc != null ? String(app.venc) : ''}
                      onChange={(v) =>
                        queueApp('venc', v ? Number(v) : null)
                      }
                      options={[...VENC_OPTIONS]}
                      triggerClassName="h-[21px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900"
                      contentClassName="rounded-lg shadow-lg border-0"
                      status={s('venc')}
                  auditField="venc"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="field-inline">
                    <label className="pf-highlight-field mb-0.5 block text-[9px] font-bold uppercase tracking-wide leading-none">
                      SVA Avulso
                    </label>
                    <AdobeSelect
                      value={app.sva_avulso ?? ''}
                      onChange={(v) => queueApp('sva_avulso', v)}
                      options={RURAL_SVA_OPTIONS}
                      triggerClassName="h-[21px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900"
                      contentClassName="rounded-lg shadow-lg border-0"
                      status={s('sva_avulso')}
                      auditField="sva_avulso"
                    />
                  </div>
                  <div className="field-inline">
                    <label className="pf-highlight-field mb-0.5 block text-[9px] font-bold uppercase tracking-wide leading-none">
                      Taxa Inst
                    </label>
                    <AdobeSelect
                      value={app.taxa_instalacao ?? ''}
                      onChange={(v) => queueApp('taxa_instalacao', v)}
                      options={TAXA_INST_OPTIONS}
                      triggerClassName="h-[21px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900"
                      contentClassName="rounded-lg shadow-lg border-0"
                      status={s('taxa_instalacao')}
                      auditField="taxa_instalacao"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-4 gap-2">
                <AdobeField
                  label="Solicitante"
                  value={app.quem_solicitou ?? ''}
                  onChange={(v) => queueApp('quem_solicitou', v)}
                  status={s('quem_solicitou')}
                  auditField="quem_solicitou"
                />
                <AdobeSelect
                  label="Via"
                  value={app.via ?? ''}
                  onChange={(v) => queueApp('via', v)}
                  options={VIA_OPTIONS}
                  triggerClassName="h-[21px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900"
                  contentClassName="rounded-lg shadow-lg border-0"
                  status={s('via')}
                  auditField="via"
                />
                <AdobeSelect
                  label="Meio"
                  value={MEIO.fromCanonical(app.meio)}
                  onChange={(ui) =>
                    queueApp('meio', MEIO.toCanonical(ui))
                  }
                  options={MEIO.uiOptions}
                  triggerClassName="h-[21px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900"
                  contentClassName="rounded-lg shadow-lg border-0"
                  status={s('meio')}
                  auditField="meio"
                />
                <AdobeField
                  label="Fone"
                  value={app.telefone_solicitante ?? ''}
                  onChange={(v) => queueApp('telefone_solicitante', v)}
                  status={s('telefone_solicitante')}
                  auditField="telefone_solicitante"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-4 gap-2">
                <AdobeField
                  label="Data"
                  value={
                    app.created_at
                      ? new Date(app.created_at).toLocaleString('pt-BR')
                      : ''
                  }
                  onChange={() => {}}
                  disabled
                />
                <AdobeField
                  label="MK"
                  value={app.protocolo_mk ?? ''}
                  onChange={(v) => queueApp('protocolo_mk', v)}
                  status={s('protocolo_mk')}
                  auditField="protocolo_mk"
                />
                <AdobeField
                  className="col-span-2"
                  label="Resp Comercial"
                  value={vendorName}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-3 gap-2">
                <div className="field-inline">
                  <label className="text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600 shrink-0">
                    Agendada
                  </label>
                  <DateSingleKanbanPopover
                    value={dueAt}
                    onChange={(v) => {
                      setDueAt(v ?? '');
                      const utc = v
                        ? (localDateTimeToUtcISO(v, '12:00', DEFAULT_TIMEZONE) ??
                          null)
                        : null;
                      queueCard('due_at', utc);
                    }}
                    disablePast
                    triggerClassName="h-[27px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900 outline-none focus:border-zinc-600"
                  />
                </div>
                <div className="field-inline">
                  <label className="text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600 shrink-0">
                    Horário
                  </label>
                  <TimeMultiSelect
                    label=""
                    labelClassName="hidden"
                    times={HORA_SLOTS}
                    value={horaArr}
                    onChange={(v) => {
                      setHoraArr(v);
                      queueCard(
                        'hora_at',
                        v.length ? v.map((t) => `${t}:00`) : null,
                      );
                      if (v.length > 0 && periodo) {
                        setPeriodo(null);
                        queueCard('periodo', null);
                      }
                    }}
                    allowedPairs={HORA_PAIRS}
                    periodos={['manha', 'tarde'] as const}
                    periodoLabels={{ manha: 'Manhã', tarde: 'Tarde' }}
                    periodoValue={periodo}
                    onPeriodoChange={(p) => {
                      setPeriodo(p as 'manha' | 'tarde' | null);
                      queueCard('periodo', p);
                      if (p && horaArr.length > 0) {
                        setHoraArr([]);
                        queueCard('hora_at', null);
                      }
                    }}
                    triggerClassName="h-[27px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900 outline-none focus:border-zinc-600"
                    date={dueAt}
                  />
                </div>
                <div className="field-inline">
                  <label className="text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600 shrink-0">
                    Veículo
                  </label>
                  <VeiculoPopover disabled={readOnly} />
                </div>
              </div>
              <AdobeTextarea
                label="Informações relevantes"
                value={app.info_relevantes ?? ''}
                onChange={(v) => queueApp('info_relevantes', v)}
                className="lg:col-span-4"
                stack
                shrinkMin={0.1}
                status={s('info_relevantes')}
                textareaClassName="pf-textarea-short"
                autoGrow
                lastEdit={fa('info_relevantes')}
                auditField="info_relevantes"
              />
              <AdobeTextarea
                label="Informações Relevantes do MK"
                value={app.info_mk ?? ''}
                onChange={(v) => queueApp('info_mk', v)}
                red
                className="lg:col-span-4"
                stack
                shrinkMin={0.1}
                status={s('info_mk')}
                textareaClassName="pf-textarea-short"
                autoGrow
                lastEdit={fa('info_mk')}
                auditField="info_mk"
              />
              <AdobeTextarea
                label="Observações"
                value={app.observacoes ?? ''}
                onChange={(v) => queueApp('observacoes', v)}
                className="lg:col-span-4"
                stack
                shrinkMin={0.1}
                status={s('observacoes')}
                textareaClassName="pf-textarea-short"
                autoGrow
                lastEdit={fa('observacoes')}
                auditField="observacoes"
              />
            </div>
          </AdobeCard>

          {/* ─────────── Parecer ─────────── */}
          <AdobeCard title="Parecer" noBorder red>
            {!cardId ? (
              <p className="text-xs text-zinc-500">
                Nenhum card ativo para esta ficha — o parecer não pode ser exibido.
              </p>
            ) : (
              <div className="space-y-4">
                {canWriteParecer && (
                  <ParecerComposer
                    key={`root-${cardId}`}
                    mode="create"
                    cardId={cardId}
                    applicantId={applicantId}
                    profiles={profiles}
                    currentUserId={user?.id ?? null}
                    onSuccess={refreshPareceres}
                    cardStage={(card?.stage ?? '').toLowerCase()}
                  />
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
            )}
          </AdobeCard>
        </div>
      </div>
    </div>
    </AuditProvider>
    </PresenceProvider>
  );
}

function RuralPresenceBadges() {
  const ctx = usePresenceContext();
  return <PresenceBadges peers={ctx?.peers ?? []} />;
}

function RuralPresenceCursors() {
  const ctx = usePresenceContext();
  return <PresenceCursors cursors={ctx?.peerCursors ?? []} />;
}
