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
  fetchExpandedPJ,
  updateApplicant,
  updateCard,
  updatePjFicha,
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
import { formatCnpj, formatDateBR, formatPhoneBR } from '@/lib/masks';
import { FreshFichaConfetti } from '@/components/effects/welcome-confetti';
import { AdobeField } from '@/features/expanded-ficha/components/AdobeField';
import { AdobeTextarea } from '@/features/expanded-ficha/components/AdobeTextarea';
import { AdobeCard } from '@/features/expanded-ficha/components/AdobeCard';
import { AdobeSelect } from '@/features/expanded-ficha/components/AdobeSelect';
import { ComoConheceuPopover, type ComoConheceuOption } from '@/features/expanded-ficha/components/ComoConheceuPopover';
import { CarneImpressoPopover } from '@/features/expanded-ficha/components/CarneImpressoPopover';
import { listComoConheceuOptions } from '@/services/comoConheceu';
import { AuditProvider } from '@/features/expanded-ficha/AuditContext';
import {
  MEIO,
  SIM_NAO_BOOL,
  TIPO_COMPROVANTE,
  TIPO_ESTABELECIMENTO,
  TIPO_IMOVEL,
} from '@/features/expanded-ficha/enums';
import type {
  ExpandedAppModel,
  ExpandedCard,
  FieldAudit,
  FieldStatus,
  PjModel,
} from '@/features/expanded-ficha/types';

const AUTOSAVE_DEBOUNCE_MS = 300;
const ZOOM_KEY = 'form-zoom-pj';
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

export default function ExpandedPjPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const applicantId = params.id;
  const preferCardId = search.get('card');

  const { user, profile, role, loading: authLoading } = useAuth();
  const isLeitor = role === 'leitor';

  const [app, setApp] = useState<ExpandedAppModel>({});
  const [pj, setPj] = useState<PjModel>({});
  const [card, setCard] = useState<ExpandedCard | null>(null);

  const readOnly = isLeitor || !!card?.archived_at;
  const canWriteParecer =
    !readOnly && (role === 'analista' || role === 'gestor');
  const [dueAt, setDueAt] = useState<string>('');
  const [horaArr, setHoraArr] = useState<string[]>([]);
  const [periodo, setPeriodo] = useState<'manha' | 'tarde' | null>(null);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [comoConheceuOptions, setComoConheceuOptions] = useState<ComoConheceuOption[]>([]);
  const [attachments, setAttachments] = useState<CardAttachment[]>([]);
  const [pareceres, setPareceres] = useState<ParecerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('');
  const [statusBy, setStatusBy] = useState<Record<string, FieldStatus>>({});
  const [zoom, setZoom] = useState<number>(1);
  const [zoomSlot, setZoomSlot] = useState<HTMLElement | null>(null);
  const [undoSlot, setUndoSlot] = useState<HTMLElement | null>(null);
  const [presenceSlot, setPresenceSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setZoomSlot(document.getElementById('mz-page-header-slot'));
    setUndoSlot(document.getElementById('mz-undo-redo-slot'));
    setPresenceSlot(document.getElementById('mz-presence-slot'));
  }, []);
  const { queryClient, invalidateCard } = useFichaCache();

  const { push: historyPush, undo: historyUndo, redo: historyRedo, canUndo, canRedo, isUndoRedo } = useFieldHistory();
  const appRef = useRef(app);
  appRef.current = app;
  const pjRef = useRef(pj);
  pjRef.current = pj;

  const pendingApp = useRef<Partial<ExpandedAppModel>>({});
  const pendingPj = useRef<Partial<PjModel>>({});
  const pendingCard = useRef<{
    due_at?: string | null;
    hora_at?: string[] | null;
    periodo?: 'manha' | 'tarde' | null;
  }>({});
  const dirtyApp = useRef<Set<keyof ExpandedAppModel>>(new Set());
  const dirtyPj = useRef<Set<keyof PjModel>>(new Set());
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
      pendingPj.current = {};
      pendingCard.current = {};
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const appPatch = { ...pendingApp.current };
    const pjPatch = { ...pendingPj.current };
    const cardPatch = { ...pendingCard.current };
    pendingApp.current = {};
    pendingPj.current = {};
    pendingCard.current = {};
    const appKeys = Object.keys(appPatch);
    const pjKeys = Object.keys(pjPatch);
    const cardKeys = Object.keys(cardPatch);
    if (appKeys.length + pjKeys.length + cardKeys.length === 0) return;

    setStatusText('Salvando…');
    [...appKeys, ...pjKeys, ...cardKeys].forEach((k) =>
      setFieldStatus(k, 'pending'),
    );

    try {
      const ops: Promise<unknown>[] = [];
      if (appKeys.length) ops.push(updateApplicant(applicantId, appPatch));
      if (pjKeys.length) ops.push(updatePjFicha(applicantId, pjPatch));
      if (cardKeys.length && card?.id) ops.push(updateCard(card.id, cardPatch));
      await Promise.all(ops);
      // Only remove dirty flags for keys NOT re-queued while the save was in-flight.
      // Clearing unconditionally would drop the guard on fields the user is still
      // typing, letting the realtime echo overwrite them and jump the cursor.
      for (const k of appKeys) {
        if (!(k in pendingApp.current)) dirtyApp.current.delete(k as keyof ExpandedAppModel);
      }
      for (const k of pjKeys) {
        if (!(k in pendingPj.current)) dirtyPj.current.delete(k as keyof PjModel);
      }
      for (const k of cardKeys) {
        if (!(k in pendingCard.current)) dirtyCard.current.delete(k as 'due_at' | 'hora_at' | 'periodo');
      }
      [...appKeys, ...pjKeys, ...cardKeys].forEach((k) =>
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
      console.error('[expanded-pj] autosave', e);
      [...appKeys, ...pjKeys, ...cardKeys].forEach((k) =>
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

  const queuePj = useCallback(
    (patch: Partial<PjModel>) => {
      if (readOnly) return;
      for (const k of Object.keys(patch) as (keyof PjModel)[]) {
        dirtyPj.current.add(k);
        (pendingPj.current as Record<string, unknown>)[k] = patch[k];
        setFieldStatus(k as string, 'pending');
      }
      setPj((prev) => ({ ...prev, ...patch }));
      broadcastFichaPatch('pj', applicantId, patch as Record<string, unknown>);
      scheduleAutosave();
    },
    [readOnly, scheduleAutosave, setFieldStatus, applicantId],
  );

  const queuePjField = useCallback(
    <K extends keyof PjModel>(key: K, value: PjModel[K]) => {
      const oldValue = pjRef.current[key];
      queuePj({ [key]: value } as Partial<PjModel>);
      historyPush(
        `pj:${key as string}`,
        () => { if (!isUndoRedo.current) return; dirtyPj.current.add(key); (pendingPj.current as Record<string, unknown>)[key as string] = oldValue; setPj((prev) => ({ ...prev, [key]: oldValue })); setFieldStatus(key as string, 'pending'); scheduleAutosave(); },
        () => { if (!isUndoRedo.current) return; dirtyPj.current.add(key); (pendingPj.current as Record<string, unknown>)[key as string] = value; setPj((prev) => ({ ...prev, [key]: value })); setFieldStatus(key as string, 'pending'); scheduleAutosave(); },
      );
    },
    [queuePj, historyPush, isUndoRedo, setFieldStatus, scheduleAutosave],
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
  useFichaSync('pj', applicantId, (patch) => {
    setPj((prev) => {
      const merged: Record<string, unknown> = { ...prev };
      for (const k of Object.keys(patch) as (keyof PjModel)[]) {
        if (dirtyPj.current.has(k)) continue;
        merged[k] = patch[k as string];
      }
      return merged as PjModel;
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
        const [bundle, profilesData, comoConheceuData] = await Promise.all([
          queryClient.fetchQuery({
            queryKey: fichaKeys.expandedPJ(applicantId, preferCardId),
            queryFn: () => fetchExpandedPJ(applicantId, preferCardId),
          }),
          queryClient.fetchQuery({
            queryKey: fichaKeys.profiles(),
            queryFn: () => listProfiles(),
            staleTime: 5 * 60 * 1000,
          }),
          queryClient.fetchQuery({
            queryKey: fichaKeys.comoConheceuOptions(),
            queryFn: () => listComoConheceuOptions(),
            staleTime: 5 * 60 * 1000,
          }),
        ]);
        if (cancelled) return;
        setApp(bundle.applicant);
        setPj(bundle.pj);
        setCard(bundle.card);
        setProfiles(profilesData);
        setComoConheceuOptions(comoConheceuData);
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
    // user?.id (not the full user object) — see PF page comment.
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
      console.error('[expanded-pj] refreshPareceres', e);
    }
  }, [cardId, invalidateCard]);

  useTableChanges({
    channelName: `rt-pj-app-${applicantId}`,
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
    channelName: `rt-pj-fichas-${applicantId}`,
    table: 'pj_fichas',
    filter: `applicant_id=eq.${applicantId}`,
    onChange: (payload) => {
      const next = payload.new as Partial<PjModel> | null;
      if (!next) return;
      const focusedKey = (document.activeElement as HTMLElement)?.dataset?.fieldKey;
      setPj((prev) => {
        const merged: Record<string, unknown> = { ...prev };
        (Object.keys(next) as (keyof PjModel)[]).forEach((k) => {
          if (dirtyPj.current.has(k)) return;
          if (k === focusedKey) return;
          if (typeof next[k] !== 'undefined') merged[k] = next[k];
        });
        return merged as PjModel;
      });
    },
  });

  useTableChanges({
    channelName: `rt-pj-card-${cardId}`,
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

  // Nome da aba do navegador = nome da ficha (reseta ao sair).
  useEffect(() => {
    if (!app.primary_name) return;
    document.title = `${app.primary_name} — WBR`;
  }, [app.primary_name]);

  useEffect(() => {
    return () => {
      document.title = 'WBR';
    };
  }, []);


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
  // PJ has a single cascade: enviou_comprovante === true unlocks tipo /
  // nome_comprovante. When it flips to false/null, both are zeroed.
  const reqComprov = pj.enviou_comprovante === true;
  const errs = {
    nome_comprovante: reqComprov && !pj.nome_comprovante,
  };
  const onChangeEnviouComprovante = (b: boolean | null) => {
    const patch: Partial<PjModel> = { enviou_comprovante: b };
    if (b !== true) {
      patch.tipo_comprovante = null;
      patch.nome_comprovante = '';
    }
    queuePj(patch);
  };

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

  return (
    <PresenceProvider cardId={cardId} userId={user?.id} userName={profile?.full_name}>
    <AuditProvider applicantId={applicantId}>
    <PjPresenceCursors />
    <div className="form-zoom-wrap flex h-full flex-col overflow-x-hidden">
      <FreshFichaConfetti />
      {zoomSlot && createPortal(zoomControls, zoomSlot)}
      {presenceSlot && createPortal(<PjPresenceBadges />, presenceSlot)}
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
          data-tipo="pj"
          data-id={applicantId}
          data-name={app.primary_name ?? ''}
          className={`pj-form ficha-pj expanded-portrait px-3 py-6 ${readOnly ? 'pointer-events-none opacity-85' : ''}`}
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
            {/* Seção 1: identificação */}
            <div className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AdobeField
                  label="Razão Social"
                  className="w-full sm:flex-1 sm:min-w-0"
                  value={app.primary_name ?? ''}
                  onChange={(v) => queueApp('primary_name', v)}
                  status={s('primary_name')}
                  auditField="primary_name"
                />
                <AdobeField
                  label="CNPJ"
                  className="w-full sm:w-56 sm:shrink-0"
                  value={app.cpf_cnpj ?? ''}
                  onChange={(v) => queueApp('cpf_cnpj', formatCnpj(v))}
                  status={s('cpf_cnpj')}
                  inputMode="numeric"
                  auditField="cpf_cnpj"
                />
                <AdobeField
                  label="Abertura"
                  className="w-full sm:w-44 sm:shrink-0"
                  value={(pj.data_abertura as string | null | undefined) ?? ''}
                  onChange={(v) => queuePjField('data_abertura', formatDateBR(v))}
                  status={s('data_abertura')}
                  inputMode="numeric"
                  auditField="data_abertura"
                />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <AdobeField
                  label="Nome Fantasia"
                  className="min-w-0"
                  value={pj.nome_fantasia ?? ''}
                  onChange={(v) => queuePjField('nome_fantasia', v)}
                  status={s('nome_fantasia')}
                  auditField="nome_fantasia"
                />
                <AdobeField
                  label="Nome de Fachada"
                  className="min-w-0"
                  value={pj.nome_fachada ?? ''}
                  onChange={(v) => queuePjField('nome_fachada', v)}
                  status={s('nome_fachada')}
                  auditField="nome_fachada"
                />
              </div>
              <AdobeField
                label="Área de Atuação"
                className="w-full"
                value={pj.area_atuacao ?? ''}
                onChange={(v) => queuePjField('area_atuacao', v)}
                status={s('area_atuacao')}
                auditField="area_atuacao"
              />
            </div>

            {/* Seção 2: Endereço */}
            <div className="mt-4 space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AdobeField
                  label="End"
                  className="w-full sm:flex-1 sm:min-w-0"
                  value={app.address_line ?? ''}
                  onChange={(v) => queueApp('address_line', v)}
                  status={s('address_line')}
                  auditField="address_line"
                />
                <AdobeField
                  label="Nº"
                  className="w-full sm:w-20 sm:shrink-0"
                  value={app.address_number ?? ''}
                  onChange={(v) => queueApp('address_number', v)}
                  status={s('address_number')}
                  auditField="address_number"
                />
                <AdobeField
                  label="Compl"
                  className="w-full sm:w-[250px] sm:shrink-0"
                  value={app.address_complement ?? ''}
                  onChange={(v) => queueApp('address_complement', v)}
                  status={s('address_complement')}
                  auditField="address_complement"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AdobeSelect
                  className="w-full sm:w-56 sm:shrink-0"
                  label="Tipo"
                  value={TIPO_IMOVEL.fromCanonical(pj.tipo_imovel)}
                  onChange={(ui) =>
                    queuePjField(
                      'tipo_imovel',
                      TIPO_IMOVEL.toCanonical(ui),
                    )
                  }
                  options={TIPO_IMOVEL.uiOptions}
                  status={s('tipo_imovel')}
                  auditField="tipo_imovel"
                />
                <AdobeField
                  label="Obs"
                  className="w-full sm:flex-1 sm:min-w-0"
                  value={pj.obs_tipo_imovel ?? ''}
                  onChange={(v) => queuePjField('obs_tipo_imovel', v)}
                  status={s('obs_tipo_imovel')}
                  auditField="obs_tipo_imovel"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AdobeField
                  label="CEP"
                  className="w-full sm:w-40 sm:shrink-0"
                  value={app.cep ?? ''}
                  onChange={(v) => queueApp('cep', v)}
                  status={s('cep')}
                  auditField="cep"
                />
                <AdobeField
                  label="Bairro"
                  className="w-full sm:w-56 sm:shrink-0"
                  value={app.bairro ?? ''}
                  onChange={(v) => queueApp('bairro', v)}
                  status={s('bairro')}
                  auditField="bairro"
                />
                <AdobeField
                  label="Tempo"
                  className="w-full sm:flex-1 sm:min-w-0"
                  value={pj.tempo_endereco ?? ''}
                  onChange={(v) => queuePjField('tempo_endereco', v)}
                  status={s('tempo_endereco')}
                  auditField="tempo_endereco"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AdobeSelect
                  className="w-full sm:w-56 sm:shrink-0"
                  label="Estabelecimento"
                  value={TIPO_ESTABELECIMENTO.fromCanonical(pj.tipo_estabelecimento)}
                  onChange={(ui) =>
                    queuePjField(
                      'tipo_estabelecimento',
                      TIPO_ESTABELECIMENTO.toCanonical(ui),
                    )
                  }
                  options={TIPO_ESTABELECIMENTO.uiOptions}
                  status={s('tipo_estabelecimento')}
                  auditField="tipo_estabelecimento"
                />
                <AdobeField
                  label="Obs"
                  className="w-full sm:flex-1 sm:min-w-0"
                  value={pj.obs_estabelecimento ?? ''}
                  onChange={(v) => queuePjField('obs_estabelecimento', v)}
                  status={s('obs_estabelecimento')}
                  auditField="obs_estabelecimento"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AdobeField
                  label="Tel"
                  className="w-full sm:w-48 sm:shrink-0"
                  value={app.phone ?? ''}
                  onChange={(v) => queueApp('phone', formatPhoneBR(v))}
                  status={s('phone')}
                  inputMode="tel"
                  auditField="phone"
                />
                <AdobeField
                  label="Whats"
                  className="w-full sm:w-48 sm:shrink-0"
                  value={app.whatsapp ?? ''}
                  onChange={(v) => queueApp('whatsapp', formatPhoneBR(v))}
                  status={s('whatsapp')}
                  inputMode="tel"
                  auditField="whatsapp"
                />
                <AdobeField
                  label="Fone no PS"
                  className="w-full sm:flex-1 sm:min-w-0"
                  value={pj.fones_ps ?? ''}
                  onChange={(v) => queuePjField('fones_ps', v)}
                  red
                  status={s('fones_ps')}
                  auditField="fones_ps"
                />
              </div>
              <AdobeField
                label="End no PS"
                className="w-full"
                value={pj.end_ps ?? ''}
                onChange={(v) => queuePjField('end_ps', v)}
                red
                status={s('end_ps')}
                auditField="end_ps"
              />
            </div>

            {/* Seção 3: Contatos e Documentos */}
            <div className="mt-4 space-y-2">
              <AdobeField
                label="E-mail"
                className="w-full"
                value={app.email ?? ''}
                onChange={(v) => queueApp('email', v)}
                blue
                status={s('email')}
noUppercase
auditField="email"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AdobeSelect
                  className="w-full sm:w-52 sm:shrink-0"
                  label="Comprovante"
                  value={SIM_NAO_BOOL.fromCanonical(pj.enviou_comprovante)}
                  onChange={(ui) =>
                    onChangeEnviouComprovante(SIM_NAO_BOOL.toCanonical(ui))
                  }
                  options={SIM_NAO_OPTIONS}
                  status={s('enviou_comprovante')}
                  auditField="enviou_comprovante"
                />
                <AdobeSelect
                  className="w-full sm:w-44 sm:shrink-0"
                  label="Tipo"
                  value={TIPO_COMPROVANTE.fromCanonical(pj.tipo_comprovante)}
                  onChange={(ui) =>
                    queuePjField(
                      'tipo_comprovante',
                      TIPO_COMPROVANTE.toCanonical(ui),
                    )
                  }
                  options={TIPO_COMPROVANTE.uiOptions}
                  disabled={!reqComprov}
                  status={s('tipo_comprovante')}
                  auditField="tipo_comprovante"
                />
                <AdobeField
                  label="Em Nome de"
                  className="w-full sm:flex-1 sm:min-w-0"
                  value={pj.nome_comprovante ?? ''}
                  onChange={(v) => queuePjField('nome_comprovante', v)}
                  disabled={!reqComprov}
                  requiredMark={reqComprov && !pj.nome_comprovante}
                  error={errs.nome_comprovante}
                  status={s('nome_comprovante')}
                  auditField="nome_comprovante"
                  title={
                    !reqComprov
                      ? 'Esse campo é bloqueado para digitação quando Comprovante = Não'
                      : undefined
                  }
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AdobeSelect
                  className="w-full sm:w-44 sm:shrink-0"
                  label="Internet"
                  value={SIM_NAO_BOOL.fromCanonical(pj.possui_internet)}
                  onChange={(ui) =>
                    queuePjField('possui_internet', SIM_NAO_BOOL.toCanonical(ui))
                  }
                  options={SIM_NAO_OPTIONS}
                  status={s('possui_internet')}
                  auditField="possui_internet"
                />
                <AdobeField
                  label="Operadora"
                  className="w-full sm:w-48 sm:shrink-0"
                  value={pj.operadora_internet ?? ''}
                  onChange={(v) => queuePjField('operadora_internet', v)}
                  status={s('operadora_internet')}
                  auditField="operadora_internet"
                />
                <AdobeField
                  label="Plano"
                  className="w-full sm:w-40 sm:shrink-0"
                  value={pj.plano_internet ?? ''}
                  onChange={(v) => queuePjField('plano_internet', v)}
                  status={s('plano_internet')}
                  auditField="plano_internet"
                />
                <AdobeField
                  label="Valor"
                  className="w-full sm:w-40 sm:shrink-0"
                  value={pj.valor_internet ?? ''}
                  onChange={(v) => queuePjField('valor_internet', v)}
                  status={s('valor_internet')}
                  auditField="valor_internet"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AdobeSelect
                  className="w-full sm:w-52 sm:shrink-0"
                  label="Contrato Social"
                  value={SIM_NAO_BOOL.fromCanonical(pj.contrato_social)}
                  onChange={(ui) =>
                    queuePjField('contrato_social', SIM_NAO_BOOL.toCanonical(ui))
                  }
                  options={SIM_NAO_OPTIONS}
                  status={s('contrato_social')}
                  auditField="contrato_social"
                />
                <AdobeField
                  label="Obs"
                  className="w-full sm:flex-1 sm:min-w-0"
                  value={pj.obs_contrato_social ?? ''}
                  onChange={(v) => queuePjField('obs_contrato_social', v)}
                  status={s('obs_contrato_social')}
                  auditField="obs_contrato_social"
                />
              </div>
            </div>

            {/* Seção 4: Sócios */}
            <div className="mt-4">
              <p className="text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600 mb-1">
                Sócios
              </p>
              <div className="space-y-2">
                {[1, 2, 3].map((n) => {
                  const nomeKey = `socio${n}_nome` as keyof PjModel;
                  const cpfKey = `socio${n}_cpf` as keyof PjModel;
                  const telKey = `socio${n}_telefone` as keyof PjModel;
                  return (
                    <div
                      key={n}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                      <AdobeField
                        label=""
                        className="w-full sm:flex-1 sm:min-w-0"
                        value={(pj[nomeKey] as string) ?? ''}
                        onChange={(v) =>
                          queuePjField(nomeKey, v as PjModel[typeof nomeKey])
                        }
                        status={s(nomeKey as string)}
                        auditField={nomeKey as string}
                      />
                      <AdobeField
                        label=""
                        className="w-full sm:w-52 sm:shrink-0"
                        value={(pj[cpfKey] as string) ?? ''}
                        onChange={(v) =>
                          queuePjField(cpfKey, v as PjModel[typeof cpfKey])
                        }
                        status={s(cpfKey as string)}
                        auditField={cpfKey as string}
                      />
                      <AdobeField
                        label=""
                        className="w-full sm:w-56 sm:shrink-0"
                        value={(pj[telKey] as string) ?? ''}
                        onChange={(v) =>
                          queuePjField(telKey, v as PjModel[typeof telKey])
                        }
                        status={s(telKey as string)}
                        auditField={telKey as string}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seção 5: Solicitação */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <AdobeField
                label="Quem Solicitou"
                className="w-full sm:w-[250px] sm:shrink-0"
                value={app.quem_solicitou ?? ''}
                onChange={(v) => queueApp('quem_solicitou', v)}
                status={s('quem_solicitou')}
                auditField="quem_solicitou"
              />
              <AdobeSelect
                className="w-full sm:w-[190px] sm:shrink-0"
                label="Meio"
                value={MEIO.fromCanonical(app.meio)}
                onChange={(ui) =>
                  queueApp('meio', MEIO.toCanonical(ui))
                }
                options={MEIO.uiOptions}
                status={s('meio')}
                  auditField="meio"
              />
              <AdobeField
                label="Tel"
                className="w-full sm:flex-1 sm:min-w-0"
                value={app.telefone_solicitante ?? ''}
                onChange={(v) => queueApp('telefone_solicitante', v)}
                status={s('telefone_solicitante')}
                auditField="telefone_solicitante"
              />
              <div className="field-inline w-full sm:w-[110px] sm:shrink-0">
                <label className="text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600 shrink-0">
                  Carnê
                </label>
                <CarneImpressoPopover
                  value={app.carne_impresso ?? false}
                  onChange={(v) => queueApp('carne_impresso', v)}
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Bloco destacado: Plano / Vencimento / SVA */}
            <div className="mt-4 pj-highlight-row grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <label className="shrink-0 text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600">
                  Plano de Acesso
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
                <label className="shrink-0 text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600">
                  Vencimento
                </label>
                <div className="w-20 shrink-0">
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
              <div>
                <label className="mb-0.5 block text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600">
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
              <div className="grid grid-cols-4 gap-2">
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
            </div>

            {/* Agendamento: Agendada + Horário */}
            <div className="mt-4 flex items-center gap-2 min-w-0">
              <label className="shrink-0 text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600">
                Agendada
              </label>
              <div className="flex-1 min-w-0">
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
              <label className="shrink-0 text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600">
                Horário
              </label>
              <div className="flex-1 min-w-0">
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
              <label className="shrink-0 text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600">
                Como conheceu a WBR
              </label>
              <div className="flex-1 min-w-0">
                <ComoConheceuPopover
                  value={app.como_conheceu_id ?? null}
                  onChange={(v) => queueApp('como_conheceu_id', v)}
                  options={comoConheceuOptions}
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Seções 6-9: textareas */}
            <div className="mt-4 grid grid-cols-1 gap-4">
              <AdobeTextarea
                label="Informações relevantes da solicitação"
                value={app.info_relevantes ?? ''}
                onChange={(v) => queueApp('info_relevantes', v)}
                stack
                shrinkMin={0.1}
                status={s('info_relevantes')}
                textareaClassName="pf-textarea-short"
                autoGrow
                lastEdit={fa('info_relevantes')}
                auditField="info_relevantes"
              />
              <AdobeTextarea
                label="Consulta SPC/Serasa"
                value={app.info_spc ?? ''}
                onChange={(v) => queueApp('info_spc', v)}
                red
                stack
                shrinkMin={0.1}
                status={s('info_spc')}
                textareaClassName="pf-textarea-short"
                autoGrow
                lastEdit={fa('info_spc')}
                auditField="info_spc"
              />
              <AdobeTextarea
                label="Outras informações relevantes do PS"
                value={app.info_pesquisador ?? ''}
                onChange={(v) => queueApp('info_pesquisador', v)}
                red
                stack
                shrinkMin={0.1}
                status={s('info_pesquisador')}
                textareaClassName="pf-textarea-short"
                autoGrow
                lastEdit={fa('info_pesquisador')}
                auditField="info_pesquisador"
              />
              <AdobeTextarea
                label="Informações Relevantes do MK"
                value={app.info_mk ?? ''}
                onChange={(v) => queueApp('info_mk', v)}
                red
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
          <AdobeCard title="Parecer da análise:" noBorder red>
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

function PjPresenceBadges() {
  const ctx = usePresenceContext();
  return <PresenceBadges peers={ctx?.peers ?? []} />;
}

function PjPresenceCursors() {
  const ctx = usePresenceContext();
  return <PresenceCursors cursors={ctx?.peerCursors ?? []} />;
}
