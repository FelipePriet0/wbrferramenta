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

  const g = [
    `FIZ FEEDBACK COM ${n} POR ${r} (${i}) DIA ${a}.`,
    `CLIENTE CONFIRMOU MUDANÇA DE PONTO INTERNO, CONFIRMOU QUE NO LOCAL INSTALADO FICOU DE SEU AGRADO.`,
    `EQUIPAMENTO DESINSTALADO DE: ${o}`,
    `REINSTALADO EM: ${s}`,
    `CONFIRMOU QUE APÓS A TROCA FOI FEITO TODOS OS TESTES DE FUNCIONAMENTO DA INTERNET, TESTE DE ABRANGÊNCIA E AFERIÇÃO NOS APARELHOS DO TECNICO E EM SEUS PESSOAIS.`,
  ];
  if (c === 'sim') {
    g.push(`CLIENTE DISPENSOU OS TESTES EM SEUS DISPOSITIVOS PESSOAIS.`);
  } else {
    g.push(
      `APARELHO TESTADO: ${l} ${u} AFERIU ${d}MBPS. NOTEBOOK DO TÉCNICO VIA CABO DE REDE AFERIU ${f}MBPS E ${p}MBPS VIA WI-FI NA REDE 5G.`,
    );
  }
  g.push(
    `EQUIPAMENTO LIGADO EM ${e}.`,
    `O.S COM CUSTO DE R$ ${m} PAGO ${fraseFormaPag(h)}.`,
    `CLIENTE SEM DUVIDAS.`,
  );

  return { protocolo: '', os: g.join('\n') };
}
