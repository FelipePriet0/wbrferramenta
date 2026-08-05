/**
 * Config do formulário do modelo `wifi-extend-ponto` (coluna esquerda do
 * gerador). Venda de ponto adicional / roteador extend. SEM variável de tipo;
 * `solicitante`/`cargo` só aparecem quando o segmento é PJ. Campos, seções e
 * visibilidade condicional extraídos do bundle legado (builder `Jqe`). Ver
 * `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/wifiExtendPonto.builder.txt`.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Segmento PJ (mostra solicitante/cargo). */
const ehPJ = (v: Valores) => v.segmento === 'PJ';

/** Troca do roteador primário (mostra o campo do modelo atual). */
const ehTroca = (v: Valores) => v.troca === 'SIM';

export const WIFI_EXTEND_PONTO_FORM: ModeloForm = {
  slug: 'wifi-extend-ponto',
  demanda: 'wifi-extend',
  titulo: 'Ponto adicional — roteador',
  descricao: 'Venda de roteador adicional para expandir a rede Wi-Fi.',
  modo: 'Wi-Fi Extend · ponto',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        {
          id: 'segmento',
          label: 'Tipo de cliente',
          controle: 'select',
          span: 6,
          opcoes: [
            { value: 'PF', label: 'Pessoa Física' },
            { value: 'PJ', label: 'Pessoa Jurídica' },
          ],
        },
        {
          id: 'troca',
          label: 'Troca do roteador primário',
          controle: 'select',
          span: 6,
          opcoes: [
            { value: 'NAO', label: 'Não' },
            { value: 'SIM', label: 'Sim' },
          ],
        },
        { id: 'roteador', label: 'Roteador primário atual', controle: 'text', placeholder: 'Modelo do roteador a substituir', span: 6, mostrarQuando: ehTroca },
        { id: 'solicitante', label: 'Nome do solicitante', controle: 'text', placeholder: 'Nome completo de quem solicitou', span: 6, mostrarQuando: ehPJ },
        { id: 'cargo', label: 'Cargo', controle: 'text', placeholder: 'Sócio, Gerente, Técnico, …', span: 6, mostrarQuando: ehPJ },
        { id: 'cliente', label: 'Nome completo / Razão social', controle: 'text', placeholder: 'Nome completo (PF) ou razão social (PJ)', span: 6 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'formaPag', label: 'Pagamento', controle: 'select', span: 6, opcoes: [ { value: 'PIX', label: 'PIX' }, { value: 'DINHEIRO', label: 'DINHEIRO' }, { value: 'CARTAO', label: 'CARTAO' } ] },
        { id: 'parcela', label: 'Parcelas', controle: 'select', span: 3, opcoes: [ { value: '1X', label: '1x' }, { value: '2X', label: '2x' }, { value: '3X', label: '3x' } ] },
        { id: 'protocolo', label: 'Nº Protocolo', controle: 'text', placeholder: '123.456', span: 3 },
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6 },
        { id: 'horaVisita', label: 'Horário', controle: 'select', span: 6, opcoes: HORARIOS_VISITA_SIMPLES },
      ],
    },
  ],
};
