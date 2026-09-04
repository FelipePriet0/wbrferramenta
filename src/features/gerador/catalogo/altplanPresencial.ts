/**
 * Catálogo de frases do modelo `altplan-presencial`.
 *
 * Texto extraído byte a byte de `render/altplanPresencial.ts`. Duas fontes:
 * os literais do próprio render e as constantes de `render/frases.ts`.
 *
 * Sobre o `frases.ts`: ele guarda cinco frases compartilhadas entre modelos de
 * alteração de plano, e é justamente onde mora um vazamento de branding — a
 * `opcaoRemota` cita o nome do provedor no meio da frase (APP "WBR" na MZnet,
 * APP "WBR" na WBR), e por causa disso o arquivo diverge entre os dois repos.
 * Trazer essas frases para o catálogo é o que permite o `render/*.ts` ficar
 * idêntico nos dois lados.
 *
 * A frase compartilhada é COPIADA para cada catálogo que a usa, não referenciada.
 * É a decisão de escopo: editar aqui não altera outro modelo. A tela avisa em
 * quantos outros o mesmo texto existe (ver `contarTambemEm`).
 *
 * Nomes usados:
 *   {titular}      1º nome do assinante        {solicitante} 1º nome de quem veio
 *   {parente}      grau de parentesco          {canal}, {contato}
 *   {motivo}       o que o cliente alegou      {sinal} estado da ONU
 *   {planoAtual}, {planoEscolhido}, {roteador}, {dataContrato}, {protocolo}
 *   {ligData}/{ligHora}      data-hora do acordo por telefone
 *   {protData}/{protHora}    data-hora do protocolo
 *   {atendData}/{atendHora}  data-hora da validação presencial
 */
import type { Catalogo } from './tipos';

export const ALTPLAN_PRESENCIAL: Catalogo = {
  aberturaTitular: {
    rotulo: 'Abertura — titular veio à loja',
    texto: '{titular} COMPARECEU À LOJA E SOLICITOU ALTERAÇÃO DE PLANO.',
    obrigatorios: ['titular'],
  },
  aberturaTerceiro: {
    rotulo: 'Abertura — terceiro veio à loja',
    texto:
      '{solicitante} ({parente} DE {titular}) COMPARECEU À LOJA E SOLICITOU ALTERAÇÃO DE PLANO.',
    obrigatorios: ['solicitante', 'titular'],
  },

  statusOnu: {
    rotulo: 'Status remoto da ONU',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU {sinal}',
    obrigatorios: ['sinal'],
  },
  semOscilacao: {
    rotulo: 'Complemento do status quando há sinal',
    texto: 'SEM OSCILAÇÃO.',
    obrigatorios: [],
  },

  motivoCliente: {
    rotulo: 'Motivo alegado pelo cliente',
    texto: 'QUESTIONADO, CLIENTE DISSE QUE "{motivo}".',
    obrigatorios: ['motivo'],
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
  },

  acessoTerceiro: {
    rotulo: 'Acesso aos apps — atendimento a terceiro',
    texto: 'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE.',
    obrigatorios: [],
  },
  acessoTitular: {
    rotulo: 'Acesso aos apps — atendimento ao titular',
    texto: 'APLICATIVOS DISPONÍVEIS PARA SMARTPHONE OU SMART-TV QUE POSSUA COMPATIBILIDADE.',
    obrigatorios: [],
  },

  roteadorCompativel: {
    rotulo: 'Compatibilidade do roteador atual',
    texto:
      'INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO ({roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA.',
    obrigatorios: ['roteador'],
  },

  // --- as cinco que vinham de render/frases.ts ---
  opcoesIntro: {
    rotulo: 'Introdução das opções de upgrade',
    texto: 'DISPONIBILIZEI AO CLIENTE 2 OPÇÕES PARA PROSSEGUIR COM O UPGRADE:',
    obrigatorios: [],
  },
  opcaoVisitaPaga: {
    rotulo: 'Opção 1 — visita presencial paga',
    texto:
      '1° - AGENDAR UMA VISITA PRESENCIAL PARA REALIZAR TESTES, INSTRUÇÕES DO USO DE INTERNET, INFORMAÇÕES SOBRE COBERTURA WI-FI, REDE ELÉTRICA ETC; VISITA ESTA COM O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.',
    obrigatorios: [],
  },
  opcaoRemota: {
    // ⚠️ Cita o nome do provedor. É esta frase que faz o frases.ts divergir
    // entre MZnet e WBR. No sync para a WBR, "MZNET" vira "WBR".
    rotulo: 'Opção 2 — alteração remota e assinatura digital',
    texto:
      '2° - REALIZAR A ALTERAÇÃO DE PLANO REMOTAMENTE (DENTRO DO PRAZO DE ATÉ 72 HORAS) E APÓS CONCLUÍDO A ALTERAÇÃO O CLIENTE REALIZAR A ASSINATURA DO CONTRATO DIGITAL POR MEIO DO APP "WBR" OU ATÉ MESMO COMPARECER DIRETAMENTE NA EMPRESA E REALIZAR ESTA ASSINATURA PRESENCIAL.',
    obrigatorios: [],
  },
  semCustos: {
    rotulo: 'Procedimento sem custos',
    texto: 'PROCEDIMENTO ESTE QUE NÃO GERA CUSTOS AO ASSINANTE.',
    obrigatorios: [],
  },
  beneficiosAposAssinatura: {
    rotulo: 'Benefícios liberados após assinatura',
    texto: 'CIENTE QUE OS BENEFÍCIOS SÃO LIBERADOS APÓS ASSINATURA DO CONTRATO.',
    obrigatorios: [],
  },

  aceiteTerceiro: {
    rotulo: 'Aceite — titular autoriza por telefone',
    texto:
      'POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM {titular} (ASSINANTE) POR {canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR {canal} ({contato}) SOB PROTOCOLO {protocolo} EM {ligData} ÀS {ligHora}. {titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES.',
    obrigatorios: ['titular', 'protocolo'],
  },
  aceiteTitular: {
    rotulo: 'Aceite — validação presencial do titular',
    texto:
      '{titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA PRESENCIALMENTE DIA {atendData} ÀS {atendHora} HRS',
    obrigatorios: ['titular', 'atendData'],
  },

  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE NÃO TEM DÚVIDAS.',
    obrigatorios: [],
  },

  osTerceiro: {
    rotulo: 'Corpo da O.S — terceiro na loja',
    texto:
      '{solicitante} ({parente} DE {titular}) COMPARECEU NA LOJA E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {solicitante} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM {titular} (ASSINANTE) POR {canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR {canal} ({contato}) SOB PROTOCOLO Nº{protocolo} EM {ligData} ÀS {ligHora} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'protocolo'],
  },
  osTitular: {
    rotulo: 'Corpo da O.S — titular na loja',
    texto:
      '{titular} COMPARECEU À LOJA E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {titular} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº{protocolo} EM {protData} ÀS {protHora} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'protocolo'],
  },
};
