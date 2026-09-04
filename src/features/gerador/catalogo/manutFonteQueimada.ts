/**
 * Catálogo de frases do modelo `manut-fonte-queimada`.
 *
 * Fonte de energia queimada, dois desfechos: cliente retira uma nova na loja
 * (sem custo) ou agenda visita técnica paga.
 *
 * ⚠️ SEXTO E SÉTIMO VAZAMENTOS DE BRANDING: as duas frases de isenção citam
 * "CONFORME RECOMENDACAO DA WBR". Viram "DA WBR" no sync.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome · {clienteCompleto} · {canal} {contato}
 *        {sinalONU} {equip} {proced} procedimento apurado · {periodo}
 *        {dataVisita} {horaVisita} {formaPag} {formaPagFrase}
 *        {protocolo} {bairro} {tecnico}
 */
import type { Catalogo } from './tipos';

export const MANUT_FONTE_QUEIMADA: Catalogo = {
  abertura: {
    rotulo: 'Abertura do atendimento',
    texto: '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['cliente'],
  },
  statusFibra: {
    rotulo: 'Status remoto — leitura da fibra (fluxo loja)',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E FIBRA COM SINAL: {sinalONU}.',
    obrigatorios: [],
  },
  statusOnu: {
    rotulo: 'Status remoto — leitura da ONU (fluxo visita)',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU COM SINAL: {sinalONU}.',
    obrigatorios: [],
  },
  relatoEquipamento: {
    rotulo: 'Relato do cliente',
    texto: 'QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.',
    obrigatorios: [],
  },
  verificacaoRemota: {
    rotulo: 'Verificação remota do equipamento',
    texto: 'REMOTAMENTE VERIFIQUEI QUE A ONU/ONT ESTA DESCONECTADA.',
    obrigatorios: [],
  },
  perguntaIntervencao: {
    rotulo: 'Pergunta sobre intervenção na instalação',
    texto:
      'PERGUNTEI A {cliente} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.',
    obrigatorios: ['cliente'],
  },

  isencaoFonteLoja: {
    // ⚠️ Cita o provedor. Vira "DA WBR" no sync.
    rotulo: 'Isenção da fonte — fluxo loja',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA, E QUE DEVIDO {cliente} TER CONECTADO O EQUIPAMENTO A ENERGIA CONFORME RECOMENDACAO DA WBR, ESTARA ISENTO DO CUSTO DA FONTE DE ENERGIA. FICANDO APENAS A COBRANCA DO DESLOCAMENTO DO TECNICO COM O CUSTO DE R$50,00.',
    obrigatorios: ['cliente'],
  },
  isencaoFonteVisita: {
    // ⚠️ Cita o provedor. Vira "DA WBR" no sync.
    rotulo: 'Isenção da fonte — fluxo visita',
    texto:
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO {cliente} CONECTAR O EQUIPAMENTO A ENERGIA CONFORME RECOMENDACAO DA WBR, ESTARA ISENTO DO CUSTO DA FONTE DE ENERGIA. FICANDO APENAS A COBRANCA DO DESLOCAMENTO DO TECNICO COM O CUSTO DE R$50,00.',
    obrigatorios: ['cliente'],
  },
  sugestaoLoja: {
    rotulo: 'Sugestão de retirar a fonte na loja',
    texto:
      'SUGERI TAMBEM, A POSSIBILIDADE DE COMPARECER A LOJA E RETIRAR UMA NOVA FONTE DE ENERGIA SEM NENHUM CUSTO ADICIONAL.',
    obrigatorios: [],
  },

  optouLoja: {
    rotulo: 'Desfecho — cliente virá à loja',
    texto: '{cliente} OPTOU POR VIR A LOJA, DISSE QUE VIRA NO DIA {dataVisita} NO PERIODO DA {periodo}.',
    obrigatorios: ['cliente', 'dataVisita'],
  },
  aceiteVisita: {
    rotulo: 'Desfecho — aceite da visita técnica',
    texto:
      '{cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA {dataVisita} A PARTIR DE {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },

  avisoLojaCorpo: {
    rotulo: 'Aviso do grupo LEIA — corpo',
    texto: 'CLIENTE VIRA NA LOJA RECOLHER UMA {equip} SEM CUSTOS. EM {dataVisita} NO PERIODO DA {periodo}.',
    obrigatorios: ['dataVisita'],
  },
  avisoLojaProtocolo: {
    rotulo: 'Aviso do grupo LEIA — linha do protocolo',
    texto: 'PROTOCOLO Nº:{protocolo}',
    obrigatorios: ['protocolo'],
  },

  corpoOs: {
    rotulo: 'Corpo da O.S',
    texto:
      '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE A ONU/ONT ESTA COM TODAS AS LUZES APAGADAS". REMOTAMENTE VERIFIQUEI QUE A ONU/ONT ESTA DESCONECTADA/APAGADA. {proced}. PERGUNTEI A {cliente} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA REALIZAR A SUBSTITUICAO DA FONTE QUEIMADA POR OUTRA DE MODELO SIMILAR. VISITA TECNICA POSSUI O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TECNICO. {cliente} CONCORDOU E PAGARA NO ATO COM {formaPag}. VISITA AGENDADA PARA {dataVisita} A PARTIR DE {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  indicacaoTecnica: {
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TECNICO: CONFERIR EQUIPAMENTOS E PARTE ELETRICA. SUBSTITUIR FONTE QUEIMADA E RESTABELECER ACESSO A INTERNET. CASO HAJA EQUIPAMENTOS DANIFICADOS POR MAL USO ENTRAR EM CONTATO COM O SUPORTE DE IMEDIATO PARA TRATATIVA. TESTAR REDE WI-FI E DISPOSITIVOS LIGADOS POR CABOS, CONFERIR NAVEGACAO IPv6 E AFERIR O PLANO CONTRATADO. SANAR TODAS AS DUVIDAS DE {cliente}, COLHER ASSINATURA DA ORDEM DE SERVICO E RECEBER SERVICO.',
    obrigatorios: ['cliente'],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'MAN TROCA FONTE {clienteCompleto} PROT:{protocolo} {formaPag} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
