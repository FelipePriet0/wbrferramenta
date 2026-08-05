/**
 * Emulação do modelo `ence-padrao-empresa` — porte 1:1 da função `XZe` do bundle
 * legado (conteúdo de O.S do próprio app). Encerramento de instalação padrão
 * empresa. Saída única (`saida` = encTexto do legado). 2º arg = operador.
 */
import { maiusc, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

export function renderEncePadraoEmpresa(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = (e: string): string => (t[e] ?? '').trim().toUpperCase();

  let r = `PADRAO EMPRESA:\n\n`;
  r += (t.sem_id_cto === `SIM` ? `CTO: XXXX` : `CTO: ${n(`cto`)}`) + `\n`;
  r += `SINAL: ${n(`sinal`)}\n`;
  r += `PORTA: ${n(`porta`)}\n\n`;
  r += `PASSAGEM DO CABO DROP: ${n(`passagem_cabo`)} A PEDIDO DO CLIENTE.\n`;
  if (t.possui_passante === `SIM`) {
    r += `POSSUI PASSANTE: SIM\n`;
    r += `MOTIVO DO PASSANTE: ${n(`motivo_passante`)}\n`;
    r += `LOCAL DO PASSANTE: ${n(`local_passante`)}\n`;
    r += `AUTORIZADO POR: ${n(`autorizado_por`)}\n`;
  }

  const i = t.local_instalacao ?? ``;
  let a = ``;
  if (i === `SOLTO EM CIMA DO MÓVEL`) {
    a = `SOLTO EM CIMA DO MÓVEL: ${n(`descricao_movel`)}. MOTIVO DE NÃO FIXAR: ${n(`motivo_nao_fixado`)}. O CLIENTE ESTÁ CIENTE DOS RISCOS CASO O EQUIPAMENTO SOFRA DANO POR QUEDA.\n`;
  } else if (i === `FIXADO NA PAREDE`) {
    a = `FIXADO NA PAREDE COM BUCHA E PARAFUSO A PEDIDO DO CLIENTE.`;
  } else if (i === `FIXADO NO MÓVEL`) {
    a = `FIXADO NO MÓVEL COM ${n(`tipo_fixacao_movel`)} A PEDIDO DO CLIENTE.`;
  }

  // "ONU" é feminino: a frase de fixação concorda em "FIXADA"/"SOLTA"; ROTEADOR
  // e ONT (masculinos) mantêm "FIXADO"/"SOLTO".
  const aFem = a.replace(/^SOLTO/, `SOLTA`).replace(/^FIXADO/, `FIXADA`);

  const o = t.tipo_equipamento ?? ``;
  if (o === `ONU + Roteador`) {
    r += `ONU ${n(`onu`)} MAC ${n(`mac_onu`)} ${aFem}\n`;
    r += `ROTEADOR ${n(`roteador`)} MAC ${n(`mac_roteador`)} ${a}\n`;
  } else if (o === `ONT`) {
    r += `ONT ${n(`ont_select`)} MAC ${n(`mac_ont_select`)} ${a}\n`;
  } else if (o === `Somente ONU`) {
    r += `ONU ${n(`somente_onu_select`)} MAC ${n(`mac_somente_onu`)} ${aFem}\n`;
  }

  r += `TESTE REALIZADO NO NOTEBOOK DO TÉCNICO, VIA CABO, AFERIU ${(t.teste_notebook ?? ``).trim()} MEGA DE DOWNLOAD.\n`;
  r += `TESTE FEITO NO ${n(`dispositivo_teste`)} ${n(`marca_modelo_teste`)} DO CLIENTE AFERIU ${(t.velocidade_teste ?? ``).trim()} MEGA DE DOWNLOAD.\n`;

  const s = t.ligacao_eletrica ?? ``;
  if (s === `T de Energia` || s === `Extensão Elétrica`) {
    const e = n(`nome_cliente_energia`);
    if (e) {
      r += `CLIENTE: ${e} ACOMPANHOU A ORDEM DE SERVIÇO E ESTÁ CIENTE DE QUE O ADAPTADOR PODE DESLIGAR OU ATÉ MESMO QUEIMAR OS EQUIPAMENTOS EMPRESTADOS EM COMODATO.\n`;
    }
  }

  const c = n(`teste_cobertura`);
  r += `TESTE DE COBERTURA WI-FI FOI REALIZADO NA PRESENÇA DE ${c}`;
  if (t.eh_assinante === `NÃO`) r += ` (${n(`parentesco_cobertura`)})`;
  r += `.\n\n`;

  const l = n(`app_wbr_celular`);
  if (l) r += `APP WBR: CELULAR ${l} DE ${c}, ESTE APP CONCEDE ACESSO AOS BOLETOS E CONTRATO.\n`;
  if (t.app_mztv === `SIM`) {
    r += `APP MZTV OU CDNTV: SIM - DISPOSITIVO: ${n(`dispositivo_mztv`)}\n`;
  } else {
    r += `APP MZTV OU CDNTV: NÃO\n`;
  }

  if (s === `Outro`) {
    r += `LIGAÇÕES ELÉTRICAS: ${n(`observacao_ligacao_outros`)}\n`;
  } else {
    r += `LIGAÇÕES ELÉTRICAS: ${s.toUpperCase()}\n`;
    if (s === `T de Energia` || s === `Extensão Elétrica`) {
      r += `${c} RECEBEU ORIENTAÇÃO SOBRE OS RISCOS DE USAR ${s.toUpperCase()}.\n`;
    }
  }

  r += `DISPOSITIVOS CONECTADOS NA REDE: ${n(`dispositivos_conectados`)}\n`;

  if (t.pagamento === `SIM`) {
    r += `PAGAMENTO (X)SIM ( )NAO\n`;
    r += `\nVALOR R$: ${(t.valor_pagamento ?? ``).trim()}\n`;
    r += `FORMA PAGAMENTO ${n(`forma_pagamento`)}\n`;
  } else {
    r += `PAGAMENTO ( )SIM (X)NAO\n`;
  }

  const u = n(`observacoes`);
  if (u) r += `\nOBS.: ${u}\n`;

  return { protocolo: '', os: '', saida: r };
}
