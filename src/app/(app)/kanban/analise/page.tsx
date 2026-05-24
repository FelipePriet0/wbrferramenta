'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { KanbanAnalisePageClient } from '@/features/kanban/KanbanAnalisePageClient';

export default function KanbanAnalisePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="text-sm text-zinc-500">Carregando…</p>;
  }
  return <KanbanAnalisePageClient />;
}
