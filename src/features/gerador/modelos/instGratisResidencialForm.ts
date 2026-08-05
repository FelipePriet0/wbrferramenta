/**
 * Config do formulário do modelo `inst-gratis-residencial` (instalação grátis,
 * residencial / PF). Campos, seções e opções extraídos do pacote do builder
 * legado `VXe`. O modo (titular/terceiro) não é exposto no formulário — usa
 * `segmento` (PF/PJ), então o render cai sempre no caminho padrão.
 */
import { CANAIS_INST, DIAS_VENCIMENTO, HORARIOS_VISITA, PLANOS_150, PLANOS_1G, PLANOS_300, PLANOS_600, PLANOS_ITTV, type Opcao } from '../catalogo';
import type { ModeloForm } from './altplanRemotoForm';

const SEGMENTOS: Opcao[] = [
  { value: 'PF', label: 'Pessoa Física' },
  { value: 'PJ', label: 'Pessoa Jurídica' },
];
const VELOCIDADES: Opcao[] = [
  { value: '150', label: '150 MEGA' },
  { value: '300', label: '300 MEGA' },
  { value: '600', label: '600 MEGA' },
  { value: '1g', label: '1 GIGA' },
  { value: 'ittv', label: 'ITTV' },
];

export const INST_GRATIS_RESIDENCIAL_FORM: ModeloForm = {
  slug: 'inst-gratis-residencial',
  demanda: 'instalacao-gratis',
  titulo: 'Instalação grátis',
  descricao: 'Nova instalação residencial (PF) sem taxa de instalação.',
  modo: 'Instalação grátis · Residencial (PF)',
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
        { id: 'filtroPlano', label: 'Velocidade', controle: 'radio', opcoes: VELOCIDADES, span: 12 },
        { id: 'plano150', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_150, span: 12, mostrarQuando: (v) => (v.filtroPlano || '150') === '150' },
        { id: 'plano300', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_300, span: 12, mostrarQuando: (v) => v.filtroPlano === '300' },
        { id: 'plano600', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_600, span: 12, mostrarQuando: (v) => v.filtroPlano === '600' },
        { id: 'plano1g', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_1G, span: 12, mostrarQuando: (v) => v.filtroPlano === '1g' },
        { id: 'planoIttv', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_ITTV, span: 12, mostrarQuando: (v) => v.filtroPlano === 'ittv' },
        { id: 'vencimento', label: 'Dia de vencimento', controle: 'select', opcoes: DIAS_VENCIMENTO, span: 12 },
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
