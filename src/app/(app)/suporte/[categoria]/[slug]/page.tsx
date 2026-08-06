import { GeradorOS } from '@/features/gerador/GeradorOS';
import { MudEndGeneratorLite } from '@/features/gerador/mudend/MudEndGeneratorLite';

export default async function Page({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { categoria, slug } = await params;
  // Mud End tem gerador próprio (campos declarativos + agendamento como texto).
  if (categoria === 'mudanca-endereco') {
    return <MudEndGeneratorLite slug={slug} />;
  }
  return <GeradorOS slug={slug} categoriaSlug={categoria} />;
}
