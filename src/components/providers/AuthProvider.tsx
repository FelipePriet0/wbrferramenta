'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types';

type AuthState = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: (opts?: { local?: boolean }) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('[auth] fetchProfile error', error);
    return null;
  }
  return (data as Profile) ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Track latest user id without retriggering listeners.
  const lastUserIdRef = useRef<string | null>(null);

  const loadProfile = useCallback(async (uid: string | null) => {
    if (!uid) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(uid);
    setProfile(p);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const s = data.session ?? null;
        setSession(s);
        lastUserIdRef.current = s?.user.id ?? null;
        await loadProfile(s?.user.id ?? null);
      } catch {
        // Supabase unreachable (e.g. no backend yet) — render unauthenticated
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      const nextId = s?.user.id ?? null;
      if (nextId !== lastUserIdRef.current) {
        lastUserIdRef.current = nextId;
        void loadProfile(nextId);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback<AuthState['signIn']>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  }, []);

  const signOut = useCallback<AuthState['signOut']>(async (opts) => {
    await supabase.auth.signOut(opts?.local ? { scope: 'local' } : undefined);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user.id ?? null);
  }, [loadProfile, session?.user.id]);

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role: profile?.role ?? null,
      loading,
      signIn,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
