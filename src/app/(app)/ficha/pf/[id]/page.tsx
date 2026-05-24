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
  fetchExpandedPF,
  updateApplicant,
  updateCard,
  updatePfFicha,
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
  PLANO_OPTIONS,
  SVA_OPTIONS,
  VENC_OPTIONS,
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
import {
  ESTADO_CIVIL,
  MEIO,
  NAS_OUTRAS,
  SIM_NAO_BOOL,
  TIPO_COMPROVANTE,
  TIPO_MORADIA,
  VINCULO,
} from '@/features/expanded-ficha/enums';
import type {
  ExpandedAppModel,
  ExpandedCard,
  FieldAudit,
  FieldStatus,
  PfModel,
} from '@/features/expanded-ficha/types';
import { AuditProvider } from '@/features/expanded-ficha/AuditContext';

const AUTOSAVE_DEBOUNCE_MS = 300;
const ZOOM_KEY = 'form-zoom-pf';
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

export default function ExpandedPfPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const applicantId = params.id;
  const preferCardId = search.get('card');

  const { user, profile, role, loading: authLoading } = useAuth();
  const isLeitor = role === 'leitor';
  const canWriteParecer =
    !isLeitor && (role === 'analista' || role === 'gestor');
  const readOnly = isLeitor;

  const [app, setApp] = useState<ExpandedAppModel>({});
  const [pf, setPf] = useState<PfModel>({});
  const [card, setCard] = useState<ExpandedCard | null>(null);
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
  const pfRef = useRef(pf);
  pfRef.current = pf;

  const pendingApp = useRef<Partial<ExpandedAppModel>>({});
  const pendingPf = useRef<Partial<PfModel>>({});
  const pendingCard = useRef<{
    due_at?: string | null;
    hora_at?: string[] | null;
    periodo?: 'manha' | 'tarde' | null;
  }>({});
  const dirtyApp = useRef<Set<keyof ExpandedAppModel>>(new Set());
  const dirtyPf = useRef<Set<keyof PfModel>>(new Set());
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
      pendingPf.current = {};
      pendingCard.current = {};
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const appPatch = { ...pendingApp.current };
    const pfPatch = { ...pendingPf.current };
    const cardPatch = { ...pendingCard.current };
    pendingApp.current = {};
    pendingPf.current = {};
    pendingCard.current = {};
    const appKeys = Object.keys(appPatch);
    const pfKeys = Object.keys(pfPatch);
    const cardKeys = Object.keys(cardPatch);
    if (appKeys.length + pfKeys.length + cardKeys.length === 0) return;

    setStatusText('Salvando…');
    [...appKeys, ...pfKeys, ...cardKeys].forEach((k) =>
      setFieldStatus(k, 'pending'),
    );

    try {
      const ops: Promise<unknown>[] = [];
      if (appKeys.length) ops.push(updateApplicant(applicantId, appPatch));
      if (pfKeys.length) ops.push(updatePfFicha(applicantId, pfPatch));
      if (cardKeys.length && card?.id) ops.push(updateCard(card.id, cardPatch));
      await Promise.all(ops);
      dirtyApp.current.clear();
      dirtyPf.current.clear();
      dirtyCard.current.clear();
      [...appKeys, ...pfKeys, ...cardKeys].forEach((k) =>
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
      console.error('[expanded-pf] autosave', e);
      [...appKeys, ...pfKeys, ...cardKeys].forEach((k) =>
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

  const queuePf = useCallback(
    (patch: Partial<PfModel>) => {
      if (readOnly) return;
      for (const k of Object.keys(patch) as (keyof PfModel)[]) {
        dirtyPf.current.add(k);
        (pendingPf.current as Record<string, unknown>)[k] = patch[k];
        setFieldStatus(k as string, 'pending');
      }
      setPf((prev) => ({ ...prev, ...patch }));
      broadcastFichaPatch('pf', applicantId, patch as Record<string, unknown>);
      scheduleAutosave();
    },
    [readOnly, scheduleAutosave, setFieldStatus, applicantId],
  );

  const queuePfField = useCallback(
    <K extends keyof PfModel>(key: K, value: PfModel[K]) => {
      const oldValue = pfRef.current[key];
      queuePf({ [key]: value } as Partial<PfModel>);
      historyPush(
        `pf:${key as string}`,
        () => { if (!isUndoRedo.current) return; dirtyPf.current.add(key); (pendingPf.current as Record<string, unknown>)[key as string] = oldValue; setPf((prev) => ({ ...prev, [key]: oldValue })); setFieldStatus(key as string, 'pending'); scheduleAutosave(); },
        () => { if (!isUndoRedo.current) return; dirtyPf.current.add(key); (pendingPf.current as Record<string, unknown>)[key as string] = value; setPf((prev) => ({ ...prev, [key]: value })); setFieldStatus(key as string, 'pending'); scheduleAutosave(); },
      );
    },
    [queuePf, historyPush, isUndoRedo, setFieldStatus, scheduleAutosave],
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
  useFichaSync('pf', applicantId, (patch) => {
    setPf((prev) => {
      const merged: Record<string, unknown> = { ...prev };
      for (const k of Object.keys(patch) as (keyof PfModel)[]) {
        if (dirtyPf.current.has(k)) continue;
        merged[k] = patch[k as string];
      }
      return merged as PfModel;
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
            queryKey: fichaKeys.expandedPF(applicantId, preferCardId),
            queryFn: () => fetchExpandedPF(applicantId, preferCardId),
          }),
          queryClient.fetchQuery({
            queryKey: fichaKeys.profiles(),
            queryFn: () => listProfiles(),
            staleTime: 5 * 60 * 1000,
          }),
        ]);
        if (cancelled) return;
        setApp(bundle.applicant);
        setPf(bundle.pf);
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
    // re-triggered fetchExpandedPF, calling setApp/setPf with the not-yet-
    // -saved row from the DB and "ghosting" the field the user just typed.
  }, [applicantId, preferCardId, authLoading, user?.id]);

  const cardId = card?.id ?? '';
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
      setPareceres((notesRes.data?.reanalysis_notes ?? []) as ParecerNote[]);
    } catch (e) {
      console.error('[expanded-pf] refreshPareceres', e);
    }
  }, [cardId, invalidateCard]);

  useTableChanges({
    channelName: `rt-pf-app-${applicantId}`,
    table: 'applicants',
    filter: `id=eq.${applicantId}`,
    onChange: (payload) => {
      const next = payload.new as Partial<ExpandedAppModel> | null;
      if (!next) return;
      setApp((prev) => {
        const merged: Record<string, unknown> = { ...prev };
        (Object.keys(next) as (keyof ExpandedAppModel)[]).forEach((k) => {
          if (dirtyApp.current.has(k)) return;
          if (typeof next[k] !== 'undefined') merged[k] = next[k];
        });
        return merged as ExpandedAppModel;
      });
    },
  });

  useTableChanges({
    channelName: `rt-pf-fichas-${applicantId}`,
    table: 'pf_fichas',
    filter: `applicant_id=eq.${applicantId}`,
    onChange: (payload) => {
      const next = payload.new as Partial<PfModel> | null;
      if (!next) return;
      setPf((prev) => {
        const merged: Record<string, unknown> = { ...prev };
        (Object.keys(next) as (keyof PfModel)[]).forEach((k) => {
          if (dirtyPf.current.has(k)) return;
          if (typeof next[k] !== 'undefined') merged[k] = next[k];
        });
        return merged as PfModel;
      });
    },
  });

  useTableChanges({
    channelName: `rt-pf-card-${cardId}`,
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

  useEffect(() => {
    if (!app.primary_name) return;
    document.title = `${app.primary_name} — WBRFerramenta`;
  }, [app.primary_name]);

  useEffect(() => {
    return () => { document.title = 'WBR'; };
  }, []);

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
  // tipo_moradia stores the canonical lowercase enum value.
  // Locador rules:
  //   alugada         → required (emerald + error if empty)
  //   cedida / outros → editable, not required
  //   propria / empty → disabled + auto-cleared
  const reqLocador = pf.tipo_moradia === 'alugada';
  const lockedLocador =
    !pf.tipo_moradia || pf.tipo_moradia === 'propria';
  const errs = {
    nome_locador: reqLocador && !pf.nome_locador,
    telefone_locador: reqLocador && !pf.telefone_locador,
  };

  const onChangeTipoMoradia = (canon: string | null) => {
    const patch: Partial<PfModel> = { tipo_moradia: canon };
    if (!canon || canon === 'propria') {
      patch.nome_locador = '';
      patch.telefone_locador = '';
    }
    queuePf(patch);
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

  const representanteName = useMemo(() => {
    if (!app.representante_mz) return '';
    return (
      profiles.find((p) => p.id === app.representante_mz)?.full_name ?? ''
    );
  }, [app.representante_mz, profiles]);

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
    <PfPresenceCursors />
    <div className="form-zoom-wrap flex h-full flex-col overflow-x-hidden">
      <FreshFichaConfetti />
      {zoomSlot && createPortal(zoomControls, zoomSlot)}
      {presenceSlot && createPortal(<PfPresenceBadges />, presenceSlot)}
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
          data-tipo="pf"
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
                value={(pf.birth_date as string | null | undefined) ?? ''}
                onChange={(v) => queuePfField('birth_date', formatDateBR(v))}
                status={s('birth_date')}
                inputMode="numeric"
                auditField="birth_date"
              />
              <AdobeField
                label="ID"
                className="flex-[3] min-w-0"
                value={pf.idade != null ? String(pf.idade) : ''}
                onChange={(v) => {
                  setPf((prev) => ({ ...prev, idade: v }));
                  if (v === '') queuePfField('idade', null);
                  else {
                    const n = Number(v);
                    if (Number.isInteger(n) && n >= 0 && n <= 130) {
                      queuePfField('idade', n);
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
                value={pf.do_ps ?? ''}
                onChange={(v) => queuePfField('do_ps', v)}
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
                value={pf.naturalidade ?? ''}
                onChange={(v) => queuePfField('naturalidade', v)}
                status={s('naturalidade')}
                auditField="naturalidade"
              />
              <AdobeField
                label="UF"
                className="flex-[4] min-w-0"
                value={pf.uf_naturalidade ?? ''}
                onChange={(v) => queuePfField('uf_naturalidade', v)}
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
            {/* End | Nº | Compl */}
            <div className="mt-4 flex gap-x-[5px]">
              <AdobeField
                label="End"
                className="flex-[40] min-w-0"
                value={app.address_line ?? ''}
                onChange={(v) => queueApp('address_line', v)}
                status={s('address_line')}
                auditField="address_line"
              />
              <AdobeField
                label="Nº"
                className="flex-[6] min-w-0"
                value={app.address_number ?? ''}
                onChange={(v) => queueApp('address_number', v)}
                status={s('address_number')}
                auditField="address_number"
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
            {/* CEP | Bairro | Cond | Tempo */}
            <div className="mt-4 grid grid-cols-4 gap-4">
              <AdobeField
                label="CEP"
                value={app.cep ?? ''}
                onChange={(v) => queueApp('cep', v)}
                status={s('cep')}
                auditField="cep"
              />
              <AdobeField
                label="Bairro"
                value={app.bairro ?? ''}
                onChange={(v) => queueApp('bairro', v)}
                status={s('bairro')}
                auditField="bairro"
              />
              <AdobeField
                label="Cond"
                value={pf.cond ?? ''}
                onChange={(v) => queuePfField('cond', v)}
                status={s('cond')}
                auditField="cond"
              />
              <AdobeField
                label="Tempo"
                value={pf.tempo_endereco ?? ''}
                onChange={(v) => queuePfField('tempo_endereco', v)}
                status={s('tempo_endereco')}
                auditField="tempo_endereco"
              />
            </div>
            {/* Do PS endereço (full) */}
            <div className="mt-4">
              <AdobeField
                label="Do PS"
                value={pf.endereco_do_ps ?? ''}
                onChange={(v) => queuePfField('endereco_do_ps', v)}
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
                  value={TIPO_MORADIA.fromCanonical(pf.tipo_moradia)}
                  onChange={(ui) => onChangeTipoMoradia(TIPO_MORADIA.toCanonical(ui))}
                  options={TIPO_MORADIA.uiOptions}
                  status={s('tipo_moradia')}
                  auditField="tipo_moradia"
                />
                <AdobeField
                  label="Obs"
                  className="flex-[44] min-w-0"
                  value={pf.tipo_moradia_obs ?? ''}
                  onChange={(v) => queuePfField('tipo_moradia_obs', v)}
                  status={s('tipo_moradia_obs')}
                  auditField="tipo_moradia_obs"
                />
              </div>
              <div className="flex gap-x-[5px]">
                <AdobeSelect
                  className="flex-[16] min-w-0"
                  label="Única no lote"
                  value={SIM_NAO_BOOL.fromCanonical(pf.unica_no_lote)}
                  onChange={(ui) =>
                    queuePfField('unica_no_lote', SIM_NAO_BOOL.toCanonical(ui))
                  }
                  options={SIM_NAO_OPTIONS}
                  status={s('unica_no_lote')}
                  auditField="unica_no_lote"
                />
                <AdobeField
                  label="Obs"
                  className="flex-[49] min-w-0"
                  value={pf.unica_no_lote_obs ?? ''}
                  onChange={(v) => queuePfField('unica_no_lote_obs', v)}
                  status={s('unica_no_lote_obs')}
                  auditField="unica_no_lote_obs"
                />
              </div>
              <div className="flex gap-x-[5px]">
                <AdobeField
                  label="Reside com"
                  className="flex-[2] min-w-0"
                  value={pf.com_quem_reside ?? ''}
                  onChange={(v) => queuePfField('com_quem_reside', v)}
                  status={s('com_quem_reside')}
                  auditField="com_quem_reside"
                />
                <AdobeSelect
                  className="flex-[1] min-w-0"
                  label="Nas outras"
                  value={NAS_OUTRAS.fromCanonical(pf.nas_outras)}
                  onChange={(ui) =>
                    queuePfField('nas_outras', NAS_OUTRAS.toCanonical(ui))
                  }
                  options={NAS_OUTRAS.uiOptions}
                  status={s('nas_outras')}
                  auditField="nas_outras"
                />
              </div>
              <div className="flex gap-x-[5px]">
                <AdobeSelect
                  className="flex-[13] min-w-0"
                  label="Tem Contrato"
                  value={SIM_NAO_BOOL.fromCanonical(pf.tem_contrato)}
                  onChange={(ui) =>
                    queuePfField('tem_contrato', SIM_NAO_BOOL.toCanonical(ui))
                  }
                  options={SIM_NAO_OPTIONS}
                  status={s('tem_contrato')}
                  auditField="tem_contrato"
                />
                <AdobeSelect
                  className="flex-[9] min-w-0"
                  label="Enviou"
                  value={SIM_NAO_BOOL.fromCanonical(pf.enviou_contrato)}
                  onChange={(ui) =>
                    queuePfField('enviou_contrato', SIM_NAO_BOOL.toCanonical(ui))
                  }
                  options={SIM_NAO_OPTIONS}
                  status={s('enviou_contrato')}
                  auditField="enviou_contrato"
                />
                <AdobeField
                  label="Nome De"
                  className="flex-[31] min-w-0"
                  value={pf.nome_de ?? ''}
                  onChange={(v) => queuePfField('nome_de', v)}
                  status={s('nome_de')}
                  auditField="nome_de"
                />
              </div>
              <div className="flex gap-x-[5px]">
                <AdobeSelect
                  className="flex-[18] min-w-0"
                  label="Comprovante"
                  value={SIM_NAO_BOOL.fromCanonical(pf.enviou_comprovante)}
                  onChange={(ui) =>
                    queuePfField(
                      'enviou_comprovante',
                      SIM_NAO_BOOL.toCanonical(ui),
                    )
                  }
                  options={SIM_NAO_OPTIONS}
                  status={s('enviou_comprovante')}
                  auditField="enviou_comprovante"
                />
                <AdobeSelect
                  className="flex-[16] min-w-0"
                  label="Tipo"
                  value={TIPO_COMPROVANTE.fromCanonical(pf.tipo_comprovante)}
                  onChange={(ui) =>
                    queuePfField(
                      'tipo_comprovante',
                      TIPO_COMPROVANTE.toCanonical(ui),
                    )
                  }
                  options={TIPO_COMPROVANTE.uiOptions}
                  status={s('tipo_comprovante')}
                  auditField="tipo_comprovante"
                />
                <AdobeField
                  label="Nome"
                  className="flex-[39] min-w-0"
                  value={pf.nome_comprovante ?? ''}
                  onChange={(v) => queuePfField('nome_comprovante', v)}
                  status={s('nome_comprovante')}
                  auditField="nome_comprovante"
                />
              </div>
              <div className="flex gap-x-[5px]">
                <AdobeField
                  label="Locador"
                  className="flex-[22] min-w-0"
                  value={pf.nome_locador ?? ''}
                  onChange={(v) => queuePfField('nome_locador', v)}
                  disabled={lockedLocador}
                  requiredMark={reqLocador && !pf.nome_locador}
                  error={errs.nome_locador}
                  status={s('nome_locador')}
                  title={
                    lockedLocador
                      ? 'Esse campo é bloqueado para digitação quando Moradia = Própria'
                      : undefined
                  }
                  auditField="nome_locador"
                />
                <AdobeField
                  label="Tel"
                  className="flex-[14] min-w-0"
                  value={pf.telefone_locador ?? ''}
                  onChange={(v) => queuePfField('telefone_locador', v)}
                  disabled={lockedLocador}
                  requiredMark={reqLocador && !pf.telefone_locador}
                  error={errs.telefone_locador}
                  status={s('telefone_locador')}
                  title={
                    lockedLocador
                      ? 'Esse campo é bloqueado para digitação quando Moradia = Própria'
                      : undefined
                  }
                  auditField="telefone_locador"
                />
              </div>
              {/* Internet fixa | Empresa | Obs */}
              <div className="flex gap-x-[5px] items-start">
                <AdobeSelect
                  className="flex-[14] min-w-0"
                  label="Internet fixa"
                  value={SIM_NAO_BOOL.fromCanonical(pf.tem_internet_fixa)}
                  onChange={(ui) =>
                    queuePfField('tem_internet_fixa', SIM_NAO_BOOL.toCanonical(ui))
                  }
                  options={SIM_NAO_OPTIONS}
                  status={s('tem_internet_fixa')}
                  auditField="tem_internet_fixa"
                />
                <AdobeField
                  label="Empresa"
                  className="flex-[19] min-w-0"
                  value={pf.empresa_internet ?? ''}
                  onChange={(v) => queuePfField('empresa_internet', v)}
                  status={s('empresa_internet')}
                  auditField="empresa_internet"
                />
                <AdobeField
                  label="Obs"
                  className="flex-[21] min-w-0"
                  value={pf.observacoes ?? ''}
                  onChange={(v) => queuePfField('observacoes', v)}
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
                  value={pf.profissao ?? ''}
                  onChange={(v) => queuePfField('profissao', v)}
                  status={s('profissao')}
                  auditField="profissao"
                />
                <AdobeField
                  label="Empresa"
                  value={pf.empresa ?? ''}
                  onChange={(v) => queuePfField('empresa', v)}
                  status={s('empresa')}
                  auditField="empresa"
                />
                <AdobeSelect
                  label="Vínculo"
                  value={VINCULO.fromCanonical(pf.vinculo)}
                  onChange={(ui) =>
                    queuePfField('vinculo', VINCULO.toCanonical(ui))
                  }
                  options={VINCULO.uiOptions}
                  status={s('vinculo')}
                  auditField="vinculo"
                />
              </div>
              <AdobeField
                label="Do PS"
                value={pf.emprego_do_ps ?? ''}
                onChange={(v) => queuePfField('emprego_do_ps', v)}
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
                value={ESTADO_CIVIL.fromCanonical(pf.estado_civil)}
                onChange={(ui) =>
                  queuePfField(
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
                value={pf.conjuge_obs ?? ''}
                onChange={(v) => queuePfField('conjuge_obs', v)}
                status={s('conjuge_obs')}
                auditField="conjuge_obs"
              />
              <AdobeField
                label="Nome"
                className="lg:col-span-2"
                value={pf.conjuge_nome ?? ''}
                onChange={(v) => queuePfField('conjuge_nome', v)}
                status={s('conjuge_nome')}
                auditField="conjuge_nome"
              />
              <AdobeField
                label="Tel"
                value={pf.conjuge_telefone ?? ''}
                onChange={(v) => queuePfField('conjuge_telefone', v)}
                status={s('conjuge_telefone')}
                auditField="conjuge_telefone"
              />
              <AdobeField
                label="Whats"
                value={pf.conjuge_whatsapp ?? ''}
                onChange={(v) => queuePfField('conjuge_whatsapp', v)}
                status={s('conjuge_whatsapp')}
                auditField="conjuge_whatsapp"
              />
              <AdobeField
                label="CPF"
                value={pf.conjuge_cpf ?? ''}
                onChange={(v) => queuePfField('conjuge_cpf', v)}
                status={s('conjuge_cpf')}
                auditField="conjuge_cpf"
              />
              <AdobeField
                label="Natural"
                value={pf.conjuge_naturalidade ?? ''}
                onChange={(v) => queuePfField('conjuge_naturalidade', v)}
                status={s('conjuge_naturalidade')}
                auditField="conjuge_naturalidade"
              />
              <AdobeField
                label="UF"
                value={pf.conjuge_uf ?? ''}
                onChange={(v) => queuePfField('conjuge_uf', v)}
                status={s('conjuge_uf')}
                auditField="conjuge_uf"
              />
              <AdobeField
                label="ID"
                value={pf.conjuge_idade != null ? String(pf.conjuge_idade) : ''}
                onChange={(v) => {
                  setPf((prev) => ({ ...prev, conjuge_idade: v }));
                  if (v === '') queuePfField('conjuge_idade', null);
                  else {
                    const n = Number(v);
                    if (Number.isInteger(n) && n >= 0 && n <= 130) {
                      queuePfField('conjuge_idade', n);
                    }
                  }
                }}
                status={s('conjuge_idade')}
                auditField="conjuge_idade"
              />
              <AdobeField
                label="Do PS"
                value={pf.conjuge_do_ps ?? ''}
                onChange={(v) => queuePfField('conjuge_do_ps', v)}
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
                  value={pf.pai_nome ?? ''}
                  onChange={(v) => queuePfField('pai_nome', v)}
                  status={s('pai_nome')}
                  auditField="pai_nome"
                />
                <AdobeField
                  label="Reside"
                  className="flex-[13] min-w-0"
                  value={pf.pai_reside ?? ''}
                  onChange={(v) => queuePfField('pai_reside', v)}
                  status={s('pai_reside')}
                  auditField="pai_reside"
                />
                <AdobeField
                  label="Tel"
                  className="flex-[12] min-w-0"
                  value={pf.pai_telefone ?? ''}
                  onChange={(v) => queuePfField('pai_telefone', v)}
                  status={s('pai_telefone')}
                  auditField="pai_telefone"
                />
              </div>
              <div className="flex gap-x-[5px]">
                <AdobeField
                  label="Mãe"
                  className="flex-[34] min-w-0"
                  value={pf.mae_nome ?? ''}
                  onChange={(v) => queuePfField('mae_nome', v)}
                  status={s('mae_nome')}
                  auditField="mae_nome"
                />
                <AdobeField
                  label="Reside"
                  className="flex-[13] min-w-0"
                  value={pf.mae_reside ?? ''}
                  onChange={(v) => queuePfField('mae_reside', v)}
                  status={s('mae_reside')}
                  auditField="mae_reside"
                />
                <AdobeField
                  label="Tel"
                  className="flex-[12] min-w-0"
                  value={pf.mae_telefone ?? ''}
                  onChange={(v) => queuePfField('mae_telefone', v)}
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
                const nomeKey = `ref${n}_nome` as keyof PfModel;
                const parKey = `ref${n}_parentesco` as keyof PfModel;
                const telKey = `ref${n}_telefone` as keyof PfModel;
                const resKey = `ref${n}_reside` as keyof PfModel;
                return (
                  <div key={n} className="flex gap-x-[5px]">
                    <AdobeField
                      label=""
                      className="flex-[24] min-w-0"
                      value={(pf[nomeKey] as string) ?? ''}
                      onChange={(v) =>
                        queuePfField(nomeKey, v as PfModel[typeof nomeKey])
                      }
                      status={s(nomeKey as string)}
                      auditField={nomeKey as string}
                    />
                    <AdobeField
                      label=""
                      className="flex-[10] min-w-0"
                      value={(pf[parKey] as string) ?? ''}
                      onChange={(v) =>
                        queuePfField(parKey, v as PfModel[typeof parKey])
                      }
                      status={s(parKey as string)}
                      auditField={parKey as string}
                    />
                    <AdobeField
                      label="Tel"
                      className="flex-[16] min-w-0"
                      value={(pf[telKey] as string) ?? ''}
                      onChange={(v) =>
                        queuePfField(telKey, v as PfModel[typeof telKey])
                      }
                      status={s(telKey as string)}
                      auditField={telKey as string}
                    />
                    <AdobeField
                      label="Reside"
                      className="flex-[16] min-w-0"
                      value={(pf[resKey] as string) ?? ''}
                      onChange={(v) =>
                        queuePfField(resKey, v as PfModel[typeof resKey])
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
                      options={PLANO_OPTIONS}
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
                <div className="field-inline">
                  <label className="pf-highlight-field mb-0.5 block text-[9px] font-bold uppercase tracking-wide leading-none">
                    SVA Avulso
                  </label>
                  <AdobeSelect
                    value={app.sva_avulso ?? ''}
                    onChange={(v) => queueApp('sva_avulso', v)}
                    options={SVA_OPTIONS}
                    triggerClassName="h-[21px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900"
                    contentClassName="rounded-lg shadow-lg border-0"
                    status={s('sva_avulso')}
                  auditField="sva_avulso"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-3 gap-2">
                <AdobeField
                  label="Solicitante"
                  value={app.quem_solicitou ?? ''}
                  onChange={(v) => queueApp('quem_solicitou', v)}
                  status={s('quem_solicitou')}
                  auditField="quem_solicitou"
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
                  label="Protocolo MK"
                  value={app.protocolo_mk ?? ''}
                  onChange={(v) => queueApp('protocolo_mk', v)}
                  status={s('protocolo_mk')}
                  auditField="protocolo_mk"
                />
                <AdobeField
                  label="Vendedor"
                  value={vendorName}
                  onChange={() => {}}
                  disabled
                />
                <AdobeField
                  label="Representante Mz"
                  value={representanteName}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-2 gap-2">
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
                    triggerClassName="h-[21px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900 outline-none focus:border-zinc-600"
                  />
                </div>
                <div className="field-inline">
                  <label className="text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600 shrink-0">
                    Horário
                  </label>
                  <TimeMultiSelect
                    label=""
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
                    triggerClassName="h-[21px] w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-1 text-[10px] text-zinc-900 outline-none focus:border-zinc-600"
                    date={dueAt}
                  />
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

function PfPresenceBadges() {
  const ctx = usePresenceContext();
  return <PresenceBadges peers={ctx?.peers ?? []} />;
}

function PfPresenceCursors() {
  const ctx = usePresenceContext();
  return <PresenceCursors cursors={ctx?.peerCursors ?? []} />;
}
