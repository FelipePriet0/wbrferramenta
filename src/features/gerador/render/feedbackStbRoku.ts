/**
 * Emulação do modelo `feedback-stb-roku` — porte 1:1 da função `cYe` do bundle
 * legado (conteúdo de O.S do próprio app). Feedback pós-instalação de aparelho
 * de streaming (STB/Roku): saída única de texto (`feedbackStbRokuTexto`). Sem
 * variável de tipo de solicitação. O 2º argumento do builder legado é o
 * `operadorPrimeiroNome`, lido aqui de `valores.operadorPrimeiroNome` (não usado
 * no corpo deste modelo). Validado por diff contra o legado — ver
 * `feedbackStbRoku.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { FEEDBACK_STB_ROKU } from '../catalogo/feedbackStbRoku';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'feedback-stb-roku';

const frase = fraseDe(SLUG, FEEDBACK_STB_ROKU);

export function renderFeedbackStbRoku(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = primeiroNome(maiusc(t.cliente)); // sYe(oYe(cliente))
  const r = t.canal || '';
  const i = soDigitos(t.contato);
  const a = t.dataHora || '';
  const o = t.stbRoku || 'STB';
  const s = t.wifiCabo || '';
  const energia = t.energia || '';
  const energiaDetalhe = t.energiaDetalhe || '';
  const l = t.appMztv || 'nao';
  const valorAparelho = o === 'ROKU' ? t.valorAparelhoRoku || '' : t.valorAparelhoStb || '';
  const parcelas = t.parcelas || '';
  const d = t.formaPagamento || '';
  const f = t.obs?.trim() || '';

  const base = { cliente: n, canal: r, contato: i, dataHora: a, aparelho: o, wifiCabo: s, energiaDetalhe, valorAparelho, parcelas: maiusc(parcelas), formaPagFrase: fraseFormaPag(d), obs: f };

  const linhaEnergia = energia === 'TOMADA' ? frase('ligadoNaTomada', base) : frase('ligadoNaTv', base);
  const formaCompra = parcelas ? frase('parcelado', base) : frase('aVista');

  const p = [
    frase('feedbackRealizado', base),
    frase('confirmouInstalacao', base),
    frase('conexaoAparelho', base),
    linhaEnergia,
  ];
  if (l === 'sim') {
    p.push(frase('appInstalado', base));
  }
  p.push(
    frase('compraEIsencao', { ...base, formaCompra }),
    frase('semDuvidas'),
  );
  if (f) p.push(``, frase('observacao', base));

  return { protocolo: '', os: p.join('\n') };
}
