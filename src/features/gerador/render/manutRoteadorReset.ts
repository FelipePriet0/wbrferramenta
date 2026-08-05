/**
 * Emulação do modelo `manut-roteador-reset` — porte 1:1 da função `bKe` do
 * bundle legado. 3 modos (visita técnica / trazer na loja / orientação remota).
 * Saída única combinada (`saida`) + protocolo/os/agenda. 2º arg = operador.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

const esp = (n: number) => ' '.repeat(n);
const SEP = '*'.repeat(19); // Bj
const SEP_OS = '*'.repeat(42); // gKe

export function renderManutRoteadorReset(valores: Valores): SaidaOS {
  const n: Valores = {};
  for (const [k, val] of Object.entries(valores)) n[k] = String(val ?? '');

  const r = n.tipoSolicitacao || 'visita';
  const i = maiusc(n.cliente);
  const a = primeiroNome(i);
  const o = n.canal;
  const s = soDigitos(n.contato);
  const c = maiusc(n.sinalONU);
  const l = maiusc(n.oscila);
  const u = maiusc(n.roteador);
  const operador = n.operadorPrimeiroNome ?? '';
  let d = '', f = '', p = '';

  if (r === 'loja') {
    const [e = '', t = ''] = (n.dataLigacao ?? '').split(' ');
    d = [
      `${a} ENTROU EM CONTATO POR ${o} (${s}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '', SEP, '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${c} ${l}.`,
      '', SEP, esp(4),
      `QUESTIONADO ${a} DISSE QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NAO ESTA APARECENDO MAIS.`,
      esp(4),
      `REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL ${c}) ${l} E ROTEADOR (${u}) ESTA INACESSIVEL. `,
      esp(4), SEP, esp(4),
      `ORIENTEI ${a} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER. `,
      esp(4),
      `PERGUNTEI A ${a} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      esp(4), SEP, esp(4),
      'INFORMEI QUE O ROTEADOR ESTA RESETADO, E REPASSEI AO CLIENTE 2 OPCOES PARA SOLUCAO DO PROBLEMA.',
      '',
      '1ª. AGENDAMENTO DE UMA VISITA TECNICA PARA RECONFIGURAR O ROTEADOR, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TECNICO. ESTE VALOR PODE SER PAGO NO ATO EM DINHEIRO, PIX OU CARTAO.',
      '',
      '2ª. TRAZER O ROTEADOR NA LOJA PARA RECONFIGURA-LO. ESTA OPCAO NAO TERA CUSTOS',
      SEP, esp(4),
      `${a} OPTOU POR TRAZER O ROTEADOR NA LOJA EM ${e} AS ${t}.`,
      '', 'CLIENTE SEM DUVIDAS.',
    ].join('\n');
  } else if (r === 'remoto') {
    const e = n.ssid?.trim() ?? '';
    const t = n.senhaWifi?.trim() ?? '';
    d = [
      `${a} ENTROU EM CONTATO POR ${o} (${s}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '', SEP, '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${c} ${l}.`,
      '', SEP, esp(4),
      `QUESTIONADO ${a} DISSE QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NAO ESTA APARECENDO MAIS.`,
      esp(4),
      `REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL ${c}) ${l} E ROTEADOR (${u}) ESTA INACESSIVEL. `,
      esp(4), SEP, esp(4),
      `ORIENTEI ${a} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER. `,
      esp(4),
      `PERGUNTEI A ${a} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      esp(4), SEP, esp(4),
      `INFORMEI ${a} QUE O ROTEADOR ESTA RESETADO E ORIENTEI O MESMO A REALIZAR O PROCESSO DE RECONFIGURACAO REMOTA CONFORME TUTORIAL DA WBR. ${a} SEGUIU AS ORIENTACOES, CONFIGUROU O ROTEADOR E CONFIRMOU QUE A REDE WI-FI VOLTOU NORMALMENTE.`,
      '',
      `SSID: ${e}`,
      `SENHA: ${t}`,
      '', 'CLIENTE SEM DUVIDAS.',
    ].join('\n');
  } else {
    const e = maiusc(n.bairro);
    const rv = n.dataVisita;
    const mv = n.horaVisita;
    const h = n.protocolo;
    const gv = n.formaPag;
    d = [
      `${a} ENTROU EM CONTATO POR ${o} (${s}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '', '', SEP, '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${c} ${l}.`,
      '', SEP, esp(4),
      `QUESTIONADO ${a} DISSE QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NAO ESTA APARECENDO MAIS.`,
      esp(4),
      `REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL ${c}) ${l} E ROTEADOR (${u}) ESTA INACESSIVEL. `,
      esp(4), SEP, esp(4),
      `ORIENTEI ${a} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER. `,
      esp(4),
      `PERGUNTEI A ${a} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      esp(4), SEP, esp(4),
      'INFORMEI QUE O ROTEADOR ESTA RESETADO, E REPASSEI AO CLIENTE 2 OPCOES PARA SOLUCAO DO PROBLEMA.',
      '',
      '1ª. AGENDAMENTO DE UMA VISITA TECNICA PARA RECONFIGURAR O ROTEADOR, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TECNICO. ESTE VALOR PODE SER PAGO NO ATO EM DINHEIRO, PIX OU CARTAO.',
      '',
      '2ª. TRAZER O ROTEADOR NA LOJA PARA RECONFIGURA-LO. ESTA OPCAO NAO TERA CUSTOS',
      SEP, esp(4),
      `${a} OPTOU PELA VISITA TECNICA, CONCORDOU COM OS TERMOS REPASSADOS E SOLICITOU PAGAR ${fraseFormaPag(gv)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${rv} AS ${mv} HRS.`,
      '', 'CLIENTE SEM DUVIDAS.',
    ].join('\n');
    f = `${a} ENTROU EM CONTATO POR ${o} (${s}) E INFORMOU QUE ESTA SEM CONEXAO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE SUA REDE WIFI NAO ESTA APARECENDO MAIS. REMOTAMENTE, VERIFIQUEI QUE ONU ESTA ACESA (SINAL ${c}) ${l} E ROTEADOR (${u}) ESTA INACESSIVEL. ORIENTEI ${a} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APOS 30 SEGUNDOS. FEZ POREM REDE WI-FI NAO VOLTOU A APARECER. INFORMEI QUE ROTEADOR ESTA RESETADO, E NECESSARIA VISITA TECNICA PARA RECONFIGURA-LO, QUE ESTE SERVICO POSSUI CUSTO R$50,00. ${a} CONCORDOU E SOLICITOU PAGAR NO ATO COM ${gv}. VISITA AGENDADA PARA ${rv} AS ${mv} HRS.\n\n${SEP_OS}\n\nINDICACAO TECNICA:\n\n${`TECNICO: ANALISAR ESTRUTURA INTERNA CONFERIR EQUIPAMENTOS SE DANIFICADOS, ANALISAR FONTE E ROTEADOR. CONFIGURAR EQUIPAMENTO, RESTABELECER CONEXAO E REALIZAR OS DEVIDOS TESTES, FILMAR, FOTOGRAFAR E APRESENTAR A ${a}. EXPLICAR SOBRE REDE 2 E 5GHZ, E SUAS ABRANGENCIAS.  ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 40 MIN.`}`;
    p = `MAN ROTEADOR RESETADO ${i} PROT:${h} ${gv} (${operador}) - ${e}`;
  }

  const saida = r === 'loja' || r === 'remoto'
    ? ['=== Texto Protocolo ===', d].join('\n')
    : ['=== Texto Protocolo ===', d, '', '=== Texto O.S ===', f, '', '=== Texto da Agenda ===', p].join('\n');

  return { protocolo: d, os: f, agenda: p, saida };
}
