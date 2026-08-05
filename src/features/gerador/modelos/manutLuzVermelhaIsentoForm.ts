/**
 * Config do formulário do modelo `manut-luz-vermelha-isento` (coluna esquerda do
 * gerador). Campos, seções e opções extraídos do bundle legado — ver
 * `docs/gerador/sondagem2-suporte.json` (slug "manut-luz-vermelha-isento").
 * Manutenção de luz vermelha com visita técnica ISENTA (dentro de 7 dias).
 * Ramifica nos 4 tipos de solicitação (titular/terceiro × acompanhamento) — o
 * render (`renderManutLuzVermelhaIsento`) lê `tipoSolicitacao`, então o seletor
 * abaixo alcança os ramos de terceiro (sem ele, caía sempre no default titular).
 */
import { CANAIS, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Terceiro entrou em contato (titular ausente ou presente). */
const terceiroEntrouEmContato = (v: Valores) =>
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha';

/** Há um terceiro envolvido (contato ou acompanhamento). */
const envolveTerceiro = (v: Valores) =>
  terceiroEntrouEmContato(v) || v.tipoSolicitacao === 'titular-solicita-terceiro-acompanha';

const ALARMES: Opcao[] = [
  { value: 'Luz vermelha', label: 'Luz vermelha' },
  { value: 'Luz PON piscando', label: 'Luz PON piscando' },
];

const ONU_ONT: Opcao[] = [
  { value: 'ONU', label: 'ONU' },
  { value: 'ONT', label: 'ONT' },
];

const TIPO_CTO: Opcao[] = [
  { value: 'CTOE', label: 'CTOE' },
  { value: 'CTOI', label: 'CTOI' },
];

const HORAS: Opcao[] = [
  { value: '08:00', label: '08:00' },
  { value: '08:30', label: '08:30' },
  { value: '10:00', label: '10:00' },
  { value: '10:30', label: '10:30' },
  { value: '13:00', label: '13:00' },
  { value: '13:30', label: '13:30' },
  { value: '15:00', label: '15:00' },
  { value: '15:30', label: '15:30' },
  { value: '16:00', label: '16:00' },
  { value: '16:30', label: '16:30' },
  { value: '17:00', label: '17:00 (somente com autorização)' },
  { value: '17:30', label: '17:30' },
  { value: '18:00', label: '18:00' },
  { value: '18:30', label: '18:30' },
  { value: 'apos-11', label: 'Após às 11:00 (aos sábados)' },
];

export const MANUT_LUZ_VERMELHA_ISENTO_FORM: ModeloForm = {
  slug: 'manut-luz-vermelha-isento',
  demanda: 'manutencao',
  titulo: 'Luz vermelha — isento (7 dias)',
  descricao: 'Manutenção de luz vermelha com visita técnica isenta (dentro de 7 dias).',
  modo: 'Luz vermelha · isento',
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
            { value: 'titular-solicita-titular-acompanha', label: 'Titular solicita e acompanha' },
            { value: 'terceiro-solicita-terceiro-acompanha', label: 'Terceiro solicita (titular ausente)' },
            { value: 'terceiro-solicita-titular-acompanha', label: 'Terceiro solicita (titular presente)' },
            { value: 'titular-solicita-terceiro-acompanha', label: 'Titular solicita e autoriza terceiro' },
          ],
        },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ do titular', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Nome completo (titular/assinante)', controle: 'text', placeholder: 'Titular da conexão', span: 8 },
        { id: 'solicitante', label: 'Nome do solicitante', controle: 'text', placeholder: 'Quem entrou em contato (se terceiro)', span: 6, mostrarQuando: envolveTerceiro },
        { id: 'parente', label: 'Grau de parentesco', controle: 'text', placeholder: 'Ex.: ESPOSA, FILHO', span: 6, mostrarQuando: envolveTerceiro },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'contatoSol', label: 'Contato do solicitante', controle: 'phone', placeholder: 'Somente os números', span: 4, mostrarQuando: terceiroEntrouEmContato },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 12 },
      ],
    },
    {
      titulo: 'DETALHES DA OCORRÊNCIA',
      campos: [
        { id: 'alarme', label: 'Alarme', controle: 'select', opcoes: ALARMES, span: 6 },
        { id: 'onu', label: 'ONU/ONT', controle: 'select', opcoes: ONU_ONT, span: 6 },
        { id: 'ctoType', label: 'Tipo CTO', controle: 'radio', opcoes: TIPO_CTO, span: 6 },
        { id: 'cto', label: 'CTO', controle: 'text', placeholder: 'Ex.: 1035-A', span: 6 },
        { id: 'passante', label: 'Localização do passante', controle: 'text', placeholder: "Ex.: 'Passante no poste próximo ao sobrado'", span: 8 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 4 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Hora', controle: 'select', opcoes: HORAS, span: 6 },
      ],
    },
  ],
};
