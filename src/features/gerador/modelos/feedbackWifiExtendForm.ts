/**
 * Config do formulário do modelo `feedback-wifi-extend` (coluna esquerda do
 * gerador). Feedback pós-visita de instalação de roteadores Wi-Fi Extend, com
 * aferição de velocidade por roteador. Campos e seções extraídos do bundle
 * legado (builder `CYe`), com ajustes pedidos pelo time de suporte (ver
 * `feedbackWifiExtend.ts`): sem o campo "Equipamento novo/do cliente", MAC com
 * máscara automática, plano atual como select (mesmo catálogo do modelo de
 * instalação do Extend) e um bloco fixo de "Ponto Principal" separado dos
 * roteadores Wi-Fi Extend (antes só existia "Roteador N" genérico, e o texto
 * dava a entender que o principal também era um Extend). Ver
 * `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/feedbackWifiExtend.builder.txt`.
 */
import { CANAIS, PLANOS_EXTEND, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { CampoConfig, ModeloForm } from './altplanRemotoForm';

const QTD_EXTENDS: Opcao[] = [
  { value: '1 roteador', label: '1 roteador' },
  { value: '2 roteadores', label: '2 roteadores' },
  { value: '3 roteadores', label: '3 roteadores' },
];

const DISPENSOU_TESTES: Opcao[] = [
  { value: 'nao', label: 'Não — testes realizados' },
  { value: 'sim', label: 'Sim — dispensou' },
];

const TESTES_VIA: Opcao[] = [
  { value: 'CABO', label: 'CABO' },
  { value: 'WI-FI', label: 'WI-FI' },
];

const CONECTADO_VIA: Opcao[] = [
  { value: 'WI-FI', label: 'WI-FI' },
  { value: 'CABO', label: 'CABO' },
];

/** Só quando o cliente NÃO dispensou os testes (legado: dispensouTestes ∈ `nao`). */
const testesRealizados = (v: Valores) => v.dispensouTestes !== 'sim';

/** Quantidade de EXTENDS escolhida (parseInt de "N roteador(es)"; default 1, como no render). */
const qtdExtends = (v: Valores) => parseInt(v.qtdRoteadores || '1', 10);

/**
 * Campos de um bloco de roteador (id `sufixo`: `'Principal'` ou `1`/`2`/`3`),
 * lidos pelo render em `blocoRoteador` (`local${sufixo}`, `roteador${sufixo}`,
 * `mac${sufixo}`, `tecCabo${sufixo}`, `tecWifi${sufixo}`, `equipCliente${sufixo}`,
 * `veloCliente${sufixo}`, `conectCliente${sufixo}`, `energia${sufixo}`).
 */
function camposBlocoRoteador(sufixo: string, rotulo: string, mostrarQuando?: (v: Valores) => boolean): CampoConfig[] {
  const mostrarSeTestesRealizados = (v: Valores) => (mostrarQuando ? mostrarQuando(v) : true) && testesRealizados(v);
  return [
    { id: `local${sufixo}`, label: `${rotulo} — Local`, controle: 'text', placeholder: 'Ex.: SALA', span: 4, mostrarQuando },
    { id: `roteador${sufixo}`, label: `${rotulo} — Modelo`, controle: 'text', placeholder: 'Modelo do roteador', span: 4, mostrarQuando },
    { id: `mac${sufixo}`, label: `${rotulo} — MAC`, controle: 'mac', placeholder: 'XX:XX:XX:XX:XX:XX', span: 4, mostrarQuando },
    { id: `tecCabo${sufixo}`, label: `${rotulo} — Téc. aferiu via cabo (MEGA)`, controle: 'text', placeholder: 'Ex.: 300', span: 3, mostrarQuando },
    { id: `tecWifi${sufixo}`, label: `${rotulo} — Téc. aferiu Wi-Fi 5G (MEGA)`, controle: 'text', placeholder: 'Ex.: 280', span: 3, mostrarQuando },
    { id: `equipCliente${sufixo}`, label: `${rotulo} — Equipamento do cliente (aferição)`, controle: 'text', placeholder: 'Ex.: IPHONE 13, NOTEBOOK DELL', span: 6, mostrarQuando: mostrarSeTestesRealizados },
    { id: `veloCliente${sufixo}`, label: `${rotulo} — Cliente aferiu (MBPS)`, controle: 'text', placeholder: 'Ex.: 250', span: 4, mostrarQuando: mostrarSeTestesRealizados },
    { id: `conectCliente${sufixo}`, label: `${rotulo} — Cliente conectado via`, controle: 'select', opcoes: CONECTADO_VIA, span: 4, mostrarQuando: mostrarSeTestesRealizados },
    { id: `energia${sufixo}`, label: `${rotulo} — Ligado em`, controle: 'text', placeholder: 'Ex.: TOMADA', span: 4, mostrarQuando },
  ];
}

/** Roteadores Wi-Fi Extend (índice 1..N) — visíveis conforme `qtdRoteadores`. */
function camposExtend(idx: number): CampoConfig[] {
  return camposBlocoRoteador(String(idx), `Wi-Fi Extend ${idx}`, (v) => qtdExtends(v) >= idx);
}

export const FEEDBACK_WIFI_EXTEND_FORM: ModeloForm = {
  slug: 'feedback-wifi-extend',
  demanda: 'feedback',
  titulo: 'Feedback — Wi-Fi Extend',
  descricao: 'Feedback pós-visita da instalação de roteadores Wi-Fi Extend, com aferição de velocidade.',
  modo: 'Feedback · Wi-Fi Extend',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO',
      campos: [
        { id: 'cliente', label: 'Nome do cliente', controle: 'text', placeholder: 'Nome completo', span: 6 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 3 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 3 },
        { id: 'dataHora', label: 'Data e hora do feedback', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 6 },
      ],
    },
    {
      titulo: 'PLANO E CONFIGURAÇÃO',
      campos: [
        { id: 'plano', label: 'Plano atual', controle: 'select', opcoes: PLANOS_EXTEND, span: 6 },
        { id: 'qtdRoteadores', label: 'Quantidade de roteadores Wi-Fi Extend instalados', controle: 'select', opcoes: QTD_EXTENDS, span: 6 },
        { id: 'dispensouTestes', label: 'Cliente dispensou testes?', controle: 'radio', opcoes: DISPENSOU_TESTES, span: 6 },
        { id: 'wifiCabo', label: 'Testes realizados via', controle: 'select', opcoes: TESTES_VIA, span: 6, mostrarQuando: testesRealizados },
      ],
    },
    {
      titulo: 'PONTO PRINCIPAL (JÁ INSTALADO)',
      campos: camposBlocoRoteador('Principal', 'Ponto Principal'),
    },
    {
      titulo: 'ROTEADORES WI-FI EXTEND',
      campos: [...camposExtend(1), ...camposExtend(2), ...camposExtend(3)],
    },
    {
      titulo: 'OBSERVAÇÕES',
      campos: [
        // `obs` é textarea no legado; o tipo ControleCampo ainda não tem 'textarea',
        // então usamos 'text' (mesma convenção dos demais feedbacks).
        { id: 'obs', label: 'Observação', controle: 'text', placeholder: 'Informações adicionais (opcional)', span: 12 },
      ],
    },
  ],
};
