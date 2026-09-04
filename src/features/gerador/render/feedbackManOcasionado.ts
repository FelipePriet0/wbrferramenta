/**
 * Emulação do modelo `feedback-man-ocasionado` — porte 1:1 da função `EJe` do
 * bundle legado (conteúdo de O.S do próprio app). Feedback pós-manutenção
 * ocasionada: texto único (sem visita/agenda), por isso o texto vai em
 * `protocolo` e `os` fica vazio. NÃO tem variável `tipoSolicitacao`. O 2º
 * argumento do builder legado é o `operadorPrimeiroNome` (lido de
 * `valores.operadorPrimeiroNome`, embora `EJe` não o utilize). Validado por diff
 * contra o legado — ver `feedbackManOcasionado.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { FEEDBACK_MAN_OCASIONADO } from '../catalogo/feedbackManOcasionado';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'feedback-man-ocasionado';

const frase = fraseDe(SLUG, FEEDBACK_MAN_OCASIONADO);

export function renderFeedbackManOcasionado(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = primeiroNome(maiusc(t.cliente));
  const r = t.canal || '';
  const i = soDigitos(t.contato);
  const a = t.dataHora || '';
  const o = t.reparoLocal || 'INTERNO';
  const s = t.energia || '';
  const c = t.osComCustos || 'nao';
  const l = t.valorOS || '';
  const u = t.formaPagamento || '';
  const d = t.obs?.trim() || '';

  const base = { cliente: n, canal: r, contato: i, dataHora: a, reparoLocal: o, energia: s, valorOS: l, formaPagFrase: fraseFormaPag(u), obs: d };

  const f = [
    frase('feedbackRealizado', base),
    frase('acessoNormalizado', base),
    frase('orientacaoNaoManusear'),
    frase('equipamentoLigado', base),
  ];
  if (c === 'sim') f.push(frase('osComCusto', base));
  else f.push(frase('osSemCusto'));
  f.push(frase('semDuvidas'));
  if (d) f.push('', frase('observacao', base));

  return { protocolo: f.join('\n'), os: '' };
}
