/**
 * Contrato declarativo de campo de formulário, portado do gerador-os
 * (RamonyML/gerador-os, web/src/types/osTemplate.ts).
 *
 * É o miolo que trazemos do gerador-os: cada modelo de mud-end descreve seus
 * campos como `OsTemplateField[]` + `showWhen` (em vez de `&&` no JSX). O nosso
 * `MudEndFieldsRenderer` (PR 1) despacha cada `control` para os NOSSOS inputs.
 *
 * Diferença vs a fonte: removida a dependência de `Sector`/`OsTemplate` (o
 * registry de mud-end não precisa do envelope de setor — ver models/registry.ts).
 */

/** Tipo de controle no formulário do operador */
export type FieldControl =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'date'
  /** Data + hora com seletor (valor `DD/MM/YYYY HH:mm`). */
  | 'datetime'
  /** Telefone BR com máscara (00) 00000-0000. */
  | 'phone'
  /** Sinal da fibra com máscara 00.00 (saída -00.00DBM). */
  | 'signal'

export interface FieldOption {
  value: string
  label: string
  /** Ícone opcional (chave do registro de ícones no formulário). */
  icon?: string
}

/** Colunas 1–12 por breakpoint (grid 12 colunas, estilo Bootstrap). */
export interface FieldLayout {
  xs?: number
  sm?: number
  md?: number
}

export interface OsTemplateField {
  id: string
  label: string
  /** Valor inicial quando o formulário é carregado. */
  defaultValue?: string
  placeholder?: string
  /** Legado: se não houver `control`, textarea ⇐ multiline */
  multiline?: boolean
  control?: FieldControl
  /** Obrigatório para select e radio */
  options?: FieldOption[]
  /** Largura no formulário; se omitido, o renderer usa heurística por tipo. */
  layout?: FieldLayout
  /** Agrupa campos em seções (ex.: "IDENTIFICAÇÃO DO CLIENTE"). */
  section?: string
  /** Renderiza o campo com destaque (ex.: select-subtítulo do formulário). */
  highlight?: boolean
  /** Tom do destaque do campo (default verde). */
  tone?: 'green' | 'red'
  /** Exibe o campo somente quando outro campo tiver um dos valores informados. */
  showWhen?: {
    field: string
    equals: string | string[]
  }
}
