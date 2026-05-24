import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-200 text-blue-800",
  "bg-green-200 text-green-800",
  "bg-amber-200 text-amber-800",
  "bg-rose-200 text-rose-800",
  "bg-violet-200 text-violet-800",
  "bg-teal-200 text-teal-800",
  "bg-orange-200 text-orange-800",
  "bg-cyan-200 text-cyan-800",
];

export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Lowercase + strip diacritics so substring matches behave like users
 * expect: `joa` matches `João`, `goncalves` matches `Gonçalves`.
 *
 * Used by mention search, slash command filter, and anywhere else where
 * we compare a user-typed query against a stored Portuguese name.
 */
export function pasteNormalizeSpaces(e: {
  clipboardData: DataTransfer;
  preventDefault: () => void;
}) {
  const text = e.clipboardData.getData('text');
  if (!/[^\S\r\n]{2,}/.test(text)) return;
  e.preventDefault();
  // execCommand is deprecated but remains the most reliable cross-browser way
  // to insert text at cursor position while preserving the undo stack.
  document.execCommand('insertText', false, text.replace(/[^\S\r\n]{2,}/g, ' '));
}

export function normalizeForSearch(text: string | null | undefined): string {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

