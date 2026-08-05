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

  const texto = [
    // Correção vs. legado: o builder PJe tinha "ÁS HRS" solto (hora faltando) —
    // como `dataHora` é datetime (data+hora), o texto certo é "DIA <data e hora>.".
    `FIZ FEEDBACK COM ${n} POR ${r} (${i}) DIA ${a}.`,
    `VISITA REALIZADA REFERENTE A UM PROBLEMA NO EQUIPAMENTO EMPRESTADO. FOI EFETUADA A TROCA DO EQUIPAMENTO E O ACESSO FOI RESTABELECIDO.`,
    `CLIENTE CONFIRMOU A TROCA DO EQUIPAMENTO.`,
    `DESINSTALADO: ${f}`,
    `INSTALADO: ${p}`,
    `CLIENTE CONFIRMOU QUE FOI REALIZADO TESTES DE AFERIÇÃO DA VELOCIDADE E REDE 2.4G E 5G.`,
    `NOTEBOOK DO TÉCNICO VIA CABO DE REDE AFERIU ${u}MEGA. VIA WI-FI CONECTADO NA REDE 5G AFERIU ${d}MEGA.`,
    `EQUIPAMENTOS INSTALADOS EM TOMADA INDIVIDUAL.`,
    `O.S. SEM CUSTOS.`,
  ].join('\n');

  return { protocolo: '', os: texto };
}
