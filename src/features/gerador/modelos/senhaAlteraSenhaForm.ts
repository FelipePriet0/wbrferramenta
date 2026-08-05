/**
 * Config do formulário do modelo `senha-altera-senha` (coluna esquerda do
 * gerador). Campos, seções, opções e visibilidade condicional (`mostrarQuando`),
 * extraídos do bundle legado (builder `uqe`). Modelo SEM variável de tipo — a
 * ramificação (bloco SSID / bloco senha) vem do campo `solicitacao`. Ver
 * `docs/gerador/sondagem2-suporte.json` (slug "senha-altera-senha") e
 * `docs/gerador/builders/senhaAlteraSenha.builder.txt`.
 */
import { CANAIS } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Bloco SSID visível quando a solicitação envolve o nome da rede. (legado: d) */
const mostraSSID = (v: Valores) => {
  const o = (v.solicitacao ?? '').toUpperCase();
  return o === 'SSID' || o === 'SSID E SENHA';
};

/** Bloco senha visível quando a solicitação envolve a senha. (legado: f) */
const mostraSenha = (v: Valores) => {
  const o = (v.solicitacao ?? '').toUpperCase();
  return o === 'SENHA' || o === 'SSID E SENHA';
};

export const SENHA_ALTERA_SENHA_FORM: ModeloForm = {
  slug: 'senha-altera-senha',
  demanda: 'senha-rede',
  titulo: 'Alteração de SSID / Senha',
  descricao: 'Troca de nome da rede (SSID) e/ou senha do Wi-Fi de forma remota.',
  modo: 'Senha / SSID',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'text', placeholder: 'Somente números', span: 6 },
        { id: 'cliente', label: 'Nome Completo', controle: 'text', placeholder: 'Nome completo', span: 6 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'sinalONU', label: 'Sinal ONU', controle: 'text', placeholder: '-19.20 DBM ou SEM SINAL', span: 4 },
      ],
    },
    {
      titulo: 'REGISTRO DA ALTERAÇÃO',
      campos: [
        {
          id: 'solicitacao',
          label: 'Tipo de solicitação',
          controle: 'select',
          span: 12,
          opcoes: [
            { value: 'Senha', label: 'Senha' },
            { value: 'SSID', label: 'SSID (nome da rede)' },
            { value: 'SSID e Senha', label: 'SSID e Senha' },
          ],
        },
        { id: 'atualSSID', label: 'SSID atual', controle: 'text', placeholder: 'Insira o nome atual da rede', span: 6, mostrarQuando: mostraSSID },
        { id: 'novoSSID', label: 'SSID nova', controle: 'text', placeholder: 'Insira o novo nome da rede', span: 6, mostrarQuando: mostraSSID },
        { id: 'atualSenha', label: 'Senha atual', controle: 'text', placeholder: 'Insira a senha atual da rede', span: 6, mostrarQuando: mostraSenha },
        { id: 'novaSenha', label: 'Senha nova', controle: 'text', placeholder: 'Insira a nova senha da rede', span: 6, mostrarQuando: mostraSenha },
      ],
    },
  ],
};
