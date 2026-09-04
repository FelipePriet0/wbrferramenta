/**
 * Catálogo de frases do modelo `manut-fibra-externa`.
 *
 * Rompimento de cabo externo na rede de fibra. Cinco tipos de solicitação.
 *
 * Atenção ao padrão que já me pegou duas vezes: quando o legado usa a MESMA
 * sentença no Protocolo e na O.S, aqui existe UMA chave só. A guarda "não
 * repete o mesmo texto em duas chaves" reprova o contrário.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome · {clienteCompleto} · {solicitante}
 *        {solicitanteCompleto} {parente} {cargo} {canal} {contato}
 *        {contatoSolicitante} {onu} 1ª palavra · {equipamento} por extenso
 *        {motivo} {formaPag} {formaPagFrase} {dataVisita} {horaVisita}
 *        {protocolo} {bairro} {tecnico} {alarme} {pessoa}
 */
import type { Catalogo } from './tipos';

export const MANUT_FIBRA_EXTERNA: Catalogo = {
  aberturaTitular: {
    rotulo: 'Abertura — titular ligou',
    texto: '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['cliente'],
  },
  aberturaPj: {
    rotulo: 'Abertura — pessoa jurídica',
    texto:
      '{solicitante} ({cargo}) ENTROU EM CONTATO POR {canal} ({contato}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['solicitante'],
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
  relatoSimples: {
    rotulo: 'Relato — só o motivo',
    texto: 'QUESTIONADO, DISSE QUE "{motivo}".',
    obrigatorios: [],
  },
  perguntaLuzVermelha: {
    rotulo: 'Confirmação da luz vermelha',
    texto: 'PERGUNTEI SOBRE A {equipamento} E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA.',
    obrigatorios: ['equipamento'],
  },
  verificacaoEquipamento: {
    rotulo: 'Verificação remota — equipamento por extenso',
    texto: 'REMOTAMENTE VERIFIQUEI QUE {equipamento} ESTA DESCONECTADO/APAGADA.',
    obrigatorios: ['equipamento'],
  },
  verificacaoOnu: {
    rotulo: 'Verificação remota — ONU',
    texto: 'REMOTAMENTE VERIFIQUEI QUE {onu} ESTA DESCONECTADO/APAGADA.',
    obrigatorios: ['onu'],
  },
  orientacaoReinicio: {
    rotulo: 'Orientação de reinício dos equipamentos',
    texto:
      'ORIENTEI {cliente} A DESCONECTAR EQUIPAMENTOS ({equipamento}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.',
    obrigatorios: ['cliente'],
  },
  perguntaIntervencao: {
    rotulo: 'Pergunta sobre intervenção na instalação',
    texto:
      'PERGUNTEI A {pessoa} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.',
    obrigatorios: ['pessoa'],
  },

  custoVisitaCondicional: {
    rotulo: 'Custo da visita — depende da responsabilidade',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
    obrigatorios: [],
  },
  trocaDropSemCusto: {
    rotulo: 'Troca do cabo drop sem custo ao cliente',
    texto:
      'INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. {pessoa} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.',
    obrigatorios: ['pessoa'],
  },

  aceitePjPresencial: {
    rotulo: 'Aceite — responsável da empresa acompanha',
    texto:
      '{solicitante} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['solicitante', 'dataVisita'],
  },
  aceiteTerceiroAutorizado: {
    rotulo: 'Aceite — titular autoriza o terceiro a acompanhar',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. {cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA {formaPagFrase}. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  aceiteTitularAcompanha: {
    rotulo: 'Aceite — terceiro ligou, titular acompanha',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. {cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  aceiteTitularAusente: {
    // Mesma sentença no Protocolo e na O.S — uma chave só.
    rotulo: 'Aceite — titular não estará presente (protocolo e O.S)',
    texto:
      '{cliente} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}. {cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  aceiteTitularSozinho: {
    // Idem: Protocolo e O.S usam a mesma sentença.
    rotulo: 'Aceite — titular ligou e acompanha (protocolo e O.S)',
    texto:
      '{cliente} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
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
  osAberturaPj: {
    rotulo: 'Abertura da O.S — pessoa jurídica',
    texto:
      '{solicitante} ({cargo}) ENTROU EM CONTATO POR {canal} ({contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "{motivo}", E FICOU SEM ACESSO A INTERNET. PERGUNTEI SOBRE A {onu}, E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E {onu} APAGADA.',
    obrigatorios: ['solicitante', 'onu'],
  },
  osAberturaTerceiro: {
    rotulo: 'Abertura da O.S — terceiro',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "{motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E {onu} APAGADA.',
    obrigatorios: ['solicitante', 'cliente', 'onu'],
  },
  osAberturaTitularSemConexao: {
    rotulo: 'Abertura da O.S — titular relata o motivo direto',
    texto:
      '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) E DISSE QUE "{motivo}", E FICOU SEM CONEXAO COM A INTERNET. PERGUNTEI SOBRE A {equipamento} E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA. PERGUNTEI A {cliente} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.',
    obrigatorios: ['cliente'],
  },
  osPagouPj: {
    rotulo: 'Fecho da O.S — responsável autoriza e paga',
    texto:
      '{solicitante} AUTORIZOU VISITA E PAGARA {formaPagFrase} NO ATO. VISITA AGENDADA PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['solicitante', 'dataVisita'],
  },
  osFechoTerceiroAutorizado: {
    rotulo: 'Fecho da O.S — terceiro autorizado a acompanhar',
    texto:
      '{solicitante} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  osFechoTitularAcompanha: {
    rotulo: 'Fecho da O.S — titular acompanha',
    texto:
      '{solicitante} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },

  indicacaoTecnica: {
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TECNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE E DE OBRIGACAO DO PROVEDOR, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZACAO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.',
    obrigatorios: [],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'MAN {alarme} {clienteCompleto} PROT:{protocolo} {formaPag} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
