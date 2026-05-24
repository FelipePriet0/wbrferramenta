'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { homeForRole } from '@/lib/redirectByRole';

export default function RootPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (role) {
      router.replace(homeForRole(role));
    }
  }, [loading, user, role, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50">
      <p className="text-sm text-zinc-500">Carregando…</p>
    </div>
  );
}
