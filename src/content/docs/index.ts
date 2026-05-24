export type DocEntry = {
  slug: string;
  file: string;
  title: string;
  phase: string;
};

export const DOC_NAV: DocEntry[] = [
  // ── Contexto ──────────────────────────────────────────────
  { slug: 'perfis-de-acesso',      file: '01-perfis-de-acesso',      title: 'Perfis de acesso',       phase: 'Contexto' },

  // ── Interface principal ───────────────────────────────────
  { slug: 'kanban-comercial',      file: '02-kanban-comercial',      title: 'Kanban Comercial',        phase: 'Interface principal' },
  { slug: 'kanban-analise',        file: '03-kanban-analise',        title: 'Kanban Análise',          phase: 'Interface principal' },
  { slug: 'cards',                 file: '04-cards',                 title: 'Cards',                   phase: 'Interface principal' },

  // ── Ações sobre cards ─────────────────────────────────────
  { slug: 'etiquetas',             file: '05-etiquetas',             title: 'Etiquetas',               phase: 'Ações sobre cards' },
  { slug: 'mover-card',            file: '06-mover-card',            title: 'Mover card',              phase: 'Ações sobre cards' },
  { slug: 'transferir',            file: '07-transferir',            title: 'Transferir',              phase: 'Ações sobre cards' },
  { slug: 'cancelar-card',         file: '08-cancelar-card',         title: 'Cancelar card',           phase: 'Ações sobre cards' },
  { slug: 'reverter-cancelamento', file: '09-reverter-cancelamento', title: 'Reverter cancelamento',   phase: 'Ações sobre cards' },

  // ── Fichas ────────────────────────────────────────────────
  { slug: 'nova-ficha',            file: '10-nova-ficha',            title: 'Nova ficha',              phase: 'Fichas' },
  { slug: 'ficha-pf',              file: '11-ficha-pf',              title: 'Ficha PF',                phase: 'Fichas' },
  { slug: 'ficha-pj',              file: '12-ficha-pj',              title: 'Ficha PJ',                phase: 'Fichas' },

  // ── Features do formulário ────────────────────────────────
  { slug: 'auto-save',             file: '13-auto-save',             title: 'Auto-save',               phase: 'Formulário' },
  { slug: 'zoom',                  file: '14-zoom',                  title: 'Zoom',                    phase: 'Formulário' },
  { slug: 'undo-redo',             file: '15-undo-redo',             title: 'Undo / Redo',             phase: 'Formulário' },
  { slug: 'historico-do-campo',    file: '16-historico-do-campo',    title: 'Histórico do campo',      phase: 'Formulário' },

  // ── Decisão e análise ─────────────────────────────────────
  { slug: 'parecer',               file: '17-parecer',               title: 'Parecer',                 phase: 'Decisão e análise' },

  // ── Buscando fichas ───────────────────────────────────────
  { slug: 'filtros',               file: '18-filtros',               title: 'Filtros',                 phase: 'Busca' },
  { slug: 'historico',             file: '19-historico',             title: 'Histórico',               phase: 'Busca' },
];
