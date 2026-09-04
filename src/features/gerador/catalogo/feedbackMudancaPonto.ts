/**
 * Catálogo de frases do modelo `feedback-mudanca-ponto`.
 * Feedback após reinstalação dos equipamentos em outro cômodo.
 */
import type { Catalogo } from './tipos';

export const FEEDBACK_MUDANCA_PONTO: Catalogo = {
  feedbackRealizado: {
    rotulo: 'Registro do feedback',
    texto: 'FIZ FEEDBACK COM {cliente} POR {canal} ({contato}) DIA {dataHora}.',
    obrigatorios: ['cliente'],
  },
  confirmouMudanca: {
    rotulo: 'Cliente confirmou a mudança de ponto',
    texto:
      'CLIENTE CONFIRMOU MUDANÇA DE PONTO INTERNO, CONFIRMOU QUE NO LOCAL INSTALADO FICOU DE SEU AGRADO.',
    obrigatorios: [],
  },
  desinstaladoDe: {
    rotulo: 'Cômodo de origem',
    texto: 'EQUIPAMENTO DESINSTALADO DE: {comodoAnterior}',
    obrigatorios: [],
  },
  reinstaladoEm: {
    rotulo: 'Cômodo de destino',
    texto: 'REINSTALADO EM: {comodoAtual}',
    obrigatorios: [],
  },
  testesRealizados: {
    rotulo: 'Testes realizados após a mudança',
    texto:
      'CONFIRMOU QUE APÓS A TROCA FOI FEITO TODOS OS TESTES DE FUNCIONAMENTO DA INTERNET, TESTE DE ABRANGÊNCIA E AFERIÇÃO NOS APARELHOS DO TECNICO E EM SEUS PESSOAIS.',
    obrigatorios: [],
  },
  dispensouTestes: {
    rotulo: 'Cliente dispensou testes nos aparelhos dele',
    texto: 'CLIENTE DISPENSOU OS TESTES EM SEUS DISPOSITIVOS PESSOAIS.',
    obrigatorios: [],
  },
  aparelhoTestado: {
    rotulo: 'Resultado dos testes de velocidade',
    texto:
      'APARELHO TESTADO: {aparelho} {marcaModelo} AFERIU {velocidadeCliente}MBPS. NOTEBOOK DO TÉCNICO VIA CABO DE REDE AFERIU {velocidadeCabo}MBPS E {velocidadeWifi}MBPS VIA WI-FI NA REDE 5G.',
    obrigatorios: [],
  },
  equipamentoLigado: {
    rotulo: 'Onde o equipamento está ligado',
    texto: 'EQUIPAMENTO LIGADO EM {energia}.',
    obrigatorios: [],
  },
  osComCusto: {
    rotulo: 'Custo da O.S',
    texto: 'O.S COM CUSTO DE R$ {valorOS} PAGO {formaPagFrase}.',
    obrigatorios: [],
  },
  semDuvidas: {
    rotulo: 'Encerramento',
    texto: 'CLIENTE SEM DUVIDAS.',
    obrigatorios: [],
  },
};
