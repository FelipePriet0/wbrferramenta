import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.local.example to .env.local and fill in the values.',
  );
}

let _client: SupabaseClient | null = null;

// localStorage default: session is shared across tabs and survives reload —
// required for the "Analisar" flow that opens the expanded ficha in a new tab.
// useInactivityLogout (30 min idle) is the safety net against forgotten sessions.
export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'mz.auth.session',
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });
  return _client;
}

export const supabase = getSupabase();
