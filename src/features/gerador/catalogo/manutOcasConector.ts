/**
 * Catálogo de frases do modelo `manut-ocas-conector`.
 *
 * Dano ocasionado em conector/fibra interna. Quatro tipos de solicitação.
 * Os corpos da O.S compartilham a mesma abertura e a mesma explicação do dano —
 * extraí como peças e a montagem ficou no render.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome · {clienteCompleto} · {solicitante}
 *        {solicitanteCompleto} {parente} {canal} {contato} {contatoSolicitante}
 *        {onu} {motivo} {formaPag} {formaPagFrase} {dataVisita} {horaVisita}
 *        {protocolo} {bairro} {tecnico} {alarme} {pessoa}
 */
import type { Catalogo } from './tipos';

export const MANUT_OCAS_CONECTOR: Catalogo = {
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
    rotulo: 'Relato — terceiro se identifica',
    texto:
      'QUESTIONADO, {solicitante} DISSE QUE A {onu} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E {solicitante} DISSE QUE "{motivo}", E FICOU SEM ACESSO A INTERNET.',
    obrigatorios: ['solicitante', 'onu'],
  },
  relatoSemSolicitante: {
    rotulo: 'Relato — sem identificar quem falou',
    texto:
      'QUESTIONADO, DISSE QUE A {onu} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E {pessoa} DISSE QUE "{motivo}", E FICOU SEM ACESSO A INTERNET.',
    obrigatorios: ['pessoa', 'onu'],
  },
  verificacaoRemota: {
    rotulo: 'Verificação remota do equipamento',
    texto: 'REMOTAMENTE VERIFIQUEI QUE {onu} ESTA DESCONECTADO/APAGADA.',
    obrigatorios: ['onu'],
  },
  perguntaIntervencao: {
    rotulo: 'Pergunta sobre intervenção na instalação',
    texto:
      'PERGUNTEI A {solicitante} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.',
    obrigatorios: ['solicitante'],
  },

  custoVisitaFixo: {
    rotulo: 'Custo da visita — valor fixo',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA. ESTA VISITA TECNICA POSSUI O CUSTO DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
    obrigatorios: [],
  },
  custoVisitaCondicional: {
    rotulo: 'Custo da visita — depende da responsabilidade',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
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
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. {cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAusente: {
    // Mesma sentença no Protocolo e na O.S — uma chave só, como no ocas-fibra.
    rotulo: 'Aceite — titular não estará presente (protocolo e O.S)',
    texto:
      '{cliente} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}. {cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
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

  osAberturaTitular: {
    rotulo: 'Abertura da O.S — titular',
    texto:
      '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "{motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E {onu} APAGADA.',
    obrigatorios: ['cliente', 'onu'],
  },
  osAberturaTerceiro: {
    rotulo: 'Abertura da O.S — terceiro',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "{motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E {onu} APAGADA.',
    obrigatorios: ['solicitante', 'cliente', 'onu'],
  },
  osExplicacaoDano: {
    rotulo: 'Explicação do dano na O.S',
    texto:
      'EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS. INFORMEI A {pessoa} QUE E NECESSARIO VISITA TECNICA PARA REPARO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.',
    obrigatorios: ['pessoa'],
  },
  osFechoTerceiroAutorizado: {
    rotulo: 'Fecho da O.S — terceiro autorizado a acompanhar',
    texto:
      '{solicitante} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  osFechoTitularAcompanha: {
    rotulo: 'Fecho da O.S — titular acompanha',
    texto:
      '{solicitante} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  osFechoTitularSozinho: {
    rotulo: 'Fecho da O.S — titular acompanha sozinho',
    texto:
      '{cliente} CONCORDOU COM OS TERMOS DA VISITA E PAGARA {formaPagFrase}. VISITA AGENDADA PARA {dataVisita} A PARTIR DE {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },

  indicacaoTecnica: {
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TECNICO: ANALISAR ESTRUTURA INTERNA. CASO FOR FIBRA ROMPIDA OU CONECTOR DANIFICADO, CORRIGIR E RESTABELECER CONEXAO. DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIA NA INSTALACAO QUE NAO TIVER PADRAO E COBRAR VISITA MINIMA DE R$50,00. CASO {onu} ESTIVER DANIFICADA INFORMAR VALOR DO EQUIPAMENTO (CUSTO DO EQUIPAMENTO + MAO DE OBRA), CLIENTE CONCORDANDO COM A SUBSTITUICAO DA {onu} ENTRAR EM CONTATO COM RESPONSAVEL DO SUPORTE PARA VERIFICAR FORMA DE PAGAMENTO. ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO: 40 MIN.',
    obrigatorios: ['onu'],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'MAN {alarme} (OCASIONADO) {clienteCompleto} PROT:{protocolo} {formaPag} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
