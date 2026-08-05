/**
 * Config do formulário do modelo `midia-stb-padrao` (coluna esquerda do
 * gerador). Compra de STB (conversor de mídia). Campos e seções extraídos do
 * bundle legado (builder `iqe`). Modelo sem variável de tipo de solicitação.
 * Ver `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/midiaStbPadrao.builder.txt`.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, STB_PARCELAS, STB_VALORES } from '../catalogo';
import type { ModeloForm } from './altplanRemotoForm';

export const MIDIA_STB_PADRAO_FORM: ModeloForm = {
  slug: 'midia-stb-padrao',
  demanda: 'midia-tv',
  titulo: 'Compra STB — Padrão',
  descricao: 'Compra de STB (conversor de mídia) com agendamento de visita técnica.',
  modo: 'STB · padrão',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cliente', label: 'Nome Completo', controle: 'text', placeholder: 'Nome completo', span: 6 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 3 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 3 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 6 },
      ],
    },
    {
      titulo: 'DETALHES DA COMPRA',
      campos: [
        { id: 'valorSTB', label: 'Tipo da compra', controle: 'select', span: 4, opcoes: STB_VALORES },
        { id: 'parcelas', label: 'Parcelas', controle: 'select', span: 4, opcoes: STB_PARCELAS },
        {
          id: 'formaPag',
          label: 'Forma de pagamento',
          controle: 'select',
          span: 4,
          opcoes: [
            { value: 'PIX', label: 'PIX' },
            { value: 'DINHEIRO', label: 'DINHEIRO' },
            { value: 'CARTAO', label: 'CARTAO' },
          ],
        },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Horário', controle: 'select', span: 6, opcoes: HORARIOS_VISITA_SIMPLES },
        { id: 'protocolo', label: 'Nº Protocolo', controle: 'text', placeholder: '123.456', span: 6 },
      ],
    },
  ],
};
