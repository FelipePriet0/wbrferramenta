/**
 * Emulação do modelo `manut-roteador-queimado` — porte 1:1 da função `BGe` do
 * bundle legado. Modo cobrada/isento × 5 tipos de solicitação. 2º arg do builder
 * = operadorPrimeiroNome. Validado por diff — ver `.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_ROTEADOR_QUEIMADO } from '../catalogo/manutRoteadorQueimado';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-roteador-queimado';

// `frase` e não `f`: `f` já é o canal aqui (nome herdado do bundle).
const frase = fraseDe(SLUG, MANUT_ROTEADOR_QUEIMADO);

/** Espaço final que o legado deixava em duas linhas do Protocolo. */
const ESP = ' ';

const esp = (n: number) => ' '.repeat(n);
const SEP_AST = '*'.repeat(19); // hj
const SEP_EQ = '='.repeat(41); // mj
const SEP_AST_OS = '*'.repeat(42); // FGe

/** Mapa roteador (comodato) → valor de substituição (legado: LGe). */
const ROTEADOR_VALOR: Record<string, string> = {
  MULTILASER: 'R$150,00',
  'TP-LINK 840': 'R$150,00',
  'TP LINK C-20': 'R$230,00',
  'D-LINK DIR 842': 'R$360,00',
  'TP LINK C-5': 'R$360,00',
  'TP LINK G-5': 'R$360,00',
  GREATEK: 'R$360,00',
  INTELBRAS: 'R$360,00',
  'HUAWEI AX2': 'R$360,00',
  'ZTE H196-MESH': 'R$360,00',
  'ZTE H199-A': 'R$360,00',
};

const TERCEIRO_SOLICITA = ['terceiro-solicita-terceiro-acompanha', 'terceiro-solicita-titular-acompanha'];

export function renderManutRoteadorQueimado(valores: Valores): SaidaOS {
  const n: Valores = {};
  for (const [k, val] of Object.entries(valores)) n[k] = String(val ?? '');

  const modo = n.modoCusto || 'cobrada';
  const i = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const isento = modo === 'isento';
  const clienteUp = maiusc(n.cliente);
  const s = primeiroNome(clienteUp);
  const solUp = maiusc(n.solicitante);
  const l = primeiroNome(solUp);
  const u = maiusc(n.parente);
  const d = maiusc(n.cargo);
  const f = n.canal;
  const p = soDigitos(n.contato);
  const m = soDigitos(n.contatoSol);
  const h = maiusc(n.sinalONU);
  const g = maiusc(n.bairro);
  const rot = n.roteador;
  const v = ROTEADOR_VALOR[rot] ?? rot;
  const y = n.protocolo;
  const b = n.formaPag;
  const x = n.dataVisita;
  const S = n.horaVisita;
  const C = n.horaCobrada;
  const w = !isento && n.pagamento === 'MENSALIDADE';
  const T = TERCEIRO_SOLICITA.includes(i);
  const operador = n.operadorPrimeiroNome ?? '';

  const c = maiusc(n.solicitante);
  let E = s, D = s, O = p;
  if (i === 'pessoa-juridica') { E = `${l} (${d})`; D = l; }
  else if (T) { E = `${l} (${u} DE ${s})`; D = l; O = m; }

  const base = {
    cliente: s, clienteCompleto: clienteUp, solicitanteExibido: E, pessoa: D,
    solicitanteCompleto: c, parente: u, canal: String(f), contato: p,
    contatoUsado: O, sinalONU: h, roteador: String(rot), valorRoteador: String(v),
    // String() e não `?? ''`: este arquivo não usa o Proxy de chave ausente, então
    // o legado imprime literalmente "undefined" quando o campo não veio no input.
    // As fixtures cobram esse comportamento.
    formaPag: String(b), formaPagFrase: fraseFormaPag(b), dataVisita: String(x),
    horaVisita: String(S), horaCobrada: String(C), protocolo: String(y), bairro: g,
    tecnico: operador, custoAgenda: w ? 'MENSALIDADE' : String(b),
  };

  const k = isento
    ? frase('aceiteIsento', base)
    : w
    ? frase('aceiteMensalidade')
    : frase('aceiteNoAto', base);
  const A = isento ? frase('agendamentoIsentoProtocolo', base) : frase('agendamentoCobrada', base);
  const j = isento ? frase('agendamentoIsentoOs', base) : frase('agendamentoCobrada', base);
  const M = ', ';
  const N = frase('contatoTitular', base);
  /** Ciência + autorização do fluxo isento, prefixo comum aos 5 ramos. */
  const ciente = frase('cienteAutorizou', base);

  let P: string[];
  if (i === 'titular-solicita-terceiro-acompanha')
    P = [`${s} ${k}${M}${frase('titularAusenteProtocolo', base)} ${A}.`];
  else if (i === 'terceiro-solicita-terceiro-acompanha')
    P = [`${l} ${k}.`, '', `${N} ${frase('autorizouTerceiro', base)} ${A}.`];
  else if (i === 'terceiro-solicita-titular-acompanha')
    P = [`${l} ${k}.`, '', `${N} ${frase('titularAcompanha')} ${A}.`];
  else
    P = [`${D} ${k}${M}${frase('acompanhaTecnico')} ${A}.`];

  let F: string;
  if (isento) {
    F = i === 'titular-solicita-terceiro-acompanha'
      ? `${s} ${ciente}, ${frase('titularAusenteOs', base)} ${j}.`
      : i === 'terceiro-solicita-terceiro-acompanha'
      ? `${l} ${ciente}. ${N} ${frase('autorizouTerceiro', base)} ${j}.`
      : i === 'terceiro-solicita-titular-acompanha'
      ? `${l} ${ciente}. ${N} ${frase('titularAcompanha')} ${j}.`
      : i === 'pessoa-juridica'
      ? `${D} ${ciente}. ${j}.`
      : `CLIENTE ${ciente}. ${j}.`;
  } else {
    F = i === 'titular-solicita-terceiro-acompanha'
      ? `${s} ${k}, ${frase('titularAusenteOs', base)} ${j}.`
      : i === 'terceiro-solicita-terceiro-acompanha'
      ? `${l} ${k}. ${N} ${frase('autorizouTerceiro', base)} ${j}.`
      : i === 'terceiro-solicita-titular-acompanha'
      ? `${l} ${k}. ${N} ${frase('titularAcompanha')} ${j}.`
      : `${D} ${k}. ${j}.`;
  }

  const tecIsento = frase('indicacaoTecnicaIsento', base);
  const tecCobrada = frase('indicacaoTecnicaCobrada', base);

  let I: string, R: string;
  if (isento) {
    I = [
      frase('abertura', base),
      '', SEP_AST, esp(4),
      frase('statusOnu', base),
      esp(4), SEP_AST, esp(4),
      frase('relatoEquipamento'),
      esp(4),
      frase('verificacaoEOrientacaoIsento', base) + ESP,
      esp(4),
      frase('perguntaIntervencao', base) + ESP,
      esp(4), SEP_AST, esp(4),
      frase('isencaoRoteador', base),
      esp(4), SEP_AST, esp(4),
      ...P,
      '', frase('semDuvidas'),
    ].join('\n');
    R = `${frase('corpoOsIsento', base)} ${F}

${SEP_AST_OS}

INDICACAO TECNICA:

${tecIsento}`;
  } else {
    I = [
      frase('abertura', base),
      '', SEP_EQ, '',
      frase('statusOnu', base),
      '', SEP_EQ, '',
      frase('relatoEquipamentoComModelo', base),
      '',
      frase('verificacaoCobrada', base),
      '',
      frase('orientacaoInverter', base),
      '',
      frase('perguntaIntervencao', base) + ESP,
      '', SEP_EQ, '',
      frase('termosVisita'),
      '', SEP_EQ, '',
      ...P,
      '', frase('semDuvidas'),
    ].join('\n');
    R = `${frase('corpoOsCobrada', base)} ${F}

${SEP_EQ}

INDICACAO TECNICA:

${tecCobrada}`;
  }

  const z = frase('agenda', base);
  return { protocolo: I, os: R, agenda: z };
}
