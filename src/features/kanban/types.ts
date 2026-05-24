import type { KanbanArea } from '@/lib/types';

export type KanbanStage =
  | 'entrada'
  | 'feitas'
  | 'aguardando'
  | 'canceladas'
  | 'concluidas'
  | 'recebidos'
  | 'preenchidas'
  | 'em_analise'
  | 'reanalise'
  | 'aprovados'
  | 'negados'
  | 'finalizados';

export interface KanbanCard {
  id: string;
  applicantId?: string;
  applicantName: string;
  cpfCnpj: string;
  phone?: string;
  whatsapp?: string;
  bairro?: string;
  dueAt?: string;
  horaAt?: string;
  periodo?: 'manha' | 'tarde';
  finalizedAt?: string;
  archivedAt?: string;
  area?: KanbanArea;
  stage?: string;
  assigneeId?: string;
  vendorId?: string;
  onOpen?: () => void;
  onMove?: () => void;
  extraAction?: React.ReactNode;
  isMentioned?: boolean;
  hasLabelPreenchida?: boolean;
  hasLabelUrgente?: boolean;
  hasLabelCancelada?: boolean;
  labels?: { id: string; name: string; color: string }[];
}
