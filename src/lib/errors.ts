import * as Sentry from '@sentry/nextjs';

// Backend error codes raised by RPCs (RAISE EXCEPTION 'foo') surface in the
// frontend as `Error.message === 'foo'`. The DB labels are not user-facing,
// so this map turns them into Portuguese sentences before they reach an
// alert/toast/inline message.
const FRIENDLY: Record<string, string> = {
  not_allowed: 'Você não tem permissão para realizar esta ação.',
  reason_required: 'Informe o motivo do cancelamento.',
  revert_reason_required:
    'Explique o motivo da reversão antes de continuar — o registro é obrigatório.',
  pending_decision:
    'Para finalizar a ficha é preciso decidir primeiro (Aprovado, Negado ou Cancelada).',
  card_not_found: 'Ficha não encontrada — pode ter sido movida ou excluída.',
  invalid_stage: 'Movimento inválido para esta coluna.',
  parent_not_found: 'O parecer ao qual você está respondendo não existe mais.',
  not_author: 'Você só pode editar pareceres criados por você.',
  note_not_found: 'Parecer não encontrado.',
  applicant_not_found: 'Cadastro não encontrado.',
};

/**
 * Convert any thrown value into a human-friendly Portuguese message.
 * - Maps known backend error codes (e.g. 'not_allowed' → 'Você não tem permissão…').
 * - Falls back to `error.message` when it's not a code we recognize.
 * - Returns the supplied fallback when the error is unusable (string undefined, etc.).
 */
export function friendlyError(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (error instanceof Error) {
    const msg = error.message.trim();
    if (FRIENDLY[msg]) return FRIENDLY[msg];
    // Postgres/PostgREST sometimes prefixes errors — strip and retry.
    const stripped = msg
      .replace(/^([a-z_]+:\s*)/, '')
      .replace(/\.$/, '')
      .trim();
    if (FRIENDLY[stripped]) return FRIENDLY[stripped];
    return msg || fallback;
  }
  if (typeof error === 'string' && error) {
    return FRIENDLY[error] ?? error;
  }
  return fallback;
}

/**
 * Log an error to console and forward it to Sentry with a context tag.
 * Use this instead of bare console.error() in catch blocks so errors
 * are visible in Sentry even when they are "handled" (shown as toasts).
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
  Sentry.captureException(error, { tags: { context } });
}
