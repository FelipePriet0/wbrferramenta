/**
 * Config do formulário do modelo `ence-padrao-empresa` — encerramento de
 * instalação padrão empresa. Campos derivados da função construtora do legado
 * (`XZe`). Sem variável de tipo (variavelId vazio); `segmento` PF/PJ é
 * informativo. Ver `docs/gerador/builders/encePadraoEmpresa.builder.txt`.
 */
import type { Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

const SEGMENTO: Opcao[] = [
  { value: 'PF', label: 'Pessoa Física' },
  { value: 'PJ', label: 'Pessoa Jurídica' },
];
const SIM_NAO: Opcao[] = [
  { value: 'SIM', label: 'Sim' },
  { value: 'NÃO', label: 'Não' },
];
const LOCAL_INSTALACAO: Opcao[] = [
  { value: 'SOLTO EM CIMA DO MÓVEL', label: 'Solto em cima do móvel' },
  { value: 'FIXADO NA PAREDE', label: 'Fixado na parede' },
  { value: 'FIXADO NO MÓVEL', label: 'Fixado no móvel' },
];
const TIPO_EQUIPAMENTO: Opcao[] = [
  { value: 'ONU + Roteador', label: 'ONU + Roteador' },
  { value: 'ONT', label: 'ONT' },
  { value: 'Somente ONU', label: 'Somente ONU' },
];
const LIGACAO_ELETRICA: Opcao[] = [
  { value: 'Tomada Padrão', label: 'Tomada padrão' },
  { value: 'T de Energia', label: 'T de energia' },
  { value: 'Extensão Elétrica', label: 'Extensão elétrica' },
  { value: 'Outro', label: 'Outro' },
];

const soltoMovel = (v: Valores) => v.local_instalacao === 'SOLTO EM CIMA DO MÓVEL';
const fixadoMovel = (v: Valores) => v.local_instalacao === 'FIXADO NO MÓVEL';
const temPassante = (v: Valores) => v.possui_passante === 'SIM';
const ehOnuRoteador = (v: Valores) => v.tipo_equipamento === 'ONU + Roteador';
const ehOnt = (v: Valores) => v.tipo_equipamento === 'ONT';
const ehSomenteOnu = (v: Valores) => v.tipo_equipamento === 'Somente ONU';
const ehTeComComodato = (v: Valores) =>
  v.ligacao_eletrica === 'T de Energia' || v.ligacao_eletrica === 'Extensão Elétrica';
const ligacaoOutro = (v: Valores) => v.ligacao_eletrica === 'Outro';
const naoAssinante = (v: Valores) => v.eh_assinante === 'NÃO';
const temMztv = (v: Valores) => v.app_mztv === 'SIM';
const temPagamento = (v: Valores) => v.pagamento === 'SIM';
const semIdCto = (v: Valores) => v.sem_id_cto !== 'SIM';

export const ENCE_PADRAO_EMPRESA_FORM: ModeloForm = {
  slug: 'ence-padrao-empresa',
  demanda: 'encerramentos-instalacao',
  titulo: 'Padrão Empresa',
  descricao: 'Encerramento de instalação padrão empresa — equipamentos, testes e ligações elétricas.',
  modo: 'Encerramento · Padrão Empresa',
  variavelId: '',
  secoes: [
    {
      titulo: null,
      campos: [
        { id: 'segmento', label: 'Segmento', controle: 'select', span: 12, opcoes: SEGMENTO },
      ],
    },
    {
      titulo: 'REDE / CTO',
      campos: [
        { id: 'sem_id_cto', label: 'CTO sem identificação', controle: 'select', span: 4, opcoes: SIM_NAO },
        { id: 'cto', label: 'CTO', controle: 'text', placeholder: 'Identificação da CTO', span: 4, mostrarQuando: semIdCto },
        { id: 'sinal', label: 'Sinal', controle: 'text', placeholder: 'Ex.: -21.50', span: 4 },
        { id: 'porta', label: 'Porta', controle: 'text', placeholder: 'Nº da porta', span: 4 },
        { id: 'passagem_cabo', label: 'Passagem do cabo drop', controle: 'text', placeholder: 'Como foi passado', span: 12 },
      ],
    },
    {
      titulo: 'PASSANTE',
      campos: [
        { id: 'possui_passante', label: 'Possui passante', controle: 'select', span: 4, opcoes: SIM_NAO },
        { id: 'motivo_passante', label: 'Motivo do passante', controle: 'text', span: 8, mostrarQuando: temPassante },
        { id: 'local_passante', label: 'Local do passante', controle: 'text', span: 6, mostrarQuando: temPassante },
        { id: 'autorizado_por', label: 'Autorizado por', controle: 'text', span: 6, mostrarQuando: temPassante },
      ],
    },
    {
      titulo: 'EQUIPAMENTO',
      campos: [
        { id: 'local_instalacao', label: 'Local de instalação', controle: 'select', span: 6, opcoes: LOCAL_INSTALACAO },
        { id: 'descricao_movel', label: 'Descrição do móvel', controle: 'text', span: 6, mostrarQuando: soltoMovel },
        { id: 'motivo_nao_fixado', label: 'Motivo de não fixar', controle: 'text', span: 6, mostrarQuando: soltoMovel },
        { id: 'tipo_fixacao_movel', label: 'Tipo de fixação no móvel', controle: 'text', span: 6, mostrarQuando: fixadoMovel },
        { id: 'tipo_equipamento', label: 'Tipo de equipamento', controle: 'select', span: 6, opcoes: TIPO_EQUIPAMENTO },
        { id: 'onu', label: 'ONU', controle: 'text', span: 6, mostrarQuando: ehOnuRoteador },
        { id: 'mac_onu', label: 'MAC da ONU', controle: 'text', span: 6, mostrarQuando: ehOnuRoteador },
        { id: 'roteador', label: 'Roteador', controle: 'text', span: 6, mostrarQuando: ehOnuRoteador },
        { id: 'mac_roteador', label: 'MAC do roteador', controle: 'text', span: 6, mostrarQuando: ehOnuRoteador },
        { id: 'ont_select', label: 'ONT', controle: 'text', span: 6, mostrarQuando: ehOnt },
        { id: 'mac_ont_select', label: 'MAC da ONT', controle: 'text', span: 6, mostrarQuando: ehOnt },
        { id: 'somente_onu_select', label: 'ONU', controle: 'text', span: 6, mostrarQuando: ehSomenteOnu },
        { id: 'mac_somente_onu', label: 'MAC da ONU', controle: 'text', span: 6, mostrarQuando: ehSomenteOnu },
      ],
    },
    {
      titulo: 'TESTES DE VELOCIDADE',
      campos: [
        { id: 'teste_notebook', label: 'Download no notebook (mega)', controle: 'text', placeholder: 'Ex.: 300', span: 6 },
        { id: 'dispositivo_teste', label: 'Dispositivo do cliente', controle: 'text', placeholder: 'Ex.: CELULAR', span: 4 },
        { id: 'marca_modelo_teste', label: 'Marca / modelo', controle: 'text', span: 4 },
        { id: 'velocidade_teste', label: 'Download no dispositivo (mega)', controle: 'text', placeholder: 'Ex.: 280', span: 4 },
      ],
    },
    {
      titulo: 'COBERTURA WI-FI E APPS',
      campos: [
        { id: 'teste_cobertura', label: 'Teste de cobertura na presença de', controle: 'text', span: 6 },
        { id: 'eh_assinante', label: 'É o assinante?', controle: 'select', span: 3, opcoes: SIM_NAO },
        { id: 'parentesco_cobertura', label: 'Parentesco', controle: 'text', span: 3, mostrarQuando: naoAssinante },
        { id: 'app_wbr_celular', label: 'App WBR — celular', controle: 'text', placeholder: 'Nº do celular', span: 6 },
        { id: 'app_mztv', label: 'App MZTV / CDNTV', controle: 'select', span: 3, opcoes: SIM_NAO },
        { id: 'dispositivo_mztv', label: 'Dispositivo MZTV', controle: 'text', span: 6, mostrarQuando: temMztv },
        { id: 'dispositivos_conectados', label: 'Dispositivos conectados na rede', controle: 'text', span: 12 },
      ],
    },
    {
      titulo: 'LIGAÇÕES ELÉTRICAS',
      campos: [
        { id: 'ligacao_eletrica', label: 'Ligação elétrica', controle: 'select', span: 6, opcoes: LIGACAO_ELETRICA },
        { id: 'nome_cliente_energia', label: 'Cliente que acompanhou (ciência do risco)', controle: 'text', span: 6, mostrarQuando: ehTeComComodato },
        { id: 'observacao_ligacao_outros', label: 'Observação da ligação', controle: 'text', span: 12, mostrarQuando: ligacaoOutro },
      ],
    },
    {
      titulo: 'PAGAMENTO E OBSERVAÇÕES',
      campos: [
        { id: 'pagamento', label: 'Houve pagamento', controle: 'select', span: 4, opcoes: SIM_NAO },
        { id: 'valor_pagamento', label: 'Valor R$', controle: 'text', span: 4, mostrarQuando: temPagamento },
        { id: 'forma_pagamento', label: 'Forma de pagamento', controle: 'text', span: 4, mostrarQuando: temPagamento },
        { id: 'observacoes', label: 'Observações', controle: 'text', span: 12 },
      ],
    },
  ],
};
