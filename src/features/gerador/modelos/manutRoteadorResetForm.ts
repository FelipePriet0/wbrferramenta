/**
 * Config do formulário do modelo `manut-roteador-reset` (3 modos de atendimento:
 * visita técnica / trazer na loja / orientação remota).
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

const ehVisita = (v: Valores) => (v.tipoSolicitacao || 'visita') === 'visita';
const ehLoja = (v: Valores) => v.tipoSolicitacao === 'loja';
const ehRemoto = (v: Valores) => v.tipoSolicitacao === 'remoto';

const OSCILA: Opcao[] = [
  { value: 'Com oscilacao', label: 'Com oscilação' },
  { value: 'Sem oscilacao', label: 'Sem oscilação' },
];
const FORMA_PAG: Opcao[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'DINHEIRO' },
  { value: 'CARTAO', label: 'CARTÃO' },
];

export const MANUT_ROTEADOR_RESET_FORM: ModeloForm = {
  slug: 'manut-roteador-reset',
  demanda: 'manutencao',
  titulo: 'Roteador resetado',
  descricao: 'Roteador com reset de fábrica — visita, retirada na loja ou reconfiguração remota.',
  modo: 'Roteador resetado',
  variavelId: 'tipoSolicitacao',
  secoes: [
    {
      titulo: null,
      campos: [
        {
          id: 'tipoSolicitacao',
          label: 'Modo de atendimento',
          controle: 'select',
          span: 12,
          opcoes: [
            { value: 'visita', label: 'Visita técnica' },
            { value: 'loja', label: 'Trazer roteador na loja' },
            { value: 'remoto', label: 'Orientação remota' },
          ],
        },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Nome completo', controle: 'text', placeholder: 'Nome completo', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4, mostrarQuando: ehVisita },
      ],
    },
    {
      titulo: 'DETALHES DA OCORRÊNCIA',
      campos: [
        { id: 'sinalONU', label: 'Sinal ONU', controle: 'text', placeholder: 'Ex.: -21.50DBM', span: 4 },
        { id: 'oscila', label: 'Oscilação', controle: 'select', opcoes: OSCILA, span: 4 },
        { id: 'roteador', label: 'Roteador', controle: 'text', placeholder: 'Modelo do roteador', span: 4 },
        { id: 'ssid', label: 'SSID (nome da rede)', controle: 'text', placeholder: 'Nome da rede Wi-Fi', span: 6, mostrarQuando: ehRemoto },
        { id: 'senhaWifi', label: 'Senha Wi-Fi', controle: 'text', placeholder: 'Senha da rede', span: 6, mostrarQuando: ehRemoto },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'dataLigacao', label: 'Quando o cliente vira a loja?', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 6, mostrarQuando: ehLoja },
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6, mostrarQuando: ehVisita },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', span: 6, opcoes: HORARIOS_VISITA_SIMPLES, mostrarQuando: ehVisita },
        { id: 'formaPag', label: 'Pagamento', controle: 'select', opcoes: FORMA_PAG, span: 6, mostrarQuando: ehVisita },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 6, mostrarQuando: ehVisita },
      ],
    },
  ],
};
