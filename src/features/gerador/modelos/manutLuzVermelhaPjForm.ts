/**
 * Config do formulário do modelo `manut-luz-vermelha-pj` (coluna esquerda do
 * gerador). Campos, seções e opções extraídos do bundle legado — ver
 * `docs/gerador/sondagem2-suporte.json` (slug "manut-luz-vermelha-pj"). Este
 * modelo NÃO tem variável `tipoSolicitacao`, então não há pill de variável.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, type Opcao } from '../catalogo';
import type { ModeloForm } from './altplanRemotoForm';

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

const FORMAS_PAG: Opcao[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTAO' },
];

export const MANUT_LUZ_VERMELHA_PJ_FORM: ModeloForm = {
  slug: 'manut-luz-vermelha-pj',
  demanda: 'manutencao',
  titulo: 'Luz vermelha — pessoa jurídica',
  descricao: 'Manutenção de luz vermelha / PON com visita técnica (PJ).',
  modo: 'Luz vermelha · PJ',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'solicitante', label: 'Solicitante', controle: 'text', placeholder: 'Nome completo de quem solicitou o suporte', span: 6 },
        { id: 'cargo', label: 'Cargo/Função', controle: 'text', placeholder: 'Ex.: Sócio, Admin, Técnico, Gerente...', span: 6 },
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Razão Social', controle: 'text', placeholder: 'Informe o nome da empresa conforme cadastro no MK', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4 },
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
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', opcoes: FORMAS_PAG, span: 12 },
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', opcoes: HORARIOS_VISITA_SIMPLES, span: 6 },
      ],
    },
  ],
};
