'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePresence, type PresencePeer } from '@/hooks/usePresence';
import { useCursorSync, type PeerCursorState } from '@/hooks/useCursorSync';

type PresenceCtx = {
  peers: PresencePeer[];
  peerCursors: PeerCursorState[];
  trackField: (field: string | null) => void;
  getFieldPeers: (fieldId: string) => PresencePeer[];
};

const Ctx = createContext<PresenceCtx | null>(null);

export function PresenceProvider({
  cardId,
  userId,
  userName,
  children,
}: {
  cardId: string;
  userId: string | null | undefined;
  userName: string | null | undefined;
  children: React.ReactNode;
}) {
  const { peers, trackField } = usePresence(
    cardId ? `ficha:${cardId}` : '',
    userId,
    userName,
  );

  const peerCursors = useCursorSync(cardId, userId, peers);

  const getFieldPeers = useCallback(
    (fieldId: string) => peers.filter((p) => p.editingField === fieldId),
    [peers],
  );

  const value = useMemo<PresenceCtx>(
    () => ({ peers, peerCursors, trackField, getFieldPeers }),
    [peers, peerCursors, trackField, getFieldPeers],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Returns null when rendered outside a PresenceProvider — fields degrade gracefully. */
export function usePresenceContext() {
  return useContext(Ctx);
}
