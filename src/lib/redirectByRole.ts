import type { UserRole } from '@/lib/types';

/**
 * After login, where each role lands.
 *
 * vendedor / leitor   → /kanban           (commercial board)
 * analista / gestor   → /kanban/analise   (analysis board)
 * instalador          → /kanban/analise   (shares analyst's screens)
 */
export function homeForRole(role: UserRole | null): string {
  if (!role) return '/login';
  if (role === 'vendedor' || role === 'leitor') return '/kanban';
  return '/kanban/analise';
}
