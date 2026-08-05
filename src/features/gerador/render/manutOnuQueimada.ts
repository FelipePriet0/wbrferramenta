/**
 * Emulação do modelo `manut-onu-queimada` — porte 1:1 da função `uKe` do bundle
 * legado (conteúdo de O.S do próprio app). Ramifica nos 5 tipos de solicitação
 * (titular/terceiro/PJ × acompanhamento) e agenda VISITA TÉCNICA, por isso
 * retorna também `agenda`. Validado por diff contra o legado — ver
 * `manutOnuQueimada.diff.test.ts`.
 */
import { linhas, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador de blocos (legado: Mj) — 41 sinais de igual. */
const SEP_ONU = '='.repeat(41);

/** Tipos em que terceiro solicita (S vira "SOL (PARENTE DE TITULAR)"). (legado: lKe) */
const TIPOS_TERCEIRO_SOLICITA = [
  'terceiro-solicita-terceiro-acompanha',
  'terceiro-solicita-titular-acompanha',
];

export function renderManutOnuQueimada(valores: Valores): SaidaOS {
  const n: Record<string, string | undefined> = {};
  for (const [k, val] of Object.entries(valores)) n[k] = String(val ?? '');

  const t = valores.operadorPrimeiroNome ?? '';

  const r = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const i = maiusc(n.cliente);
  const a = primeiroNome(i);
  const o = maiusc(n.solicitante);
  const s = primeiroNome(o);
  const c = maiusc(n.parente);
  const l = maiusc(n.cargo);
  const u = n.canal;
  const d = soDigitos(n.contato);
  const f = soDigitos(n.contatoSol);
  const p = maiusc(n.bairro);
  const m = maiusc(n.alarme);
  const h = n.onu;
  const g = n.protocolo;
  const _ = n.formaPag;
  const v = n.dataVisita;
  const y = n.horaVisita;
  const b = n.pagamento === 'MENSALIDADE';
  const x = TIPOS_TERCEIRO_SOLICITA.includes(r);

  let S = a;
  let C = a;
  let w = d;
  if (r === 'pessoa-juridica') {
    S = `${s} (${l})`;
    C = s;
  } else if (x) {
    S = `${s} (${c} DE ${a})`;
    C = s;
    w = f;
  }

  const T = b
    ? 'CONCORDOU COM A VISITA E CASO HAJA COBRANCA OPTOU POR LANCAR O VALOR NA PROXIMA MENSALIDADE'
    : `CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${_}`;
  const E = `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${v} ${y}`;
  const D = `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${u} (${d}) COM ${a} (ASSINANTE) QUE CONFIRMOU E`;

  let O: string[];
  if (r === 'titular-solicita-terceiro-acompanha') {
    O = [
      `${a} ${T}, ${a} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${o} (${c}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${E}.`,
    ];
  } else if (r === 'terceiro-solicita-terceiro-acompanha') {
    O = [
      `${s} ${T}.`,
      '',
      `${D} AUTORIZOU ${o} (${c}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${E}.`,
    ];
  } else if (r === 'terceiro-solicita-titular-acompanha') {
    O = [
      `${s} ${T}.`,
      '',
      `${D} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${E}.`,
    ];
  } else {
    O = [`${C} ${T}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. ${E}.`];
  }

  let k: string;
  if (r === 'titular-solicita-terceiro-acompanha') {
    k = `${a} ${T}, ${a} NAO ESTARA PRESENTE MAS AUTORIZOU ${o} (${c}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${E}.`;
  } else if (r === 'terceiro-solicita-terceiro-acompanha') {
    k = `${s} ${T}. ${D} AUTORIZOU ${o} (${c}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${E}.`;
  } else if (r === 'terceiro-solicita-titular-acompanha') {
    k = `${s} ${T}. ${D} DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${E}.`;
  } else {
    k = `${C} ${T}. ${E}.`;
  }

  const protocolo = linhas(
    `${S} ENTROU EM CONTATO POR ${u} (${w}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP_ONU,
    '',
    'CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU SEM SINAL (DYINGGASP).',
    '',
    SEP_ONU,
    '',
    'QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.',
    '',
    `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONU ${m} (SEM SINAL: DYINGGASP).`,
    '',
    `ORIENTEI ${C} A DESCONECTAR OS CABOS DE ENERGIA DA ONU E ROTEADOR E INVERTE-LOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.`,
    '',
    `PERGUNTEI A ${C} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
    '',
    SEP_ONU,
    '',
    'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.',
    '',
    SEP_ONU,
    '',
    ...O,
    '',
    'CLIENTE SEM DUVIDAS.',
  );

  const para1 = `${S} ENTROU EM CONTATO POR ${u} (${w}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, ${C} DISSE "QUE A ONU ESTA ${m}". REMOTAMENTE VERIFIQUEI QUE ONU ESTA DESCONECTADA/APAGADA. ORIENTEI ${C} A INVERTER AS FONTES DE ENERGIA DOS EQUIPAMENTOS (ONU E ROTEADOR) E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${C} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${k}`;
  const paraTecnico = `TECNICO: CONFERIR AS TOMADAS,  T , ETC. ONDE ESTAO LIGADOS ONU E ROTEADOR. CONFERIR FONTES DOS EQUIPAMENTOS E CONFERIR ONU (APARENCIA FISICA). SE NAO FOR PROBLEMAS NA TOMADA, NAS FONTES E ONU ESTIVER SEM AVARIAS, SUBSTITUIR ONU ${h} POR OUTRA SIMILAR. EFETUAR TESTES PADROES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZACAO DO FIRMWARE DO ROTEADOR. CASO PROBLEMA SEJA NA TOMADA,  T , FONTES OU ONU AVARIADA: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARA DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DUVIDAS DE ${C}. TEMPO ESTIMADO 40 MINUTOS.`;

  const os = `${para1}\n\n${SEP_ONU}\n\nINDICACAO TECNICA:\n\n${paraTecnico}`;

  const agenda = `MAN TROCA ONU ${i} PROT:${g} ${b ? 'MENSALIDADE' : _} (${t}) - ${p}`;

  return { protocolo, os, agenda };
}
