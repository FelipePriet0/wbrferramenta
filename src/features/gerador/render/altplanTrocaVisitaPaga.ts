/**
 * Emulação do modelo `altplan-troca-visita-paga` — porte 1:1 da função `PHe` do
 * bundle legado (conteúdo de O.S do próprio app). Troca de plano COM visita
 * técnica paga (troca de roteador). Ramifica nos 4 tipos de solicitação e no
 * modo "ofertado". Retorna protocolo, os e agenda. Validado por diff contra o
 * legado — ver `altplanTrocaVisitaPaga.diff.test.ts`.
 */
import {
  descreveSinal,
  fraseFormaPag,
  maiusc,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { ALTPLAN_TROCA_VISITA_PAGA } from '../catalogo/altplanTrocaVisitaPaga';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'altplan-troca-visita-paga';

const f = fraseDe(SLUG, ALTPLAN_TROCA_VISITA_PAGA);

/** Espaço final que o legado deixava na linha de acesso aos apps. */
const ESP = ' ';

/** origem === 'ofertado' (legado: UD / sVe). */
function ehOfertado(v: Valores): boolean {
  return String(v.origem ?? 'padrao') === 'ofertado';
}

/** Transforma o Protocolo para o modo ofertado (legado: WD). */
function ofertadoProtocolo(texto: string): string {
  return texto
    .replace(
      /^(.+?) ENTROU EM CONTATO (?:VIA|POR) (.+?) SOLICITANDO ALTERAÇÃO DE PLANO\./m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO.',
    )
    .replace(/QUESTIONADO, CLIENTE DISSE QUE "[^\n]*"\.\n/, '')
    .replace(/PLANO SOLICITADO: ?/, 'PLANO OFERTADO: ');
}

/** Transforma a O.S para o modo ofertado (legado: GD). */
function ofertadoOS(texto: string): string {
  return texto
    .replace(
      /^(.+?) SOLICITOU POR (.+?) ALTERAÇÃO DO PLANO DE INTERNET:/m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO DE INTERNET:',
    )
    .replace(
      /^(.+?) ENTROU EM CONTATO VIA (.+?) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET:/m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO DE INTERNET:',
    )
    .replace(/PLANO ESCOLHIDO: ?/, 'PLANO OFERTADO: ');
}

/** Separador de bloco do modelo (legado). */
const SEP_BLOCO = '**************';
/** Separador longo antes da indicação técnica (legado: CHe). */
const SEP_LONGO = '***********************************';

/** Cláusula de renovação + necessidade de visita/troca de roteador (legado: MHe). */
const CLAUSULA_RENOVACAO = () => f('clausulaRenovacao');

/** Indicação técnica padrão (legado: NHe). */
const INDICACAO_TECNICA = () => f('indicacaoTecnica');

interface DadosPlano {
  motivo: string;
  planoAtual: string;
  planoEscolhido: string;
  roteador: string;
  dataContrato: string;
}

/** Bloco comum do protocolo, do 1º parágrafo até o separador de opções (legado: nk). */
function blocoProtocolo(
  entrada: string,
  sinal: string,
  compat: string,
  p: DadosPlano,
): string[] {
  return [
    entrada,
    '',
    SEP_BLOCO,
    '    ',
    f('statusOnu', { sinal }),
    '    ',
    SEP_BLOCO,
    f('motivoCliente', { ...p }),
    '',
    f('planoAtual', { ...p }),
    '',
    f('planoSolicitado', { ...p }),
    '',
    f('acesso') + ESP,
    '',
    '',
    SEP_BLOCO,
    '',
    compat,
    '',
    SEP_BLOCO,
    '',
  ];
}

/** Fecha a O.S com o separador longo + indicação técnica (legado: tk). */
function fechaOS(corpo: string): string {
  return `${corpo}\n\n${SEP_LONGO}\n\nINDICAÇÃO TÉCNICA:\n\n${INDICACAO_TECNICA()}`;
}

export function renderAltplanTrocaVisitaPaga(
  valores: Valores,
): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const nomeCompleto = maiusc(v.cliente);
  const a = primeiroNome(nomeCompleto);
  const o = maiusc(v.solicitante);
  const s = primeiroNome(o);
  const autorizado = maiusc(v.autorizado);
  const parente = maiusc(v.parente);
  const canal = v.canal ?? '';
  const contato = soDigitos(v.contato);
  const contatoSol = soDigitos(v.contatoSol);
  const bairro = maiusc(v.bairro);
  const roteadorTxt = maiusc(v.roteador);
  const compat =
    maiusc(v.compativel) === 'NÃO'
      ? f('compatNao', { roteador: roteadorTxt })
      : f('compatSim', { roteador: roteadorTxt });
  const roteadorSug = maiusc(v.roteadorSug);
  const formaPag = maiusc(v.formaPag);
  const p: DadosPlano = {
    motivo: maiusc(v.motivo),
    planoAtual: v.planoAtual ?? '',
    planoEscolhido: v.planoEscolhido ?? '',
    roteador: maiusc(v.roteador),
    dataContrato: maiusc(v.dataContrato),
  };
  const dataVisita = v.dataVisita ?? '';
  const horaVisita = v.horaVisita ?? '';
  const protocolo = v.protocolo ?? '';
  const sinal = descreveSinal(v);
  // O 2º arg do builder legado (`t`) era o primeiro nome do operador, impresso na
  // agenda como ` (${t})`. Aqui é lido de `valores.operadorPrimeiroNome`, igual aos
  // demais modelos do gerador — sem operador, o slot some (fixtures do legado).
  const operador = maiusc(v.operadorPrimeiroNome ?? '');
  const ref = operador ? ` (${operador})` : '';
  const sug = roteadorSug ? ` // ${roteadorSug}` : '';
  const agenda = f('agenda', { clienteCompleto: nomeCompleto, protocolo, formaPag, operador: ref, bairro, roteadorSug: sug });
  const custoVisita = f('custoVisita', { formaPagFrase: fraseFormaPag(formaPag) });
  const ofertado = ehOfertado(v);

  const base = {
    titular: a, solicitante: s, solicitanteCompleto: o, autorizado, parente,
    canal, contato, contatoSolicitante: contatoSol, sinal, dataVisita, horaVisita,
    bairro, protocolo, clienteCompleto: nomeCompleto,     formaPag, formaPagFrase: fraseFormaPag(formaPag), ...p,
  };

  const montar = (proto: string, osTexto: string): SaidaOS => ({
    protocolo: ofertado ? ofertadoProtocolo(proto) : proto,
    os: ofertado ? ofertadoOS(osTexto) : osTexto,
    agenda,
  });

  const entradaTitular = f('aberturaTitular', base);
  const entradaTerceiro = f('aberturaTerceiro', base);
  const osTitular = `${f('osCabecalhoTitular', base)} ${CLAUSULA_RENOVACAO()}`;
  const osTerceiro = `${f('osCabecalhoTerceiro', base)} ${CLAUSULA_RENOVACAO()}`;

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        ...blocoProtocolo(entradaTitular, sinal, compat, p),
        f('aceiteTitularAutorizaTerceiro', base),
        '',
        f('semDuvidas'),
      ].join('\n'),
      fechaOS(
        `${osTitular} ${f('osFechoTitularAutorizaTerceiro', base)} ${custoVisita} VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        ...blocoProtocolo(entradaTerceiro, sinal, compat, p),
        `${f('aceiteTitularAcompanha', base)} ${custoVisita} AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
        '',
        f('semDuvidas'),
      ].join('\n'),
      fechaOS(
        `${osTerceiro} ${f('osFechoTitularAcompanha', base)} ${custoVisita} AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        ...blocoProtocolo(entradaTerceiro, sinal, compat, p),
        f('aceiteTerceiroAutorizado', base),
        '',
        f('semDuvidas'),
      ].join('\n'),
      fechaOS(
        `${osTerceiro} ${f('osFechoTerceiroAutorizado', base)} ${custoVisita} AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      ...blocoProtocolo(entradaTitular, sinal, compat, p),
      f('aceiteTitularSozinho', base),
    ].join('\n'),
    fechaOS(`${osTitular} ${custoVisita} VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`),
  );
}
