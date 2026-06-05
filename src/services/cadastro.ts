import { supabase } from '@/lib/supabase';
import type {
  BasicInfoPF,
  BasicInfoPJ,
  BasicInfoRural,
  CriarFichaResult,
} from '@/features/cadastro/types';
import type { AppModel } from '@/features/editar-ficha/types';
import type {
  ExpandedAppModel,
  ExpandedCard,
  PfModel,
  PjModel,
  RuralModel,
} from '@/features/expanded-ficha/types';
import type { PersonType } from '@/lib/types';
import { formatCnpj, formatCpf } from '@/lib/masks';

function digitsOnly(s?: string | null): string {
  return (s ?? '').replace(/\D+/g, '');
}

function clean(value?: string | null): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length ? trimmed : null;
}

/**
 * Create PF ficha atomically (applicants + pf_fichas + kanban_cards in entrada).
 *
 * Calls criar_ficha_pf_atomic on the database. Returns the three IDs.
 */
export async function criarFichaPF(
  input: BasicInfoPF,
  userId: string,
): Promise<CriarFichaResult> {
  const { data, error } = await supabase.rpc('criar_ficha_pf_atomic', {
    p_user_id: userId,
    p_primary_name: input.nome.trim(),
    // formatCpf is idempotent (strips non-digits internally then re-masks),
    // so it works whether the modal already applied the mask or not. We
    // persist the masked form so the Expanded view opens with the mask
    // already on, instead of forcing the user to re-type to trigger it.
    p_cpf_cnpj: formatCpf(input.cpf),
    p_phone: null,
    p_whatsapp: null,
    p_email: null,
    p_birth_date: null,
    p_naturalidade: null,
    p_uf_naturalidade: null,
  });

  if (error) throw new Error(error.message);
  const obj = data as { applicant_id: string; ficha_id: string; card_id: string };
  return {
    applicantId: obj.applicant_id,
    fichaId: obj.ficha_id,
    cardId: obj.card_id,
  };
}

/**
 * Read the bundle that EditarFichaModal needs: applicant fields + the card's
 * editable fields (due_at, hora_at) + audit fields (created_at, created_by,
 * assignee_id) + person_type so the modal can adapt labels.
 */
export async function fetchApplicantCard(
  applicantId: string,
  cardId: string,
): Promise<{
  applicant: Partial<AppModel> & { person_type: PersonType };
  card: {
    created_at: string;
    due_at: string | null;
    hora_at: string[] | null;
    periodo: 'manha' | 'tarde' | null;
    created_by: string | null;
    vendor_id: string | null;
    assignee_id: string | null;
    stage: string;
    area: string;
  };
}> {
  const [appRes, cardRes] = await Promise.all([
    supabase
      .from('applicants')
      .select(
        'person_type, primary_name, cpf_cnpj, phone, whatsapp, email, ' +
          'address_line, address_number, address_complement, cep, bairro, ' +
          'plano_acesso, venc, carne_impresso, sva_avulso, taxa_instalacao, via',
      )
      .eq('id', applicantId)
      .single(),
    supabase
      .from('kanban_cards')
      .select('created_at, due_at, hora_at, periodo, created_by, vendor_id, assignee_id, stage, area')
      .eq('id', cardId)
      .single(),
  ]);
  if (appRes.error) throw new Error(appRes.error.message);
  if (cardRes.error) throw new Error(cardRes.error.message);
  return {
    applicant: appRes.data as unknown as Partial<AppModel> & {
      person_type: PersonType;
    },
    card: cardRes.data as unknown as {
      created_at: string;
      due_at: string | null;
      hora_at: string[] | null;
      periodo: 'manha' | 'tarde' | null;
      created_by: string | null;
      vendor_id: string | null;
      assignee_id: string | null;
      stage: string;
      area: string;
    },
  };
}

/**
 * Patch an applicant row. Used by the editor's autosave — RLS only allows
 * non-leitor roles.
 */
export async function updateApplicant(
  applicantId: string,
  patch: Partial<AppModel>,
): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase
    .from('applicants')
    .update(patch)
    .eq('id', applicantId);
  if (error) throw new Error(error.message);
}

/**
 * Patch a kanban_cards row (used for due_at + hora_at autosave from the modal).
 * Never use this to change `stage` — that goes through services/kanban → change_stage.
 */
export async function updateCard(
  cardId: string,
  patch: {
    due_at?: string | null;
    hora_at?: string[] | null;
    periodo?: 'manha' | 'tarde' | null;
  },
): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase
    .from('kanban_cards')
    .update(patch)
    .eq('id', cardId);
  if (error) throw new Error(error.message);
}

/**
 * Read everything an Expanded PF page needs: full applicant row + pf_fichas
 * + the active kanban card (most recent non-deleted). If a specific cardId is
 * provided in the URL, that one wins.
 */
export async function fetchExpandedPF(
  applicantId: string,
  preferCardId?: string | null,
): Promise<{
  applicant: ExpandedAppModel;
  pf: PfModel;
  card: ExpandedCard | null;
}> {
  const [appRes, pfRes] = await Promise.all([
    supabase
      .from('applicants')
      .select(
        'primary_name, cpf_cnpj, phone, whatsapp, email, ' +
          'address_line, address_number, address_complement, cep, bairro, ' +
          'plano_acesso, venc, sva_avulso, carne_impresso, ' +
          'quem_solicitou, telefone_solicitante, protocolo_mk, meio, ' +
          'como_conheceu_id, ' +
          'info_spc, info_pesquisador, info_relevantes, info_mk, observacoes, ' +
          'parecer_analise, representante_mz, created_at, field_audit',
      )
      .eq('id', applicantId)
      .maybeSingle(),
    supabase
      .from('pf_fichas')
      .select('*')
      .eq('applicant_id', applicantId)
      .is('deleted_at', null)
      .maybeSingle(),
  ]);
  if (appRes.error) throw new Error(`applicants: ${appRes.error.message}`);
  if (pfRes.error) throw new Error(`pf_fichas: ${pfRes.error.message}`);
  if (!appRes.data) throw new Error(`Applicant ${applicantId} não encontrado`);

  let card: ExpandedCard | null = null;
  if (preferCardId) {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('id, created_at, due_at, hora_at, periodo, stage, vendor_id, archived_at')
      .eq('id', preferCardId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    card = (data as ExpandedCard | null) ?? null;
  }
  if (!card) {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('id, created_at, due_at, hora_at, periodo, stage, vendor_id, archived_at')
      .eq('applicant_id', applicantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    card = (data as ExpandedCard | null) ?? null;
  }

  return {
    applicant: (appRes.data as ExpandedAppModel | null) ?? {},
    pf: (pfRes.data as PfModel | null) ?? {},
    card,
  };
}

/**
 * Patch a pf_fichas row. RLS only allows non-leitor roles.
 */
export async function updatePfFicha(
  applicantId: string,
  patch: Partial<PfModel>,
): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase
    .from('pf_fichas')
    .update(patch)
    .eq('applicant_id', applicantId);
  if (error) throw new Error(error.message);
}

/**
 * Read everything an Expanded PJ page needs: full applicant row + pj_fichas
 * + the active kanban card. Mirrors fetchExpandedPF.
 */
export async function fetchExpandedPJ(
  applicantId: string,
  preferCardId?: string | null,
): Promise<{
  applicant: ExpandedAppModel;
  pj: PjModel;
  card: ExpandedCard | null;
}> {
  const [appRes, pjRes] = await Promise.all([
    supabase
      .from('applicants')
      .select(
        'primary_name, cpf_cnpj, phone, whatsapp, email, ' +
          'address_line, address_number, address_complement, cep, bairro, ' +
          'plano_acesso, venc, sva_avulso, carne_impresso, ' +
          'quem_solicitou, telefone_solicitante, protocolo_mk, meio, ' +
          'como_conheceu_id, ' +
          'info_spc, info_pesquisador, info_relevantes, info_mk, observacoes, ' +
          'parecer_analise, representante_mz, created_at, field_audit',
      )
      .eq('id', applicantId)
      .maybeSingle(),
    supabase
      .from('pj_fichas')
      .select('*')
      .eq('applicant_id', applicantId)
      .is('deleted_at', null)
      .maybeSingle(),
  ]);
  if (appRes.error) throw new Error(`applicants: ${appRes.error.message}`);
  if (pjRes.error) throw new Error(`pj_fichas: ${pjRes.error.message}`);
  if (!appRes.data) throw new Error(`Applicant ${applicantId} não encontrado`);

  let card: ExpandedCard | null = null;
  if (preferCardId) {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('id, created_at, due_at, hora_at, periodo, stage, vendor_id, archived_at')
      .eq('id', preferCardId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    card = (data as ExpandedCard | null) ?? null;
  }
  if (!card) {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('id, created_at, due_at, hora_at, periodo, stage, vendor_id, archived_at')
      .eq('applicant_id', applicantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    card = (data as ExpandedCard | null) ?? null;
  }

  return {
    applicant: (appRes.data as ExpandedAppModel | null) ?? {},
    pj: (pjRes.data as PjModel | null) ?? {},
    card,
  };
}

/**
 * Patch a pj_fichas row. RLS only allows non-leitor roles.
 */
export async function updatePjFicha(
  applicantId: string,
  patch: Partial<PjModel>,
): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase
    .from('pj_fichas')
    .update(patch)
    .eq('applicant_id', applicantId);
  if (error) throw new Error(error.message);
}

/**
 * Create PJ ficha atomically (applicants + pj_fichas + kanban_cards in entrada).
 */
export async function criarFichaPJ(
  input: BasicInfoPJ,
  userId: string,
): Promise<CriarFichaResult> {
  const { data, error } = await supabase.rpc('criar_ficha_pj_atomic', {
    p_user_id: userId,
    p_primary_name: input.razaoSocial.trim(),
    p_cpf_cnpj: null,
    p_phone: null,
    p_whatsapp: null,
    p_email: null,
    p_nome_fantasia: clean(input.fantasia),
  });

  if (error) throw new Error(error.message);
  const obj = data as { applicant_id: string; ficha_id: string; card_id: string };
  return {
    applicantId: obj.applicant_id,
    fichaId: obj.ficha_id,
    cardId: obj.card_id,
  };
}

/**
 * Create Rural ficha atomically (applicants + rural_fichas + kanban_cards in
 * feitas). Mirrors criarFichaPF — Rural usa CPF como a PF.
 */
export async function criarFichaRural(
  input: BasicInfoRural,
  userId: string,
): Promise<CriarFichaResult> {
  const { data, error } = await supabase.rpc('criar_ficha_rural_atomic', {
    p_user_id: userId,
    p_primary_name: input.nome.trim(),
    p_cpf_cnpj: formatCpf(input.cpf),
    p_phone: null,
    p_whatsapp: null,
    p_email: null,
    p_birth_date: null,
    p_naturalidade: null,
    p_uf_naturalidade: null,
  });

  if (error) throw new Error(error.message);
  const obj = data as { applicant_id: string; ficha_id: string; card_id: string };
  return {
    applicantId: obj.applicant_id,
    fichaId: obj.ficha_id,
    cardId: obj.card_id,
  };
}

/**
 * Read everything an Expanded Rural page needs: full applicant row (incl.
 * taxa_instalacao + via) + rural_fichas + the active kanban card.
 * Mirrors fetchExpandedPF.
 */
export async function fetchExpandedRural(
  applicantId: string,
  preferCardId?: string | null,
): Promise<{
  applicant: ExpandedAppModel;
  rural: RuralModel;
  card: ExpandedCard | null;
}> {
  const [appRes, ruralRes] = await Promise.all([
    supabase
      .from('applicants')
      .select(
        'primary_name, cpf_cnpj, phone, whatsapp, email, ' +
          'address_line, address_number, address_complement, cep, bairro, ' +
          'plano_acesso, venc, sva_avulso, taxa_instalacao, via, carne_impresso, ' +
          'quem_solicitou, telefone_solicitante, protocolo_mk, meio, ' +
          'como_conheceu_id, ' +
          'info_spc, info_pesquisador, info_relevantes, info_mk, observacoes, ' +
          'parecer_analise, representante_mz, created_at, field_audit',
      )
      .eq('id', applicantId)
      .maybeSingle(),
    supabase
      .from('rural_fichas')
      .select('*')
      .eq('applicant_id', applicantId)
      .is('deleted_at', null)
      .maybeSingle(),
  ]);
  if (appRes.error) throw new Error(`applicants: ${appRes.error.message}`);
  if (ruralRes.error) throw new Error(`rural_fichas: ${ruralRes.error.message}`);
  if (!appRes.data) throw new Error(`Applicant ${applicantId} não encontrado`);

  let card: ExpandedCard | null = null;
  if (preferCardId) {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('id, created_at, due_at, hora_at, periodo, stage, vendor_id, archived_at')
      .eq('id', preferCardId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    card = (data as ExpandedCard | null) ?? null;
  }
  if (!card) {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('id, created_at, due_at, hora_at, periodo, stage, vendor_id, archived_at')
      .eq('applicant_id', applicantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    card = (data as ExpandedCard | null) ?? null;
  }

  return {
    applicant: (appRes.data as ExpandedAppModel | null) ?? {},
    rural: (ruralRes.data as RuralModel | null) ?? {},
    card,
  };
}

/**
 * Patch a rural_fichas row. RLS only allows non-leitor roles.
 */
export async function updateRuralFicha(
  applicantId: string,
  patch: Partial<RuralModel>,
): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase
    .from('rural_fichas')
    .update(patch)
    .eq('applicant_id', applicantId);
  if (error) throw new Error(error.message);
}
