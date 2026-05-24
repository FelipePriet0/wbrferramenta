'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  children,
  title,
  titleIcon,
  dismissOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  /** Optional icon rendered to the left of the title (e.g. lucide-react). */
  titleIcon?: React.ReactNode;
  /**
   * Whether clicking the backdrop closes the modal. Default true.
   * Set to false for destructive flows (e.g. CancelModal) where a
   * misclick on the dimmed area shouldn't lose the typed reason.
   */
  dismissOnBackdrop?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  // Render the modal as a portal into <body>. Without this, any ancestor
  // with `transform`/`filter` (e.g. the dnd-kit Translate on KanbanCard,
  // or the zoom containing block on the Expanded page) becomes the
  // containing block for our `position: fixed` shell — and the modal ends
  // up displaced relative to that ancestor instead of the viewport.
  // Even though the portal renders into <body>, React's synthetic event
  // system still bubbles through the React tree — so a click on the
  // backdrop/shell would propagate to whatever owns the modal at the
  // React-tree level (e.g. a KanbanCard with onClick={openExpanded}). We
  // stopPropagation on every click here so closing the modal can never
  // accidentally trigger an ancestor's handler.
  const onBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dismissOnBackdrop) onClose();
  };

  return createPortal(
    <>
      {/* z-[80]/[90] are above the EditarFichaModal's z-[40]/[70] so when
          this modal stacks on top of an open EditarFichaModal, the
          backdrop blurs the ficha modal underneath instead of sitting at
          the same depth. backdrop-blur-md + bg-black/50 give a visible
          "frosted glass" between the two layers. */}
      <div
        className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-md"
        onClick={onBackdropClick}
      />
      <div
        className="fixed inset-0 z-[90] grid place-items-center p-4"
        onClick={onBackdropClick}
      >
        <div
          className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            {title ? (
              <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-zinc-900">
                {titleIcon && (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    {titleIcon}
                  </span>
                )}
                {title}
              </h3>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="-mr-2 -mt-2 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
