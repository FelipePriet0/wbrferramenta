/**
 * Config do formulário do modelo `manut-onu-queimada`. Campos, seções e
 * visibilidade condicional extraídos do bundle legado e de
 * `docs/gerador/sondagem2-suporte.json`. Estrutura idêntica ao `ont-queimada`.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, ONU_MODELOS, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

const TIPO_TITULAR_TITULAR = 'titular-solicita-titular-acompanha';
const TIPO_PJ = 'pessoa-juridica';

const temSolicitante = (v: Valores) =>
  (v.tipoSolicitacao || TIPO_TITULAR_TITULAR) !== TIPO_TITULAR_TITULAR;
const ehPJ = (v: Valores) => v.tipoSolicitacao === TIPO_PJ;
const temParente = (v: Valores) =>
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha' ||
  v.tipoSolicitacao === 'titular-solicita-terceiro-acompanha';
const temContatoSol = (v: Valores) =>
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha';

const ALARME: Opcao[] = [
  { value: 'APENAS COM A LUZ POWER ACESA', label: 'Apenas luz Power acesa' },
  { value: 'APENAS COM AS LUZES POWER/LAN ACESAS', label: 'Luzes Power e LAN acesas' },
  { value: 'COM AS LUZES APAGADAS', label: 'Luzes apagadas' },
];
const FORMA_PAG: Opcao[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTÃO' },
];
const PAGAMENTO: Opcao[] = [
  { value: 'ATO', label: 'À vista (no ato)' },
  { value: 'MENSALIDADE', label: 'Lançar na mensalidade' },
];

export const MANUT_ONU_QUEIMADA_FORM: ModeloForm = {
  slug: 'manut-onu-queimada',
  demanda: 'manutencao',
  titulo: 'ONU queimada',
  descricao: 'Manutenção de ONU sem sinal com visita técnica.',
  modo: 'ONU queimada',
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
            { value: 'pessoa-juridica', label: 'Pessoa jurídica' },
            { value: 'terceiro-solicita-terceiro-acompanha', label: 'Terceiro solicita (titular ausente)' },
            { value: 'terceiro-solicita-titular-acompanha', label: 'Terceiro solicita (titular presente)' },
            { value: 'titular-solicita-terceiro-acompanha', label: 'Titular solicita e autoriza terceiro' },
          ],
        },
      ],
    },
    {
      titulo: 'DADOS DO SOLICITANTE',
      campos: [
        { id: 'solicitante', label: 'Solicitante / autorizado', controle: 'text', placeholder: 'Nome completo de quem entrou em contato (ou autorizado)', span: 12, mostrarQuando: temSolicitante },
        { id: 'cargo', label: 'Cargo/Função', controle: 'text', placeholder: 'Ex.: Sócio, Admin, Gerente…', span: 6, mostrarQuando: ehPJ },
        { id: 'parente', label: 'Grau de relacionamento', controle: 'text', placeholder: 'Ex.: Mãe, Filho, Irmão, Esposa…', span: 6, mostrarQuando: temParente },
        { id: 'contatoSol', label: 'Contato do solicitante', controle: 'phone', placeholder: 'Somente os números', span: 6, mostrarQuando: temContatoSol },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Nome completo / Razão social', controle: 'text', placeholder: 'Nome completo (ou razão social, p/ pessoa jurídica)', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4 },
      ],
    },
    {
      titulo: 'DETALHES DA OCORRÊNCIA',
      campos: [
        { id: 'alarme', label: 'Alarme (estado da ONU)', controle: 'select', opcoes: ALARME, span: 6 },
        { id: 'onu', label: 'ONU atual (comodato)', controle: 'select', opcoes: ONU_MODELOS, span: 6 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 6 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'dataVisita', label: 'Data da visita', controle: 'text', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', span: 6, opcoes: HORARIOS_VISITA_SIMPLES },
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', opcoes: FORMA_PAG, span: 6 },
        { id: 'pagamento', label: 'Pagamento', controle: 'select', opcoes: PAGAMENTO, span: 6 },
      ],
    },
  ],
};
