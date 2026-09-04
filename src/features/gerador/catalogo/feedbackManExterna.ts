/**
 * Catálogo de frases do modelo `feedback-man-externa`.
 * Feedback após reparo técnico na rede externa.
 *
 * Nomes: {cliente} 1º nome · {canal} {contato} {dataHora} {energia}
 *        {valorOS} {formaPagFrase}
 */
import type { Catalogo } from './tipos';

export const FEEDBACK_MAN_EXTERNA: Catalogo = {
  feedbackRealizado: {
    rotulo: 'Registro do feedback',
    texto: 'FIZ FEEDBACK COM {cliente} POR {canal} ({contato}) DIA {dataHora}.',
    obrigatorios: ['cliente'],
  },
  acessoNormalizado: {
    rotulo: 'Confirmação de acesso normalizado',
    texto: 'CLIENTE CONFIRMOU ACESSO NORMALIZADO APÓS REPARO TÉCNICO REALIZADO.',
    obrigatorios: [],
  },
  equipamentoLigado: {
    rotulo: 'Onde o equipamento está ligado',
    texto: 'EQUIPAMENTO LIGADO EM {energia}.',
    obrigatorios: [],
  },
  osComCusto: {
    rotulo: 'O.S com custo',
    texto: 'O.S TEVE O CUSTO DE R${valorOS} PAGO {formaPagFrase}.',
    obrigatorios: [],
  },
  osSemCusto: {
    rotulo: 'O.S sem custo',
    texto: 'O.S SEM CUSTO.',
    obrigatorios: [],
  },
  semDuvida: {
    rotulo: 'Encerramento',
    texto: 'CLIENTE SEM DÚVIDA.',
    obrigatorios: [],
  },
};
