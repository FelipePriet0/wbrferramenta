/**
 * Config do formulário do modelo `manut-ocas-fibra` (Dano ocasionado · fibra).
 * Campos, seções, opções e visibilidade condicional (`mostrarQuando`), extraídos
 * do bundle legado / `docs/gerador/sondagem2-suporte.json`. Sem campo `origem`
 * (não há modo ofertado neste modelo). A variável (`tipoSolicitacao`) controla
 * os 4 fluxos de solicitação.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

// O corpo do texto deste modelo é escrito em torno de "LUZ VERMELHA ACESA";
// só ofertamos essa opção para não gerar agenda ("LUZ PON") em contradição
// com o corpo. (correção contextual r3)
const ALARMES: Opcao[] = [
  { value: 'Luz vermelha', label: 'Luz vermelha' },
];

const ONUS: Opcao[] = [
  { value: 'ONU', label: 'ONU' },
  { value: 'ONT', label: 'ONT' },
];

const VALORES: Opcao[] = [
  { value: 'R$50,00', label: 'R$50,00' },
  { value: 'R$100,00', label: 'R$100,00' },
  { value: 'R$50 OU R$100', label: 'R$50 OU R$100' },
];

const FORMAS_PAG: Opcao[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTÃO' },
];

/** Solicitante/parente aparecem nos fluxos em que um terceiro solicita. */
const ehTerceiroSolicita = (v: Valores) =>
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'titular-solicita-terceiro-acompanha';

/** Contato do solicitante só quando o próprio terceiro faz o contato. */
const ehTerceiroContata = (v: Valores) =>
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha';

export const MANUT_OCAS_FIBRA_FORM: ModeloForm = {
  slug: 'manut-ocas-fibra',
  demanda: 'manutencao',
  titulo: 'Dano ocasionado — fibra (externa)',
  descricao: 'Reparo de fibra rompida/danificada com visita técnica agendada.',
  modo: 'Dano ocasionado · fibra',
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
      titulo: 'DADOS DO SOLICITANTE',
      campos: [
        { id: 'solicitante', label: 'Solicitante', controle: 'text', placeholder: 'Quem entrou em contato', span: 6, mostrarQuando: ehTerceiroSolicita },
        { id: 'parente', label: 'Grau de relacionamento', controle: 'text', placeholder: 'Ex.: ESPOSA, FILHO', span: 6, mostrarQuando: ehTerceiroSolicita },
        { id: 'contatoSol', label: 'Contato do solicitante', controle: 'phone', placeholder: 'Somente os números', span: 6, mostrarQuando: ehTerceiroContata },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Nome completo', controle: 'text', placeholder: 'Titular da conexão', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Bairro do cliente', span: 4 },
      ],
    },
    {
      titulo: 'DETALHES DA OCORRÊNCIA',
      campos: [
        { id: 'motivo', label: 'Resumo do ocorrido', controle: 'text', placeholder: "Trecho entre aspas (caixa alta no texto)", span: 12 },
        { id: 'alarme', label: 'Alarme', controle: 'select', opcoes: ALARMES, span: 6 },
        { id: 'onu', label: 'ONU/ONT', controle: 'select', opcoes: ONUS, span: 6 },
        { id: 'cto', label: 'CTO', controle: 'text', placeholder: 'Nº da CTO', span: 4 },
        { id: 'passante', label: 'Localização do passante', controle: 'text', placeholder: 'Ex.: 5', span: 4 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 4 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'valor', label: 'Valor', controle: 'select', opcoes: VALORES, span: 6 },
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', opcoes: FORMAS_PAG, span: 6 },
        { id: 'dataVisita', label: 'Data da visita', controle: 'text', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', span: 6, opcoes: HORARIOS_VISITA_SIMPLES },
      ],
    },
  ],
};
