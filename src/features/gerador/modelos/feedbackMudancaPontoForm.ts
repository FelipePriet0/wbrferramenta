/**
 * Config do formulário do modelo `feedback-mudanca-ponto` (coluna esquerda do
 * gerador). Feedback de mudança de ponto interno. Campos e seções extraídos do
 * bundle legado (builder `UJe`). Modelo sem variável de tipo de solicitação. Ver
 * `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/feedbackMudancaPonto.builder.txt`.
 */
import { CANAIS } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Testes realizados (radio dispensouTestes !== 'sim' → mostra os aferimentos). */
const realizouTestes = (v: Valores) => v.dispensouTestes !== 'sim';

export const FEEDBACK_MUDANCA_PONTO_FORM: ModeloForm = {
  slug: 'feedback-mudanca-ponto',
  demanda: 'feedback',
  titulo: 'Feedback — Mudança de ponto interno',
  descricao: 'Feedback pós-troca de ponto interno, com aferições de velocidade e custos da O.S.',
  modo: 'Feedback · mudança ponto',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO',
      campos: [
        { id: 'cliente', label: 'Nome do cliente', controle: 'text', placeholder: 'Nome completo', span: 6 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 3 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 3 },
        { id: 'dataHora', label: 'Data e hora do feedback', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 6 },
      ],
    },
    {
      titulo: 'LOCAIS',
      campos: [
        { id: 'comodoAnterior', label: 'Cômodo anterior (onde estava)', controle: 'text', placeholder: 'Ex.: SALA, QUARTO', span: 6 },
        { id: 'comodoAtual', label: 'Cômodo atual (onde foi reinstalado)', controle: 'text', placeholder: 'Ex.: QUARTO, ESCRITÓRIO', span: 6 },
      ],
    },
    {
      titulo: 'TESTES',
      campos: [
        {
          id: 'dispensouTestes',
          label: 'Cliente dispensou testes?',
          controle: 'radio',
          span: 12,
          opcoes: [
            { value: 'nao', label: 'Não — testes realizados' },
            { value: 'sim', label: 'Sim — dispensou os testes' },
          ],
        },
        { id: 'aparelho', label: 'Aparelho testado', controle: 'text', placeholder: 'Ex.: CELULAR, NOTEBOOK', span: 6, mostrarQuando: realizouTestes },
        { id: 'marcaModelo', label: 'Marca / Modelo', controle: 'text', placeholder: 'Ex.: SAMSUNG A54', span: 6, mostrarQuando: realizouTestes },
        { id: 'velocidadeCliente', label: 'Velocidade cliente (Mbps)', controle: 'text', placeholder: 'Ex.: 150', span: 4, mostrarQuando: realizouTestes },
        { id: 'velocidadeCabo', label: 'Técnico via cabo (Mbps)', controle: 'text', placeholder: 'Ex.: 200', span: 4, mostrarQuando: realizouTestes },
        { id: 'velocidadeWifi', label: 'Técnico Wi-Fi 5G (Mbps)', controle: 'text', placeholder: 'Ex.: 180', span: 4, mostrarQuando: realizouTestes },
      ],
    },
    {
      titulo: 'DADOS DA O.S',
      campos: [
        { id: 'valorOS', label: 'Valor da O.S (R$)', controle: 'text', placeholder: '80,00', span: 6 },
        {
          id: 'energia',
          label: 'Equipamento ligado em',
          controle: 'select',
          span: 6,
          opcoes: [
            { value: 'TOMADA', label: 'Tomada' },
            { value: 'T DE ENERGIA', label: 'T de energia' },
            { value: 'ESTABILIZADOR', label: 'Estabilizador' },
            { value: 'FILTRO DE LINHA', label: 'Filtro de linha' },
            { value: 'EXTENSÃO', label: 'Extensão' },
          ],
        },
        {
          id: 'formaPagamento',
          label: 'Forma de pagamento',
          controle: 'select',
          span: 6,
          opcoes: [
            { value: 'PIX', label: 'PIX' },
            { value: 'DINHEIRO', label: 'DINHEIRO' },
            { value: 'CARTÃO', label: 'CARTÃO' },
          ],
        },
      ],
    },
  ],
};
