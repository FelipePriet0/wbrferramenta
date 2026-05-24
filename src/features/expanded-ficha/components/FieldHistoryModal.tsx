'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserCircle } from 'lucide-react';
import { fetchFieldHistory, type FieldHistoryEntry } from '@/services/fieldAuditLog';

const ACTION_LABEL: Record<string, string> = {
  preenchido: 'Preenchido por',
  atualizado: 'Atualizado por',
  apagado: 'Apagado por',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export function FieldHistoryModal({
  applicantId,
  field,
  fieldLabel,
  onClose,
}: {
  applicantId: string;
  field: string;
  fieldLabel: string;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<FieldHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchFieldHistory(applicantId, field)
      .then(setEntries)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [applicantId, field]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[640px] max-h-[92vh] flex flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-t-lg"
          style={{ background: 'var(--verde-primario)' }}
        >
          <div className="flex items-center gap-2">
            <UserCircle className="size-5 text-white/80 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/70">
                Histórico do campo
              </p>
              <p className="text-[13px] font-semibold text-white">{fieldLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-[20px] leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
          {loading && (
            <p className="text-[12px] text-zinc-400 text-center py-6">Carregando…</p>
          )}
          {!loading && error && (
            <p className="text-[12px] text-red-500 text-center py-6">Erro ao carregar histórico.</p>
          )}
          {!loading && !error && entries.length === 0 && (
            <p className="text-[12px] text-zinc-400 text-center py-6">Nenhuma alteração registrada.</p>
          )}
          {!loading && !error && entries.map((e) => (
            <div key={e.id} className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2">
              <p className="text-[11px] text-zinc-500">
                <span className="font-medium text-zinc-700">
                  {e.action ? (ACTION_LABEL[e.action] ?? e.action) : 'Alterado por'}{' '}
                  {e.by_name ?? '—'}
                </span>
                {' · '}
                {fmt(e.at)}
              </p>
              <div className="mt-1.5 space-y-1">
                {e.old_value != null && (
                  <div className="flex gap-1.5 items-start">
                    <span className="mt-0.5 shrink-0 text-[9px] font-bold uppercase tracking-wide text-zinc-400 w-[28px]">De</span>
                    <span className="text-[11px] text-zinc-500 line-through break-words">{e.old_value || '(vazio)'}</span>
                  </div>
                )}
                <div className="flex gap-1.5 items-start">
                  <span className="mt-0.5 shrink-0 text-[9px] font-bold uppercase tracking-wide text-zinc-400 w-[28px]">Para</span>
                  <span className="text-[11px] text-zinc-800 break-words">{e.new_value || '(vazio)'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
