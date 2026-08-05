/**
 * Config do formulário do modelo `manut-mud-ponto-int` (Mudança de ponto
 * interno). Campos, seções, opções e visibilidade condicional (`mostrarQuando`),
 * extraídos do bundle legado / sondagem2. Ver `docs/gerador/sondagem2-suporte.json`.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Tipos de solicitação que exibem o solicitante/autorizado. */
const COM_SOLICITANTE = new Set([
  'pessoa-juridica',
  'titular-solicita-terceiro-acompanha',
  'terceiro-solicita-terceiro-acompanha',
  'terceiro-solicita-titular-acompanha',
]);
/** Tipos que exibem o grau de relacionamento. */
const COM_PARENTE = new Set([
  'titular-solicita-terceiro-acompanha',
  'terceiro-solicita-terceiro-acompanha',
  'terceiro-solicita-titular-acompanha',
]);
/** Tipos em que o terceiro é quem faz o contato (contato próprio). */
const COM_CONTATO_SOL = new Set([
  'terceiro-solicita-terceiro-acompanha',
  'terceiro-solicita-titular-acompanha',
]);

const ehSolicitante = (v: Valores) => COM_SOLICITANTE.has(v.tipoSolicitacao ?? '');
const ehParente = (v: Valores) => COM_PARENTE.has(v.tipoSolicitacao ?? '');
const ehContatoSol = (v: Valores) => COM_CONTATO_SOL.has(v.tipoSolicitacao ?? '');
const ehPJ = (v: Valores) => v.tipoSolicitacao === 'pessoa-juridica';

export const MANUT_MUD_PONTO_INT_FORM: ModeloForm = {
  slug: 'manut-mud-ponto-int',
  demanda: 'manutencao',
  titulo: 'Mudança de ponto interno',
  descricao: 'Retirada e reinstalação dos equipamentos em novo ambiente.',
  modo: 'Mudança de ponto interno',
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
        { id: 'solicitante', label: 'Solicitante / autorizado', controle: 'text', span: 6, mostrarQuando: ehSolicitante },
        { id: 'cargo', label: 'Cargo/Função', controle: 'text', span: 6, mostrarQuando: ehPJ },
        { id: 'parente', label: 'Grau de relacionamento', controle: 'text', span: 6, mostrarQuando: ehParente },
        { id: 'contatoSol', label: 'Contato do solicitante', controle: 'phone', placeholder: 'Somente os números', span: 6, mostrarQuando: ehContatoSol },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Nome completo / Razão social', controle: 'text', placeholder: 'Titular / assinante', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'sinalONU', label: 'Sinal ONU', controle: 'text', placeholder: 'Medida na ONU', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', span: 6 },
      ],
    },
    {
      titulo: 'DETALHES DA SOLICITAÇÃO',
      campos: [
        { id: 'motivo', label: 'Motivo da mudança de ponto (o que o cliente disse)', controle: 'text', span: 12 },
        { id: 'ambienteAtual', label: 'Ambiente atual', controle: 'text', span: 6 },
        { id: 'ambienteNovo', label: 'Novo ambiente', controle: 'text', span: 6 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 4 },
        {
          id: 'valor',
          label: 'Valor / explicação de custo',
          controle: 'select',
          span: 4,
          opcoes: [
            { value: 'R$50,00', label: 'R$50,00' },
            { value: 'R$100,00', label: 'R$100,00' },
            { value: 'R$50 OU R$100', label: 'R$50 OU R$100' },
          ],
        },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        {
          id: 'formaPag',
          label: 'Forma de pagamento',
          controle: 'select',
          span: 4,
          opcoes: [
            { value: 'PIX', label: 'PIX' },
            { value: 'DINHEIRO', label: 'DINHEIRO' },
            { value: 'CARTAO', label: 'CARTÃO' },
          ],
        },
        { id: 'dataVisita', label: 'Data da visita', controle: 'text', placeholder: 'dd/mm/aaaa', span: 4 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', span: 4, opcoes: HORARIOS_VISITA_SIMPLES },
      ],
    },
  ],
};
