'use client';

import { cn } from '@/lib/utils';
import type { KanbanDecisionStatus } from '@/lib/types';

/**
 * Placeholder string the legacy composer inserts when the user picks a
 * decision but hasn't typed any text yet. Kept here so PareceresList and
 * the composer agree on what counts as "empty body".
 */
export function decisionPlaceholder(
  decision: KanbanDecisionStatus | string | null | undefined,
): string {
  return decision ? `[decision:${decision}]` : '';
}

export const DECISION_META: Record<
  KanbanDecisionStatus,
  { label: string; className: string }
> = {
  aprovado: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-700' },
  negado: { label: 'Negado', className: 'bg-red-100 text-red-700' },
  reanalise: { label: 'Reanálise', className: 'bg-amber-100 text-amber-800' },
};

export function DecisionTag({
  decision,
  className,
}: {
  decision?: KanbanDecisionStatus | null;
  className?: string;
}) {
  if (!decision) return null;
  const meta = DECISION_META[decision];
  if (!meta) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
