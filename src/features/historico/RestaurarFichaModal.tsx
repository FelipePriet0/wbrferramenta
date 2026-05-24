'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SimpleSelect } from '@/components/ui/select';
import { restoreCard } from '@/services/historico';
import type { KanbanArea } from '@/lib/types';

// Stages allowed as restore targets, mirrored from the Kanban columns. Order
// reflects the visual order on each board.
const STAGES_BY_AREA: Record<KanbanArea, { value: string; label: string }[]> = {
  comercial: [
    { value: 'feitas', label: 'Feitas / Cadastrar no MK' },
    { value: 'aguardando', label: 'Aguardando documentos' },
    { value: 'canceladas', label: 'Canceladas' },
    { value: 'concluidas', label: 'Concluídas' },
  ],
  analise: [
    { value: 'recebidos', label: 'Recebidos' },
    { value: 'preenchidas', label: 'Preenchidas' },
    { value: 'em_analise', label: 'Em Análise' },
    { value: 'reanalise', label: 'Reanálise' },
    { value: 'aprovados', label: 'Aprovados' },
    { value: 'negados', label: 'Negados' },
    { value: 'finalizados', label: 'Finalizados' },
    { value: 'canceladas', label: 'Canceladas' },
  ],
};

export function RestaurarFichaModal({
  open,
  onClose,
  cardId,
  applicantName,
  onRestored,
}: {
  open: boolean;
  onClose: () => void;
  cardId: string;
  applicantName?: string | null;
  onRestored?: (area: KanbanArea, stage: string) => void;
}) {
  const [area, setArea] = useState<KanbanArea>('analise');
  const [stage, setStage] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stageOptions = useMemo(
    () =>
      STAGES_BY_AREA[area].map((s) => ({ value: s.value, label: s.label })),
    [area],
  );

  const handleConfirm = async () => {
    if (!cardId || !stage) {
      setError('Escolha o Kanban e a Coluna.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await restoreCard(cardId, area, stage);
      onRestored?.(area, stage);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao restaurar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restaurar ficha</DialogTitle>
        </DialogHeader>

        {applicantName && (
          <p className="text-sm text-zinc-600">
            Restaurando{' '}
            <span
              className="inline-block max-w-[260px] truncate align-bottom font-semibold"
              title={applicantName}
            >
              {applicantName}
            </span>
            . Escolha onde a ficha deve reaparecer.
          </p>
        )}

        <div className="grid gap-4 py-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700">
              Kanban
            </label>
            <SimpleSelect
              value={area}
              onChange={(v) => {
                setArea(v as KanbanArea);
                setStage('');
              }}
              options={[
                { value: 'comercial', label: 'Comercial' },
                { value: 'analise', label: 'Análise' },
              ]}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700">
              Coluna
            </label>
            <SimpleSelect
              value={stage}
              onChange={setStage}
              options={stageOptions}
              placeholder="— selecione a coluna —"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={busy || !stage}
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Restaurando…' : 'Restaurar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
