/**
 * Catálogo de frases do modelo `manut-mud-ponto-int`.
 *
 * Mudança de ponto interno dos equipamentos. Cinco tipos de solicitação.
 *
 * EXTRAÇÃO PARCIAL: o `nucleoCustoDrop` fica travado (helper compartilhado por
 * quatro modelos). As frases de pagamento aqui são só o pedaço que sobra depois
 * dele — foram extraídas separadamente para ficarem legíveis.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome · {clienteCompleto} · {solicitante} {solicitanteCompleto}
 *        {parente} {cargo} {canal} {contato} {contatoSolicitante}
 *        {sinalONU} {motivo} {ambienteAtual} {ambienteNovo} {valor}
 *        {formaPag} {formaPagFrase} {dataVisita} {horaVisita}
 *        {protocolo} {bairro} {tecnico} {pessoa}
 */
import type { Catalogo } from './tipos';

export const MANUT_MUD_PONTO_INT: Catalogo = {
  aberturaTitular: {
    rotulo: 'Abertura — titular ligou',
    texto:
      '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO',
    obrigatorios: ['cliente'],
  },
  aberturaPj: {
    rotulo: 'Abertura — pessoa jurídica',
    texto:
      '{solicitante} ({cargo}) ENTROU EM CONTATO POR {canal} ({contato}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO',
    obrigatorios: ['solicitante'],
  },
  aberturaTerceiro: {
    rotulo: 'Abertura — terceiro ligou',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO',
    obrigatorios: ['solicitante', 'cliente'],
  },

  statusOnu: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU COM SINAL: {sinalONU}.',
    obrigatorios: [],
  },
  statusOnuSemOscilacao: {
    rotulo: 'Status remoto — sem oscilação',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU COM SINAL: {sinalONU} SEM OSCILACAO.',
    obrigatorios: [],
  },
  motivoCliente: {
    rotulo: 'Motivo alegado pelo cliente',
    texto: 'QUESTIONADO {pessoa} DISSE QUE "{motivo}".',
    obrigatorios: ['pessoa'],
  },
  ambienteAtual: {
    rotulo: 'Ambiente atual dos equipamentos',
    texto: 'AMBIENTE ATUAL: {ambienteAtual}',
    obrigatorios: [],
  },
  ambienteNovo: {
    rotulo: 'Novo ambiente dos equipamentos',
    texto: 'NOVO AMBIENTE: {ambienteNovo}',
    obrigatorios: [],
  },
  custoFormasPagamento: {
    rotulo: 'Formas de pagamento do custo',
    texto: 'VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.',
    obrigatorios: [],
  },
  custoSemValor: {
    rotulo: 'Valor informado quando não há tabela',
    texto: 'VALOR DE {valor} A SER PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.',
    obrigatorios: [],
  },

  aceitePresencial: {
    rotulo: 'Aceite — quem ligou acompanha',
    texto:
      '{pessoa} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['pessoa', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAusente: {
    rotulo: 'Aceite — titular não estará presente',
    texto:
      '{cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO {formaPagFrase}, {cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  aceiteSemAcompanhante: {
    rotulo: 'Aceite — sem definir quem acompanha',
    texto:
      '{solicitante} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO {formaPagFrase}.',
    obrigatorios: ['solicitante'],
  },
  contatoAutorizaTerceiro: {
    rotulo: 'Titular autoriza o terceiro a acompanhar',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  contatoTitularAcompanhaProtocolo: {
    rotulo: 'Titular confirma que acompanhará — protocolo',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  contatoTitularAcompanhaOs: {
    rotulo: 'Titular confirma que acompanhará — O.S',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },

  pagamentoCliente: {
    rotulo: 'Pagamento — cliente paga',
    texto: 'CLIENTE PAGARA {formaPagFrase}',
    obrigatorios: [],
  },
  pagamentoClienteSemValor: {
    rotulo: 'Pagamento — cliente paga (valor sem tabela)',
    texto: 'CLIENTE PAGARA {valor} {formaPagFrase}',
    obrigatorios: [],
  },
  pagamentoSolicitouPagar: {
    rotulo: 'Pagamento — solicitante pediu para pagar',
    texto: '{solicitante} SOLICITOU PAGAR {formaPagFrase}',
    obrigatorios: ['solicitante'],
  },
  pagamentoSolicitouPagarSemValor: {
    rotulo: 'Pagamento — solicitante pediu para pagar (valor sem tabela)',
    texto: '{solicitante} SOLICITOU PAGAR {valor} {formaPagFrase}',
    obrigatorios: ['solicitante'],
  },
  pagamentoEscolheuPagar: {
    rotulo: 'Pagamento — solicitante escolheu forma',
    texto: '{solicitante} ESCOLHEU PAGAR {formaPagFrase}',
    obrigatorios: ['solicitante'],
  },
  pagamentoEscolheuPagarSemValor: {
    rotulo: 'Pagamento — solicitante escolheu forma (valor sem tabela)',
    texto: '{solicitante} ESCOLHEU PAGAR {valor} {formaPagFrase}',
    obrigatorios: ['solicitante'],
  },

  osAberturaTitular: {
    rotulo: 'Abertura da O.S — titular',
    texto:
      '{cliente} SOLICITOU POR {canal} ({contato}) MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: {ambienteAtual}, E REINSTALAR EM: {ambienteNovo}. MOTIVO: {motivo}.',
    obrigatorios: ['cliente'],
  },
  osAberturaPj: {
    rotulo: 'Abertura da O.S — pessoa jurídica',
    texto:
      '{solicitante} ({cargo}) SOLICITOU POR {canal} ({contato}) MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: {ambienteAtual}, E REINSTALAR EM: {ambienteNovo}. MOTIVO: {motivo}.',
    obrigatorios: ['solicitante'],
  },
  osAberturaTerceiro: {
    rotulo: 'Abertura da O.S — terceiro',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) SOLICITANDO MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: {ambienteAtual}, E REINSTALAR EM: {ambienteNovo}. MOTIVO: {motivo}.',
    obrigatorios: ['solicitante', 'cliente'],
  },
  osAgendada: {
    rotulo: 'Fecho da O.S — visita agendada',
    texto: 'AGENDADA PARA {dataVisita} AS {horaVisita} HORAS.',
    obrigatorios: ['dataVisita'],
  },
  osTitularAusente: {
    rotulo: 'Fecho da O.S — titular não estará presente',
    texto:
      '{cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },

  indicacaoTecnica: {
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TECNICO: EFETUAR A MUDANCA DE PONTO DOS EQUIPAMENTOS PARA O LOCAL ESPECIFICADO PELO CLIENTE, CASO SEJA POSSIVEL REAPROVEITAR CABO DROP USANDO A SOBRA E RECONECTORIZAR. SE NAO DER TAMANHO, SERA NECESSARIO A PASSAGEM DE UM NOVO CABEAMENTO PARA CONCLUIR O SERVICO. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGENCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DA CLIENTE E APRESENTAR VARIACOES SE HOUVER. ATUALIZAR FIRMWARE DO ROTEADOR SE NECESSARIO. TEMPO ESTIMADO: 60 MIN.',
    obrigatorios: [],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'MAN MUD PONTO INTERNO {clienteCompleto} PROT:{protocolo} {formaPag} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
