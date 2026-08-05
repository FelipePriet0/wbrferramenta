/**
 * Emulação do modelo `manut-fonte-queimada` — porte 1:1 da função `AGe` do
 * bundle legado (conteúdo de O.S do próprio app). Ramifica no modo de
 * atendimento (`com-visita` × `loja`). O 2º argumento do builder legado é o
 * `operadorPrimeiroNome`; aqui ele é lido de `valores.operadorPrimeiroNome`.
 * Validado por diff contra o legado — ver `manutFonteQueimada.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador dos blocos do Protocolo — 19 asteriscos. (legado: oj) */
const SEP = '*'.repeat(19);
/** Separador antes da INDICAÇÃO TÉCNICA na O.S — 42 asteriscos. (legado: wGe) */
const SEP_OS = '*'.repeat(42);
/** Indentação de linha em branco recuada — 4 espaços. (legado: uj(4)) */
const ESP4 = ' '.repeat(4);

export function renderManutFonteQueimada(valores: Valores): SaidaOS {
  const nRaw: Record<string, string> = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Record<string, string> = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  const tipo = n.tipoSolicitacao || 'com-visita';
  const i = maiusc(n.cliente);
  const a = primeiroNome(i);
  const o = n.canal;
  const s = soDigitos(n.contato);
  const c = maiusc(n.sinalONU);
  const l = maiusc(n.bairro);
  const u = maiusc(n.equip);
  const d = n.dataVisita;
  const f = n.protocolo;
  const p = maiusc(n.formaPag);
  const op = n.operadorPrimeiroNome;

  let m = '';
  let h = '';
  let g = '';
  let rotuloAgenda = 'Texto da Agenda';

  if (tipo === 'loja') {
    const e = maiusc(n.proced);
    const periodo = n.periodo;
    m = [
      `${a} ENTROU EM CONTATO POR ${o} (${s}) INFORMANDO PROBLEMA DE CONEXAO.`,
      ``,
      SEP,
      ESP4,
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E FIBRA COM SINAL: ${c}.`,
      ESP4,
      SEP,
      ESP4,
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.`,
      ESP4,
      `REMOTAMENTE VERIFIQUEI QUE A ONU/ONT ESTA DESCONECTADA. `,
      `${e}`,
      ESP4,
      `PERGUNTEI A ${a} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      ESP4,
      SEP,
      ``,
      `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA, E QUE DEVIDO ${a} TER CONECTADO O EQUIPAMENTO A ENERGIA CONFORME RECOMENDACAO DA WBR, ESTARA ISENTO DO CUSTO DA FONTE DE ENERGIA. FICANDO APENAS A COBRANCA DO DESLOCAMENTO DO TECNICO COM O CUSTO DE R$50,00.`,
      ``,
      `SUGERI TAMBEM, A POSSIBILIDADE DE COMPARECER A LOJA E RETIRAR UMA NOVA FONTE DE ENERGIA SEM NENHUM CUSTO ADICIONAL.`,
      ``,
      SEP,
      ESP4,
      `${a} OPTOU POR VIR A LOJA, DISSE QUE VIRA NO DIA ${d} NO PERIODO DA ${periodo}.`,
      ``,
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n');
    g = `*${i}*\nCLIENTE VIRA NA LOJA RECOLHER UMA ${u} SEM CUSTOS. EM ${d} NO PERIODO DA ${periodo}.\nPROTOCOLO Nº:${f}`;
    rotuloAgenda = 'Encaminhar no grupo LEIA';
  } else {
    const e = maiusc(n.proced);
    const r = n.horaVisita;
    m = [
      `${a} ENTROU EM CONTATO POR ${o} (${s}) INFORMANDO PROBLEMA DE CONEXAO.`,
      ``,
      SEP,
      ESP4,
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU COM SINAL: ${c}.`,
      ESP4,
      SEP,
      ESP4,
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.`,
      ``,
      `REMOTAMENTE VERIFIQUEI QUE A ONU/ONT ESTA DESCONECTADA. `,
      `${e}.`,
      ESP4,
      `PERGUNTEI A ${a} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      ESP4,
      SEP,
      ESP4,
      `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO ${a} CONECTAR O EQUIPAMENTO A ENERGIA CONFORME RECOMENDACAO DA WBR, ESTARA ISENTO DO CUSTO DA FONTE DE ENERGIA. FICANDO APENAS A COBRANCA DO DESLOCAMENTO DO TECNICO COM O CUSTO DE R$50,00.`,
      ESP4,
      SEP,
      ESP4,
      `${a} CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA ${fraseFormaPag(p)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${d} A PARTIR DE ${r} HRS.`,
      ``,
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n');
    const osCorpo = `${a} ENTROU EM CONTATO POR ${o} (${s}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE A ONU/ONT ESTA COM TODAS AS LUZES APAGADAS". REMOTAMENTE VERIFIQUEI QUE A ONU/ONT ESTA DESCONECTADA/APAGADA. ${e}. PERGUNTEI A ${a} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA REALIZAR A SUBSTITUICAO DA FONTE QUEIMADA POR OUTRA DE MODELO SIMILAR. VISITA TECNICA POSSUI O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TECNICO. ${a} CONCORDOU E PAGARA NO ATO COM ${p}. VISITA AGENDADA PARA ${d} A PARTIR DE ${r} HRS.`;
    const tecnico = `TECNICO: CONFERIR EQUIPAMENTOS E PARTE ELETRICA. SUBSTITUIR FONTE QUEIMADA E RESTABELECER ACESSO A INTERNET. CASO HAJA EQUIPAMENTOS DANIFICADOS POR MAL USO ENTRAR EM CONTATO COM O SUPORTE DE IMEDIATO PARA TRATATIVA. TESTAR REDE WI-FI E DISPOSITIVOS LIGADOS POR CABOS, CONFERIR NAVEGACAO IPv6 E AFERIR O PLANO CONTRATADO. SANAR TODAS AS DUVIDAS DE ${a}, COLHER ASSINATURA DA ORDEM DE SERVICO E RECEBER SERVICO.`;
    h = `${osCorpo}\n\n${SEP_OS}\n\nINDICACAO TECNICA:\n\n${tecnico}`;
    g = `MAN TROCA FONTE ${i} PROT:${f} ${p} (${op}) - ${l}`;
  }

  const saida =
    tipo === 'loja'
      ? [`=== Texto Protocolo ===`, m, ``, `=== ${rotuloAgenda} ===`, g].join('\n')
      : [
          `=== Texto Protocolo ===`,
          m,
          ``,
          `=== Texto O.S ===`,
          h,
          ``,
          `=== ${rotuloAgenda} ===`,
          g,
        ].join('\n');

  return { protocolo: m, os: h, agenda: g, saida };
}
