/**
 * Config do formulário do modelo `feedback-stb-roku` (coluna esquerda do
 * gerador). Feedback pós-instalação de aparelho de streaming (STB/Roku). Campos
 * e seções extraídos do bundle legado (builder `cYe`). Modelo sem variável de
 * tipo de solicitação. Ver `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/feedbackStbRoku.builder.txt`.
 */
import { CANAIS, ROKU_VALORES, STB_PARCELAS, STB_VALORES } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Compra do STB é parcelada quando o valor selecionado é o de parcelamento (índice 1 do catálogo). */
const compraParcelada = (v: Valores) =>
  v.valorAparelhoStb === STB_VALORES[1].value || v.valorAparelhoRoku === ROKU_VALORES[1].value;

export const FEEDBACK_STB_ROKU_FORM: ModeloForm = {
  slug: 'feedback-stb-roku',
  demanda: 'feedback',
  titulo: 'Feedback — STB / Roku TV',
  descricao: 'Feedback pós-instalação de aparelho de streaming (STB/Roku), com registro de custos da O.S.',
  modo: 'Feedback · STB/Roku',
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
      titulo: 'INSTALAÇÃO',
      campos: [
        {
          id: 'stbRoku',
          label: 'Tipo de aparelho',
          controle: 'select',
          span: 6,
          opcoes: [
            { value: 'STB', label: 'STB' },
            { value: 'ROKU', label: 'Roku TV' },
          ],
        },
        {
          id: 'wifiCabo',
          label: 'Conexão do aparelho',
          controle: 'select',
          span: 6,
          opcoes: [
            { value: 'WI-FI', label: 'Wi-Fi' },
            { value: 'CABO DE REDE', label: 'Cabo de rede' },
          ],
        },
        {
          id: 'energia',
          label: 'Ligação elétrica',
          controle: 'radio',
          span: 6,
          opcoes: [
            { value: 'TV', label: 'Pode deixar ligado na TV' },
            { value: 'TOMADA', label: 'Na tomada' },
          ],
        },
        {
          id: 'energiaDetalhe',
          label: 'Como está a tomada',
          controle: 'text',
          placeholder: 'Ex.: direto na tomada, extensão, filtro de linha…',
          span: 6,
          mostrarQuando: (v) => v.energia === 'TOMADA',
        },
        {
          id: 'appMztv',
          label: 'App MZTV instalado?',
          controle: 'radio',
          span: 6,
          opcoes: [
            { value: 'sim', label: 'Sim — instalado e configurado' },
            { value: 'nao', label: 'Não se aplica' },
          ],
        },
      ],
    },
    {
      titulo: 'DADOS DA O.S (INSTALAÇÃO ISENTA — CUSTO É SÓ DO APARELHO)',
      campos: [
        {
          id: 'valorAparelhoStb',
          label: 'Compra do STB',
          controle: 'select',
          span: 6,
          opcoes: STB_VALORES,
          mostrarQuando: (v) => v.stbRoku !== 'ROKU',
        },
        {
          id: 'valorAparelhoRoku',
          label: 'Compra do Roku',
          controle: 'select',
          span: 6,
          opcoes: ROKU_VALORES,
          mostrarQuando: (v) => v.stbRoku === 'ROKU',
        },
        {
          id: 'parcelas',
          label: 'Parcelas',
          controle: 'select',
          span: 6,
          opcoes: STB_PARCELAS,
          mostrarQuando: compraParcelada,
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
        // `obs` é textarea no legado; o tipo ControleCampo ainda não tem 'textarea',
        // então usamos 'text' (controle mais próximo suportado) sem tocar no renderer.
        { id: 'obs', label: 'Observação', controle: 'text', placeholder: 'Informações adicionais (opcional)', span: 12 },
      ],
    },
  ],
};
