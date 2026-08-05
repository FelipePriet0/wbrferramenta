/**
 * Emulação do modelo `feedback-man-externa` — porte 1:1 da função `_Je` do
 * bundle legado (conteúdo de O.S do próprio app). Feedback de manutenção
 * externa: saída única de texto (`feedbackManExternalTexto`). Sem variável de
 * tipo de solicitação. O 2º argumento do builder legado é o
 * `operadorPrimeiroNome`, lido aqui de `valores.operadorPrimeiroNome` (não
 * usado no corpo deste modelo). Validado por diff contra o legado — ver
 * `feedbackManExterna.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

export function renderFeedbackManExterna(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = primeiroNome(maiusc(t.cliente)); // gJe(hJe(cliente))
  const r = t.canal || '';
  const i = soDigitos(t.contato);
  const a = t.dataHora || '';
  const o = t.osComCustos || 'nao';
  const s = t.valorOS || '';
  const c = t.formaPagamento || '';
  const e = t.energia || '';
  const l = t.obs?.trim() || '';

  const u = [
    `FIZ FEEDBACK COM ${n} POR ${r} (${i}) DIA ${a}.`,
    `CLIENTE CONFIRMOU ACESSO NORMALIZADO APÓS REPARO TÉCNICO REALIZADO.`,
    `EQUIPAMENTO LIGADO EM ${e}.`,
  ];
  if (o === 'sim') {
    u.push(`O.S TEVE O CUSTO DE R$${s} PAGO ${fraseFormaPag(c)}.`);
  } else {
    u.push(`O.S SEM CUSTO.`);
  }
  u.push(`CLIENTE SEM DÚVIDA.`);
  if (l) u.push(``, l);

  return { protocolo: '', os: u.join('\n') };
}
