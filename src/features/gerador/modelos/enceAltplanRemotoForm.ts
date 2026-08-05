/**
 * Config do formulário do modelo `ence-altplan-remoto` — encerramento de
 * instalação após alteração de plano remota. Campos extraídos do pacote legado
 * (docs/gerador/builders/enceAltplanRemoto.builder.txt). Ramifica em "houve
 * troca de roteador?" (tipoTroca).
 */
import { ONU_TIPO, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

const houveTroca = (v: Valores) => v.tipoTroca === 'SIM';
const semTroca = (v: Valores) => v.tipoTroca !== 'SIM';
const roteadorNaoFixado = (v: Valores) => v.fixacaoRoteador === 'NÃO';
const onuNaoFixada = (v: Valores) => v.fixacaoONU === 'NÃO';
const temDispositivo2 = (v: Valores) => !!(v.dispositivo2 ?? '').trim();
const naoTestouCobertura = (v: Valores) => v.testeCobertura === 'NÃO';
const ligacaoOutros = (v: Valores) => v.ligacaoEletrica === 'OUTROS';
const comCustos = (v: Valores) => v.custos === 'COM';

const SIM_NAO: Opcao[] = [
  { value: 'SIM', label: 'Sim' },
  { value: 'NÃO', label: 'Não' },
];
const SEGMENTOS: Opcao[] = [
  { value: 'PF', label: 'Pessoa Física' },
  { value: 'PJ', label: 'Pessoa Jurídica' },
];
const DISPOSITIVOS: Opcao[] = [
  { value: 'CELULAR', label: 'Celular' },
  { value: 'NOTEBOOK', label: 'Notebook' },
  { value: 'TV', label: 'TV' },
  { value: 'TABLET', label: 'Tablet' },
];
const MEIO_AFERICAO: Opcao[] = [
  { value: 'CABO', label: 'Cabo' },
  { value: 'WI-FI 2.4G', label: 'Wi-Fi 2.4G' },
  { value: 'WI-FI 5G', label: 'Wi-Fi 5G' },
];
const LIGACAO_ELETRICA: Opcao[] = [
  { value: 'TOMADA', label: 'Tomada' },
  { value: 'FILTRO DE LINHA', label: 'Filtro de linha' },
  { value: 'T DE ENERGIA', label: 'T de energia' },
  { value: 'OUTROS', label: 'Outros' },
];
const FORMA_PAGAMENTO: Opcao[] = [
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'PIX', label: 'Pix' },
  { value: 'CARTÃO', label: 'Cartão' },
];

export const ENCE_ALTPLAN_REMOTO_FORM: ModeloForm = {
  slug: 'ence-altplan-remoto',
  demanda: 'encerramentos-instalacao',
  titulo: 'Alteração de plano (remoto)',
  descricao: 'Encerramento de instalação após alteração de plano remota.',
  modo: 'Encerramento · Alt. Plano Remoto',
  variavelId: '',
  secoes: [
    {
      titulo: null,
      campos: [
        { id: 'segmento', label: 'Segmento', controle: 'select', span: 6, opcoes: SEGMENTOS },
        { id: 'tipoTroca', label: 'Houve troca de roteador?', controle: 'radio', span: 6, opcoes: SIM_NAO },
      ],
    },
    {
      titulo: 'EQUIPAMENTOS',
      campos: [
        { id: 'rotSemTroca', label: 'Roteador (já instalado)', controle: 'text', placeholder: 'Modelo do equipamento', span: 6, mostrarQuando: semTroca },
        { id: 'macRotSemTroca', label: 'MAC do roteador', controle: 'text', span: 6, mostrarQuando: semTroca },
        { id: 'rotRetirou', label: 'Roteador retirado', controle: 'text', placeholder: 'Modelo do equipamento', span: 6, mostrarQuando: houveTroca },
        { id: 'macRotRetirou', label: 'MAC do roteador retirado', controle: 'text', span: 6, mostrarQuando: houveTroca },
        { id: 'rotInstalou', label: 'Roteador instalado', controle: 'text', placeholder: 'Modelo do equipamento', span: 6, mostrarQuando: houveTroca },
        { id: 'macRotInstalou', label: 'MAC do roteador instalado', controle: 'text', span: 6, mostrarQuando: houveTroca },
        { id: 'onu', label: 'ONU', controle: 'select', opcoes: ONU_TIPO, span: 6 },
        { id: 'macONU', label: 'MAC da ONU', controle: 'text', span: 6 },
      ],
    },
    {
      titulo: 'FIXAÇÃO',
      campos: [
        { id: 'fixacaoRoteador', label: 'Roteador fixado com bucha e parafuso?', controle: 'select', span: 6, opcoes: SIM_NAO },
        { id: 'localRoteador', label: 'Localização do roteador', controle: 'text', span: 6, mostrarQuando: roteadorNaoFixado },
        { id: 'fixacaoONU', label: 'ONU fixada com bucha e parafuso?', controle: 'select', span: 6, opcoes: SIM_NAO },
        { id: 'localONU', label: 'Localização da ONU', controle: 'text', span: 6, mostrarQuando: onuNaoFixada },
      ],
    },
    {
      titulo: 'TESTES DE VELOCIDADE',
      campos: [
        { id: 'testeCabo', label: 'Velocidade via cabo (Mbps)', controle: 'text', span: 6 },
        { id: 'testeWifi', label: 'Velocidade via Wi-Fi 5G (Mbps)', controle: 'text', span: 6 },
        { id: 'dispositivo1', label: 'Dispositivo 1', controle: 'select', span: 3, opcoes: DISPOSITIVOS },
        { id: 'marcaModelo1', label: 'Marca/Modelo', controle: 'text', span: 3 },
        { id: 'velocidade1', label: 'Velocidade aferida (Mbps)', controle: 'text', span: 3 },
        { id: 'meioAfericao1', label: 'Meio de aferição', controle: 'select', span: 3, opcoes: MEIO_AFERICAO },
        { id: 'dispositivo2', label: 'Dispositivo 2', controle: 'select', span: 3, opcoes: DISPOSITIVOS },
        { id: 'marcaModelo2', label: 'Marca/Modelo', controle: 'text', span: 3, mostrarQuando: temDispositivo2 },
        { id: 'velocidade2', label: 'Velocidade aferida (Mbps)', controle: 'text', span: 3, mostrarQuando: temDispositivo2 },
        { id: 'meioAfericao2', label: 'Meio de aferição', controle: 'select', span: 3, opcoes: MEIO_AFERICAO, mostrarQuando: temDispositivo2 },
        { id: 'aparelhoCompativel', label: 'Aparelho do cliente é compatível com a velocidade?', controle: 'radio', span: 6, opcoes: SIM_NAO },
        { id: 'testeCobertura', label: 'Realizou testes de cobertura Wi-Fi?', controle: 'radio', span: 6, opcoes: SIM_NAO },
        { id: 'motivoNaoTeste', label: 'Motivo de não testar cobertura', controle: 'text', span: 12, mostrarQuando: naoTestouCobertura },
      ],
    },
    {
      titulo: 'LIGAÇÃO ELÉTRICA E APLICATIVOS',
      campos: [
        { id: 'ligacaoEletrica', label: 'Ligação elétrica (conectado em)', controle: 'select', span: 6, opcoes: LIGACAO_ELETRICA },
        { id: 'observacaoLigacao', label: 'Descrição da ligação elétrica', controle: 'text', span: 6, mostrarQuando: ligacaoOutros },
        { id: 'appWbr', label: 'WBR-PLAY instalado (marca/modelo do dispositivo)', controle: 'text', span: 12 },
        { id: 'appWbrPlus', label: 'WBR-PLAY PLUS (ITTV) instalado (marca/modelo)', controle: 'text', span: 12 },
        { id: 'appDeezer', label: 'DEEZER instalado (marca/modelo do dispositivo)', controle: 'text', span: 12 },
      ],
    },
    {
      titulo: 'CUSTOS E OBSERVAÇÕES',
      campos: [
        { id: 'custos', label: 'Ordem de serviço com custos?', controle: 'radio', span: 12, opcoes: [ { value: 'COM', label: 'Com custos' }, { value: 'SEM', label: 'Sem custos' } ] },
        { id: 'valorCustos', label: 'Valor (R$)', controle: 'text', span: 6, mostrarQuando: comCustos },
        { id: 'formaPagamento', label: 'Forma de pagamento', controle: 'select', span: 6, opcoes: FORMA_PAGAMENTO, mostrarQuando: comCustos },
        { id: 'observacoes', label: 'Observações', controle: 'text', span: 12 },
      ],
    },
  ],
};
