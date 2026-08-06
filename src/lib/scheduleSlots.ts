// Slots de horário de visita técnica + regra de "que dia mostra o quê".
//
// Versão WBR (enxuta): sem o motor de rota/grade da agenda do toolmznet — aqui
// os slots alimentam apenas o texto de agendamento do gerador de O.S.
//
// Aos SÁBADOS existe o horário fixo "Após as 11" — armazenado como o slot
// '11:00'. Ele SUBSTITUI os slots de tarde (13/15/17): sábado tem só
// 08 / 10 / Após as 11. Nos demais dias, os 5 slots de sempre.

export const APOS_11 = '11:00';

export const WEEKDAY_TIME_SLOTS = ['08:00', '10:00', '13:00', '15:00', '17:00'] as const;
export const SATURDAY_TIME_SLOTS = ['08:00', '10:00', APOS_11] as const;

// Só os rótulos que diferem do próprio valor.
export const TIME_SLOT_LABELS: Record<string, string> = { [APOS_11]: 'Após as 11' };

/** Rótulo de exibição de um slot ('11:00' → 'Após as 11', resto → ele mesmo). */
export function timeSlotLabel(slot: string | null | undefined): string {
  if (!slot) return '';
  const s5 = slot.slice(0, 5);
  return TIME_SLOT_LABELS[s5] ?? s5;
}

/**
 * 'YYYY-MM-DD' (data-only, calendário local) → é sábado?
 * Constrói a Date com componentes explícitos de propósito: `new Date('YYYY-MM-DD')`
 * é interpretado como meia-noite UTC e poderia "voltar um dia" no nosso fuso.
 */
export function isSaturdayISO(dateISO: string | null | undefined): boolean {
  if (!dateISO) return false;
  const [y, m, d] = dateISO.split('-').map(Number);
  if (!y || !m || !d) return false;
  return new Date(y, m - 1, d).getDay() === 6; // 0=domingo … 6=sábado
}

/** Slots de horário válidos para a data (sábado = 08/10/Após-11; resto = 5 slots). */
export function timeSlotsForDate(dateISO: string | null | undefined): readonly string[] {
  return isSaturdayISO(dateISO) ? SATURDAY_TIME_SLOTS : WEEKDAY_TIME_SLOTS;
}

export const WEEKDAY_PERIODOS = ['manha', 'tarde'] as const;
export const SATURDAY_PERIODOS = ['manha'] as const; // sábado não tem tarde (vira Após-11)

/** Períodos oferecidos para a data (sábado = só Manhã; resto = Manhã + Tarde). */
export function periodosForDate(dateISO: string | null | undefined): readonly string[] {
  return isSaturdayISO(dateISO) ? SATURDAY_PERIODOS : WEEKDAY_PERIODOS;
}
