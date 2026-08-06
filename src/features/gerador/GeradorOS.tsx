'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Check, ChevronDown, Copy, UserRound, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SimpleSelect } from '@/components/ui/select';
import { formatMacAddress } from '@/lib/masks';
import { useAuth } from '@/components/providers/AuthProvider';
import { DataHoraPicker } from './DataHoraPicker';
import { getModelo } from './modelos/registry';
import type { CampoConfig, ModeloForm } from './modelos/altplanRemotoForm';
import type { SaidaOS } from './render/altplanRemoto';
import { maiusc } from './render/helpers';
import type { Valores } from './render/helpers';

const FONTE = "'Google Sans Flex', Ubuntu, 'Segoe UI', system-ui, sans-serif";
const TEXTO = '#1a2027';
const AZUL = '#0B42C6'; // headers de seção / eyebrow
const AZUL_VIVO = '#0B42C6'; // pill + abas (interativo)

const INICIAL: Valores = {
  tipoSolicitacao: 'titular',
  origem: 'padrao',
  semSinal: 'nao',
};

/**
 * Estado inicial do formulário: TODO campo do modelo começa como '' (como os
 * inputs controlados do legado). Sem isso, um render que faz `valores.x.replace`
 * num campo ainda não preenchido estoura e a página não abre. A variável começa
 * na 1ª opção. Os defaults gerais (INICIAL) prevalecem para compatibilidade.
 */
function initialValores(form: ModeloForm, tecnico = ''): Valores {
  const v: Valores = {};
  const campos = form.secoes.flatMap((s) => s.campos);
  for (const c of campos) v[c.id] = '';
  // `operadorPrimeiroNome` alimenta o "(TÉCNICO)" da agenda em todos os modelos;
  // pré-preenchido com quem está logado (editável no campo Técnico).
  const base: Valores = { ...v, ...INICIAL, operadorPrimeiroNome: tecnico };
  // A 1ª opção do campo-variável (modo/tipo de solicitação) é o default REAL do
  // modelo e deve vencer o INICIAL genérico — senão modos como 'com-visita'/
  // 'visita' nascem com 'titular' e escondem os campos condicionais (data/hora).
  if (form.variavelId) {
    const varCampo = campos.find((c) => c.id === form.variavelId);
    if (varCampo?.opcoes?.length) base[form.variavelId] = varCampo.opcoes[0].value;
  }
  return base;
}

/** Primeiro nome (primeira palavra) — para o campo Técnico. */
function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/).filter(Boolean)[0] ?? '';
}

const inputBase =
  'w-full rounded-xl border border-zinc-300/90 bg-white px-3.5 py-2.5 text-[15px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#0B42C6] focus:ring-2 focus:ring-[#0B42C6]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

/** Gatilho do SimpleSelect alinhado ao visual dos inputs do gerador (rounded-xl,
 *  mesma altura/borda/foco), mantendo o popover padrão do sistema. */
const SELECT_TRIGGER =
  'h-11 rounded-xl border-zinc-300/90 px-3.5 text-[15px] shadow-none focus-visible:border-[#0B42C6] focus-visible:ring-2 focus-visible:ring-[#0B42C6]/20';

/** Ícone por variável (titular / terceiro / PJ). */
function iconeVariavel(value: string): LucideIcon {
  if (value === 'terceiro') return Users;
  if (value === 'pj') return Building2;
  return UserRound;
}

/**
 * Seletor de variável — pill verde full-width com popover customizado
 * (card branco, opções com ícone + check no selecionado, fecha ao clicar fora).
 */
function VariavelPill({
  campo,
  valor,
  onChange,
}: {
  campo: CampoConfig;
  valor: string;
  onChange: (v: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [aberto]);

  const opcoes = campo.opcoes ?? [];
  const atual = opcoes.find((o) => o.value === valor) ?? opcoes[0];
  const IconeAtual = iconeVariavel(atual?.value ?? '');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className="flex w-full items-center gap-3 rounded-2xl py-3.5 pl-4 pr-4 text-left text-sm font-semibold uppercase text-white outline-none transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-white/50"
        style={{ backgroundColor: AZUL_VIVO, letterSpacing: '0.03em' }}
      >
        <IconeAtual className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
        <span className="flex-1 truncate">{atual?.label}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`}
        />
      </button>

      {aberto && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-black/10 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {opcoes.map((op) => {
            const Icone = iconeVariavel(op.value);
            const selecionado = op.value === valor;
            return (
              <button
                key={op.value}
                type="button"
                role="option"
                aria-selected={selecionado}
                onClick={() => {
                  onChange(op.value);
                  setAberto(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-blue-50 dark:hover:bg-[#0B42C6]/10"
              >
                <span
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: selecionado ? 'rgba(11,66,198,0.14)' : 'rgba(33,33,33,0.05)',
                    color: selecionado ? AZUL_VIVO : '#71717a',
                  }}
                >
                  <Icone className="h-4 w-4" strokeWidth={2} />
                </span>
                <span
                  className="flex-1 text-sm"
                  style={{ color: TEXTO, fontWeight: selecionado ? 600 : 400 }}
                >
                  {op.label}
                </span>
                {selecionado && (
                  <Check className="h-4 w-4 flex-shrink-0" style={{ color: AZUL_VIVO }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Campo({
  campo,
  valor,
  onChange,
}: {
  campo: CampoConfig;
  valor: string;
  onChange: (v: string) => void;
}) {
  if (campo.controle === 'radio') {
    return (
      <div className="flex flex-wrap gap-2">
        {campo.opcoes?.map((op) => {
          const ativo = valor === op.value;
          return (
            <button
              key={op.value}
              type="button"
              onClick={() => onChange(op.value)}
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-colors"
              style={{
                borderColor: ativo ? AZUL_VIVO : 'rgba(33,33,33,0.15)',
                backgroundColor: ativo ? 'rgba(11,66,198,0.08)' : 'transparent',
                color: ativo ? AZUL : TEXTO,
                fontWeight: ativo ? 600 : 400,
              }}
            >
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full border"
                style={{ borderColor: ativo ? AZUL_VIVO : 'rgba(33,33,33,0.3)' }}
              >
                {ativo && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: AZUL_VIVO }} />}
              </span>
              {op.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (campo.controle === 'select') {
    // Dropdown padrão do sistema (Radix, mesmo do Mud End) — não o <select> nativo.
    return (
      <SimpleSelect
        value={valor}
        onChange={onChange}
        options={campo.opcoes ?? []}
        placeholder="Selecione…"
        triggerClassName={SELECT_TRIGGER}
      />
    );
  }

  if (campo.controle === 'datetime' || campo.controle === 'date') {
    // 'datetime' = calendário (data esq) + hora (dir); 'date' = só calendário.
    return (
      <DataHoraPicker
        value={valor}
        onChange={onChange}
        placeholder={campo.placeholder}
        soData={campo.controle === 'date'}
      />
    );
  }

  const inputMode =
    campo.controle === 'phone' || campo.controle === 'cpfcnpj' || campo.controle === 'sinal'
      ? 'numeric'
      : 'text';
  return (
    <input
      className={inputBase}
      type="text"
      inputMode={inputMode}
      placeholder={campo.placeholder}
      value={valor}
      onChange={(e) =>
        onChange(campo.controle === 'mac' ? formatMacAddress(e.target.value) : e.target.value)
      }
    />
  );
}

function OutputPane({ titulo, texto }: { titulo: string; texto: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* clipboard indisponível */
    }
  };
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">{titulo}</span>
        <button
          type="button"
          onClick={copiar}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: AZUL_VIVO }}
        >
          {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre
        className="max-h-[58vh] overflow-auto whitespace-pre-wrap px-4 py-3.5 text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
      >
        {texto || '—'}
      </pre>
    </div>
  );
}

const ABAS_META: { key: keyof SaidaOS; label: string; titulo: string }[] = [
  { key: 'protocolo', label: 'Protocolo', titulo: 'Abertura do atendimento' },
  { key: 'termo', label: 'Termo do cliente', titulo: 'Termo para o cliente ler e assinar' },
  { key: 'os', label: 'O.S.', titulo: 'Encerramento da O.S' },
  { key: 'agenda', label: 'Agenda', titulo: 'Agendamento' },
  { key: 'saida', label: 'Saída', titulo: 'Texto gerado' },
];

/** Coluna de saída com abas dinâmicas — só mostra as saídas que o modelo produz. */
function SaidaColuna({
  form,
  saida,
  aba,
  setAba,
}: {
  form: ModeloForm;
  saida: SaidaOS;
  aba: string;
  setAba: (k: string) => void;
}) {
  const abas = ABAS_META.filter((a) => {
    const v = saida[a.key];
    return typeof v === 'string' && v.trim() !== '';
  });
  const atual = abas.find((a) => a.key === aba) ?? abas[0];
  return (
    <div className="rounded-[28px] border bg-white p-6 dark:bg-zinc-900/60" style={{ borderColor: 'rgba(33,33,33,0.12)' }}>
      <p className="mb-3 text-sm font-semibold text-zinc-500">
        {form.titulo} — {form.modo.toLowerCase()}
      </p>
      {abas.length > 1 && (
        <div className="mb-4 inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {abas.map((a) => {
            const ativo = atual?.key === a.key;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => setAba(a.key)}
                className="rounded-lg px-5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors"
                style={{
                  backgroundColor: ativo ? '#fff' : 'transparent',
                  color: ativo ? AZUL_VIVO : '#71717a',
                  boxShadow: ativo ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      )}
      {atual && <OutputPane titulo={atual.titulo} texto={String(saida[atual.key] ?? '')} />}
    </div>
  );
}

export function GeradorOS({
  slug,
  categoriaSlug,
  hubBase = '/suporte',
}: {
  slug: string;
  categoriaSlug: string;
  hubBase?: string;
}) {
  const modelo = getModelo(slug);
  const { profile } = useAuth();
  const tecnico = primeiroNome(profile?.full_name ?? '');
  const [valores, setValores] = useState<Valores>(() =>
    modelo ? initialValores(modelo.form, tecnico) : INICIAL,
  );
  const [aba, setAba] = useState<string>('protocolo');

  // Reseta o formulário ao trocar de modelo (navegação client-side sem remontar).
  useEffect(() => {
    if (modelo) setValores(initialValores(modelo.form, tecnico));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // O profile carrega async (AuthProvider); quando o nome chega, preenche o
  // campo Técnico se ainda estiver vazio (sem sobrescrever edição do operador).
  useEffect(() => {
    if (tecnico) {
      setValores((prev) => (prev.operadorPrimeiroNome ? prev : { ...prev, operadorPrimeiroNome: tecnico }));
    }
  }, [tecnico]);

  // O "(TÉCNICO)" da agenda sai em CAIXA-ALTA como o resto da linha; o campo de
  // entrada continua exibindo o nome como o operador digitou.
  const saida = useMemo(
    () =>
      modelo
        ? modelo.render({ ...valores, operadorPrimeiroNome: maiusc(valores.operadorPrimeiroNome) })
        : null,
    [modelo, valores],
  );

  if (!modelo) {
    return (
      <div className="mx-auto w-full max-w-6xl" style={{ fontFamily: FONTE, color: TEXTO }}>
        <Link href={`${hubBase}/${categoriaSlug}`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="mt-10 rounded-3xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <h1 className="text-xl font-bold" style={{ color: TEXTO }}>Modelo em construção</h1>
          <p className="mt-2 text-sm text-zinc-500">Este fluxo ainda não foi portado.</p>
        </div>
      </div>
    );
  }

  const set = (id: string, v: string) => setValores((prev) => ({ ...prev, [id]: v }));
  const { form } = modelo;

  return (
    <div className="mx-auto w-full max-w-7xl" style={{ fontFamily: FONTE, color: TEXTO }}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase" style={{ letterSpacing: '0.96px', color: AZUL }}>
            {form.modo}
          </p>
          <h1 className="mt-1 font-bold" style={{ fontSize: '28px', letterSpacing: '-0.5px', color: TEXTO }}>
            {form.titulo}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{form.descricao}</p>
        </div>
        <Link
          href={`${hubBase}/${categoriaSlug}`}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> {form.titulo}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Coluna 1 — formulário */}
        <div className="rounded-[28px] border bg-white p-6 dark:bg-zinc-900/60" style={{ borderColor: 'rgba(33,33,33,0.12)' }}>
          <h2 className="mb-4 text-[15px] font-bold" style={{ color: TEXTO }}>
            Preencha atentamente o formulário abaixo
          </h2>
          <div className="flex flex-col gap-5">
            {/* O técnico que gerou a O.S vai para o "(TÉCNICO)" da agenda; o valor é
                semeado do usuário logado (operadorPrimeiroNome) sem campo na UI. */}
            {form.secoes.map((secao, si) => {
              const visiveis = secao.campos.filter((c) => !c.mostrarQuando || c.mostrarQuando(valores));
              if (!visiveis.length) return null;
              return (
                <div key={si}>
                  {secao.titulo && (
                    <div className="mb-4 mt-1 flex items-center gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: AZUL }}>
                        {secao.titulo}
                      </h3>
                      <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                  )}
                  <div className="grid grid-cols-12 gap-3">
                    {visiveis.map((campo) => {
                      const isVar = campo.id === form.variavelId;
                      return (
                        <div
                          key={campo.id}
                          style={{ gridColumn: `span ${campo.span ?? 12} / span ${campo.span ?? 12}` }}
                          className="min-w-0"
                        >
                          {!isVar && (
                            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              {campo.label}
                            </label>
                          )}
                          {isVar ? (
                            <VariavelPill campo={campo} valor={valores[campo.id] ?? ''} onChange={(v) => set(campo.id, v)} />
                          ) : (
                            <Campo campo={campo} valor={valores[campo.id] ?? ''} onChange={(v) => set(campo.id, v)} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna 2 — saída emulada (abas dinâmicas: só as que o modelo produz) */}
        <SaidaColuna form={form} saida={saida!} aba={aba} setAba={setAba} />
      </div>
    </div>
  );
}
