/**
 * Emulação do modelo `manut-visita-testes` — porte 1:1 da função `vGe` do bundle
 * legado (conteúdo de O.S do próprio app). Ramifica nos 6 tipos de solicitação
 * (PF/PJ × padrão/isento/dispensou-remoto). Retorna a O.S (`os`) e o texto de
 * agendamento (`agenda`). Validado por diff contra o legado — ver
 * `manutVisitaTestes.diff.test.ts`.
 *
 * NB: o legado só normaliza as chaves presentes no input (`n[k]=String(r??'')`);
 * campos ausentes (`oscila`, `repetidor`, `disp1..3`, `gestor`) permanecem
 * `undefined` e aparecem literalmente como "undefined" no texto. O porte preserva
 * esse comportamento (sem fallback nesses campos).
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador antes da INDICACAO TECNICA na O.S — 42 asteriscos. (legado: sGe) */
const SEP_OS = '*'.repeat(42);

/** Envelope da O.S com separador + indicação técnica. (legado: rj) */
function envelopeOS(corpo: string, indicacao: string): string {
  return `${corpo}\n\n${SEP_OS}\n\nINDICACAO TECNICA:\n\n${indicacao}`;
}

export function renderManutVisitaTestes(valores: Valores): SaidaOS {
  const nRaw: Valores = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Valores = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  // 2º arg do builder legado = operadorPrimeiroNome (usado no lugar de `t`).
  const t = valores.operadorPrimeiroNome ?? '';

  const r = n.tipoSolicitacao || 'pf';
  const i = maiusc(n.cliente);
  const a = primeiroNome(i);
  const o = primeiroNome(maiusc(n.solicitante));
  const s = maiusc(n.cargo);
  const c = n.canal;
  const l = soDigitos(n.contato);
  const u = maiusc(n.sinalONU);
  const d = maiusc(n.oscila);
  const f = maiusc(n.repetidor);
  const p = n.disp1;
  const m = n.disp2;
  const h = n.disp3;
  const g = maiusc(n.bairro);
  const gestor = n.gestor;
  const v = n.dataVisita;
  const y = n.horaVisita;
  const b = n.protocolo;
  const x = n.formaPag;

  const S = r === 'isento-pf' || r === 'isento-pj';
  const C = `MAN TESTES ${i} PROT:${b} ${S ? 'ISENTO' : x} (${t}) - ${g}`;
  const w = r === 'pessoa-juridica' || r === 'isento-pj' || r === 'disp-pj';
  const T = w ? o : a;
  const E = w ? `${o} (${s})` : a;
  const D = w ? 'EMPRESA' : 'RESIDENCIA';

  let O = '';
  if (r === 'disp-pf' || r === 'disp-pj') {
    O = envelopeOS(
      `${E} ENTROU EM CONTATO VIA ${c} (${l}) E SOLICITOU VISITA TECNICA. QUESTIONADO, ${T} DISSE QUE "INTERNET ESTA RUIM E DISPENSOU O SUPORTE REMOTO PARA QUAISQUER PROCEDIMENTOS". INFORMEI QUE VISITA POSSUI O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TECNICO, QUE ESTE PODERA SER PAGO EM DINHEIRO, CARTAO OU PIX E QUE PODERA SER ACRESCIDO O CUSTO DE EQUIPAMENTOS DANIFICADOS SE HOUVER. SE DE FATO TIVER PROBLEMAS NA CONEXAO DE INTERNET DE RESPONSABILIDADE DO PROVEDOR VISITA E ISENTA DE CUSTOS. ${T} CONCORDOU E CASO HAJA COBRANCA PAGARA NO ATO COM ${x}. VISITA AGENDADA PARA ${v} AS ${y} HRS.`,
      `TECNICO: PEDIR PARA ${T} APRESENTAR PROBLEMA DE TESTE DE INTERNET QUE ELE DIZ TER. COMPARAR MESMO TESTE COM NOTEBOOK E CELULAR DO KIT TECNICO FOTOGRAFAR/FILMAR. SE HOUVER PROBLEMA NOS EQUIPAMENTOS DA EMPRESA (ROTEADOR OU ONU) QUE NAO SEJAM OCASIONADOS, REPARAR OU TROCAR. SE HOUVER PROBLEMAS NESTE QUE FOREM OCASIONADOS, APRESENTAR AO CLIENTE E INFORMAR CUSTOS. CONFERIR INSTALACAO E LIGACOES ELETRICAS, INSTRUIR SOBRE COBERTURA WI-FI (SE NECESSARIO). CASO NAO HAJA PROBLEMAS E VISITA TER SIDO SOMENTE INSTRUTIVA, COBRAR VALOR DA VISITA E SOLICITAR REALIZACAO DO FEEDBACK. TEMPO ESTIMADO: 40 MINUTOS.`,
    );
  } else if (S) {
    O = envelopeOS(
      `${E} ENTROU EM CONTATO VIA ${c} (${l}) E DISSE QUE ESTA COM LENTIDAO NA CONEXAO COM A INTERNET, QUESTIONADO INFORMOU QUE "TODOS OS DISPOSITIVOS DA ${D} FICAM COM A INTERNET LENTA REPETIDAS VEZES AO LONGO DO DIA E NAO CONSEGUE AFERIR A VELOCIDADE DO PLANO EM NENHUM DE SEUS DISPOSITIVOS". REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA CONECTADO, SINAL ONU (${u} ${d}) NAO CONSTAM DESCONEXOES, NO MOMENTO HA ${p} DISPOSITIVOS CONECTADOS AO ROTEADOR, ${m} VIA WI-FI E ${h} POR CABO. REPETIDOR: ${f}. ${T} SOLICITOU VISITA TECNICA PARA VERIFICAR PROBLEMA QUE "DIZ TER". ${gestor} AUTORIZOU VISITA ISENTA DE CUSTOS DESDE QUE OS EQUIPAMENTOS ESTEJAM EM PERFEITO ESTADO DE CONSERVACAO. ${T} DISSE ESTAR CIENTE E CONCORDOU COM A VISITA QUE FOI AGENDADA PARA ${v} AS ${y} HRS.`,
      `TECNICO: PEDIR PARA QUE ${T} APRESENTE OS “PROBLEMAS DE INTERNET” QUE DIZ TER. COMPARAR TESTES ENTRE DISPOSITIVOS DELES COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT TECNICO. VISITA ISENTA DE CUSTOS (CORTESIA). CASO APRESENTAR ALGUM PROBLEMA ATUALIZAR O ROTEADOR COM UMA NOVA FIRMWARE E TESTAR NOVAMENTE, E SE AINDA NAO RESOLVER SUBSTITUIR O ROTEADOR POR UM NOVO. EXPLICAR E TIRAR TODAS AS DUVIDAS DO CLIENTE. TEMPO ESTIMADO 60 MINUTOS.`,
    );
  } else {
    O = envelopeOS(
      `${E} ENTROU EM CONTATO VIA ${c} (${l}) E DISSE QUE ESTA COM LENTIDAO NA CONEXAO COM A INTERNET, QUESTIONADO INFORMOU QUE "TODOS OS DISPOSITIVOS DA ${D} FICAM COM A INTERNET LENTA REPETIDAS VEZES AO LONGO DO DIA E NAO CONSEGUE AFERIR A VELOCIDADE DO PLANO EM NENHUM DE SEUS DISPOSITIVOS". REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA CONECTADO, SINAL ONU (${u} ${d}) NAO CONSTAM DESCONEXOES, NO MOMENTO HA ${p} DISPOSITIVOS CONECTADOS AO ROTEADOR, ${m} VIA WI-FI E ${h} POR CABO. REPETIDOR: ${f}. ${T} SOLICITOU VISITA TECNICA PARA VERIFICAR PROBLEMA QUE "DIZ TER". INFORMEI QUE HAVENDO PROBLEMA DE RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) OU SOMENTE PARA INSTRUCAO DE USO COBRAMOS VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS DANIFICADOS. ${T} DISSE ESTAR CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${x}. VISITA AGENDADA PARA ${v} AS ${y} HRS.`,
      `TECNICO: PEDIR PARA QUE ${T} APRESENTE OS “PROBLEMAS DE INTERNET” QUE DIZ TER. COMPARAR TESTES ENTRE DISPOSITIVOS DELES COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT TECNICO. CASO NAO TIVER OU APRESENTAR NENHUM PROBLEMA COBRAR VALOR MINIMO DA VISITA DE R$50,00, CASO APRESENTAR ALGUM PROBLEMA ATUALIZAR O ROTEADOR COM UMA NOVA FIRMWARE E TESTAR NOVAMENTE, E SE AINDA NAO RESOLVER SUBSTITUIR O ROTEADOR POR UM NOVO. EXPLICAR E TIRAR TODAS AS DUVIDAS DO CLIENTE. TEMPO ESTIMADO 60 MINUTOS.`,
    );
  }

  return { protocolo: '', os: O, agenda: C };
}
