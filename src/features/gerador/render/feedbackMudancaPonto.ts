/**
 * Emulação do modelo `feedback-mudanca-ponto` — porte 1:1 da função `UJe` do
 * bundle legado (conteúdo de O.S do próprio app). Feedback de mudança de ponto
 * interno: saída única de texto (`feedbackMudancaPontoTexto`). Sem variável de
 * tipo de solicitação. O 2º argumento do builder legado é o
 * `operadorPrimeiroNome`, lido aqui de `valores.operadorPrimeiroNome` (não
 * usado no corpo deste modelo). Validado por diff contra o legado — ver
 * `feedbackMudancaPonto.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { FEEDBACK_MUDANCA_PONTO } from '../catalogo/feedbackMudancaPonto';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'feedback-mudanca-ponto';

const frase = fraseDe(SLUG, FEEDBACK_MUDANCA_PONTO);

export function renderFeedbackMudancaPonto(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = primeiroNome(maiusc(t.cliente)); // HJe(FM(cliente))
  const r = t.canal || '';
  const i = soDigitos(t.contato);
  const a = t.dataHora || '';
  const o = maiusc(t.comodoAnterior);
  const s = maiusc(t.comodoAtual);
  const c = t.dispensouTestes || 'nao';
  const l = maiusc(t.aparelho);
  const u = maiusc(t.marcaModelo);
  const d = t.velocidadeCliente || '';
  const f = t.velocidadeCabo || '';
  const p = t.velocidadeWifi || '';
  const m = t.valorOS || '';
  const h = t.formaPagamento || '';
  const e = t.energia || '';

  const base = { cliente: n, canal: r, contato: i, dataHora: a, comodoAnterior: o, comodoAtual: s, aparelho: l, marcaModelo: u, velocidadeCliente: d, velocidadeCabo: f, velocidadeWifi: p, valorOS: m, formaPagFrase: fraseFormaPag(h), energia: e };

  const g = [
    frase('feedbackRealizado', base),
    frase('confirmouMudanca'),
    frase('desinstaladoDe', base),
    frase('reinstaladoEm', base),
    frase('testesRealizados'),
  ];
  if (c === 'sim') {
    g.push(frase('dispensouTestes'));
  } else {
    g.push(
      frase('aparelhoTestado', base),
    );
  }
  g.push(
    frase('equipamentoLigado', base),
    frase('osComCusto', base),
    frase('semDuvidas'),
  );

  return { protocolo: '', os: g.join('\n') };
}
