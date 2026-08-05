import { CategoriaModelos } from '@/features/gerador/CategoriaModelos';

export default async function Page({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  return <CategoriaModelos categoriaSlug={categoria} />;
}
