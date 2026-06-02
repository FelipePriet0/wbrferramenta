'use client';

import { useEffect, useRef } from 'react';

// Cross-tab message bus for ficha edits. When one tab (Modal or Expanded PF/PJ)
// writes a field, we broadcast the patch so other open tabs on the same
// applicant/card update their local state instantly — without waiting for
// Supabase's UPDATE round-trip plus realtime fan-out.
//
// This complements the realtime subscription, it does not replace it: realtime
// is the source of truth across devices and other users; BroadcastChannel is
// purely a same-browser shortcut so the user never sees their own edit appear
// "delayed" in a parallel tab.

export type FichaScope = 'app' | 'pf' | 'pj' | 'rural' | 'card';

export type FichaSyncMessage = {
  scope: FichaScope;
  // Either the applicant id (for app/pf/pj) or the card id (for card).
  id: string;
  patch: Record<string, unknown>;
  // Used to ignore echoes of the message we ourselves sent.
  origin: string;
};

const CHANNEL_NAME = 'mz-ficha-sync';

function getOriginId(): string {
  // Stable per-tab id so we can ignore our own broadcasts. crypto.randomUUID
  // exists in every modern browser the app targets.
  const w = globalThis as { __mzFichaOrigin?: string };
  if (!w.__mzFichaOrigin) w.__mzFichaOrigin = crypto.randomUUID();
  return w.__mzFichaOrigin;
}

let _channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!_channel) _channel = new BroadcastChannel(CHANNEL_NAME);
  return _channel;
}

/**
 * Broadcast a local patch so other tabs viewing the same record see it
 * immediately. Caller is still responsible for persisting to Supabase via
 * the normal autosave path.
 */
export function broadcastFichaPatch(
  scope: FichaScope,
  id: string,
  patch: Record<string, unknown>,
) {
  if (!id || Object.keys(patch).length === 0) return;
  const ch = getChannel();
  if (!ch) return;
  ch.postMessage({
    scope,
    id,
    patch,
    origin: getOriginId(),
  } satisfies FichaSyncMessage);
}

/**
 * Subscribe to patches for a given scope+id, ignoring echoes from this tab.
 * Caller updates its local state in `onPatch` — typically merging the patch
 * into the React state for the affected fields.
 */
export function useFichaSync(
  scope: FichaScope,
  id: string,
  onPatch: (patch: Record<string, unknown>) => void,
) {
  const onPatchRef = useRef(onPatch);
  onPatchRef.current = onPatch;

  useEffect(() => {
    if (!id) return;
    const ch = getChannel();
    if (!ch) return;
    const myOrigin = getOriginId();
    const handler = (ev: MessageEvent<FichaSyncMessage>) => {
      const msg = ev.data;
      if (!msg) return;
      if (msg.origin === myOrigin) return;
      if (msg.scope !== scope || msg.id !== id) return;
      onPatchRef.current(msg.patch);
    };
    ch.addEventListener('message', handler);
    return () => {
      ch.removeEventListener('message', handler);
    };
  }, [scope, id]);
}
