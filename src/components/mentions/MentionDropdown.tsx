"use client";

import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { normalizeForSearch } from "@/lib/utils";
import type { ProfileLite } from "@/services/profiles";
import { UserAvatar } from "@/components/ui/avatar";

type Props = {
  items: ProfileLite[];
  onPick: (p: ProfileLite) => void;
  excludeIds?: string[];
};

export default function MentionDropdown({ items, onPick, excludeIds }: Props) {
  const [q, setQ] = useState("");
  const listboxId = useId();

  const filtered = useMemo(() => {
    const exclude = new Set(excludeIds || []);
    const needle = normalizeForSearch(q);
    return (items || []).filter(
      (p) => !exclude.has(p.id) && normalizeForSearch(p.full_name).includes(needle),
    );
  }, [items, q, excludeIds]);

  const firstId = filtered[0]?.id ? `mention-opt-${filtered[0].id}` : undefined;
  const srOnly = { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 } as React.CSSProperties;

  return (
    <div
      className="cmd-menu-dropdown mt-2 max-h-60 w-64 overflow-auto rounded-lg border border-zinc-200 bg-white text-sm shadow"
      role="listbox"
      aria-label="Sugestões de menção"
      id={listboxId}
      aria-activedescendant={firstId}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100">
        <Search className="w-4 h-4 text-zinc-500" />
        <input
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={true}
          aria-activedescendant={firstId}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar pessoas…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
        <div style={srOnly} aria-live="polite">{filtered.length} resultado{filtered.length === 1 ? '' : 's'}</div>
      </div>
      {filtered.length === 0 ? (
        <div className="px-3 py-2 text-zinc-500">Sem resultados</div>
      ) : (
        <div className="py-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => onPick(p)}
              role="option"
              id={`mention-opt-${p.id}`}
              className="cmd-menu-item flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-zinc-50"
            >
              <UserAvatar name={p.full_name ?? '—'} size="xs" />
              <span className="flex-1 truncate text-zinc-800">{p.full_name ?? '—'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
