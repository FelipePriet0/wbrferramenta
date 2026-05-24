'use client';

import { useState } from 'react';
import { Modal } from '@/features/kanban/components/Modal';
import { changeStage } from '@/services/kanban';
import type { KanbanArea } from '@/lib/types';
import { pasteNormalizeSpaces } from '@/lib/utils';

// Opens when the user drags a card out of "Canceladas" into any column that
// is NOT "Finalizados" or "Canceladas". The reason is required by the RPC
// (audit trail) — re-entering the active flow demands an explicit motive.
export function RevertCancelModal({
  open,
  onClose,
  cardId,
  area,
  targetStage,
  targetLabel,
  onReverted,
}: {
  open: boolean;
  onClose: () => void;
  cardId: string;
  area: KanbanArea;
  targetStage: string;
  targetLabel?: string;
  onReverted?: () => void;
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  function closeAll() {
    setReason('');
    onClose();
  }

  async function confirm() {
    if (!reason.trim()) {
      alert('Informe o motivo da reversão.');
      return;
    }
    setLoading(true);
    try {
      await changeStage(cardId, area, targetStage, reason.trim());
      onReverted?.();
      closeAll();
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : 'Não foi possível reverter o cancelamento.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={closeAll}
      title="Reverter cancelamento"
      dismissOnBackdrop={false}
    >
      <div className="space-y-3">
        <p className="text-sm text-zinc-700">
          Você está movendo uma ficha cancelada
          {targetLabel ? (
            <>
              {' '}
              para <span className="font-semibold">{targetLabel}</span>
            </>
          ) : null}
          . Explique o motivo da reversão — esta ação será registrada (data,
          autor e justificativa).
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onPaste={pasteNormalizeSpaces}
          className="w-full rounded-[8px] border border-zinc-300 bg-white px-3 py-2 text-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          rows={3}
          placeholder="Ex: Entrei em contato e o cliente reativou a contratação."
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeAll}
            disabled={loading}
            className="h-9 rounded-[8px] border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={loading}
            className="h-9 rounded-[8px] bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
          >
            {loading ? 'Revertendo…' : 'Reverter'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
