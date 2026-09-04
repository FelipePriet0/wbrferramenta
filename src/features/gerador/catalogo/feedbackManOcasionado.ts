/**
 * Catálogo de frases do modelo `feedback-man-ocasionado`.
 * Feedback após reparo por dano ocasionado pelo cliente.
 *
 * Nomes: {cliente} 1º nome · {canal} {contato} {dataHora}
 *        {reparoLocal} interno/externo · {energia} · {valorOS} {formaPagFrase}
 *        {obs} observação livre do operador
 */
import type { Catalogo } from './tipos';

export const FEEDBACK_MAN_OCASIONADO: Catalogo = {
  feedbackRealizado: {
    rotulo: 'Registro do feedback',
    texto: 'FIZ FEEDBACK COM {cliente} POR {canal} ({contato}) DIA {dataHora}.',
    obrigatorios: ['cliente'],
  },
  acessoNormalizado: {
    rotulo: 'Confirmação de acesso normalizado',
    texto: '{cliente} CONFIRMOU ACESSO NORMALIZADO APÓS REPARO {reparoLocal} REALIZADO.',
    obrigatorios: ['cliente'],
  },
  orientacaoNaoManusear: {
    rotulo: 'Orientação sobre manuseio dos equipamentos',
    texto:
      'CLIENTE ORIENTADO A NÃO MANUSEAR EQUIPAMENTOS/FIBRA, POIS EM CASO DE DANO, É GERADO O VALOR DO REFERIDO EQUIPAMENTO/DESLOCAMENTO.',
    obrigatorios: [],
  },
  equipamentoLigado: {
    rotulo: 'Onde o equipamento está ligado',
    texto: 'EQUIPAMENTO LIGADO EM {energia}.',
    obrigatorios: [],
  },
  osComCusto: {
    rotulo: 'O.S com custo',
    texto: 'O.S COM CUSTO DE R${valorOS} PAGO {formaPagFrase}.',
    obrigatorios: [],
  },
  osSemCusto: {
    rotulo: 'O.S sem custo',
    texto: 'O.S SEM CUSTO.',
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
