/**
 * Config do formulário do modelo `inst-taxa-residencial` (instalação com taxa,
 * residencial/PF). Campos, seções, opções e visibilidade condicional extraídos
 * do bundle legado (builder `SZe`).
 */
import { CANAIS_INST, DIAS_VENCIMENTO, HORARIOS_VISITA, PLANOS_150, PLANOS_1G, PLANOS_300, PLANOS_600, PLANOS_ITTV, type Opcao } from '../catalogo';
import type { ModeloForm } from './altplanRemotoForm';

const FORMA_PAG: Opcao[] = [
  { value: 'Cartão', label: 'Cartão' },
  { value: 'Dinheiro', label: 'Dinheiro' },
  { value: 'Pix', label: 'Pix' },
];

const PARCELAS: Opcao[] = [
  { value: '1X', label: 'À vista (1x)' },
  { value: '2X', label: '2x' },
  { value: '3X', label: '3x' },
];

const VALORES_TAXA: Opcao[] = [
  { value: 'R$250,00', label: 'Taxa de R$250,00' },
  { value: 'R$350,00', label: 'Taxa de R$350,00' },
];

export const INST_TAXA_RESIDENCIAL_FORM: ModeloForm = {
  slug: 'inst-taxa-residencial',
  demanda: 'instalacao-taxa',
  titulo: 'Instalação com taxa',
  descricao: 'Nova instalação residencial (PF) com taxa de instalação/ativação.',
  modo: 'Instalação com taxa · Residencial (PF)',
  variavelId: 'tipoSolicitacao',
  secoes: [
    {
      titulo: null,
      campos: [
        {
          id: 'tipoSolicitacao',
          label: 'Tipo de solicitação',
          controle: 'radio',
          span: 12,
          opcoes: [
            { value: 'titular-acompanha', label: 'Titular solicita e acompanha' },
            { value: 'titular-autoriza', label: 'Titular solicita e autoriza terceiro' },
            { value: 'terceiro-autoriza', label: 'Terceiro solicita, titular autoriza terceiro' },
            { value: 'terceiro-acompanha', label: 'Terceiro solicita, titular acompanha' },
          ],
        },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO',
      campos: [
        { id: 'cliente', label: 'Nome do titular (contrato)', controle: 'text', placeholder: 'Titular do contrato', span: 6 },
        { id: 'solicitante', label: 'Nome do solicitante / terceiro', controle: 'text', placeholder: 'Quem solicitou', span: 6 },
        { id: 'parente', label: 'Parentesco / relação com o titular', controle: 'text', placeholder: 'Ex.: ESPOSA, FILHO', span: 6 },
        { id: 'canal', label: 'Canal de atendimento', controle: 'select', opcoes: CANAIS_INST, span: 3 },
        { id: 'contato', label: 'Número de contato', controle: 'phone', placeholder: 'Somente os números', span: 3 },
      ],
    },
    {
      titulo: 'PLANO',
      campos: [
        {
          id: 'filtroPlano',
          label: 'Velocidade',
          controle: 'radio',
          span: 12,
          opcoes: [
            { value: '150', label: '150 MEGA' },
            { value: '300', label: '300 MEGA' },
            { value: '600', label: '600 MEGA' },
            { value: '1g', label: '1 GIGA' },
            { value: 'ittv', label: 'ITTV' },
          ],
        },
        { id: 'plano150', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_150, span: 12, mostrarQuando: (v) => (v.filtroPlano || '150') === '150' },
        { id: 'plano300', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_300, span: 12, mostrarQuando: (v) => v.filtroPlano === '300' },
        { id: 'plano600', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_600, span: 12, mostrarQuando: (v) => v.filtroPlano === '600' },
        { id: 'plano1g', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_1G, span: 12, mostrarQuando: (v) => v.filtroPlano === '1g' },
        { id: 'planoIttv', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_ITTV, span: 12, mostrarQuando: (v) => v.filtroPlano === 'ittv' },
        { id: 'vencimento', label: 'Dia de vencimento', controle: 'select', opcoes: DIAS_VENCIMENTO, span: 6 },
        { id: 'valorTaxa', label: 'Valor da taxa de instalação/ativação', controle: 'select', opcoes: VALORES_TAXA, span: 6 },
        { id: 'formaPag', label: 'Forma de pagamento da taxa', controle: 'select', opcoes: FORMA_PAG, span: 6 },
        { id: 'parcelas', label: 'Parcelas', controle: 'select', opcoes: PARCELAS, span: 6 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Horário', controle: 'select', opcoes: HORARIOS_VISITA, span: 6 },
      ],
    },
  ],
};
