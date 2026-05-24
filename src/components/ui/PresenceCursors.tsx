'use client';

import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import { PeerCursor } from './PeerCursor';
import type { PeerCursorState } from '@/hooks/useCursorSync';

interface Props {
  cursors: PeerCursorState[];
}

/**
 * Renders all peer cursors into document.body so they're never clipped
 * by modal overflow or stacking contexts.
 */
export function PresenceCursors({ cursors }: Props) {
  if (typeof document === 'undefined' || cursors.length === 0) return null;

  return createPortal(
    <AnimatePresence>
      {cursors.map((c) => (
        <PeerCursor key={c.userId} x={c.x} y={c.y} name={c.name} color={c.color} />
      ))}
    </AnimatePresence>,
    document.body,
  );
}
