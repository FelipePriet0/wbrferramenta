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

import { fraseDe } from '../catalogo/store';
import { FEEDBACK_MAN_EXTERNA } from '../catalogo/feedbackManExterna';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'feedback-man-externa';

const f = fraseDe(SLUG, FEEDBACK_MAN_EXTERNA);

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

  const base = { cliente: n, canal: r, contato: i, dataHora: a, energia: e, valorOS: s, formaPagFrase: fraseFormaPag(c) };

  const u = [
    f('feedbackRealizado', base),
    f('acessoNormalizado'),
    f('equipamentoLigado', base),
  ];
  if (o === 'sim') {
    u.push(f('osComCusto', base));
  } else {
    u.push(f('osSemCusto'));
  }
  u.push(f('semDuvida'));
  if (l) u.push(``, l);

  return { protocolo: '', os: u.join('\n') };
}
