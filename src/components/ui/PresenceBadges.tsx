'use client';

import { useState } from 'react';
import type { PresencePeer } from '@/hooks/usePresence';

interface Props {
  peers: PresencePeer[];
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function PresenceBadges({ peers }: Props) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  if (peers.length === 0) return null;

  return (
    <div className="flex items-center gap-1" aria-label="Colaboradores online">
      {peers.map((peer) => (
        <div
          key={peer.presenceKey}
          className="relative"
          onMouseEnter={() => setHoveredKey(peer.presenceKey)}
          onMouseLeave={() => setHoveredKey(null)}
        >
          {/* Avatar circle */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white/60 select-none cursor-default"
            style={{ backgroundColor: peer.color }}
          >
            {initials(peer.fullName)}
          </div>

          {/* Tooltip */}
          {hoveredKey === peer.presenceKey && (
            <div className="absolute bottom-full left-1/2 z-[200] mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white shadow-lg">
              <span className="font-medium">{peer.fullName}</span>
              {peer.editingField && (
                <span className="ml-1 text-zinc-400">
                  editando <span className="italic">{peer.editingField}</span>
                </span>
              )}
              {/* Arrow */}
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
            </div>
          )}

          {/* Live pulse dot */}
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
            style={{ backgroundColor: peer.color }}
          >
            <span
              className="absolute inset-0 animate-ping rounded-full opacity-75"
              style={{ backgroundColor: peer.color }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}
