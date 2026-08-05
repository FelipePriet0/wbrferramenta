/**
 * Helpers puros de emulação — portados 1:1 das funções do bundle legado
 * (rO, iO, aO, oO, oVe, VD, lVe). Nomes legíveis; comportamento idêntico.
 * Ver `docs/gerador/sondagem2-suporte.md`.
 */

export type Valores = Record<string, string>;

/** MAIÚSCULO + trim. (legado: rO) */
export function maiusc(v: unknown): string {
  return String(v ?? '').trim().toUpperCase();
}

/** Só dígitos. (legado: iO) */
export function soDigitos(v: unknown): string {
  return String(v ?? '').replace(/\D/g, '');
}

/**
 * Regência correta da forma de pagamento em CAIXA-ALTA: cartão → "NO CARTÃO",
 * dinheiro → "EM DINHEIRO", pix → "VIA PIX". Aceita valores com/sem acento
 * ('Cartao'/'CARTÃO'). Fallback: "NO ${forma}". Usar no lugar de preposição fixa.
 */
export function fraseFormaPag(forma: unknown): string {
  const f = maiusc(forma);
  if (f.startsWith('CART')) return 'NO CARTÃO';
  if (f.startsWith('DINHEIRO')) return 'EM DINHEIRO';
  if (f.startsWith('PIX')) return 'VIA PIX';
  return f ? `NO ${f}` : '';
}

/**
 * Explicação dos TERMOS do custo para serviços que dependem de reaproveitar o
 * cabo drop (mudança de ponto interno, remanejamento e dano ocasionado em
 * fibra). O motivo do valor: R$50 quando dá pra reusar o mesmo drop; R$100
 * quando o drop não tem sobra e precisa ser substituído (inclui peças). Texto
 * acordado com a operação (CAIXA-ALTA sem acento, padrão da casa).
 *
 * Retorna as sentenças de EXPLICAÇÃO já terminadas em ponto (sem a linha de
 * formas de pagamento nem a frase de quem paga — cada modelo acrescenta essas
 * conforme seu template). Valor vazio → '' (mantém a fidelidade das fixtures).
 */
export function nucleoCustoDrop(valor: unknown): string {
  const v = maiusc(valor);
  if (!v) return '';
  if (v === 'R$50 OU R$100') {
    return (
      'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVICO E DE R$50,00. ' +
      'EXPLIQUEI TAMBEM QUE CASO DROP (CABO/FIBRA) NAO TENHA SOBRA E FOR NECESSARIO SER SUBSTITUIDO POR OUTRO, O CUSTO PASSA A SER DE R$100,00 (INCLUI PECAS E SERVICOS).'
    );
  }
  if (v === 'R$100,00' || v === 'R$100') {
    return 'EXPLIQUEI QUE, POR SER NECESSARIO SUBSTITUIR O DROP (CABO/FIBRA) POR OUTRO, O CUSTO DO SERVICO E DE R$100,00 (INCLUI PECAS E SERVICOS).';
  }
  return `EXPLIQUEI QUE, APROVEITANDO O MESMO DROP (CABO/FIBRA), O CUSTO DO SERVICO E DE ${v}.`;
}

/** Primeiro nome (primeira palavra). (legado: aO) */
export function primeiroNome(v: unknown): string {
  return String(v ?? '').split(/\s+/).filter(Boolean)[0] ?? '';
}

/** Quebra "dd/mm/aaaa hh:mm" em [data, hora]. (legado: oO) */
export function parteData(v: unknown): [string, string] {
  const t = String(v ?? '').trim().split(/\s+/);
  return [t[0] ?? '', t[1] ?? ''];
}

/** Normaliza a medida do sinal: dígitos, 4 casas, ponto decimal. (legado: oVe) */
export function normalizaSinal(v: unknown): string {
  const t = String(v ?? '').replace(/\D/g, '').slice(0, 4);
  return t.length <= 2 ? t : `${t.slice(0, t.length - 2)}.${t.slice(t.length - 2)}`;
}

/** Sinal formatado como "-12.34DBM" (ou vazio). (legado: VD) */
export function sinalDbm(v: unknown): string {
  const t = normalizaSinal(v);
  return t ? `-${t}DBM` : '';
}

/**
 * Descreve o sinal na ONU: "SEM SINAL" quando marcado sem sinal ou sem medida,
 * senão a medida em DBM. (legado: lVe)
 */
export function descreveSinal(v: Valores): string {
  const dbm = sinalDbm(v.sinalONU);
  return String(v.semSinal ?? '') === 'sim' || !dbm ? 'SEM SINAL' : dbm;
}

/** Junta linhas com quebra. */
export function linhas(...partes: string[]): string {
  return partes.join('\n');
}

/**
 * Data e hora atuais (do momento em que o texto é gerado/copiado), formatadas
 * como "DD/MM/AAAA" e "HH:MM". Usado pelo bloco de encerramento de modelos
 * remotos — o horário de encerramento é sempre "agora", não um campo do
 * formulário.
 */
export function agoraDataHora(): [string, string] {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const data = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  const hora = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return [data, hora]
}
