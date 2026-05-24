'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { PresencePeer } from './usePresence';

export interface PeerCursorState {
  userId: string;
  x: number; // viewport fraction 0-1
  y: number;
  name: string;
  color: string;
}

type CursorPayload = { userId: string; x: number; y: number };

const THROTTLE_MS = 32; // ~30fps

/**
 * Two-lane cursor sync:
 *  1. BroadcastChannel — same browser / different tabs: 0ms latency
 *  2. Supabase Broadcast — different computers: ~80-150ms, spring-smoothed in PeerCursor
 *
 * Peers' names and colors come from `usePresence` (single source of truth).
 */
export function useCursorSync(
  cardId: string,
  selfUserId: string | null | undefined,
  peers: PresencePeer[],
): PeerCursorState[] {
  const [peerCursors, setPeerCursors] = useState<Record<string, PeerCursorState>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const lastSendRef = useRef(0);
  const rafRef = useRef(0);

  // Build a fast lookup from peers list for name+color.
  const peersMapRef = useRef<Map<string, PresencePeer>>(new Map());
  useEffect(() => {
    peersMapRef.current = new Map(peers.map((p) => [p.userId, p]));
  }, [peers]);

  const applyPosition = useCallback((userId: string, x: number, y: number) => {
    if (userId === selfUserId) return;
    const peer = peersMapRef.current.get(userId);
    if (!peer) return; // not in presence list — ignore ghost
    setPeerCursors((prev) => ({
      ...prev,
      [userId]: { userId, x, y, name: peer.fullName, color: peer.color },
    }));
  }, [selfUserId]);

  const removeCursor = useCallback((userId: string) => {
    setPeerCursors((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  // Remove cursors for peers that left presence.
  useEffect(() => {
    const peerIds = new Set(peers.map((p) => p.userId));
    setPeerCursors((prev) => {
      const next = { ...prev };
      for (const uid of Object.keys(next)) {
        if (!peerIds.has(uid)) delete next[uid];
      }
      return next;
    });
  }, [peers]);

  // Supabase Broadcast channel.
  useEffect(() => {
    if (!cardId || !selfUserId) return;

    const ch = supabase.channel(`cursor:${cardId}`);
    ch.on('broadcast', { event: 'move' }, ({ payload }: { payload: CursorPayload }) => {
      applyPosition(payload.userId, payload.x, payload.y);
    }).subscribe();
    channelRef.current = ch;

    return () => {
      void supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [cardId, selfUserId, applyPosition]);

  // BroadcastChannel (same browser, 0ms).
  useEffect(() => {
    if (!cardId || !selfUserId) return;

    const bc = new BroadcastChannel(`mz-cursor-${cardId}`);
    bcRef.current = bc;
    bc.onmessage = (ev: MessageEvent<CursorPayload>) => {
      applyPosition(ev.data.userId, ev.data.x, ev.data.y);
    };

    return () => {
      bc.close();
      bcRef.current = null;
    };
  }, [cardId, selfUserId, applyPosition]);

  // Mouse tracker — throttled to ~30fps, sends via both lanes.
  useEffect(() => {
    if (!cardId || !selfUserId) return;

    const sendPosition = (clientX: number, clientY: number) => {
      const now = Date.now();
      if (now - lastSendRef.current < THROTTLE_MS) return;
      lastSendRef.current = now;

      const x = clientX / window.innerWidth;
      const y = clientY / window.innerHeight;
      const payload: CursorPayload = { userId: selfUserId, x, y };

      // Lane 1: same browser
      bcRef.current?.postMessage(payload);

      // Lane 2: other computers
      void channelRef.current?.send({
        type: 'broadcast',
        event: 'move',
        payload,
      });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        sendPosition(e.clientX, e.clientY);
        rafRef.current = 0;
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cardId, selfUserId]);

  return Object.values(peerCursors);
}
