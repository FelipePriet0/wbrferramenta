import { useCallback, useRef, useState } from 'react';

type Entry = { apply: () => void; revert: () => void };

export function useFieldHistory() {
  const stack = useRef<Entry[]>([]);
  const idx = useRef(-1);
  const lastKey = useRef<string | null>(null);
  const isUndoRedo = useRef(false);
  const [, tick] = useState(0);

  const push = useCallback((key: string, revert: () => void, apply: () => void) => {
    if (isUndoRedo.current) return;
    if (lastKey.current === key && idx.current >= 0) {
      stack.current[idx.current].apply = apply;
    } else {
      stack.current = stack.current.slice(0, idx.current + 1);
      stack.current.push({ apply, revert });
      idx.current = stack.current.length - 1;
    }
    lastKey.current = key;
    tick((n) => n + 1);
  }, []);

  const undo = useCallback(() => {
    if (idx.current < 0) return;
    isUndoRedo.current = true;
    lastKey.current = null;
    stack.current[idx.current].revert();
    idx.current--;
    isUndoRedo.current = false;
    tick((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    if (idx.current >= stack.current.length - 1) return;
    isUndoRedo.current = true;
    lastKey.current = null;
    idx.current++;
    stack.current[idx.current].apply();
    isUndoRedo.current = false;
    tick((n) => n + 1);
  }, []);

  const canUndo = idx.current >= 0;
  const canRedo = idx.current < stack.current.length - 1;

  return { push, undo, redo, canUndo, canRedo, isUndoRedo };
}
