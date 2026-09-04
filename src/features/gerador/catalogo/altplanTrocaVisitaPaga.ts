/**
 * Catálogo de frases do modelo `altplan-troca-visita-paga`.
 *
 * Último dos seis da Onda 1. Troca o roteador com visita cobrada (R$50,00).
 * Como no irmão isento, o corpo da O.S é montado em partes — cabeçalho,
 * cláusula, custo e fecho — e cada uma é editável separadamente.
 *
 * ⚠️ TEM TRECHOS PROTEGIDOS — modo "ofertado" por regex. Ver altplanRemoto.ts.
 * ⚠️ A indicação técnica cita "NOME DO CLIENTE_WBR" (vira "_WBR" na WBR).
 *
 * Nomes: {titular} {solicitante} {solicitanteCompleto} {autorizado} {parente}
 *        {canal} {contato} {contatoSolicitante} {motivo} {sinal} {roteador}
 *        {planoAtual} {planoEscolhido} {dataContrato} {dataVisita} {horaVisita}
 *        {formaPag} forma crua · {formaPagFrase} regência pronta
 */
import type { Catalogo } from './tipos';

const PROTEGIDO_ABERTURA = [
  'ENTROU EM CONTATO VIA',
  'SOLICITANDO ALTERAÇÃO DE PLANO.',
] as const;

export const ALTPLAN_TROCA_VISITA_PAGA: Catalogo = {
  aberturaTitular: {
    rotulo: 'Abertura — titular ligou',
    texto: '{titular} ENTROU EM CONTATO VIA {canal} ({contato}) SOLICITANDO ALTERAÇÃO DE PLANO.',
    obrigatorios: ['titular'],
    trechosProtegidos: PROTEGIDO_ABERTURA,
  },
  aberturaTerceiro: {
    rotulo: 'Abertura — terceiro ligou',
    texto:
      '{solicitante} ({parente} DE {titular}) ENTROU EM CONTATO VIA {canal} ({contatoSolicitante}) SOLICITANDO ALTERAÇÃO DE PLANO.',
    obrigatorios: ['solicitante', 'titular'],
    trechosProtegidos: PROTEGIDO_ABERTURA,
  },

  statusOnu: {
    rotulo: 'Status remoto da ONU',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU {sinal}',
    obrigatorios: ['sinal'],
  },
  motivoCliente: {
    rotulo: 'Motivo alegado pelo cliente',
    texto: 'QUESTIONADO, CLIENTE DISSE QUE "{motivo}".',
    obrigatorios: ['motivo'],
    trechosProtegidos: ['QUESTIONADO, CLIENTE DISSE QUE "'],
  },
  planoAtual: {
    rotulo: 'Plano atual e equipamento',
    texto:
      'PLANO ATUAL: {planoAtual} CONTRATADO EM {dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: {roteador}',
    obrigatorios: ['planoAtual'],
  },
  planoSolicitado: {
    rotulo: 'Plano solicitado',
    texto: 'PLANO SOLICITADO: {planoEscolhido}',
    obrigatorios: ['planoEscolhido'],
    trechosProtegidos: ['PLANO SOLICITADO:'],
  },
  acesso: {
    rotulo: 'Acesso aos apps',
    texto: 'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE.',
    obrigatorios: [],
  },

  compatNao: {
    rotulo: 'Roteador NÃO é compatível — troca com visita paga',
    texto:
      'INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO ({roteador}) NÃO É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA, E ASSIM SE FAZ NECESSÁRIO O AGENDAMENTO DE VISITA TÉCNICA PARA SUBSTITUIÇÃO DO ROTEADOR PARA UM MODELO COMPATÍVEL COM TAL VELOCIDADE, REALIZAR OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER. ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO, A SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.',
    obrigatorios: ['roteador'],
  },
  compatSim: {
    rotulo: 'Roteador é compatível — troca por versão atualizada, visita paga',
    texto:
      'INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO ({roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA, PORÉM FAREMOS O AGENDAMENTO DE VISITA TÉCNICA PARA INSTALAÇÃO DE UM NOVO ROTEADOR COM VERSÃO ATUALIZADA. APÓS INSTALADO, FAREMOS OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER. ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO, A SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.',
    obrigatorios: ['roteador'],
  },

  aceiteTitularAutorizaTerceiro: {
    rotulo: 'Aceite — titular não estará presente, autoriza terceiro',
    texto:
      '{titular} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS. OPTOU POR REALIZAR O PAGAMENTO {formaPagFrase}, NO ATO. {titular} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU {autorizado} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAcompanha: {
    rotulo: 'Aceite — terceiro pediu, titular acompanha',
    texto:
      'POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. {titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S.',
    obrigatorios: ['titular'],
  },
  aceiteTerceiroAutorizado: {
    rotulo: 'Aceite — titular autoriza o terceiro a acompanhar',
    texto:
      'POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. {titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. PAGAMENTO SERÁ REALIZADO {formaPagFrase}. VISITA AGENDADA PARA O DIA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularSozinho: {
    rotulo: 'Aceite — titular pediu e acompanha',
    texto:
      '{titular} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS. OPTOU POR REALIZAR O PAGAMENTO {formaPagFrase}, NO ATO, E A VISITA TÉCNICA FOI AGENDADA PARA O DIA {dataVisita} ÀS {horaVisita} HRS, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },

  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },

  custoVisita: {
    rotulo: 'Custo da visita e forma de pagamento',
    texto:
      'VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO {formaPagFrase}.',
    obrigatorios: [],
  },
  clausulaRenovacao: {
    rotulo: 'Cláusula de renovação e troca do roteador',
    texto:
      'RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. É NECESSÁRIA VISITA TÉCNICA PARA TROCA DO ROTEADOR WI-FI POR OUTRO COMPATÍVEL COM O NOVO PLANO ESCOLHIDO, TAL EQUIPAMENTO IRÁ SUBSTITUIR O ROTEADOR INSTALADO ANTERIORMENTE E PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO.',
    obrigatorios: [],
  },
  indicacaoTecnica: {
    // ⚠️ Cita o provedor no padrão de nome de rede. Vira "_WBR" na WBR.
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO, FAZER TESTES ANTES E DEPOIS DA TROCA DO ROTEADOR. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), SOLICITAR ESCOLHA DA SENHA, CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.',
    obrigatorios: [],
  },

  osCabecalhoTitular: {
    rotulo: 'Cabeçalho da O.S — titular solicitou',
    texto:
      '{titular} SOLICITOU POR {canal} ({contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}.',
    obrigatorios: ['titular', 'planoEscolhido'],
    trechosProtegidos: ['SOLICITOU POR', 'ALTERAÇÃO DO PLANO DE INTERNET:', 'PLANO ESCOLHIDO:'],
  },
  osCabecalhoTerceiro: {
    rotulo: 'Cabeçalho da O.S — terceiro solicitou',
    texto:
      '{solicitante} ({parente} DE {titular}) ENTROU EM CONTATO VIA {canal} ({contatoSolicitante}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}.',
    obrigatorios: ['titular', 'planoEscolhido'],
    trechosProtegidos: [
      'ENTROU EM CONTATO VIA',
      'E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET:',
      'PLANO ESCOLHIDO:',
    ],
  },

  osFechoTitularAutorizaTerceiro: {
    rotulo: 'Fecho da O.S — titular autoriza terceiro',
    texto:
      '{titular} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU {autorizado} ({parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S.',
    obrigatorios: ['titular'],
  },
  osFechoTitularAcompanha: {
    rotulo: 'Fecho da O.S — titular acompanha',
    texto:
      'POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S.',
    obrigatorios: ['titular'],
  },
  osFechoTerceiroAutorizado: {
    rotulo: 'Fecho da O.S — terceiro autorizado a acompanhar',
    texto:
      'POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S.',
    obrigatorios: ['titular'],
  },

  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'ALT PLANO {clienteCompleto} PROT:{protocolo} {formaPag}{operador} - {bairro}{roteadorSug}',
    obrigatorios: ['clienteCompleto', 'protocolo'],
  },
};
