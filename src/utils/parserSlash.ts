/**
 * Slash-command / @-mention parsing for the parecer composer.
 *
 * The composer detects these patterns at the *end* of the text up to the
 * caret. Two of the four slash commands (/aprovado, /negado, /reanalise)
 * also drive a decision; /anexo opens the file picker.
 */

import type { KanbanDecisionStatus } from '@/lib/types';
import type { ParecerMention } from '@/services/parecer';

export type SlashCommand = 'aprovado' | 'negado' | 'reanalise' | 'anexo';

export const SLASH_COMMANDS: { key: SlashCommand; label: string }[] = [
  { key: 'aprovado', label: 'Aprovado' },
  { key: 'negado', label: 'Negado' },
  { key: 'reanalise', label: 'Reanálise' },
  { key: 'anexo', label: 'Anexo' },
];

export function slashToDecision(
  cmd: SlashCommand,
): KanbanDecisionStatus | null {
  if (cmd === 'aprovado' || cmd === 'negado' || cmd === 'reanalise') return cmd;
  return null;
}

/**
 * Detect a slash command (or its partial query) right before the caret.
 *
 * "great work /apro" → { query: "apro", start: 11, end: 15 }
 * "ok" → null
 * Returns null if the slash is not preceded by whitespace/start-of-text
 * (so URLs and paths don't trigger it).
 */
export function parseSlashAtCaret(
  text: string,
  caret: number,
): { query: string; start: number; end: number } | null {
  const upto = text.slice(0, caret);
  const m = /(^|\s)\/([\p{L}\p{N}]*)$/u.exec(upto);
  if (!m) return null;
  const start = upto.length - m[2].length - 1; // include the "/"
  return { query: m[2].toLowerCase(), start, end: caret };
}

/**
 * Detect an @-mention query right before the caret.
 *
 * "ping @joa" → { query: "joa", start: 5, end: 9 }
 * Returns null when the @ is not preceded by whitespace/start.
 */
export function parseMentionAtCaret(
  text: string,
  caret: number,
): { query: string; start: number; end: number } | null {
  const upto = text.slice(0, caret);
  const m = /(^|\s)@([\p{L}\p{N}_-]*)$/u.exec(upto);
  if (!m) return null;
  const start = upto.length - m[2].length - 1; // include the "@"
  return { query: m[2].toLowerCase(), start, end: caret };
}

/**
 * Extract all @-mentions present in the final text.
 *
 * Used at submit time to build the `mentions` array for the parecer. We
 * match against a provided list of profiles to resolve `id` from the name.
 * Multi-word names are joined by NBSP ( ) so a literal space doesn't
 * accidentally break the token boundary.
 */
export function extractMentions(
  text: string,
  profiles: { id: string; full_name: string | null }[],
): ParecerMention[] {
  if (!text) return [];
  // Match @<name> where the name may include NBSP-separated words.
  const regex = /@([^\s@]+(?: [^\s@]+)*)/g;
  const out: ParecerMention[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const label = match[1].replace(/ /g, ' ');
    const profile = profiles.find(
      (p) => (p.full_name ?? '').toLowerCase() === label.toLowerCase(),
    );
    if (!profile) continue;
    if (seen.has(profile.id)) continue;
    seen.add(profile.id);
    out.push({ id: profile.id, label });
  }
  return out;
}
