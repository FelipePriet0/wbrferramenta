'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { getInitials } from '@/lib/utils';

export const SidebarUser = () => {
  const router = useRouter();
  const { open: sidebarOpen } = useSidebar();
  const { user, profile, signOut, loading } = useAuth();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const displayName = useMemo(
    () => profile?.full_name || user?.email || 'Usuário',
    [profile?.full_name, user?.email],
  );
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  async function logout() {
    setOpen(false);
    await signOut();
    router.replace('/login');
  }

  // Close dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node | null;
      const insideTrigger =
        containerRef.current && target && containerRef.current.contains(target);
      const insideMenu =
        menuRef.current && target && menuRef.current.contains(target);
      if (!insideTrigger && !insideMenu) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Compute portal menu position aligned to the user button.
  useEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const mh = menuRef.current?.offsetHeight ?? 0;
      const mw = menuRef.current?.offsetWidth ?? 220;
      let left = rect.right + 8;
      let top = rect.bottom - mh;
      const minTop = 8;
      const maxTop = Math.max(minTop, (window.innerHeight || 0) - mh - 8);
      top = Math.max(minTop, Math.min(top, maxTop));
      const viewportW = window.innerWidth || 0;
      if (left + mw > viewportW - 8) {
        left = Math.max(8, rect.left - mw - 8);
      }
      setMenuPos({ top, left });
    };

    const r0 = el.getBoundingClientRect();
    setMenuPos({ top: r0.top, left: r0.right + 8 });

    const raf = requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [open]);

  return (
    <div
      className="relative flex items-center justify-center"
      ref={containerRef}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={[
          'flex items-center rounded-lg transition-colors hover:bg-white/20',
          sidebarOpen ? 'w-full gap-3 p-2' : 'p-2',
        ].join(' ')}
      >
        <div
          className={[
            sidebarOpen ? 'h-10 w-10' : 'h-9 w-9',
            'flex flex-shrink-0 items-center justify-center overflow-hidden bg-white/30',
          ].join(' ')}
          style={{ borderRadius: '30%' }}
        >
          <span className="text-[11px] font-semibold text-white">
            {initials}
          </span>
        </div>
        {sidebarOpen && (
          <>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="truncate text-sm font-medium text-white">
                {loading ? 'Carregando…' : displayName}
              </span>
            </div>
            <div className="ml-auto text-white/80">
              {open ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </div>
          </>
        )}
      </button>

      {open && typeof window !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label="Opções do usuário"
              className="z-[9999] w-fit min-w-[220px] max-w-[360px] overflow-hidden rounded-md border border-black/10 bg-white text-zinc-900 shadow-lg"
              style={{ position: 'fixed', top: menuPos.top, left: menuPos.left }}
            >
              <div className="border-b border-zinc-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center overflow-hidden bg-zinc-200"
                    style={{ borderRadius: '30%' }}
                  >
                    <span className="text-[10px] font-semibold text-zinc-700">
                      {initials}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      {loading ? 'Carregando…' : displayName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-2">
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da conta
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
