'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function ContextMenu({
  pos,
  items,
  onClose,
}: {
  pos: { x: number; y: number };
  items: { label: string; onClick: () => void }[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{ top: pos.y, left: pos.x }}
      className="fixed z-[9999] min-w-[160px] rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => { item.onClick(); onClose(); }}
          className="w-full px-3 py-1.5 text-left text-[12px] text-zinc-700 hover:bg-zinc-100"
        >
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
