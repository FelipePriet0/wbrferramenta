/**
 * Catálogo de frases do modelo `manut-roteador-queimado`.
 *
 * O mais ramificado da Onda 2: dois modos de custo (isento / cobrada) × cinco
 * tipos de solicitação. O legado montava os fechos com ternários encadeados;
 * aqui os pedaços viraram frases e a montagem ficou no render.
 *
 * ⚠️ OITAVO VAZAMENTO DE BRANDING: `isencaoRoteador` cita "CONFORME
 * RECOMENDACAO DA WBR". Vira "DA WBR" no sync.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome do titular · {clienteCompleto}
 *        {solicitanteExibido} quem ligou, já com cargo/parentesco
 *        {pessoa} quem conduz o diálogo · {solicitanteCompleto} {parente}
 *        {canal} {contato} {contatoUsado} {sinalONU} {roteador}
 *        {valorRoteador} preço da tabela · {formaPag} {formaPagFrase}
 *        {dataVisita} {horaVisita} {horaCobrada}
 *        {protocolo} {bairro} {tecnico} {custoAgenda}
 */
import type { Catalogo } from './tipos';

export const MANUT_ROTEADOR_QUEIMADO: Catalogo = {
  abertura: {
    rotulo: 'Abertura do atendimento',
    texto:
      '{solicitanteExibido} ENTROU EM CONTATO POR {canal} ({contatoUsado}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['solicitanteExibido'],
  },
  statusOnu: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU {sinalONU}.',
    obrigatorios: [],
  },
  relatoEquipamento: {
    rotulo: 'Relato do cliente — fluxo isento',
    texto: 'QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.',
    obrigatorios: [],
  },
  relatoEquipamentoComModelo: {
    rotulo: 'Relato do cliente — fluxo cobrado (com modelo)',
    texto: 'QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO ({roteador}).',
    obrigatorios: [],
  },
  verificacaoEOrientacaoIsento: {
    rotulo: 'Verificação remota e orientação — fluxo isento',
    texto:
      'REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ACESA (SINAL {sinalONU}). ORIENTEI {pessoa} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.',
    obrigatorios: ['pessoa'],
  },
  verificacaoCobrada: {
    rotulo: 'Verificação remota — fluxo cobrado',
    texto: 'REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ONLINE COM SINAL {sinalONU}.',
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
  isencaoRoteador: {
    // ⚠️ Cita o provedor. Vira "DA WBR" no sync.
    rotulo: 'Isenção do roteador — fluxo isento',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO {pessoa} CONECTAR O EQUIPAMENTO A ENERGIA CONFORME RECOMENDACAO DA WBR, ESTARA ISENTO DO CUSTO DO ROTEADOR. FICANDO APENAS A COBRANCA DO DESLOCAMENTO DO TECNICO COM O CUSTO DE R$50,00.',
    obrigatorios: ['pessoa'],
  },
  termosVisita: {
    rotulo: 'Termos e custo da visita técnica',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.',
    obrigatorios: [],
  },

  aceiteIsento: {
    rotulo: 'Aceite — fluxo isento',
    texto: 'CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA {formaPagFrase}',
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
  cienteAutorizou: {
    rotulo: 'Ciência e autorização — fluxo isento (O.S)',
    texto: 'DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO {formaPagFrase}',
    obrigatorios: [],
  },

  agendamentoIsentoProtocolo: {
    rotulo: 'Agendamento — fluxo isento (protocolo)',
    texto: 'VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS',
    obrigatorios: ['dataVisita'],
  },
  agendamentoIsentoOs: {
    rotulo: 'Agendamento — fluxo isento (O.S)',
    texto: 'VISITA AGENDADA PARA {dataVisita} AS {horaVisita} HRS',
    obrigatorios: ['dataVisita'],
  },
  agendamentoCobrada: {
    rotulo: 'Agendamento — fluxo cobrado',
    texto: 'VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA {dataVisita} {horaCobrada}',
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

  corpoOsIsento: {
    rotulo: 'Corpo da O.S — fluxo isento',
    texto:
      '{solicitanteExibido} ENTROU EM CONTATO POR {canal} ({contatoUsado}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET, QUESTIONADO DISSE "QUE ROTEADOR ESTA COM TODAS AS LUZES APAGADAS E ONU ESTA LIGADO NORMALMENTE". REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ACESA (SINAL {sinalONU}). ORIENTEI {pessoa} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU. INFORMEI {pessoa} QUE E NECESSARIO VISITA TECNICA, E QUE HAVENDO PROBLEMAS DE QUEIMA NA FONTE DE ENERGIA OU EQUIPAMENTO NAO OCASIONADO, SUBSTITUICAO DO COMODATO NAO HAVERA CUSTOS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 MAIS O CUSTO DA PECA OU EQUIPAMENTO A SER SUBSTITUIDO (FONTE R$40,00) OU (ROTEADOR {valorRoteador}),',
    obrigatorios: ['pessoa'],
  },
  corpoOsCobrada: {
    rotulo: 'Corpo da O.S — fluxo cobrado',
    texto:
      '{solicitanteExibido} ENTROU EM CONTATO POR {canal} ({contatoUsado}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, {pessoa} DISSE "QUE ROTEADOR ESTA COM TODAS AS LUZES APAGADAS". REMOTAMENTE VERIFIQUEI QUE ONU ESTA CONECTADA E COM SINAL {sinalONU}. ORIENTEI {pessoa} A INVERTER AS FONTES DE ENERGIA DOS EQUIPAMENTOS (ONU E ROTEADOR) E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A {pessoa} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.',
    obrigatorios: ['pessoa'],
  },
  indicacaoTecnicaIsento: {
    rotulo: 'Indicação técnica — fluxo isento',
    texto:
      'TECNICO: CONFERIR ENERGIA DAS TOMADAS, ANALISAR FONTE E ROTEADOR, CASO ENERGIA E FONTE ESTIVER NORMAL, E EQUIPAMENTO NAO APRESENTAR SINAL DE MAL USO OU QUEDA, SUBSTITUIR FONTE E/OU ROTEADOR QUEIMADO, RESTABELECER CONEXAO E REALIZAR OS DEVIDOS TESTES. CASO ENERGIA NAO ESTIVER NORMAL INSTRUIR {pessoa} A VERIFICA-LA E COBRAR VISITA DE R$50,00 + EQUIPAMENTO DANIFICADO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WIFI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 60 MIN.',
    obrigatorios: ['pessoa'],
  },
  indicacaoTecnicaCobrada: {
    rotulo: 'Indicação técnica — fluxo cobrado',
    texto:
      'TECNICO: CONFERIR AS TOMADAS, T, ETC. ONDE ESTAO LIGADOS ONU E ROTEADOR. CONFERIR FONTES DOS EQUIPAMENTOS E CONFERIR ROTEADOR (APARENCIA FISICA). SE NAO FOR PROBLEMAS NA TOMADA, NAS FONTES E ROTEADOR ESTIVER SEM AVARIAS, SUBSTITUIR ROTEADOR {roteador} POR OUTRO SIMILAR. EFETUAR TESTES PADROES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZACAO DO FIRMWARE DO ROTEADOR. CASO PROBLEMA SEJA NA TOMADA,  T , FONTES OU ROTEADOR AVARIADO: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARA DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DUVIDAS DE {pessoa}. TEMPO ESTIMADO 40 MINUTOS.',
    obrigatorios: ['pessoa'],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'MAN TROCA ROTEADOR {clienteCompleto} PROT:{protocolo} {custoAgenda} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
