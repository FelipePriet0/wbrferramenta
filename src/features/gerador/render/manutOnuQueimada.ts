/**
 * Emulação do modelo `manut-onu-queimada` — porte 1:1 da função `uKe` do bundle
 * legado (conteúdo de O.S do próprio app). Ramifica nos 5 tipos de solicitação
 * (titular/terceiro/PJ × acompanhamento) e agenda VISITA TÉCNICA, por isso
 * retorna também `agenda`. Validado por diff contra o legado — ver
 * `manutOnuQueimada.diff.test.ts`.
 */
import { linhas, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_ONU_QUEIMADA } from '../catalogo/manutOnuQueimada';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-onu-queimada';

// `frase` e não `f`: `f` já é o contato do solicitante (nome do bundle).
const frase = fraseDe(SLUG, MANUT_ONU_QUEIMADA);

/** Espaço final que o legado deixava na pergunta sobre intervenção. */
const ESP = ' ';

/** Separador de blocos (legado: Mj) — 41 sinais de igual. */
const SEP_ONU = '='.repeat(41);

/** Tipos em que terceiro solicita (S vira "SOL (PARENTE DE TITULAR)"). (legado: lKe) */
const TIPOS_TERCEIRO_SOLICITA = [
  'terceiro-solicita-terceiro-acompanha',
  'terceiro-solicita-titular-acompanha',
];

export function renderManutOnuQueimada(valores: Valores): SaidaOS {
  const n: Record<string, string | undefined> = {};
  for (const [k, val] of Object.entries(valores)) n[k] = String(val ?? '');

  const t = valores.operadorPrimeiroNome ?? '';

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
  const _ = n.formaPag;
  const v = n.dataVisita;
  const y = n.horaVisita;
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
    contatoUsado: w ?? '', alarme: m, onu: h ?? '', formaPag: _ ?? '',
    dataVisita: v ?? '', horaVisita: y ?? '', protocolo: g ?? '', bairro: p,
    tecnico: t, custoAgenda: b ? 'MENSALIDADE' : (_ ?? ''),
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
      '',
      `${D} ${frase('autorizouTerceiro', base)} ${E}.`,
    ];
  } else if (r === 'terceiro-solicita-titular-acompanha') {
    O = [
      `${s} ${T}.`,
      '',
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

  const protocolo = linhas(
    frase('abertura', base),
    '',
    SEP_ONU,
    '',
    frase('statusOnu'),
    '',
    SEP_ONU,
    '',
    frase('relatoEquipamento'),
    '',
    frase('verificacaoRemota', base),
    '',
    frase('orientacaoInverter', base),
    '',
    frase('perguntaIntervencao', base) + ESP,
    '',
    SEP_ONU,
    '',
    frase('termosVisita'),
    '',
    SEP_ONU,
    '',
    ...O,
    '',
    frase('semDuvidas'),
  );

  const para1 = `${frase('corpoOs', base)} ${k}`;
  const paraTecnico = frase('indicacaoTecnica', base);

  const os = `${para1}\n\n${SEP_ONU}\n\nINDICACAO TECNICA:\n\n${paraTecnico}`;

  const agenda = frase('agenda', base);

  return { protocolo, os, agenda };
}
