'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface PresencePeer {
  presenceKey: string;
  userId: string;
  fullName: string;
  editingField: string | null;
  color: string;
}

type PresencePayload = {
  userId: string;
  fullName: string;
};

type FieldPayload = {
  userId: string;
  editingField: string | null;
};

// Deterministic color per userId so the same user always gets the same color.
const PALETTE = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
];
function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

/**
 * Two-lane field tracking:
 *  - Supabase Presence: who is in the ficha (join/leave only)
 *  - Supabase Broadcast 'field': which field each peer is editing
 *    (Broadcast always fires on other clients, Presence sync does not
 *     reliably trigger when an existing member calls track() again)
 *  - BroadcastChannel: same-browser tabs at 0ms
 */
export function usePresence(
  channelKey: string,
  selfUserId: string | null | undefined,
  selfName: string | null | undefined,
): {
  peers: PresencePeer[];
  trackField: (field: string | null) => void;
} {
  const [basePeers, setBasePeers] = useState<Omit<PresencePeer, 'editingField'>[]>([]);
  const [editingFields, setEditingFields] = useState<Record<string, string | null>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const selfNameRef = useRef(selfName);
  useEffect(() => { selfNameRef.current = selfName; }, [selfName]);

  // Merge base peers with real-time editingField state.
  const peers = useMemo<PresencePeer[]>(
    () => basePeers.map((p) => ({ ...p, editingField: editingFields[p.userId] ?? null })),
    [basePeers, editingFields],
  );

  const syncBasePeers = useCallback(
    (channel: RealtimeChannel) => {
      const state = channel.presenceState<PresencePayload>();
      const next: Omit<PresencePeer, 'editingField'>[] = [];
      for (const [key, presences] of Object.entries(state)) {
        const p = presences[0];
        if (!p || p.userId === selfUserId) continue;
        next.push({
          presenceKey: key,
          userId: p.userId,
          fullName: p.fullName || 'Colaborador',
          color: colorForUser(p.userId),
        });
      }
      setBasePeers(next);
    },
    [selfUserId],
  );

  const applyFieldUpdate = useCallback(
    (userId: string, editingField: string | null) => {
      if (userId === selfUserId) return;
      setEditingFields((prev) => ({ ...prev, [userId]: editingField }));
    },
    [selfUserId],
  );

  // Clean up editingFields when a peer leaves.
  useEffect(() => {
    const peerIds = new Set(basePeers.map((p) => p.userId));
    setEditingFields((prev) => {
      const next = { ...prev };
      for (const uid of Object.keys(next)) {
        if (!peerIds.has(uid)) delete next[uid];
      }
      return next;
    });
  }, [basePeers]);

  useEffect(() => {
    if (!channelKey || !selfUserId) return;

    // BroadcastChannel for same-browser field updates (0ms).
    const bc = new BroadcastChannel(`mz-field-${channelKey}`);
    bcRef.current = bc;
    bc.onmessage = (ev: MessageEvent<FieldPayload>) => {
      applyFieldUpdate(ev.data.userId, ev.data.editingField);
    };

    const channel = supabase.channel(channelKey, {
      config: { presence: { key: selfUserId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => syncBasePeers(channel))
      .on('presence', { event: 'join' }, () => syncBasePeers(channel))
      .on('presence', { event: 'leave' }, () => syncBasePeers(channel))
      // Broadcast lane for field focus/blur — fires reliably on all other clients.
      .on('broadcast', { event: 'field' }, ({ payload }: { payload: FieldPayload }) => {
        applyFieldUpdate(payload.userId, payload.editingField);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId: selfUserId, fullName: selfNameRef.current ?? 'Eu' } satisfies PresencePayload);
        }
      });

    channelRef.current = channel;

    return () => {
      bc.close();
      bcRef.current = null;
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [channelKey, selfUserId, syncBasePeers, applyFieldUpdate]);

  // Re-track quando o nome carrega — sem recriar o canal.
  useEffect(() => {
    const ch = channelRef.current;
    if (!ch || !selfUserId || !selfName) return;
    void ch.track({ userId: selfUserId, fullName: selfName } satisfies PresencePayload);
  }, [selfName, selfUserId]);

  const trackField = useCallback(
    (field: string | null) => {
      const ch = channelRef.current;
      if (!selfUserId) return;
      const payload: FieldPayload = { userId: selfUserId, editingField: field };
      // Lane 1: same browser (0ms).
      bcRef.current?.postMessage(payload);
      // Lane 2: other computers via Broadcast.
      if (ch) {
        void ch.send({ type: 'broadcast', event: 'field', payload });
      }
    },
    [selfUserId],
  );

  return { peers, trackField };
}
