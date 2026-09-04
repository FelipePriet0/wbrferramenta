/**
 * Emulação do modelo `altplan-troca-visita-isenta` — porte 1:1 da função `hHe`
 * do bundle legado (conteúdo de O.S do próprio app). É a troca de plano COM troca
 * de roteador (visita técnica) porém ISENTA de custo. Ramifica nos 4 tipos de
 * solicitação (titular/terceiro × solicita/acompanha) e no modo "ofertado".
 * Retorna também o texto de agenda. Validado por diff contra o legado — ver
 * `altplanTrocaVisitaIsenta.diff.test.ts`.
 */
import {
  descreveSinal,
  maiusc,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { ALTPLAN_TROCA_VISITA_ISENTA } from '../catalogo/altplanTrocaVisitaIsenta';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'altplan-troca-visita-isenta';

const f = fraseDe(SLUG, ALTPLAN_TROCA_VISITA_ISENTA);

/** Espaço final que o legado deixava na linha de acesso aos apps. */
const ESP = ' ';

/** Separador de bloco do protocolo (legado: qD desta família). */
const SEP_BLOCO = '**************';
/** Separador da indicação técnica na O.S. */
const SEP_INDICACAO = '***********************************';

/**
 * Trecho fixo de renovação/necessidade de visita para troca de roteador.
 * (legado: pHe)
 */
const CONTRATO_VISITA = () => f('contratoVisita');

/** Bloco de indicação técnica (legado: mHe). */
const INDICACAO_TECNICA = () => f('indicacaoTecnica');

interface Plano {
  motivo: string;
  planoAtual: string;
  planoEscolhido: string;
  roteador: string;
  dataContrato: string;
}

/** origem === 'ofertado' (legado: UD). */
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

/** Envelope da indicação técnica na O.S (legado: GO). */
function comIndicacaoTecnica(texto: string): string {
  return `${texto}\n\n${SEP_INDICACAO}\n\nINDICAÇÃO TÉCNICA:\n\n${INDICACAO_TECNICA()}`;
}

/** Bloco superior do protocolo, comum a todos os tipos (legado: KO desta família). */
function blocoProtocolo(intro: string, sinal: string, compat: string, plano: Plano): string[] {
  return [
    intro,
    '',
    SEP_BLOCO,
    '    ',
    f('statusOnu', { sinal }),
    '    ',
    SEP_BLOCO,
    f('motivoCliente', { ...plano }),
    '',
    f('planoAtual', { ...plano }),
    '',
    f('planoSolicitado', { ...plano }),
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

export function renderAltplanTrocaVisitaIsenta(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const clienteFull = maiusc(v.cliente);
  const titular = primeiroNome(clienteFull);
  const solFull = maiusc(v.solicitante);
  const sol = primeiroNome(solFull);
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
  const plano: Plano = {
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
  const agenda = f('agenda', { clienteCompleto: clienteFull, protocolo, operador: ref, bairro, roteadorSug: sug });
  const ofertado = ehOfertado(v);

  const base = {
    titular, solicitante: sol, solicitanteCompleto: solFull, autorizado, parente,
    canal, contato, contatoSolicitante: contatoSol, sinal, dataVisita, horaVisita,
    bairro, protocolo, clienteCompleto: clienteFull, ...plano,
  };

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => {
    const proto = protoLinhas.join('\n');
    return {
      protocolo: ofertado ? ofertadoProtocolo(proto) : proto,
      os: ofertado ? ofertadoOS(osTexto) : osTexto,
      agenda,
    };
  };

  const introTitular = f('aberturaTitular', base);
  const introTerceiro = f('aberturaTerceiro', base);
  const osTitular = `${f('osCabecalhoTitular', base)} ${CONTRATO_VISITA()}`;
  const osTerceiro = `${f('osCabecalhoTerceiro', base)} ${CONTRATO_VISITA()}`;

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        ...blocoProtocolo(introTitular, sinal, compat, plano),
        f('aceiteTitularAutorizaTerceiro', base),
        '',
        f('semDuvidas'),
      ],
      comIndicacaoTecnica(
        `${osTitular} ${f('osFechoTitularAutorizaTerceiro', base)}`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        ...blocoProtocolo(introTerceiro, sinal, compat, plano),
        f('aceiteTitularAcompanha', base),
        '',
        f('semDuvidas'),
      ],
      comIndicacaoTecnica(
        `${osTerceiro} ${f('osFechoTitularAcompanha', base)}`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        ...blocoProtocolo(introTerceiro, sinal, compat, plano),
        f('aceiteTerceiroAutorizado', base),
        '',
        f('semDuvidas'),
      ],
      comIndicacaoTecnica(
        `${osTerceiro} ${f('osFechoTerceiroAutorizado', base)}`,
      ),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      ...blocoProtocolo(introTitular, sinal, compat, plano),
      f('aceiteTitularSozinho', base),
    ],
    comIndicacaoTecnica(
      `${osTitular} ${f('osFechoTitular', base)}`,
    ),
  );
}
