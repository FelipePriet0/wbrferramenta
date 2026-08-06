import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  CreditCard,
  FileText,
  Gift,
  GraduationCap,
  KeyRound,
  Layers,
  ListChecks,
  MessagesSquare,
  MapPin,
  RadioTower,
  RotateCcw,
  Router,
  Store,
  Tv,
  Wifi,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  getCategoriaDetalhe,
  type CategoriaDetalhe,
  type ModeloResumo,
} from './modelos';

const FONTE = "'Google Sans Flex', Ubuntu, 'Segoe UI', system-ui, sans-serif";
const TEXTO = '#1a2027';

const ICONES: Record<string, LucideIcon> = {
  // ícones de modelo (alteração de plano)
  remoto: RadioTower,
  presencial: Store,
  'sem-troca': Router,
  'com-troca': ArrowLeftRight,
  // ícones de categoria (fallback usado nas listas derivadas)
  'alteracao-plano': ArrowLeftRight,
  'mud-end': MapPin,
  manutencao: Wrench,
  conversores: Tv,
  'wifi-extend': Wifi,
  senha: KeyRound,
  feedback: MessagesSquare,
  termo: FileText,
  tutoriais: GraduationCap,
  'modelos-os': Layers,
  'instalacao-gratis': Gift,
  'instalacao-taxa': CreditCard,
  encerramentos: ListChecks,
  'retorno-7dias': RotateCcw,
};
const ICONE_FALLBACK = FileText;

function comAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function ModeloCard({
  categoriaSlug,
  cor,
  modelo,
  hubBase,
}: {
  categoriaSlug: string;
  cor: string;
  modelo: ModeloResumo;
  hubBase: string;
}) {
  const Icone = ICONES[modelo.icone] ?? ICONE_FALLBACK;
  return (
    <Link
      href={`${hubBase}/${categoriaSlug}/${modelo.slug}`}
      className="group flex flex-col rounded-[42px] border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-14px_rgba(33,33,33,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-zinc-900/70"
      style={{ borderColor: 'rgba(33,33,33,0.12)', color: TEXTO, fontFamily: FONTE }}
    >
      <div className="flex items-start justify-between">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: comAlpha(cor, 0.14), color: cor }}
        >
          <Icone size={24} strokeWidth={1.9} />
        </span>
        <ArrowRight className="h-5 w-5 -translate-x-0.5 text-zinc-300 transition-all group-hover:translate-x-0 group-hover:text-zinc-500 dark:text-zinc-600" />
      </div>
      <h3 className="mt-4 text-base font-bold leading-[1.3]" style={{ color: TEXTO }}>
        {modelo.titulo}
      </h3>
      <p className="mt-1.5 text-base leading-6 text-zinc-500 dark:text-zinc-400">
        {modelo.descricao}
      </p>
    </Link>
  );
}

function CategoriaHeader({
  detalhe,
  hubBase,
  eyebrow,
}: {
  detalhe: CategoriaDetalhe;
  hubBase: string;
  eyebrow: string;
}) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p
          className="text-xs font-semibold uppercase"
          style={{ letterSpacing: '0.96px', color: detalhe.cor }}
        >
          {eyebrow}
        </p>
        <h1
          className="mt-2 font-bold"
          style={{ fontSize: '34px', lineHeight: '40.8px', letterSpacing: '-0.68px', color: TEXTO }}
        >
          {detalhe.titulo}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-6 text-zinc-600 dark:text-zinc-300">
          {detalhe.descricao}
        </p>
        <Link
          href={hubBase}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Todas as categorias
        </Link>
      </div>
      {detalhe.ilustracao && (
        <Image
          src={detalhe.ilustracao}
          alt={detalhe.titulo}
          width={1111}
          height={870}
          priority
          className="hidden h-auto w-[280px] flex-shrink-0 lg:block xl:w-[340px]"
        />
      )}
    </header>
  );
}

export function CategoriaModelos({
  categoriaSlug,
  hubBase = '/suporte',
  eyebrow = 'Demandas · Suporte',
  headingSecao = 'Tipos de alteração',
}: {
  categoriaSlug: string;
  hubBase?: string;
  eyebrow?: string;
  headingSecao?: string;
}) {
  const detalhe = getCategoriaDetalhe(categoriaSlug);

  if (!detalhe) {
    return (
      <div className="mx-auto w-full max-w-6xl" style={{ fontFamily: FONTE, color: TEXTO }}>
        <Link
          href={hubBase}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Todas as categorias
        </Link>
        <div className="mt-10 rounded-3xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <h1 className="text-xl font-bold" style={{ color: TEXTO }}>
            Categoria em construção
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Os fluxos desta categoria ainda não foram portados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl" style={{ fontFamily: FONTE, color: TEXTO }}>
      <CategoriaHeader detalhe={detalhe} hubBase={hubBase} eyebrow={eyebrow} />

      <section className="mt-8">
        <h2 className="mb-5 text-sm font-semibold" style={{ color: TEXTO }}>
          {headingSecao}
        </h2>

        {detalhe.grupos.map((grupo) => (
          <div key={grupo.titulo} className="mb-8">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: detalhe.cor }} />
              <h3 className="text-lg font-bold" style={{ color: TEXTO }}>
                {grupo.titulo}
              </h3>
              <span
                className="flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                style={{ backgroundColor: comAlpha(detalhe.cor, 0.12), color: detalhe.cor }}
              >
                {grupo.modelos.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {grupo.modelos.map((modelo) => (
                <ModeloCard
                  key={modelo.slug}
                  categoriaSlug={detalhe.slug}
                  cor={detalhe.cor}
                  modelo={modelo}
                  hubBase={hubBase}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
