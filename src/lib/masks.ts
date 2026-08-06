// Shared input masks for Brazilian-format fields (CPF, CNPJ, phone, date).
// All formatters are "progressive": you can feed them partial digits while
// the user types and they return what fits the pattern so far. They strip
// non-digits first so paste-from-anywhere also works.

export function digitsOnly(s?: string | null): string {
  return (s ?? '').replace(/\D+/g, '');
}

// 999.999.999-99 (CPF, 11 dígitos).
export function formatCpf(input: string): string {
  const d = digitsOnly(input).slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  let out = p1;
  if (p2) out += '.' + p2;
  if (p3) out += '.' + p3;
  if (p4) out += '-' + p4;
  return out;
}

// 99.999.999/9999-99 (CNPJ, 14 dígitos).
export function formatCnpj(input: string): string {
  const d = digitsOnly(input).slice(0, 14);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 8);
  const p4 = d.slice(8, 12);
  const p5 = d.slice(12, 14);
  let out = p1;
  if (p2) out += '.' + p2;
  if (p3) out += '.' + p3;
  if (p4) out += '/' + p4;
  if (p5) out += '-' + p5;
  return out;
}

// (99) 9999-9999  or  (99) 99999-9999 — handles both fixed and mobile.
export function formatPhoneBR(input: string): string {
  const d = digitsOnly(input).slice(0, 11);
  const len = d.length;
  const ddd = d.slice(0, 2);
  if (len <= 2) return d;
  if (len <= 6) return `(${ddd}) ${d.slice(2)}`;
  if (len <= 10) return `(${ddd}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${ddd}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// DD/MM/AAAA (8 dígitos).
export function formatDateBR(input: string): string {
  const d = digitsOnly(input).slice(0, 8);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 4);
  const p3 = d.slice(4, 8);
  let out = p1;
  if (p2) out += '/' + p2;
  if (p3) out += '/' + p3;
  return out;
}

/** Máscara de endereço MAC: AA:BB:CC:DD:EE:FF (aceita colagem suja). */
export function formatMacAddress(input: string): string {
  const hex = (input ?? '').toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 12);
  return hex.match(/.{1,2}/g)?.join(':') ?? '';
}

/** Máscara de CEP: 00000-000. */
export function formatCep(input: string): string {
  const d = digitsOnly(input).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}
