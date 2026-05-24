import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types';

export interface ProfileLite {
  id: string;
  full_name: string | null;
  role: UserRole;
}

/**
 * List profiles, optionally restricted to specific roles.
 *
 * Used by the Responsável filter (with roles vendedor/analista/gestor)
 * and by mention dropdowns (no role restriction).
 */
export async function listProfiles(opts: { roles?: UserRole[] } = {}): Promise<
  ProfileLite[]
> {
  let q = supabase
    .from('profiles')
    .select('id, full_name, role')
    .order('full_name');
  if (opts.roles && opts.roles.length > 0) {
    q = q.in('role', opts.roles);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as ProfileLite[]) ?? [];
}

/**
 * Update the current user's own profile (full_name).
 *
 * RLS only allows updating `id = auth.uid()`.
 */
export async function updateMyProfile(patch: {
  full_name?: string;
}): Promise<Profile> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error('not_authenticated');
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', uid)
    .select('id, full_name, role')
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}
