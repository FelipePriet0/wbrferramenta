/**
 * Config do formulário do modelo `manut-sinal-alto` (coluna esquerda do
 * gerador). Campos, seções, opções e visibilidade condicional (`mostrarQuando`),
 * extraídos do bundle legado e de `docs/gerador/sondagem2-suporte.json`.
 *
 * As seções `dataVisita`/`horaVisita` não constam da sondagem2, mas o render
 * (`renderManutSinalAlto`) as consome para montar o agendamento da visita; por
 * isso ficam na seção AGENDAMENTO, no mesmo padrão dos modelos com visita.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, type Opcao } from '../catalogo';
import type { ModeloForm } from './altplanRemotoForm';
import type { Valores } from '../render/helpers';

const OSCILACAO: Opcao[] = [
  { value: 'Sem oscilacao', label: 'Sem oscilação' },
  { value: 'Com oscilacao', label: 'Com oscilação' },
];

const ONU_ONT: Opcao[] = [
  { value: 'ONU', label: 'ONU' },
  { value: 'ONT', label: 'ONT' },
];

const CTO_TIPO: Opcao[] = [
  { value: 'CTOE', label: 'CTOE' },
  { value: 'CTOI', label: 'CTOI' },
];

const FORMA_PAG: Opcao[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTÃO' },
];

/** Slugs de `tipoSolicitacao` (mesmos valores casados pelo render). */
const TITULAR_TITULAR = 'titular-solicita-titular-acompanha';
const PESSOA_JURIDICA = 'pessoa-juridica';
const TERCEIRO_TERCEIRO = 'terceiro-solicita-terceiro-acompanha';
const TERCEIRO_TITULAR = 'terceiro-solicita-titular-acompanha';
const TITULAR_TERCEIRO = 'titular-solicita-terceiro-acompanha';

const em = (...slugs: string[]) => (v: Valores) => {
  const tipo = v.tipoSolicitacao || TITULAR_TITULAR;
  return slugs.includes(tipo);
};

export const MANUT_SINAL_ALTO_FORM: ModeloForm = {
  slug: 'manut-sinal-alto',
  demanda: 'manutencao',
  titulo: 'Sinal alto',
  descricao: 'Manutenção de sinal alto na ONU com visita técnica.',
  modo: 'Sinal alto',
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
            { value: TITULAR_TITULAR, label: 'Titular solicita e acompanha' },
            { value: PESSOA_JURIDICA, label: 'Pessoa jurídica' },
            { value: TERCEIRO_TERCEIRO, label: 'Terceiro solicita (titular ausente)' },
            { value: TERCEIRO_TITULAR, label: 'Terceiro solicita (titular presente)' },
            { value: TITULAR_TERCEIRO, label: 'Titular solicita e autoriza terceiro' },
          ],
        },
      ],
    },
    {
      titulo: 'DADOS DO SOLICITANTE',
      campos: [
        {
          id: 'solicitante',
          label: 'Solicitante',
          controle: 'text',
          placeholder: 'Nome completo de quem entrou em contato',
          span: 6,
          mostrarQuando: em(PESSOA_JURIDICA, TERCEIRO_TITULAR, TERCEIRO_TERCEIRO, TITULAR_TERCEIRO),
        },
        {
          id: 'cargo',
          label: 'Cargo/Função',
          controle: 'text',
          placeholder: 'Ex.: Sócio, Admin, Gerente…',
          span: 6,
          mostrarQuando: em(PESSOA_JURIDICA),
        },
        {
          id: 'parente',
          label: 'Grau de relacionamento',
          controle: 'text',
          placeholder: 'Ex.: Mãe, Filho, Irmão, Esposa…',
          span: 6,
          mostrarQuando: em(TERCEIRO_TITULAR, TERCEIRO_TERCEIRO, TITULAR_TERCEIRO),
        },
        {
          id: 'contatoSol',
          label: 'Contato do solicitante',
          controle: 'phone',
          placeholder: 'Somente os números',
          span: 6,
          mostrarQuando: em(PESSOA_JURIDICA, TERCEIRO_TITULAR, TERCEIRO_TERCEIRO),
        },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Nome completo / Razão social', controle: 'text', placeholder: 'Nome completo (ou razão social, p/ pessoa jurídica)', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        {
          id: 'contato',
          label: 'Contato',
          controle: 'phone',
          placeholder: 'Somente os números',
          span: 4,
          mostrarQuando: em(TITULAR_TITULAR, TERCEIRO_TITULAR, TERCEIRO_TERCEIRO, TITULAR_TERCEIRO),
        },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4 },
      ],
    },
    {
      titulo: 'DETALHES DA OCORRÊNCIA',
      campos: [
        { id: 'sinalONU', label: 'Sinal atual', controle: 'text', placeholder: 'Ex.: -31.87 dBm', span: 6 },
        { id: 'sinalONUan', label: 'Sinal anterior', controle: 'text', placeholder: 'Ex.: -17.45 dBm', span: 6 },
        { id: 'oscila', label: 'Oscilação', controle: 'select', opcoes: OSCILACAO, span: 6 },
        { id: 'onu', label: 'ONU/ONT', controle: 'select', opcoes: ONU_ONT, span: 6 },
        { id: 'ctoType', label: 'Tipo CTO', controle: 'radio', opcoes: CTO_TIPO, span: 6 },
        { id: 'cto', label: 'CTO', controle: 'text', placeholder: 'Ex.: 1035-A', span: 3 },
        { id: 'passante', label: 'Localização do passante', controle: 'text', placeholder: "Ex.: 'Passante 3'", span: 3 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', opcoes: FORMA_PAG, span: 4 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 4 },
        { id: 'dataVisita', label: 'Data da visita', controle: 'text', placeholder: 'dd/mm/aaaa', span: 4 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', span: 4, opcoes: HORARIOS_VISITA_SIMPLES },
      ],
    },
  ],
};
