/**
 * Catálogo de frases do modelo `altplan-sem-troca-visita-isenta`.
 *
 * ⚠️ TEM TRECHOS PROTEGIDOS — o modo "ofertado" reescreve o texto já montado
 * com regex. Ver a explicação longa em `altplanRemoto.ts`; aqui as expressões
 * são as mesmas, com uma diferença: as O.S dos ramos de terceiro começam com
 * "ENTROU EM CONTATO VIA ... E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET:",
 * enquanto as de titular usam "SOLICITOU POR". São regex distintas, então os
 * trechos protegidos também são.
 *
 * ⚠️ SEGUNDO VAZAMENTO DE BRANDING. A indicação técnica manda padronizar o nome
 * da rede como "NOME DO CLIENTE_WBR". É a segunda ocorrência do nome do
 * provedor dentro do conteúdo (a primeira era o APP "WBR" em frases.ts). No
 * sync para a WBR isso vira "_WBR".
 *
 * A indicação técnica está partida em duas frases porque o legado usa espaço
 * DUPLO entre elas no fluxo titular-solicita-titular e simples nos demais.
 * Espaçamento é diagramação: fica no render, não no texto editável.
 *
 * Nomes: {titular} {solicitante} {solicitanteCompleto} {autorizado} {parente}
 *        {canal} {contato} {contatoSolicitante} {motivo} {sinal} {roteador}
 *        {planoAtual} {planoEscolhido} {dataContrato} {dataVisita} {horaVisita}
 *        {pessoa} quem conduz o diálogo no ramo
 */
import type { Catalogo } from './tipos';

const PROTEGIDO_ABERTURA = [
  'ENTROU EM CONTATO VIA',
  'SOLICITANDO ALTERAÇÃO DE PLANO.',
] as const;
/** O.S que começa com "SOLICITOU POR" (ramos de titular). */
const PROTEGIDO_OS_TITULAR = [
  'SOLICITOU POR',
  'ALTERAÇÃO DO PLANO DE INTERNET:',
  'PLANO ESCOLHIDO:',
] as const;
/** O.S que começa com "ENTROU EM CONTATO VIA ... E SOLICITOU" (ramos de terceiro). */
const PROTEGIDO_OS_TERCEIRO = [
  'ENTROU EM CONTATO VIA',
  'E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET:',
  'PLANO ESCOLHIDO:',
] as const;

export const ALTPLAN_SEM_TROCA_VISITA_ISENTA: Catalogo = {
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

  desejaVisitaIsenta: {
    rotulo: 'Cliente quer visita técnica isenta',
    texto:
      'INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO ({roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, {pessoa} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE {pessoa} POSSA TER, NO QUAL ESSA VISITA É ISENTA DE CUSTOS.',
    obrigatorios: ['pessoa', 'roteador'],
  },

  aceiteTitularAutorizaTerceiro: {
    rotulo: 'Aceite — titular não estará presente, autoriza terceiro',
    texto:
      '{titular} CONCORDOU COM A VISITA E DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU {autorizado} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA ISENTA DE CUSTOS AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAcompanha: {
    rotulo: 'Aceite — terceiro pediu, titular acompanha',
    texto:
      'POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. {titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA PARA O DIA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },
  aceiteTerceiroAutorizado: {
    rotulo: 'Aceite — titular autoriza o terceiro a acompanhar',
    texto:
      'POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. {titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA AGENDADA PARA O DIA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularSozinho: {
    rotulo: 'Aceite — titular pediu e acompanha',
    texto:
      '{titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA AGENDADA PARA O DIA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },

  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },

  indicacaoTecnicaInicio: {
    rotulo: 'Indicação técnica — abertura',
    texto: 'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. FAZER TESTE DA BANDA CONTRATADA.',
    obrigatorios: [],
  },
  indicacaoTecnicaResto: {
    // ⚠️ Cita o nome do provedor no padrão de nome de rede. Vira "_WBR" na WBR.
    rotulo: 'Indicação técnica — procedimentos do técnico',
    texto:
      'PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.',
    obrigatorios: [],
  },

  osTitularAutorizaTerceiro: {
    rotulo: 'Corpo da O.S — titular autoriza terceiro',
    texto:
      '{titular} SOLICITOU POR {canal} ({contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {titular} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. {titular} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU {autorizado} ({parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'dataVisita'],
    trechosProtegidos: PROTEGIDO_OS_TITULAR,
  },
  osTerceiroTitularAcompanha: {
    rotulo: 'Corpo da O.S — terceiro pediu, titular acompanha',
    texto:
      '{solicitante} ({parente} DE {titular}) ENTROU EM CONTATO VIA {canal} ({contatoSolicitante}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {solicitante} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA PARA O DIA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'dataVisita'],
    trechosProtegidos: PROTEGIDO_OS_TERCEIRO,
  },
  osTerceiroAutorizado: {
    rotulo: 'Corpo da O.S — terceiro pediu e acompanha',
    texto:
      '{solicitante} ({parente} DE {titular}) ENTROU EM CONTATO VIA {canal} ({contatoSolicitante}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {solicitante} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'dataVisita'],
    trechosProtegidos: PROTEGIDO_OS_TERCEIRO,
  },
  osTitular: {
    rotulo: 'Corpo da O.S — titular pediu e acompanha',
    texto:
      '{titular} SOLICITOU POR {canal} ({contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {titular} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'dataVisita'],
    trechosProtegidos: PROTEGIDO_OS_TITULAR,
  },

  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'ALT PLANO {clienteCompleto} PROT:{protocolo} ISENTO{operador} - {bairro}',
    obrigatorios: ['clienteCompleto', 'protocolo'],
  },
};
