'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const DB_NAME = 'mz.drafts';
const STORE_NAME = 'kv';
const DB_VERSION = 1;
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

type Entry<T> = {
  value: T;
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

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise<T | null>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => {
        const entry = req.result as Entry<T> | undefined;
        if (!entry) return resolve(null);
        if (entry.expiresAt < Date.now()) return resolve(null);
        resolve(entry.value);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet<T>(key: string, value: T, ttlMs: number): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(
        { value, expiresAt: Date.now() + ttlMs } as Entry<T>,
        key,
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * IndexedDB-backed draft state with TTL.
 *
 * Returns [value, setValue, clear, loaded].
 *  - value: current draft (defaults to `initialValue` until IDB load resolves).
 *  - setValue: persists immediately with the configured TTL.
 *  - clear: deletes the entry (use after a successful submit).
 *  - loaded: true once we know what was on disk (use to avoid showing the
 *    initial value before hydration).
 */
export function useIndexedDraft<T>(
  key: string,
  initialValue: T,
  ttlMs: number = DEFAULT_TTL_MS,
): [T, (next: T) => void, () => void, boolean] {
  const [value, setValueState] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      const stored = await idbGet<T>(key);
      if (cancelled) return;
      if (stored !== null) setValueState(stored);
      else setValueState(initialValue);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // initialValue intentionally not in deps — we want re-hydration only when key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);
      void idbSet(keyRef.current, next, ttlMs);
    },
    [ttlMs],
  );

  const clear = useCallback(() => {
    void idbDelete(keyRef.current);
    setValueState(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  return [value, setValue, clear, loaded];
}
