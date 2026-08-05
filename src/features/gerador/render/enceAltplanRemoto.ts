/**
 * Emulação do modelo `ence-altplan-remoto` — porte 1:1 da função construtora
 * `xQe` do bundle legado (conteúdo de O.S do próprio app). Encerramento de
 * instalação após alteração de plano remota. Saída única (`saida`). Ramifica em
 * "houve troca de roteador?" (tipoTroca). Validado por diff contra o legado —
 * ver `enceAltplanRemoto.diff.test.ts`.
 */
import { maiusc, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Valor do radio "Houve troca de roteador?" que dispara o modo com troca. */
const SIM = 'SIM'; // legado: LP

export function renderEnceAltplanRemoto(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = (e: string): string => maiusc(t[e]);

  const r = t.tipoTroca === SIM;
  let i = '';

  if (r) {
    i += `DESINSTALEI ROTEADOR ${n('rotRetirou')} MAC: ${n('macRotRetirou')} E INSTALEI ROTEADOR ${n('rotInstalou')} MAC: ${n('macRotInstalou')}.\n`;
  } else {
    i += `ROTEADOR JÁ INSTALADO ${n('rotSemTroca')} MAC: ${n('macRotSemTroca')}.\n`;
  }

  i += `EQUIPAMENTO ${n('onu')} JÁ INSTALADO, MAC ${n('macONU')}\n`;
  i += `ROTEADOR FIXADO COM BUCHA E PARAFUSO: ${n('fixacaoRoteador')}\n`;
  if (t.fixacaoRoteador === 'NÃO') i += `LOCALIZAÇÃO DO EQUIPAMENTO: ${n('localRoteador')}\n`;
  i += `ONU FIXADA COM BUCHA E PARAFUSO: ${n('fixacaoONU')}\n`;
  if (t.fixacaoONU === 'NÃO') i += `LOCALIZAÇÃO DO EQUIPAMENTO: ${n('localONU')}\n`;

  const a = soDigitos(t.testeCabo);
  const o = soDigitos(t.testeWifi);
  i += `\nTESTE NO NOTEBOOK DO KIT VIA CABO ${a} MBPS\n`;
  i += `TESTE NO NOTEBOOK DO KIT VIA WI-FI 5G ${o} MBPS\n`;

  const s = soDigitos(t.velocidade1);
  i += `TESTE EM ${n('dispositivo1')} DO CLIENTE: ${n('marcaModelo1')} VIA ${n('meioAfericao1')} AFERIU A VELOCIDADE DE ${s} MBPS\n`;
  if ((t.dispositivo2 ?? '').trim()) {
    const e = soDigitos(t.velocidade2);
    i += `TESTE EM ${n('dispositivo2')} DO CLIENTE: ${n('marcaModelo2')} VIA ${n('meioAfericao2')} AFERIU A VELOCIDADE DE ${e} MBPS\n`;
  }

  const compat = n('aparelhoCompativel') === 'NÃO' ? 'NÃO É' : 'É';
  i += `APARELHO ${compat} COMPATÍVEL COM A VELOCIDADE CONTRATADA.\n`;
  i += `REALIZOU TESTES DE COBERTURA WI-FI? ${n('testeCobertura')}\n`;
  if (t.testeCobertura === 'NÃO') i += `MOTIVO: ${n('motivoNaoTeste')}\n`;

  i += `\nLIGAÇÃO ELÉTRICA: ${n('ligacaoEletrica')}\n`;
  if (r) i += '\n';
  if (t.ligacaoEletrica === 'OUTROS') i += `OBSERVAÇÃO: ${n('observacaoLigacao')}\n`;

  const c = n('appWbr');
  if (c) i += `APLICATIVO WBR-PLAY INSTALADO EM: ${c}\n`;
  const l = n('appWbrPlus');
  if (l) i += `APLICATIVO WBR-PLAY PLUS (ITTV) INSTALADO EM: ${l}\n`;
  const u = n('appDeezer');
  if (u) i += `APLICATIVO DEEZER INSTALADO EM: ${u}\n`;

  i += `\nO.S ${n('custos')} CUSTOS\n`;
  if (t.custos === 'COM') {
    i += `VALOR: R$${maiusc(t.valorCustos)}\n`;
    i += `FORMA DE PAGAMENTO: ${n('formaPagamento')}\n`;
  }

  i += `\nOBSERVAÇÕES: ${n('observacoes')}\n`;
  i += '\nCLIENTE SEM DÚVIDAS.';

  return { protocolo: '', os: '', saida: i };
}
