/**
 * Config do formulário do modelo `altplan-presencial`. Campos, seções e
 * visibilidade condicional extraídos do bundle legado. Só titular/terceiro
 * (sem modo ofertado). Ver `docs/gerador/sondagem2-suporte.md`.
 */
import { CANAIS, MODELOS_EQUIP, PLANOS_ATUAIS, PLANOS_ESCOLHIDOS } from '../catalogo';
import type { Valores } from '../render/helpers';
import type { ModeloForm } from './altplanRemotoForm';

const ehTerceiro = (v: Valores) => v.tipoSolicitacao === 'terceiro';
const ehTitular = (v: Valores) => !v.tipoSolicitacao || v.tipoSolicitacao === 'titular';

export const ALTPLAN_PRESENCIAL_FORM: ModeloForm = {
  slug: 'altplan-presencial',
  demanda: 'alteracao-plano',
  titulo: 'Alteração de plano',
  descricao: 'Troca de plano, upgrade/downgrade e propostas.',
  modo: 'Presencial',
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
            { value: 'titular', label: 'Titular comparece (presencial)' },
            { value: 'terceiro', label: 'Terceiro comparece (titular autoriza)' },
          ],
        },
      ],
    },
    {
      titulo: 'IDENTIFICAÇÃO DO CLIENTE',
      campos: [
        { id: 'cpf', label: 'CPF / CNPJ do titular', controle: 'cpfcnpj', placeholder: 'Somente números', span: 4 },
        { id: 'solicitante', label: 'Nome do solicitante', controle: 'text', placeholder: 'Quem compareceu', span: 6, mostrarQuando: ehTerceiro },
        { id: 'parente', label: 'Grau de parentesco', controle: 'text', placeholder: 'Ex.: ESPOSA, FILHO', span: 6, mostrarQuando: ehTerceiro },
        { id: 'cliente', label: 'Nome completo (titular/assinante)', controle: 'text', placeholder: 'Titular da conexão', span: 6 },
        { id: 'canal', label: 'Canal da confirmação com titular', controle: 'select', opcoes: CANAIS, span: 6, mostrarQuando: ehTerceiro },
        { id: 'contato', label: 'Contato do titular', controle: 'phone', placeholder: 'Somente os números', span: 6, mostrarQuando: ehTerceiro },
        { id: 'dataLigacao', label: 'Data/hora da confirmação com titular', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 6, mostrarQuando: ehTerceiro },
        { id: 'dataAtendimento', label: 'Data/hora do atendimento', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 6, mostrarQuando: ehTitular },
        { id: 'semSinal', label: 'Sinal na ONU', controle: 'radio', span: 6, opcoes: [ { value: 'nao', label: 'Informar medida' }, { value: 'sim', label: 'Sem sinal' } ] },
        { id: 'sinalONU', label: 'Sinal da fibra', controle: 'sinal', placeholder: 'Ex.: 12.34 (sai -12.34DBM)', span: 6, mostrarQuando: (v) => v.semSinal !== 'sim' },
      ],
    },
    {
      titulo: 'DETALHES DO PLANO',
      campos: [
        { id: 'motivo', label: 'Motivo (apenas o trecho entre aspas, em caixa alta no texto)', controle: 'text', placeholder: "Ex.: 'deseja cortar gastos'", span: 12 },
        { id: 'planoAtual', label: 'Plano atual', controle: 'select', opcoes: PLANOS_ATUAIS, span: 6 },
        { id: 'planoEscolhido', label: 'Plano escolhido', controle: 'select', opcoes: PLANOS_ESCOLHIDOS, span: 6 },
        { id: 'roteador', label: 'Roteador', controle: 'select', opcoes: MODELOS_EQUIP, span: 6 },
        { id: 'dataContrato', label: 'Plano contratado em', controle: 'text', placeholder: 'mês/ano', span: 3 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 3 },
        { id: 'dataProtocolo', label: 'Data/hora do protocolo', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 6, mostrarQuando: ehTitular },
      ],
    },
  ],
};
