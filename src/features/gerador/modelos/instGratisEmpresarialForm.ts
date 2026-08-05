/**
 * Config do formulário do modelo `inst-gratis-empresarial` (Instalação grátis ·
 * Empresarial/PJ). Campos extraídos do pacote do legado
 * (`docs/gerador/builders/instGratisEmpresarial.builder.txt`).
 */
import { CANAIS_INST, DIAS_VENCIMENTO, HORARIOS_VISITA, PLANOS_150, PLANOS_1G, PLANOS_300, PLANOS_600, PLANOS_ITTV, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

const SEGMENTOS: Opcao[] = [
  { value: 'PF', label: 'Pessoa Física' },
  { value: 'PJ', label: 'Pessoa Jurídica' },
];

const TIPOS_SOLICITACAO: Opcao[] = [
  { value: 'titular-acompanha', label: 'Titular solicita e acompanha' },
  { value: 'titular-autoriza', label: 'Titular solicita e autoriza terceiro' },
  { value: 'terceiro-autoriza', label: 'Terceiro solicita, titular autoriza terceiro' },
  { value: 'terceiro-acompanha', label: 'Terceiro solicita, titular acompanha' },
];

export const INST_GRATIS_EMPRESARIAL_FORM: ModeloForm = {
  slug: 'inst-gratis-empresarial',
  demanda: 'instalacao-gratis',
  titulo: 'Instalação grátis empresarial',
  descricao: 'Instalação grátis para empresa — proprietário/representante e agendamento.',
  modo: 'Instalação grátis · Empresarial (PJ)',
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
          opcoes: TIPOS_SOLICITACAO,
        },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO',
      campos: [
        { id: 'cliente', label: 'Nome do proprietário da empresa', controle: 'text', placeholder: 'Nome do proprietário', span: 6 },
        { id: 'solicitante', label: 'Nome do representante autorizado', controle: 'text', placeholder: 'Quem entrou em contato', span: 6 },
        { id: 'parente', label: 'Cargo / função', controle: 'text', placeholder: 'Ex.: GERENTE, SÓCIO', span: 6 },
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
        { id: 'plano150', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_150, span: 12, mostrarQuando: (v: Valores) => (v.filtroPlano || '150') === '150' },
        { id: 'plano300', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_300, span: 12, mostrarQuando: (v: Valores) => v.filtroPlano === '300' },
        { id: 'plano600', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_600, span: 12, mostrarQuando: (v: Valores) => v.filtroPlano === '600' },
        { id: 'plano1g', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_1G, span: 12, mostrarQuando: (v: Valores) => v.filtroPlano === '1g' },
        { id: 'planoIttv', label: 'Plano de acesso', controle: 'select', opcoes: PLANOS_ITTV, span: 12, mostrarQuando: (v: Valores) => v.filtroPlano === 'ittv' },
        { id: 'vencimento', label: 'Dia de vencimento', controle: 'select', opcoes: DIAS_VENCIMENTO, span: 6 },
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
