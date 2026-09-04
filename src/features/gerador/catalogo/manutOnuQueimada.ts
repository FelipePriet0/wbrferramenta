/**
 * Catálogo de frases do modelo `manut-onu-queimada`.
 *
 * ONU sem sinal (DYINGGASP). Quatro tipos de solicitação × forma de pagamento
 * (no ato ou lançado na mensalidade).
 *
 * O legado montava os fechos concatenando pedaços — aceite + quem acompanha +
 * agendamento. Os pedaços viraram frases próprias e a montagem ficou no render:
 * assim quem edita mexe em sentenças inteiras e legíveis, não em fragmentos
 * soltos que só fazem sentido colados.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome do titular · {clienteCompleto}
 *        {solicitanteExibido} quem ligou, já com cargo/parentesco
 *        {pessoa} quem conduz o diálogo · {solicitanteCompleto} {parente}
 *        {canal} {contato} {contatoUsado} {alarme} {onu} {formaPag}
 *        {dataVisita} {horaVisita} {protocolo} {bairro} {tecnico}
 */
import type { Catalogo } from './tipos';

export const MANUT_ONU_QUEIMADA: Catalogo = {
  abertura: {
    rotulo: 'Abertura do atendimento',
    texto:
      '{solicitanteExibido} ENTROU EM CONTATO POR {canal} ({contatoUsado}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['solicitanteExibido'],
  },
  statusOnu: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU SEM SINAL (DYINGGASP).',
    obrigatorios: [],
  },
  relatoEquipamento: {
    rotulo: 'Relato do cliente',
    texto: 'QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.',
    obrigatorios: [],
  },
  verificacaoRemota: {
    rotulo: 'Verificação remota do equipamento',
    texto: 'REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU {alarme} (SEM SINAL: DYINGGASP).',
    obrigatorios: [],
  },
  orientacaoInverter: {
    rotulo: 'Orientação de inverter as fontes',
    texto:
      'ORIENTEI {pessoa} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E INVERTE-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.',
    obrigatorios: ['pessoa'],
  },
  perguntaIntervencao: {
    rotulo: 'Pergunta sobre intervenção na instalação',
    texto:
      'PERGUNTEI A {pessoa} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.',
    obrigatorios: ['pessoa'],
  },
  termosVisita: {
    rotulo: 'Termos e custo da visita técnica',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.',
    obrigatorios: [],
  },

  aceiteMensalidade: {
    rotulo: 'Aceite — cobrança na próxima mensalidade',
    texto: 'CONCORDOU COM A VISITA E CASO HAJA COBRANCA OPTOU POR LANCAR O VALOR NA PROXIMA MENSALIDADE',
    obrigatorios: [],
  },
  aceiteNoAto: {
    rotulo: 'Aceite — pagamento no ato',
    texto: 'CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM {formaPag}',
    obrigatorios: [],
  },
  agendamento: {
    rotulo: 'Linha do agendamento',
    texto: 'VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA {dataVisita} {horaVisita}',
    obrigatorios: ['dataVisita'],
  },
  contatoTitular: {
    rotulo: 'Contato de confirmação com o titular',
    texto:
      'POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR {canal} ({contato}) COM {cliente} (ASSINANTE) QUE CONFIRMOU E',
    obrigatorios: ['cliente'],
  },

  titularAusenteProtocolo: {
    rotulo: 'Titular não estará presente — protocolo',
    texto:
      '{cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER.',
    obrigatorios: ['cliente'],
  },
  titularAusenteOs: {
    rotulo: 'Titular não estará presente — O.S',
    texto:
      '{cliente} NAO ESTARA PRESENTE MAS AUTORIZOU {solicitanteCompleto} ({parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER.',
    obrigatorios: ['cliente'],
  },
  autorizouTerceiro: {
    rotulo: 'Titular autorizou o terceiro a acompanhar',
    texto: 'AUTORIZOU {solicitanteCompleto} ({parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER.',
    obrigatorios: [],
  },
  titularAcompanha: {
    rotulo: 'Titular estará presente',
    texto: 'DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.',
    obrigatorios: [],
  },
  acompanhaTecnico: {
    rotulo: 'Cliente acompanhará o técnico',
    texto: 'DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO.',
    obrigatorios: [],
  },

  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },

  corpoOs: {
    rotulo: 'Corpo da O.S',
    texto:
      '{solicitanteExibido} ENTROU EM CONTATO POR {canal} ({contatoUsado}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, {pessoa} DISSE "QUE A ONU ESTA {alarme}". REMOTAMENTE VERIFIQUEI QUE ONU ESTA DESCONECTADA/APAGADA. ORIENTEI {pessoa} A INVERTER AS FONTES DE ENERGIA DOS EQUIPAMENTOS (ONU E ROTEADOR) E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A {pessoa} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.',
    obrigatorios: ['pessoa'],
  },
  indicacaoTecnica: {
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TECNICO: CONFERIR AS TOMADAS,  T , ETC. ONDE ESTAO LIGADOS ONU E ROTEADOR. CONFERIR FONTES DOS EQUIPAMENTOS E CONFERIR ONU (APARENCIA FISICA). SE NAO FOR PROBLEMAS NA TOMADA, NAS FONTES E ONU ESTIVER SEM AVARIAS, SUBSTITUIR ONU {onu} POR OUTRA SIMILAR. EFETUAR TESTES PADROES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZACAO DO FIRMWARE DO ROTEADOR. CASO PROBLEMA SEJA NA TOMADA,  T , FONTES OU ONU AVARIADA: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARA DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DUVIDAS DE {pessoa}. TEMPO ESTIMADO 40 MINUTOS.',
    obrigatorios: ['pessoa'],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'MAN TROCA ONU {clienteCompleto} PROT:{protocolo} {custoAgenda} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
