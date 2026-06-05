'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Centralized query keys for the per-applicant / per-card lookups consumed by
// EditarFichaModal and the Expanded PF/PJ pages. Keeping these in one file
// means invalidation in one place reflects across every consumer.
export const fichaKeys = {
  applicantCard: (applicantId: string, cardId: string) =>
    ['applicant-card', applicantId, cardId] as const,
  expandedPF: (applicantId: string, cardId: string | null) =>
    ['expanded-pf', applicantId, cardId ?? 'auto'] as const,
  expandedPJ: (applicantId: string, cardId: string | null) =>
    ['expanded-pj', applicantId, cardId ?? 'auto'] as const,
  expandedRural: (applicantId: string, cardId: string | null) =>
    ['expanded-rural', applicantId, cardId ?? 'auto'] as const,
  profiles: () => ['profiles'] as const,
  comoConheceuOptions: () => ['como-conheceu-options'] as const,
  cardAttachments: (cardId: string) => ['card-attachments', cardId] as const,
  cardPareceres: (cardId: string) => ['card-pareceres', cardId] as const,
};

/**
 * Helpers to mutate the cache directly when the autosave layer or realtime
 * stream wants to reflect a fresh patch without a refetch. Generic enough that
 * the three editing surfaces (modal, expanded PF, expanded PJ) share it.
 */
export function useFichaCache() {
  const queryClient = useQueryClient();

  const patchApplicantCard = useCallback(
    (applicantId: string, cardId: string, patch: Record<string, unknown>) => {
      queryClient.setQueryData<{
        applicant?: Record<string, unknown>;
        card?: Record<string, unknown>;
      }>(fichaKeys.applicantCard(applicantId, cardId), (old) => {
        if (!old) return old;
        return { ...old, applicant: { ...old.applicant, ...patch } };
      });
    },
    [queryClient],
  );

  const patchCard = useCallback(
    (applicantId: string, cardId: string, patch: Record<string, unknown>) => {
      queryClient.setQueryData<{
        applicant?: Record<string, unknown>;
        card?: Record<string, unknown>;
      }>(fichaKeys.applicantCard(applicantId, cardId), (old) => {
        if (!old) return old;
        return { ...old, card: { ...old.card, ...patch } };
      });
    },
    [queryClient],
  );

  const invalidateCard = useCallback(
    (cardId: string) => {
      void queryClient.invalidateQueries({
        queryKey: fichaKeys.cardPareceres(cardId),
      });
      void queryClient.invalidateQueries({
        queryKey: fichaKeys.cardAttachments(cardId),
      });
    },
    [queryClient],
  );

  // Invalidate the EditarFichaModal cache for a given cardId without needing
  // the applicantId at the call site. Matches all ['applicant-card', *, cardId]
  // entries — typically just one. Used by the kanban realtime hook so the modal
  // reads fresh data after a stage move (e.g. assignee_id cleared on Recebidos).
  const invalidateApplicantCardByCardId = useCallback(
    (cardId: string) => {
      void queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'applicant-card' &&
          q.queryKey[2] === cardId,
      });
    },
    [queryClient],
  );

  return {
    queryClient,
    patchApplicantCard,
    patchCard,
    invalidateCard,
    invalidateApplicantCardByCardId,
  };
}
