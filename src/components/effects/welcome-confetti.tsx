'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';

/**
 * Module-level flag — set by LoginForm immediately after signIn succeeds,
 * cleared on first read by WelcomeConfetti. Faster and more reliable than
 * sessionStorage: no I/O, no timing race with Next.js App Router navigation.
 *
 * We keep WELCOME_CONFETTI_KEY exported so LoginForm's import doesn't break.
 */
export const WELCOME_CONFETTI_KEY = 'wbr.welcome-confetti.pending'; // kept for compat

let _welcomePending = false;

export function markWelcomeConfettiPending() {
  _welcomePending = true;
  // Fallback to sessionStorage so a hard-navigate (rare) still works
  try { window.sessionStorage.setItem(WELCOME_CONFETTI_KEY, '1'); } catch { /* noop */ }
}

const COLORS = ['#0B42C6', '#FF6600', '#a786ff', '#fd8bbc', '#f8deb1'];

/**
 * Side-cannon confetti animation (3s, two cannons firing from the left and
 * right edges). Safe to call from any client component.
 */
export function fireSideCannonConfetti(durationMs = 3000) {
  if (typeof window === 'undefined') return;
  const end = Date.now() + durationMs;

  const frame = () => {
    if (Date.now() > end) return;
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: COLORS,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: COLORS,
    });
    requestAnimationFrame(frame);
  };

  frame();
}

/**
 * Mount once inside the authenticated shell. If a "fresh login" flag is set,
 * fires the side-cannon confetti effect (3s).
 *
 * Uses `pathname` as dependency so it re-checks on every client-side navigation
 * within the (app) layout — this covers the race where the layout was already
 * mounted before the sessionStorage key was written (Next.js App Router keeps
 * the layout instance alive across navigations within the same segment group).
 */
export function WelcomeConfetti() {
  const pathname = usePathname();

  useEffect(() => {
    // Check in-memory flag first (fast path — same JS context)
    if (_welcomePending) {
      _welcomePending = false;
      try { window.sessionStorage.removeItem(WELCOME_CONFETTI_KEY); } catch { /* noop */ }
      fireSideCannonConfetti();
      return;
    }
    // Fallback: sessionStorage (hard-navigate / page reload edge case)
    try {
      if (window.sessionStorage.getItem(WELCOME_CONFETTI_KEY) === '1') {
        window.sessionStorage.removeItem(WELCOME_CONFETTI_KEY);
        fireSideCannonConfetti();
      }
    } catch { /* noop */ }
  }, [pathname]);

  return null;
}

/**
 * Mount inside the Expanded ficha page. Fires the side-cannon confetti once
 * if the URL has ?welcome=1 (set by BasicInfoModal when it opens the freshly
 * created ficha in a new tab). The flag is consumed from the URL so a reload
 * doesn't re-trigger it.
 */
export function FreshFichaConfetti() {
  const search = useSearchParams();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (search?.get('welcome') !== '1') return;
    // Strip the flag from the URL so reloads don't re-fire.
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('welcome');
      window.history.replaceState({}, '', url.toString());
    } catch {
      /* URL cleanup is best-effort */
    }
    fireSideCannonConfetti();
  }, [search]);

  return null;
}
