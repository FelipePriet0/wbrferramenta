'use client';

import { useEffect, useRef, useState } from 'react';
import type { FieldStatus } from '../types';
import { ContextMenu } from './ContextMenu';
import { FieldHistoryModal } from './FieldHistoryModal';
import { useAuditApplicantId } from '../AuditContext';
import { pasteNormalizeSpaces } from '@/lib/utils';
import { usePresenceContext } from '@/features/presence/PresenceContext';
import { PresenceFieldHighlight } from '@/components/ui/PresenceFieldHighlight';

export function AdobeTextarea({
  label,
  value,
  onChange,
  onBlur,
  red,
  error,
  className,
  requiredMark,
  disabled,
  status = 'idle',
  stack,
  compact,
  shrinkMin = 6,
  textareaClassName = '',
  autoGrow = false,
  yellowLabel = false,
  lastEdit,
  auditField,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  red?: boolean;
  error?: boolean;
  className?: string;
  requiredMark?: boolean;
  disabled?: boolean;
  status?: FieldStatus;
  stack?: boolean;
  compact?: boolean;
  shrinkMin?: number;
  textareaClassName?: string;
  autoGrow?: boolean;
  yellowLabel?: boolean;
  lastEdit?: { name: string; at: string; action?: 'preenchido' | 'atualizado' | 'apagado' };
  auditField?: string;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const applicantId = useAuditApplicantId();
  const presence = usePresenceContext();
  const fieldPeers = auditField && presence ? presence.getFieldPeers(auditField) : [];

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    const MAX_FONT = 13;
    const STEP = 0.5;
    const MIN = compact ? 7 : shrinkMin;
    const MAX_HEIGHT = 100;
    const MIN_HEIGHT = 21;

    el.style.whiteSpace = '';
    el.style.overflowY = 'hidden';
    el.style.setProperty('--mz-ta-fs', `${MAX_FONT}px`);

    if (autoGrow && !compact) {
      el.style.height = 'auto';
      const natural = el.scrollHeight;
      if (natural <= MAX_HEIGHT) {
        el.style.height = `${Math.max(MIN_HEIGHT, natural)}px`;
        return;
      }
      el.style.height = `${MAX_HEIGHT}px`;
    }

    let size = MAX_FONT;
    while (el.scrollHeight > el.clientHeight && size > MIN) {
      size = Math.max(MIN, size - STEP);
      el.style.setProperty('--mz-ta-fs', `${size}px`);
    }
    el.style.overflowY = 'hidden';
  }, [value, compact, shrinkMin, autoGrow]);

  const compactLabelClass = `text-[9px] font-bold uppercase tracking-wide leading-none${
    red ? ' label-red' : ' text-zinc-600'
  }`;
  const regularLabelClass = `pf-section-title pt-1${red ? ' label-red' : ''}`;

  const ACTION_LABEL: Record<string, string> = {
    preenchido: 'Preenchido por',
    atualizado: 'Atualizado por',
    apagado: 'Apagado por',
  };

  const auditSpan = lastEdit ? (
    <span className="text-[11px] text-zinc-400 leading-none font-normal normal-case tracking-normal">
      {lastEdit.action ? `${ACTION_LABEL[lastEdit.action] ?? lastEdit.action} ` : ''}
      {lastEdit.name} · {new Date(lastEdit.at).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })}
    </span>
  ) : null;

  const handleContextMenu = auditField && applicantId
    ? (e: React.MouseEvent) => {
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY });
      }
    : undefined;

  const textarea = (
    <textarea
      ref={taRef}
      value={value}
      onChange={(e) => {
        if (disabled) return;
        onChange(e.target.value);
      }}
      onFocus={() => auditField && presence?.trackField(auditField)}
      onBlur={() => {
        presence?.trackField(null);
        onBlur?.();
      }}
      onPaste={pasteNormalizeSpaces}
      onContextMenu={handleContextMenu}
      disabled={disabled}
      rows={compact ? 1 : undefined}
      className={`${
        compact ? 'pf-textarea-compact overflow-hidden' : 'py-1'
      } w-full rounded-[2px] border ${
        error || red
          ? 'border-red-300 bg-red-50'
          : requiredMark && !disabled
            ? 'border-emerald-500 bg-emerald-50 placeholder:text-emerald-600 placeholder:font-semibold'
            : 'border-zinc-300 bg-blue-100'
      } px-1.5 text-[10px] outline-none ${
        red ? 'text-red-700' : 'text-zinc-900'
      } resize-none uppercase font-bold font-[family-name:var(--font-inter)] ${textareaClassName}`}
      placeholder={requiredMark && !disabled ? 'Obrigatório' : ''}
    />
  );

  return (
    <PresenceFieldHighlight peers={fieldPeers} className={className}>
      {stack ? (
        <>
          <div className="border-b border-zinc-500 mb-1 pb-0.5 flex items-baseline gap-2">
            <label className={`${regularLabelClass}${yellowLabel ? ' bg-yellow-200 px-1 py-0.5 rounded' : ''}`}>{label}</label>
            {auditSpan}
          </div>
          {textarea}
        </>
      ) : (
        <div className="field-inline">
          {auditSpan ? (
            <div className="flex items-baseline gap-1">
              <label className={compact ? compactLabelClass : regularLabelClass}>
                {label}
              </label>
              {auditSpan}
            </div>
          ) : (
            <label className={compact ? compactLabelClass : regularLabelClass}>
              {label}
            </label>
          )}
          {textarea}
        </div>
      )}

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
