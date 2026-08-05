/**
 * Emulação do modelo `manut-mud-ponto-int` (Mudança de ponto interno) — porte
 * 1:1 da função construtora `nGe` do bundle legado (conteúdo de O.S do próprio
 * app). Ramifica nos 5 tipos de solicitação (titular/PJ/terceiro × quem
 * acompanha) e agenda visita técnica, por isso retorna também `agenda`.
 *
 * O 2º argumento do builder legado é o primeiro nome do operador; aqui é lido de
 * `valores.operadorPrimeiroNome`. Validado por diff contra o legado — ver
 * `manutMudPontoInt.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, nucleoCustoDrop, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador de blocos — 35 asteriscos. (legado: HA) */
const HA = '*'.repeat(35);

/** N espaços em branco. (legado: YA) */
function espacos(n: number): string {
  return ' '.repeat(n);
}

/** Indicação técnica fixa da O.S. (legado: tGe) */
const INDICACAO_TECNICA =
  'TECNICO: EFETUAR A MUDANCA DE PONTO DOS EQUIPAMENTOS PARA O LOCAL ESPECIFICADO PELO CLIENTE, CASO SEJA POSSIVEL REAPROVEITAR CABO DROP USANDO A SOBRA E RECONECTORIZAR. SE NAO DER TAMANHO, SERA NECESSARIO A PASSAGEM DE UM NOVO CABEAMENTO PARA CONCLUIR O SERVICO. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGENCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DA CLIENTE E APRESENTAR VARIACOES SE HOUVER. ATUALIZAR FIRMWARE DO ROTEADOR SE NECESSARIO. TEMPO ESTIMADO: 60 MIN.';

/** Envelope da O.S com separador + indicação técnica. (legado: XA) */
function envelopeOS(corpo: string): string {
  return `${corpo}\n\n${HA}\n\nINDICACAO TECNICA:\n\n${INDICACAO_TECNICA}`;
}

export function renderManutMudPontoInt(valores: Valores): SaidaOS {
  const nRaw: Valores = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Valores = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  // 2º arg do builder legado = primeiro nome do operador.
  const t = n.operadorPrimeiroNome;

  const r = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const i = maiusc(n.cliente); // nome completo / razão social
  const a = primeiroNome(i); // primeiro nome do cliente
  const o = maiusc(n.solicitante); // solicitante completo
  const s = primeiroNome(o); // primeiro nome do solicitante
  const c = maiusc(n.parente);
  const l = maiusc(n.cargo);
  const u = n.canal;
  const d = soDigitos(n.contato);
  const f = soDigitos(n.contatoSol);
  const p = maiusc(n.sinalONU);
  const bairro = maiusc(n.bairro);
  const h = maiusc(n.motivo);
  const g = maiusc(n.ambienteAtual);
  const amb = maiusc(n.ambienteNovo);
  const v = n.valor;
  const y = maiusc(n.formaPag);
  const b = n.dataVisita;
  const x = n.horaVisita;

  // Explicação dos TERMOS do custo (drop com sobra = R$50 / drop novo = R$100),
  // condicional ao valor escolhido. A O.S não afirma um valor específico na frase
  // de pagamento — a explicação já carrega o custo e a frase diz só a forma.
  // Só aplica quando há valor; vazio mantém a redação original (fidelidade às
  // fixtures/legado). Núcleo compartilhado em `nucleoCustoDrop`.
  const pagouCliente = v
    ? `${nucleoCustoDrop(v)} CLIENTE PAGARA ${fraseFormaPag(y)}`
    : `CLIENTE PAGARA ${v} ${fraseFormaPag(y)}`;
  const pagouSolSolicitou = v
    ? `${nucleoCustoDrop(v)} ${s} SOLICITOU PAGAR ${fraseFormaPag(y)}`
    : `${s} SOLICITOU PAGAR ${v} ${fraseFormaPag(y)}`;
  const pagouSolEscolheu = v
    ? `${nucleoCustoDrop(v)} ${s} ESCOLHEU PAGAR ${fraseFormaPag(y)}`
    : `${s} ESCOLHEU PAGAR ${v} ${fraseFormaPag(y)}`;

  // Linha de custo do Protocolo: explicação dos termos + formas de pagamento.
  const custoLinhaProto = v
    ? `${nucleoCustoDrop(v)} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`
    : `VALOR DE ${v} A SER PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`;

  const agenda = `MAN MUD PONTO INTERNO ${i} PROT:${n.protocolo} ${y} (${t}) - ${bairro}`;

  const montar = (protoLinhas: string[], osCorpo: string): SaidaOS => ({
    protocolo: protoLinhas.join('\n'),
    os: envelopeOS(osCorpo),
    agenda,
  });

  if (r === 'pessoa-juridica') {
    return montar(
      [
        `${s} (${l}) ENTROU EM CONTATO POR ${u} (${d}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO`,
        HA,
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU COM SINAL: ${p}.`,
        HA,
        `QUESTIONADO ${s} DISSE QUE "${h}".`,
        '',
        `AMBIENTE ATUAL: ${g}`,
        `NOVO AMBIENTE: ${amb}`,
        '',
        custoLinhaProto,
        espacos(4),
        HA,
        espacos(4),
        `${s} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO ${fraseFormaPag(y)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${b} AS ${x} HRS.`,
      ],
      `${s} (${l}) SOLICITOU POR ${u} (${d}) MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${g}, E REINSTALAR EM: ${amb}. MOTIVO: ${h}. ${pagouCliente}. AGENDADA PARA ${b} AS ${x} HORAS.`,
    );
  }

  if (r === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        `${a} ENTROU EM CONTATO POR ${u} (${d}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO`,
        HA,
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU COM SINAL: ${p}.`,
        HA,
        `QUESTIONADO ${a} DISSE QUE "${h}".`,
        espacos(4),
        `AMBIENTE ATUAL: ${g}`,
        `NOVO AMBIENTE: ${amb}`,
        espacos(8),
        custoLinhaProto,
        espacos(4),
        HA,
        espacos(4),
        `${a} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO ${fraseFormaPag(y)}, ${a} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${o} (${c}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${b} AS ${x} HRS.`,
      ],
      `${a} SOLICITOU POR ${u} (${d}) MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${g}, E REINSTALAR EM: ${amb}. MOTIVO: ${h}. ${pagouCliente}. ${a} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${o} (${c}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${b} AS ${x} HRS.`,
    );
  }

  if (r === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        `${s} (${c} DE ${a}) ENTROU EM CONTATO POR ${u} (${f}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO`,
        '',
        HA,
        '',
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU COM SINAL: ${p} SEM OSCILACAO.`,
        '',
        HA,
        '',
        `QUESTIONADO ${s} DISSE QUE "${h}".`,
        '',
        `AMBIENTE ATUAL: ${g}`,
        `NOVO AMBIENTE: ${amb}`,
        '',
        custoLinhaProto,
        '',
        HA,
        espacos(4),
        `${s} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO ${fraseFormaPag(y)}.`,
        '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${u} (${d}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${o} (${c}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${b} AS ${x} HRS.`,
      ],
      `${s} (${c} DE ${a}) ENTROU EM CONTATO POR ${u} (${f}) SOLICITANDO MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${g}, E REINSTALAR EM: ${amb}. MOTIVO: ${h}. ${pagouSolSolicitou}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${u} (${d}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${o} (${c}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${b} AS ${x} HRS.`,
    );
  }

  if (r === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        `${s} (${c} DE ${a}) ENTROU EM CONTATO POR ${u} (${f}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO`,
        '',
        HA,
        '',
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU COM SINAL: ${p}.`,
        '',
        HA,
        '',
        `QUESTIONADO ${s} DISSE QUE "${h}".`,
        '',
        `AMBIENTE ATUAL: ${g}`,
        `NOVO AMBIENTE: ${amb}`,
        '',
        custoLinhaProto,
        espacos(4),
        HA,
        espacos(4),
        `${s} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO ${fraseFormaPag(y)}.`,
        '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${u} (${d}) COM ${a} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${b} AS ${x} HRS.`,
      ],
      `${s} (${c} DE ${a}) ENTROU EM CONTATO POR ${u} (${f}) SOLICITANDO MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${g}, E REINSTALAR EM: ${amb}. MOTIVO: ${h}. ${pagouSolEscolheu}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${u} (${d}) COM ${a} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${b} AS ${x} HRS.`,
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      `${a} ENTROU EM CONTATO POR ${u} (${d}) SOLICITANDO INFORMACOES SOBRE MUDANCA DE PONTO INTERNO`,
      HA,
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU COM SINAL: ${p}.`,
      HA,
      `QUESTIONADO ${a} DISSE QUE "${h}".`,
      '',
      `AMBIENTE ATUAL: ${g}`,
      `NOVO AMBIENTE: ${amb}`,
      '',
      custoLinhaProto,
      espacos(4),
      HA,
      espacos(4),
      `${a} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO ${fraseFormaPag(y)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${b} AS ${x} HRS.`,
    ],
    `${a} SOLICITOU POR ${u} (${d}) MUDANCA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: ${g}, E REINSTALAR EM: ${amb}. MOTIVO: ${h}. ${pagouCliente}. AGENDADA PARA ${b} AS ${x} HORAS.`,
  );
}
