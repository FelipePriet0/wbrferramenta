/**
 * Emulação do modelo `manut-roteador-queimado` — porte 1:1 da função `BGe` do
 * bundle legado. Modo cobrada/isento × 5 tipos de solicitação. 2º arg do builder
 * = operadorPrimeiroNome. Validado por diff — ver `.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

const esp = (n: number) => ' '.repeat(n);
const SEP_AST = '*'.repeat(19); // hj
const SEP_EQ = '='.repeat(41); // mj
const SEP_AST_OS = '*'.repeat(42); // FGe

/** Mapa roteador (comodato) → valor de substituição (legado: LGe). */
const ROTEADOR_VALOR: Record<string, string> = {
  MULTILASER: 'R$150,00',
  'TP-LINK 840': 'R$150,00',
  'TP LINK C-20': 'R$230,00',
  'D-LINK DIR 842': 'R$360,00',
  'TP LINK C-5': 'R$360,00',
  'TP LINK G-5': 'R$360,00',
  GREATEK: 'R$360,00',
  INTELBRAS: 'R$360,00',
  'HUAWEI AX2': 'R$360,00',
  'ZTE H196-MESH': 'R$360,00',
  'ZTE H199-A': 'R$360,00',
};

const TERCEIRO_SOLICITA = ['terceiro-solicita-terceiro-acompanha', 'terceiro-solicita-titular-acompanha'];

export function renderManutRoteadorQueimado(valores: Valores): SaidaOS {
  const n: Valores = {};
  for (const [k, val] of Object.entries(valores)) n[k] = String(val ?? '');

  const modo = n.modoCusto || 'cobrada';
  const i = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const isento = modo === 'isento';
  const clienteUp = maiusc(n.cliente);
  const s = primeiroNome(clienteUp);
  const solUp = maiusc(n.solicitante);
  const l = primeiroNome(solUp);
  const u = maiusc(n.parente);
  const d = maiusc(n.cargo);
  const f = n.canal;
  const p = soDigitos(n.contato);
  const m = soDigitos(n.contatoSol);
  const h = maiusc(n.sinalONU);
  const g = maiusc(n.bairro);
  const rot = n.roteador;
  const v = ROTEADOR_VALOR[rot] ?? rot;
  const y = n.protocolo;
  const b = n.formaPag;
  const x = n.dataVisita;
  const S = n.horaVisita;
  const C = n.horaCobrada;
  const w = !isento && n.pagamento === 'MENSALIDADE';
  const T = TERCEIRO_SOLICITA.includes(i);
  const operador = n.operadorPrimeiroNome ?? '';

  const c = maiusc(n.solicitante);
  let E = s, D = s, O = p;
  if (i === 'pessoa-juridica') { E = `${l} (${d})`; D = l; }
  else if (T) { E = `${l} (${u} DE ${s})`; D = l; O = m; }

  const k = isento
    ? `CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA ${fraseFormaPag(b)}`
    : w
    ? 'CONCORDOU COM A VISITA E CASO HAJA COBRANCA OPTOU POR LANCAR O VALOR NA PROXIMA MENSALIDADE'
    : `CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${b}`;
  const A = isento
    ? `VISITA AGENDADA PARA O DIA ${x} AS ${S} HRS`
    : `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${x} ${C}`;
  const j = isento
    ? `VISITA AGENDADA PARA ${x} AS ${S} HRS`
    : `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${x} ${C}`;
  const M = ', ';
  const N = `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${f} (${p}) COM ${s} (ASSINANTE) QUE CONFIRMOU E`;

  let P: string[];
  if (i === 'titular-solicita-terceiro-acompanha')
    P = [`${s} ${k}${M}${s} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${c} (${u}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${A}.`];
  else if (i === 'terceiro-solicita-terceiro-acompanha')
    P = [`${l} ${k}.`, '', `${N} AUTORIZOU ${c} (${u}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${A}.`];
  else if (i === 'terceiro-solicita-titular-acompanha')
    P = [`${l} ${k}.`, '', `${N} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${A}.`];
  else
    P = [`${D} ${k}${M}DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. ${A}.`];

  let F: string;
  if (isento) {
    F = i === 'titular-solicita-terceiro-acompanha'
      ? `${s} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO ${fraseFormaPag(b)}, ${s} NAO ESTARA PRESENTE MAS AUTORIZOU ${c} (${u}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${j}.`
      : i === 'terceiro-solicita-terceiro-acompanha'
      ? `${l} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO ${fraseFormaPag(b)}. ${N} AUTORIZOU ${c} (${u}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${j}.`
      : i === 'terceiro-solicita-titular-acompanha'
      ? `${l} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO ${fraseFormaPag(b)}. ${N} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${j}.`
      : i === 'pessoa-juridica'
      ? `${D} DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO ${fraseFormaPag(b)}. ${j}.`
      : `CLIENTE DISSE ESTAR CIENTE, AUTORIZOU A VISITA E CASO HAJA CUSTOS REALIZARA O PAGAMENTO ${fraseFormaPag(b)}. ${j}.`;
  } else {
    F = i === 'titular-solicita-terceiro-acompanha'
      ? `${s} ${k}, ${s} NAO ESTARA PRESENTE MAS AUTORIZOU ${c} (${u}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${j}.`
      : i === 'terceiro-solicita-terceiro-acompanha'
      ? `${l} ${k}. ${N} AUTORIZOU ${c} (${u}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${j}.`
      : i === 'terceiro-solicita-titular-acompanha'
      ? `${l} ${k}. ${N} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${j}.`
      : `${D} ${k}. ${j}.`;
  }

  const tecIsento = `TECNICO: CONFERIR ENERGIA DAS TOMADAS, ANALISAR FONTE E ROTEADOR, CASO ENERGIA E FONTE ESTIVER NORMAL, E EQUIPAMENTO NAO APRESENTAR SINAL DE MAL USO OU QUEDA, SUBSTITUIR FONTE E/OU ROTEADOR QUEIMADO, RESTABELECER CONEXAO E REALIZAR OS DEVIDOS TESTES. CASO ENERGIA NAO ESTIVER NORMAL INSTRUIR ${D} A VERIFICA-LA E COBRAR VISITA DE R$50,00 + EQUIPAMENTO DANIFICADO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WIFI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 60 MIN.`;
  const tecCobrada = `TECNICO: CONFERIR AS TOMADAS, T, ETC. ONDE ESTAO LIGADOS ONU E ROTEADOR. CONFERIR FONTES DOS EQUIPAMENTOS E CONFERIR ROTEADOR (APARENCIA FISICA). SE NAO FOR PROBLEMAS NA TOMADA, NAS FONTES E ROTEADOR ESTIVER SEM AVARIAS, SUBSTITUIR ROTEADOR ${rot} POR OUTRO SIMILAR. EFETUAR TESTES PADROES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZACAO DO FIRMWARE DO ROTEADOR. CASO PROBLEMA SEJA NA TOMADA,  T , FONTES OU ROTEADOR AVARIADO: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARA DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DUVIDAS DE ${D}. TEMPO ESTIMADO 40 MINUTOS.`;

  let I: string, R: string;
  if (isento) {
    I = [
      `${E} ENTROU EM CONTATO POR ${f} (${O}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '', SEP_AST, esp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${h}.`,
      esp(4), SEP_AST, esp(4),
      'QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.',
      esp(4),
      `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ACESA (SINAL ${h}). ORIENTEI ${D} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU. `,
      esp(4),
      `PERGUNTEI A ${D} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      esp(4), SEP_AST, esp(4),
      `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO ${D} CONECTAR O EQUIPAMENTO A ENERGIA CONFORME RECOMENDACAO DA WBR, ESTARA ISENTO DO CUSTO DO ROTEADOR. FICANDO APENAS A COBRANCA DO DESLOCAMENTO DO TECNICO COM O CUSTO DE R$50,00.`,
      esp(4), SEP_AST, esp(4),
      ...P,
      '', 'CLIENTE SEM DUVIDAS.',
    ].join('\n');
    R = `${E} ENTROU EM CONTATO POR ${f} (${O}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET, QUESTIONADO DISSE "QUE ROTEADOR ESTA COM TODAS AS LUZES APAGADAS E ONU ESTA LIGADO NORMALMENTE". REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ACESA (SINAL ${h}). ORIENTEI ${D} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E RECONECTA-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU. INFORMEI ${D} QUE E NECESSARIO VISITA TECNICA, E QUE HAVENDO PROBLEMAS DE QUEIMA NA FONTE DE ENERGIA OU EQUIPAMENTO NAO OCASIONADO, SUBSTITUICAO DO COMODATO NAO HAVERA CUSTOS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 MAIS O CUSTO DA PECA OU EQUIPAMENTO A SER SUBSTITUIDO (FONTE R$40,00) OU (ROTEADOR ${v}), ${F}\n\n${SEP_AST_OS}\n\nINDICACAO TECNICA:\n\n${tecIsento}`;
  } else {
    I = [
      `${E} ENTROU EM CONTATO POR ${f} (${O}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '', SEP_EQ, '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${h}.`,
      '', SEP_EQ, '',
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO (${rot}).`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ESTA ONLINE COM SINAL ${h}.`,
      '',
      `ORIENTEI ${D} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E INVERTE-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.`,
      '',
      `PERGUNTEI A ${D} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      '', SEP_EQ, '',
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.',
      '', SEP_EQ, '',
      ...P,
      '', 'CLIENTE SEM DUVIDAS.',
    ].join('\n');
    R = `${E} ENTROU EM CONTATO POR ${f} (${O}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, ${D} DISSE "QUE ROTEADOR ESTA COM TODAS AS LUZES APAGADAS". REMOTAMENTE VERIFIQUEI QUE ONU ESTA CONECTADA E COM SINAL ${h}. ORIENTEI ${D} A INVERTER AS FONTES DE ENERGIA DOS EQUIPAMENTOS (ONU E ROTEADOR) E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${D} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${F}\n\n${SEP_EQ}\n\nINDICACAO TECNICA:\n\n${tecCobrada}`;
  }

  const z = `MAN TROCA ROTEADOR ${clienteUp} PROT:${y} ${w ? 'MENSALIDADE' : b} (${operador}) - ${g}`;
  return { protocolo: I, os: R, agenda: z };
}
