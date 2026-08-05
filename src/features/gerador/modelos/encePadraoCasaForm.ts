/**
 * Config do formulário do modelo `ence-padrao-casa` — encerramento de instalação
 * "Padrão Casa". Campos, seções e visibilidade condicional (`mostrarQuando`)
 * portados do bundle legado (builder `qZe`). Os `value` das opções batem com os
 * literais comparados no builder (`SIM`, `NÃO`, `ONU + Roteador`, `T de Energia`…).
 */
import { ONT_MODELOS, ONU_MODELOS, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

const SIM_NAO: Opcao[] = [
  { value: 'SIM', label: 'Sim' },
  { value: 'NÃO', label: 'Não' },
];

const SEGMENTO: Opcao[] = [
  { value: 'PF', label: 'Pessoa Física' },
  { value: 'PJ', label: 'Pessoa Jurídica' },
];

const TIPO_EQUIPAMENTO: Opcao[] = [
  { value: 'ONU + Roteador', label: 'ONU + Roteador' },
  { value: 'ONT', label: 'ONT' },
  { value: 'Somente ONU', label: 'Somente ONU' },
];

const LOCAL_INSTALACAO: Opcao[] = [
  { value: 'SOLTO EM CIMA DO MÓVEL', label: 'Solto em cima do móvel' },
  { value: 'FIXADO NA PAREDE', label: 'Fixado na parede' },
  { value: 'FIXADO NO MÓVEL', label: 'Fixado no móvel' },
];

const TIPO_FIXACAO_MOVEL: Opcao[] = [
  { value: 'Fita dupla face', label: 'Fita dupla face' },
  { value: 'Bucha e parafuso', label: 'Bucha e parafuso' },
];

const DISPOSITIVO_TESTE: Opcao[] = [
  { value: 'Celular', label: 'Celular' },
  { value: 'Notebook', label: 'Notebook' },
  { value: 'Computador', label: 'Computador' },
  { value: 'Tablet', label: 'Tablet' },
];

const DISPOSITIVO_MZTV: Opcao[] = [
  { value: 'Celular', label: 'Celular' },
  { value: 'TV Box', label: 'TV Box' },
  { value: 'Smart TV', label: 'Smart TV' },
];

const LIGACAO_ELETRICA: Opcao[] = [
  { value: 'Tomada', label: 'Tomada' },
  { value: 'T de Energia', label: 'T de energia' },
  { value: 'Extensão Elétrica', label: 'Extensão elétrica' },
  { value: 'Outro', label: 'Outro' },
];

const FORMA_PAGAMENTO: Opcao[] = [
  { value: 'Dinheiro', label: 'Dinheiro' },
  { value: 'Pix', label: 'Pix' },
  { value: 'Cartão', label: 'Cartão' },
];

const temPassante = (v: Valores) => v.possui_passante === 'SIM';
const soltoNoMovel = (v: Valores) => v.local_instalacao === 'SOLTO EM CIMA DO MÓVEL';
const fixadoNoMovel = (v: Valores) => v.local_instalacao === 'FIXADO NO MÓVEL';
const ehOnuRoteador = (v: Valores) => v.tipo_equipamento === 'ONU + Roteador';
const ehOnt = (v: Valores) => v.tipo_equipamento === 'ONT';
const ehSomenteOnu = (v: Valores) => v.tipo_equipamento === 'Somente ONU';
const naoEhAssinante = (v: Valores) => v.eh_assinante === 'NÃO';
const instalouMztv = (v: Valores) => v.app_mztv === 'SIM';
const ligacaoOutro = (v: Valores) => v.ligacao_eletrica === 'Outro';
const ligacaoRisco = (v: Valores) =>
  v.ligacao_eletrica === 'T de Energia' || v.ligacao_eletrica === 'Extensão Elétrica';
const houvePagamento = (v: Valores) => v.pagamento === 'SIM';
const semIdCto = (v: Valores) => v.sem_id_cto === 'SIM';

export const ENCE_PADRAO_CASA_FORM: ModeloForm = {
  slug: 'ence-padrao-casa',
  demanda: 'encerramentos-instalacao',
  titulo: 'Padrão Casa',
  descricao: 'Encerramento de instalação residencial — texto de O.S "Padrão Casa".',
  modo: 'Encerramento · Padrão Casa',
  variavelId: '',
  secoes: [
    {
      titulo: null,
      campos: [
        { id: 'segmento', label: 'Segmento', controle: 'select', span: 12, opcoes: SEGMENTO },
      ],
    },
    {
      titulo: 'CTO E SINAL',
      campos: [
        { id: 'sem_id_cto', label: 'CTO sem identificação?', controle: 'radio', span: 12, opcoes: SIM_NAO },
        { id: 'cto', label: 'CTO', controle: 'text', placeholder: 'Identificação da CTO', span: 4, mostrarQuando: (v) => !semIdCto(v) },
        { id: 'sinal', label: 'Sinal', controle: 'text', placeholder: 'Ex.: -21.50DBM', span: 4 },
        { id: 'porta', label: 'Porta', controle: 'text', placeholder: 'Porta da CTO', span: 4 },
      ],
    },
    {
      titulo: 'PASSAGEM DO CABO',
      campos: [
        { id: 'passagem_cabo', label: 'Passagem do cabo drop', controle: 'text', placeholder: 'Como o cabo foi passado', span: 12 },
        { id: 'possui_passante', label: 'Possui passante?', controle: 'radio', span: 12, opcoes: SIM_NAO },
        { id: 'motivo_passante', label: 'Motivo do passante', controle: 'text', span: 4, mostrarQuando: temPassante },
        { id: 'local_passante', label: 'Local do passante', controle: 'text', span: 4, mostrarQuando: temPassante },
        { id: 'autorizado_por', label: 'Autorizado por', controle: 'text', span: 4, mostrarQuando: temPassante },
      ],
    },
    {
      titulo: 'EQUIPAMENTO',
      campos: [
        { id: 'tipo_equipamento', label: 'Tipo de equipamento instalado', controle: 'radio', span: 12, opcoes: TIPO_EQUIPAMENTO },
        { id: 'onu', label: 'ONU', controle: 'select', span: 6, opcoes: ONU_MODELOS, mostrarQuando: ehOnuRoteador },
        { id: 'mac_onu', label: 'MAC ONU', controle: 'text', span: 6, mostrarQuando: ehOnuRoteador },
        { id: 'roteador', label: 'Roteador', controle: 'text', placeholder: 'Modelo do equipamento', span: 6, mostrarQuando: ehOnuRoteador },
        { id: 'mac_roteador', label: 'MAC Roteador', controle: 'text', span: 6, mostrarQuando: ehOnuRoteador },
        { id: 'ont_select', label: 'ONT', controle: 'select', span: 6, opcoes: ONT_MODELOS, mostrarQuando: ehOnt },
        { id: 'mac_ont_select', label: 'MAC ONT', controle: 'text', span: 6, mostrarQuando: ehOnt },
        { id: 'somente_onu_select', label: 'ONU', controle: 'select', span: 6, opcoes: ONU_MODELOS, mostrarQuando: ehSomenteOnu },
        { id: 'mac_somente_onu', label: 'MAC ONU', controle: 'text', span: 6, mostrarQuando: ehSomenteOnu },
      ],
    },
    {
      titulo: 'FIXAÇÃO DO EQUIPAMENTO',
      campos: [
        { id: 'local_instalacao', label: 'Onde o equipamento ficou instalado', controle: 'radio', span: 12, opcoes: LOCAL_INSTALACAO },
        { id: 'descricao_movel', label: 'Descreva o móvel', controle: 'text', span: 6, mostrarQuando: soltoNoMovel },
        { id: 'motivo_nao_fixado', label: 'Motivo de não fixar', controle: 'text', span: 6, mostrarQuando: soltoNoMovel },
        { id: 'tipo_fixacao_movel', label: 'Tipo de fixação', controle: 'select', span: 6, opcoes: TIPO_FIXACAO_MOVEL, mostrarQuando: fixadoNoMovel },
      ],
    },
    {
      titulo: 'TESTES DE VELOCIDADE',
      campos: [
        { id: 'teste_notebook', label: 'Teste notebook técnico (Mega)', controle: 'text', placeholder: 'Velocidade aferida', span: 4 },
        { id: 'dispositivo_teste', label: 'Dispositivo do cliente', controle: 'select', span: 4, opcoes: DISPOSITIVO_TESTE },
        { id: 'marca_modelo_teste', label: 'Marca/Modelo', controle: 'text', span: 4 },
        { id: 'velocidade_teste', label: 'Velocidade do cliente (Mega)', controle: 'text', span: 4 },
      ],
    },
    {
      titulo: 'COBERTURA WI-FI E APPS',
      campos: [
        { id: 'teste_cobertura', label: 'Nome do cliente (teste de cobertura Wi-Fi)', controle: 'text', span: 6 },
        { id: 'eh_assinante', label: 'Esse cliente é o titular?', controle: 'radio', span: 6, opcoes: SIM_NAO },
        { id: 'parentesco_cobertura', label: 'Grau de parentesco', controle: 'text', span: 6, mostrarQuando: naoEhAssinante },
        { id: 'app_wbr_celular', label: 'App WBR — celular instalado (marca/modelo)', controle: 'text', span: 6 },
        { id: 'app_mztv', label: 'Instalou App MZTV ou CDNTV?', controle: 'radio', span: 6, opcoes: SIM_NAO },
        { id: 'dispositivo_mztv', label: 'Dispositivo MZTV/CDNTV', controle: 'select', span: 6, opcoes: DISPOSITIVO_MZTV, mostrarQuando: instalouMztv },
      ],
    },
    {
      titulo: 'LIGAÇÃO ELÉTRICA',
      campos: [
        { id: 'ligacao_eletrica', label: 'Ligação elétrica do equipamento', controle: 'select', span: 6, opcoes: LIGACAO_ELETRICA },
        { id: 'observacao_ligacao_outros', label: 'Descrição da ligação elétrica', controle: 'text', span: 6, mostrarQuando: ligacaoOutro },
        { id: 'nome_cliente_energia', label: 'Nome do cliente (orientação sobre riscos elétricos)', controle: 'text', span: 6, mostrarQuando: ligacaoRisco },
        { id: 'dispositivos_conectados', label: 'Dispositivos conectados na rede', controle: 'text', span: 6 },
      ],
    },
    {
      titulo: 'PAGAMENTO E OBSERVAÇÕES',
      campos: [
        { id: 'pagamento', label: 'Houve pagamento?', controle: 'radio', span: 12, opcoes: SIM_NAO },
        { id: 'valor_pagamento', label: 'Valor (R$)', controle: 'text', span: 6, mostrarQuando: houvePagamento },
        { id: 'forma_pagamento', label: 'Forma de pagamento', controle: 'select', span: 6, opcoes: FORMA_PAGAMENTO, mostrarQuando: houvePagamento },
        { id: 'observacoes', label: 'Observações', controle: 'text', span: 12 },
      ],
    },
  ],
};
