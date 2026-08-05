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

  const S = [`FIZ FEEDBACK COM ${n} POR ${r} (${i}) DIA ${a}.`];

  if (s === 'sim') {
    S.push(`${n} CONFIRMOU A TROCA DO ROTEADOR E CONFIRMOU A ALTERAÇÃO DO PLANO PARA: ${o}.`);
  } else {
    S.push(`${n} CONFIRMOU A ALTERAÇÃO DO PLANO PARA: ${o}. ROTEADOR INSTALADO: ${c}.`);
  }

  S.push(
    `${n} CONFIRMOU QUE FORAM REALIZADOS TESTES DE AFERIÇÃO DA VELOCIDADE, ORIENTAÇÃO DE COBERTURA WI-FI E REDE 2.4G E 5.8G.`,
  );

  if (l === 'sim') {
    S.push(`${n} DISPENSOU OS TESTES EM SEUS DISPOSITIVOS PESSOAIS.`);
  } else {
    if (u === 'sim') {
      S.push(`${n} POSSUI EQUIPAMENTO QUE AFERE A BANDA (${d} ${f} AFERIU ${p}MB VIA ${m}).`);
    } else {
      S.push(`${n} NÃO POSSUI APARELHO COMPATÍVEL COM A VELOCIDADE CONTRATADA (${d} ${f} AFERIU ${p}MB VIA ${m}).`);
    }
    S.push(
      `NOTEBOOK DO TÉCNICO VIA CABO DE REDE AFERIU ${h}MEGA E ${g}MEGA VIA WI-FI CONECTADO NA REDE 5G.`,
    );
  }

  S.push(`EQUIPAMENTOS INSTALADOS: ${v}.`);

  if (y === 'sim') {
    S.push(`O.S COM O CUSTO DE R$${b}`);
  } else {
    S.push(`O.S. SEM CUSTOS.`);
  }

  S.push(`CLIENTE SEM DUVIDAS.`);

  if (x) S.push(`OBS: ${x}`);

  return { protocolo: '', os: S.join('\n') };
}
