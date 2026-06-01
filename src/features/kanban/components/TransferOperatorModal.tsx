'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightLeft, Check } from 'lucide-react';
import { Modal } from '@/features/kanban/components/Modal';
import { UserAvatar } from '@/components/ui/avatar';
import { transferAnalyst, transferVendor } from '@/services/transferOperator';
import type { ProfileLite } from '@/services/profiles';
import { friendlyError } from '@/lib/errors';

export type TransferRole = 'vendor' | 'analyst';

// Roles a TransferOperatorModal considers eligible per side:
//   vendor  → only 'vendedor'
//   analyst → 'analista' and 'gestor' (gestor also handles analysis)
function eligibleRoles(role: TransferRole): string[] {
  return role === 'vendor' ? ['vendedor'] : ['analista', 'gestor'];
}

export function TransferOperatorModal({
  open,
  onClose,
  role,
  cardId,
  currentId,
  profiles,
  onTransferred,
}: {
  open: boolean;
  onClose: () => void;
  role: TransferRole;
  cardId: string;
  // Current vendor_id or assignee_id — the option matching this id is
  // visually marked as "Atual" and disabled (no-op transfer).
  currentId: string | null;
  profiles: ProfileLite[];
  // Called after a successful transfer so the parent can refresh display
  // (lookup name from profiles, etc.).
  onTransferred?: (newId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  // Refs to break the dependency cycle on inline callbacks from parents —
  // same pattern as UrgenteMotivoModal: parent re-renders shouldn't reset
  // the user's selection mid-flow.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setConfirming(false);
  }, [open, cardId, role]);

  const eligible = useMemo(() => {
    const allowed = eligibleRoles(role);
    return profiles
      .filter((p) => allowed.includes(p.role ?? ''))
      .slice()
      .sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? ''));
  }, [profiles, role]);

  const currentName = useMemo(() => {
    if (!currentId) return '';
    return profiles.find((p) => p.id === currentId)?.full_name ?? '';
  }, [profiles, currentId]);

  const selectedName = useMemo(() => {
    if (!selected) return '';
    return profiles.find((p) => p.id === selected)?.full_name ?? '';
  }, [profiles, selected]);

  function startConfirm() {
    if (!selected) {
      alert('Escolha uma pessoa para transferir.');
      return;
    }
    if (selected === currentId) {
      // No-op: same operator already assigned.
      onCloseRef.current();
      return;
    }
    setConfirming(true);
  }

  async function confirmTransfer() {
    if (!selected) return;
    setBusy(true);
    try {
      if (role === 'vendor') await transferVendor(cardId, selected);
      else await transferAnalyst(cardId, selected);
      onTransferred?.(selected);
      onCloseRef.current();
    } catch (e) {
      alert(friendlyError(e, 'Não foi possível transferir a ficha.'));
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  const title = 'Transferir Cadastro';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      titleIcon={<ArrowRightLeft className="h-4 w-4" />}
      dismissOnBackdrop={!busy}
    >
      {confirming ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-700">
            Confirmar transferência da ficha de{' '}
            <strong>{currentName || '(sem responsável)'}</strong> para{' '}
            <strong>{selectedName}</strong>?
          </p>
          <p className="text-xs text-zinc-500">
            Esta ação será registrada no histórico da ficha e propagada em
            tempo real para o time.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="h-9 rounded-[8px] border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => void confirmTransfer()}
              disabled={busy}
              className="h-9 rounded-[8px] bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
            >
              {busy ? 'Transferindo…' : 'Confirmar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-700">
            Selecione quem assume a ficha. O atual continuará com acesso de
            leitura através do histórico.
          </p>
          <div className="max-h-72 overflow-y-auto rounded-[8px] border border-zinc-200 divide-y divide-zinc-100">
            {eligible.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-zinc-500">
                Nenhuma pessoa disponível para esse papel.
              </p>
            ) : (
              eligible.map((p) => {
                const isCurrent = p.id === currentId;
                const isChecked = selected === p.id;
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition ${
                      isChecked ? 'bg-emerald-50' : 'hover:bg-zinc-50'
                    }`}
                  >
                    {/* Origin UI-style checkbox tinted in the app primary
                        (emerald). Native checkbox stays in the DOM for a11y
                        / keyboard but is visually hidden behind the styled
                        square. */}
                    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                      <input
                        type="checkbox"
                        name="transfer-target"
                        value={p.id}
                        checked={isChecked}
                        onChange={() => setSelected(isChecked ? null : p.id)}
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
                    <UserAvatar name={p.full_name ?? '—'} size="xs" />
                    <span className="flex-1 truncate text-zinc-800">
                      {p.full_name ?? '—'}
                    </span>
                    {isCurrent && (
                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                        Atual
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={startConfirm}
              disabled={!selected || selected === currentId}
              className="h-9 rounded-[8px] bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Transferir
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
