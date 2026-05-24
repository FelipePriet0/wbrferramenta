'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';

/**
 * Storage key for the "fresh login" flag.
 *
 * Set by LoginForm right after a successful signIn (still on /login, before
 * the redirect). Read once when the user lands on any authenticated page —
 * the flag is consumed (removed) on read so the confetti only ever fires
 * once per login session, on the very first landing page.
 *
 * Lives on sessionStorage so it dies with the tab (matches our auth model).
 */
export const WELCOME_CONFETTI_KEY = 'mz.welcome-confetti.pending';

const COLORS = ['#10b981', '#a786ff', '#fd8bbc', '#eca184', '#f8deb1'];

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
 */
export function WelcomeConfetti() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem(WELCOME_CONFETTI_KEY) !== '1') return;
    // Consume immediately so it never fires twice (HMR, re-renders, etc.)
    window.sessionStorage.removeItem(WELCOME_CONFETTI_KEY);

    fireSideCannonConfetti();
  }, []);

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
