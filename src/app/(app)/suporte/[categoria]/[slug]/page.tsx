import { GeradorOS } from '@/features/gerador/GeradorOS';

export default async function Page({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { categoria, slug } = await params;
  return <GeradorOS slug={slug} categoriaSlug={categoria} />;
}
