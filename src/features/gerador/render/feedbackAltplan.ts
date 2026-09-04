/**
 * Emulação do modelo `feedback-altplan` — porte 1:1 da função `ZJe` do bundle
 * legado (conteúdo de O.S do próprio app). Feedback de alteração de plano:
 * saída única de texto (`feedbackAltplanTexto`). Sem variável de tipo de
 * solicitação. O 2º argumento do builder legado é o `operadorPrimeiroNome`,
 * lido aqui de `valores.operadorPrimeiroNome` (não usado no corpo deste
 * modelo). Validado por diff contra o legado — ver `feedbackAltplan.diff.test.ts`.
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { FEEDBACK_ALTPLAN } from '../catalogo/feedbackAltplan';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'feedback-altplan';

const frase = fraseDe(SLUG, FEEDBACK_ALTPLAN);

export function renderFeedbackAltplan(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = primeiroNome(maiusc(t.cliente)); // XJe(BM(cliente))
  const r = t.canal || '';
  const i = soDigitos(t.contato);
  const a = t.dataHora || '';
  const o = maiusc(t.plano); // BM(plano)
  const s = t.trocaRoteador || 'nao';
  const c = maiusc(t.modeloRoteador); // BM(modeloRoteador)
  const l = t.dispensouTestes || 'nao';
  const u = t.possuiEquipamento || 'sim';
  const d = maiusc(t.aparelho); // BM(aparelho)
  const f = maiusc(t.marcaModelo); // BM(marcaModelo)
  const p = t.velocidade || '';
  const m = t.wifiCabo || '';
  const h = t.caboTec || '';
  const g = t.wifiTec || '';
  const energia = t.energia || '';
  const v = energia === 'OUTRO' ? maiusc(t.energiaOutro) : energia;
  const y = t.osComCustos || 'nao';
  const b = t.valorOS || '';
  const x = t.obs?.trim() || '';

  const base = { cliente: n, canal: r, contato: i, dataHora: a, plano: o, modeloRoteador: c, aparelho: d, marcaModelo: f, velocidade: p, wifiCabo: m, caboTec: h, wifiTec: g, energia: v, valorOS: b, obs: x };

  const S = [frase('feedbackRealizado', base)];

  if (s === 'sim') {
    S.push(frase('confirmouComTroca', base));
  } else {
    S.push(frase('confirmouSemTroca', base));
  }

  S.push(
    frase('testesRealizados', base),
  );

  if (l === 'sim') {
    S.push(frase('dispensouTestes', base));
  } else {
    if (u === 'sim') {
      S.push(frase('possuiEquipamento', base));
    } else {
      S.push(frase('naoPossuiEquipamento', base));
    }
    S.push(
      frase('aferricaoNotebook', base),
    );
  }

  S.push(frase('equipamentosInstalados', base));

  if (y === 'sim') {
    S.push(frase('osComCusto', base));
  } else {
    S.push(frase('osSemCusto'));
  }

  S.push(frase('semDuvidas'));

  if (x) S.push(frase('observacao', base));

  return { protocolo: '', os: S.join('\n') };
}
