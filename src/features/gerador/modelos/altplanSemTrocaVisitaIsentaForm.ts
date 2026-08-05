/**
 * Config do formulário do modelo `altplan-sem-troca-visita-isenta` (coluna
 * esquerda do gerador). Campos, seções, opções e visibilidade condicional
 * (`mostrarQuando`), extraídos do bundle legado (builder `PVe`) e do
 * `docs/gerador/sondagem2-suporte.json`.
 */
import { CANAIS, MODELOS_EQUIP, HORARIOS_VISITA_SIMPLES, PLANOS_ATUAIS, PLANOS_ESCOLHIDOS } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

/** Fluxos em que quem solicita é um terceiro (não o titular). (legado: RVe) */
const terceiroSolicita = (v: Valores) =>
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha';

/** Fluxos que envolvem um terceiro no vínculo (parentesco). */
const temParente = (v: Valores) =>
  v.tipoSolicitacao === 'titular-solicita-terceiro-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-titular-acompanha' ||
  v.tipoSolicitacao === 'terceiro-solicita-terceiro-acompanha';

const titularAutorizaTerceiro = (v: Valores) =>
  v.tipoSolicitacao === 'titular-solicita-terceiro-acompanha';

export const ALTPLAN_SEM_TROCA_VISITA_ISENTA_FORM: ModeloForm = {
  slug: 'altplan-sem-troca-visita-isenta',
  demanda: 'alteracao-plano',
  titulo: 'Alteração de plano',
  descricao: 'Troca de plano, upgrade/downgrade e propostas.',
  modo: 'Sem troca · isento',
  variavelId: 'tipoSolicitacao',
  secoes: [
    {
      titulo: null,
      campos: [
        {
          id: 'tipoSolicitacao',
          label: 'Tipo de solicitação',
          controle: 'select',
          span: 12,
          opcoes: [
            { value: 'titular-solicita-titular-acompanha', label: 'Titular solicita e acompanha' },
            { value: 'titular-solicita-terceiro-acompanha', label: 'Titular solicita e autoriza terceiro' },
            { value: 'terceiro-solicita-titular-acompanha', label: 'Terceiro solicita e titular acompanha' },
            { value: 'terceiro-solicita-terceiro-acompanha', label: 'Terceiro solicita e terceiro acompanha' },
          ],
        },
        {
          id: 'origem',
          label: 'Origem da alteração',
          controle: 'radio',
          span: 12,
          opcoes: [
            { value: 'padrao', label: 'Cliente solicitou' },
            { value: 'ofertado', label: 'Ofertado pela WBR' },
          ],
        },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ do titular', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'cliente', label: 'Nome completo', controle: 'text', placeholder: 'Titular da conexão', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato do titular', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'semSinal', label: 'Sinal na ONU', controle: 'radio', span: 4, opcoes: [ { value: 'nao', label: 'Informar medida' }, { value: 'sim', label: 'Sem sinal' } ] },
        { id: 'sinalONU', label: 'Sinal da fibra', controle: 'sinal', placeholder: 'Ex.: 12.34 (sai -12.34DBM)', span: 6, mostrarQuando: (v) => v.semSinal === 'nao' },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Bairro do cliente', span: 6 },
      ],
    },
    {
      titulo: 'DADOS DE TERCEIRO / AUTORIZAÇÃO',
      campos: [
        { id: 'solicitante', label: 'Nome do terceiro solicitante', controle: 'text', placeholder: 'Quem entrou em contato', span: 6, mostrarQuando: terceiroSolicita },
        { id: 'contatoSol', label: 'Contato do terceiro', controle: 'phone', placeholder: 'Somente os números', span: 6, mostrarQuando: terceiroSolicita },
        { id: 'autorizado', label: 'Terceiro autorizado', controle: 'text', placeholder: 'Quem vai acompanhar/assinar', span: 6, mostrarQuando: titularAutorizaTerceiro },
        { id: 'parente', label: 'Vínculo / parentesco', controle: 'text', placeholder: 'Ex.: ESPOSA, FILHO', span: 6, mostrarQuando: temParente },
      ],
    },
    {
      titulo: 'DETALHES DO PLANO',
      campos: [
        { id: 'motivo', label: 'Motivo (apenas o trecho entre aspas, em caixa alta no texto)', controle: 'text', placeholder: "Ex.: 'deseja mais velocidade'", span: 12, mostrarQuando: (v) => v.origem === 'padrao' },
        { id: 'planoAtual', label: 'Plano atual', controle: 'select', opcoes: PLANOS_ATUAIS, span: 6 },
        { id: 'planoEscolhido', label: 'Plano escolhido', controle: 'select', opcoes: PLANOS_ESCOLHIDOS, span: 6 },
        { id: 'roteador', label: 'Roteador', controle: 'select', opcoes: MODELOS_EQUIP, span: 6 },
        { id: 'dataContrato', label: 'Plano contratado em', controle: 'text', placeholder: 'mês/ano', span: 6 },
      ],
    },
    {
      titulo: 'AGENDAMENTO',
      campos: [
        { id: 'dataVisita', label: 'Data da visita', controle: 'date', placeholder: 'dd/mm/aaaa', span: 4 },
        { id: 'horaVisita', label: 'Horário', controle: 'select', opcoes: HORARIOS_VISITA_SIMPLES, span: 4 },
        { id: 'protocolo', label: 'Nº Protocolo', controle: 'text', placeholder: '123.456', span: 4 },
      ],
    },
  ],
};
