/**
 * Emulação do modelo `manut-visita-testes` — porte 1:1 da função `vGe` do bundle
 * legado (conteúdo de O.S do próprio app). Ramifica nos 6 tipos de solicitação
 * (PF/PJ × padrão/isento/dispensou-remoto). Retorna a O.S (`os`) e o texto de
 * agendamento (`agenda`). Validado por diff contra o legado — ver
 * `manutVisitaTestes.diff.test.ts`.
 *
 * NB: o legado só normaliza as chaves presentes no input (`n[k]=String(r??'')`);
 * campos ausentes (`oscila`, `repetidor`, `disp1..3`, `gestor`) permanecem
 * `undefined` e aparecem literalmente como "undefined" no texto. O porte preserva
 * esse comportamento (sem fallback nesses campos).
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_VISITA_TESTES } from '../catalogo/manutVisitaTestes';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-visita-testes';

// `frase` e não `f`: este arquivo já usa `f` para o repetidor (nome herdado do
// bundle minificado).
const frase = fraseDe(SLUG, MANUT_VISITA_TESTES);

/** Separador antes da INDICACAO TECNICA na O.S — 42 asteriscos. (legado: sGe) */
const SEP_OS = '*'.repeat(42);

/** Envelope da O.S com separador + indicação técnica. (legado: rj) */
function envelopeOS(corpo: string, indicacao: string): string {
  return `${corpo}\n\n${SEP_OS}\n\nINDICACAO TECNICA:\n\n${indicacao}`;
}

export function renderManutVisitaTestes(valores: Valores): SaidaOS {
  const nRaw: Valores = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Valores = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  // 2º arg do builder legado = operadorPrimeiroNome (usado no lugar de `t`).
  const t = valores.operadorPrimeiroNome ?? '';

  const r = n.tipoSolicitacao || 'pf';
  const i = maiusc(n.cliente);
  const a = primeiroNome(i);
  const o = primeiroNome(maiusc(n.solicitante));
  const s = maiusc(n.cargo);
  const c = n.canal;
  const l = soDigitos(n.contato);
  const u = maiusc(n.sinalONU);
  const d = maiusc(n.oscila);
  const f = maiusc(n.repetidor);
  const p = n.disp1;
  const m = n.disp2;
  const h = n.disp3;
  const g = maiusc(n.bairro);
  const gestor = n.gestor;
  const v = n.dataVisita;
  const y = n.horaVisita;
  const b = n.protocolo;
  const x = n.formaPag;

  const S = r === 'isento-pf' || r === 'isento-pj';
  const C = frase('agenda', {
    clienteCompleto: i,
    protocolo: b,
    custoAgenda: S ? 'ISENTO' : x,
    tecnico: t,
    bairro: g,
  });
  const w = r === 'pessoa-juridica' || r === 'isento-pj' || r === 'disp-pj';
  const T = w ? o : a;
  const E = w ? `${o} (${s})` : a;
  const D = w ? 'EMPRESA' : 'RESIDENCIA';

  const base = {
    solicitanteExibido: E,
    pessoa: T,
    local: D,
    canal: c,
    contato: l,
    sinalONU: u,
    oscila: d,
    repetidor: f,
    disp1: p,
    disp2: m,
    disp3: h,
    gestor,
    dataVisita: v,
    horaVisita: y,
    formaPag: x,
  };

  let O = '';
  if (r === 'disp-pf' || r === 'disp-pj') {
    O = envelopeOS(
      frase('osDispensouRemoto', base),
      frase('indicacaoDispensouRemoto', base),
    );
  } else if (S) {
    O = envelopeOS(
      frase('osIsento', base),
      frase('indicacaoIsento', base),
    );
  } else {
    O = envelopeOS(
      frase('osPadrao', base),
      frase('indicacaoPadrao', base),
    );
  }

  return { protocolo: '', os: O, agenda: C };
}
