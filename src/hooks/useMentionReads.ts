'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const DB_NAME = 'mz.mention-reads';
const STORE_NAME = 'kv';
// Bumping the version forces onupgradeneeded to run, but our schema doesn't
// change between versions — we still use a single keyValue store. Old payloads
// (string[] → Set<cardId>) are read alongside the new shape (Record<cardId,
// readAtIso>) for backwards compatibility so users don't lose their existing
// reads.
const DB_VERSION = 1;
const TTL_DAYS = 90;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

// Storage shape v2: per-card readAt timestamp instead of a Set. A new mention
// landing later than `readAt` re-lights the card. Old payloads ({ ids: [] })
// are migrated on load by stamping each id with a synthetic readAt = now-1s.
type ReadsMap = Record<string, string>; // cardId → readAt ISO

type Entry = {
  reads?: ReadsMap;
  ids?: string[]; // legacy v1 shape
  expiresAt: number;
};

let dbPromise: Promise<IDBDatabase | null> | null = null;
function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
  return dbPromise;
}

async function idbGet(key: string): Promise<ReadsMap | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise<ReadsMap | null>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => {
        const entry = req.result as Entry | undefined;
        if (!entry) return resolve(null);
        if (entry.expiresAt < Date.now()) return resolve(null);
        if (entry.reads) return resolve(entry.reads);
        // Legacy migration: every old id gets a readAt = (now - 1s) so any
        // mention that arrived between now and then is still treated as new.
        if (entry.ids?.length) {
          const fallback = new Date(Date.now() - 1000).toISOString();
          const migrated: ReadsMap = {};
          for (const id of entry.ids) migrated[id] = fallback;
          return resolve(migrated);
        }
        resolve({});
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet(key: string, reads: ReadsMap): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(
        { reads, expiresAt: Date.now() + TTL_MS } as Entry,
        key,
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Per-user "I've already seen this card's latest mention" tracker.
 *
 * Returns:
 *  - hasReadAt(cardId, latestMentionAt): true if the user opened the card
 *    AFTER the given mention timestamp. Compares ISO strings lexicographically
 *    (timestamps in ISO8601 sort correctly).
 *  - markRead(cardId): stamps the card with the current time.
 *  - reads: the current map (re-rendered when load completes / markRead runs).
 *
 * Storage is per-userId in IndexedDB with a 90-day TTL.
 * Per-device by design (open in another browser → still green).
 */
export function useMentionReads(userId: string | null | undefined): {
  reads: ReadsMap;
  markRead: (cardId: string) => void;
  hasReadAt: (cardId: string, latestMentionAt: string | null | undefined) => boolean;
  loaded: boolean;
} {
  const [reads, setReads] = useState<ReadsMap>({});
  const [loaded, setLoaded] = useState(false);
  const readsRef = useRef<ReadsMap>({});
  readsRef.current = reads;

  const storageKey = userId ? `mention-reads:${userId}` : null;

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    if (!storageKey) {
      setReads({});
      setLoaded(true);
      return;
    }
    (async () => {
      const stored = await idbGet(storageKey);
      if (cancelled) return;
      setReads(stored ?? {});
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const markRead = useCallback(
    (cardId: string) => {
      if (!cardId || !storageKey) return;
      const now = new Date().toISOString();
      const current = readsRef.current;
      // No-op only if we already stamped at the same exact ms (extremely
      // unlikely) — otherwise overwrite so future mentions detect "newer".
      if (current[cardId] === now) return;
      const next = { ...current, [cardId]: now };
      setReads(next);
      void idbSet(storageKey, next);
    },
    [storageKey],
  );

  const hasReadAt = useCallback(
    (cardId: string, latestMentionAt: string | null | undefined): boolean => {
      const readAt = readsRef.current[cardId];
      if (!readAt) return false;
      if (!latestMentionAt) return true; // no mention recorded, treat as read
      return readAt >= latestMentionAt;
    },
    [],
  );

  return { reads, markRead, hasReadAt, loaded };
}
