/**
 * Emulação do modelo `feedback-troca-equip` — porte 1:1 da função `PJe` do
 * bundle legado (conteúdo de O.S do próprio app). Feedback pós-visita de troca
 * de equipamento emprestado: saída única de texto (`feedbackTrocaEquipTexto`).
 * Sem variável de tipo de solicitação. O 2º argumento do builder legado é o
 * `operadorPrimeiroNome`, lido aqui de `valores.operadorPrimeiroNome` (não usado
 * no corpo deste modelo). Validado por diff contra o legado — ver
 * `feedbackTrocaEquip.diff.test.ts`.
 */
import { maiusc, primeiroNome, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { FEEDBACK_TROCA_EQUIP } from '../catalogo/feedbackTrocaEquip';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'feedback-troca-equip';

const frase = fraseDe(SLUG, FEEDBACK_TROCA_EQUIP);

export function renderFeedbackTrocaEquip(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = primeiroNome(maiusc(t.cliente));
  const r = t.canal || '';
  const i = t.contato.replace(/\D/g, '');
  const a = t.dataHora || '';
  const o = t.tipoEquipRemovido || 'ONU';
  const s = maiusc(t.equipamentoRemovido);
  const c = t.tipoEquipInstalado || 'ONU';
  const l = maiusc(t.equipamentoInstalado);
  const u = t.velocidadeCabo || '';
  const d = t.velocidadeWifi || '';
  const f = `${o} ${s}`;
  const p = `${c} ${l}`;

  const base = { cliente: n, canal: r, contato: i, dataHora: a, equipRemovido: f, equipInstalado: p, velocidadeCabo: u, velocidadeWifi: d };

  const texto = [
    // Correção vs. legado: o builder PJe tinha "ÁS HRS" solto (hora faltando) —
    // como `dataHora` é datetime (data+hora), o texto certo é "DIA <data e hora>.".
    frase('feedbackRealizado', base),
    frase('motivoVisita'),
    frase('confirmouTroca'),
    frase('desinstalado', base),
    frase('instalado', base),
    frase('testesRealizados'),
    frase('aferricaoNotebook', base),
    frase('tomadaIndividual'),
    frase('osSemCusto'),
  ].join('\n');

  return { protocolo: '', os: texto };
}
