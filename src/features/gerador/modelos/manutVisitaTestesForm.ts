/**
 * Config do formulário do modelo `manut-visita-testes` (coluna esquerda do
 * gerador). Campos, seções, opções e visibilidade condicional (`mostrarQuando`),
 * extraídos do bundle legado (`vGe`) e da sondagem. Ver
 * `docs/gerador/sondagem2-suporte.json` (slug "manut-visita-testes").
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Família pessoa jurídica — usa nome/cargo do solicitante. (legado: yGe) */
const ehPJ = (v: Valores) =>
  v.tipoSolicitacao === 'pessoa-juridica' ||
  v.tipoSolicitacao === 'isento-pj' ||
  v.tipoSolicitacao === 'disp-pj';

/** Dispensou o suporte remoto — não coleta sinal/dispositivos. */
const ehDispensou = (v: Valores) =>
  v.tipoSolicitacao === 'disp-pf' || v.tipoSolicitacao === 'disp-pj';

/** Coleta de sinal/dispositivos: todos menos os que dispensaram. (legado: ij) */
const coletaSinal = (v: Valores) => !ehDispensou(v);

/** Isenção — exige gestor autorizador, sem forma de pagamento. */
const ehIsento = (v: Valores) =>
  v.tipoSolicitacao === 'isento-pf' || v.tipoSolicitacao === 'isento-pj';

/** Forma de pagamento: PF/PJ e dispensou-remoto (não-isentos). */
const cobraPagamento = (v: Valores) => !ehIsento(v);

const OSCILA: Opcao[] = [
  { value: 'Com oscilacao', label: 'Com oscilação' },
  { value: 'Sem oscilacao', label: 'Sem oscilação' },
];

const REPETIDORES: Opcao[] = [
  { value: 'Via Wi-Fi', label: 'Repetidor via Wi-Fi' },
  { value: 'Via cabo', label: 'Repetidor via cabo' },
  { value: 'Wi-Fi Extend via Mesh', label: 'Wi-Fi Extend via Mesh' },
  { value: 'Wi-Fi Extend via cabo', label: 'Wi-Fi Extend via cabo' },
  { value: 'Não há', label: 'Sem repetidor' },
];

const GESTORES: Opcao[] = [
  { value: 'DEIVIT', label: 'DEIVIT' },
  { value: 'HIAGO', label: 'HIAGO' },
];

const FORMAS_PAG: Opcao[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTÃO' },
];

export const MANUT_VISITA_TESTES_FORM: ModeloForm = {
  slug: 'manut-visita-testes',
  demanda: 'manutencao',
  titulo: 'Visita de Testes',
  descricao: 'Visita técnica para aferir “problemas de internet” que o cliente diz ter.',
  modo: 'Visita de testes',
  variavelId: 'tipoSolicitacao',
  secoes: [
    {
      titulo: null,
      campos: [
        {
          id: 'tipoSolicitacao',
          label: 'Tipo de solicitação',
          controle: 'select',
          span: 12,
          opcoes: [
            { value: 'pf', label: 'Pessoa física' },
            { value: 'pessoa-juridica', label: 'Pessoa jurídica' },
            { value: 'isento-pf', label: 'Isento — pessoa física' },
            { value: 'isento-pj', label: 'Isento — pessoa jurídica' },
            { value: 'disp-pf', label: 'Dispensou suporte remoto — pessoa física' },
            { value: 'disp-pj', label: 'Dispensou suporte remoto — pessoa jurídica' },
          ],
        },
      ],
    },
    {
      titulo: 'DADOS DO SOLICITANTE',
      campos: [
        { id: 'solicitante', label: 'Solicitante', controle: 'text', placeholder: 'Nome completo de quem entrou em contato', span: 6, mostrarQuando: ehPJ },
        { id: 'cargo', label: 'Cargo / função', controle: 'text', placeholder: 'Ex.: Sócio, Admin, Gerente…', span: 6, mostrarQuando: ehPJ },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cliente', label: 'Nome completo / Razão social', controle: 'text', placeholder: 'Nome completo (ou razão social, p/ pessoa jurídica)', span: 12 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4 },
      ],
    },
    {
      titulo: 'DETALHES DA SOLICITAÇÃO',
      campos: [
        { id: 'sinalONU', label: 'Sinal ONU', controle: 'text', placeholder: '-19.20 DBM', span: 6, mostrarQuando: coletaSinal },
        { id: 'oscila', label: 'Sinal oscilando?', controle: 'select', opcoes: OSCILA, span: 6, mostrarQuando: coletaSinal },
        { id: 'repetidor', label: 'Repetidor de sinal', controle: 'select', opcoes: REPETIDORES, span: 6, mostrarQuando: coletaSinal },
        { id: 'disp1', label: 'Total de aparelhos conectados', controle: 'text', placeholder: 'Apenas números', span: 6, mostrarQuando: coletaSinal },
        { id: 'disp2', label: 'Via Wi-Fi', controle: 'text', placeholder: 'Apenas números', span: 6, mostrarQuando: coletaSinal },
        { id: 'disp3', label: 'Via cabo', controle: 'text', placeholder: 'Apenas números', span: 6, mostrarQuando: coletaSinal },
        { id: 'gestor', label: 'Isenção autorizada por', controle: 'select', opcoes: GESTORES, span: 6, mostrarQuando: ehIsento },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', opcoes: FORMAS_PAG, span: 6, mostrarQuando: cobraPagamento },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 6 },
        { id: 'dataVisita', label: 'Data da visita', controle: 'text', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', span: 6, opcoes: HORARIOS_VISITA_SIMPLES },
      ],
    },
  ],
};
