/**
 * Config do formulário do modelo `feedback-man-ocasionado` (coluna esquerda do
 * gerador). Campos, seções e visibilidade condicional extraídos do bundle legado
 * (builder `EJe`). Modelo SEM variável de tipo (`variavelId: ''`). Ver
 * `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/feedbackManOcasionado.builder.txt`.
 */
import { CANAIS } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** O.S com custos → mostra valor e forma de pagamento. (builder: c === 'sim') */
const temCustos = (v: Valores) => v.osComCustos === 'sim';

export const FEEDBACK_MAN_OCASIONADO_FORM: ModeloForm = {
  slug: 'feedback-man-ocasionado',
  demanda: 'feedback',
  titulo: 'Feedback — Manutenção ocasionado',
  descricao: 'Feedback pós-manutenção com dano ocasionado: acesso normalizado e custos da O.S.',
  modo: 'Feedback · ocasionado',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO',
      campos: [
        { id: 'cliente', label: 'Nome do cliente', controle: 'text', placeholder: 'Nome completo', span: 6 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 6 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 6 },
        { id: 'dataHora', label: 'Data e hora do feedback', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 6 },
      ],
    },
    {
      titulo: 'DADOS DA O.S',
      campos: [
        {
          id: 'reparoLocal',
          label: 'Local do reparo',
          controle: 'radio',
          span: 6,
          opcoes: [
            { value: 'INTERNO', label: 'Interno' },
            { value: 'EXTERNO', label: 'Externo' },
          ],
        },
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
        { id: 'obs', label: 'Observação', controle: 'text', placeholder: 'Informações adicionais (opcional)', span: 12 },
      ],
    },
  ],
};
