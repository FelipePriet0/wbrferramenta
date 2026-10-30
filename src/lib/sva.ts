// "XXXXX" era o "sem SVA" do select de escolha única; na lista ele não existe.
const SVA_PLACEHOLDER = 'XXXXX';

// sva_avulso virou text[] em 30/10/2026; cache, realtime e undo ainda podem
// trazer a string antiga.
export function toSvaList(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  return list.filter((v): v is string => typeof v === 'string' && v.trim() !== '' && v !== SVA_PLACEHOLDER);
}

// field_audit_log grava colunas text[] como JSON ('["A", "B"]').
export function formatAuditValue(value: string | null): string | null {
  if (!value || !value.startsWith('[')) return value;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(' + ') : value;
  } catch {
    return value;
  }
}
