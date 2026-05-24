'use client';

import * as React from 'react';
import { useState } from 'react';
import { SimpleSelect } from '@/components/ui/select';
import type { Opt } from '../types';
import { ContextMenu } from '@/features/expanded-ficha/components/ContextMenu';
import { FieldHistoryModal } from '@/features/expanded-ficha/components/FieldHistoryModal';
import { useAuditApplicantId } from '@/features/expanded-ficha/AuditContext';
import { pasteNormalizeSpaces } from '@/lib/utils';
import { usePresenceContext } from '@/features/presence/PresenceContext';
import { PresenceFieldHighlight } from '@/components/ui/PresenceFieldHighlight';

const labelCls =
  'block mb-1.5 text-[14px] font-bold uppercase tracking-wide leading-none text-zinc-600';
const inputCls =
  'h-10 w-full rounded-[2px] border border-zinc-400 bg-blue-100 px-3 text-sm outline-none text-zinc-900 focus-visible:ring-[3px] focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 transition-colors font-bold';
const inputDisabledCls = 'text-zinc-400 cursor-not-allowed opacity-70';

export function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  maxLength,
  inputMode,
  status = 'idle',
  onBlur,
noUppercase,
auditField,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  status?: 'idle' | 'pending' | 'error';
  onBlur?: () => void;
noUppercase?: boolean;
auditField?: string;
}) {
  const id = `fld-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const applicantId = useAuditApplicantId();
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const presence = usePresenceContext();
  const fieldPeers = auditField && presence ? presence.getFieldPeers(auditField) : [];

  const handleContextMenu = auditField && applicantId
    ? (e: React.MouseEvent) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }
    : undefined;

  return (
    <PresenceFieldHighlight peers={fieldPeers} className="relative w-full">
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => auditField && presence?.trackField(auditField)}
        onBlur={() => {
          presence?.trackField(null);
          onBlur?.();
        }}
        onPaste={pasteNormalizeSpaces}
        onContextMenu={handleContextMenu}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`${inputCls} ${disabled ? inputDisabledCls : ''} ${noUppercase ? '' : 'uppercase'}`}
      />
      <FieldStatusIndicator status={status} />

      {ctxMenu && (
        <ContextMenu
          pos={ctxMenu}
          items={[{ label: 'Histórico do campo', onClick: () => setHistoryOpen(true) }]}
          onClose={() => setCtxMenu(null)}
        />
      )}
      {historyOpen && auditField && applicantId && (
        <FieldHistoryModal
          applicantId={applicantId}
          field={auditField}
          fieldLabel={label}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </PresenceFieldHighlight>
  );
}

type SelectProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
};

export function Select({ label, value, onChange, options }: SelectProps) {
  const id = `sel-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="w-full">
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <SimpleSelect
        value={value}
        onChange={(v) => onChange(v)}
        options={options}
        placeholder=""
        triggerClassName="h-10 rounded-[2px] px-3 text-sm bg-blue-100 border border-zinc-400 shadow-none focus-visible:ring-[3px] focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 uppercase font-bold"
        contentClassName="shadow-none"
      />
    </div>
  );
}

function FieldStatusIndicator({
  status,
}: {
  status: 'idle' | 'pending' | 'error';
}) {
  if (status === 'idle') return null;
  return (
    <div className="mt-0.5 flex h-4 items-center gap-1 text-xs text-gray-500">
      {status === 'pending' && <span>Salvando…</span>}
      {status === 'error' && (
        <span className="text-red-500">Erro ao salvar</span>
      )}
    </div>
  );
}
