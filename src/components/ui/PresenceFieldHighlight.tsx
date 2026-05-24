'use client';

import type { PresencePeer } from '@/hooks/usePresence';

interface Props {
  peers: PresencePeer[]; // peers editing THIS field
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps any field with a colored ring + floating name badge when a collaborator
 * is focused on it. Renders children as-is when no peers are editing.
 *
 * CSS transition makes the ring appear/disappear smoothly (150ms), bridging
 * the ~100ms network latency so it always feels intentional.
 */
export function PresenceFieldHighlight({ peers, children, className }: Props) {
  const activePeer = peers[0]; // one highlight at a time — first writer wins

  return (
    <div
      className={`relative transition-all duration-150 ${className ?? ''}`}
      style={
        activePeer
          ? {
              outline: `2px solid ${activePeer.color}`,
              outlineOffset: '2px',
              borderRadius: '4px',
            }
          : undefined
      }
    >
      {activePeer && (
        <div
          className="pointer-events-none absolute -top-5 left-0 z-50 flex items-center gap-1 whitespace-nowrap rounded-t px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
          style={{ backgroundColor: activePeer.color }}
        >
          {activePeer.fullName}
        </div>
      )}
      {children}
    </div>
  );
}
