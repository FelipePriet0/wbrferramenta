import { renderTemplate } from '@/lib/renderTemplate';
import { splitOsPreviewSections } from '@/lib/splitOsPreviewSections';
import { MUD_END_MODEL_BY_SLUG } from './models/registry';

/**
 * Pipeline de texto do Mud End: buildTextos(values, operador) ->
 * renderTemplate(outputTemplate) -> splitOsPreviewSections. Devolve 1 seção
 * por bloco (Protocolo / O.S / Agenda). A inviabilidade gera só Protocolo.
 */
export function computeMudEndSections(
  slug: string,
  values: Record<string, string>,
  operadorPrimeiroNome: string,
): { id: string; label: string; body: string }[] {
  const model = MUD_END_MODEL_BY_SLUG[slug];
  if (!model) return [];
  const def = model.getDefaults();
  const ctx = { ...values, ...model.buildTextos(values, operadorPrimeiroNome) };
  const full = renderTemplate(def.outputTemplate, ctx);
  return splitOsPreviewSections(full);
}
