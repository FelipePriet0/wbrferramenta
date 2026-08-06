'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Input } from '@/components/ui/input';
import { SimpleSelect } from '@/components/ui/select';
import { DateSingleKanbanPopover } from '@/components/ui/date-single-kanban-popover';
import { TimeMultiSelect } from '@/components/ui/time-multi-select';
import { timeSlotsForDate, periodosForDate, timeSlotLabel } from '@/lib/scheduleSlots';
import { formatDateLabel } from '@/lib/datetime';
import { TipoSolicitacaoSelect } from './TipoSolicitacaoSelect';
import { MudEndFieldsRenderer, RadioPairs } from './MudEndFieldsRenderer';
import { computeMudEndSections } from './outputSections';
import { MUD_END_MODEL_BY_SLUG } from './models/registry';

/**
 * Gerador de Mudança de Endereço — versão WBR, STATELESS.
 * FORMULÁRIO (esquerda) + RESULTADO ao vivo com abas (direita), igual aos
 * demais modelos do Hub Suporte: nada é salvo, nada vai pra agenda — o
 * operador preenche, copia os textos (Protocolo / O.S / Agenda) e cola nos
 * sistemas da casa. Data/horário existem só pra compor o texto de agendamento.
 */

const AZUL = '#0B42C6';

const SELECT_CLS =
  'h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 ' +
  'shadow-[0_5.447px_5.447px_rgba(0,0,0,0.25)] outline-none ' +
  'focus-visible:border-[#0B42C6] focus-visible:ring-[3px] focus-visible:ring-[#0B42C6]/20 ' +
  'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

const FieldLabelCls = 'text-[13px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300';

type Scheduling = {
  data_visita: string | null;          // ISO YYYY-MM-DD
  hora_visita: string | null;          // slot 'HH:MM' (ou null se período)
  periodo: 'manha' | 'tarde' | null;
};

const EMPTY_SCHED: Scheduling = { data_visita: null, hora_visita: null, periodo: null };

function firstNameUpper(name?: string | null): string {
  return (name ?? '').trim().split(/\s+/).filter(Boolean)[0]?.toUpperCase() ?? '';
}

/** Data/horário escolhidos → placeholders de texto ({dataVisita}, {horaVisita}). */
function schedulingTextValues(s: Scheduling): { dataVisita: string; horaVisita: string } {
  const dataVisita = s.data_visita ? (formatDateLabel(s.data_visita, 'dd/MM/yyyy') ?? '') : '';
  let horaVisita = '';
  if (s.periodo) {
    horaVisita = s.periodo === 'manha' ? 'PELA MANHÃ' : 'À TARDE';
  } else if (s.hora_visita) {
    const label = timeSlotLabel(s.hora_visita); // '11:00' → 'Após as 11'
    horaVisita = label !== s.hora_visita ? label.toUpperCase() : `ÀS ${s.hora_visita}`;
  }
  return { dataVisita, horaVisita };
}

/** Semeia os defaultValues dos fields do modelo. */
function seedDefaults(slug: string): Record<string, string> {
  const init: Record<string, string> = {};
  for (const f of MUD_END_MODEL_BY_SLUG[slug]?.getDefaults().fields ?? []) {
    if (f.defaultValue) init[f.id] = f.defaultValue;
  }
  return init;
}

export function MudEndGeneratorLite({ slug, hubBase = '/suporte' }: { slug: string; hubBase?: string }) {
  const { profile } = useAuth();
  const [values, setValues] = useState<Record<string, string>>(() => seedDefaults(slug));
  const [sched, setSched] = useState<Scheduling>(EMPTY_SCHED);
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  // Reseta o formulário ao trocar de modelo (navegação client-side sem remontar).
  useEffect(() => {
    setValues(seedDefaults(slug));
    setSched(EMPTY_SCHED);
    setTab(0);
  }, [slug]);

  const model = MUD_END_MODEL_BY_SLUG[slug];
  const def = model?.getDefaults();
  const operador = firstNameUpper(profile?.full_name);
  const backTo = `${hubBase}/mudanca-endereco`;

  if (!model || !def) {
    return (
      <div className="p-6">
        <p className="text-sm text-zinc-500">Modelo não encontrado: {slug}.</p>
        <Link href={backTo} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: AZUL }}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>
    );
  }

  // A inviabilidade não tem agendamento (gera só Protocolo).
  const temAgendamento = model.createsCard;
  const tipoField = def.fields.find((f) => f.id === 'tipoSolicitacao');
  const formaField = def.fields.find((f) => f.id === 'formaPag');
  const prazoField = def.fields.find((f) => f.id === 'prazoContratacao');

  const set = (id: string, v: string) => setValues((prev) => ({ ...prev, [id]: v }));
  const valuesForBuild = { ...values, ...schedulingTextValues(sched) };
  const sections = computeMudEndSections(slug, valuesForBuild, operador);
  const active = sections[Math.min(tab, Math.max(0, sections.length - 1))];

  const copyActive = () => {
    if (!active) return;
    navigator.clipboard.writeText(active.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho */}
      <div>
        <Link href={backTo} className="mb-1 flex w-fit items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700">
          <ArrowLeft className="h-4 w-4" /> Mudança de endereço
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{def.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* COLUNA ESQ — formulário */}
        <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {tipoField && (
            <TipoSolicitacaoSelect
              value={values.tipoSolicitacao ?? ''}
              options={(tipoField.options ?? []).map((o) => ({ value: o.value, label: o.label, icon: o.icon }))}
              onChange={(v) => set('tipoSolicitacao', v)}
            />
          )}

          <MudEndFieldsRenderer
            fields={def.fields}
            values={values}
            onChange={set}
            skipIds={['tipoSolicitacao', 'dataVisita', 'horaVisita', 'formaPag', 'protocolo', 'prazoContratacao']}
          />

          {temAgendamento && (
            <div className="flex flex-col gap-3">
              <div className="border-t border-zinc-200 pt-1 dark:border-zinc-800" />
              <h3 className="text-base font-bold tracking-[0.01em]" style={{ color: AZUL }}>AGENDAMENTO</h3>
              <div className="grid grid-cols-12 gap-3">
                {prazoField && (
                  <div className="col-span-12 flex flex-col gap-1.5">
                    <label className={FieldLabelCls}>{prazoField.label}</label>
                    <RadioPairs
                      id="prazoContratacao"
                      options={(prazoField.options ?? []).map((o) => ({ value: o.value, label: o.label }))}
                      value={values.prazoContratacao ?? prazoField.defaultValue ?? ''}
                      onChange={(v) => set('prazoContratacao', v)}
                    />
                  </div>
                )}
                <div className="col-span-4 flex flex-col gap-1.5">
                  <label className={FieldLabelCls}>Data da visita</label>
                  <DateSingleKanbanPopover
                    value={sched.data_visita ?? ''}
                    onChange={(v) => setSched((s) => ({ ...s, data_visita: v ?? null }))}
                    placeholder="Selecionar data"
                    triggerClassName={SELECT_CLS}
                  />
                </div>
                <div className="col-span-8 flex flex-col gap-1.5">
                  <TimeMultiSelect
                    label="Horário (hora fixa OU período)"
                    labelClassName={FieldLabelCls}
                    times={timeSlotsForDate(sched.data_visita || '')}
                    value={sched.hora_visita ? [sched.hora_visita] : []}
                    date={sched.data_visita || undefined}
                    onChange={(arr) => setSched((s) => ({ ...s, hora_visita: arr.length ? arr[arr.length - 1] : null, periodo: arr.length ? null : s.periodo }))}
                    periodos={periodosForDate(sched.data_visita || '')}
                    periodoLabels={{ manha: 'Manhã', tarde: 'Tarde' }}
                    periodoValue={sched.periodo}
                    onPeriodoChange={(p) => setSched((s) => ({ ...s, periodo: (p as 'manha' | 'tarde' | null), hora_visita: p ? null : s.hora_visita }))}
                    triggerClassName={SELECT_CLS}
                  />
                </div>
                {formaField && (
                  <div className="col-span-4 flex flex-col gap-1.5">
                    <label className={FieldLabelCls}>{formaField.label}</label>
                    <SimpleSelect
                      value={values.formaPag ?? ''}
                      onChange={(v) => set('formaPag', v)}
                      options={(formaField.options ?? []).map((o) => ({ value: o.value, label: o.label }))}
                      placeholder="Selecionar"
                      triggerClassName={SELECT_CLS}
                    />
                  </div>
                )}
                <div className="col-span-4 flex flex-col gap-1.5">
                  <label className={FieldLabelCls}>Nº Protocolo</label>
                  <Input value={values.protocolo ?? ''} onChange={(e) => set('protocolo', e.target.value)} placeholder="123.456" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIR — resultado ao vivo */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Resultado</h2>
              <button type="button" onClick={copyActive} className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800">
                {copied ? <Check className="h-3.5 w-3.5" style={{ color: AZUL }} /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            {/* Abas — Protocolo | O.S | Agenda (a Agenda é só texto pra colar). */}
            <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
              {sections.map((s, i) => {
                const isActive = tab === i;
                const activeBg = i === 1 ? '#1a2027' : AZUL;
                const label = i === 0 ? 'Texto Protocolo' : i === 1 ? 'Texto O.S' : i === 2 ? 'Texto Agenda' : s.label;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTab(i)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${isActive ? 'text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    style={isActive ? { backgroundColor: activeBg, color: 'white' } : undefined}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <textarea
              readOnly
              value={active?.body ?? ''}
              className="h-[60vh] w-full resize-none rounded-lg bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700 outline-none dark:bg-zinc-950 dark:text-zinc-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
