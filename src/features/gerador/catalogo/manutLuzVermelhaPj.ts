/**
 * Catálogo de frases do modelo `manut-luz-vermelha-pj`.
 *
 * ONU sem sinal em cliente pessoa jurídica. Ramo único — o modelo não tem
 * variações de tipo de solicitação, só o fluxo do responsável da empresa.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {solicitante} 1º nome de quem ligou · {cargo} · {clienteCompleto}
 *        razão social · {canal} {contato} {alarme} {onu} 1ª palavra do
 *        equipamento · {equipamentos} por extenso · {formaPag} forma crua ·
 *        {formaPagFrase} regência pronta · {dataVisita} {horaVisita}
 *        {protocolo} {bairro} {tecnico}
 */
import type { Catalogo } from './tipos';

export const MANUT_LUZ_VERMELHA_PJ: Catalogo = {
  abertura: {
    rotulo: 'Abertura do atendimento',
    texto:
      '{solicitante} ({cargo}) ENTROU EM CONTATO POR {canal} ({contato}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['solicitante'],
  },
  statusOnu: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E {onu} SEM SINAL.',
    obrigatorios: ['onu'],
  },
  alarmeRelato: {
    rotulo: 'Alarme relatado pelo cliente',
    texto: 'QUESTIONADO, DISSE QUE A {onu} ESTA COM {alarme}.',
    obrigatorios: ['onu', 'alarme'],
  },
  verificacaoRemota: {
    rotulo: 'Verificação remota do equipamento',
    texto: 'REMOTAMENTE VERIFIQUEI QUE {onu} ESTA DESCONECTADO/APAGADA.',
    obrigatorios: ['onu'],
  },
  orientacaoReinicio: {
    rotulo: 'Orientação de reinício dos equipamentos',
    texto:
      'ORIENTEI {solicitante} A DESCONECTAR EQUIPAMENTOS ({equipamentos}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.',
    obrigatorios: ['solicitante', 'equipamentos'],
  },
  perguntaIntervencao: {
    rotulo: 'Pergunta sobre intervenção na instalação',
    texto:
      'PERGUNTEI A {solicitante} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.',
    obrigatorios: ['solicitante'],
  },
  termosVisita: {
    rotulo: 'Termos e custo da visita técnica',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
    obrigatorios: [],
  },
  aceite: {
    rotulo: 'Aceite e agendamento',
    texto:
      '{solicitante} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['solicitante', 'dataVisita', 'horaVisita'],
  },
  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },

  corpoOs: {
    rotulo: 'Corpo da O.S',
    texto:
      '{solicitante} ({cargo}) ENTROU EM CONTATO POR {canal} ({contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE {onu} ESTA COM {alarme}". REMOTAMENTE VERIFIQUEI QUE {onu} ESTA DESCONECTADO/APAGADA. ORIENTEI {solicitante} A DESCONECTAR EQUIPAMENTOS ({equipamentos}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A {solicitante} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. {solicitante} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['solicitante', 'dataVisita', 'horaVisita'],
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
    obrigatorios: ['clienteCompleto', 'protocolo'],
  },
};
