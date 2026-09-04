/**
 * Catálogo de frases do modelo `manut-roteador-reset`.
 *
 * Roteador resetado, três desfechos: cliente leva na loja, reconfigura
 * remotamente pelo tutorial, ou agenda visita paga. O miolo do protocolo é o
 * mesmo nos três — no render virou uma função só, em vez das três cópias.
 *
 * ⚠️ QUINTO VAZAMENTO DE BRANDING: `reconfiguracaoRemota` manda seguir o
 * "TUTORIAL DA WBR". Vira "TUTORIAL DA WBR" no sync.
 *
 * Sem trechos protegidos: não há reescrita por regex neste modelo.
 *
 * Nomes: {cliente} 1º nome · {clienteCompleto} · {canal} {contato}
 *        {sinalONU} {oscila} {roteador} {ssid} {senhaWifi}
 *        {dataLoja}/{horaLoja} quando leva o roteador na loja
 *        {dataVisita}/{horaVisita} {formaPag} {formaPagFrase}
 *        {protocolo} {bairro} {tecnico}
 */
import type { Catalogo } from './tipos';

export const MANUT_ROTEADOR_RESET: Catalogo = {
  abertura: {
    rotulo: 'Abertura do atendimento',
    texto: '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) INFORMANDO PROBLEMA DE CONEXAO.',
    obrigatorios: ['cliente'],
  },
  statusOnu: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU {sinalONU} {oscila}.',
    obrigatorios: [],
  },
  relatoSemRede: {
    rotulo: 'Relato — rede Wi-Fi sumiu',
    texto:
      'QUESTIONADO {cliente} DISSE QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NAO ESTA APARECENDO MAIS.',
    obrigatorios: ['cliente'],
  },
  verificacaoRemota: {
    rotulo: 'Verificação remota — roteador inacessível',
    texto:
      'REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL {sinalONU}) {oscila} E ROTEADOR ({roteador}) ESTA INACESSIVEL.',
    obrigatorios: ['roteador'],
  },
  orientacaoReinicio: {
    rotulo: 'Orientação de reinício dos equipamentos',
    texto:
      'ORIENTEI {cliente} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER.',
    obrigatorios: ['cliente'],
  },
  perguntaIntervencao: {
    rotulo: 'Pergunta sobre intervenção na instalação',
    texto:
      'PERGUNTEI A {cliente} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.',
    obrigatorios: ['cliente'],
  },

  duasOpcoes: {
    rotulo: 'Introdução das duas opções',
    texto: 'INFORMEI QUE O ROTEADOR ESTA RESETADO, E REPASSEI AO CLIENTE 2 OPCOES PARA SOLUCAO DO PROBLEMA.',
    obrigatorios: [],
  },
  opcaoVisita: {
    rotulo: 'Opção 1 — visita técnica paga',
    texto:
      '1ª. AGENDAMENTO DE UMA VISITA TECNICA PARA RECONFIGURAR O ROTEADOR, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TECNICO. ESTE VALOR PODE SER PAGO NO ATO EM DINHEIRO, PIX OU CARTAO.',
    obrigatorios: [],
  },
  opcaoLoja: {
    rotulo: 'Opção 2 — levar na loja, sem custo',
    texto: '2ª. TRAZER O ROTEADOR NA LOJA PARA RECONFIGURA-LO. ESTA OPCAO NAO TERA CUSTOS',
    obrigatorios: [],
  },

  optouLoja: {
    rotulo: 'Desfecho — cliente levará na loja',
    texto: '{cliente} OPTOU POR TRAZER O ROTEADOR NA LOJA EM {dataLoja} AS {horaLoja}.',
    obrigatorios: ['cliente'],
  },
  optouVisita: {
    rotulo: 'Desfecho — cliente optou pela visita técnica',
    texto:
      '{cliente} OPTOU PELA VISITA TECNICA, CONCORDOU COM OS TERMOS REPASSADOS E SOLICITOU PAGAR {formaPagFrase}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  reconfiguracaoRemota: {
    // ⚠️ Cita o provedor. Vira "TUTORIAL DA WBR" no sync para a WBR.
    rotulo: 'Desfecho — cliente reconfigurou pelo tutorial',
    texto:
      'INFORMEI {cliente} QUE O ROTEADOR ESTA RESETADO E ORIENTEI O MESMO A REALIZAR O PROCESSO DE RECONFIGURACAO REMOTA CONFORME TUTORIAL DA WBR. {cliente} SEGUIU AS ORIENTACOES, CONFIGUROU O ROTEADOR E CONFIRMOU QUE A REDE WI-FI VOLTOU NORMALMENTE.',
    obrigatorios: ['cliente'],
  },
  linhaSsid: {
    rotulo: 'Linha do SSID',
    texto: 'SSID: {ssid}',
    obrigatorios: ['ssid'],
  },
  linhaSenha: {
    rotulo: 'Linha da senha',
    texto: 'SENHA: {senhaWifi}',
    obrigatorios: ['senhaWifi'],
  },

  semDuvidas: {
    rotulo: 'Encerramento do protocolo',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },

  corpoOs: {
    rotulo: 'Corpo da O.S',
    texto:
      '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) E INFORMOU QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE SUA REDE WIFI NAO ESTA APARECENDO MAIS. REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL {sinalONU}) {oscila} E ROTEADOR ({roteador}) ESTA INACESSIVEL. ORIENTEI {cliente} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER. INFORMEI QUE ROTEADOR ESTA RESETADO, E NECESSARIA VISITA TECNICA PARA RECONFIGURA-LO, QUE ESTE SERVICO POSSUI CUSTO R$50,00. {cliente} CONCORDOU E SOLICITOU PAGAR NO ATO COM {formaPag}. VISITA AGENDADA PARA {dataVisita} AS {horaVisita} HRS.',
    obrigatorios: ['cliente', 'dataVisita', 'horaVisita'],
  },
  indicacaoTecnica: {
    rotulo: 'Indicação técnica da O.S',
    texto:
      'TECNICO: ANALISAR ESTRUTURA INTERNA CONFERIR EQUIPAMENTOS SE DANIFICADOS, ANALISAR FONTE E ROTEADOR. CONFIGURAR EQUIPAMENTO, RESTABELECER CONEXAO E REALIZAR OS DEVIDOS TESTES, FILMAR, FOTOGRAFAR E APRESENTAR A {cliente}. EXPLICAR SOBRE REDE 2 E 5GHZ, E SUAS ABRANGENCIAS.  ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 40 MIN.',
    obrigatorios: ['cliente'],
  },
  agenda: {
    rotulo: 'Linha da agenda',
    texto: 'MAN ROTEADOR RESETADO {clienteCompleto} PROT:{protocolo} {formaPag} ({tecnico}) - {bairro}',
    obrigatorios: ['clienteCompleto'],
  },
};
