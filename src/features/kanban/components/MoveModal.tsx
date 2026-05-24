'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/features/kanban/components/Modal';
import { changeStage } from '@/services/kanban';
import { friendlyError } from '@/lib/errors';
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
import type { KanbanArea } from '@/lib/types';

const COMERCIAL = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'feitas', label: 'Feitas / Cadastrar no MK' },
  { value: 'aguardando', label: 'Aguardando documentos' },
  { value: 'canceladas', label: 'Canceladas' },
  { value: 'concluidas', label: 'Concluídas' },
];

const ANALISE = [
  { value: 'recebidos', label: 'Recebidos' },
  { value: 'preenchidas', label: 'Preenchidas' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'reanalise', label: 'Reanálise' },
  { value: 'aprovados', label: 'Aprovados' },
  { value: 'negados', label: 'Negados' },
  { value: 'finalizados', label: 'Finalizados' },
  { value: 'canceladas', label: 'Canceladas' },
];

export function MoveModal({
  open,
  onClose,
  cardId,
  currentStage,
  presetArea,
  onMoved,
}: {
  open: boolean;
  onClose: () => void;
  cardId: string;
  currentStage?: string;
  presetArea?: KanbanArea;
  onMoved?: () => void;
}) {
  const [area, setArea] = useState<KanbanArea>(presetArea ?? 'comercial');
  const [stage, setStage] = useState<string>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const stages = useMemo(() => (area === 'analise' ? ANALISE : COMERCIAL), [area]);
  const needsReason = stage === 'canceladas';
  const isRevert = currentStage === 'canceladas' && !!stage && stage !== 'canceladas' && stage !== 'finalizados';
  const [openArea, setOpenArea] = useState(false);
  const [openStage, setOpenStage] = useState(false);

  async function onConfirm() {
    if (!stage) return;
    if (stage === 'entrada') {
      alert('A coluna Entrada não aceita movimentação para dentro.');
      return;
    }
    if ((needsReason || isRevert) && reason.trim() === '') {
      alert(isRevert ? 'Informe o motivo da reversão.' : 'Informe o motivo para cancelar.');
      return;
    }
    setLoading(true);
    try {
      await changeStage(cardId, area, stage, (needsReason || isRevert) ? reason : undefined);
      onMoved?.();
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Falha ao mover');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Mover Card">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Kanban</label>
          <Popover open={openArea} onOpenChange={setOpenArea}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-full justify-between rounded-[8px] px-3 text-sm"
              >
                {area === 'analise' ? 'Análise' : 'Comercial'}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="popover-content w-[200px] rounded-[8px] border-0 bg-white p-0 shadow-lg"
            >
              <Command className="rounded-[8px]">
                <CommandInput placeholder="Buscar..." className="command-input h-9" />
                <CommandList className="p-1">
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup className="p-0">
                    {[
                      { value: 'comercial', label: 'Comercial' },
                      { value: 'analise', label: 'Análise' },
                    ].map((opt) => (
                      <CommandItem
                        key={opt.value}
                        className="command-item group mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-gray-700 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900"
                        value={opt.label}
                        onSelect={() => {
                          setArea(opt.value as KanbanArea);
                          setStage('');
                          setOpenArea(false);
                        }}
                      >
                        <span className="text-sm font-medium">{opt.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-600">Coluna</label>
          <Popover open={openStage} onOpenChange={setOpenStage}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-full justify-between rounded-[8px] px-3 text-sm"
              >
                {stage
                  ? (stages.find((s) => s.value === stage)?.label ?? 'Escolha…')
                  : 'Escolha…'}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="popover-content w-[200px] rounded-[8px] border-0 bg-white p-0 shadow-lg"
            >
              <Command className="rounded-[8px]">
                <CommandInput placeholder="Buscar..." className="command-input h-9" />
                <CommandList className="p-1">
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup className="p-0">
                    {stages.map((s) => (
                      <CommandItem
                        key={s.value}
                        className="command-item group mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-gray-700 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900"
                        value={s.label}
                        onSelect={() => {
                          setStage(s.value);
                          setOpenStage(false);
                        }}
                      >
                        <span className="text-sm font-medium">{s.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {(needsReason || isRevert) && (
          <div>
            <label className="mb-1 block text-sm text-zinc-600">
              {isRevert ? 'Motivo da reversão' : 'Motivo'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onPaste={pasteNormalizeSpaces}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              rows={3}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onConfirm}
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
