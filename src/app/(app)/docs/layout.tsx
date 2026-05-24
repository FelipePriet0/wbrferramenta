'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_NAV } from '@/content/docs';

function groupByPhase(nav: typeof DOC_NAV) {
  const map = new Map<string, typeof DOC_NAV>();
  for (const entry of nav) {
    if (!map.has(entry.phase)) map.set(entry.phase, []);
    map.get(entry.phase)!.push(entry);
  }
  return map;
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const groups = groupByPhase(DOC_NAV);

  return (
    <div className="flex h-full min-h-0 gap-0">
      {/* Nav lateral */}
      <aside className="hidden w-[220px] shrink-0 overflow-y-auto border-r border-zinc-100 pr-4 md:block">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Documentação
        </p>
        {[...groups.entries()].map(([phase, entries]) => (
          <div key={phase} className="mb-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              {phase}
            </p>
            <ul className="space-y-0.5">
              {entries.map((entry) => {
                const active = pathname === `/docs/${entry.slug}`;
                return (
                  <li key={entry.slug}>
                    <Link
                      href={`/docs/${entry.slug}`}
                      className={`block rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                        active
                          ? 'bg-emerald-50 font-medium text-emerald-700'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                    >
                      {entry.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      {/* Conteúdo */}
      <main className="min-w-0 flex-1 overflow-y-auto pl-0 md:pl-8">
        <article className="mx-auto max-w-[720px] pb-16">
          {children}
        </article>
      </main>
    </div>
  );
}
