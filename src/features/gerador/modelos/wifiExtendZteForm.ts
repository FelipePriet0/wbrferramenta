/**
 * Config do formulário do modelo `wifi-extend-zte` (coluna esquerda do gerador).
 * Campos, seções e visibilidade condicional extraídos do bundle legado (builder
 * `Pqe`, ramo ZTE). Este modelo não tem variável de "tipo" (variavelId vazio); o
 * único ramo é `segmento` (PF/PJ). Ver `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/wifiExtendZte.builder.txt`.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, PLANOS_ATUAIS, PLANOS_EXTEND } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Cliente Pessoa Jurídica (segmento === 'PJ'). */
const ehPJ = (v: Valores) => v.segmento === 'PJ';

/** Campo livre `obsOutro` só aparece quando a observação escolhida é "OUTRO". */
const ehOutro = (v: Valores) => v.obsLocal === 'OUTRO';

/** Roteador que sai só é pedido quando há troca do roteador principal. */
const ehTroca = (v: Valores) => v.troca === 'SIM';

/** Opções do campo `troca` (troca do roteador principal). */
const OPCOES_TROCA = [
  { value: 'NAO', label: 'Não' },
  { value: 'SIM', label: 'Sim' },
];

/** Como o 2º roteador (Extend) se conecta ao principal. */
const OPCOES_CONEXAO = [
  { value: 'MESH', label: 'Mesh (sem fio)' },
  { value: 'CABO', label: 'Cabeado' },
];

export const WIFI_EXTEND_ZTE_FORM: ModeloForm = {
  slug: 'wifi-extend-zte',
  demanda: 'wifi-extend',
  titulo: 'Wi-Fi Extend — ZTE / Mesh',
  descricao: 'Alteração de plano com Wi-Fi Extend (2º roteador em mesh), equipamento ZTE.',
  modo: 'Wi-Fi Extend · ZTE',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        {
          id: 'segmento',
          label: 'Tipo de cliente',
          controle: 'select',
          span: 4,
          opcoes: [
            { value: 'PF', label: 'Pessoa Física' },
            { value: 'PJ', label: 'Pessoa Jurídica' },
          ],
        },
        { id: 'cliente', label: 'Nome completo (titular/assinante)', controle: 'text', placeholder: 'Titular da conexão', span: 8 },
        { id: 'solicitante', label: 'Nome do solicitante', controle: 'text', placeholder: 'Quem entrou em contato', span: 6, mostrarQuando: ehPJ },
        { id: 'cargo', label: 'Cargo / função', controle: 'text', placeholder: 'Ex.: SÓCIO, GERENTE, RESPONSÁVEL', span: 6, mostrarQuando: ehPJ },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4 },
      ],
    },
    {
      titulo: 'DETALHES DO PLANO',
      campos: [
        { id: 'planoAtual', label: 'Plano atual', controle: 'select', opcoes: PLANOS_ATUAIS, span: 6 },
        { id: 'planoEscolhido', label: 'Plano escolhido', controle: 'select', opcoes: PLANOS_EXTEND, span: 6 },
        { id: 'roteador', label: 'Roteador atual', controle: 'text', placeholder: 'Modelo do roteador', span: 6 },
        { id: 'conexaoExtend', label: 'Conexão do 2º roteador (Extend)', controle: 'select', opcoes: OPCOES_CONEXAO, span: 6 },
        { id: 'troca', label: 'Troca do roteador principal?', controle: 'select', opcoes: OPCOES_TROCA, span: 3 },
        { id: 'roteadorAtual', label: 'Roteador que sai (troca)', controle: 'text', placeholder: 'Modelo do roteador atual', span: 6, mostrarQuando: ehTroca },
        { id: 'dataContrato', label: 'Plano contratado em', controle: 'text', placeholder: 'mês/ano', span: 3 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 3 },
        { id: 'sinalONU', label: 'ONU (sinal)', controle: 'text', placeholder: '-19.20 DBM ou SEM SINAL', span: 6 },
        { id: 'vencimentoData', label: 'Vencimento (dia do mês)', controle: 'text', placeholder: 'Ex.: 10', span: 6 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'dataVisita', label: 'Data da visita', controle: 'text', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', span: 6, opcoes: HORARIOS_VISITA_SIMPLES },
      ],
    },
    {
      titulo: 'OBSERVAÇÕES',
      campos: [
        { id: 'obsLocal', label: 'Observação (local do 2º roteador)', controle: 'text', placeholder: 'Ex.: SALA · digite OUTRO para texto livre', span: 6 },
        { id: 'obsOutro', label: 'Especifique a observação', controle: 'text', placeholder: 'Texto livre', span: 6, mostrarQuando: ehOutro },
      ],
    },
  ],
};
