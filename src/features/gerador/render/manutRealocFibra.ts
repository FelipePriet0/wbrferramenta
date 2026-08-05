/**
 * Emulação do modelo `manut-realoc-fibra` — porte 1:1 da função `KWe` do bundle
 * legado (conteúdo de O.S do próprio app). Ramifica nos 5 tipos de solicitação
 * (titular/PJ/terceiro × acompanhamento). Modelo de MANUTENÇÃO: agenda visita
 * técnica de remanejamento de fibra, por isso retorna também `agenda`. O 2º
 * argumento do builder legado é o operador (primeiro nome) — aqui lido de
 * `valores.operadorPrimeiroNome`. Validado por diff contra o legado — ver
 * `manutRealocFibra.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, nucleoCustoDrop, primeiroNome, soDigitos } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador do fluxo titular/PJ — 39 sinais de igual. (legado: AA) */
const SEP_TITULAR = '='.repeat(39);
/** Separador do fluxo titular-solicita-terceiro — 38 sinais de igual. (legado: jA) */
const SEP_TERCEIRO_ACOMPANHA = '='.repeat(38);
/** Separador dos fluxos terceiro-solicita — 41 sinais de igual. (legado: MA) */
const SEP_TERCEIRO = '='.repeat(41);
/** Linha de 4 espaços usada como separador em branco. (legado: zA(4)) */
const ESP4 = ' '.repeat(4);

/**
 * Indicação técnica da O.S (bloco fixo do remanejamento de fibra). O `nome` vem
 * do 3º argumento do envelope legado. (legado: GWe)
 */
function indicacaoTecnica(nome: string): string {
  return `TECNICO: VERIFICAR DROP INTERNO E EXTERNO, SE SOBRA TECNICA FOR SUFICIENTE, USAR PARA REPARO E RESTABELECER CONEXAO. CASO NAO SEJA PASSAR OUTRO DROP. CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO. AO FINALIZAR ENTRAR EM CONTATO COM SUPORTE PARA CONFERIR SINAL E CONFIRMAR NORMALIZACAO COM ${nome}. TEMPO ESTIMADO 60 MIN.`;
}

/**
 * Envelope da O.S: corpo + separador + indicação técnica. `trailing` adiciona a
 * quebra final (4º argumento do legado). (legado: BA)
 */
function envelopeOS(
  corpo: string,
  sep: string,
  nome: string,
  trailing: boolean,
): string {
  let out = `${corpo}\n\n${sep}\n\nINDICACAO TECNICA:\n\n${indicacaoTecnica(nome)}`;
  if (trailing) out += '\n';
  return out;
}

export function renderManutRealocFibra(valores: Record<string, string>): SaidaOS {
  // Espelha `n[t]=String(r??'')`: só copia chaves existentes; ausentes ficam
  // undefined (o legado imprime "undefined" literal p/ `valor` não preenchido).
  const nRaw: Record<string, string> = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Record<string, string> = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  const tipo = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const clienteFull = maiusc(n.cliente);
  const cliente = primeiroNome(clienteFull);
  const solFull = maiusc(n.solicitante);
  const sol = primeiroNome(solFull);
  const parente = maiusc(n.parente);
  const cargo = maiusc(n.cargo);
  const canal = n.canal;
  const contato = soDigitos(n.contato);
  const contatoSol = soDigitos(n.contatoSol);
  const sinal = maiusc(n.sinalONU);
  const bairro = maiusc(n.bairro);
  const motivo = maiusc(n.motivo);
  const valor = maiusc(n.valor);
  const formaPag = n.formaPag;
  const dataVisita = n.dataVisita;
  const horaVisita = n.horaVisita;
  const operador = n.operadorPrimeiroNome;

  // Explicação dos TERMOS do custo (drop com sobra = R$50 / drop novo = R$100),
  // condicional ao valor. Só aplica quando há valor; vazio mantém a redação
  // original (fidelidade às fixtures/legado). Núcleo em `nucleoCustoDrop`.
  const temValor = valor !== '';
  const custoLinhaProto = temValor
    ? `${nucleoCustoDrop(valor)} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`
    : `FOI INFORMADO O VALOR DE ${valor}, PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`;
  // Cláusula de custo da O.S: com valor, a explicação (terminada em ponto)
  // antecede a frase de quem paga; vazio mantém "CUSTO DE ; ..." das fixtures.
  const custoClauseOs = temValor
    ? `${nucleoCustoDrop(valor)} `
    : `CUSTO DE ${valor}; `;

  const agenda = `MAN REMANEJAMENTO DE FIBRA ${clienteFull} PROT:${n.protocolo} ${formaPag} (${operador}) - ${bairro}`;

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => ({
    protocolo: protoLinhas.join('\n'),
    os: osTexto,
    agenda,
  });

  if (tipo === 'pessoa-juridica') {
    return montar(
      [
        `${sol} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.`,
        '', SEP_TITULAR, '',
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinal}.`,
        '', SEP_TITULAR, '',
        `QUESTIONADO ${sol} DISSE QUE "${motivo}".`,
        '',
        custoLinhaProto,
        ESP4, SEP_TITULAR, ESP4,
        `${sol} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO COM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
      ],
      envelopeOS(
        `${sol} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${custoClauseOs}CLIENTE PAGARA ${fraseFormaPag(formaPag)}. AGENDADA PARA ${dataVisita} AS ${horaVisita} HORAS.`,
        SEP_TITULAR,
        sol,
        false,
      ),
    );
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        `${cliente} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.`,
        '', SEP_TERCEIRO_ACOMPANHA, '',
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinal}.`,
        '', SEP_TERCEIRO_ACOMPANHA, '',
        `QUESTIONADO ${cliente} DISSE QUE "${motivo}".`,
        '',
        custoLinhaProto,
        ESP4, SEP_TERCEIRO_ACOMPANHA, ESP4,
        `${cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO COM ${formaPag}, ${cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solFull} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
      ],
      envelopeOS(
        `${cliente} ENTROU EM CONTATO POR ${canal} (${contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${custoClauseOs}CLIENTE PAGARA ${fraseFormaPag(formaPag)}. ${cliente} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solFull} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
        SEP_TERCEIRO_ACOMPANHA,
        'CLIENTE',
        true,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        `${sol} (${parente} DE ${cliente}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E SOLICITOU SUPORTE.`,
        '', SEP_TERCEIRO, '',
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinal} SEM OSCILACAO.`,
        '', SEP_TERCEIRO, '',
        `QUESTIONADO ${sol} DISSE QUE "${motivo}".`,
        '',
        custoLinhaProto,
        '', SEP_TERCEIRO, ESP4,
        `${sol} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO COM ${formaPag}.`,
        '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solFull} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
      ],
      envelopeOS(
        `${sol} (${parente} DE ${cliente}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${custoClauseOs}${sol} SOLICITOU PAGAR ${fraseFormaPag(formaPag)}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cliente} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solFull} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
        SEP_TERCEIRO,
        'CLIENTE',
        false,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        `${sol} (${parente} DE ${cliente}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E SOLICITOU SUPORTE.`,
        '', SEP_TERCEIRO, '',
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinal}.`,
        '', SEP_TERCEIRO, '',
        `QUESTIONADO ${sol} DISSE QUE "${motivo}".`,
        '',
        custoLinhaProto,
        ESP4, SEP_TERCEIRO, ESP4,
        `${sol} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO COM ${formaPag}.`,
        '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
      ],
      envelopeOS(
        `${sol} (${parente} DE ${cliente}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${custoClauseOs}${sol} ESCOLHEU PAGAR ${fraseFormaPag(formaPag)}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cliente} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
        SEP_TERCEIRO,
        'CLIENTE',
        false,
      ),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      `${cliente} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU SUPORTE.`,
      '', SEP_TITULAR, '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinal}.`,
      '', SEP_TITULAR, '',
      `QUESTIONADO ${cliente} DISSE QUE "${motivo}".`,
      '',
      custoLinhaProto,
      '', SEP_TITULAR, '',
      `${cliente} CONCORDOU COM OS TERMOS DA VISITA TECNICA, PAGAMENTO SERA FEITO NO ATO COM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
    ],
    envelopeOS(
      `${cliente} ENTROU EM CONTATO POR ${canal} (${contato}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "${motivo}". ${custoClauseOs}CLIENTE PAGARA ${fraseFormaPag(formaPag)}. AGENDADA PARA ${dataVisita} AS ${horaVisita} HORAS.`,
      SEP_TITULAR,
      cliente,
      true,
    ),
  );
}
