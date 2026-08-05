/**
 * Config do formulário do modelo `manut-luz-vermelha` (coluna esquerda do
 * gerador). Campos, seções, opções e visibilidade condicional (`mostrarQuando`),
 * extraídos do bundle legado (builder `hUe`). Ver
 * `docs/gerador/sondagem2-suporte.json` e `docs/gerador/builders/manutLuzVermelha.builder.txt`.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Terceiro entrou em contato (titular ausente ou presente). */
const terceiroEntrouEmContato = (v: Valores) =>
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha';

/** Há um terceiro envolvido (contato ou acompanhamento). */
const envolveTerceiro = (v: Valores) =>
  terceiroEntrouEmContato(v) || v.tipoSolicitacao === 'titular-solicita-terceiro-acompanha';

export const MANUT_LUZ_VERMELHA_FORM: ModeloForm = {
  slug: 'manut-luz-vermelha',
  demanda: 'manutencao',
  titulo: 'Luz vermelha — padrão',
  descricao: 'Manutenção de conexão com luz vermelha/PON: sondagem remota e agendamento de visita.',
  modo: 'Luz vermelha',
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
      titulo: 'DADOS DE TERCEIRO / AUTORIZAÇÃO',
      campos: [
        { id: 'solicitante', label: 'Solicitante', controle: 'text', placeholder: 'Nome completo do terceiro que entrou em contato', span: 6, mostrarQuando: envolveTerceiro },
        { id: 'parente', label: 'Grau de relacionamento', controle: 'text', placeholder: 'Ex.: Mãe, Filho, Irmão, Esposa…', span: 6, mostrarQuando: envolveTerceiro },
        { id: 'contatoSol', label: 'Contato do solicitante', controle: 'phone', placeholder: 'Somente os números', span: 6, mostrarQuando: terceiroEntrouEmContato },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'text', placeholder: 'Somente números', span: 6 },
        { id: 'cliente', label: 'Nome completo', controle: 'text', placeholder: 'Nome completo', span: 6 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4 },
      ],
    },
    {
      titulo: 'DETALHES DA OCORRÊNCIA',
      campos: [
        { id: 'alarme', label: 'Alarme', controle: 'select', span: 6, opcoes: [ { value: 'Luz vermelha', label: 'Luz vermelha' }, { value: 'Luz PON piscando', label: 'Luz PON piscando' } ] },
        { id: 'onu', label: 'ONU/ONT', controle: 'select', span: 6, opcoes: [ { value: 'ONU', label: 'ONU' }, { value: 'ONT', label: 'ONT' } ] },
        { id: 'ctoType', label: 'Tipo CTO', controle: 'radio', span: 6, opcoes: [ { value: 'CTOE', label: 'CTOE' }, { value: 'CTOI', label: 'CTOI' } ] },
        { id: 'cto', label: 'CTO', controle: 'text', placeholder: 'Ex.: 1035-A', span: 6 },
        { id: 'passante', label: 'Localização do passante', controle: 'text', placeholder: "Ex.: 'Passante no poste próximo ao sobrado'", span: 8 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 4 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', span: 6, opcoes: [ { value: 'PIX', label: 'PIX' }, { value: 'DINHEIRO', label: 'DINHEIRO' }, { value: 'CARTAO', label: 'CARTAO' } ] },
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', opcoes: HORARIOS_VISITA_SIMPLES, span: 6 },
      ],
    },
  ],
};
