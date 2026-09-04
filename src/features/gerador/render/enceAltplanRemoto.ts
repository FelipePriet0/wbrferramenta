/**
 * Emulação do modelo `ence-altplan-remoto` — porte 1:1 da função construtora
 * `xQe` do bundle legado (conteúdo de O.S do próprio app). Encerramento de
 * instalação após alteração de plano remota. Saída única (`saida`). Ramifica em
 * "houve troca de roteador?" (tipoTroca). Validado por diff contra o legado —
 * ver `enceAltplanRemoto.diff.test.ts`.
 */
import { maiusc, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { ENCE_ALTPLAN_REMOTO } from '../catalogo/enceAltplanRemoto';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'ence-altplan-remoto';

const f = fraseDe(SLUG, ENCE_ALTPLAN_REMOTO);

/** Valor do radio "Houve troca de roteador?" que dispara o modo com troca. */
const SIM = 'SIM'; // legado: LP

export function renderEnceAltplanRemoto(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = (e: string): string => maiusc(t[e]);

  const r = t.tipoTroca === SIM;
  let i = '';

  if (r) {
    i += f('trocaRoteador', { rotRetirou: n('rotRetirou'), macRotRetirou: n('macRotRetirou'), rotInstalou: n('rotInstalou'), macRotInstalou: n('macRotInstalou') }) + `\n`;
  } else {
    i += f('semTrocaRoteador', { rotSemTroca: n('rotSemTroca'), macRotSemTroca: n('macRotSemTroca') }) + `\n`;
  }

  i += f('equipamentoInstalado', { onu: n('onu'), macONU: n('macONU') }) + `\n`;
  i += f('fixacaoRoteador', { fixacaoRoteador: n('fixacaoRoteador') }) + `\n`;
  if (t.fixacaoRoteador === 'NÃO') i += f('localizacaoEquipamento', { local: n('localRoteador') }) + `\n`;
  i += f('fixacaoOnu', { fixacaoONU: n('fixacaoONU') }) + `\n`;
  if (t.fixacaoONU === 'NÃO') i += f('localizacaoEquipamento', { local: n('localONU') }) + `\n`;

  const a = soDigitos(t.testeCabo);
  const o = soDigitos(t.testeWifi);
  i += `\n` + f('testeCabo', { testeCabo: a }) + `\n`;
  i += f('testeWifi', { testeWifi: o }) + `\n`;

  const s = soDigitos(t.velocidade1);
  i += f('testeDispositivo', { dispositivo: n('dispositivo1'), marcaModelo: n('marcaModelo1'), meioAfericao: n('meioAfericao1'), velocidade: s }) + `\n`;
  if ((t.dispositivo2 ?? '').trim()) {
    const e = soDigitos(t.velocidade2);
    i += f('testeDispositivo', { dispositivo: n('dispositivo2'), marcaModelo: n('marcaModelo2'), meioAfericao: n('meioAfericao2'), velocidade: e }) + `\n`;
  }

  const compat = n('aparelhoCompativel') === 'NÃO' ? 'NÃO É' : 'É';
  i += f('compatibilidade', { compat }) + `\n`;
  i += f('testeCobertura', { testeCobertura: n('testeCobertura') }) + `\n`;
  if (t.testeCobertura === 'NÃO') i += f('motivoNaoTeste', { motivoNaoTeste: n('motivoNaoTeste') }) + `\n`;

  i += `\n` + f('ligacaoEletrica', { ligacaoEletrica: n('ligacaoEletrica') }) + `\n`;
  if (r) i += '\n';
  if (t.ligacaoEletrica === 'OUTROS') i += f('observacaoLigacao', { observacaoLigacao: n('observacaoLigacao') }) + `\n`;

  const c = n('appMznet');
  if (c) i += f('appPlay', { appMznet: c }) + `\n`;
  const l = n('appMznetPlus');
  if (l) i += f('appPlayPlus', { appMznetPlus: l }) + `\n`;
  const u = n('appDeezer');
  if (u) i += f('appDeezer', { appDeezer: u }) + `\n`;

  i += `\n` + f('custos', { custos: n('custos') }) + `\n`;
  if (t.custos === 'COM') {
    i += f('valorCustos', { valorCustos: maiusc(t.valorCustos) }) + `\n`;
    i += f('formaPagamento', { formaPagamento: n('formaPagamento') }) + `\n`;
  }

  i += `\n` + f('observacoes', { observacoes: n('observacoes') }) + `\n`;
  i += '\n' + f('semDuvidas');

  return { protocolo: '', os: '', saida: i };
}
