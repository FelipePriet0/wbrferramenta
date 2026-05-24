'use client';

import { useState } from 'react';
import { SimpleSelect } from '@/components/ui/select';
import type { FieldStatus } from '../types';
import { ContextMenu } from './ContextMenu';
import { FieldHistoryModal } from './FieldHistoryModal';
import { useAuditApplicantId } from '../AuditContext';
import { usePresenceContext } from '@/features/presence/PresenceContext';
import { PresenceFieldHighlight } from '@/components/ui/PresenceFieldHighlight';

// Wraps SimpleSelect with the Adobe-style inline label + status dot, matching
// AdobeField's footprint so PF/PJ row layouts read uniformly.
export function AdobeSelect({
  label,
  value,
  onChange,
  options,
  className,
  triggerClassName,
  contentClassName,
  placeholder,
  disabled,
  requiredMark,
  error,
  status = 'idle',
  auditField,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { label: string; value: string; disabled?: boolean })[];
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  requiredMark?: boolean;
  error?: boolean;
  status?: FieldStatus;
  auditField?: string;
}) {
  const applicantId = useAuditApplicantId();
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const presence = usePresenceContext();
  const fieldPeers = auditField && presence ? presence.getFieldPeers(auditField) : [];

  const handleContextMenu = auditField && applicantId
    ? (e: React.MouseEvent) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }
    : undefined;

  const baseTrigger =
    'h-10 rounded-[7px] px-3 text-sm bg-zinc-50 border border-zinc-200 shadow-[0_5.447px_5.447px_rgba(0,0,0,0.25)] focus-visible:ring-[3px] focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 uppercase font-[family-name:var(--font-arvo)]';
  const stateTrigger = disabled
    ? 'opacity-50 pointer-events-none cursor-not-allowed bg-gray-100 text-gray-400 border-zinc-200'
    : error
      ? 'border-red-400 bg-red-50'
      : requiredMark
        ? 'border-emerald-500 bg-emerald-50'
        : '';
  return (
    <PresenceFieldHighlight peers={fieldPeers} className={`${className ?? ''}`}>
      <div className="field-inline" onContextMenu={handleContextMenu}>
        {label && (
          <label className="text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600 shrink-0 font-[family-name:var(--font-bebas)]">
            {label}
          </label>
        )}
        <div
          className="select-wrap flex-1 min-w-0"
          onFocus={() => auditField && presence?.trackField(auditField)}
          onBlur={() => presence?.trackField(null)}
        >
          <SimpleSelect
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            className="mt-0"
            triggerClassName={triggerClassName ?? `${baseTrigger} ${stateTrigger}`}
            contentClassName={contentClassName ?? 'rounded-lg shadow-lg border-0'}
            contentStyle={{ zIndex: 9999 }}
          />
        </div>

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
            fieldLabel={label ?? auditField}
            onClose={() => setHistoryOpen(false)}
          />
        )}
      </div>
    </PresenceFieldHighlight>
  );
}
