/**
 * Catálogo de frases do modelo `manut-realoc-fibra`.
 *
 * Remanejamento de fibra a pedido do cliente. Cinco tipos de solicitação.
 *
 * EXTRAÇÃO PARCIAL: o `nucleoCustoDrop` fica travado (helper compartilhado por
 * quatro modelos — mesma razão do `manut-ocas-fibra`), assim como o `CUSTO DE
 * {valor};` do fluxo sem valor informado, que é fragmento de montagem.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome do titular · {clienteCompleto}
 *        {solicitante} 1º nome de quem ligou · {solicitanteCompleto}
 *        {parente} {cargo} {canal} {contato} {contatoSolicitante}
 *        {sinalONU} {motivo} {formaPag} {formaPagFrase}
 *        {dataVisita} {horaVisita} {protocolo} {bairro} {tecnico} {pessoa}
 */
import type { Catalogo } from './tipos';

export const MANUT_REALOC_FIBRA: Catalogo = {
  aberturaTitular: {
    rotulo: 'Abertura — titular ligou',
    texto: '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) E SOLICITOU SUPORTE.',
    obrigatorios: ['cliente'],
  },
  aberturaPj: {
    rotulo: 'Abertura — pessoa jurídica',
    texto: '{solicitante} ({cargo}) ENTROU EM CONTATO POR {canal} ({contato}) E SOLICITOU SUPORTE.',
    obrigatorios: ['solicitante'],
  },
  aberturaTerceiro: {
    rotulo: 'Abertura — terceiro ligou',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) E SOLICITOU SUPORTE.',
    obrigatorios: ['solicitante', 'cliente'],
  },

  statusOnu: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU {sinalONU}.',
    obrigatorios: [],
  },
  statusOnuSemOscilacao: {
    rotulo: 'Status remoto — sem oscilação',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU {sinalONU} SEM OSCILACAO.',
    obrigatorios: [],
  },
  motivoCliente: {
    rotulo: 'Motivo alegado pelo cliente',
    texto: 'QUESTIONADO {pessoa} DISSE QUE "{motivo}".',
    obrigatorios: ['pessoa'],
  },
  custoFormasPagamento: {
    rotulo: 'Formas de pagamento do custo',
    texto: 'VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.',
    obrigatorios: [],
  },
  custoSemValor: {
    rotulo: 'Valor informado ao cliente (quando não há tabela)',
    texto: 'FOI INFORMADO O VALOR DE {valor}, PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.',
    obrigatorios: [],
  },

  aceitePresencial: {
    rotulo: 'Aceite — quem ligou acompanha',
    texto:
      '{pessoa} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO COM {formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['pessoa', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAusente: {
    rotulo: 'Aceite — titular não estará presente',
    texto:
      '{cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO COM {formaPag}, {cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  aceiteSemAcompanhante: {
    rotulo: 'Aceite — sem definir quem acompanha',
    texto:
      '{solicitante} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO COM {formaPag}.',
    obrigatorios: ['solicitante'],
  },
  contatoAutorizaTerceiro: {
    rotulo: 'Titular autoriza o terceiro a acompanhar',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  contatoTitularAcompanha: {
    rotulo: 'Titular confirma que acompanhará',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },

  osAberturaTitular: {
    rotulo: 'Abertura da O.S — titular',
    texto:
      '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "{motivo}".',
    obrigatorios: ['cliente'],
  },
  osAberturaPj: {
    rotulo: 'Abertura da O.S — pessoa jurídica',
    texto:
      '{solicitante} ({cargo}) ENTROU EM CONTATO POR {canal} ({contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "{motivo}".',
    obrigatorios: ['solicitante'],
  },
  osAberturaTerceiro: {
    rotulo: 'Abertura da O.S — terceiro',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "{motivo}".',
    obrigatorios: ['solicitante', 'cliente'],
  },
  osFechoClientePaga: {
    rotulo: 'Fecho da O.S — cliente paga e visita agendada',
    texto: 'CLIENTE PAGARA {formaPagFrase}. AGENDADA PARA {dataVisita} AS {horaVisita} HORAS.',
    obrigatorios: ['dataVisita'],
  },
  osFechoTitularAusente: {
    rotulo: 'Fecho da O.S — titular não estará presente',
    texto:
      'CLIENTE PAGARA {formaPagFrase}. {cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  osFechoTerceiroAutorizado: {
    rotulo: 'Fecho da O.S — terceiro autorizado a acompanhar',
    texto:
      '{solicitante} SOLICITOU PAGAR {formaPagFrase}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  osFechoTitularAcompanha: {
    rotulo: 'Fecho da O.S — titular acompanha',
    texto:
      '{solicitante} ESCOLHEU PAGAR {formaPagFrase}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },

  indicacaoTecnica: {
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TECNICO: VERIFICAR DROP INTERNO E EXTERNO, SE SOBRA TECNICA FOR SUFICIENTE, USAR PARA REPARO E RESTABELECER CONEXAO. CASO NAO SEJA PASSAR OUTRO DROP. CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO. AO FINALIZAR ENTRAR EM CONTATO COM SUPORTE PARA CONFERIR SINAL E CONFIRMAR NORMALIZACAO COM {pessoa}. TEMPO ESTIMADO 60 MIN.',
    obrigatorios: ['pessoa'],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'MAN REMANEJAMENTO DE FIBRA {clienteCompleto} PROT:{protocolo} {formaPag} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
