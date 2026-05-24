import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/lib/types';

const BUCKET = 'card-attachments';

export const ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export const ATTACHMENT_ALLOWED_TYPES: string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed',
  'application/vnd.rar',
];

export interface CardAttachment {
  id: string;
  card_id: string;
  applicant_id: string;
  note_id: string;
  author_id: string | null;
  author_name: string | null;
  author_role: UserRole | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  file_extension: string | null;
  created_at: string;
}

function randomSegment(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function extOf(name: string): string | null {
  const dot = name.lastIndexOf('.');
  if (dot < 0 || dot === name.length - 1) return null;
  return name.slice(dot + 1).toLowerCase();
}

export function validateAttachment(file: File): { ok: true } | { ok: false; reason: string } {
  if (file.size > ATTACHMENT_MAX_SIZE) {
    return { ok: false, reason: `Arquivo "${file.name}" passa de 10 MB.` };
  }
  if (file.type && !ATTACHMENT_ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, reason: `Tipo "${file.type}" não permitido.` };
  }
  return { ok: true };
}

/**
 * Upload one attachment, atomically.
 *
 * Sequence: validate → storage.upload → INSERT card_attachments.
 * If the INSERT fails, the Storage object is removed so we never leak orphans.
 *
 * Path convention: `<cardId>/<noteId>/<uuid>-<filename>` — the first segment
 * is enforced by the bucket's INSERT RLS (must match a kanban_cards.id).
 */
export async function uploadAttachment(
  cardId: string,
  noteId: string,
  applicantId: string,
  file: File,
): Promise<CardAttachment> {
  const check = validateAttachment(file);
  if (!check.ok) throw new Error(check.reason);

  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `${cardId}/${noteId}/${randomSegment()}-${safeName}`;

  const up = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (up.error) throw new Error(up.error.message);

  const insert = await supabase
    .from('card_attachments')
    .insert({
      card_id: cardId,
      applicant_id: applicantId,
      note_id: noteId,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      file_type: file.type || null,
      file_extension: extOf(file.name),
    })
    .select('*')
    .single();

  if (insert.error) {
    // Rollback the stored object so we don't leak.
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
    throw new Error(insert.error.message);
  }
  return insert.data as CardAttachment;
}

/**
 * Bucket is private — produce a signed URL with a 1 h TTL.
 */
export async function getSignedUrl(path: string, ttlSeconds = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, ttlSeconds);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

/**
 * Compat alias used by the legacy UI: accept either a path string or a
 * full CardAttachment row.
 */
export function getAttachmentUrl(
  arg: string | CardAttachment,
  ttlSeconds = 3600,
): Promise<string> {
  return getSignedUrl(typeof arg === 'string' ? arg : arg.file_path, ttlSeconds);
}

/**
 * Compat batch upload — accepts the legacy shape `{ cardId, noteId, files: [{file}] }`.
 *
 * The legacy UI didn't need `applicantId` because the column is denormalised
 * on `card_attachments`; we resolve it from the card row instead so callers
 * can keep their existing payload shape.
 */
export async function uploadAttachmentBatch(args: {
  cardId: string;
  noteId: string;
  applicantId?: string;
  files: ({ file: File } | File)[];
  onError?: (file: File, error: Error) => void;
}): Promise<CardAttachment[]> {
  const { cardId, noteId, files, onError } = args;
  let applicantId = args.applicantId;
  if (!applicantId) {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('applicant_id')
      .eq('id', cardId)
      .single();
    if (error) throw new Error(error.message);
    applicantId = (data as { applicant_id: string }).applicant_id;
  }
  const out: CardAttachment[] = [];
  for (const wrap of files) {
    const file = wrap instanceof File ? wrap : wrap.file;
    try {
      out.push(await uploadAttachment(cardId, noteId, applicantId, file));
    } catch (e) {
      onError?.(file, e instanceof Error ? e : new Error(String(e)));
    }
  }
  return out;
}

/**
 * Remove storage object + metadata row.
 *
 * Accepts either the full row (preferred — single DELETE + single remove)
 * or just an id (legacy API — looks up the path first). RLS only allows
 * author / gestor / instalador.
 */
export async function removeAttachment(
  arg: CardAttachment | string,
): Promise<void> {
  let attachment: CardAttachment | null = null;
  if (typeof arg === 'string') {
    const { data, error } = await supabase
      .from('card_attachments')
      .select('*')
      .eq('id', arg)
      .single();
    if (error) throw new Error(error.message);
    attachment = data as CardAttachment;
  } else {
    attachment = arg;
  }
  const del = await supabase
    .from('card_attachments')
    .delete()
    .eq('id', attachment.id);
  if (del.error) throw new Error(del.error.message);
  await supabase.storage.from(BUCKET).remove([attachment.file_path]).catch(() => {});
}

/**
 * Fetch all attachments for a given card, grouped by note_id by the caller.
 */
export async function listForCard(cardId: string): Promise<CardAttachment[]> {
  const { data, error } = await supabase
    .from('card_attachments')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as CardAttachment[]) ?? [];
}
