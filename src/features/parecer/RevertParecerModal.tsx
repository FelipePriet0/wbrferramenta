'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/features/kanban/components/Modal';
import { pasteNormalizeSpaces } from '@/lib/utils';

// Lightweight prompt used when a parecer with a decision lands on a card
// that is currently in "canceladas". Returns the reason text via onConfirm
// so ParecerComposer can persist it as the parecer's text (the backend then
// forwards it as set_card_decision's revert_reason — audit trail wins).
export function RevertParecerModal({
  open,
  onClose,
  onConfirm,
  initialText = '',
  decisionLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  initialText?: string;
  decisionLabel?: string;
}) {
  const [reason, setReason] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill with whatever the user already typed in the composer — they
  // explained themselves once, no point asking again from scratch.
  useEffect(() => {
    if (open) setReason(initialText);
  }, [open, initialText]);

  function handleConfirm() {
    const trimmed = reason.trim();
    if (!trimmed) {
      alert('Informe o motivo da reversão.');
      return;
    }
    setSubmitting(true);
    onConfirm(trimmed);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reverter cancelamento"
      dismissOnBackdrop={false}
    >
      <div className="space-y-3">
        <p className="text-sm text-zinc-700">
          Esta ficha está em <span className="font-semibold">Canceladas</span>.
          {decisionLabel ? (
            <>
              {' '}
              Você está enviando uma decisão de{' '}
              <span className="font-semibold">{decisionLabel}</span> e o card vai
              voltar ao fluxo de análise.
            </>
          ) : (
            ' Você está enviando uma decisão e o card vai voltar ao fluxo de análise.'
          )}{' '}
          Confirme o motivo da reversão — fica registrado no parecer e no audit.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onPaste={pasteNormalizeSpaces}
          rows={4}
          className="w-full rounded-[8px] border border-zinc-300 bg-white px-3 py-2 text-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Ex: Cliente retornou o contato e confirmou que quer prosseguir."
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-9 rounded-[8px] border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="h-9 rounded-[8px] bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
          >
            {submitting ? 'Enviando…' : 'Confirmar reversão'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
