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

  const linhaEnergia = energia === 'TOMADA' ? `${o} LIGADO NA TOMADA (${energiaDetalhe}).` : `${o} LIGADO NA TV.`;
  const formaCompra = parcelas ? `PARCELADO EM ${maiusc(parcelas)}` : 'À VISTA';

  const p = [
    `FIZ FEEDBACK COM ${n} POR ${r} (${i}) DIA ${a}.`,
    `${n} CONFIRMOU INSTALAÇÃO E CONFIGURAÇÃO DO APARELHO ${o}.`,
    `APARELHO CONECTADO VIA ${s}.`,
    linhaEnergia,
  ];
  if (l === 'sim') {
    p.push(`APP MZTV INSTALADO E CONFIGURADO NO APARELHO ${o}.`);
  }
  p.push(
    `O.S DE INSTALAÇÃO ISENTA. ${o} ADQUIRIDO POR ${valorAparelho} ${formaCompra}, PAGO ${fraseFormaPag(d)}.`,
    `CLIENTE SEM DUVIDAS`,
  );
  if (f) p.push(``, `OBS: ${f}`);

  return { protocolo: '', os: p.join('\n') };
}
