/**
 * Catálogo de frases do modelo `manut-ocas-fibra`.
 *
 * Dano ocasionado na fibra externa. Quatro tipos de solicitação.
 *
 * EXTRAÇÃO PARCIAL. O bloco de explicação do custo do drop vem de
 * `nucleoCustoDrop`, um helper COMPARTILHADO entre quatro modelos
 * (`helpers.ts`). Extraí-lo aqui significaria ou duplicá-lo em quatro catálogos
 * ou criar uma frase de escopo global — e nenhuma das duas cabe na decisão de
 * "um modelo por vez". Fica no código e aparece cinza e travado na tela, que é
 * exatamente o que a estratégia de extração parcial prevê.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome do titular · {clienteCompleto}
 *        {solicitante} 1º nome de quem ligou · {solicitanteCompleto} {parente}
 *        {canal} {contato} {contatoSolicitante} {onu} {motivo}
 *        {formaPag} {formaPagFrase} {dataVisita} {horaVisita}
 */
import type { Catalogo } from './tipos';

export const MANUT_OCAS_FIBRA: Catalogo = {
  aberturaTitular: {
    rotulo: 'Abertura — titular ligou',
    texto: '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['cliente'],
  },
  aberturaTerceiro: {
    rotulo: 'Abertura — terceiro ligou',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['solicitante', 'cliente'],
  },
  statusOnu: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E {onu} SEM SINAL.',
    obrigatorios: ['onu'],
  },

  relatoComSolicitante: {
    rotulo: 'Relato — atendimento a terceiro que se identifica',
    texto:
      'QUESTIONADO, {solicitante} DISSE QUE A {onu} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E {solicitante} DISSE QUE "{motivo}", E FICOU SEM ACESSO A INTERNET.',
    obrigatorios: ['solicitante', 'onu'],
  },
  relatoTerceiro: {
    rotulo: 'Relato — terceiro ligou, titular acompanha',
    texto:
      'QUESTIONADO, DISSE QUE A {onu} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E {solicitante} DISSE QUE "{motivo}", E FICOU SEM ACESSO A INTERNET.',
    obrigatorios: ['solicitante', 'onu'],
  },
  relatoTitular: {
    rotulo: 'Relato — titular ligou',
    texto:
      'QUESTIONADO, DISSE QUE A {onu} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E {cliente} DISSE QUE "{motivo}", E FICOU SEM ACESSO A INTERNET.',
    obrigatorios: ['cliente', 'onu'],
  },
  relatoTitularSemAcesso: {
    rotulo: 'Relato — titular ligou e acompanha',
    texto:
      'QUESTIONADO, DISSE QUE A {onu} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E {cliente} DISSE QUE "{motivo}".',
    obrigatorios: ['cliente', 'onu'],
  },

  verificacaoApagada: {
    rotulo: 'Verificação remota — equipamento apagado',
    texto: 'REMOTAMENTE VERIFIQUEI QUE {onu} ESTA DESCONECTADO/APAGADA.',
    obrigatorios: ['onu'],
  },
  verificacaoDesconectado: {
    rotulo: 'Verificação remota — equipamento desconectado',
    texto: 'REMOTAMENTE VERIFIQUEI QUE {onu} ESTA DESCONECTADO.',
    obrigatorios: ['onu'],
  },

  custoFormasPagamento: {
    rotulo: 'Formas de pagamento do custo',
    texto: 'VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.',
    obrigatorios: [],
  },
  blocoCustoPadrao: {
    rotulo: 'Custo da visita quando não há valor de drop informado',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA. ESTA VISITA TECNICA POSSUI O CUSTO DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
    obrigatorios: [],
  },

  aceiteTerceiroAutorizado: {
    rotulo: 'Aceite — titular autoriza o terceiro a acompanhar',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. {cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA E FARA O PAGAMENTO {formaPagFrase}. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAcompanha: {
    rotulo: 'Aceite — terceiro ligou, titular acompanha',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. {cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA E FARA O PAGAMENTO {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAusente: {
    // Mesma sentença no Protocolo e na O.S — o legado repetia o texto nos dois.
    // Uma chave só: editar aqui muda os dois, que é o comportamento esperado.
    rotulo: 'Aceite — titular não estará presente (protocolo e O.S)',
    texto:
      '{cliente} CONCORDOU COM A VISITA E FARA O PAGAMENTO COM {formaPag}. {cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularSozinho: {
    rotulo: 'Aceite — titular ligou e acompanha',
    texto:
      '{cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA E FARA O PAGAMENTO {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },

  osTerceiroAutorizado: {
    rotulo: 'Corpo da O.S — terceiro ligou e acompanha',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "{motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E {onu} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS.',
    obrigatorios: ['cliente', 'onu'],
  },
  osFechoTerceiroAutorizado: {
    rotulo: 'Fecho da O.S — terceiro ligou e acompanha',
    texto:
      '{solicitante} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  osTerceiroTitularAcompanha: {
    rotulo: 'Corpo da O.S — terceiro ligou, titular acompanha',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "{motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E {onu} APAGADA.',
    obrigatorios: ['cliente', 'onu'],
  },
  osFechoTerceiroTitularAcompanha: {
    rotulo: 'Fecho da O.S — terceiro ligou, titular acompanha',
    texto:
      '{solicitante} CONCORDOU COM A VISITA E FARA O PAGAMENTO {formaPagFrase}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  osTitular: {
    rotulo: 'Corpo da O.S — titular ligou',
    texto:
      '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "{motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E {onu} APAGADA.',
    obrigatorios: ['cliente', 'onu'],
  },
  osTitularSozinho: {
    rotulo: 'Corpo da O.S — titular ligou e acompanha',
    texto:
      '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "{motivo}", E FICOU SEM ACESSO A INTERNET. PERGUNTEI SOBRE A {onu}, E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E {onu} APAGADA.',
    obrigatorios: ['cliente', 'onu'],
  },
  osFechoTitularSozinho: {
    rotulo: 'Fecho da O.S — titular ligou e acompanha',
    texto: '{cliente} AUTORIZOU VISITA E PAGARA {formaPagFrase} NO ATO. VISITA AGENDADA PARA {dataVisita} AS {horaVisita} HRS.',
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
    texto: 'MAN {alarme} (OCASIONADO) {clienteCompleto} PROT:{protocolo} {formaPag} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
