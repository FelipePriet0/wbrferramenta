import { supabase } from '@/lib/supabase';
import type { ComoConheceuOption } from '@/features/expanded-ficha/components/ComoConheceuPopover';

/**
 * Lookup das opções de "Como conheceu a WBR". Fonte única no banco
 * (tabela como_conheceu_options); o front nunca hardcoda a lista.
 *
 * Retorna no formato do popover: { value: id (uuid), label }. O `value` é o
 * id da opção, que é o que fica gravado em applicants.como_conheceu_id.
 */
export async function listComoConheceuOptions(): Promise<ComoConheceuOption[]> {
  const { data, error } = await supabase
    .from('como_conheceu_options')
    .select('id, label')
    .eq('active', true)
    .order('display_order');
  if (error) throw new Error(error.message);
  return ((data as { id: string; label: string }[] | null) ?? []).map((r) => ({
    value: r.id,
    label: r.label,
  }));
}
