/**
 * Catálogo de frases do modelo `feedback-troca-equip` — versão da WBR.
 *
 * ⚠️ DIVERGE DA TOOLMZNET DE PROPÓSITO. Lá o modelo já ganhou MAC do
 * equipamento removido/instalado, campo de observação, a opção "cliente
 * dispensou os testes" e a redação nova (5.8G em vez de 5G). A WBR ainda está
 * na versão anterior, e este catálogo reflete a WBR — as fixtures daqui cobram
 * exatamente este texto.
 *
 * Trazer a melhoria da toolmznet é uma decisão de produto separada: exige
 * sincronizar também o formulário (os campos macRemovido, macInstalado,
 * testesCliente e observacao não existem aqui) e atualizar as fixtures.
 */
import type { Catalogo } from './tipos';

export const FEEDBACK_TROCA_EQUIP: Catalogo = {
  feedbackRealizado: {
    rotulo: 'Registro do feedback',
    texto: 'FIZ FEEDBACK COM {cliente} POR {canal} ({contato}) DIA {dataHora}.',
    obrigatorios: ['cliente'],
  },
  motivoVisita: {
    rotulo: 'Motivo da visita e resultado',
    texto:
      'VISITA REALIZADA REFERENTE A UM PROBLEMA NO EQUIPAMENTO EMPRESTADO. FOI EFETUADA A TROCA DO EQUIPAMENTO E O ACESSO FOI RESTABELECIDO.',
    obrigatorios: [],
  },
  confirmouTroca: {
    rotulo: 'Cliente confirmou a troca',
    texto: 'CLIENTE CONFIRMOU A TROCA DO EQUIPAMENTO.',
    obrigatorios: [],
  },
  desinstalado: {
    rotulo: 'Equipamento desinstalado',
    texto: 'DESINSTALADO: {equipRemovido}',
    obrigatorios: [],
  },
  instalado: {
    rotulo: 'Equipamento instalado',
    texto: 'INSTALADO: {equipInstalado}',
    obrigatorios: [],
  },
  testesRealizados: {
    rotulo: 'Testes de aferição realizados',
    texto: 'CLIENTE CONFIRMOU QUE FOI REALIZADO TESTES DE AFERIÇÃO DA VELOCIDADE E REDE 2.4G E 5G.',
    obrigatorios: [],
  },
  aferricaoNotebook: {
    rotulo: 'Aferição no notebook do técnico',
    texto:
      'NOTEBOOK DO TÉCNICO VIA CABO DE REDE AFERIU {velocidadeCabo}MEGA. VIA WI-FI CONECTADO NA REDE 5G AFERIU {velocidadeWifi}MEGA.',
    obrigatorios: [],
  },
  tomadaIndividual: {
    rotulo: 'Instalação elétrica',
    texto: 'EQUIPAMENTOS INSTALADOS EM TOMADA INDIVIDUAL.',
    obrigatorios: [],
  },
  osSemCusto: {
    rotulo: 'O.S sem custo',
    texto: 'O.S. SEM CUSTOS.',
    obrigatorios: [],
  },
};
