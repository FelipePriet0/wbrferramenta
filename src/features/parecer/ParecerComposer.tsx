'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  UnifiedComposer,
  type ComposerDecision,
  type ComposerValue,
  type UnifiedComposerHandle,
} from '@/components/unified-composer/UnifiedComposer';
import MentionDropdown from '@/components/mentions/MentionDropdown';
import { CmdDropdown } from '@/features/editar-ficha/components/CmdDropdown';
import { decisionPlaceholder } from '@/features/editar-ficha/utils/decision';
import {
  addParecer,
  deleteParecer,
  editParecer,
  type ParecerMention,
} from '@/services/parecer';
import { setCardDecision } from '@/services/kanban';
import {
  ATTACHMENT_ALLOWED_TYPES,
  uploadAttachmentBatch,
} from '@/services/attachments';
import { AnexosList, type AnexoItem } from './AnexosList';
import { RevertParecerModal } from './RevertParecerModal';
import { friendlyError } from '@/lib/errors';
import { normalizeForSearch } from '@/lib/utils';
import type { ProfileLite } from '@/services/profiles';
import type { KanbanDecisionStatus } from '@/lib/types';

export type ParecerMode = 'create' | 'reply' | 'edit';

interface Props {
  mode: ParecerMode;
  /**
   * cardId is **captured by closure** in the submit handler so that text
   * typed for card A can never get committed to card B if the parent
   * rerenders. Always pair this with `<ParecerComposer key={cardId} ...>`.
   */
  cardId: string;
  /**
   * Optional — `uploadAttachmentBatch` resolves it from the card row when
   * not provided. Pass it when you already have it to skip the lookup.
   */
  applicantId?: string;

  /** mode='reply' → parent_id of the new note. */
  parentId?: string | null;
  /** mode='edit' → id of the note being edited. */
  noteId?: string;
  initialText?: string;
  initialDecision?: KanbanDecisionStatus | null;

  profiles: ProfileLite[];
  currentUserId?: string | null;

  placeholder?: string;
  submitLabel?: string;
  disabled?: boolean;
  /** Called once the parecer (and any attachments) hit the DB successfully. */
  onSuccess?: () => void;
  /** Called when the user clicks Cancelar (mostly in reply/edit). */
  onCancel?: () => void;
  /**
   * Current stage of the card — needed so the composer can detect when a
   * decision is being submitted while the card sits in "Canceladas" and
   * prompt for an explicit revert reason before persisting.
   */
  cardStage?: string | null;
}

/**
 * "Source of truth" composer for any parecer write — root post, reply
 * inside a thread or in-place edit of an existing note. The three modes
 * share the same Tiptap-less <UnifiedComposer>, slash / mention dropdowns,
 * pending-file list and submit pipeline. Changing the visual or behaviour
 * here cascades to every call site automatically.
 */
export function ParecerComposer({
  mode,
  cardId,
  applicantId,
  parentId = null,
  noteId,
  initialText = '',
  initialDecision = null,
  profiles,
  currentUserId,
  placeholder = 'Escreva um parecer… Use @ para mencionar, / para comandos',
  submitLabel,
  disabled = false,
  onSuccess,
  onCancel,
  cardStage,
}: Props) {
  // The DOM-level composer is from the legacy migration; we drive it
  // through its imperative handle for caret-aware mention/decision insertion.
  const composerRef = useRef<UnifiedComposerHandle | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [value, setValue] = useState<ComposerValue>({
    decision: initialDecision,
    text: initialText,
    mentions: [],
  });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // Pending submission paused by the revert-cancel prompt.
  const [revertPrompt, setRevertPrompt] = useState<ComposerValue | null>(null);

  // Slash + mention popovers — driven by the composer's trigger callbacks.
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');

  // CAPTURE cardId — anti-P0. Read this in callbacks, never the prop.
  const capturedCardId = cardId;
  const capturedApplicantId = applicantId;

  const pendingItems: AnexoItem[] = useMemo(
    () =>
      pendingFiles.map((file, i) => ({
        kind: 'pending' as const,
        id: `${file.name}-${file.size}-${i}`,
        file,
      })),
    [pendingFiles],
  );

  const openPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removePending = useCallback((item: AnexoItem) => {
    setPendingFiles((prev) =>
      prev.filter(
        (_, i) => `${prev[i].name}-${prev[i].size}-${i}` !== item.id,
      ),
    );
  }, []);

  const removeAllPending = useCallback(() => setPendingFiles([]), []);

  const ingestFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setPendingFiles((prev) => [...prev, ...arr]);
  }, []);

  // Submit: runs the right service for the mode, then uploads attachments
  // under the returned/known noteId, then calls onSuccess.
  const handleSubmit = useCallback(
    async (val: ComposerValue) => {
      if (submitting || disabled) return;
      const text = (val.text || '').trim();
      const decision = val.decision ?? null;
      if (!decision && !text && pendingFiles.length === 0) return;
      // Revert-cancel gate: a decision in a card currently parked in
      // "canceladas" is a deliberate revert. Open the prompt to capture the
      // reason (or confirm the text already typed) before persisting.
      if (decision && cardStage === 'canceladas') {
        setRevertPrompt(val);
        return;
      }
      const payloadText = (decision && !text ? decisionPlaceholder(decision) : text).toUpperCase();
      const filesToUpload = pendingFiles.slice();
      setSubmitting(true);
      try {
        // ComposerValue.mentions is maintained by UnifiedComposer as the
        // user inserts / removes mention chips. Pass it through so the
        // backend's reanalysis_notes[].mentions stops being a phantom [].
        const mentionList: ParecerMention[] = (val.mentions ?? [])
          .filter((m) => !!m.id)
          .map((m) => ({ id: m.id as string, label: m.label }));

        let resolvedNoteId: string | null = null;
        if (mode === 'create') {
          const { noteId: nid } = await addParecer(
            capturedCardId,
            payloadText,
            { decision, mentions: mentionList },
          );
          resolvedNoteId = nid;
        } else if (mode === 'reply') {
          if (!parentId) throw new Error('parentId obrigatório para reply');
          const { noteId: nid } = await addParecer(
            capturedCardId,
            payloadText,
            { parentId, decision, mentions: mentionList },
          );
          resolvedNoteId = nid;
        } else if (mode === 'edit') {
          if (!noteId) throw new Error('noteId obrigatório para edit');
          await editParecer(capturedCardId, noteId, payloadText, {
            decision,
            mentions: mentionList,
          });
          resolvedNoteId = noteId;
        }

        if (filesToUpload.length > 0 && resolvedNoteId) {
          await uploadAttachmentBatch({
            cardId: capturedCardId,
            noteId: resolvedNoteId,
            applicantId: capturedApplicantId,
            files: filesToUpload.map((f) => ({ file: f })),
          });
          setPendingFiles([]);
        }

        // Reset on create/reply; keep state on edit (the host typically unmounts).
        if (mode !== 'edit') {
          const reset: ComposerValue = { decision: null, text: '', mentions: [] };
          setValue(reset);
          requestAnimationFrame(() => composerRef.current?.setValue(reset));
        }
        onSuccess?.();
      } catch (e) {
        alert(friendlyError(e, 'Falha ao enviar parecer'));
      } finally {
        setSubmitting(false);
      }
    },
    [
      capturedApplicantId,
      capturedCardId,
      cardStage,
      disabled,
      mode,
      noteId,
      onSuccess,
      parentId,
      pendingFiles,
      submitting,
    ],
  );

  // Called by RevertParecerModal once the user confirms the revert reason.
  // Rebuilds a ComposerValue with the reason as the parecer text and
  // re-enters handleSubmit — this time cardStage no longer matters because
  // we explicitly skip the gate by clearing revertPrompt first.
  const handleConfirmRevert = useCallback(
    async (reason: string) => {
      const pending = revertPrompt;
      if (!pending) return;
      setRevertPrompt(null);
      const next: ComposerValue = {
        decision: pending.decision,
        text: reason,
        mentions: pending.mentions,
      };
      // Temporarily forge cardStage so the gate doesn't re-trigger.
      // (We call addParecer directly to bypass the closure that still sees
      // the old cardStage.)
      if (submitting || disabled) return;
      setSubmitting(true);
      try {
        const mentionList: ParecerMention[] = (next.mentions ?? [])
          .filter((m) => !!m.id)
          .map((m) => ({ id: m.id as string, label: m.label }));
        const decision = next.decision ?? null;
        const payloadText = reason.toUpperCase();
        let resolvedNoteId: string | null = null;
        if (mode === 'create') {
          const { noteId: nid } = await addParecer(capturedCardId, payloadText, {
            decision,
            mentions: mentionList,
          });
          resolvedNoteId = nid;
        } else if (mode === 'reply') {
          if (!parentId) throw new Error('parentId obrigatório para reply');
          const { noteId: nid } = await addParecer(capturedCardId, payloadText, {
            parentId,
            decision,
            mentions: mentionList,
          });
          resolvedNoteId = nid;
        } else if (mode === 'edit') {
          if (!noteId) throw new Error('noteId obrigatório para edit');
          await editParecer(capturedCardId, noteId, payloadText, {
            decision,
            mentions: mentionList,
          });
          resolvedNoteId = noteId;
        }
        const filesToUpload = pendingFiles.slice();
        if (filesToUpload.length > 0 && resolvedNoteId) {
          await uploadAttachmentBatch({
            cardId: capturedCardId,
            noteId: resolvedNoteId,
            applicantId: capturedApplicantId,
            files: filesToUpload.map((f) => ({ file: f })),
          });
          setPendingFiles([]);
        }
        if (mode !== 'edit') {
          const reset: ComposerValue = { decision: null, text: '', mentions: [] };
          setValue(reset);
          requestAnimationFrame(() => composerRef.current?.setValue(reset));
        }
        onSuccess?.();
      } catch (e) {
        alert(friendlyError(e, 'Falha ao enviar parecer'));
      } finally {
        setSubmitting(false);
      }
    },
    [
      capturedApplicantId,
      capturedCardId,
      disabled,
      mode,
      noteId,
      onSuccess,
      parentId,
      pendingFiles,
      revertPrompt,
      submitting,
    ],
  );

  const handleAcceptCommand = useCallback(
    (query: string) => {
      const items: ('aprovado' | 'negado' | 'reanalise' | 'anexo')[] = [
        'aprovado',
        'negado',
        'reanalise',
        'anexo',
      ];
      const matches = items.filter((k) =>
        k.includes((query || '').toLowerCase()),
      );
      if (matches.length === 1) {
        setCmdOpen(false);
        setCmdQuery('');
        if (matches[0] === 'anexo') {
          openPicker();
          const clean = value.text.replace(/\s*\/[\w]*$/, '').trimEnd();
          const next: ComposerValue = { ...value, text: clean };
          setValue(next);
          composerRef.current?.setValue(next);
        } else {
          composerRef.current?.setDecision(matches[0] as ComposerDecision);
        }
        return true;
      }
      return false;
    },
    [openPicker, value],
  );

  const handleAcceptMention = useCallback(
    (query: string) => {
      const needle = normalizeForSearch(query);
      const list = profiles.filter(
        (p) =>
          p.id !== currentUserId &&
          normalizeForSearch(p.full_name).includes(needle),
      );
      if (list.length === 0) return false;
      // Slack/Discord-style: Enter always accepts the first match in the
      // dropdown. Users can arrow-down to pick another before pressing Enter.
      composerRef.current?.insertMention({
        id: list[0].id,
        label: list[0].full_name ?? '',
      });
      setMentionOpen(false);
      setMentionFilter('');
      return true;
    },
    [profiles, currentUserId],
  );

  const computedSubmitLabel =
    submitLabel ??
    (mode === 'reply' ? 'Responder' : mode === 'edit' ? 'Salvar' : 'Enviar');

  return (
    <div className="relative" ref={containerRef}>
      <UnifiedComposer
        ref={composerRef}
        className="composer-root--blue"
        placeholder={placeholder}
        ariaLabel="Escrever parecer"
        defaultValue={{
          decision: initialDecision,
          text: initialText,
          mentions: [],
        }}
        disabled={disabled}
        enablePasteAttachment
        enableDropAttachment
        hasPendingAttachments={pendingFiles.length > 0}
        onFilesDropped={(files) => ingestFiles(files)}
        onFilesPasted={(files) => ingestFiles(files)}
        onChange={(val) => {
          setValue(val);
          // Defensive: when the trigger char is no longer anywhere in the
          // text (full backspace), force-close the popover. The composer
          // already fires onMentionClose/onCommandClose for normal cases,
          // but this covers browser quirks where the close fails to fire.
          if (!val.text.includes('@')) setMentionOpen(false);
          if (!val.text.includes('/')) setCmdOpen(false);
        }}
        onMentionTrigger={(query) => {
          setMentionFilter((query || '').trim());
          setMentionOpen(true);
        }}
        onMentionClose={() => setMentionOpen(false)}
        onCommandTrigger={(query) => {
          setCmdQuery((query || '').toLowerCase());
          setCmdOpen(true);
        }}
        onCommandClose={() => {
          setCmdOpen(false);
          setCmdQuery('');
        }}
        onAcceptCommand={handleAcceptCommand}
        onAcceptMention={handleAcceptMention}
        onRequestAttachment={openPicker}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />

      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        accept={ATTACHMENT_ALLOWED_TYPES.join(',')}
        onChange={(e) => {
          if (e.target.files) ingestFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Anexos pendentes — UI file-upload-13 unificada */}
      <div className="mt-3">
        <AnexosList
          items={pendingItems}
          onRemove={removePending}
          onAddMore={openPicker}
          onRemoveAll={pendingItems.length > 1 ? removeAllPending : undefined}
          disabled={submitting || disabled}
          maxFiles={undefined}
          maxSizeMB={10}
        />
      </div>

      {mentionOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-2">
          <MentionDropdown
            items={profiles.filter((p) => {
              if (p.id === currentUserId) return false;
              return normalizeForSearch(p.full_name).includes(
                normalizeForSearch(mentionFilter),
              );
            })}
            onPick={(p) => {
              composerRef.current?.insertMention({
                id: p.id,
                label: p.full_name ?? '',
              });
              setMentionOpen(false);
              setMentionFilter('');
            }}
          />
        </div>
      )}

      {cmdOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-2">
          <CmdDropdown
            items={[
              { key: 'aprovado', label: 'Aprovado' },
              { key: 'negado', label: 'Negado' },
              { key: 'reanalise', label: 'Reanálise' },
              { key: 'anexo', label: 'Anexo' },
            ].filter(
              (i) =>
                i.key.includes(cmdQuery) ||
                i.label.toLowerCase().includes(cmdQuery),
            )}
            onPick={(key) => {
              setCmdOpen(false);
              setCmdQuery('');
              if (key === 'anexo') {
                openPicker();
                const clean = value.text.replace(/\s*\/[\w]*$/, '').trimEnd();
                const next: ComposerValue = { ...value, text: clean };
                setValue(next);
                composerRef.current?.setValue(next);
              } else {
                composerRef.current?.setDecision(key as ComposerDecision);
              }
            }}
          />
        </div>
      )}

      <RevertParecerModal
        open={!!revertPrompt}
        onClose={() => setRevertPrompt(null)}
        onConfirm={(reason) => void handleConfirmRevert(reason)}
        initialText={revertPrompt?.text ?? ''}
        decisionLabel={
          revertPrompt?.decision === 'aprovado'
            ? 'Aprovado'
            : revertPrompt?.decision === 'negado'
              ? 'Negado'
              : revertPrompt?.decision === 'reanalise'
                ? 'Reanálise'
                : undefined
        }
      />

      {/* Aux exports — not actually used at runtime, kept so tree-shaking
          doesn't drop the helpers when this file gets imported elsewhere. */}
      <span hidden aria-hidden>
        {computedSubmitLabel}
      </span>
    </div>
  );
}

// Re-export so callers can do `import { ... } from '@/features/parecer/ParecerComposer'`
// without reaching into services if they only need the types.
export { deleteParecer, setCardDecision };
