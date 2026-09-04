/**
 * Catálogo de frases do modelo `feedback-altplan`.
 * Feedback após alteração de plano, com ou sem troca de roteador.
 */
import type { Catalogo } from './tipos';

export const FEEDBACK_ALTPLAN: Catalogo = {
  feedbackRealizado: {
    rotulo: 'Registro do feedback',
    texto: 'FIZ FEEDBACK COM {cliente} POR {canal} ({contato}) DIA {dataHora}.',
    obrigatorios: ['cliente'],
  },
  confirmouComTroca: {
    rotulo: 'Confirmação com troca de roteador',
    texto: '{cliente} CONFIRMOU A TROCA DO ROTEADOR E CONFIRMOU A ALTERAÇÃO DO PLANO PARA: {plano}.',
    obrigatorios: ['cliente'],
  },
  confirmouSemTroca: {
    rotulo: 'Confirmação sem troca de roteador',
    texto: '{cliente} CONFIRMOU A ALTERAÇÃO DO PLANO PARA: {plano}. ROTEADOR INSTALADO: {modeloRoteador}.',
    obrigatorios: ['cliente'],
  },
  testesRealizados: {
    rotulo: 'Testes de aferição realizados',
    texto:
      '{cliente} CONFIRMOU QUE FORAM REALIZADOS TESTES DE AFERIÇÃO DA VELOCIDADE, ORIENTAÇÃO DE COBERTURA WI-FI E REDE 2.4G E 5.8G.',
    obrigatorios: ['cliente'],
  },
  dispensouTestes: {
    rotulo: 'Cliente dispensou testes nos aparelhos dele',
    texto: '{cliente} DISPENSOU OS TESTES EM SEUS DISPOSITIVOS PESSOAIS.',
    obrigatorios: ['cliente'],
  },
  possuiEquipamento: {
    rotulo: 'Cliente possui aparelho que afere a banda',
    texto: '{cliente} POSSUI EQUIPAMENTO QUE AFERE A BANDA ({aparelho} {marcaModelo} AFERIU {velocidade}MB VIA {wifiCabo}).',
    obrigatorios: ['cliente'],
  },
  naoPossuiEquipamento: {
    rotulo: 'Cliente não possui aparelho compatível',
    texto:
      '{cliente} NÃO POSSUI APARELHO COMPATÍVEL COM A VELOCIDADE CONTRATADA ({aparelho} {marcaModelo} AFERIU {velocidade}MB VIA {wifiCabo}).',
    obrigatorios: ['cliente'],
  },
  aferricaoNotebook: {
    rotulo: 'Aferição no notebook do técnico',
    texto:
      'NOTEBOOK DO TÉCNICO VIA CABO DE REDE AFERIU {caboTec}MEGA E {wifiTec}MEGA VIA WI-FI CONECTADO NA REDE 5G.',
    obrigatorios: [],
  },
  equipamentosInstalados: {
    rotulo: 'Onde os equipamentos foram instalados',
    texto: 'EQUIPAMENTOS INSTALADOS: {energia}.',
    obrigatorios: [],
  },
  osComCusto: {
    rotulo: 'O.S com custo',
    texto: 'O.S COM O CUSTO DE R${valorOS}',
    obrigatorios: [],
  },
  osSemCusto: {
    rotulo: 'O.S sem custo',
    texto: 'O.S. SEM CUSTOS.',
    obrigatorios: [],
  },
  semDuvidas: {
    rotulo: 'Encerramento',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },
  observacao: {
    rotulo: 'Observação do operador',
    texto: 'OBS: {obs}',
    obrigatorios: ['obs'],
  },
};
