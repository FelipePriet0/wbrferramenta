export type PessoaTipo = 'PF' | 'PJ';

export interface BasicInfoPF {
  nome: string;
  cpf: string;
}

export interface BasicInfoPJ {
  razaoSocial: string;
  fantasia?: string;
}

export interface CriarFichaResult {
  applicantId: string;
  fichaId: string;
  cardId: string;
}
