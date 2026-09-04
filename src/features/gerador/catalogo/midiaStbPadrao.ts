/**
 * Catálogo de frases do modelo `midia-stb-padrao`.
 * Compra de STB (conversor de mídia).
 *
 * ⚠️ VAZAMENTO DE BRANDING: `osCorpo` cita "MZ TV" e "SERVIÇO DE INTERNET
 * MZNET" — o texto que descreve ao cliente o que ele compra e sob que condições.
 *
 * A regência da forma de pagamento (`pagFrase`) e a regra de parcelas
 * (R$100 → 1X) ficam no render: são cálculo, não texto.
 */
import type { Catalogo } from './tipos';

export const MIDIA_STB_PADRAO: Catalogo = {
  cabecalho: {
    rotulo: 'Abertura do atendimento',
    texto: '{cliente} SOLICITOU POR {canal} ({contato}) A COMPRA DE STB (CONVERSOR DE MÍDIA)',
    obrigatorios: ['cliente'],
  },
  statusCliente: {
    rotulo: 'Status do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUÇÃO.',
    obrigatorios: [],
  },
  motivoCompra: {
    rotulo: 'Motivo da compra',
    texto:
      'QUESTIONADO, {cliente} INFORMOU QUE CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET).',
    obrigatorios: ['cliente'],
  },
  valorAparelho: {
    rotulo: 'Valor e parcelamento do STB',
    texto: 'VALOR DO STB: {valorSTB}, PGM EM {parcelas} {pagFrase}.',
    obrigatorios: [],
  },
  formasPagamento: {
    rotulo: 'Formas de pagamento aceitas',
    texto: 'PAGAMENTO PODE SER REALIZADO EM DINHEIRO, PIX OU CARTÃO.',
    obrigatorios: [],
  },
  visitaIsenta: {
    rotulo: 'Necessidade da visita de instalação',
    texto: 'INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA (ISENTA DE CUSTOS) PARA INSTALAÇÃO DO APARELHO STB (CONVERSOR DE MÍDIA)',
    obrigatorios: [],
  },
  semDevolucao: {
    rotulo: 'Aparelho passa a ser do cliente',
    texto:
      'INFORMEI A {cliente} QUE UMA VEZ QUE REALIZAR A COMPRA DO STB, O MESMO PASSA A SER SEU, NÃO HAVENDO DEVOLUÇÃO DO EQUIPAMENTO (STB) NEM RESTITUIÇÃO DO VALOR PAGO. {cliente} CONCORDOU COM OS TERMOS DA VISITA E PAGARÁ O STB {formaPagFrase}. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA {dataVisita} ÀS {horaVisita} HORAS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  garantia: {
    rotulo: 'Garantia do aparelho',
    texto: 'GARANTIA DO APARELHO ADQUIRIDO É DE 90 DIAS PARA DEFEITOS DE FABRICAÇÃO.',
    obrigatorios: [],
  },
  osCorpo: {
    // ⚠️ Cita "MZ TV" e "SERVIÇO DE INTERNET WBR".
    rotulo: 'Corpo da O.S — condições da compra',
    texto:
      'POIS CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET) VALOR DO STB: {valorSTB}, PGM EM {parcelas} {pagFrase} A SER PAGO NO INÍCIO DA INSTALAÇÃO. COM O APARELHO (STB) CLIENTE TERÁ ACESSO AO SERVIÇO DE STREAMING QUE TEM NOME DE WBR TV, E TAL SERVIÇO É GRATUITO ENQUANTO CLIENTE FOR ASSINANTE E ADIMPLENTE DO SERVIÇO DE INTERNET WBR COM O PLANO CONTRATADO QUE POSSUI TAL BENEFÍCIO, E NÃO SENDO MAIS, NÃO HAVERÁ DEVOLUÇÃO DO EQUIPAMENTO (STB) NEM RESTITUIÇÃO DO VALOR PAGO. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA {dataVisita} ÀS {horaVisita} HORAS.',
    obrigatorios: ['dataVisita'],
  },
  rotuloIndicacao: {
    rotulo: 'Rótulo da indicação técnica',
    texto: 'INDICAÇÃO TÉCNICA:',
    obrigatorios: [],
  },
  indicacaoTecnica: {
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TÉCNICO: INSTALAR STB (SETUP BOX), CONECTA-LO POR CABO DE REDE SE ESTE FOR FICAR JUNTO DO ROTEADOR OU PELA REDE WI-FI (SEM FIO) E EXPLICAR DIFERENÇAS DESTA CONEXÃO. CONFIGURAR USUÁRIO E SENHA DO SERVIÇO DE STREAMING, ORIENTAR SOBRE UTILIZAÇÃO (DO SERVIÇO E DO EQUIPAMENTO/STB). TEMPO ESTIMADO 30 MINUTOS.',
    obrigatorios: [],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'COMPRA STB {clienteCompleto} PROT:{protocolo} {formaPag} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
