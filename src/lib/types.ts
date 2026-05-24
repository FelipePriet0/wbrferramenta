export type UserRole = 'vendedor' | 'analista' | 'gestor' | 'instalador' | 'leitor';

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
};

export type PersonType = 'PF' | 'PJ';

export type KanbanArea = 'comercial' | 'analise';

export type KanbanDecisionStatus = 'aprovado' | 'negado' | 'reanalise';

export type AppMeio = 'ligacao' | 'whatsapp' | 'presencial' | 'whats_uber';
