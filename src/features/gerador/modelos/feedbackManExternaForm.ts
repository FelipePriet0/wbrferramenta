/**
 * Config do formulário do modelo `feedback-man-externa` (coluna esquerda do
 * gerador). Feedback de manutenção externa. Campos e seções extraídos do bundle
 * legado (builder `_Je`). Modelo sem variável de tipo de solicitação. Ver
 * `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/feedbackManExterna.builder.txt`.
 */
import { CANAIS } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** O.S teve custos (radio osComCustos === 'sim'). */
const temCustos = (v: Valores) => v.osComCustos === 'sim';

export const FEEDBACK_MAN_EXTERNA_FORM: ModeloForm = {
  slug: 'feedback-man-externa',
  demanda: 'feedback',
  titulo: 'Feedback — Manutenção externa',
  descricao: 'Feedback pós-reparo de manutenção externa, com registro de custos da O.S.',
  modo: 'Feedback · manut. externa',
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
      titulo: 'DADOS DA O.S',
      campos: [
        {
          id: 'osComCustos',
          label: 'A O.S teve custos?',
          controle: 'radio',
          span: 12,
          opcoes: [
            { value: 'sim', label: 'Sim — com custos' },
            { value: 'nao', label: 'Não — sem custos' },
          ],
        },
        { id: 'valorOS', label: 'Valor da O.S (R$)', controle: 'text', placeholder: '50,00', span: 6, mostrarQuando: temCustos },
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
          mostrarQuando: temCustos,
          opcoes: [
            { value: 'PIX', label: 'PIX' },
            { value: 'DINHEIRO', label: 'DINHEIRO' },
            { value: 'CARTÃO', label: 'CARTÃO' },
          ],
        },
        // `obs` é textarea no legado; o tipo ControleCampo ainda não tem 'textarea',
        // então usamos 'text' (controle mais próximo suportado) sem tocar no renderer.
        { id: 'obs', label: 'Observação', controle: 'text', placeholder: 'Informações adicionais (opcional)', span: 12 },
      ],
    },
  ],
};
