/**
 * Config do formulário do modelo `feedback-altplan` (coluna esquerda do
 * gerador). Feedback de alteração de plano. Campos, seções e visibilidade
 * condicional (`mostrarQuando`) extraídos do bundle legado (builder `ZJe`).
 * Modelo sem variável de tipo de solicitação. Ver
 * `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/feedbackAltplan.builder.txt`.
 */
import { CANAIS } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Sem troca de roteador (default 'nao') — mostra o modelo instalado. */
const semTroca = (v: Valores) => (v.trocaRoteador || 'nao') === 'nao';
/** Testes realizados (default 'nao') — mostra o bloco de aferição. */
const testesRealizados = (v: Valores) => (v.dispensouTestes || 'nao') === 'nao';
/** Equipamentos instalados em "OUTRO" — mostra o campo livre. */
const energiaEhOutro = (v: Valores) => v.energia === 'OUTRO';
/** O.S teve custos (radio osComCustos === 'sim'). */
const temCustos = (v: Valores) => v.osComCustos === 'sim';

const TEXTAREA = 'textarea' as ModeloForm['secoes'][number]['campos'][number]['controle'];

export const FEEDBACK_ALTPLAN_FORM: ModeloForm = {
  slug: 'feedback-altplan',
  demanda: 'feedback',
  titulo: 'Feedback — Alteração de plano',
  descricao: 'Feedback pós-alteração de plano: confirmação da troca, testes de aferição e custos da O.S.',
  modo: 'Feedback · alt. plano',
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
      titulo: 'ALTERAÇÃO DE PLANO',
      campos: [
        { id: 'plano', label: 'Plano contratado', controle: 'text', placeholder: 'Ex.: 300MB', span: 6 },
        {
          id: 'trocaRoteador',
          label: 'Houve troca de roteador?',
          controle: 'radio',
          span: 6,
          opcoes: [
            { value: 'sim', label: 'Sim — roteador trocado' },
            { value: 'nao', label: 'Não — mesmo roteador' },
          ],
        },
        { id: 'modeloRoteador', label: 'Modelo do roteador (sem troca)', controle: 'text', placeholder: 'Ex.: ZTE H199', span: 6, mostrarQuando: semTroca },
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
        {
          id: 'possuiEquipamento',
          label: 'Cliente possui aparelho para aferição?',
          controle: 'radio',
          span: 6,
          mostrarQuando: testesRealizados,
          opcoes: [
            { value: 'sim', label: 'Sim — possui' },
            { value: 'nao', label: 'Não — não possui' },
          ],
        },
        { id: 'aparelho', label: 'Aparelho testado', controle: 'text', placeholder: 'Ex.: Celular, Notebook', span: 6, mostrarQuando: testesRealizados },
        { id: 'marcaModelo', label: 'Marca / Modelo', controle: 'text', placeholder: 'Ex.: Samsung A54', span: 6, mostrarQuando: testesRealizados },
        { id: 'velocidade', label: 'Velocidade cliente (Mbps)', controle: 'text', placeholder: 'Ex.: 280', span: 6, mostrarQuando: testesRealizados },
        {
          id: 'wifiCabo',
          label: 'Via',
          controle: 'select',
          span: 4,
          mostrarQuando: testesRealizados,
          opcoes: [
            { value: 'WI-FI', label: 'Wi-Fi' },
            { value: 'CABO', label: 'Cabo' },
          ],
        },
        { id: 'caboTec', label: 'Técnico — cabo (Mbps)', controle: 'text', placeholder: 'Ex.: 300', span: 4, mostrarQuando: testesRealizados },
        { id: 'wifiTec', label: 'Técnico — Wi-Fi 5G (Mbps)', controle: 'text', placeholder: 'Ex.: 290', span: 4, mostrarQuando: testesRealizados },
      ],
    },
    {
      titulo: 'DADOS DA O.S',
      campos: [
        {
          id: 'energia',
          label: 'Equipamentos instalados em',
          controle: 'select',
          span: 6,
          opcoes: [
            { value: 'TOMADA', label: 'Tomada' },
            { value: 'EXTENSÃO', label: 'Extensão' },
            { value: 'T DE ENERGIA', label: 'T de energia' },
            { value: 'OUTRO', label: 'Outro' },
          ],
        },
        { id: 'energiaOutro', label: 'Outro — especificar', controle: 'text', placeholder: 'Especifique onde', span: 6, mostrarQuando: energiaEhOutro },
        {
          id: 'osComCustos',
          label: 'A O.S teve custos?',
          controle: 'radio',
          span: 12,
          opcoes: [
            { value: 'nao', label: 'Não — sem custos' },
            { value: 'sim', label: 'Sim — com custos' },
          ],
        },
        { id: 'valorOS', label: 'Valor da O.S (R$)', controle: 'text', placeholder: '50,00', span: 6, mostrarQuando: temCustos },
        { id: 'obs', label: 'Observação', controle: TEXTAREA, placeholder: 'Informações adicionais (opcional)', span: 12 },
      ],
    },
  ],
};
