'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type ChangeHandler<T extends Record<string, unknown> = Record<string, unknown>> = (
  payload: RealtimePostgresChangesPayload<T>,
) => void;

type Subscription = {
  channelName: string;
  channel: RealtimeChannel;
  refCount: number;
};

type RealtimeAPI = {
  /**
   * Subscribe to changes on a Postgres table. Multiple components can share
   * the same channelName — the provider increments a refCount and only tears
   * down the underlying channel when the last subscriber unmounts.
   *
   * Returns an unsubscribe function. Always call it in a useEffect cleanup.
   */
  subscribeTable: <T extends Record<string, unknown>>(args: {
    channelName: string;
    table: string;
    schema?: string;
    filter?: string;
    onChange: ChangeHandler<T>;
  }) => () => void;
};

const RealtimeContext = createContext<RealtimeAPI | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const subs = useRef<Map<string, Subscription>>(new Map());

  const subscribeTable = useCallback<RealtimeAPI['subscribeTable']>(
    ({ channelName, table, schema = 'public', filter, onChange }) => {
      const existing = subs.current.get(channelName);
      if (existing) {
        existing.refCount += 1;
        existing.channel.on(
          'postgres_changes' as never,
          { event: '*', schema, table, ...(filter ? { filter } : {}) } as never,
          onChange as never,
        );
      } else {
        const channel = supabase.channel(channelName);
        channel.on(
          'postgres_changes' as never,
          { event: '*', schema, table, ...(filter ? { filter } : {}) } as never,
          onChange as never,
        );
        channel.subscribe();
        subs.current.set(channelName, { channelName, channel, refCount: 1 });
      }

      return () => {
        const entry = subs.current.get(channelName);
        if (!entry) return;
        entry.refCount -= 1;
        if (entry.refCount <= 0) {
          supabase.removeChannel(entry.channel);
          subs.current.delete(channelName);
        }
      };
    },
    [],
  );

  // Cleanup on unmount: tear down any leftover channels.
  useEffect(() => {
    const map = subs.current;
    return () => {
      for (const { channel } of map.values()) {
        supabase.removeChannel(channel);
      }
      map.clear();
    };
  }, []);

  const value = useMemo<RealtimeAPI>(() => ({ subscribeTable }), [subscribeTable]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeAPI {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used inside <RealtimeProvider>');
  return ctx;
}

/**
 * Convenience hook: subscribe + cleanup in one call.
 * The channel only re-subscribes when channelName/table/schema/filter/enabled
 * change — NOT when the onChange handler reference changes. onChange is kept
 * in a ref so the latest version is always called without triggering a
 * close/reopen cycle on every render.
 */
export function useTableChanges<T extends Record<string, unknown>>(args: {
  channelName: string;
  table: string;
  schema?: string;
  filter?: string;
  onChange: ChangeHandler<T>;
  enabled?: boolean;
}) {
  const { subscribeTable } = useRealtime();
  const { enabled = true, channelName, table, schema, filter, onChange } = args;

  const onChangeRef = useRef<ChangeHandler<T>>(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  useEffect(() => {
    if (!enabled) return;
    const unsub = subscribeTable<T>({
      channelName,
      table,
      schema,
      filter,
      onChange: (payload) => onChangeRef.current(payload),
    });
    return unsub;
  }, [subscribeTable, enabled, channelName, table, schema, filter]);
}
