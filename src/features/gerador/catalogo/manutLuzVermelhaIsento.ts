/**
 * Catálogo de frases do modelo `manut-luz-vermelha-isento`.
 *
 * Retorno dentro dos 7 dias da instalação — visita isenta.
 *
 * EXTRAÇÃO PARCIAL, deliberada. Extraí o MIOLO do protocolo, que é idêntico
 * nos quatro tipos de solicitação: abertura, status, alarme, verificação,
 * orientação, pergunta e o bloco de visita isenta. Mais a indicação técnica e
 * a agenda.
 *
 * Ficaram TRAVADOS (cinza na tela) os fechos de aceite e os corpos da O.S: são
 * quatro variantes longas cada, e o ganho de editá-las não paga o risco agora.
 * Quando a líder do suporte pedir, entram numa passada seguinte — o desenho
 * permite extrair mais sem refazer nada.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome do titular · {solicitante} 1º nome de quem ligou
 *        {pessoa} quem conduz o diálogo · {parente} {canal} {contatoUsado}
 *        {onu} 1ª palavra · {equipamento} por extenso · {alarme}
 */
import type { Catalogo } from './tipos';

export const MANUT_LUZ_VERMELHA_ISENTO: Catalogo = {
  aberturaTerceiro: {
    rotulo: 'Abertura — terceiro ligou',
    texto:
      '{solicitante} ({parente} DE {cliente}) ENTROU EM CONTATO POR {canal} ({contatoUsado}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['solicitante', 'cliente'],
  },
  aberturaTitular: {
    rotulo: 'Abertura — titular ligou',
    texto: '{cliente} ENTROU EM CONTATO POR {canal} ({contatoUsado}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['cliente'],
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
  orientacaoReinicio: {
    rotulo: 'Orientação de reinício do equipamento',
    texto:
      'ORIENTEI {pessoa} A DESCONECTAR EQUIPAMENTO ({equipamento}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.',
    obrigatorios: ['pessoa'],
  },
  perguntaIntervencao: {
    rotulo: 'Pergunta sobre intervenção na instalação',
    texto:
      'PERGUNTEI A {pessoa} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.',
    obrigatorios: ['pessoa'],
  },
  visitaIsenta: {
    rotulo: 'Condições da visita isenta',
    texto:
      'INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO. INSTALACAO REALIZADA DENTRO DE 07 DIAS.',
    obrigatorios: [],
  },
  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },
  indicacaoTecnica: {
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TECNICO: VERIFICAR CONECTOR, DROP INTERNO E EXTERNO. ACHANDO O PROBLEMA, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. APOS TERMINO DO SERVICO, PERGUNTA A {pessoa} (OU QUEM ESTIVER ACOMPANHADO SERVICO) SE HA NECESSIDADE DE QUALQUER OUTRA ORIENTACAO SOBRE A INTERNET.',
    obrigatorios: ['pessoa'],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto:
      'DENTRO DOS 7 DIAS // MAN {alarme} {clienteCompleto} PROT:{protocolo} ISENTO ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
