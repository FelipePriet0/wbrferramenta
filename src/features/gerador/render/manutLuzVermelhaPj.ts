/**
 * Emulação do modelo `manut-luz-vermelha-pj` — porte 1:1 da função `EUe` do
 * bundle legado (conteúdo de O.S do próprio app). Manutenção de luz vermelha /
 * PON para pessoa jurídica: gera Protocolo, O.S e linha de Agenda. O 2º arg do
 * builder legado é o `operadorPrimeiroNome`, lido de `valores.operadorPrimeiroNome`.
 * Validado por diff contra o legado — ver `manutLuzVermelhaPj.diff.test.ts`.
 */
import {
  fraseFormaPag,
  maiusc,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_LUZ_VERMELHA_PJ } from '../catalogo/manutLuzVermelhaPj';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-luz-vermelha-pj';

const f = fraseDe(SLUG, MANUT_LUZ_VERMELHA_PJ);

/** Separador de blocos no Protocolo — 19 asteriscos. (legado: kk) */
const SEP_PROTO = '*'.repeat(19);
/** Separador antes da INDICAÇÃO TÉCNICA na O.S — 39 iguais. (legado: yUe) */
const SEP_OS = '='.repeat(39);
/** Recuo de 4 espaços entre linhas do Protocolo. (legado: Pk(4)) */
const PK4 = ' '.repeat(4);
/** Espaço em fim de linha preservado do legado (senão o editor o remove). */
const SP = ' ';

/** Indicação técnica fixa da O.S. (legado: xUe) */
const INDICACAO_TECNICA = () => f('indicacaoTecnica');

/** Bloco CTO da O.S. (legado: wUe) */
function blocoCto(ctoType: string, cto: string, passante: string): string {
  if (ctoType === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`;
  if (ctoType === 'CTOI') return `\nCTOI // ${passante}.\n`;
  return '';
}

export function renderManutLuzVermelhaPj(valores: Valores): SaidaOS {
  const n: Valores = {};
  for (const [k, val] of Object.entries(valores)) n[k] = String(val ?? '');

  const t = n.operadorPrimeiroNome ?? '';
  const razao = maiusc(n.cliente);
  const sol = primeiroNome(maiusc(n.solicitante));
  const cargo = maiusc(n.cargo);
  const contato = soDigitos(n.contato);
  const alarme = maiusc(n.alarme);
  const bairro = maiusc(n.bairro);
  const formaPag = maiusc(n.formaPag);
  const onu = maiusc(n.onu);
  const onuNome = primeiroNome(onu);
  const ctoType = n.ctoType || 'CTOE';
  const cto = maiusc(n.cto);
  const passante = maiusc(n.passante);

  const base = {
    solicitante: sol,
    cargo,
    clienteCompleto: razao,
    canal: n.canal ?? '',
    contato,
    alarme,
    onu: onuNome,
    equipamentos: onu,
    formaPag,
    formaPagFrase: fraseFormaPag(formaPag),
    dataVisita: n.dataVisita ?? '',
    horaVisita: n.horaVisita ?? '',
    protocolo: n.protocolo ?? '',
    bairro,
    tecnico: t,
  };

  const protocolo = `${f('abertura', base)}

${SEP_PROTO}
${PK4}
${f('statusOnu', base)}
${PK4}
${SEP_PROTO}
${PK4}
${f('alarmeRelato', base)}
${PK4}
${f('verificacaoRemota', base)}${SP}
${f('orientacaoReinicio', base)}${SP}
${PK4}
${f('perguntaIntervencao', base)}${SP}
${PK4}
${SEP_PROTO}
${PK4}
${f('termosVisita')}
${PK4}
${SEP_PROTO}
${PK4}
${f('aceite', base)}

${f('semDuvidas')}`;

  const corpoOs = f('corpoOs', base);

  const os = `${corpoOs}${blocoCto(ctoType, cto, passante)}${SEP_OS}\n\nINDICACAO TECNICA:\n\n${INDICACAO_TECNICA()}`;

  let agenda = f('agenda', base);
  if (ctoType === 'CTOI') agenda += ` *CTOI*`;

  return { protocolo, os, agenda };
}
