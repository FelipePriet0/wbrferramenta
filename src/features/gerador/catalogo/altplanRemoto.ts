/**
 * Catálogo de frases do modelo `altplan-remoto`.
 *
 * ⚠️ ESTE MODELO TEM TRECHOS PROTEGIDOS. Ele produz uma segunda versão do texto
 * — o modo "ofertado", quando a empresa oferece o upgrade em vez de o cliente
 * pedir — reescrevendo o texto já gerado com regex:
 *
 *   "{quem} ENTROU EM CONTATO VIA {canal} SOLICITANDO ALTERAÇÃO DE PLANO."
 *        vira  "OFERTEI A {quem} VIA {canal} ALTERAÇÃO DE PLANO."
 *   a linha do motivo do cliente é REMOVIDA
 *   "PLANO SOLICITADO:"  vira  "PLANO OFERTADO:"
 *   "PLANO ESCOLHIDO:"   vira  "PLANO OFERTADO:"
 *
 * Se quem edita apagar uma dessas expressões, a reescrita simplesmente não
 * acontece e a O.S sai dizendo que o cliente pediu quando na verdade nós
 * ofertamos — sem erro, sem aviso. E o teste de diff não pega, porque as
 * fixtures usam o texto padrão. Daí o `trechosProtegidos`: a publicação é
 * recusada e a tela mostra o que não pode sumir.
 *
 * Nomes usados:
 *   {titular} 1º nome do assinante · {solicitante} quem falou · {parente} · {cargo}
 *   {canal} {contato} {contatoSolicitante} {motivo} {sinal} {roteador}
 *   {planoAtual} {planoEscolhido} {dataContrato} {protocolo}
 *   {ligData}/{ligHora} acordo · {protData}/{protHora} protocolo
 *   {dataAtual}/{horaAtual} momento em que o texto é gerado
 */
import type { Catalogo } from './tipos';

/** As expressões que `ofertadoProtocolo`/`ofertadoOS` procuram no Protocolo. */
const PROTEGIDO_ABERTURA_POR = ['ENTROU EM CONTATO POR', 'SOLICITANDO ALTERAÇÃO DE PLANO.'] as const;
const PROTEGIDO_ABERTURA_VIA = ['ENTROU EM CONTATO VIA', 'SOLICITANDO ALTERAÇÃO DE PLANO.'] as const;
/** As expressões que `ofertadoOS` procura no corpo da O.S. */
const PROTEGIDO_OS = [
  'SOLICITOU POR',
  'ALTERAÇÃO DO PLANO DE INTERNET:',
  'PLANO ESCOLHIDO:',
] as const;

export const ALTPLAN_REMOTO: Catalogo = {
  aberturaTerceiro: {
    rotulo: 'Abertura — terceiro ligou',
    texto:
      '{solicitante} ({parente} DE {titular}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) SOLICITANDO ALTERAÇÃO DE PLANO.',
    obrigatorios: ['solicitante', 'titular'],
    trechosProtegidos: PROTEGIDO_ABERTURA_POR,
  },
  aberturaPj: {
    rotulo: 'Abertura — pessoa jurídica',
    texto:
      '{solicitante} ({cargo}) ENTROU EM CONTATO VIA {canal} ({contato}) SOLICITANDO ALTERAÇÃO DE PLANO.',
    obrigatorios: ['solicitante'],
    trechosProtegidos: PROTEGIDO_ABERTURA_VIA,
  },
  aberturaTitular: {
    rotulo: 'Abertura — titular ligou',
    texto:
      '{titular} ENTROU EM CONTATO VIA {canal} ({contato}) SOLICITANDO ALTERAÇÃO DE PLANO.',
    obrigatorios: ['titular'],
    trechosProtegidos: PROTEGIDO_ABERTURA_VIA,
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
    // O modo ofertado REMOVE esta linha inteira — sem cliente pedindo, não há
    // motivo a registrar. A remoção casa por este começo.
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
    // Vira "PLANO OFERTADO:" no modo ofertado.
    trechosProtegidos: ['PLANO SOLICITADO:'],
  },

  acesso: {
    rotulo: 'Acesso aos apps',
    texto: 'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE.',
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
    // ⚠️ Cita o nome do provedor — é esta frase que faz o render/frases.ts
    // divergir entre MZnet e WBR. No sync para a WBR, "MZNET" vira "WBR".
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

  autorizacaoTitular: {
    rotulo: 'Autorização do titular por telefone',
    texto:
      'POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM {titular} (ASSINANTE) POR {canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR {canal} ({contato}) SOB PROTOCOLO Nº{protocolo} EM {ligData} ÀS {ligHora} HRS.',
    obrigatorios: ['titular', 'protocolo'],
  },
  aceiteRemoto: {
    rotulo: 'Aceite dos termos — sem data de validação',
    texto:
      '{titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES.',
    obrigatorios: ['titular'],
  },
  aceiteRemotoValidado: {
    rotulo: 'Aceite dos termos — com data da validação',
    texto:
      '{pessoa} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA POR {canal} ({contato}) DIA {ligData} ÀS {ligHora} HRS.',
    obrigatorios: ['pessoa', 'ligData'],
  },

  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE NÃO TEM DÚVIDAS',
    obrigatorios: [],
  },

  // --- bloco de encerramento da O.S (execução remota) ---
  encExecutada: {
    rotulo: 'Encerramento — alteração executada',
    texto: 'ALTERAÇÃO DE PLANO EXECUTADA REMOTAMENTE COM SUCESSO.',
    obrigatorios: [],
  },
  encAssinatura: {
    rotulo: 'Encerramento — assinatura em anexo',
    texto: 'ASSINATURA DIGITAL + SELFIE EM ANEXO.',
    obrigatorios: [],
  },
  encSemIntervencao: {
    rotulo: 'Encerramento — sem intervenção técnica',
    texto:
      'NÃO HOUVE INTERVENÇÃO TÉCNICA DEVIDO O ROTEADOR EM COMODATO SER COMPATÍVEL AO PLANO ACORDADO ({roteador}).',
    obrigatorios: ['roteador'],
  },
  encSemDuvidas: {
    rotulo: 'Encerramento — cliente sem dúvidas',
    texto: 'CLIENTE SEM DÚVIDAS.',
    obrigatorios: [],
  },
  encDataHora: {
    rotulo: 'Encerramento — data e hora',
    texto: 'DATA/HORA DO ENCERRAMENTO: {dataAtual} ÀS {horaAtual}HRS',
    obrigatorios: ['dataAtual', 'horaAtual'],
  },

  // --- corpo da O.S ---
  osTerceiro: {
    rotulo: 'Corpo da O.S — terceiro solicitou',
    texto:
      '{solicitante} ({parente} DE {titular}) SOLICITOU POR {canal} ({contatoSolicitante}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {solicitante} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM {titular} (ASSINANTE) POR {canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR {canal} ({contato}) SOB PROTOCOLO Nº{protocolo} EM {ligData} ÀS {ligHora} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'protocolo'],
    trechosProtegidos: PROTEGIDO_OS,
  },
  osPj: {
    rotulo: 'Corpo da O.S — pessoa jurídica',
    texto:
      '{solicitante} ({cargo}) SOLICITOU POR {canal} ({contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {solicitante} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº{protocolo} EM {protData} ÀS {protHora} HRS.',
    obrigatorios: ['solicitante', 'planoEscolhido', 'protocolo'],
    trechosProtegidos: PROTEGIDO_OS,
  },
  osTitular: {
    rotulo: 'Corpo da O.S — titular solicitou',
    texto:
      '{titular} SOLICITOU POR {canal} ({contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {planoAtual}. PLANO ESCOLHIDO: {planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {titular} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº{protocolo} EM {protData} ÀS {protHora} HRS.',
    obrigatorios: ['titular', 'planoEscolhido', 'protocolo'],
    trechosProtegidos: PROTEGIDO_OS,
  },
};
