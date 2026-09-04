/**
 * Catálogo de frases do modelo `feedback-wifi-extend`.
 * Feedback após instalação de 1 a 3 roteadores Wi-Fi Extend.
 *
 * EXTRAÇÃO PARCIAL: o `blocoRoteador` monta um bloco por roteador lendo campos
 * indexados dinamicamente (`local1`, `roteador2`, `mac3`…). São rótulos curtos
 * de formulário — LOCAL:, MODELO:, MAC: — e a montagem depende do índice, o que
 * os torna mais estrutura que conteúdo. Ficam travados e aparecem cinza.
 */
import type { Catalogo } from './tipos';

export const FEEDBACK_WIFI_EXTEND: Catalogo = {
  feedbackRealizado: {
    rotulo: 'Registro do feedback',
    texto: 'FIZ FEEDBACK COM {cliente} POR {canal} ({contato}) DIA {dataHora}.',
    obrigatorios: ['cliente'],
  },
  confirmouInstalacao: {
    rotulo: 'Confirmação da instalação',
    texto: '{cliente} CONFIRMOU INSTALAÇÃO DE {qtd} {palavraRoteador} WI-FI EXTEND. PLANO ATUAL: {plano}.',
    obrigatorios: ['cliente'],
  },
  testesRealizados: {
    rotulo: 'Testes de aferição realizados',
    texto:
      '{cliente} CONFIRMOU QUE FORAM REALIZADOS TESTES DE AFERIÇÃO DE VELOCIDADE, ORIENTAÇÃO DE COBERTURA WI-FI E REDE 2.4G E 5G.',
    obrigatorios: ['cliente'],
  },
  dispensouTestes: {
    rotulo: 'Cliente dispensou testes nos aparelhos dele',
    texto: '{cliente} DISPENSOU OS TESTES EM SEUS DISPOSITIVOS PESSOAIS.',
    obrigatorios: ['cliente'],
  },
  testesVia: {
    rotulo: 'Como os testes foram feitos',
    texto: 'TESTES REALIZADOS VIA {wifiCabo}.',
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
