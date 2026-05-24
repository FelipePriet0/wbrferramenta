'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

// Total idle window before the user is signed out. Throttling + the warning
// popup are tuned so the user never gets logged out without being asked.
const DEFAULT_TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4h
const DEFAULT_WARNING_MS = 5 * 60 * 1000;       // shows the warning 5 min before
const RESET_THROTTLE_MS = 30 * 1000;
const EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'] as const;

type InactivityState = {
  /** True while the warning modal should be open. */
  warning: boolean;
  /** Seconds left until the auto-logout fires. */
  secondsLeft: number;
  /** Called when the user clicks "Continuar sessão". */
  extend: () => void;
  /** Called when the user clicks "Sair agora". */
  logoutNow: () => void;
};

/**
 * Inactivity-aware logout with a warning popup. The bug that motivated this
 * rewrite (commit 910e361 in the legacy repo) was a tight coupling to
 * `onAuthStateChange` — random sign-outs in the middle of work. We never
 * listen to auth events here; activity events drive the timer directly.
 */
export function useInactivityLogout(
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  warningMs: number = DEFAULT_WARNING_MS,
): InactivityState {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiresAtRef = useRef<number>(0);
  const lastResetRef = useRef<number>(0);

  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const fire = useCallback(async () => {
    setWarning(false);
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    try {
      await signOut({ local: true });
    } finally {
      router.replace('/login?from=expired');
    }
  }, [router, signOut]);

  const arm = useCallback(
    (forceNow = false) => {
      // forceNow bypasses the throttle so explicit "extend" works instantly.
      if (!forceNow) {
        const now = Date.now();
        if (now - lastResetRef.current < RESET_THROTTLE_MS) return;
        lastResetRef.current = now;
      } else {
        lastResetRef.current = Date.now();
      }

      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (fireTimerRef.current) clearTimeout(fireTimerRef.current);
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
      setWarning(false);
      expiresAtRef.current = Date.now() + timeoutMs;

      // Warning timer: opens the modal `warningMs` before expiration.
      const warnDelay = Math.max(0, timeoutMs - warningMs);
      warnTimerRef.current = setTimeout(() => {
        setWarning(true);
        setSecondsLeft(Math.ceil(warningMs / 1000));
        tickTimerRef.current = setInterval(() => {
          const remaining = Math.max(
            0,
            Math.ceil((expiresAtRef.current - Date.now()) / 1000),
          );
          setSecondsLeft(remaining);
        }, 1000);
      }, warnDelay);

      // Hard logout timer.
      fireTimerRef.current = setTimeout(() => {
        void fire();
      }, timeoutMs);
    },
    [timeoutMs, warningMs, fire],
  );

  const extend = useCallback(() => arm(true), [arm]);
  const logoutNow = useCallback(() => void fire(), [fire]);

  useEffect(() => {
    if (!user) return;

    // First arm + listener wiring.
    arm(true);
    const resetThrottled = () => arm(false);
    for (const ev of EVENTS) {
      window.addEventListener(ev, resetThrottled, { passive: true });
    }

    return () => {
      for (const ev of EVENTS) {
        window.removeEventListener(ev, resetThrottled);
      }
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (fireTimerRef.current) clearTimeout(fireTimerRef.current);
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    };
  }, [user?.id, arm]);

  return { warning, secondsLeft, extend, logoutNow };
}
