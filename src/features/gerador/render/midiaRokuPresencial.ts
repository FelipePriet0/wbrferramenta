/**
 * Emulação do modelo `midia-roku-presencial` — porte 1:1 da função `zKe` do
 * bundle legado (conteúdo de O.S do próprio app). Compra presencial do Roku-TV
 * (conversor de mídia): cliente comparece na loja e agenda visita para
 * instalação. Sem variável `tipoSolicitacao`. O 2º argumento do builder legado é
 * o `operadorPrimeiroNome`, lido aqui de `valores.operadorPrimeiroNome`.
 * Validado por diff contra o legado — ver `midiaRokuPresencial.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador de asteriscos. (legado: EKe / separadores do FKe) */
const SEP_AST = '*';
/** Indentação: N espaços. */
function esp(n: number): string {
  return ' '.repeat(n);
}

/** Campos normalizados do modelo. (legado: Qj) */
interface DadosRoku {
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

/** Normaliza os valores do formulário. (legado: Qj) */
function normaliza(v: Valores): DadosRoku {
  const clienteUpper = maiusc(v.cliente);
  return {
    clienteUpper,
    cp: primeiroNome(clienteUpper), // OKe
    sinalONU: maiusc(v.sinalONU),
    bairro: maiusc(v.bairro),
    valorSTB: String(v.valorSTB ?? ''),
    parcelas: String(v.parcelas ?? ''),
    formaPag: String(v.formaPag ?? ''),
    dataVisita: String(v.dataVisita ?? ''),
    horaVisita: String(v.horaVisita ?? ''),
    protocolo: String(v.protocolo ?? ''),
  };
}

/** Corpo do Protocolo, após a linha de abertura. (legado: FKe) */
function corpoProtocolo(n: DadosRoku): string[] {
  return [
    SEP_AST,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${n.sinalONU} SEM OSCILAÇÃO.`,
    '',
    SEP_AST,
    esp(8),
    `QUESTIONADO, ${n.cp} INFORMOU QUE CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET).  `,
    '',
    SEP_AST,
    esp(8),
    `VALOR DO ROKU-TV: R$200,00, SE PAGO À VISTA, OU R$230,00 SE PARCELADO EM ATÉ 3X NO CARTÃO DE CRÉDITO.`,
    '',
    `PAGAMENTO PODE SER REALIZADO EM DINHEIRO, PIX OU CARTÃO.`,
    esp(8),
    SEP_AST,
    esp(8),
    `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA (ISENTA DE CUSTOS) PARA INSTALAÇÃO DO APARELHO ROKU-TV (CONVERSOR DE MÍDIA)`,
    '',
    SEP_AST,
    esp(8),
    `INFORMEI A ${n.cp} QUE UMA VEZ QUE REALIZAR A COMPRA DO ROKU-TV, O MESMO PASSA A SER SEU, NÃO HAVENDO DEVOLUÇÃO DO EQUIPAMENTO (ROKU) NEM RESTITUIÇÃO DO VALOR PAGO. ${n.cp} CONCORDOU COM OS TERMOS DA VISITA E PAGARÁ O ROKU-TV ${fraseFormaPag(n.formaPag)}. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${n.dataVisita} ÀS ${n.horaVisita} HORAS.`,
    esp(4),
    `GARANTIA DO APARELHO ADQUIRIDO É DE 90 DIAS PARA DEFEITOS DE FABRICAÇÃO.`,
  ];
}

/** Texto da O.S. (legado: IKe) */
function textoOS(e: string, t: DadosRoku): string {
  return [
    `${e} POIS CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET) VALOR DO ROKU-TV: ${t.valorSTB}, PGM EM ${maiusc(t.parcelas)}, ${fraseFormaPag(t.formaPag)} A SER PAGO NO INÍCIO DA INSTALAÇÃO. COM O APARELHO (ROKU-TV) CLIENTE TERÁ ACESSO À LOJA DE APLICATIVOS ONDE PODERÁ UTILIZAR O SERVIÇO DE STREAMING QUE TEM NOME DE WBR TV, E TAL SERVIÇO É GRATUITO ENQUANTO CLIENTE FOR ASSINANTE E ADIMPLENTE DO SERVIÇO DE INTERNET WBR COM O PLANO CONTRATADO QUE POSSUI TAL BENEFÍCIO, E NÃO SENDO MAIS, NÃO HAVERÁ DEVOLUÇÃO DO EQUIPAMENTO (ROKU-TV) NEM RESTITUIÇÃO DO VALOR PAGO. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${t.dataVisita} ÀS ${t.horaVisita} HORAS.`,
    '',
    SEP_AST,
    '',
    `INDICAÇÃO TÉCNICA:`,
    '',
    `TÉCNICO: INSTALAR ROKU-TV, CONECTA-LO PREFERENCIALMENTE VIA REDE WI-FI 5G E EXPLICAR DIFERENÇAS DESTA CONEXÃO. CONFIGURAR USUÁRIO E SENHA DO SERVIÇO DE STREAMING, ORIENTAR SOBRE UTILIZAÇÃO (DO SERVIÇO E DO EQUIPAMENTO/ROKU-TV). TEMPO ESTIMADO 30 MINUTOS.`,
  ].join('\n');
}

export function renderMidiaRokuPresencial(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const operador = v.operadorPrimeiroNome ?? '';
  const n = normaliza(v);

  const protocolo = [
    `${n.cp} COMPARECEU NA LOJA E SOLICITOU A COMPRA DO ROKU-TV (CONVERSOR DE MÍDIA).`,
    '',
    ...corpoProtocolo(n),
  ].join('\n');

  const aberturaOS = `${n.cp} COMPARECEU NA LOJA E SOLICITOU A COMPRA DE ROKU-TV (CONVERSOR DE MÍDIA)`;
  const os = textoOS(aberturaOS, n);

  const agenda = `COMPRA ROKU-TV ${n.clienteUpper} PROT:${n.protocolo} ${maiusc(n.formaPag)} (${operador}) - ${n.bairro}`;

  return { protocolo, os, agenda };
}
