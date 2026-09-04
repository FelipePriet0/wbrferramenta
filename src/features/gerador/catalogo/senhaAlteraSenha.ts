/**
 * Catálogo de frases do modelo `senha-altera-senha`.
 * Alteração de SSID e/ou senha do Wi-Fi a pedido do cliente.
 *
 * A regência do artigo ("DA SSID E DA SENHA" vs "A SSID E A SENHA") e a
 * concordância de "ALTERADA/ALTERADAS" ficam no render: são regra gramatical
 * calculada, não texto editável.
 */
import type { Catalogo } from './tipos';

export const SENHA_ALTERA_SENHA: Catalogo = {
  abertura: {
    rotulo: 'Abertura do atendimento',
    texto: '{cliente} ENTROU EM CONTATO POR {canal} ({contato}) E SOLICITOU A ALTERAÇÃO DA {oQue} DO WI-FI.',
    obrigatorios: ['cliente'],
  },
  statusOnu: {
    rotulo: 'Status remoto do cliente',
    texto: 'CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ONU {sinalONU} SEM OSCILAÇÃO.',
    obrigatorios: [],
  },
  motivoPessoal: {
    rotulo: 'Motivo do pedido',
    texto: 'QUESTIONADO, {cliente} DESEJA ALTERAR A {oQue} DE SUA REDE WI-FI POR MOTIVO PESSOAL.',
    obrigatorios: ['cliente'],
  },
  ssidAtual: {
    rotulo: 'SSID atual',
    texto: 'SSID ATUAL: {atualSSID}',
    obrigatorios: [],
  },
  ssidNova: {
    rotulo: 'SSID nova',
    texto: 'SSID NOVA: {novoSSID}',
    obrigatorios: [],
  },
  senhaAtual: {
    rotulo: 'Senha atual',
    texto: 'SENHA ATUAL: {atualSenha}',
    obrigatorios: [],
  },
  senhaNova: {
    rotulo: 'Senha nova',
    texto: 'SENHA NOVA: {novaSenha}',
    obrigatorios: [],
  },
  confirmacao: {
    rotulo: 'Confirmação da alteração',
    texto: '{solicitacao} {alterado} COM SUCESSO E {cliente} CONFIRMOU CONEXÃO.',
    obrigatorios: ['cliente'],
  },
};
