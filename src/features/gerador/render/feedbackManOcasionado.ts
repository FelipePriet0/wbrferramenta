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

  const f = [
    `FIZ FEEDBACK COM ${n} POR ${r} (${i}) DIA ${a}.`,
    `${n} CONFIRMOU ACESSO NORMALIZADO APÓS REPARO ${o} REALIZADO.`,
    `CLIENTE ORIENTADO A NÃO MANUSEAR EQUIPAMENTOS/FIBRA, POIS EM CASO DE DANO, É GERADO O VALOR DO REFERIDO EQUIPAMENTO/DESLOCAMENTO.`,
    `EQUIPAMENTO LIGADO EM ${s}.`,
  ];
  if (c === 'sim') f.push(`O.S COM CUSTO DE R$${l} PAGO ${fraseFormaPag(u)}.`);
  else f.push(`O.S SEM CUSTO.`);
  f.push(`CLIENTE SEM DUVIDAS.`);
  if (d) f.push('', `OBS: ${d}`);

  return { protocolo: f.join('\n'), os: '' };
}
