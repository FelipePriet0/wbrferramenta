'use client';

import { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';
import { Modal } from '@/features/kanban/components/Modal';
import {
  assignUrgentWithReason,
  fetchUrgentReason,
  updateUrgentReason,
} from '@/services/labels';
import { friendlyError } from '@/lib/errors';
import { pasteNormalizeSpaces } from '@/lib/utils';

type Mode = 'create' | 'view' | 'edit';

export function UrgenteMotivoModal({
  open,
  onClose,
  mode: initialMode,
  cardId,
  labelId,
  currentUserId,
  authorName,
  onApplied,
}: {
  open: boolean;
  onClose: () => void;
  // 'create' = attaching the label now → require reason.
  // 'view'   = label already on the card → show reason + author + date.
  // The component upgrades 'view' → 'edit' internally when the current user
  // is the author and clicks "Editar".
  mode: 'create' | 'view';
  cardId: string;
  labelId: string;
  currentUserId: string | null;
  // Optional: name of the original author, looked up by the parent from the
  // profiles list it already has. We only fetch the reason/author-id/date
  // server-side; the parent already knows everyone's display name.
  authorName?: string | null;
  // Called after a successful create/edit so the parent can refresh chips,
  // dispatch the kanban event, etc.
  onApplied?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [reason, setReason] = useState('');
  const [author, setAuthor] = useState<string | null>(null);
  const [at, setAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  // Refs to break the dependency cycle: parents typically pass inline
  // arrow functions for these callbacks, so they change identity on every
  // render. If we put them in the effect's deps array, every parent re-render
  // would re-run the effect — including the setReason('') reset, which would
  // wipe out the textarea while the user is mid-typing. Reading via ref
  // keeps the effect stable across re-renders.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Initialise state when the modal *opens* (or the requested mode flips).
  // The cleanup flag prevents a slow fetch from setting state after the modal
  // already closed (avoids the "state update on unmounted component" pattern
  // and protects against late responses overwriting a fresh open).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setMode(initialMode);
    setReason('');
    setAuthor(null);
    setAt(null);
    if (initialMode === 'view') {
      setLoading(true);
      fetchUrgentReason(cardId)
        .then((r) => {
          if (cancelled) return;
          setReason(r.reason ?? '');
          setAuthor(r.by);
          setAt(r.at);
        })
        .catch((e) => {
          if (cancelled) return;
          console.error('[urgente-motivo] fetch', e);
          alert(friendlyError(e, 'Não foi possível carregar o motivo.'));
          onCloseRef.current();
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [open, initialMode, cardId]);

  const canEdit = mode !== 'create' && !!author && author === currentUserId;

  async function confirmCreate() {
    const trimmed = reason.trim();
    if (!trimmed) {
      alert('Informe o motivo da urgência.');
      return;
    }
    setBusy(true);
    try {
      await assignUrgentWithReason(cardId, labelId, trimmed);
      onApplied?.();
      onClose();
    } catch (e) {
      alert(friendlyError(e, 'Não foi possível aplicar a etiqueta Urgente.'));
    } finally {
      setBusy(false);
    }
  }

  async function confirmEdit() {
    const trimmed = reason.trim();
    if (!trimmed) {
      alert('O motivo não pode ficar em branco.');
      return;
    }
    setBusy(true);
    try {
      await updateUrgentReason(cardId, trimmed);
      onApplied?.();
      setMode('view');
      setAt(new Date().toISOString());
    } catch (e) {
      alert(friendlyError(e, 'Não foi possível atualizar o motivo.'));
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === 'create'
      ? 'Por que esta ficha é urgente?'
      : mode === 'edit'
        ? 'Editar motivo da urgência'
        : 'Motivo da urgência';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      dismissOnBackdrop={mode === 'view'}
    >
      <div className="space-y-3">
        {mode === 'create' && (
          <p className="text-sm text-zinc-700">
            Descreva o motivo. Outras pessoas verão essa nota ao clicar na
            etiqueta.
          </p>
        )}
        {mode === 'view' && loading && (
          <p className="text-sm text-zinc-500">Carregando…</p>
        )}
        {mode === 'view' && !loading && (
          <>
            <blockquote className="relative border-l-4 border-red-400 bg-red-50/40 pl-8 pr-3 py-2.5 text-sm italic text-zinc-800 whitespace-pre-wrap">
              <Quote
                aria-hidden
                className="absolute left-2 top-2 h-4 w-4 text-red-300"
              />
              {reason || (
                <span className="not-italic text-zinc-400">
                  (sem motivo registrado)
                </span>
              )}
            </blockquote>
            <p className="text-xs text-zinc-500">
              {authorName ? <>Marcado por <strong>{authorName}</strong></> : null}
              {at ? (
                <> · {new Date(at).toLocaleString('pt-BR')}</>
              ) : null}
            </p>
          </>
        )}
        {(mode === 'create' || mode === 'edit') && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onPaste={pasteNormalizeSpaces}
            className="w-full rounded-[8px] border border-zinc-300 bg-white px-3 py-2 text-sm transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            rows={3}
            placeholder="Ex: Cliente VIP precisa de retorno hoje"
            autoFocus
          />
        )}
        <div className="flex items-center justify-end gap-2">
          {mode === 'view' && canEdit && (
            <button
              onClick={() => setMode('edit')}
              className="h-9 rounded-[8px] border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              type="button"
            >
              Editar
            </button>
          )}
          {mode === 'edit' && (
            <button
              onClick={() => {
                // Switch back to view + reload the persisted reason from the
                // server (cheap, single row read). No cancellation logic
                // needed here: clicking Cancel synchronously hides the edit
                // controls and any late response just updates the displayed
                // view text — which is exactly the desired behaviour.
                setMode('view');
                setLoading(true);
                fetchUrgentReason(cardId)
                  .then((r) => setReason(r.reason ?? ''))
                  .finally(() => setLoading(false));
              }}
              disabled={busy}
              className="h-9 rounded-[8px] border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              type="button"
            >
              Cancelar
            </button>
          )}
          {mode === 'create' && (
            <button
              onClick={() => void confirmCreate()}
              disabled={busy}
              className="h-9 rounded-[8px] bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70"
              type="button"
            >
              {busy ? 'Aplicando…' : 'Confirmar'}
            </button>
          )}
          {mode === 'edit' && (
            <button
              onClick={() => void confirmEdit()}
              disabled={busy}
              className="h-9 rounded-[8px] bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70"
              type="button"
            >
              {busy ? 'Salvando…' : 'Salvar'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
