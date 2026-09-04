/**
 * Emulação do modelo `ence-padrao-casa` — porte 1:1 da função construtora `qZe`
 * do bundle legado (conteúdo de O.S do próprio app). Encerramento de instalação
 * "Padrão Casa": saída única (`saida` = texto de encerramento). O 2º arg do
 * builder legado (`operadorPrimeiroNome`) não é usado neste modelo.
 * Validado por diff contra o legado — ver `encePadraoCasa.diff.test.ts`.
 */
import { maiusc, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { ENCE_PADRAO_CASA } from '../catalogo/encePadraoCasa';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'ence-padrao-casa';

const f = fraseDe(SLUG, ENCE_PADRAO_CASA);

export function renderEncePadraoCasa(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  // legado: n(e) => (t[e] ?? '').trim().toUpperCase()
  const n = (e: string) => maiusc(t[e]);

  let r = `${f('titulo')}\n\n`;

  r += (t.sem_id_cto === 'SIM' ? f('ctoOculta') : f('cto', { cto: n('cto') })) + `\n`;
  r += f('sinal', { sinal: n('sinal') }) + `\n`;
  r += f('porta', { porta: n('porta') }) + `\n\n`;
  r += f('passagemCabo', { passagemCabo: n('passagem_cabo') }) + `\n`;

  if (t.possui_passante === 'SIM') {
    r += f('possuiPassante') + `\n`;
    r += f('motivoPassante', { motivoPassante: n('motivo_passante') }) + `\n`;
    r += f('localPassante', { localPassante: n('local_passante') }) + `\n`;
    r += f('autorizadoPor', { autorizadoPor: n('autorizado_por') }) + `\n`;
  }

  const i = t.local_instalacao ?? '';
  let a = '';
  if (i === 'SOLTO EM CIMA DO MÓVEL') {
    a = f('fixacaoSolto', { descricaoMovel: n('descricao_movel'), motivoNaoFixado: n('motivo_nao_fixado') });
  } else if (i === 'FIXADO NA PAREDE') {
    a = f('fixacaoParede');
  } else if (i === 'FIXADO NO MÓVEL') {
    a = f('fixacaoMovel', { tipoFixacaoMovel: n('tipo_fixacao_movel') });
  }

  // "ONU" é feminino: a frase de fixação concorda em "FIXADA"/"SOLTA"; ROTEADOR
  // e ONT (masculinos) mantêm "FIXADO"/"SOLTO".
  const aFem = a.replace(/^SOLTO/, 'SOLTA').replace(/^FIXADO/, 'FIXADA');

  const o = t.tipo_equipamento ?? '';
  if (o === 'ONU + Roteador') {
    r += f('linhaOnu', { onu: n('onu'), macOnu: n('mac_onu'), fixacao: aFem }) + `\n`;
    r += f('linhaRoteador', { roteador: n('roteador'), macRoteador: n('mac_roteador'), fixacao: a }) + `\n`;
  } else if (o === 'ONT') {
    r += f('linhaOnt', { ont: n('ont_select'), macOnt: n('mac_ont_select'), fixacao: a }) + `\n`;
  } else if (o === 'Somente ONU') {
    r += f('linhaOnu', { onu: n('somente_onu_select'), macOnu: n('mac_somente_onu'), fixacao: aFem }) + `\n`;
  }

  r += f('testeNotebook', { testeNotebook: (t.teste_notebook ?? '').trim() }) + `\n`;
  r += f('testeCliente', { dispositivoTeste: n('dispositivo_teste'), marcaModeloTeste: n('marca_modelo_teste'), velocidadeTeste: (t.velocidade_teste ?? '').trim() }) + `\n`;

  const s = t.ligacao_eletrica ?? '';
  if (s === 'T de Energia' || s === 'Extensão Elétrica') {
    const e = n('nome_cliente_energia');
    if (e) {
      r += f('cienciaAdaptador', { nomeClienteEnergia: e }) + `\n`;
    }
  }

  const c = n('teste_cobertura');
  r += f('testeCobertura', { testeCobertura: c });
  if (t.eh_assinante === 'NÃO') {
    r += ` (${n('parentesco_cobertura')})`;
  }
  r += `.\n`;

  const l = n('app_mznet_celular');
  if (l) {
    r += f('appProvedor', { appCelular: l, testeCobertura: c }) + `\n`;
  }

  if (t.app_mztv === 'SIM') {
    r += f('appTvSim', { dispositivoTv: n('dispositivo_mztv') }) + `\n`;
  } else {
    r += f('appTvNao') + `\n`;
  }

  if (s === 'Outro') {
    r += f('ligacoesEletricas', { ligacaoEletrica: n('observacao_ligacao_outros') }) + `\n`;
  } else {
    r += f('ligacoesEletricas', { ligacaoEletrica: s.toUpperCase() }) + `\n`;
    if (s === 'T de Energia' || s === 'Extensão Elétrica') {
      r += f('orientacaoRiscos', { testeCobertura: c, ligacaoEletrica: s.toUpperCase() }) + `\n`;
    }
  }

  r += f('dispositivosConectados', { dispositivosConectados: n('dispositivos_conectados') }) + `\n`;

  if (t.pagamento === 'SIM') {
    r += f('pagamentoSim') + `\n`;
    r += `\n` + f('valorPagamento', { valorPagamento: (t.valor_pagamento ?? '').trim() }) + `\n`;
    r += f('formaPagamento', { formaPagamento: n('forma_pagamento') }) + `\n`;
  } else {
    r += f('pagamentoNao') + `\n`;
  }

  const u = n('observacoes');
  if (u) {
    r += `\n` + f('observacoes', { observacoes: u }) + `\n`;
  }

  return { protocolo: '', os: '', saida: r };
}
