/**
 * Emulação do modelo `feedback-wifi-extend` — porte da função `CYe` do bundle
 * legado (conteúdo de O.S do próprio app), com os ajustes pedidos pelo time de
 * suporte: sem a distinção "equipamento novo/do cliente" (o que importa é o
 * aparelho do CLIENTE usado na aferição), e um bloco fixo de "PONTO PRINCIPAL"
 * separado dos roteadores Wi-Fi Extend — antes só existia "ROTEADOR N"
 * genérico e, com 2 roteadores selecionados, o texto dava a entender que
 * eram 2 Extends (quando na verdade 1 é o ponto principal já instalado).
 * Feedback pós-visita de instalação de roteadores Wi-Fi Extend: saída única de
 * texto (`feedbackWifiExtendTexto`), com o bloco do principal + um bloco
 * repetido por Extend instalado. Sem variável de tipo de solicitação. O 2º
 * argumento do builder legado é o `operadorPrimeiroNome`, lido aqui de
 * `valores.operadorPrimeiroNome` (não usado no corpo deste modelo).
 * Validado por diff test — ver `feedbackWifiExtend.diff.test.ts`.
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { FEEDBACK_WIFI_EXTEND } from '../catalogo/feedbackWifiExtend';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'feedback-wifi-extend';

const frase = fraseDe(SLUG, FEEDBACK_WIFI_EXTEND);

/** Bloco descritivo de um roteador (ponto principal ou Wi-Fi Extend). */
function blocoRoteador(sufixo: string, titulo: string, t: Valores, nome: string, dispensouTestes: boolean): string {
  const local = maiusc(t[`local${sufixo}`]);
  const modelo = maiusc(t[`roteador${sufixo}`]);
  const mac = maiusc(t[`mac${sufixo}`]);
  const tecCabo = t[`tecCabo${sufixo}`] || '';
  const tecWifi = t[`tecWifi${sufixo}`] || '';
  const energia = maiusc(t[`energia${sufixo}`]);
  const linhasCliente = dispensouTestes
    ? [`${nome} DISPENSOU OS TESTES EM SEUS DISPOSITIVOS PESSOAIS.`]
    : [
        `EQUIPAMENTO DO CLIENTE (AFERIÇÃO): ${maiusc(t[`equipCliente${sufixo}`])}`,
        `CLIENTE AFERIU: ${t[`veloCliente${sufixo}`] || ''}MBPS VIA ${t[`conectCliente${sufixo}`] || ''}`,
      ]
  return [
    `--- ${titulo} ---`,
    `LOCAL: ${local}`,
    `MODELO: ${modelo}`,
    `MAC: ${mac}`,
    `NOTEBOOK DO TÉC. AFERIU: ${tecCabo}MEGA (CABO) | ${tecWifi}MEGA (WI-FI 5G)`,
    ...linhasCliente,
    `LIGADO EM: ${energia}`,
  ].join('\n')
}

export function renderFeedbackWifiExtend(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = primeiroNome(maiusc(t.cliente));
  const r = t.canal || '';
  const i = soDigitos(t.contato);
  const a = t.dataHora || '';
  const o = maiusc(t.plano);
  const s = parseInt(t.qtdRoteadores || '1', 10);
  const c = t.wifiCabo || '';
  const l = t.dispensouTestes || 'nao';
  const u = t.obs?.trim() || '';
  const d = s === 1 ? 'ROTEADOR' : 'ROTEADORES';

  const base = { cliente: n, canal: r, contato: i, dataHora: a, plano: o, qtd: String(s), palavraRoteador: d, wifiCabo: c, obs: u };

  const f = [
    frase('feedbackRealizado', base),
    frase('confirmouInstalacao', base),
    frase('testesRealizados', base),
  ];

  if (l === 'sim') {
    f.push(frase('dispensouTestes', base));
  } else {
    f.push(frase('testesVia', base));
  }
  f.push('');

  const dispensouTestes = l === 'sim';
  f.push(blocoRoteador('Principal', 'PONTO PRINCIPAL (JÁ INSTALADO)', t, n, dispensouTestes));
  f.push('');

  for (let e = 1; e <= s; e++) {
    f.push(blocoRoteador(String(e), `WI-FI EXTEND ${e}`, t, n, dispensouTestes));
    if (e < s) f.push('');
  }

  f.push('', frase('semDuvidas'));
  if (u) f.push('', frase('observacao', base));

  return { protocolo: '', os: f.join('\n') };
}
