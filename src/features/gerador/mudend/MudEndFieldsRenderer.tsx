'use client';

import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SimpleSelect } from '@/components/ui/select';
import { formatCep, formatPhoneBR } from '@/lib/masks';
import { formatSinalFibraMask } from '@/lib/sinalFibraMask';
import type { OsTemplateField } from './osTemplateField';

/**
 * Renderer genérico dos campos declarativos de um modelo de mud-end
 * (OsTemplateField[]). Despacha cada `control` para os componentes de input
 * do sistema, respeitando `showWhen`, `section` e `layout.md` (grid de 12
 * colunas). Versão WBR: sem o "Histórico do campo" (não há persistência —
 * o gerador é stateless).
 *
 * NÃO renderiza a seção AGENDAMENTO (data/hora) — essa vira bloco próprio do
 * gerador. Use `skipIds` p/ excluir campos tratados à parte.
 */

const SELECT_CLS =
  'h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 ' +
  'shadow-[0_5.447px_5.447px_rgba(0,0,0,0.25)] outline-none ' +
  'focus-visible:border-[#0B42C6] focus-visible:ring-[3px] focus-visible:ring-[#0B42C6]/20 ' +
  'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

/** Avalia o showWhen de um campo contra os valores atuais. */
export function isFieldVisible(field: OsTemplateField, values: Record<string, string>): boolean {
  if (!field.showWhen) return true;
  const cur = values[field.showWhen.field] ?? '';
  const eq = field.showWhen.equals;
  return Array.isArray(eq) ? eq.includes(cur) : cur === eq;
}

function FieldShell({ label, md, children }: {
  label: string; md: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5" style={{ gridColumn: `span ${md} / span ${md}` }}>
      <label className="block text-[13px] font-bold uppercase tracking-wide leading-none text-zinc-600 dark:text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Radio com pares {value,label} — armazena value, mostra label (quadrado azul). */
export function RadioPairs({
  id, options, value, onChange,
}: {
  id: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 pt-1 text-sm">
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label key={opt.value} className="flex cursor-pointer items-center gap-2">
            <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
              <input
                type="radio"
                name={id}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="peer absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
              />
              <span className={`pointer-events-none flex h-4 w-4 items-center justify-center rounded-[4px] border transition ${
                checked ? 'border-[#0B42C6] bg-[#0B42C6]' : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800'
              } peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300`}>
                {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>
            </span>
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

function Control({ field, value, onChange }: { field: OsTemplateField; value: string; onChange: (v: string) => void }) {
  const opts = (field.options ?? []).map((o) => ({ value: o.value, label: o.label }));
  switch (field.control) {
    case 'select':
      return (
        <SimpleSelect
          value={value}
          onChange={onChange}
          options={opts}
          placeholder="Selecionar"
          triggerClassName={SELECT_CLS}
        />
      );
    case 'radio':
      return <RadioPairs id={field.id} options={opts} value={value} onChange={onChange} />;
    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-[0_5.447px_5.447px_rgba(0,0,0,0.25)] outline-none focus-visible:border-[#0B42C6] focus-visible:ring-[3px] focus-visible:ring-[#0B42C6]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      );
    case 'datetime':
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? 'DD/MM/AAAA HH:MM'}
        />
      );
    case 'phone':
      // Mascara (00) 00000-0000 na digitação; buildTextos faz digits() na saída.
      return (
        <Input
          value={value}
          onChange={(e) => onChange(formatPhoneBR(e.target.value))}
          placeholder={field.placeholder ?? 'Somente os números'}
          inputMode="numeric"
        />
      );
    case 'signal':
      // Máscara 00.00 que PRESERVA o "-" digitado (sem "-" automático).
      return (
        <Input
          value={value}
          onChange={(e) => onChange(formatSinalFibraMask(e.target.value))}
          placeholder={field.placeholder ?? 'Ex.: -23.45'}
          inputMode="text"
        />
      );
    default: // text e fallback
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
  }
}

/** Campo CEP com máscara + autofill de logradouro/bairro (ViaCEP). */
function CepField({ value, setField }: { value: string; setField: (id: string, v: string) => void }) {
  const handle = async (raw: string) => {
    const formatted = formatCep(raw);
    setField('cep', formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      try {
        const res = await fetch(`/api/cep?cep=${digits}`);
        if (res.ok) {
          const d = (await res.json()) as { logradouro?: string; bairro?: string };
          if (d.logradouro) setField('adress', d.logradouro);
          if (d.bairro) setField('bairro', d.bairro);
        }
      } catch {
        /* silencioso — operador pode preencher manualmente */
      }
    }
  };
  return (
    <Input
      value={value}
      onChange={(e) => handle(e.target.value)}
      placeholder="Insira o CEP da rua"
      maxLength={9}
      inputMode="numeric"
    />
  );
}

export function MudEndFieldsRenderer({
  fields, values, onChange, skipIds = [],
}: {
  fields: OsTemplateField[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  /** Ids tratados à parte pelo gerador (tipoSolicitacao, dataVisita, horaVisita...). */
  skipIds?: string[];
}) {
  const skip = new Set(skipIds);
  const visible = fields.filter((f) => !skip.has(f.id) && isFieldVisible(f, values));

  // Agrupa por seção preservando a ordem de aparição.
  const groups: { section: string; items: OsTemplateField[] }[] = [];
  for (const f of visible) {
    const sec = f.section ?? '';
    const last = groups[groups.length - 1];
    if (last && last.section === sec) last.items.push(f);
    else groups.push({ section: sec, items: [f] });
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((g, gi) => (
        <div key={`${g.section}-${gi}`} className="flex flex-col gap-3">
          {g.section ? (
            // Cabeçalho de seção: divisor + título na cor primária.
            <div className="flex flex-col gap-3 pt-1">
              <div className="border-t border-zinc-200 dark:border-zinc-800" />
              <h3 className="text-base font-bold tracking-[0.01em]" style={{ color: '#0B42C6' }}>{g.section}</h3>
            </div>
          ) : null}
          <div className="grid grid-cols-12 gap-3">
            {g.items.map((f) => (
              <FieldShell key={f.id} label={f.label} md={f.layout?.md ?? 12}>
                {f.id === 'cep' ? (
                  <CepField value={values.cep ?? ''} setField={onChange} />
                ) : (
                  <Control field={f} value={values[f.id] ?? ''} onChange={(v) => onChange(f.id, v)} />
                )}
              </FieldShell>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
