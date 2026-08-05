import Image from 'next/image';
import Link from 'next/link';
import {
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
  RotateCcw,
  Tv,
  Wifi,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  CATEGORIAS_SUPORTE,
  REFERENCIA_MODELOS_OS,
  TOTAL_MODELOS_PROJETO,
  type Categoria,
  type IconeCategoria,
} from './categorias';

/**
 * Clone do Hub Suporte do Gerador de O.S legado. Valores/assets extraídos do
 * app deployado — ver `docs/gerador/specs/hub-suporte.spec.md`.
 */

const FONTE = "'Google Sans Flex', Ubuntu, 'Segoe UI', system-ui, sans-serif";
const TEXTO = '#1a2027'; // rgb(26,32,39)

const ICONES: Record<IconeCategoria, LucideIcon> = {
  'alteracao-plano': ArrowLeftRight,
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

/** rgba(cor, alpha) a partir de um hex #rrggbb. */
function comAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function CategoriaCard({ categoria }: { categoria: Categoria }) {
  const Icone = ICONES[categoria.icone];
  return (
    <Link
      href={`/suporte/${categoria.slug}`}
      className="group flex flex-col rounded-[42px] border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-14px_rgba(33,33,33,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-zinc-900/70"
      style={{ borderColor: 'rgba(33,33,33,0.12)', color: TEXTO, fontFamily: FONTE }}
    >
      <div className="flex items-start justify-between">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: comAlpha(categoria.cor, 0.14), color: categoria.cor }}
        >
          <Icone size={26} strokeWidth={1.9} />
        </span>
        <ArrowRight
          className="h-5 w-5 -translate-x-0.5 text-zinc-300 transition-all group-hover:translate-x-0 group-hover:text-zinc-500 dark:text-zinc-600"
        />
      </div>
      <h3 className="mt-4 text-base font-bold leading-[1.3]" style={{ color: TEXTO }}>
        {categoria.titulo}
      </h3>
      <p className="mt-1.5 text-base leading-6 text-zinc-500 dark:text-zinc-400">
        {categoria.descricao}
      </p>
      <span
        className="mt-4 inline-flex w-fit items-center rounded-2xl px-3 py-1 text-[13px] font-semibold"
        style={{ backgroundColor: comAlpha(categoria.cor, 0.1), color: categoria.cor }}
      >
        {categoria.badge}
      </span>
    </Link>
  );
}

export function HubSuporte() {
  return (
    <div className="relative" style={{ fontFamily: FONTE, color: TEXTO }}>
      {/* Fundo de circuito (asset do legado) — bem sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] dark:opacity-[0.10] dark:invert"
        style={{
          backgroundImage: 'url(/gerador/circuit.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="mx-auto w-full max-w-6xl">
        {/* Header — texto à esquerda, ilustração à direita */}
        <header className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p
              className="text-xs font-semibold uppercase"
              style={{ letterSpacing: '0.96px', color: '#2e7d32' }}
            >
              Hub de suporte
            </p>
            <h1
              className="mt-2 font-bold"
              style={{ fontSize: '34px', lineHeight: '40.8px', letterSpacing: '-0.68px', color: TEXTO }}
            >
              Demandas por categoria
            </h1>
            <p className="mt-3 max-w-xl text-base leading-6 text-zinc-600 dark:text-zinc-300">
              Escolha o tipo de demanda para acessar os fluxos de O.S. alinhados à sua
              operação. Os números indicam quantos fluxos existem em cada categoria.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#2e7d32' }} />
              {TOTAL_MODELOS_PROJETO} modelos no projeto
            </span>
          </div>
          <Image
            src="/gerador/illus-support.png"
            alt="Suporte"
            width={1536}
            height={1024}
            priority
            className="hidden h-auto w-[300px] flex-shrink-0 lg:block xl:w-[380px]"
          />
        </header>

        {/* Categorias */}
        <section className="mt-8">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: TEXTO }}>
            Categorias
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIAS_SUPORTE.map((categoria) => (
              <CategoriaCard key={categoria.slug} categoria={categoria} />
            ))}
          </div>
        </section>

        {/* Referências */}
        <section className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: TEXTO }}>
            Referências
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CategoriaCard categoria={REFERENCIA_MODELOS_OS} />
          </div>
        </section>
      </div>
    </div>
  );
}
