/**
 * Config do formulário do modelo `manut-realoc-fibra` (coluna esquerda do
 * gerador). Campos, seções, opções e visibilidade condicional (`mostrarQuando`),
 * extraídos do bundle legado. Modelo de MANUTENÇÃO (remanejamento de fibra) com
 * variável `tipoSolicitacao` (5 fluxos). Ver `docs/gerador/sondagem2-suporte.json`
 * e `docs/gerador/builders/manutRealocFibra.builder.txt`.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

const VALORES: Opcao[] = [
  { value: 'R$50,00', label: 'R$50,00' },
  { value: 'R$100,00', label: 'R$100,00' },
  { value: 'R$50 OU R$100', label: 'R$50 ou R$100' },
];

const FORMAS_PAGAMENTO: Opcao[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTÃO' },
];

const TIPOS_SOLICITACAO: Opcao[] = [
  { value: 'titular-solicita-titular-acompanha', label: 'Titular solicita e acompanha' },
  { value: 'pessoa-juridica', label: 'Pessoa jurídica' },
  { value: 'terceiro-solicita-terceiro-acompanha', label: 'Terceiro solicita (titular ausente)' },
  { value: 'terceiro-solicita-titular-acompanha', label: 'Terceiro solicita (titular presente)' },
  { value: 'titular-solicita-terceiro-acompanha', label: 'Titular solicita e autoriza terceiro' },
];

const mostraSolicitante = (v: Valores) =>
  v.tipoSolicitacao === 'pessoa-juridica' ||
  v.tipoSolicitacao === 'titular-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha';

const ehPJ = (v: Valores) => v.tipoSolicitacao === 'pessoa-juridica';

const mostraParente = (v: Valores) =>
  v.tipoSolicitacao === 'titular-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha';

const mostraContatoSol = (v: Valores) =>
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha';

export const MANUT_REALOC_FIBRA_FORM: ModeloForm = {
  slug: 'manut-realoc-fibra',
  demanda: 'manutencao',
  titulo: 'Remanejamento de fibra',
  descricao: 'Visita técnica para remanejar a fibra do cliente.',
  modo: 'Remanejamento de fibra',
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
          opcoes: TIPOS_SOLICITACAO,
        },
      ],
    },
    {
      titulo: 'DADOS DO SOLICITANTE',
      campos: [
        { id: 'solicitante', label: 'Solicitante / autorizado', controle: 'text', placeholder: 'Quem entrou em contato', span: 6, mostrarQuando: mostraSolicitante },
        { id: 'cargo', label: 'Cargo / função', controle: 'text', placeholder: 'Ex.: SÓCIO, GERENTE, RESPONSÁVEL', span: 6, mostrarQuando: ehPJ },
        { id: 'parente', label: 'Grau de relacionamento', controle: 'text', placeholder: 'Ex.: ESPOSA, FILHO', span: 6, mostrarQuando: mostraParente },
        { id: 'contatoSol', label: 'Contato do solicitante', controle: 'phone', placeholder: 'Somente os números', span: 6, mostrarQuando: mostraContatoSol },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'text', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Nome completo / Razão social', controle: 'text', placeholder: 'Titular da conexão', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'sinalONU', label: 'Sinal ONU', controle: 'text', placeholder: 'Medida da ONU', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Bairro do cliente', span: 6 },
      ],
    },
    {
      titulo: 'DETALHES DA SOLICITAÇÃO',
      campos: [
        { id: 'motivo', label: 'Motivo do remanejamento (o que o cliente disse)', controle: 'text', placeholder: 'Ex.: vai mudar o roteador de cômodo', span: 12 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 6 },
        { id: 'valor', label: 'Valor / explicação de custo', controle: 'select', opcoes: VALORES, span: 6 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', opcoes: FORMAS_PAGAMENTO, span: 6 },
        { id: 'dataVisita', label: 'Data da visita', controle: 'text', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', span: 6, opcoes: HORARIOS_VISITA_SIMPLES },
      ],
    },
  ],
};
