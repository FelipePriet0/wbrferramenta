'use client';

import { useState } from 'react';
import { Modal } from '@/features/kanban/components/Modal';
import { changeStage, findActiveCardByApplicant } from '@/services/kanban';
import { friendlyError } from '@/lib/errors';
import { pasteNormalizeSpaces } from '@/lib/utils';
import type { KanbanArea } from '@/lib/types';

export function CancelModal({
  open,
  onClose,
  cardId,
  applicantId,
  area,
  onCancelled,
}: {
  open: boolean;
  onClose: () => void;
  cardId: string;
  applicantId?: string;
  area: KanbanArea;
  onCancelled?: () => void;
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  function closeAll() {
    setReason('');
    onClose();
  }

  async function confirm() {
    if (!reason.trim()) {
      alert('Informe o motivo do cancelamento.');
      return;
    }
    setLoading(true);
    try {
      await changeStage(cardId, area, 'canceladas', reason.trim());
      if (area === 'comercial' && applicantId) {
        const analiseCardId = await findActiveCardByApplicant(applicantId, 'analise');
        if (analiseCardId) {
          await changeStage(analiseCardId, 'analise', 'canceladas', reason.trim());
        }
      }
      onCancelled?.();
      closeAll();
    } catch (e) {
      alert(friendlyError(e, 'Não foi possível cancelar a ficha.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={closeAll}
      title="Cancelar ficha"
      dismissOnBackdrop={false}
    >
      <div className="space-y-3">
        <p className="text-sm text-zinc-700">
          Informe o motivo do cancelamento. Esta ação será registrada.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onPaste={pasteNormalizeSpaces}
          className="w-full rounded-[8px] border border-zinc-300 bg-white px-3 py-2 text-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          rows={3}
          placeholder="Ex: Cliente desistiu / Dados inconsistentes"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={confirm}
            disabled={loading}
            className="h-9 rounded-[8px] bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}
