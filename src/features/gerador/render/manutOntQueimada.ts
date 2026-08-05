/**
 * Emulação do modelo `manut-ont-queimada` — porte 1:1 da função `XGe` do bundle
 * legado (conteúdo de O.S do próprio app). Manutenção de ONT queimada/sem sinal
 * (DYINGGASP), com visita técnica agendada. Ramifica em titular/PJ/terceiro nas
 * 5 variantes de `tipoSolicitacao`. O 2º argumento do builder legado é o primeiro
 * nome do operador — aqui lido de `valores.operadorPrimeiroNome`. Validado por
 * diff contra o legado — ver `manutOntQueimada.diff.test.ts`.
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador de blocos deste modelo (legado: `wj` = "=".repeat(41)). */
const SEP = '='.repeat(41);

/** Tipos em que o solicitante é terceiro (legado: `YGe`). */
const TIPOS_TERCEIRO_SOLICITA = [
  'terceiro-solicita-terceiro-acompanha',
  'terceiro-solicita-titular-acompanha',
];

export function renderManutOntQueimada(valores: Valores): SaidaOS {
  // Normaliza só as chaves presentes (chaves ausentes ficam `undefined`, o que o
  // legado renderiza literalmente como "undefined" — ex.: `alarme`).
  const nRaw: Record<string, string | undefined> = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Record<string, string | undefined> = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  const t = n.operadorPrimeiroNome; // 2º arg do builder legado
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
  const formaPag = n.formaPag;
  const dataVisita = n.dataVisita;
  const horaVisita = n.horaVisita;
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
    : `CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}`;
  const E = `VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA ${dataVisita} ${horaVisita}`;
  const D = `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${u} (${d}) COM ${a} (ASSINANTE) QUE CONFIRMOU E`;

  let O: string[];
  if (r === 'titular-solicita-terceiro-acompanha') {
    O = [
      `${a} ${T}, ${a} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${o} (${c}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${E}.`,
    ];
  } else if (r === 'terceiro-solicita-terceiro-acompanha') {
    O = [
      `${s} ${T}.`,
      ``,
      `${D} AUTORIZOU ${o} (${c}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${E}.`,
    ];
  } else if (r === 'terceiro-solicita-titular-acompanha') {
    O = [
      `${s} ${T}.`,
      ``,
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

  const protocolo = [
    `${S} ENTROU EM CONTATO POR ${u} (${w}) INFORMANDO PROBLEMA DE CONEXAO.`,
    ``,
    SEP,
    ``,
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONT SEM SINAL (DYINGGASP).`,
    ``,
    SEP,
    ``,
    `QUESTIONADO, DISSE QUE O EQUIPAMENTO DE INTERNET NAO ESTA LIGANDO (${h}).`,
    ``,
    `REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ONT COM ${m} (SEM SINAL: DYINGGASP). ORIENTEI ${C} A DESCONECTAR O CABO DE ENERGIA DA ONT E RECONECTA-LO APOS 30 SEGUNDOS, FEITO, POREM, CONEXAO NAO RESTABELECEU.`,
    ``,
    `PERGUNTEI A ${C} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
    ``,
    SEP,
    ``,
    `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.`,
    ``,
    SEP,
    ``,
    ...O,
    ``,
    `CLIENTE SEM DUVIDAS.`,
  ].join('\n');

  const os = `${`${S} ENTROU EM CONTATO POR ${u} (${w}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, ${C} DISSE "QUE A ONT ESTA COM ${m}". REMOTAMENTE VERIFIQUEI QUE ONT ESTA DESCONECTADA/APAGADA. ORIENTEI ${C} A RETIRAR A FONTE DE ENERGIA DA TOMADA ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${C} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${k}`}

${SEP}

INDICACAO TECNICA:

${`TECNICO: CONFERIR A TOMADA, T , ETC. ONDE ESTA LIGADA ONT. CONFERIR FONTE DO EQUIPAMENTO E CONFERIR ONT (APARENCIA FISICA). SE NAO FOR PROBLEMAS NA TOMADA, NA FONTE E ONT ESTIVER SEM AVARIAS, SUBSTITUIR ${h} POR OUTRA SIMILAR. EFETUAR TESTES PADROES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZACAO DO FIRMWARE DA ONT. CASO PROBLEMA SEJA NA TOMADA, T , FONTES OU ONT AVARIADA: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARA DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DUVIDAS DE ${C}. TEMPO ESTIMADO 40 MINUTOS.`}`;

  const agenda = `MAN TROCA ONT ${i} PROT:${g} ${b ? 'MENSALIDADE' : formaPag} (${t}) - ${p}`;

  return { protocolo, os, agenda };
}
