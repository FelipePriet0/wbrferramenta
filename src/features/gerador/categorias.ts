/**
 * Hub Suporte — catálogo de categorias (clone do Gerador de O.S legado v4.0.1).
 *
 * Os 43 fluxos de formulário do Suporte, agrupados em 8 categorias, mais a
 * referência "Modelos de O.S". Extraído do bundle deployado — ver
 * `docs/gerador/sondagem2-suporte.md`.
 *
 * `Mudança de endereço` fica de fora de propósito: já existe no wbrferramenta
 * (Mud End / Validação Mud. End.), então não é reclonada aqui.
 */

/** Chave de ícone — mapeada para um componente lucide em `HubSuporte.tsx`. */
export type IconeCategoria =
  | 'alteracao-plano'
  | 'manutencao'
  | 'conversores'
  | 'wifi-extend'
  | 'senha'
  | 'feedback'
  | 'termo'
  | 'tutoriais'
  | 'modelos-os'
  | 'instalacao-gratis'
  | 'instalacao-taxa'
  | 'encerramentos'
  | 'retorno-7dias';

export interface Categoria {
  slug: string;
  titulo: string;
  descricao: string;
  /** Quantidade de modelos/fluxos na categoria. */
  quantidade: number;
  /** Rótulo do badge (singular/plural já resolvido). */
  badge: string;
  icone: IconeCategoria;
  /**
   * Cor da categoria (hex), extraída do legado — paleta MUI 800.
   * O legado reutiliza cores entre categorias. Usada no tile (14% alpha),
   * no ícone e no badge. Ver `docs/gerador/specs/hub-suporte.spec.md`.
   */
  cor: string;
  /**
   * Demanda (chave de registro dos modelos) quando difere do slug da categoria.
   * Ex.: `midia-tv-cadastro` reusa os modelos de demanda `midia-tv`. Default = slug.
   */
  demanda?: string;
}

export const CATEGORIAS_SUPORTE: readonly Categoria[] = [
  {
    slug: 'alteracao-plano',
    titulo: 'Alteração de plano',
    descricao: 'Troca de plano, upgrade/downgrade e propostas.',
    quantidade: 6,
    badge: '6 modelos',
    icone: 'alteracao-plano',
    cor: '#2e7d32',
  },
  {
    slug: 'manutencao',
    titulo: 'Manutenção',
    descricao: 'Visitas técnicas, interna/externa e ocasionado.',
    quantidade: 15,
    badge: '15 modelos',
    icone: 'manutencao',
    cor: '#ef6c00',
  },
  {
    slug: 'midia-tv',
    titulo: 'Conversores / TV',
    descricao: 'STB, Roku e mídia.',
    quantidade: 3,
    badge: '3 modelos',
    icone: 'conversores',
    cor: '#c62828',
  },
  {
    slug: 'wifi-extend',
    titulo: 'Wi-Fi Extend',
    descricao: 'Mesh e extensão de cobertura.',
    quantidade: 3,
    badge: '3 modelos',
    icone: 'wifi-extend',
    cor: '#7b1fa2',
  },
  {
    slug: 'senha-rede',
    titulo: 'Senha / SSID Wi-Fi',
    descricao: 'Alteração de credenciais da rede.',
    quantidade: 1,
    badge: '1 modelo',
    icone: 'senha',
    cor: '#2e7d32',
  },
  {
    slug: 'feedback',
    titulo: 'Feedback',
    descricao: 'Confirmações pós-atendimento e registros de feedback.',
    quantidade: 8,
    badge: '8 modelos',
    icone: 'feedback',
    cor: '#1565c0',
  },
  {
    slug: 'termo-docs',
    titulo: 'Termo de responsabilidade',
    descricao: 'Acesso ao roteador emprestado em comodato.',
    quantidade: 1,
    badge: '1 modelo',
    icone: 'termo',
    cor: '#ef6c00',
  },
  {
    slug: 'tutoriais',
    titulo: 'Tutoriais',
    descricao: 'Guias passo a passo para configuração de equipamentos.',
    quantidade: 4,
    badge: '4 tutoriais',
    icone: 'tutoriais',
    cor: '#3949ab',
  },
] as const;

/** Card de referência (seção "Referências", fora da grade principal). */
export const REFERENCIA_MODELOS_OS: Categoria = {
  slug: 'modelos-os',
  titulo: 'Modelos de O.S.',
  descricao:
    'Textos base para casos atípicos sem formulário dedicado — copie, adapte e use.',
  quantidade: 15,
  badge: '15 modelos',
  icone: 'modelos-os',
  cor: '#8b5cf6',
};

/** Total exibido no header ("N modelos no projeto"). */
export const TOTAL_MODELOS_PROJETO = CATEGORIAS_SUPORTE.reduce(
  (soma, c) => soma + c.quantidade,
  0,
);

/**
 * Hub CADASTRO (`/cadastro`) — "Demandas de instalação".
 * Cores/ícones fiéis ao legado (ver `docs/gerador/sondagem-cadastro-instalacao.md`).
 * `midia-tv-cadastro` reusa os modelos de demanda `midia-tv` (Conversores/Roku).
 */
export const CATEGORIAS_CADASTRO: readonly Categoria[] = [
  {
    slug: 'instalacao-gratis',
    titulo: 'Instalação grátis',
    descricao: 'Abertura de O.S de instalação sem taxa — residencial e empresarial.',
    quantidade: 2,
    badge: '2 modelos',
    icone: 'instalacao-gratis',
    cor: '#2e7d32',
  },
  {
    slug: 'instalacao-taxa',
    titulo: 'Instalação com taxa',
    descricao: 'Abertura de O.S de instalação com taxa — residencial e empresarial.',
    quantidade: 2,
    badge: '2 modelos',
    icone: 'instalacao-taxa',
    cor: '#d97706',
  },
  {
    slug: 'midia-tv-cadastro',
    titulo: 'Conversores / Roku TV',
    descricao: 'STB, Roku e mídia no fluxo de cadastro.',
    quantidade: 3,
    badge: '3 modelos',
    icone: 'conversores',
    cor: '#3b82f6',
    demanda: 'midia-tv',
  },
] as const;

/**
 * Hub INSTALAÇÃO (`/instalacao`) — "Setor de instalação".
 * `encerramentos-instalacao` é categoria com página; `manut-retorno-7dias` é
 * um atalho direto para o fluxo de luz vermelha (isento) — tratado como tile no hub.
 */
export const CATEGORIAS_INSTALACAO: readonly Categoria[] = [
  {
    slug: 'encerramentos-instalacao',
    titulo: 'Encerramentos',
    descricao: 'Textos de encerramento de instalação — casa, empresa, Wi-Fi Extend e alt. plano.',
    quantidade: 4,
    badge: '4 modelos',
    icone: 'encerramentos',
    cor: '#1565c0',
  },
] as const;

/** Índice combinado (todos os hubs) para resolução de metadados por slug. */
export const TODAS_CATEGORIAS: readonly Categoria[] = [
  ...CATEGORIAS_SUPORTE,
  REFERENCIA_MODELOS_OS,
  ...CATEGORIAS_CADASTRO,
  ...CATEGORIAS_INSTALACAO,
];
