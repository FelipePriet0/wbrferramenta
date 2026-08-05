/**
 * Config do formulário do modelo `altplan-troca-visita-isenta` (coluna esquerda
 * do gerador). Campos, seções, opções e visibilidade condicional
 * (`mostrarQuando`), extraídos do bundle legado e do pacote do modelo. Ver
 * `docs/gerador/builders/altplanTrocaVisitaIsenta.builder.txt` e
 * `docs/gerador/sondagem2-suporte.json`.
 */
import { CANAIS, MODELOS_EQUIP, HORARIOS_VISITA_SIMPLES, PLANOS_ATUAIS, PLANOS_ESCOLHIDOS } from '../catalogo';
import type { ModeloForm } from './altplanRemotoForm';
import type { Valores } from '../render/helpers';

const TIT_TIT = 'titular-solicita-titular-acompanha';
const TIT_TER = 'titular-solicita-terceiro-acompanha';
const TER_TIT = 'terceiro-solicita-titular-acompanha';
const TER_TER = 'terceiro-solicita-terceiro-acompanha';

/** Terceiro é quem solicita (legado: bHe). */
const ehTerceiroSolicita = (v: Valores) =>
  v.tipoSolicitacao === TER_TIT || v.tipoSolicitacao === TER_TER;
/** Titular solicita e autoriza um terceiro a acompanhar (legado: oHe). */
const ehTitularAutorizaTerceiro = (v: Valores) => v.tipoSolicitacao === TIT_TER;
/** Há vínculo/parentesco a informar (legado: [oHe, HO, UO]). */
const temParente = (v: Valores) =>
  v.tipoSolicitacao === TIT_TER ||
  v.tipoSolicitacao === TER_TIT ||
  v.tipoSolicitacao === TER_TER;

export const ALTPLAN_TROCA_VISITA_ISENTA_FORM: ModeloForm = {
  slug: 'altplan-troca-visita-isenta',
  demanda: 'alteracao-plano',
  titulo: 'Alteração de plano',
  descricao: 'Troca de plano, upgrade/downgrade e propostas.',
  modo: 'Com troca · isento',
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
            { value: TIT_TIT, label: 'Titular solicita e acompanha' },
            { value: TIT_TER, label: 'Titular solicita e autoriza terceiro' },
            { value: TER_TIT, label: 'Terceiro solicita e titular acompanha' },
            { value: TER_TER, label: 'Terceiro solicita e terceiro acompanha' },
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
        { id: 'cliente', label: 'Nome completo', controle: 'text', placeholder: 'Nome completo do titular', span: 8 },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato do titular', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'bairro', label: 'Bairro', controle: 'text', placeholder: 'Insira o bairro do cliente', span: 4 },
        { id: 'semSinal', label: 'Sinal na ONU', controle: 'radio', span: 6, opcoes: [ { value: 'nao', label: 'Informar medida' }, { value: 'sim', label: 'Sem sinal' } ] },
        { id: 'sinalONU', label: 'Sinal da fibra', controle: 'sinal', placeholder: 'Ex.: 12.34 (sai -12.34DBM)', span: 6, mostrarQuando: (v) => v.semSinal !== 'sim' },
      ],
    },
    {
      titulo: 'DADOS DE TERCEIRO / AUTORIZAÇÃO',
      campos: [
        { id: 'solicitante', label: 'Nome do terceiro solicitante', controle: 'text', placeholder: 'Quem entrou em contato', span: 6, mostrarQuando: ehTerceiroSolicita },
        { id: 'contatoSol', label: 'Contato do terceiro', controle: 'phone', placeholder: 'Somente os números', span: 6, mostrarQuando: ehTerceiroSolicita },
        { id: 'autorizado', label: 'Terceiro autorizado', controle: 'text', placeholder: 'Nome completo de quem acompanhará o técnico', span: 6, mostrarQuando: ehTitularAutorizaTerceiro },
        { id: 'parente', label: 'Vínculo / parentesco', controle: 'text', placeholder: 'MÃE, IRMÃO, LOCATÁRIO, ETC...', span: 6, mostrarQuando: temParente },
      ],
    },
    {
      titulo: 'DETALHES DO PLANO',
      campos: [
        { id: 'motivo', label: 'Motivo (apenas o trecho entre aspas, em caixa alta no texto)', controle: 'text', placeholder: "Ex.: 'deseja cortar gastos'", span: 12, mostrarQuando: (v) => v.origem !== 'ofertado' },
        { id: 'planoAtual', label: 'Plano atual', controle: 'select', opcoes: PLANOS_ATUAIS, span: 6 },
        { id: 'planoEscolhido', label: 'Plano escolhido', controle: 'select', opcoes: PLANOS_ESCOLHIDOS, span: 6 },
        { id: 'compativel', label: 'Roteador atual é compatível com o novo plano?', controle: 'select', opcoes: [{ value: 'SIM', label: 'Sim' }, { value: 'NÃO', label: 'Não' }], span: 6 },
        { id: 'roteador', label: 'Roteador atual', controle: 'select', opcoes: MODELOS_EQUIP, span: 6 },
        { id: 'dataContrato', label: 'Plano contratado em', controle: 'text', placeholder: 'mês/ano', span: 3 },
        { id: 'roteadorSug', label: 'Roteador sugerido (p/ agenda)', controle: 'select', opcoes: MODELOS_EQUIP, span: 9 },
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
