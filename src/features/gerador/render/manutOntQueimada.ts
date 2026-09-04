/**
 * Emulação do modelo `manut-ont-queimada` — porte 1:1 da função `XGe` do bundle
 * legado (conteúdo de O.S do próprio app). Manutenção de ONT queimada/sem sinal
 * (DYINGGASP), com visita técnica agendada. Ramifica em titular/PJ/terceiro nas
 * 5 variantes de `tipoSolicitacao`. O 2º argumento do builder legado é o primeiro
 * nome do operador — aqui lido de `valores.operadorPrimeiroNome`. Validado por
 * diff contra o legado — ver `manutOntQueimada.diff.test.ts`.
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_ONT_QUEIMADA } from '../catalogo/manutOntQueimada';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-ont-queimada';

// `frase` e não `f`: `f` já é o contato do solicitante (nome do bundle).
const frase = fraseDe(SLUG, MANUT_ONT_QUEIMADA);

/** Espaço final que o legado deixava na pergunta sobre intervenção. */
const ESP = ' ';

/** Separador de blocos deste modelo (legado: `wj` = "=".repeat(41)). */
const SEP = '='.repeat(41);

/** Tipos em que o solicitante é terceiro (legado: `YGe`). */
const TIPOS_TERCEIRO_SOLICITA = [
  'terceiro-solicita-terceiro-acompanha',
  'terceiro-solicita-titular-acompanha',
];

export function renderManutOntQueimada(valores: Valores): SaidaOS {
  // Normaliza só as chaves presentes (chaves ausentes ficam `undefined`, o que o
  // legado renderiza literalmente como "undefined" — ex.: `alarme`).
  const nRaw: Record<string, string | undefined> = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Record<string, string | undefined> = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  const t = n.operadorPrimeiroNome; // 2º arg do builder legado
  const r = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const i = maiusc(n.cliente);
  const a = primeiroNome(i);
  const o = maiusc(n.solicitante);
  const s = primeiroNome(o);
  const c = maiusc(n.parente);
  const l = maiusc(n.cargo);
  const u = n.canal;
  const d = soDigitos(n.contato);
  const f = soDigitos(n.contatoSol);
  const p = maiusc(n.bairro);
  const m = maiusc(n.alarme);
  const h = n.onu;
  const g = n.protocolo;
  const formaPag = n.formaPag;
  const dataVisita = n.dataVisita;
  const horaVisita = n.horaVisita;
  const b = n.pagamento === 'MENSALIDADE';
  const x = TIPOS_TERCEIRO_SOLICITA.includes(r);

  let S = a;
  let C = a;
  let w = d;
  if (r === 'pessoa-juridica') {
    S = `${s} (${l})`;
    C = s;
  } else if (x) {
    S = `${s} (${c} DE ${a})`;
    C = s;
    w = f;
  }

  const base = {
    cliente: a, clienteCompleto: i, solicitanteExibido: S, pessoa: C,
    solicitanteCompleto: o, parente: c, canal: u ?? '', contato: d,
    contatoUsado: w ?? '', alarme: m, ont: h ?? '', formaPag: formaPag ?? '',
    dataVisita: dataVisita ?? '', horaVisita: horaVisita ?? '',
    protocolo: g ?? '', bairro: p, tecnico: t ?? '',
    custoAgenda: b ? 'MENSALIDADE' : (formaPag ?? ''),
  };

  const T = b ? frase('aceiteMensalidade') : frase('aceiteNoAto', base);
  const E = frase('agendamento', base);
  const D = frase('contatoTitular', base);

  let O: string[];
  if (r === 'titular-solicita-terceiro-acompanha') {
    O = [
      `${a} ${T}, ${frase('titularAusenteProtocolo', base)} ${E}.`,
    ];
  } else if (r === 'terceiro-solicita-terceiro-acompanha') {
    O = [
      `${s} ${T}.`,
      ``,
      `${D} ${frase('autorizouTerceiro', base)} ${E}.`,
    ];
  } else if (r === 'terceiro-solicita-titular-acompanha') {
    O = [
      `${s} ${T}.`,
      ``,
      `${D} ${frase('titularAcompanha')} ${E}.`,
    ];
  } else {
    O = [`${C} ${T}, ${frase('acompanhaTecnico')} ${E}.`];
  }

  let k: string;
  if (r === 'titular-solicita-terceiro-acompanha') {
    k = `${a} ${T}, ${frase('titularAusenteOs', base)} ${E}.`;
  } else if (r === 'terceiro-solicita-terceiro-acompanha') {
    k = `${s} ${T}. ${D} ${frase('autorizouTerceiro', base)} ${E}.`;
  } else if (r === 'terceiro-solicita-titular-acompanha') {
    k = `${s} ${T}. ${D} ${frase('titularAcompanha')} ${E}.`;
  } else {
    k = `${C} ${T}. ${E}.`;
  }

  const protocolo = [
    frase('abertura', base),
    ``,
    SEP,
    ``,
    frase('statusOnt'),
    ``,
    SEP,
    ``,
    frase('relatoEquipamento', base),
    ``,
    frase('verificacaoEOrientacao', base),
    ``,
    frase('perguntaIntervencao', base) + ESP,
    ``,
    SEP,
    ``,
    frase('termosVisita'),
    ``,
    SEP,
    ``,
    ...O,
    ``,
    frase('semDuvidas'),
  ].join('\n');

  const os = `${frase('corpoOs', base)} ${k}

${SEP}

INDICACAO TECNICA:

${frase('indicacaoTecnica', base)}`;

  const agenda = frase('agenda', base);

  return { protocolo, os, agenda };
}
