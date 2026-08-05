/**
 * Emulação do modelo `midia-roku-padrao` — porte 1:1 da função `LKe` do bundle
 * legado (conteúdo de O.S do próprio app). Compra do ROKU-TV (conversor de
 * mídia): protocolo + O.S + agenda. SEM variável de tipo. 2º arg do builder =
 * operador (lido de `valores.operadorPrimeiroNome`). Validado por diff contra o
 * legado — ver `midiaRokuPadrao.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador do corpo (legado: EKe). */
const SEP = '*';
/** Indentação literal preservada dos template-strings do legado. */
const esp = (n: number) => ' '.repeat(n);

interface Dados {
  clienteUpper: string;
  cp: string;
  sinalONU: string;
  bairro: string;
  valorSTB: string;
  parcelas: string;
  formaPag: string;
  dataVisita: string;
  horaVisita: string;
  protocolo: string;
}

/** Extrai/normaliza os campos usados no modelo (legado: Qj). */
function extrai(e: Valores): Dados {
  const clienteUpper = maiusc(e.cliente);
  return {
    clienteUpper,
    cp: primeiroNome(clienteUpper),
    sinalONU: maiusc(e.sinalONU),
    bairro: maiusc(e.bairro),
    valorSTB: String(e.valorSTB ?? ''),
    parcelas: String(e.parcelas ?? ''),
    formaPag: String(e.formaPag ?? ''),
    dataVisita: String(e.dataVisita ?? ''),
    horaVisita: String(e.horaVisita ?? ''),
    protocolo: String(e.protocolo ?? ''),
  };
}

/** Corpo do protocolo (legado: FKe). */
function corpoProtocolo(n: Dados): string[] {
  return [
    SEP,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${n.sinalONU} SEM OSCILAÇÃO.`,
    '',
    SEP,
    esp(8),
    `QUESTIONADO, ${n.cp} INFORMOU QUE CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET).  `,
    '',
    SEP,
    esp(8),
    'VALOR DO ROKU-TV: R$200,00, SE PAGO À VISTA, OU R$230,00 SE PARCELADO EM ATÉ 3X NO CARTÃO DE CRÉDITO.',
    '',
    'PAGAMENTO PODE SER REALIZADO EM DINHEIRO, PIX OU CARTÃO.',
    esp(8),
    SEP,
    esp(8),
    'INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA (ISENTA DE CUSTOS) PARA INSTALAÇÃO DO APARELHO ROKU-TV (CONVERSOR DE MÍDIA)',
    '',
    SEP,
    esp(8),
    `INFORMEI A ${n.cp} QUE UMA VEZ QUE REALIZAR A COMPRA DO ROKU-TV, O MESMO PASSA A SER SEU, NÃO HAVENDO DEVOLUÇÃO DO EQUIPAMENTO (ROKU) NEM RESTITUIÇÃO DO VALOR PAGO. ${n.cp} CONCORDOU COM OS TERMOS DA VISITA E PAGARÁ O ROKU-TV ${fraseFormaPag(n.formaPag)}. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${n.dataVisita} ÀS ${n.horaVisita} HORAS.`,
    esp(4),
    'GARANTIA DO APARELHO ADQUIRIDO É DE 90 DIAS PARA DEFEITOS DE FABRICAÇÃO.',
  ];
}

/** Texto da O.S (legado: IKe). */
function montarOS(cabecalho: string, n: Dados): string {
  return [
    `${cabecalho} POIS CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET) VALOR DO ROKU-TV: ${n.valorSTB}, PGM EM ${maiusc(n.parcelas)}, ${fraseFormaPag(n.formaPag)} A SER PAGO NO INÍCIO DA INSTALAÇÃO. COM O APARELHO (ROKU-TV) CLIENTE TERÁ ACESSO À LOJA DE APLICATIVOS ONDE PODERÁ UTILIZAR O SERVIÇO DE STREAMING QUE TEM NOME DE WBR TV, E TAL SERVIÇO É GRATUITO ENQUANTO CLIENTE FOR ASSINANTE E ADIMPLENTE DO SERVIÇO DE INTERNET WBR COM O PLANO CONTRATADO QUE POSSUI TAL BENEFÍCIO, E NÃO SENDO MAIS, NÃO HAVERÁ DEVOLUÇÃO DO EQUIPAMENTO (ROKU-TV) NEM RESTITUIÇÃO DO VALOR PAGO. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${n.dataVisita} ÀS ${n.horaVisita} HORAS.`,
    '',
    SEP,
    '',
    'INDICAÇÃO TÉCNICA:',
    '',
    'TÉCNICO: INSTALAR ROKU-TV, CONECTA-LO PREFERENCIALMENTE VIA REDE WI-FI 5G E EXPLICAR DIFERENÇAS DESTA CONEXÃO. CONFIGURAR USUÁRIO E SENHA DO SERVIÇO DE STREAMING, ORIENTAR SOBRE UTILIZAÇÃO (DO SERVIÇO E DO EQUIPAMENTO/ROKU-TV). TEMPO ESTIMADO 30 MINUTOS.',
  ].join('\n');
}

export function renderMidiaRokuPadrao(valores: Valores): SaidaOS {
  const n = extrai(valores);
  const canal = String(valores.canal ?? '');
  const contato = soDigitos(valores.contato);
  const operador = String(valores.operadorPrimeiroNome ?? '');

  const cabecalho = `${n.cp} SOLICITOU POR ${canal} (${contato}) A COMPRA DO ROKU-TV (CONVERSOR DE MÍDIA)`;

  const protocolo = [`${cabecalho}.`, '', ...corpoProtocolo(n)].join('\n');
  const os = montarOS(cabecalho, n);
  const agenda = `COMPRA ROKU-TV ${n.clienteUpper} PROT:${n.protocolo} ${maiusc(n.formaPag)} (${operador}) - ${n.bairro}`;

  return { protocolo, os, agenda };
}
