'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, MoreHorizontal, Quote } from 'lucide-react';
import { Modal } from '@/features/kanban/components/Modal';
import { fetchCancelReason, updateCancelReason } from '@/services/labels';
import { listProfiles } from '@/services/profiles';
import { friendlyError } from '@/lib/errors';
import { pasteNormalizeSpaces } from '@/lib/utils';

type Mode = 'view' | 'edit';

function CancelReasonMenu({ onEdit }: { onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  };

  return (
    <div>
      <button
        ref={btnRef}
        type="button"
        aria-label="Mais ações"
        onClick={handleToggle}
        className="rounded-full p-1 hover:bg-zinc-100 transition-colors"
      >
        <MoreHorizontal className="h-4 w-4 text-zinc-500" strokeWidth={2} />
      </button>
      {open && pos && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] w-40 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 overflow-hidden"
            style={{ top: pos.top, right: pos.right }}
          >
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              onClick={() => { setOpen(false); onEdit(); }}
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}

export function CanceladaMotivoModal({
  open,
  onClose,
  cardId,
  currentUserId,
}: {
  open: boolean;
  onClose: () => void;
  cardId: string;
  currentUserId?: string | null;
}) {
  const [mode, setMode] = useState<Mode>('view');
  const [reason, setReason] = useState('');
  const [byId, setById] = useState<string | null>(null);
  const [byName, setByName] = useState<string | null>(null);
  const [at, setAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setMode('view');
    setReason('');
    setById(null);
    setByName(null);
    setAt(null);
    setLoading(true);
    Promise.all([fetchCancelReason(cardId), listProfiles()])
      .then(([info, profs]) => {
        if (cancelled) return;
        setReason(info.reason ?? '');
        setById(info.by);
        setAt(info.at);
        const profile = info.by ? profs.find((p) => p.id === info.by) : null;
        setByName(profile?.full_name ?? null);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error('[cancelada-motivo] fetch', e);
        alert(friendlyError(e, 'Não foi possível carregar o motivo.'));
        onCloseRef.current();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, cardId]);

  const canEdit = !!currentUserId && !!byId && currentUserId === byId;

  async function confirmEdit() {
    const trimmed = reason.trim();
    if (!trimmed) {
      alert('O motivo não pode ficar em branco.');
      return;
    }
    setBusy(true);
    try {
      await updateCancelReason(cardId, trimmed);
      setMode('view');
      setAt(new Date().toISOString());
    } catch (e) {
      alert(friendlyError(e, 'Não foi possível atualizar o motivo.'));
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'edit' ? 'Editar motivo do cancelamento' : 'Motivo do cancelamento';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      titleIcon={<AlertTriangle className="h-4 w-4" />}
      dismissOnBackdrop={mode === 'view'}
    >
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-500">Carregando…</p>
        ) : mode === 'view' ? (
          <>
            <div className="relative">
              <blockquote className="relative border-l-4 border-yellow-400 bg-yellow-50/60 pl-8 pr-8 py-2.5 text-sm italic text-zinc-800 whitespace-pre-wrap">
                <Quote aria-hidden className="absolute left-2 top-2 h-4 w-4 text-yellow-400" />
                {reason || (
                  <span className="not-italic text-zinc-400">(sem motivo registrado)</span>
                )}
              </blockquote>
              {canEdit && (
                <div className="absolute top-1 right-1">
                  <CancelReasonMenu onEdit={() => setMode('edit')} />
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {byName ? <>Cancelado por <strong>{byName}</strong></> : null}
              {at ? <> · {new Date(at).toLocaleString('pt-BR')}</> : null}
            </p>
          </>
        ) : (
          <>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onPaste={pasteNormalizeSpaces}
              className="w-full rounded-[8px] border border-zinc-300 bg-white px-3 py-2 text-sm transition focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
              rows={3}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('view');
                  setLoading(true);
                  fetchCancelReason(cardId)
                    .then((r) => setReason(r.reason ?? ''))
                    .finally(() => setLoading(false));
                }}
                disabled={busy}
                className="h-9 rounded-[8px] border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmEdit()}
                disabled={busy}
                className="h-9 rounded-[8px] bg-yellow-500 px-4 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-70"
              >
                {busy ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
