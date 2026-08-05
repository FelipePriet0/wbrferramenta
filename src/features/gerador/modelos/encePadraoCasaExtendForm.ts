/**
 * Config do formulário do modelo `ence-padrao-casa-extend` — encerramento de
 * instalação "Padrão Casa" com pontos Wi-Fi Extend adicionais. Campos, seções e
 * visibilidade condicional (`mostrarQuando`) portados do bundle legado (builder
 * `fQe`). Os `value` das opções batem com os literais comparados no builder
 * (`SIM`, `NÃO`, `ONU + Roteador`, `ONT`, `T de Energia`, `Outro`…).
 */
import { ONT_MODELOS, ONU_MODELOS, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { CampoConfig, ModeloForm } from './altplanRemotoForm';

const SIM_NAO: Opcao[] = [
  { value: 'SIM', label: 'Sim' },
  { value: 'NÃO', label: 'Não' },
];

const SEGMENTO: Opcao[] = [
  { value: 'PF', label: 'Pessoa Física' },
  { value: 'PJ', label: 'Pessoa Jurídica' },
];

const QTD_PONTOS: Opcao[] = [
  { value: '1', label: '1 ponto adicional' },
  { value: '2', label: '2 pontos adicionais' },
  { value: '3', label: '3 pontos adicionais' },
  { value: '4', label: '4 pontos adicionais' },
];

const TIPO_EQUIPAMENTO: Opcao[] = [
  { value: 'ONU + Roteador', label: 'ONU + Roteador' },
  { value: 'ONT', label: 'ONT' },
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

const semIdCto = (v: Valores) => v.sem_id_cto === 'SIM';
const temPassante = (v: Valores) => v.possui_passante === 'SIM';
const ehOnuRoteador = (v: Valores) => v.tipo_equipamento === 'ONU + Roteador';
const ehOnt = (v: Valores) => v.tipo_equipamento === 'ONT';
const soltoNoMovel = (v: Valores) => v.local_instalacao === 'SOLTO EM CIMA DO MÓVEL';
const fixadoNoMovel = (v: Valores) => v.local_instalacao === 'FIXADO NO MÓVEL';
const naoEhAssinante = (v: Valores) => v.eh_assinante === 'NÃO';
const instalouMztv = (v: Valores) => v.app_mztv === 'SIM';
const ligacaoOutro = (v: Valores) => v.ligacao_eletrica === 'Outro';
const ligacaoRisco = (v: Valores) =>
  v.ligacao_eletrica === 'T de Energia' || v.ligacao_eletrica === 'Extensão Elétrica';
const houvePagamento = (v: Valores) => v.pagamento === 'SIM';

/** Quantidade de pontos adicionais escolhida (mesmo default do render: 1). */
const qtdPontos = (v: Valores) => parseInt(v.qtd_pontos_adicionais || '1', 10) || 1;

/**
 * Campos por ponto adicional (índice 1..N), lidos pelo render no laço de pontos
 * (`desc_ponto_${e}`, `equip_${e}`, `mac_equip_${e}`, `localizacao_equip_${e}`,
 * `teste_notebook_${e}`, `dispositivo_${e}`, `marca_modelo_${e}`,
 * `velocidade_${e}`, `ligacao_eletrica_${e}`, `obs_ligacao_${e}`). Visíveis só
 * quando a quantidade escolhida alcança o índice.
 */
function camposPonto(idx: number): CampoConfig[] {
  const mostrar = (v: Valores) => qtdPontos(v) >= idx;
  const ligacaoOutroPonto = (v: Valores) =>
    mostrar(v) && v[`ligacao_eletrica_${idx}`] === 'Outro';
  return [
    { id: `desc_ponto_${idx}`, label: `Ponto adicional ${idx} — Descrição/local do ponto`, controle: 'text', span: 12, mostrarQuando: mostrar },
    { id: `equip_${idx}`, label: `Ponto ${idx} — Equipamento (marca/modelo)`, controle: 'text', span: 6, mostrarQuando: mostrar },
    { id: `mac_equip_${idx}`, label: `Ponto ${idx} — MAC`, controle: 'text', span: 6, mostrarQuando: mostrar },
    { id: `localizacao_equip_${idx}`, label: `Ponto ${idx} — Fixação/localização do equipamento`, controle: 'text', span: 12, mostrarQuando: mostrar },
    { id: `teste_notebook_${idx}`, label: `Ponto ${idx} — Velocidade notebook técnico (Mega)`, controle: 'text', span: 6, mostrarQuando: mostrar },
    { id: `velocidade_${idx}`, label: `Ponto ${idx} — Velocidade cliente (Mega)`, controle: 'text', span: 6, mostrarQuando: mostrar },
    { id: `dispositivo_${idx}`, label: `Ponto ${idx} — Dispositivo do cliente`, controle: 'select', opcoes: DISPOSITIVO_TESTE, span: 6, mostrarQuando: mostrar },
    { id: `marca_modelo_${idx}`, label: `Ponto ${idx} — Marca/Modelo`, controle: 'text', span: 6, mostrarQuando: mostrar },
    { id: `ligacao_eletrica_${idx}`, label: `Ponto ${idx} — Ligação elétrica`, controle: 'select', opcoes: LIGACAO_ELETRICA, span: 6, mostrarQuando: mostrar },
    { id: `obs_ligacao_${idx}`, label: `Ponto ${idx} — Descrição da ligação (Outro)`, controle: 'text', span: 6, mostrarQuando: ligacaoOutroPonto },
  ];
}

export const ENCE_PADRAO_CASA_EXTEND_FORM: ModeloForm = {
  slug: 'ence-padrao-casa-extend',
  demanda: 'encerramentos-instalacao',
  titulo: 'Padrão Casa + Extend',
  descricao: 'Encerramento de instalação residencial com pontos Wi-Fi Extend adicionais.',
  modo: 'Encerramento · Casa + Wi-Fi Extend',
  variavelId: '',
  secoes: [
    {
      titulo: null,
      campos: [
        { id: 'segmento', label: 'Segmento', controle: 'select', span: 6, opcoes: SEGMENTO },
        {
          id: 'qtd_pontos_adicionais',
          label: 'Quantidade de pontos adicionais (além do primário)',
          controle: 'select',
          span: 6,
          opcoes: QTD_PONTOS,
        },
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
      titulo: 'PONTO PRIMÁRIO — EQUIPAMENTO',
      campos: [
        { id: 'descricao_ponto_primario', label: 'Descrição do ponto primário', controle: 'text', span: 12 },
        { id: 'tipo_equipamento', label: 'Tipo de equipamento (ponto primário)', controle: 'radio', span: 12, opcoes: TIPO_EQUIPAMENTO },
        { id: 'onu', label: 'ONU', controle: 'select', span: 6, opcoes: ONU_MODELOS, mostrarQuando: ehOnuRoteador },
        { id: 'mac_onu', label: 'MAC ONU', controle: 'text', span: 6, mostrarQuando: ehOnuRoteador },
        { id: 'roteador', label: 'Roteador', controle: 'text', placeholder: 'Modelo do equipamento', span: 6, mostrarQuando: ehOnuRoteador },
        { id: 'mac_roteador', label: 'MAC Roteador', controle: 'text', span: 6, mostrarQuando: ehOnuRoteador },
        { id: 'ont_select', label: 'ONT', controle: 'select', span: 6, opcoes: ONT_MODELOS, mostrarQuando: ehOnt },
        { id: 'mac_ont_select', label: 'MAC ONT', controle: 'text', span: 6, mostrarQuando: ehOnt },
      ],
    },
    {
      titulo: 'FIXAÇÃO DO EQUIPAMENTO (PONTO PRIMÁRIO)',
      campos: [
        { id: 'local_instalacao', label: 'Onde o equipamento ficou instalado (ponto primário)', controle: 'radio', span: 12, opcoes: LOCAL_INSTALACAO },
        { id: 'descricao_movel', label: 'Descreva o móvel', controle: 'text', span: 6, mostrarQuando: soltoNoMovel },
        { id: 'motivo_nao_fixado', label: 'Motivo de não fixar', controle: 'text', span: 6, mostrarQuando: soltoNoMovel },
        { id: 'tipo_fixacao_movel', label: 'Tipo de fixação', controle: 'select', span: 6, opcoes: TIPO_FIXACAO_MOVEL, mostrarQuando: fixadoNoMovel },
      ],
    },
    {
      titulo: 'TESTES DE VELOCIDADE (PONTO PRIMÁRIO)',
      campos: [
        { id: 'local_teste_notebook', label: 'Local do teste notebook (ex: SALA)', controle: 'text', span: 6 },
        { id: 'teste_notebook', label: 'Velocidade notebook (Mega)', controle: 'text', span: 6 },
        { id: 'local_teste_cliente', label: 'Local do teste cliente (ex: QUARTO)', controle: 'text', span: 6 },
        { id: 'dispositivo_teste', label: 'Dispositivo do cliente', controle: 'select', span: 6, opcoes: DISPOSITIVO_TESTE },
        { id: 'marca_modelo_teste', label: 'Marca/Modelo', controle: 'text', span: 6 },
        { id: 'velocidade_teste', label: 'Velocidade cliente (Mega)', controle: 'text', span: 6 },
      ],
    },
    {
      titulo: 'PONTOS ADICIONAIS (WI-FI EXTEND)',
      campos: [
        ...camposPonto(1),
        ...camposPonto(2),
        ...camposPonto(3),
        ...camposPonto(4),
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
      titulo: 'LIGAÇÃO ELÉTRICA (PONTO PRIMÁRIO)',
      campos: [
        { id: 'local_ligacao_primario', label: 'Local da ligação elétrica (ponto primário)', controle: 'text', span: 6 },
        { id: 'ligacao_eletrica', label: 'Ligação elétrica (ponto primário)', controle: 'select', span: 6, opcoes: LIGACAO_ELETRICA },
        { id: 'observacao_ligacao_outros', label: 'Descrição da ligação (ponto primário)', controle: 'text', span: 6, mostrarQuando: ligacaoOutro },
        { id: 'nome_cliente_energia', label: 'Nome do cliente (orientação elétrica)', controle: 'text', span: 6, mostrarQuando: ligacaoRisco },
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
