/**
 * Config do formulário do modelo `midia-roku-presencial` (coluna esquerda do
 * gerador). Campos e seções extraídos do bundle legado (builder `zKe`). Modelo
 * sem variável de tipo (`variavelId: ''`). Ver
 * `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/midiaRokuPresencial.builder.txt`.
 */
import { STB_PARCELAS, ROKU_VALORES, type Opcao } from '../catalogo';
import type { ModeloForm } from './altplanRemotoForm';

/** Formas de pagamento aceitas na compra do Roku-TV. */
const FORMAS_PAG: Opcao[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTAO' },
];

/**
 * Horários da visita — valores "nus" (sem preposição), porque o molde do render
 * já imprime "ÀS ${horaVisita} HORAS"; usar HORARIOS_VISITA_SIMPLES (value "ÀS 08:00")
 * duplicaria o "ÀS".
 */
const HORAS_VISITA: Opcao[] = [
  { value: '08:00', label: '08:00' },
  { value: '08:30', label: '08:30' },
  { value: '09:00', label: '09:00' },
  { value: '10:00', label: '10:00' },
  { value: '10:30', label: '10:30' },
  { value: '11:00', label: '11:00' },
  { value: '13:00', label: '13:00' },
  { value: '13:30', label: '13:30' },
  { value: '14:00', label: '14:00' },
  { value: '15:00', label: '15:00' },
  { value: '15:30', label: '15:30' },
  { value: '16:00', label: '16:00' },
  { value: '16:30', label: '16:30' },
  { value: '17:00', label: '17:00 (somente com autorização)' },
  { value: '17:30', label: '17:30' },
  { value: '18:00', label: '18:00' },
  { value: '18:30', label: '18:30' },
];

export const MIDIA_ROKU_PRESENCIAL_FORM: ModeloForm = {
  slug: 'midia-roku-presencial',
  demanda: 'midia-tv',
  titulo: 'Compra Roku TV — Presencial',
  descricao: 'Compra presencial do Roku-TV (conversor de mídia) com agendamento de visita para instalação.',
  modo: 'Roku · presencial',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cliente', label: 'Nome Completo', controle: 'text', placeholder: 'Nome completo', span: 6 },
        { id: 'sinalONU', label: 'Sinal ONU', controle: 'text', placeholder: '-19.20 DBM ou SEM SINAL', span: 6 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 6 },
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'text', placeholder: '000.000.000-00', span: 6 },
      ],
    },
    {
      titulo: 'DETALHES DA COMPRA',
      campos: [
        { id: 'valorSTB', label: 'Tipo da compra', controle: 'select', span: 4, opcoes: ROKU_VALORES },
        { id: 'parcelas', label: 'Parcelas', controle: 'select', span: 4, opcoes: STB_PARCELAS },
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', span: 4, opcoes: FORMAS_PAG },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Horário', controle: 'select', span: 6, opcoes: HORAS_VISITA },
        { id: 'protocolo', label: 'Nº Protocolo', controle: 'text', placeholder: '123.456', span: 6 },
      ],
    },
  ],
};
