/**
 * Catálogo de frases do modelo `manut-luz-vermelha`.
 *
 * O maior arquivo do gerador (277 linhas). Luz vermelha / PON piscando, quatro
 * tipos de solicitação. O legado tinha uma função de protocolo por ramo, com o
 * miolo praticamente copiado nas quatro — aqui vira uma frase por sentença.
 *
 * Onde a mesma sentença aparece no Protocolo e na O.S, existe UMA chave só.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome · {clienteCompleto} · {solicitante}
 *        {solicitanteCompleto} {parente} {canal} {contato} {contatoSolicitante}
 *        {onu} 1ª palavra · {equipamento} por extenso · {alarme}
 *        {formaPag} {formaPagFrase} {dataVisita} {horaVisita}
 *        {protocolo} {bairro} {tecnico} {pessoa}
 */
import type { Catalogo } from './tipos';

export const MANUT_LUZ_VERMELHA: Catalogo = {
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
  alarmeRelato: {
    rotulo: 'Alarme relatado pelo cliente',
    texto: 'QUESTIONADO, DISSE QUE A {onu} ESTA COM {alarme}.',
    obrigatorios: ['onu'],
  },
  verificacaoRemota: {
    rotulo: 'Verificação remota do equipamento',
    texto: 'REMOTAMENTE VERIFIQUEI QUE {onu} ESTA DESCONECTADO/APAGADA.',
    obrigatorios: ['onu'],
  },
  orientacaoUmEquipamento: {
    rotulo: 'Orientação de reinício — um equipamento',
    texto:
      'ORIENTEI {pessoa} A DESCONECTAR EQUIPAMENTO ({equipamento}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.',
    obrigatorios: ['pessoa'],
  },
  orientacaoEquipamentos: {
    rotulo: 'Orientação de reinício — vários equipamentos',
    texto:
      'ORIENTEI {pessoa} A DESCONECTAR EQUIPAMENTOS ({equipamento}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.',
    obrigatorios: ['pessoa'],
  },
  orientacaoEquipamentosOs: {
    rotulo: 'Orientação de reinício — variante da O.S',
    texto:
      'ORIENTEI {pessoa} A DESCONECTAR EQUIPAMENTOS ({equipamento}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.',
    obrigatorios: ['pessoa'],
  },
  perguntaIntervencao: {
    rotulo: 'Pergunta sobre intervenção na instalação',
    texto:
      'PERGUNTEI A {pessoa} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.',
    obrigatorios: ['pessoa'],
  },
  termosVisitaProtocolo: {
    rotulo: 'Termos e custo da visita — protocolo',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
    obrigatorios: [],
  },
  termosVisitaOs: {
    rotulo: 'Termos e custo da visita — O.S',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.',
    obrigatorios: [],
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
    rotulo: 'Aceite — titular ligou e acompanha',
    texto:
      '{cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
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
      '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE {onu} ESTA COM {alarme}".',
    obrigatorios: ['cliente', 'onu'],
  },
  osAberturaTerceiro: {
    rotulo: 'Abertura da O.S — terceiro',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoSolicitante}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE {onu} ESTA COM {alarme}".',
    obrigatorios: ['solicitante', 'cliente', 'onu'],
  },
  osPagouSolicitante: {
    rotulo: 'Fecho da O.S — solicitante paga',
    texto: '{solicitante} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}.',
    obrigatorios: ['solicitante'],
  },
  osPagouTitular: {
    rotulo: 'Fecho da O.S — titular paga',
    texto: '{cliente} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}.',
    obrigatorios: ['cliente'],
  },
  osContatoAutorizaTerceiro: {
    rotulo: 'O.S — titular autoriza o terceiro',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  osContatoTitularAcompanha: {
    rotulo: 'O.S — titular confirma que acompanhará',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  osTitularAusente: {
    rotulo: 'O.S — titular não estará presente',
    texto:
      '{cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  osAgendadaSemAcompanhante: {
    rotulo: 'O.S — visita agendada, sem acompanhante definido',
    texto: 'VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['dataVisita'],
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
