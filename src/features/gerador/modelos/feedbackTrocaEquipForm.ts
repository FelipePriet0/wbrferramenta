/**
 * Config do formulário do modelo `feedback-troca-equip` (coluna esquerda do
 * gerador). Feedback pós-visita de troca de equipamento emprestado. Campos e
 * seções extraídos do bundle legado (builder `PJe`). Modelo sem variável de
 * tipo de solicitação. Ver `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/feedbackTrocaEquip.builder.txt`.
 */
import { CANAIS, MODELOS_EQUIP } from '../catalogo';
import type { ModeloForm } from './altplanRemotoForm';

const TIPO_EQUIP: { value: string; label: string }[] = [
  { value: 'ONU', label: 'ONU' },
  { value: 'ONT', label: 'ONT' },
  { value: 'ROUTER', label: 'ROUTER' },
];

export const FEEDBACK_TROCA_EQUIP_FORM: ModeloForm = {
  slug: 'feedback-troca-equip',
  demanda: 'feedback',
  titulo: 'Feedback — Troca de equipamento',
  descricao: 'Feedback pós-visita da troca de equipamento emprestado, com aferição de velocidade.',
  modo: 'Feedback · troca equip.',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO',
      campos: [
        { id: 'cliente', label: 'Nome do cliente', controle: 'text', placeholder: 'Nome completo', span: 6 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 3 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 3 },
        { id: 'dataHora', label: 'Data e hora do feedback', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 6 },
      ],
    },
    {
      titulo: 'EQUIPAMENTOS',
      campos: [
        { id: 'tipoEquipRemovido', label: 'Tipo do equipamento removido', controle: 'radio', span: 6, opcoes: TIPO_EQUIP },
        { id: 'equipamentoRemovido', label: 'Modelo do equipamento removido', controle: 'select', opcoes: MODELOS_EQUIP, span: 6 },
        { id: 'tipoEquipInstalado', label: 'Tipo do equipamento instalado', controle: 'radio', span: 6, opcoes: TIPO_EQUIP },
        { id: 'equipamentoInstalado', label: 'Modelo do equipamento instalado', controle: 'select', opcoes: MODELOS_EQUIP, span: 6 },
      ],
    },
    {
      titulo: 'TESTES DE VELOCIDADE',
      campos: [
        { id: 'velocidadeCabo', label: 'Velocidade — cabo (Mbps)', controle: 'text', placeholder: 'Ex.: 200', span: 6 },
        { id: 'velocidadeWifi', label: 'Velocidade — Wi-Fi 5G (Mbps)', controle: 'text', placeholder: 'Ex.: 150', span: 6 },
      ],
    },
  ],
};
