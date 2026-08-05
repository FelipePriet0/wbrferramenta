/**
 * Config do formulário do modelo `manut-ocas-conector` (coluna esquerda do
 * gerador). Manutenção com dano OCASIONADO no conector. Campos, seções, opções e
 * visibilidade condicional (`mostrarQuando`) extraídos do bundle legado. Ver
 * `docs/gerador/sondagem2-suporte.json` (slug "manut-ocas-conector").
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Solicitante é um terceiro (ausente ou presente) — condicional legado `$Ue`. */
const ehTerceiro = (v: Valores): boolean =>
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha';

/** Contato do solicitante só quando um terceiro solicita — legado `[dk,fk]`. */
const mostraContatoSol = ehTerceiro;

const FORMAS_PAGAMENTO: Opcao[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTAO' },
];

// O corpo do texto deste modelo é escrito em torno de "LUZ VERMELHA ACESA";
// só ofertamos essa opção para não gerar agenda ("LUZ PON") em contradição
// com o corpo. (correção contextual r3)
const ALARMES: Opcao[] = [
  { value: 'Luz vermelha', label: 'Luz vermelha' },
];

const ONU_ONT: Opcao[] = [
  { value: 'ONU', label: 'ONU' },
  { value: 'ONT', label: 'ONT' },
];

export const MANUT_OCAS_CONECTOR_FORM: ModeloForm = {
  slug: 'manut-ocas-conector',
  demanda: 'manutencao',
  titulo: 'Dano ocasionado — conector (interno)',
  descricao: 'Manutenção de conector danificado por intervenção do cliente.',
  modo: 'Dano ocasionado · conector',
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
        { id: 'solicitante', label: 'Solicitante', controle: 'text', placeholder: 'Nome completo do terceiro que entrou em contato', span: 6, mostrarQuando: ehTerceiro },
        { id: 'parente', label: 'Grau de relacionamento', controle: 'text', placeholder: 'Ex.: Mãe, Filho, Irmão, Esposa…', span: 6, mostrarQuando: ehTerceiro },
        { id: 'contatoSol', label: 'Contato do solicitante', controle: 'phone', placeholder: 'Somente os números', span: 6, mostrarQuando: mostraContatoSol },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Nome completo', controle: 'text', placeholder: 'Nome completo', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4 },
      ],
    },
    {
      titulo: 'DETALHES DA OCORRÊNCIA',
      campos: [
        { id: 'motivo', label: 'Resumo do ocorrido', controle: 'text', placeholder: "Ex.: 'ao mover o sofá de lugar, esbarrou na fibra e danificou o conector'", span: 12 },
        { id: 'alarme', label: 'Alarme', controle: 'select', opcoes: ALARMES, span: 6 },
        { id: 'onu', label: 'ONU/ONT', controle: 'select', opcoes: ONU_ONT, span: 6 },
        { id: 'cto', label: 'CTO', controle: 'text', placeholder: 'Ex.: 1035-A', span: 4 },
        { id: 'passante', label: 'Localização do passante', controle: 'text', placeholder: "Ex.: 'Passante no poste próximo ao sobrado'", span: 4 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 4 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', opcoes: FORMAS_PAGAMENTO, span: 6 },
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', opcoes: HORARIOS_VISITA_SIMPLES, span: 6 },
      ],
    },
  ],
};
