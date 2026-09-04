/**
 * Catálogo de frases do modelo `altplan-sem-troca-visita-paga`.
 *
 * Irmão do `sem-troca-visita-isenta`, com a visita custando R$50,00. O porte
 * deste veio do bundle com os nomes minificados preservados (`IO`, `LO`, `FO`,
 * `JVe`, `BAR`), então o render é menos legível que os outros — razão a mais
 * para o texto sair de lá.
 *
 * ⚠️ TEM TRECHOS PROTEGIDOS — modo "ofertado" por regex, igual ao altplanRemoto.
 * ⚠️ A indicação técnica cita "NOME DO CLIENTE_WBR" (vira "_WBR" na WBR) e
 * guarda espaços DUPLOS internos que vieram do legado — estão preservados no
 * texto porque ali são conteúdo, não recuo de diagramação.
 *
 * Nomes: {titular} {solicitante} {solicitanteCompleto} {autorizado} {parente}
 *        {canal} {contato} {contatoSolicitante} {motivo} {sinal} {roteador}
 *        {planoAtual} {planoEscolhido} {dataContrato} {dataVisita} {horaVisita}
 *        {formaPag} forma crua · {formaPagFrase} regência pronta · {pessoa}
 */
import type { Catalogo } from './tipos';

const PROTEGIDO_ABERTURA = [
  'ENTROU EM CONTATO VIA',
  'SOLICITANDO ALTERAÇÃO DE PLANO.',
] as const;
const PROTEGIDO_OS_TITULAR = [
  'SOLICITOU POR',
  'ALTERAÇÃO DO PLANO DE INTERNET:',
  'PLANO ESCOLHIDO:',
] as const;
const PROTEGIDO_OS_TERCEIRO = [
  'ENTROU EM CONTATO VIA',
  'E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET:',
  'PLANO ESCOLHIDO:',
] as const;

export const ALTPLAN_SEM_TROCA_VISITA_PAGA: Catalogo = {
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

  desejaVisitaPaga: {
    rotulo: 'Cliente quer visita técnica — com custo de R$50,00',
    texto:
      'INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO ({roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, {pessoa} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE {pessoa} POSSA TER, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO, ESTE VALOR A SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.',
    obrigatorios: ['pessoa', 'roteador'],
  },

  aceiteTitularAutorizaTerceiro: {
    rotulo: 'Aceite — titular não estará presente, autoriza terceiro',
    texto:
      '{titular} CONCORDOU COM A VISITA E DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU {autorizado} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM {formaPag}, AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularAcompanha: {
    rotulo: 'Aceite — terceiro pediu, titular acompanha',
    texto:
      'POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. {titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM {formaPag}, AGENDADA PARA O DIA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },
  aceiteTerceiroAutorizado: {
    rotulo: 'Aceite — titular autoriza o terceiro a acompanhar',
    texto:
      'POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. {titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM {formaPag}, AGENDADA PARA O DIA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },
  aceiteTitularSozinho: {
    rotulo: 'Aceite — titular pediu e acompanha',
    texto:
      '{titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM {formaPag}, E FOI AGENDADA PARA O DIA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'dataVisita', 'horaVisita'],
  },

  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },

  indicacaoTecnica: {
    // ⚠️ Cita o provedor no padrão de nome de rede. Os espaços duplos após
    // "ESCOLHIDO." e "CONTRATADA." vieram do legado e fazem parte do texto.
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO.  FAZER TESTE DA BANDA CONTRATADA.  PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.',
    obrigatorios: [],
  },

  osTitularAutorizaTerceiro: {
    rotulo: 'Corpo da O.S — titular autoriza terceiro',
    texto:
      '{titular} SOLICITOU POR {canal} ({contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {titular} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. {titular} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU {autorizado} ({parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO {formaPagFrase}. AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'dataVisita'],
    trechosProtegidos: PROTEGIDO_OS_TITULAR,
  },
  osTerceiroTitularAcompanha: {
    rotulo: 'Corpo da O.S — terceiro pediu, titular acompanha',
    texto:
      '{solicitante} ({parente} DE {titular}) ENTROU EM CONTATO VIA {canal} ({contatoSolicitante}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {solicitante} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO {formaPagFrase}. AGENDADA PARA O DIA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'dataVisita'],
    trechosProtegidos: PROTEGIDO_OS_TERCEIRO,
  },
  osTerceiroAutorizado: {
    rotulo: 'Corpo da O.S — terceiro pediu e acompanha',
    texto:
      '{solicitante} ({parente} DE {titular}) ENTROU EM CONTATO VIA {canal} ({contatoSolicitante}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {solicitante} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR {canal} ({contato}) COM {titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO {formaPagFrase}. AGENDADA PARA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'dataVisita'],
    trechosProtegidos: PROTEGIDO_OS_TERCEIRO,
  },
  osTitular: {
    rotulo: 'Corpo da O.S — titular pediu e acompanha',
    texto:
      '{titular} SOLICITOU POR {canal} ({contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {titular} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO {formaPagFrase}. AGENDADA PARA {dataVisita} ÀS {horaVisita} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'dataVisita'],
    trechosProtegidos: PROTEGIDO_OS_TITULAR,
  },

  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'ALT PLANO {clienteCompleto} PROT:{protocolo} {formaPag}{operador} - {bairro}',
    obrigatorios: ['clienteCompleto', 'protocolo'],
  },
};
