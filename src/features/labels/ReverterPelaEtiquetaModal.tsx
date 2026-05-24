'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Undo2 } from 'lucide-react';
import { Modal } from '@/features/kanban/components/Modal';
import { pasteNormalizeSpaces } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { changeStage } from '@/services/kanban';
import { friendlyError } from '@/lib/errors';
import type { KanbanArea } from '@/lib/types';

// Stages válidos como destino de uma reversão de cancelamento, agrupados por
// área. 'canceladas' e 'entrada' são intencionalmente excluídos — primeiro
// porque seria voltar pro próprio estado de origem, segundo porque 'entrada'
// é gated pra vendedor no change_stage. 'finalizados' também não pode (RPC
// bloqueia: revert exige new_stage <> 'finalizados').
const STAGE_OPTIONS: Record<KanbanArea, { value: string; label: string }[]> = {
  comercial: [
    { value: 'feitas', label: 'Feitas' },
    { value: 'aguardando', label: 'Aguardando' },
    { value: 'concluidas', label: 'Concluídas' },
  ],
  analise: [
    { value: 'recebidos', label: 'Recebidos' },
    { value: 'preenchidas', label: 'Preenchidas' },
    { value: 'em_analise', label: 'Em Análise' },
    { value: 'reanalise', label: 'Reanálise' },
    { value: 'aprovados', label: 'Aprovados' },
    { value: 'negados', label: 'Negados' },
  ],
};

const AREA_OPTIONS: { value: KanbanArea; label: string }[] = [
  { value: 'comercial', label: 'Comercial' },
  { value: 'analise', label: 'Análise' },
];

export function ReverterPelaEtiquetaModal({
  open,
  onClose,
  cardId,
  onReverted,
}: {
  open: boolean;
  onClose: () => void;
  cardId: string;
  // Called after a successful revert so the parent can sync state. The DB
  // trigger removes the Cancelada label automatically when stage leaves
  // 'canceladas', so the parent doesn't need to manage it manually.
  onReverted?: () => void;
}) {
  const [area, setArea] = useState<KanbanArea | null>(null);
  const [stage, setStage] = useState<string>('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [openStage, setOpenStage] = useState(false);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    setArea(null);
    setStage('');
    setReason('');
    setOpenStage(false);
  }, [open]);

  const stageOptions = useMemo(
    () => (area ? STAGE_OPTIONS[area] : []),
    [area],
  );

  const stageLabel = useMemo(
    () => stageOptions.find((s) => s.value === stage)?.label ?? '',
    [stageOptions, stage],
  );

  const canSubmit = !!area && !!stage && reason.trim().length > 0 && !busy;

  async function submit() {
    if (!area || !stage) {
      alert('Escolha a área e a coluna de destino.');
      return;
    }
    const trimmed = reason.trim();
    if (!trimmed) {
      alert('Informe o motivo da reversão.');
      return;
    }
    setBusy(true);
    try {
      await changeStage(cardId, area, stage, trimmed);
      onReverted?.();
      onCloseRef.current();
    } catch (e) {
      alert(friendlyError(e, 'Não foi possível reverter o cancelamento.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reverter cancelamento"
      titleIcon={<Undo2 className="h-4 w-4" />}
      dismissOnBackdrop={!busy}
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-700">
          A ficha sairá da coluna Canceladas e voltará pra área e coluna
          escolhidas. A etiqueta Cancelada é removida automaticamente.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Área de destino
          </label>
          {/* Mesmo estilo de checkbox do TransferOperatorModal (quadrado
              emerald + Check). Layout lado a lado pra Comercial/Análise. */}
          <div className="flex gap-3">
            {AREA_OPTIONS.map((opt) => {
              const isChecked = area === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex flex-1 cursor-pointer items-center gap-2 rounded-[8px] border px-3 py-2 text-sm transition ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-50 text-zinc-900'
                      : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      name="revert-area"
                      value={opt.value}
                      checked={isChecked}
                      onChange={() => {
                        setArea(isChecked ? null : opt.value);
                        setStage('');
                      }}
                      className="peer absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <span
                      className={`pointer-events-none flex h-4 w-4 items-center justify-center rounded-[4px] border transition ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-zinc-300 bg-white'
                      } peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-300`}
                    >
                      {isChecked && (
                        <Check
                          className="h-3 w-3 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                  </span>
                  <span className="flex-1 truncate">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Coluna de destino
          </label>
          {/* Mesmo padrão de Popover + Command usado no MoveModal pra manter
              a UX consistente com o resto do app. */}
          <Popover open={openStage} onOpenChange={setOpenStage}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-full justify-between rounded-[8px] px-3 text-sm font-normal"
              >
                {stageLabel || 'Escolha…'}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="popover-content w-[var(--radix-popover-trigger-width)] rounded-[8px] border-0 bg-white p-0 shadow-lg"
              align="start"
            >
              <Command className="rounded-[8px]">
                <CommandInput
                  placeholder="Buscar..."
                  className="command-input h-9"
                />
                <CommandList className="p-1">
                  <CommandEmpty>
                    {area
                      ? 'Nenhum resultado.'
                      : 'Escolha a área primeiro.'}
                  </CommandEmpty>
                  <CommandGroup className="p-0">
                    {stageOptions.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        className="command-item group mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-gray-700 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900"
                        value={opt.label}
                        onSelect={() => {
                          setStage(opt.value);
                          setOpenStage(false);
                        }}
                      >
                        <span className="text-sm font-medium">
                          {opt.label}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Motivo da reversão
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onPaste={pasteNormalizeSpaces}
            rows={3}
            placeholder="Ex: Cliente voltou atrás / Dados foram corrigidos"
            className="w-full rounded-[8px] border border-zinc-300 bg-white px-3 py-2 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canSubmit}
            className="h-9 rounded-[8px] bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Revertendo…' : 'Reverter ficha'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
