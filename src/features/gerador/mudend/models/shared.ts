/**
 * Constantes compartilhadas entre os modelos de mud-end.
 *
 * As sub-variações T_* têm como DONO o `padrao.ts` (paridade com o gerador-os,
 * onde comFibra/equipamentos/altplan* importam de padrao). Aqui só
 * re-exportamos, p/ haver um ponto central de referência sem duplicar valor.
 *
 * As I_* (inviabilidade) são um conjunto PRÓPRIO e disjunto — usadas só pela
 * inviabilidade (PR 4), que não cria card nem gera O.S/Agenda.
 */

// Sub-variações dos modelos COM viabilidade (dono = padrao.ts).
export {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from './padrao'

// Sub-variações da INVIABILIDADE (conjunto próprio).
export const I_TITULAR = 'inviab-titular'
export const I_TERCEIRO = 'inviab-terceiro'
export const I_PJ = 'inviab-pj'
