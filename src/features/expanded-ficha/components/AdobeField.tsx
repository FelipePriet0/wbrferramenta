'use client';

import { useEffect, useRef, useState } from 'react';
import type { FieldStatus } from '../types';
import { ContextMenu } from './ContextMenu';
import { FieldHistoryModal } from './FieldHistoryModal';
import { useAuditApplicantId } from '../AuditContext';
import { pasteNormalizeSpaces } from '@/lib/utils';
import { usePresenceContext } from '@/features/presence/PresenceContext';
import { PresenceFieldHighlight } from '@/components/ui/PresenceFieldHighlight';

// `status` kept in the API but visually no-op — the global "Salvando…/Salvo"
// banner at the top of the ficha is the single source of save feedback.

// Auto-shrink: shrinks 13px → 7px in 0.5 steps when text overflows the input's
// horizontal space. Mirrors the Adobe-PDF feel of the old page (one canvas
// shared on window to keep allocation cheap).
function applyAutoShrink(el: HTMLInputElement, value: string) {
  const MAX = 13;
  const MIN = 1;
  const STEP = 0.5;
  el.style.setProperty('--field-fs', `${MAX}px`);
  if (!value || el.clientWidth === 0) return;
  const available = el.clientWidth - 14;
  if (available <= 0) return;
  const w = window as unknown as { __mzMeasureCanvas?: HTMLCanvasElement };
  w.__mzMeasureCanvas ??= document.createElement('canvas');
  const ctx = w.__mzMeasureCanvas.getContext('2d');
  if (!ctx) return;
  const computed = getComputedStyle(el);
  const fontFamily = computed.fontFamily || 'sans-serif';
  // Mede o texto como ele será renderizado (respeita text-transform: uppercase)
  const displayValue = computed.textTransform === 'uppercase' ? value.toUpperCase() : value;
  let size = MAX;
  while (size > MIN) {
    ctx.font = `400 ${size}px ${fontFamily}`;
    if (ctx.measureText(displayValue).width <= available) break;
    size = Math.max(MIN, size - STEP);
  }
  el.style.setProperty('--field-fs', `${size}px`);
}

export function AdobeField({
  label,
  value,
  onChange,
  onBlur,
  className,
  error,
  red,
  blue,
  requiredMark,
  disabled,
  maxLength,
  status = 'idle',
  placeholder,
  inputMode,
  title,
noUppercase,
auditField,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  className?: string;
  error?: boolean;
  red?: boolean;
  blue?: boolean;
  requiredMark?: boolean;
  disabled?: boolean;
  maxLength?: number;
  // Kept for API compatibility — see file header.
  status?: FieldStatus;
  placeholder?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  // Native tooltip — most useful when disabled to explain why the field is
  // locked. Applied to the wrapper so hover on the label also triggers it.
  title?: string;
noUppercase?: boolean;
auditField?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const applicantId = useAuditApplicantId();
  const presence = usePresenceContext();
  const fieldPeers = auditField && presence ? presence.getFieldPeers(auditField) : [];
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    applyAutoShrink(el, value);
    // Re-aplica quando o elemento ganhar largura final (flex/grid responsivo
    // pode não ter clientWidth correto no primeiro paint)
    const ro = new ResizeObserver(() => applyAutoShrink(el, value));
    ro.observe(el);
    return () => ro.disconnect();
  }, [value]);

  const showTooltip = !!(title && hover);

  const labelClass = `text-[9px] font-bold uppercase tracking-wide leading-none font-[family-name:var(--font-bebas)]${
    red ? ' label-red' : blue ? ' label-blue' : ' text-zinc-600'
  }${!label ? ' no-colon' : ''}`;

  const inputClass = `h-[21px] w-full rounded-[2px] border ${
    error || red
      ? 'border-red-400 bg-red-50'
      : requiredMark && !disabled
        ? 'border-emerald-500 bg-emerald-50 placeholder:text-emerald-600 placeholder:font-semibold'
        : 'border-zinc-400 bg-blue-100'
  } px-1 outline-none focus:border-zinc-600 ${
    disabled ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'text-zinc-900'
  }${red && !disabled ? ' input-red' : ''}${noUppercase ? '' : ' uppercase'} font-[family-name:var(--font-arvo)]`;

  const handleContextMenu = auditField && applicantId
    ? (e: React.MouseEvent) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }
    : undefined;

  // We render disabled inputs as readOnly + tabIndex=-1 because `disabled`
  // elements skip mouse events in most browsers — that's why `title` tooltips
  // never appeared. The visual styling and behavior (no edit, no tab focus)
  // are the same.
  return (
    <PresenceFieldHighlight peers={fieldPeers} className={`relative ${className ?? ''}`}>
      <div
        onMouseEnter={title ? () => setHover(true) : undefined}
        onMouseLeave={title ? () => setHover(false) : undefined}
      >
      <div className="field-inline">
        <label className={labelClass}>{label}</label>
        <input
          ref={inputRef}
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
          readOnly={disabled}
          tabIndex={disabled ? -1 : undefined}
          aria-disabled={disabled || undefined}
          maxLength={maxLength}
          inputMode={inputMode}
          className={inputClass}
          style={{ fontSize: 'var(--field-fs, 10px)' }}
          placeholder={
            requiredMark && !disabled ? 'Obrigatório' : (placeholder ?? '')
          }
          autoComplete="off"
        />
      </div>
      {showTooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg"
        >
          {title}
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
      </div>
    </PresenceFieldHighlight>
  );
}
