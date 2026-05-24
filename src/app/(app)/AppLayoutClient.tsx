'use client';

import { Fragment, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Clock, Columns3, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Sidebar,
  SidebarBody,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarLink,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { SidebarUser } from '@/components/app/sidebar-user';
import { WelcomeConfetti } from '@/components/effects/welcome-confetti';
import { InactivityWatcher } from '@/components/app/InactivityWatcher';
import RouteBg from './RouteBg';

const PAGE_GUTTER = 6;

function AppSidebar() {
  const { open } = useSidebar();
  const pathname = usePathname() || '/';
  const links = [
    {
      label: 'Kanban',
      href: '/kanban',
      icon: <Columns3 className="h-5 w-5 flex-shrink-0 text-white" />,
    },
    {
      label: 'Histórico',
      href: '/historico',
      icon: <Clock className="h-5 w-5 flex-shrink-0 text-white" />,
    },
    {
      label: 'Docs',
      href: '/docs',
      icon: <BookOpen className="h-5 w-5 flex-shrink-0 text-white" />,
    },
    {
      label: 'Métricas',
      href: '/metricas',
      icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-white" />,
    },
  ];

  return (
    <SidebarBody className="justify-between gap-4">
      <SidebarHeader>
        {open ? (
          <div className="flex w-full items-center justify-between rounded-lg border border-transparent bg-transparent p-2">
            <div className="flex items-center gap-3">
              <div
                className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden text-white"
                style={{ borderRadius: '30%', backgroundColor: '#ffffff' }}
              >
                <Image
                  src="/wbr-logo.png"
                  alt="WBR"
                  fill
                  sizes="40px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="ml-1 leading-tight">
                <div className="text-base font-semibold text-white">WBR</div>
                <div className="text-sm text-white/80">Empresa</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center">
            <div
              className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden text-white"
              style={{ borderRadius: '30%', backgroundColor: '#ffffff' }}
            >
              <Image
                src="/wbr-logo.png"
                alt="WBR"
                fill
                sizes="36px"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      <div className="mx-2 border-t border-white/50" />

      <SidebarContent>
        <SidebarGroup>
          {open && <SidebarGroupLabel>Navegação</SidebarGroupLabel>}
          <SidebarGroupContent>
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Fragment key={link.label}>
                  <SidebarLink link={link} isActive={isActive} />
                </Fragment>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </SidebarBody>
  );
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const isDesktop = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      window.addEventListener('resize', onStoreChange);
      return () => window.removeEventListener('resize', onStoreChange);
    },
    () => (typeof window === 'undefined' ? true : window.innerWidth >= 768),
    () => true,
  );

  return (
    <RouteBg>
      <WelcomeConfetti />
      <InactivityWatcher />
      <SidebarProvider open={open} setOpen={setOpen}>
        <div
          className="h-screen min-h-screen overflow-hidden text-zinc-900 dark:text-zinc-100"
          style={{ backgroundColor: '#000000' }}
        >
          <Sidebar open={open} setOpen={setOpen}>
            <AppSidebar />
          </Sidebar>
          <div
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out md:flex-row"
            style={{
              marginLeft: isDesktop ? `${open ? 300 : 60}px` : '0px',
              paddingTop: PAGE_GUTTER,
              paddingRight: PAGE_GUTTER,
              paddingBottom: PAGE_GUTTER,
              backgroundColor: '#000000',
            }}
          >
            <main
              className="app-scroll flex w-full flex-1 flex-col gap-3 overflow-y-auto overscroll-contain rounded-3xl border border-neutral-200 bg-[var(--neutro)] p-3 text-zinc-900 shadow-xl shadow-emerald-900/15 md:min-w-0 md:p-6 dark:border-neutral-700 dark:bg-neutral-900 dark:text-zinc-100"
              style={{ height: `calc(100vh - ${PAGE_GUTTER * 2}px)` }}
            >
              <div className="relative mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <SidebarTrigger className="hidden md:inline-flex" />
                  <div id="mz-undo-redo-slot" className="flex items-center gap-1" />
                </div>
                {/* Page-level header slot: pages render extras here via Portal
                    (e.g. Expanded PF/PJ zoom controls). Absolute-centered so
                    the slot doesn't affect the row's height or push the
                    sidebar trigger. */}
                <div
                  id="mz-page-header-slot"
                  className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 [&>*]:pointer-events-auto"
                />
                {/* Presence slot: Expanded PF/PJ render collaborator badges here */}
                <div id="mz-presence-slot" className="flex items-center gap-1" />
              </div>
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </RouteBg>
  );
}

export function AppLayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppLayoutInner>{children}</AppLayoutInner>;
}
