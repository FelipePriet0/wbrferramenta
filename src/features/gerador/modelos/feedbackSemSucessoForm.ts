/**
 * Config do formulário do modelo `feedback-sem-sucesso` (Feedback · Sem sucesso).
 * Campos extraídos do builder legado `lJe`: 2 tentativas de contato + estado da
 * conexão. Modelo sem variável de tipo de solicitação, saída única.
 */
import { CANAIS } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Dispositivos conectados via rádio (default 'nao') — mostra Wi-Fi/cabo. */
const temDispositivos = (v: Valores) => (v.dispositivosRadio || 'nao') === 'sim';

export const FEEDBACK_SEM_SUCESSO_FORM: ModeloForm = {
  slug: 'feedback-sem-sucesso',
  demanda: 'feedback',
  titulo: 'Feedback — Sem sucesso',
  descricao:
    'Registro de 2 tentativas de contato sem retorno do cliente, com o estado da conexão para encerramento.',
  modo: 'Feedback · sem sucesso (2 tentativas)',
  variavelId: '',
  secoes: [
    {
      titulo: '1ª TENTATIVA',
      campos: [
        { id: 'canal1', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato1', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'dataHora1', label: 'Data e hora', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 4 },
      ],
    },
    {
      titulo: '2ª TENTATIVA',
      campos: [
        { id: 'canal2', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato2', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'dataHora2', label: 'Data e hora', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 4 },
      ],
    },
    {
      titulo: 'ENCERRAMENTO',
      campos: [
        { id: 'sinal', label: 'Sinal de fibra', controle: 'sinal', placeholder: 'ex.: -18.5 dBm', span: 6 },
        {
          id: 'dispositivosRadio',
          label: 'Há dispositivos conectados?',
          controle: 'radio',
          opcoes: [
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' },
          ],
          span: 6,
        },
        { id: 'equipWifi', label: 'Qtd. via Wi-Fi', controle: 'text', placeholder: 'ex.: 3', span: 6, mostrarQuando: temDispositivos },
        { id: 'equipCabo', label: 'Qtd. via cabo', controle: 'text', placeholder: 'ex.: 1', span: 6, mostrarQuando: temDispositivos },
      ],
    },
  ],
};
