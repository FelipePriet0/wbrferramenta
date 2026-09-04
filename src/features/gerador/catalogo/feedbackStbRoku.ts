/**
 * Catálogo de frases do modelo `feedback-stb-roku`.
 * Feedback após instalação e configuração de conversor ou Roku TV.
 *
 * ⚠️ NONO VAZAMENTO DE BRANDING: `appInstalado` cita o "APP MZTV".
 * Vira o nome do app da WBR no sync.
 */
import type { Catalogo } from './tipos';

export const FEEDBACK_STB_ROKU: Catalogo = {
  feedbackRealizado: {
    rotulo: 'Registro do feedback',
    texto: 'FIZ FEEDBACK COM {cliente} POR {canal} ({contato}) DIA {dataHora}.',
    obrigatorios: ['cliente'],
  },
  confirmouInstalacao: {
    rotulo: 'Cliente confirmou instalação',
    texto: '{cliente} CONFIRMOU INSTALAÇÃO E CONFIGURAÇÃO DO APARELHO {aparelho}.',
    obrigatorios: ['cliente'],
  },
  conexaoAparelho: {
    rotulo: 'Como o aparelho está conectado',
    texto: 'APARELHO CONECTADO VIA {wifiCabo}.',
    obrigatorios: [],
  },
  ligadoNaTomada: {
    rotulo: 'Aparelho ligado na tomada',
    texto: '{aparelho} LIGADO NA TOMADA ({energiaDetalhe}).',
    obrigatorios: [],
  },
  ligadoNaTv: {
    rotulo: 'Aparelho ligado na TV',
    texto: '{aparelho} LIGADO NA TV.',
    obrigatorios: [],
  },
  appInstalado: {
    // ⚠️ Cita o app do provedor. Vira o app da WBR no sync.
    rotulo: 'App de TV instalado',
    texto: 'APP MZTV INSTALADO E CONFIGURADO NO APARELHO {aparelho}.',
    obrigatorios: [],
  },
  compraEIsencao: {
    rotulo: 'Isenção da instalação e compra do aparelho',
    texto:
      'O.S DE INSTALAÇÃO ISENTA. {aparelho} ADQUIRIDO POR {valorAparelho} {formaCompra}, PAGO {formaPagFrase}.',
    obrigatorios: [],
  },
  semDuvidas: {
    rotulo: 'Encerramento',
    texto: 'CLIENTE SEM DUVIDAS',
    obrigatorios: [],
  },
  observacao: {
    rotulo: 'Observação do operador',
    texto: 'OBS: {obs}',
    obrigatorios: ['obs'],
  },
  parcelado: {
    rotulo: 'Forma de compra — parcelado',
    texto: 'PARCELADO EM {parcelas}',
    obrigatorios: [],
  },
  aVista: {
    rotulo: 'Forma de compra — à vista',
    texto: 'À VISTA',
    obrigatorios: [],
  },
};
