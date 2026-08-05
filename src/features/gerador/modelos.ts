/**
 * Modelos por categoria (dados de exibição das telas de lista).
 * `alteracao-plano` tem detalhe curado; as demais categorias são DERIVADAS do
 * registry (ver `getCategoriaDetalhe`). Ver `docs/gerador/sondagem2-suporte.md`.
 */
import { TODAS_CATEGORIAS } from './categorias';
import { listarModelosPorDemanda } from './modelos/registry';
import { getCardModelo } from './cardsCategorias';

export type IconeModelo =
  | 'remoto'
  | 'presencial'
  | 'sem-troca'
  | 'com-troca';

export interface ModeloResumo {
  slug: string;
  titulo: string;
  descricao: string;
  /** Chave de ícone (lucide) — resolvida em CategoriaModelos, com fallback. */
  icone: IconeModelo | string;
}

export interface GrupoModelos {
  /** Rótulo do grupo (ex.: "Ativo / Receptivo"). */
  titulo: string;
  modelos: ModeloResumo[];
}

export interface CategoriaDetalhe {
  slug: string;
  /** Cor MUI da categoria (hex) — mesma do hub. */
  cor: string;
  titulo: string;
  /** Descrição longa (parágrafo do topo da página da categoria). */
  descricao: string;
  /** Ilustração do header (em /public/gerador). Opcional. */
  ilustracao?: string;
  grupos: GrupoModelos[];
}

const ALTERACAO_PLANO: CategoriaDetalhe = {
  slug: 'alteracao-plano',
  cor: '#2e7d32',
  titulo: 'Alteração de plano',
  descricao:
    'Escolha o tipo de alteração. Os fluxos Remoto e Presencial abrem o gerador já no formulário — variações de titular, terceiro e PJ no próprio modelo. O modo ofertado está disponível como alternância dentro de cada formulário.',
  ilustracao: '/gerador/illus-contracts.png',
  grupos: [
    {
      titulo: 'Ativo / Receptivo',
      modelos: [
        {
          slug: 'altplan-remoto',
          titulo: 'Remoto (titular / terceiro / PJ)',
          descricao:
            'Acordo remoto com variações de titular, terceiro e PJ no próprio formulário.',
          icone: 'remoto',
        },
        {
          slug: 'altplan-presencial',
          titulo: 'Presencial (titular / terceiro)',
          descricao:
            'Atendimento presencial em loja, com variações de titular e terceiro.',
          icone: 'presencial',
        },
        {
          slug: 'altplan-sem-troca-visita-isenta',
          titulo: 'Sem troca: isento',
          descricao: 'Mantém o roteador atual; visita técnica sem custo.',
          icone: 'sem-troca',
        },
        {
          slug: 'altplan-sem-troca-visita-paga',
          titulo: 'Sem troca: pago',
          descricao: 'Mantém o roteador atual; visita técnica com custo.',
          icone: 'sem-troca',
        },
        {
          slug: 'altplan-troca-visita-isenta',
          titulo: 'Com troca: isento',
          descricao: 'Inclui troca de roteador; visita técnica sem custo.',
          icone: 'com-troca',
        },
        {
          slug: 'altplan-troca-visita-paga',
          titulo: 'Com troca: pago',
          descricao: 'Inclui troca de roteador; visita técnica com custo.',
          icone: 'com-troca',
        },
      ],
    },
  ],
};

/** Detalhe estático (curado) por slug de categoria. */
export const DETALHE_CATEGORIA: Record<string, CategoriaDetalhe> = {
  'alteracao-plano': ALTERACAO_PLANO,
};

/**
 * Detalhe da categoria: usa o curado se existir; senão DERIVA do registry
 * (todo modelo registrado da demanda vira um card). Assim qualquer categoria
 * já portada mostra sua lista automaticamente, sem hardcode.
 */
export function getCategoriaDetalhe(slug: string): CategoriaDetalhe | null {
  const curado = DETALHE_CATEGORIA[slug];
  if (curado) return curado;

  const meta = TODAS_CATEGORIAS.find((c) => c.slug === slug);
  if (!meta) return null;
  const modelos = listarModelosPorDemanda(meta.demanda ?? slug);
  if (!modelos.length) return null;

  return {
    slug,
    cor: meta.cor,
    titulo: meta.titulo,
    descricao: meta.descricao,
    grupos: [
      {
        titulo: 'Fluxos',
        modelos: modelos.map(({ slug: s, form }) => {
          const card = getCardModelo(s);
          return {
            slug: s,
            titulo: card?.label ?? form.modo,
            descricao: card?.descricao ?? form.descricao,
            icone: meta.icone,
          };
        }),
      },
    ],
  };
}
