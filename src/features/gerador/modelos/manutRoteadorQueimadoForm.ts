/**
 * Config do formulário do modelo `manut-roteador-queimado`.
 * Campos, seções e visibilidade condicional extraídos do bundle legado.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

const TIPO_TITULAR_TITULAR = 'titular-solicita-titular-acompanha';
const temSolicitante = (v: Valores) =>
  (v.tipoSolicitacao || TIPO_TITULAR_TITULAR) !== TIPO_TITULAR_TITULAR;
const ehPJ = (v: Valores) => v.tipoSolicitacao === 'pessoa-juridica';
const temParente = (v: Valores) =>
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha' ||
  v.tipoSolicitacao === 'titular-solicita-terceiro-acompanha';
const temContatoSol = (v: Valores) =>
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha';
const ehCobrada = (v: Valores) => (v.modoCusto || 'cobrada') === 'cobrada';
const ehIsento = (v: Valores) => !ehCobrada(v);

const MODO_CUSTO: Opcao[] = [
  { value: 'cobrada', label: 'Com visita cobrada (dano ocasionado)' },
  { value: 'isento', label: 'Instalação no padrão (isento do roteador)' },
];
const FORMA_PAG: Opcao[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTÃO' },
];
const HORA: Opcao[] = [
  { value: 'AS 08:30 HRS', label: '08:30' }, { value: 'AS 09:30 HRS', label: '09:30' },
  { value: 'AS 10:30 HRS', label: '10:30' }, { value: 'AS 11:30 HRS', label: '11:30' },
  { value: 'AS 14:30 HRS', label: '14:30' }, { value: 'AS 15:30 HRS', label: '15:30' },
  { value: 'AS 16:30 HRS', label: '16:30' }, { value: 'AS 17:30 HRS', label: '17:30' },
  { value: 'NO PERIODO DA MANHA', label: 'No período da manhã' },
  { value: 'NO PERIODO DA TARDE', label: 'No período da tarde' },
];
const ROTEADOR: Opcao[] = [
  { value: 'MULTILASER', label: 'MULTILASER' },
  { value: 'TP-LINK 840', label: 'TP-LINK 840' },
  { value: 'TP LINK C-20', label: 'TP LINK C-20' },
  { value: 'D-LINK DIR 842', label: 'D-LINK DIR 842' },
  { value: 'TP LINK C-5', label: 'TP LINK C-5' },
  { value: 'TP LINK G-5', label: 'TP LINK G-5' },
  { value: 'GREATEK', label: 'GREATEK' },
  { value: 'INTELBRAS', label: 'INTELBRAS' },
  { value: 'HUAWEI AX2', label: 'HUAWEI AX2' },
  { value: 'ZTE H196-MESH', label: 'ZTE H196-MESH' },
  { value: 'ZTE H199-A', label: 'ZTE H199-A' },
];
const PAGAMENTO: Opcao[] = [
  { value: 'ATO', label: 'À vista (no ato)' },
  { value: 'MENSALIDADE', label: 'Lançar na mensalidade' },
];

export const MANUT_ROTEADOR_QUEIMADO_FORM: ModeloForm = {
  slug: 'manut-roteador-queimado',
  demanda: 'manutencao',
  titulo: 'Roteador queimado',
  descricao: 'Manutenção de roteador sem funcionamento (com/sem cobrança) e visita técnica.',
  modo: 'Roteador queimado',
  variavelId: 'tipoSolicitacao',
  secoes: [
    {
      titulo: null,
      campos: [
        { id: 'modoCusto', label: 'Modo de cobrança', controle: 'select', span: 12, opcoes: MODO_CUSTO },
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
        { id: 'solicitante', label: 'Solicitante / autorizado', controle: 'text', placeholder: 'Nome completo', span: 12, mostrarQuando: temSolicitante },
        { id: 'cargo', label: 'Cargo/Função', controle: 'text', placeholder: 'Ex.: Sócio, Gerente…', span: 6, mostrarQuando: ehPJ },
        { id: 'parente', label: 'Grau de relacionamento', controle: 'text', placeholder: 'Ex.: Mãe, Filho, Esposa…', span: 6, mostrarQuando: temParente },
        { id: 'contatoSol', label: 'Contato do solicitante', controle: 'phone', placeholder: 'Somente os números', span: 6, mostrarQuando: temContatoSol },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Nome completo / Razão social', controle: 'text', placeholder: 'Nome completo', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4 },
      ],
    },
    {
      titulo: 'DETALHES DA OCORRÊNCIA',
      campos: [
        { id: 'sinalONU', label: 'Sinal ONU', controle: 'text', placeholder: 'Ex.: -21.50DBM', span: 6 },
        { id: 'roteador', label: 'Roteador (comodato)', controle: 'select', opcoes: ROTEADOR, span: 6 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 6 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', span: 6, opcoes: HORARIOS_VISITA_SIMPLES, mostrarQuando: ehIsento },
        { id: 'horaCobrada', label: 'Hora', controle: 'select', opcoes: HORA, span: 6, mostrarQuando: ehCobrada },
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', opcoes: FORMA_PAG, span: 6 },
        { id: 'pagamento', label: 'Pagamento', controle: 'select', opcoes: PAGAMENTO, span: 6, mostrarQuando: ehCobrada },
      ],
    },
  ],
};
