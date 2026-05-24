import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1
        className="mb-2 text-2xl font-bold text-zinc-900"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="mb-2 mt-8 text-lg font-semibold text-zinc-800 border-b border-zinc-100 pb-1"
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className="mb-1.5 mt-5 text-base font-semibold text-zinc-700"
        {...props}
      />
    ),
    p: (props) => (
      <p
        className="mb-3 text-[14px] leading-relaxed text-zinc-600"
        {...props}
      />
    ),
    ul: (props) => (
      <ul
        className="mb-3 ml-4 list-disc space-y-1 text-[14px] text-zinc-600"
        {...props}
      />
    ),
    ol: (props) => (
      <ol
        className="mb-3 ml-4 list-decimal space-y-1 text-[14px] text-zinc-600"
        {...props}
      />
    ),
    li: (props) => <li className="leading-relaxed" {...props} />,
    strong: (props) => (
      <strong className="font-semibold text-zinc-800" {...props} />
    ),
    code: (props) => (
      <code
        className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[12px] text-zinc-700"
        {...props}
      />
    ),
    hr: () => <hr className="my-6 border-zinc-100" />,
    ...components,
  };
}
