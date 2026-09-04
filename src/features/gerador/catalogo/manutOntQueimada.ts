/**
 * Catálogo de frases do modelo `manut-ont-queimada`.
 *
 * Irmão do `manut-onu-queimada`, para ONT. Vários fechos são idênticos entre os
 * dois modelos — e são COPIADOS, não referenciados: é a decisão de escopo (um
 * modelo por vez). A partir deste catálogo a nota "este texto também existe em
 * outros N modelos" começa a aparecer de verdade na tela.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} {clienteCompleto} {solicitanteExibido} {pessoa}
 *        {solicitanteCompleto} {parente} {canal} {contato} {contatoUsado}
 *        {alarme} {ont} {formaPag} {dataVisita} {horaVisita}
 *        {protocolo} {bairro} {tecnico} {custoAgenda}
 */
import type { Catalogo } from './tipos';

export const MANUT_ONT_QUEIMADA: Catalogo = {
  abertura: {
    rotulo: 'Abertura do atendimento',
    texto:
      '{solicitanteExibido} ENTROU EM CONTATO POR {canal} ({contatoUsado}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['solicitanteExibido'],
  },
  statusOnt: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONT SEM SINAL (DYINGGASP).',
    obrigatorios: [],
  },
  relatoEquipamento: {
    rotulo: 'Relato do cliente',
    texto: 'QUESTIONADO, DISSE QUE O EQUIPAMENTO DE INTERNET NAO ESTA LIGANDO ({ont}).',
    obrigatorios: [],
  },
  verificacaoEOrientacao: {
    rotulo: 'Verificação remota e orientação de reinício',
    // A WBR escreve "ONT COM {alarme}"; a MZnet escreve "ONT {alarme}".
    texto:
      'REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONT COM {alarme} (SEM SINAL: DYINGGASP). ORIENTEI {pessoa} A DESCONECTAR O CABO DE ENERGIA DA ONT E RECONECTA-LO APOS 30 SEGUNDOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.',
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
      '{solicitanteExibido} ENTROU EM CONTATO POR {canal} ({contatoUsado}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, {pessoa} DISSE "QUE A ONT ESTA COM {alarme}". REMOTAMENTE VERIFIQUEI QUE ONT ESTA DESCONECTADA/APAGADA. ORIENTEI {pessoa} A RETIRAR A FONTE DE ENERGIA DA TOMADA ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A {pessoa} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.',
    obrigatorios: ['pessoa'],
  },
  indicacaoTecnica: {
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TECNICO: CONFERIR A TOMADA, T , ETC. ONDE ESTA LIGADA ONT. CONFERIR FONTE DO EQUIPAMENTO E CONFERIR ONT (APARENCIA FISICA). SE NAO FOR PROBLEMAS NA TOMADA, NA FONTE E ONT ESTIVER SEM AVARIAS, SUBSTITUIR {ont} POR OUTRA SIMILAR. EFETUAR TESTES PADROES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZACAO DO FIRMWARE DA ONT. CASO PROBLEMA SEJA NA TOMADA, T , FONTES OU ONT AVARIADA: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARA DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DUVIDAS DE {pessoa}. TEMPO ESTIMADO 40 MINUTOS.',
    obrigatorios: ['pessoa'],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'MAN TROCA ONT {clienteCompleto} PROT:{protocolo} {custoAgenda} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
