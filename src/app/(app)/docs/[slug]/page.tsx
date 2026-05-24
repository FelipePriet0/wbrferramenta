import { notFound } from 'next/navigation';
import { DOC_NAV } from '@/content/docs';

export function generateStaticParams() {
  return DOC_NAV.map((d) => ({ slug: d.slug }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = DOC_NAV.find((d) => d.slug === slug);
  if (!entry) notFound();

  try {
    const { default: DocContent } = (await import(
      `@/content/docs/${entry.file}.mdx`
    )) as { default: React.ComponentType };
    return <DocContent />;
  } catch {
    notFound();
  }
}
