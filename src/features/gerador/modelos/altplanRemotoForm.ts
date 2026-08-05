/**
 * Config do formulário do modelo `altplan-remoto` (coluna esquerda do gerador).
 * Campos, seções, opções e visibilidade condicional (`mostrarQuando`), extraídos
 * do bundle legado. Ver `docs/gerador/sondagem2-suporte.md`.
 */
import { CANAIS, MODELOS_EQUIP, PLANOS_ATUAIS, PLANOS_ESCOLHIDOS, type Opcao } from '../catalogo';
import type { Valores } from '../render/helpers';

export type ControleCampo =
  | 'text'
  | 'phone'
  | 'cpfcnpj'
  | 'select'
  | 'radio'
  | 'datetime'
  | 'date'
  | 'sinal'
  | 'mac';

export interface CampoConfig {
  id: string;
  label: string;
  controle: ControleCampo;
  placeholder?: string;
  opcoes?: Opcao[];
  /** Largura em colunas de 12 (grid da seção). */
  span?: number;
  /** Visível só quando isto for verdadeiro (senão sempre visível). */
  mostrarQuando?: (v: Valores) => boolean;
}

export interface SecaoConfig {
  titulo: string | null; // null = bloco do topo (sem cabeçalho)
  campos: CampoConfig[];
}

export interface ModeloForm {
  slug: string;
  demanda: string;
  titulo: string;
  descricao: string;
  /** Rótulo do modo (eyebrow), ex.: "Remoto", "Presencial". */
  modo: string;
  variavelId: string; // campo que troca o "tipo"
  secoes: SecaoConfig[];
}

const ehTerceiro = (v: Valores) => v.tipoSolicitacao === 'terceiro';
const ehPJ = (v: Valores) => v.tipoSolicitacao === 'pj';
const ehTitularOuTerceiro = (v: Valores) =>
  !v.tipoSolicitacao || v.tipoSolicitacao === 'titular' || v.tipoSolicitacao === 'terceiro';
const ehTitularOuPJ = (v: Valores) =>
  !v.tipoSolicitacao || v.tipoSolicitacao === 'titular' || v.tipoSolicitacao === 'pj';

export const ALTPLAN_REMOTO_FORM: ModeloForm = {
  slug: 'altplan-remoto',
  demanda: 'alteracao-plano',
  titulo: 'Alteração de plano',
  descricao: 'Troca de plano, upgrade/downgrade e propostas.',
  modo: 'Remoto',
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
            { value: 'titular', label: 'Titular solicita (remoto)' },
            { value: 'terceiro', label: 'Terceiro solicita (titular autoriza)' },
            { value: 'pj', label: 'Pessoa Jurídica' },
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
        { id: 'solicitante', label: 'Nome do solicitante', controle: 'text', placeholder: 'Quem entrou em contato', span: 6, mostrarQuando: (v) => ehTerceiro(v) || ehPJ(v) },
        { id: 'cargo', label: 'Cargo / função', controle: 'text', placeholder: 'Ex.: SÓCIO, GERENTE, RESPONSÁVEL', span: 6, mostrarQuando: ehPJ },
        { id: 'parente', label: 'Grau de parentesco', controle: 'text', placeholder: 'Ex.: ESPOSA, FILHO', span: 6, mostrarQuando: ehTerceiro },
        { id: 'cliente', label: 'Nome completo (titular/assinante)', controle: 'text', placeholder: 'Titular da conexão', span: 6, mostrarQuando: ehTitularOuTerceiro },
        { id: 'canal', label: 'Canal', controle: 'select', opcoes: CANAIS, span: 4 },
        { id: 'contato', label: 'Contato', controle: 'phone', placeholder: 'Somente os números', span: 4 },
        { id: 'contatoSol', label: 'Contato do solicitante', controle: 'phone', placeholder: 'Somente os números', span: 4, mostrarQuando: ehTerceiro },
        { id: 'dataLigacao', label: 'Data/hora do contato', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 6 },
        { id: 'semSinal', label: 'Sinal na ONU', controle: 'radio', span: 6, opcoes: [ { value: 'nao', label: 'Informar medida' }, { value: 'sim', label: 'Sem sinal' } ] },
        { id: 'sinalONU', label: 'Sinal da fibra', controle: 'sinal', placeholder: 'Ex.: 12.34 (sai -12.34DBM)', span: 6, mostrarQuando: (v) => v.semSinal !== 'sim' },
      ],
    },
    {
      titulo: 'DETALHES DO PLANO',
      campos: [
        { id: 'motivo', label: 'Motivo (apenas o trecho entre aspas, em caixa alta no texto)', controle: 'text', placeholder: "Ex.: 'deseja cortar gastos'", span: 12, mostrarQuando: (v) => v.origem !== 'ofertado' },
        { id: 'planoAtual', label: 'Plano atual', controle: 'select', opcoes: PLANOS_ATUAIS, span: 6 },
        { id: 'planoEscolhido', label: 'Plano escolhido', controle: 'select', opcoes: PLANOS_ESCOLHIDOS, span: 6 },
        { id: 'roteador', label: 'Roteador', controle: 'select', opcoes: MODELOS_EQUIP, span: 6 },
        { id: 'dataContrato', label: 'Plano contratado em', controle: 'text', placeholder: 'mês/ano', span: 3 },
        { id: 'protocolo', label: 'Nº protocolo', controle: 'text', placeholder: '123.456', span: 3 },
        { id: 'dataProtocolo', label: 'Data/hora do protocolo', controle: 'datetime', placeholder: 'dd/mm/aaaa hh:mm', span: 6, mostrarQuando: ehTitularOuPJ },
      ],
    },
  ],
};
