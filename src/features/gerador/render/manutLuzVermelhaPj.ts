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

/** Separador de blocos no Protocolo — 19 asteriscos. (legado: kk) */
const SEP_PROTO = '*'.repeat(19);
/** Separador antes da INDICAÇÃO TÉCNICA na O.S — 39 iguais. (legado: yUe) */
const SEP_OS = '='.repeat(39);
/** Recuo de 4 espaços entre linhas do Protocolo. (legado: Pk(4)) */
const PK4 = ' '.repeat(4);
/** Espaço em fim de linha preservado do legado (senão o editor o remove). */
const SP = ' ';

/** Indicação técnica fixa da O.S. (legado: xUe) */
const INDICACAO_TECNICA =
  'TECNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE E DE OBRIGACAO DO PROVEDOR, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZACAO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.';

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

  const protocolo = `${sol} (${cargo}) ENTROU EM CONTATO POR ${n.canal ?? ''} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.

${SEP_PROTO}
${PK4}
CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuNome} SEM SINAL.
${PK4}
${SEP_PROTO}
${PK4}
QUESTIONADO, DISSE QUE A ${onuNome} ESTA COM ${alarme}.
${PK4}
REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA.${SP}
ORIENTEI ${sol} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.${SP}
${PK4}
PERGUNTEI A ${sol} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.${SP}
${PK4}
${SEP_PROTO}
${PK4}
INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.
${PK4}
${SEP_PROTO}
${PK4}
${sol} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA ${fraseFormaPag(formaPag)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${n.dataVisita ?? ''} AS ${n.horaVisita ?? ''} HRS.

CLIENTE SEM DUVIDAS.`;

  const corpoOs = `${sol} (${cargo}) ENTROU EM CONTATO POR ${n.canal ?? ''} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${onuNome} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA. ORIENTEI ${sol} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${sol} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${sol} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${n.dataVisita ?? ''} AS ${n.horaVisita ?? ''} HRS.`;

  const os = `${corpoOs}${blocoCto(ctoType, cto, passante)}${SEP_OS}\n\nINDICACAO TECNICA:\n\n${INDICACAO_TECNICA}`;

  let agenda = `MAN ${alarme} ${razao} PROT:${n.protocolo ?? ''} ${formaPag} (${t}) - ${bairro}`;
  if (ctoType === 'CTOI') agenda += ` *CTOI*`;

  return { protocolo, os, agenda };
}
