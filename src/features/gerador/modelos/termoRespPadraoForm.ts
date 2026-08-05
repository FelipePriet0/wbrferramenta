/**
 * Config do formulário do modelo `termo-resp-padrao` (coluna esquerda do
 * gerador). Termo de responsabilidade de acesso ao roteador em comodato.
 * Campos, seções, opções e visibilidade condicional (`mostrarQuando`),
 * extraídos do bundle legado (builder `iJe`). Ver
 * `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/termoRespPadrao.builder.txt`. SEM variável de tipo.
 */
import { CANAIS } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Cliente confirmou que testou a nova senha. */
const testouSenha = (v: Valores) => v.testouSenha === 'sim';

export const TERMO_RESP_PADRAO_FORM: ModeloForm = {
  slug: 'termo-resp-padrao',
  demanda: 'termo-docs',
  titulo: 'Termo de Responsabilidade — Padrão',
  descricao: 'Termo de acesso ao roteador em comodato: assume responsabilidade pelo equipamento.',
  modo: 'Termo de responsabilidade',
  variavelId: '',
  secoes: [
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cliente', label: 'Nome Completo', controle: 'text', placeholder: 'Nome completo', span: 6 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 6 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 6 },
        { id: 'sinalONU', label: 'Sinal ONU', controle: 'text', placeholder: '-19.20 DBM ou SEM SINAL', span: 6 },
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'text', placeholder: '000.000.000-00', span: 6 },
      ],
    },
    {
      titulo: 'EQUIPAMENTO E ACESSO',
      campos: [
        { id: 'mac', label: 'MAC', controle: 'text', placeholder: 'A1:B2:C3:D4:E5:F6', span: 6 },
        { id: 'roteador', label: 'ONT/Roteador', controle: 'text', placeholder: 'Modelo do roteador', span: 6 },
        { id: 'protocolo', label: 'Protocolo', controle: 'text', placeholder: '2501.1234', span: 6 },
        { id: 'testouSenha', label: 'Testou a nova senha?', controle: 'radio', span: 6, opcoes: [ { value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' } ] },
        { id: 'user', label: 'Usuário', controle: 'text', placeholder: 'Admin/super', span: 6, mostrarQuando: testouSenha },
        { id: 'senha', label: 'Senha', controle: 'text', placeholder: 'Abcd1234/super123', span: 6, mostrarQuando: testouSenha },
      ],
    },
  ],
};
