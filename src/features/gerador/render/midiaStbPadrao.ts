/**
 * Emulação do modelo `midia-stb-padrao` — porte da função `iqe` do bundle
 * legado (conteúdo de O.S do próprio app), com `protocolo`/`agenda` adicionados
 * (o legado só tinha `stbPadraoTextoOS` — sem texto de protocolo, sem agenda,
 * sem campo de bairro/nº de protocolo). Estrutura de protocolo/agenda espelha
 * `midiaRokuPadrao.ts` (mesmo fluxo de compra + visita isenta). O 2º argumento
 * do builder legado é o `operadorPrimeiroNome`, lido aqui de
 * `valores.operadorPrimeiroNome`.
 * O texto da O.S (`os`) permanece validado por diff contra o legado — ver
 * `midiaStbPadrao.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador de asteriscos entre a O.S e a indicação técnica. (legado: JKe) */
const SEP = '*'.repeat(35);
const esp = (n: number) => ' '.repeat(n);

export function renderMidiaStbPadrao(valores: Valores): SaidaOS {
  const e: Valores = {};
  for (const [k, val] of Object.entries(valores)) e[k] = String(val ?? '');

  const clienteUpper = maiusc(e.cliente);
  const n = primeiroNome(clienteUpper);
  const r = maiusc(e.canal);
  const i = soDigitos(e.contato);
  const a = String(e.valorSTB ?? '');
  const fp = maiusc(e.formaPag);
  const pagFrase = fp === 'CARTAO' ? 'NO CARTÃO' : fp === 'DINHEIRO' ? 'EM DINHEIRO' : fp === 'PIX' ? 'VIA PIX' : `NO ${fp}`;
  const parcelas = a === `R$100,00` ? `1X` : maiusc(e.parcelas);
  const dataVisita = String(e.dataVisita ?? '');
  const horaVisita = String(e.horaVisita ?? '');
  const bairro = maiusc(e.bairro);
  const protocoloNum = String(e.protocolo ?? '');
  const operador = String(e.operadorPrimeiroNome ?? '');

  const cabecalho = `${n} SOLICITOU POR ${r} (${i}) A COMPRA DE STB (CONVERSOR DE MÍDIA)`;

  const texto = [
    `${cabecalho} POIS CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET) VALOR DO STB: ${a}, PGM EM ${parcelas} ${pagFrase} A SER PAGO NO INÍCIO DA INSTALAÇÃO. COM O APARELHO (STB) CLIENTE TERÁ ACESSO AO SERVIÇO DE STREAMING QUE TEM NOME DE WBR TV, E TAL SERVIÇO É GRATUITO ENQUANTO CLIENTE FOR ASSINANTE E ADIMPLENTE DO SERVIÇO DE INTERNET WBR COM O PLANO CONTRATADO QUE POSSUI TAL BENEFÍCIO, E NÃO SENDO MAIS, NÃO HAVERÁ DEVOLUÇÃO DO EQUIPAMENTO (STB) NEM RESTITUIÇÃO DO VALOR PAGO. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HORAS.`,
    ``,
    SEP,
    ``,
    `INDICAÇÃO TÉCNICA:`,
    ``,
    `TÉCNICO: INSTALAR STB (SETUP BOX), CONECTA-LO POR CABO DE REDE SE ESTE FOR FICAR JUNTO DO ROTEADOR OU PELA REDE WI-FI (SEM FIO) E EXPLICAR DIFERENÇAS DESTA CONEXÃO. CONFIGURAR USUÁRIO E SENHA DO SERVIÇO DE STREAMING, ORIENTAR SOBRE UTILIZAÇÃO (DO SERVIÇO E DO EQUIPAMENTO/STB). TEMPO ESTIMADO 30 MINUTOS.`,
  ].join(`\n`);

  const protocolo = [
    `${cabecalho}.`,
    ``,
    SEP,
    ``,
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO.`,
    ``,
    SEP,
    esp(8),
    `QUESTIONADO, ${n} INFORMOU QUE CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET).  `,
    ``,
    SEP,
    esp(8),
    `VALOR DO STB: ${a}, PGM EM ${parcelas} ${pagFrase}.`,
    ``,
    `PAGAMENTO PODE SER REALIZADO EM DINHEIRO, PIX OU CARTÃO.`,
    esp(8),
    SEP,
    esp(8),
    `INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA (ISENTA DE CUSTOS) PARA INSTALAÇÃO DO APARELHO STB (CONVERSOR DE MÍDIA)`,
    ``,
    SEP,
    esp(8),
    `INFORMEI A ${n} QUE UMA VEZ QUE REALIZAR A COMPRA DO STB, O MESMO PASSA A SER SEU, NÃO HAVENDO DEVOLUÇÃO DO EQUIPAMENTO (STB) NEM RESTITUIÇÃO DO VALOR PAGO. ${n} CONCORDOU COM OS TERMOS DA VISITA E PAGARÁ O STB ${fraseFormaPag(fp)}. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HORAS.`,
    esp(4),
    `GARANTIA DO APARELHO ADQUIRIDO É DE 90 DIAS PARA DEFEITOS DE FABRICAÇÃO.`,
  ].join(`\n`);

  const agenda = `COMPRA STB ${clienteUpper} PROT:${protocoloNum} ${fp} (${operador}) - ${bairro}`;

  return { protocolo, os: texto, agenda };
}
