// Bidirectional maps between UI strings (what users see) and the canonical
// enum/boolean values stored in the database. The `fromCanonical` direction
// is used when hydrating state from the server; `toCanonical` is called
// inside each Select's onChange before the value reaches the autosave queue.
//
// Whenever a select has a placeholder option (e.g. "XXXXX") that should not
// hit the DB, `toCanonical` returns `null` for it — the autosave layer is
// happy to persist null on nullable columns.

type Bimap = {
  toCanonical: (ui: string) => string | null;
  fromCanonical: (canon: string | null | undefined) => string;
  uiOptions: string[];
};

function makeBimap(pairs: [ui: string, canon: string | null][]): Bimap {
  const u2c = new Map<string, string | null>(pairs);
  const c2u = new Map<string | null, string>();
  for (const [ui, canon] of pairs) c2u.set(canon, ui);
  return {
    toCanonical: (ui) => (u2c.has(ui) ? u2c.get(ui)! : null),
    fromCanonical: (canon) => c2u.get(canon ?? null) ?? '',
    uiOptions: pairs.map(([ui]) => ui),
  };
}

// pf_tipo_moradia
export const TIPO_MORADIA = makeBimap([
  ['Própria', 'propria'],
  ['Alugada', 'alugada'],
  ['Cedida', 'cedida'],
  ['Outros', 'outros'],
]);

// pj_tipo_estabelecimento — same enum values as tipo_moradia, kept as a
// separate alias so callers stay readable.
export const TIPO_ESTABELECIMENTO = TIPO_MORADIA;

// pj_tipo_imovel
export const TIPO_IMOVEL = makeBimap([
  ['Comércio Térreo', 'comercio_terreo'],
  ['Comércio Sala', 'comercio_sala'],
  ['Casa', 'casa'],
]);

// pf_nas_outras — XXXXX is a UI placeholder, not a real value.
export const NAS_OUTRAS = makeBimap([
  ['XXXXX', null],
  ['Parentes', 'parentes'],
  ['Locador(a)', 'locador'],
  ['Só conhecidos', 'so_conhecidos'],
  ['Não conhece', 'nao_conhece'],
]);

// pf_tipo_comprovante — XXXXX is a UI placeholder, not a real value.
export const TIPO_COMPROVANTE = makeBimap([
  ['XXXXX', null],
  ['Energia', 'energia'],
  ['Agua', 'agua'],
  ['Internet', 'internet'],
  ['Outro', 'outro'],
]);

// pf_vinculo
export const VINCULO = makeBimap([
  ['Carteira Assinada', 'carteira_assinada'],
  ['Presta Serviços', 'presta_servicos'],
  ['Contrato de Trabalho', 'contrato_trabalho'],
  ['Autonômo', 'autonomo'],
  ['Concursado', 'concursado'],
  ['Outro', 'outro'],
]);

// pf_estado_civil
export const ESTADO_CIVIL = makeBimap([
  ['Solteiro(a)', 'solteiro'],
  ['Casado(a)', 'casado'],
  ['Amasiado(a)', 'amasiado'],
  ['Separado(a)', 'separado'],
  ['Viuvo(a)', 'viuvo'],
]);

// app_meio
export const MEIO = makeBimap([
  ['Ligação', 'ligacao'],
  ['Whatspp', 'whatsapp'],
  ['Presensicial', 'presencial'],
  ['Whats - Uber', 'whats_uber'],
]);

// Boolean fields stored as bool, surfaced as "Sim/Não" selects.
export const SIM_NAO_BOOL = {
  toCanonical: (ui: string): boolean | null =>
    ui === 'Sim' ? true : ui === 'Não' ? false : null,
  fromCanonical: (canon: boolean | null | undefined): string =>
    canon === true ? 'Sim' : canon === false ? 'Não' : '',
  uiOptions: ['Sim', 'Não'] as const,
};
