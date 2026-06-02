export type UserRole = 'vendedor' | 'analista' | 'gestor' | 'instalador' | 'leitor';

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
};

export type PersonType = 'PF' | 'PJ' | 'Rural';

/** URL segment for each person type (used to build /ficha/<seg>/<id> routes). */
export const PERSON_TYPE_SEGMENT: Record<PersonType, string> = {
  PF: 'pf',
  PJ: 'pj',
  Rural: 'rural',
};

export type KanbanArea = 'comercial' | 'analise';

export type KanbanDecisionStatus = 'aprovado' | 'negado' | 'reanalise';

export type AppMeio = 'ligacao' | 'whatsapp' | 'presencial' | 'whats_uber';
