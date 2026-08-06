/**
 * Máscara do sinal da fibra: formata os dígitos como `00.00` e PRESERVA o "-"
 * inicial se o operador digitar (o sinal é negativo, mas quem coloca o "-" é o
 * usuário — não é automático). Ex.: "-1234" -> "-12.34"; "1234" -> "12.34".
 *
 * (Divergência consciente do gerador-os original, que forçava o "-": aqui o
 * operador tem liberdade de digitar o sinal.)
 */
export function formatSinalFibraMask(raw: string): string {
  const s = String(raw ?? '')
  const neg = s.trimStart().startsWith('-') ? '-' : ''
  const digits = s.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return neg + digits
  return `${neg}${digits.slice(0, digits.length - 2)}.${digits.slice(digits.length - 2)}`
}

/**
 * Saída do sinal para o texto da O.S.: `<valor digitado>DBM`.
 * NÃO adiciona "-" — usa exatamente o que o operador colocou (com ou sem sinal).
 * Retorna string vazia quando não há valor numérico.
 */
export function formatSinalFibraSaida(raw: string): string {
  const masked = formatSinalFibraMask(raw)
  return masked && masked !== '-' ? `${masked}DBM` : ''
}
