export type PessoaTipo = 'PF' | 'PJ' | 'Rural';

export interface BasicInfoPF {
  nome: string;
  cpf: string;
}

export interface BasicInfoRural {
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
