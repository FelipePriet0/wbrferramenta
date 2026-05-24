'use client';

import { Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/components/ui/file-upload';
import { cn } from '@/lib/utils';
import type { CardAttachment } from '@/services/attachments';

/**
 * One row in the list. Two flavours:
 *  - `pending`: file the user just dropped/pasted/picked, not yet uploaded.
 *  - `saved`:   already persisted as a card_attachments row.
 *
 * The flavour drives the metadata source (File vs row) and whether clicking
 * the name opens the file (saved only — via signed URL).
 */
export type AnexoItem =
  | { kind: 'pending'; id: string; file: File }
  | { kind: 'saved'; id: string; att: CardAttachment; onOpen?: () => void };

const IMAGE_EXTS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'heic',
  'heif',
  'bmp',
  'svg',
]);

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  if (i < 0) return '';
  return name.slice(i + 1).toLowerCase();
}

/**
 * Pick an emoji-icon for the file based on MIME type + extension. Falls back
 * to a generic file glyph. (Kept inline so we don't pull lucide for every
 * file type — most are rendered as ASCII for visual lightness.)
 */
function iconGlyph(type: string, ext: string): string {
  if (type.startsWith('image/') || IMAGE_EXTS.has(ext)) return '🖼';
  if (type === 'application/pdf' || ext === 'pdf') return '📕';
  if (type.includes('word') || ext === 'doc' || ext === 'docx') return '📄';
  if (
    type.includes('excel') ||
    type.includes('spreadsheet') ||
    ext === 'xls' ||
    ext === 'xlsx'
  )
    return '📊';
  if (
    type.includes('zip') ||
    type.includes('rar') ||
    ext === 'zip' ||
    ext === 'rar'
  )
    return '🗜';
  if (type.startsWith('audio/')) return '🎵';
  if (type.startsWith('video/')) return '🎞';
  return '📎';
}

function readMeta(item: AnexoItem): {
  name: string;
  size: number | null;
  type: string;
  ext: string;
  onClick?: () => void;
} {
  if (item.kind === 'pending') {
    return {
      name: item.file.name,
      size: item.file.size,
      type: item.file.type || '',
      ext: extOf(item.file.name),
      onClick: undefined,
    };
  }
  return {
    name: item.att.file_name,
    size: item.att.file_size,
    type: item.att.file_type ?? '',
    ext: (item.att.file_extension ?? extOf(item.att.file_name)).toLowerCase(),
    onClick: item.onOpen,
  };
}

interface Props {
  items: AnexoItem[];
  onRemove: (item: AnexoItem) => void;
  /** Opens the file picker (the parent owns the hidden <input>). */
  onAddMore?: () => void;
  /** Bulk-removes every item (typically the pending ones). */
  onRemoveAll?: () => void;
  /** When true and items is empty, renders the friendly dropzone copy. */
  showEmptyState?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * File-upload-13 style list of attachments — supports pending (just added)
 * and saved (already in the DB) items in the same shape. Header shows a
 * count + Add / Remove-all actions; items get an icon box, name and size.
 * No progress bar (Supabase Storage upload is synchronous from our POV).
 */
export function AnexosList({
  items,
  onRemove,
  onAddMore,
  onRemoveAll,
  showEmptyState = false,
  maxFiles,
  maxSizeMB,
  disabled = false,
  className,
}: Props) {
  if (items.length === 0) {
    if (!showEmptyState) return null;
    return (
      <div
        className={cn(
          'flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white p-4 text-center',
          className,
        )}
      >
        <div
          aria-hidden
          className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-white text-base"
        >
          📎
        </div>
        <p className="mb-1 text-sm font-medium text-zinc-800">
          Solte os anexos aqui
        </p>
        {(maxFiles || maxSizeMB) && (
          <p className="text-xs text-zinc-500">
            {maxFiles ? `Máx ${maxFiles} arquivos` : null}
            {maxFiles && maxSizeMB ? ' ∙ ' : null}
            {maxSizeMB ? `Até ${maxSizeMB} MB cada` : null}
          </p>
        )}
        {onAddMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={onAddMore}
            className="mt-3"
          >
            <Upload className="-ms-0.5 size-3.5 opacity-60" aria-hidden />
            Selecionar arquivos
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-medium text-zinc-700">
          Arquivos ({items.length})
        </h3>
        <div className="flex gap-2">
          {onAddMore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={onAddMore}
            >
              <Upload className="-ms-0.5 size-3.5 opacity-60" aria-hidden />
              Adicionar
            </Button>
          )}
          {onRemoveAll && items.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={onRemoveAll}
            >
              <Trash2 className="-ms-0.5 size-3.5 opacity-60" aria-hidden />
              Remover todos
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const meta = readMeta(item);
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white p-2 pe-3 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  aria-hidden
                  className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border border-zinc-200 bg-zinc-50 text-base"
                >
                  {iconGlyph(meta.type, meta.ext)}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  {meta.onClick ? (
                    <button
                      type="button"
                      onClick={meta.onClick}
                      className="truncate text-left text-[13px] font-medium text-zinc-800 hover:text-emerald-700 hover:underline"
                      title={`Abrir ${meta.name}`}
                    >
                      {meta.name}
                    </button>
                  ) : (
                    <p className="truncate text-[13px] font-medium text-zinc-800">
                      {meta.name}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500">
                    {formatFileSize(meta.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item)}
                disabled={disabled}
                aria-label={`Remover ${meta.name}`}
                className="-me-2 inline-flex size-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-40"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
