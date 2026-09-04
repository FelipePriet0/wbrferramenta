/**
 * Catálogo de frases do modelo `midia-roku-padrao`.
 * Compra de Roku TV — fluxo padrão.
 *
 * ⚠️ VAZAMENTO DE BRANDING: `osCorpo` cita o serviço de streaming "MZ TV" e o
 * "SERVIÇO DE INTERNET WBR". É o texto que descreve ao cliente o que ele está
 * comprando e sob que condições — na WBR precisa ser o nome do serviço de lá.
 */
import type { Catalogo } from './tipos';

export const MIDIA_ROKU_PADRAO: Catalogo = {
  cabecalho: {
    rotulo: 'Abertura do atendimento',
    texto: '{cliente} SOLICITOU POR {canal} ({contato}) A COMPRA DO ROKU-TV (CONVERSOR DE MÍDIA)',
    obrigatorios: ['cliente'],
  },
  statusOnu: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU {sinalONU} SEM OSCILAÇÃO.',
    obrigatorios: [],
  },
  motivoCompra: {
    rotulo: 'Motivo da compra',
    texto:
      'QUESTIONADO, {cliente} INFORMOU QUE CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET).',
    obrigatorios: ['cliente'],
  },
  valorAparelho: {
    rotulo: 'Valor do aparelho',
    texto: 'VALOR DO ROKU-TV: R$200,00, SE PAGO À VISTA, OU R$230,00 SE PARCELADO EM ATÉ 3X NO CARTÃO DE CRÉDITO.',
    obrigatorios: [],
  },
  formasPagamento: {
    rotulo: 'Formas de pagamento aceitas',
    texto: 'PAGAMENTO PODE SER REALIZADO EM DINHEIRO, PIX OU CARTÃO.',
    obrigatorios: [],
  },
  visitaIsenta: {
    rotulo: 'Necessidade da visita de instalação',
    texto: 'INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA (ISENTA DE CUSTOS) PARA INSTALAÇÃO DO APARELHO ROKU-TV (CONVERSOR DE MÍDIA)',
    obrigatorios: [],
  },
  semDevolucao: {
    rotulo: 'Aparelho passa a ser do cliente',
    texto:
      'INFORMEI A {cliente} QUE UMA VEZ QUE REALIZAR A COMPRA DO ROKU-TV, O MESMO PASSA A SER SEU, NÃO HAVENDO DEVOLUÇÃO DO EQUIPAMENTO (ROKU) NEM RESTITUIÇÃO DO VALOR PAGO. {cliente} CONCORDOU COM OS TERMOS DA VISITA E PAGARÁ O ROKU-TV {formaPagFrase}. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA {dataVisita} ÀS {horaVisita} HORAS.',
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
      'POIS CONTRATOU PLANO DE INTERNET QUE TEM SERVIÇO DE CANAIS VIA STREAMING GRATUITAMENTE, MAS NÃO TEM SMART-TV (TV COM ACESSO À INTERNET) VALOR DO ROKU-TV: {valorSTB}, PGM EM {parcelas}, {formaPagFrase} A SER PAGO NO INÍCIO DA INSTALAÇÃO. COM O APARELHO (ROKU-TV) CLIENTE TERÁ ACESSO À LOJA DE APLICATIVOS ONDE PODERÁ UTILIZAR O SERVIÇO DE STREAMING QUE TEM NOME DE WBR TV, E TAL SERVIÇO É GRATUITO ENQUANTO CLIENTE FOR ASSINANTE E ADIMPLENTE DO SERVIÇO DE INTERNET WBR COM O PLANO CONTRATADO QUE POSSUI TAL BENEFÍCIO, E NÃO SENDO MAIS, NÃO HAVERÁ DEVOLUÇÃO DO EQUIPAMENTO (ROKU-TV) NEM RESTITUIÇÃO DO VALOR PAGO. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA {dataVisita} ÀS {horaVisita} HORAS.',
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
      'TÉCNICO: INSTALAR ROKU-TV, CONECTA-LO PREFERENCIALMENTE VIA REDE WI-FI 5G E EXPLICAR DIFERENÇAS DESTA CONEXÃO. CONFIGURAR USUÁRIO E SENHA DO SERVIÇO DE STREAMING, ORIENTAR SOBRE UTILIZAÇÃO (DO SERVIÇO E DO EQUIPAMENTO/ROKU-TV). TEMPO ESTIMADO 30 MINUTOS.',
    obrigatorios: [],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'COMPRA ROKU-TV {clienteCompleto} PROT:{protocolo} {formaPag} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
