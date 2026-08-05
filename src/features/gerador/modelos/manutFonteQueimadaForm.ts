/**
 * Config do formulário do modelo `manut-fonte-queimada` (coluna esquerda do
 * gerador). Campos, seções, opções e visibilidade condicional (`mostrarQuando`),
 * extraídos do bundle legado (builder `AGe`). Ver
 * `docs/gerador/sondagem2-suporte.json` e
 * `docs/gerador/builders/manutFonteQueimada.builder.txt`.
 */
import { CANAIS, HORARIOS_VISITA_SIMPLES } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Modo com visita técnica (padrão). */
const ehComVisita = (v: Valores) => !v.tipoSolicitacao || v.tipoSolicitacao === 'com-visita';
/** Modo retirar na loja. */
const ehLoja = (v: Valores) => v.tipoSolicitacao === 'loja';

export const MANUT_FONTE_QUEIMADA_FORM: ModeloForm = {
  slug: 'manut-fonte-queimada',
  demanda: 'manutencao',
  titulo: 'Fonte queimada',
  descricao: 'Manutenção de fonte queimada: sondagem remota, visita técnica isenta da fonte ou retirada na loja.',
  modo: 'Fonte queimada',
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
            { value: 'com-visita', label: 'Com visita técnica' },
            { value: 'loja', label: 'Retirar na loja' },
          ],
        },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ', controle: 'text', placeholder: 'Somente números', span: 6 },
        { id: 'cliente', label: 'Nome completo', controle: 'text', placeholder: 'Nome completo do titular da conexão', span: 6 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'sinalONU', label: 'Sinal atual', controle: 'text', placeholder: 'Ex.: -31.87 dBm', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 6, mostrarQuando: ehComVisita },
      ],
    },
    {
      titulo: 'DETALHES DA OCORRÊNCIA E AGENDAMENTO',
      campos: [
        { id: 'equip', label: 'Tipo da fonte', controle: 'select', span: 6, opcoes: [ { value: 'Fonte ONU', label: 'Fonte ONU' }, { value: 'Fonte ONT', label: 'Fonte ONT' }, { value: 'Fonte de roteador', label: 'Fonte Roteador' } ] },
        { id: 'proced', label: 'Procedimento', controle: 'select', span: 6, opcoes: [ { value: 'Realizado inversao das fontes (ONU/Roteador)', label: 'Realizado inversão das fontes (ONU/Roteador)' }, { value: 'Realizado teste em outra tomada (ONT)', label: 'Realizado teste em outra tomada (ONT)' } ] },
        { id: 'formaPag', label: 'Forma de pagamento', controle: 'select', span: 6, opcoes: [ { value: 'PIX', label: 'PIX' }, { value: 'DINHEIRO', label: 'DINHEIRO' }, { value: 'CARTAO', label: 'CARTAO' } ], mostrarQuando: ehComVisita },
        { id: 'periodo', label: 'Período (visita na loja)', controle: 'select', span: 6, opcoes: [ { value: 'MANHÃ', label: 'Manhã' }, { value: 'TARDE', label: 'Tarde' } ], mostrarQuando: ehLoja },
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 6, mostrarQuando: ehComVisita },
        { id: 'horaVisita', label: 'Hora da visita', controle: 'select', opcoes: HORARIOS_VISITA_SIMPLES, span: 6, mostrarQuando: ehComVisita },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 6 },
      ],
    },
  ],
};
