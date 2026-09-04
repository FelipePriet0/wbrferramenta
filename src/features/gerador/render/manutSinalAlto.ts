/**
 * Emulação do modelo `manut-sinal-alto` — porte 1:1 da função construtora `FWe`
 * do bundle legado (conteúdo de O.S do próprio app). Ramifica nos 5 tipos de
 * solicitação (titular/terceiro/PJ × acompanhamento). Retorna Protocolo, O.S e
 * o texto de agendamento da visita técnica. Validado por diff contra o legado —
 * ver `manutSinalAlto.diff.test.ts`.
 *
 * ⚠️ ESTE ARQUIVO NÃO CONTÉM TEXTO. Todo o conteúdo mora em
 * `../catalogo/manutSinalAlto.ts` e é resolvido por `fraseDe`, que aplica o
 * override publicado pela líder do suporte quando existir. O que fica aqui é a
 * LÓGICA: qual ramo, em que ordem, com quais separadores e espaçadores.
 *
 * Essa separação existe por três motivos: permite editar o texto pela
 * plataforma sem deploy; deixa este arquivo idêntico entre MZnet e WBR (é o
 * texto que carrega o nome do provedor), então ele sincroniza sem risco; e
 * desfaz a repetição — cada frase do miolo existia 5 vezes, uma por ramo.
 *
 * DIAGRAMAÇÃO FICA AQUI. O catálogo não guarda espaço no começo nem no fim das
 * frases. O legado tinha vários, e de forma inconsistente — ver `ESP` e as duas
 * assimetrias marcadas nos ramos. Espaço final é invisível para quem edita e
 * seria apagado sem querer; recolocá-lo aqui mantém a saída idêntica.
 *
 * O 2º argumento do builder legado (`t`) era o `operadorPrimeiroNome`; aqui ele
 * é lido de `valores.operadorPrimeiroNome`.
 *
 * Mapeamento das variáveis do bundle (mantido para rastrear a transcrição):
 * i=cliente(maiúsc), a=1º nome cliente, o=solicitante(maiúsc), s=1º nome
 * solicitante, c=parente, l=cargo, u=canal, d=contato(dígitos),
 * fSol=contatoSol(dígitos), p=onu(maiúsc), m=1º "nome" da onu, h=sinal atual,
 * g=sinal anterior, _=oscilação, v=bairro, y=formaPag, b=dataVisita,
 * x=horaVisita, S=protocolo(maiúsc), C=ctoType, w=bloco CTO, t=operador.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_SINAL_ALTO } from '../catalogo/manutSinalAlto';

/** Slug do modelo no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-sinal-alto';

const f = fraseDe(SLUG, MANUT_SINAL_ALTO);

/** Separador do Protocolo — 19 asteriscos. (legado: xA) */
const SEP = '*'.repeat(19);
/** Separador da O.S antes da indicação técnica — 39 iguais. (legado: kWe) */
const SEP_EQ = '='.repeat(39);
/**
 * Espaço final que o legado deixava no fim de várias frases do Protocolo.
 * É diagramação, não conteúdo — por isso vive aqui e não no catálogo.
 */
const ESP = ' ';

/** N espaços. (legado: OA) */
function espacos(n: number): string {
  return ' '.repeat(n);
}

/** Bloco CTO da O.S. (legado: NWe) */
function blocoCto(ctoType: string, cto: string, passante: string): string {
  if (ctoType === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`;
  if (ctoType === 'CTOI') return `\nCTOI // ${passante}.\n`;
  return '';
}

/** Rodapé da O.S: separador + indicação técnica. (legado: PWe) */
function rodapeOS(): string {
  return `${SEP_EQ}\n\nINDICACAO TECNICA:\n\n${f('indicacaoTecnica')}`;
}

export function renderManutSinalAlto(valores: Valores): SaidaOS {
  const n: Valores = {};
  for (const [k, val] of Object.entries(valores)) n[k] = String(val ?? '');

  const r = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const i = maiusc(n.cliente);
  const a = primeiroNome(i);
  const o = maiusc(n.solicitante);
  const s = primeiroNome(o);
  const c = maiusc(n.parente);
  const l = maiusc(n.cargo);
  const u = n.canal ?? '';
  const d = soDigitos(n.contato);
  const fSol = soDigitos(n.contatoSol);
  const p = maiusc(n.onu);
  const m = primeiroNome(p);
  const h = maiusc(n.sinalONU);
  const g = maiusc(n.sinalONUan);
  const _ = maiusc(n.oscila);
  const v = maiusc(n.bairro);
  const y = n.formaPag ?? '';
  const b = n.dataVisita ?? '';
  const x = n.horaVisita ?? '';
  const S = maiusc(n.protocolo);
  const C = n.ctoType || 'CTOE';
  const w = blocoCto(C, maiusc(n.cto), maiusc(n.passante));
  const t = n.operadorPrimeiroNome ?? '';

  const OA = espacos;

  /** Campos comuns a quase toda frase; cada chamada acrescenta o que é seu. */
  const base = {
    cliente: a,
    clienteCompleto: i,
    solicitante: s,
    solicitanteCompleto: o,
    parente: c,
    cargo: l,
    canal: u,
    contato: d,
    contatoSolicitante: fSol,
    onu: m,
    equipamentos: p,
    sinalAtual: h,
    sinalAnterior: g,
    oscilacao: _,
    formaPag: y,
    formaPagFrase: fraseFormaPag(y),
    dataVisita: b,
    horaVisita: x,
    protocolo: S,
    bairro: v,
    tecnico: t,
  };

  let T = f('agenda', base);
  if (C === 'CTOI') T += ` *CTOI*`;

  /**
   * Espaçamento do miolo. Três dos cinco ramos usam exatamente este ritmo; os
   * outros dois trocam um item cada — ver `RITMO` nas chamadas. Não é escolha
   * de design, é o legado transcrito: são inconsistências do bundle original
   * que a fixture cobra byte a byte.
   */
  const RITMO = {
    /** Linha entre o status remoto e o separador seguinte. */
    spacerStatus: OA(4),
    /** Espaço no fim da pergunta sobre intervenção. */
    fimPergunta: ESP,
    /** Linha entre a pergunta e o separador seguinte. */
    spacerPergunta: OA(4),
  };

  /**
   * Miolo comum do Protocolo: da linha em branco após a abertura até o
   * separador que antecede o aceite. Idêntico nos 5 ramos, exceto por quem
   * conduz o diálogo (`pessoa`) e pelo ritmo acima.
   */
  const miolo = (pessoa: string, ritmo: typeof RITMO) => [
    ``,
    SEP,
    OA(4),
    f('statusRemoto', base),
    ritmo.spacerStatus,
    SEP,
    OA(4),
    f('relato', { ...base, pessoa }) + ESP,
    OA(4),
    f('verificacao', base) + ESP,
    OA(4),
    SEP,
    OA(4),
    f('orientacaoReinicio', { ...base, pessoa }) + ESP,
    OA(4),
    f('perguntaIntervencao', { ...base, pessoa }) + ritmo.fimPergunta,
    ritmo.spacerPergunta,
    SEP,
    OA(4),
    f('termosVisita'),
    OA(4),
    SEP,
    OA(4),
  ];

  let E = '';
  let D = '';

  if (r === 'pessoa-juridica') {
    E = [
      f('aberturaPj', base),
      ...miolo(s, RITMO),
      f('aceitePresencial', { ...base, pessoa: s }),
      ``,
      f('encerramento'),
    ].join('\n');
    D = f('osPj', base);
  } else if (r === 'terceiro-solicita-terceiro-acompanha') {
    // Assimetria do legado: só neste ramo a pergunta sobre intervenção não tem
    // espaço final, e o espaçador que a segue é linha vazia em vez de OA(4).
    E = [
      f('aberturaTerceiro', base),
      ...miolo(s, { ...RITMO, fimPergunta: '', spacerPergunta: '' }),
      f('aceiteTitularAutorizaTerceiro', base),
      ``,
      f('encerramento'),
    ].join('\n');
    D = f('osTerceiroAutorizado', base);
  } else if (r === 'terceiro-solicita-titular-acompanha') {
    // Assimetria do legado: aqui o espaçador depois do status remoto é linha
    // vazia em vez de OA(4).
    E = [
      f('aberturaTerceiro', base),
      ...miolo(s, { ...RITMO, spacerStatus: '' }),
      f('aceiteTitularAcompanha', base),
      ``,
      f('encerramento'),
    ].join('\n');
    D = f('osTerceiroTitularAcompanha', base);
  } else if (r === 'titular-solicita-terceiro-acompanha') {
    E = [
      f('aberturaTitular', base),
      ...miolo(a, RITMO),
      f('aceiteTitularAusente', base),
      ``,
      f('encerramento'),
    ].join('\n');
    D = f('osTitularAusente', base);
  } else {
    E = [
      f('aberturaTitular', base),
      ...miolo(a, RITMO),
      f('aceitePresencial', { ...base, pessoa: a }),
      ``,
      f('encerramento'),
    ].join('\n');
    D = f('osTitular', base);
  }

  const O = D + w + rodapeOS();
  return { protocolo: E, os: O, agenda: T };
}
