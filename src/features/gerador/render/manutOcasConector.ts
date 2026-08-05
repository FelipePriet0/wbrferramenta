/**
 * Emulação do modelo `manut-ocas-conector` — porte 1:1 da função `ZUe` do bundle
 * legado (conteúdo de O.S do próprio app). Manutenção com dano OCASIONADO no
 * conector; ramifica nos 4 tipos de solicitação (titular/terceiro × quem
 * acompanha). Retorna também `agenda` (visita técnica). Validado por diff contra
 * o legado — ver `manutOcasConector.diff.test.ts`.
 *
 * O 2º argumento do builder legado é o `operadorPrimeiroNome`; aqui lido de
 * `valores.operadorPrimeiroNome`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador curto do Protocolo — 19 asteriscos. (legado: Gk) */
const SEP_CURTO = '*'.repeat(19);
/** Separador longo do Protocolo — 42 asteriscos. (legado: UUe) */
const SEP_LONGO = '*'.repeat(42);
/** Separador da O.S antes da INDICAÇÃO TÉCNICA — 39 iguais. (legado: Kk) */
const SEP_OS = '='.repeat(39);

/** N espaços. (legado: eA) */
const esp = (n: number): string => ' '.repeat(n);

/** Bloco CTOE/CTOI da O.S. (legado: KUe) */
function blocoCto(tipo: string, cto: string, passante: string): string {
  if (tipo === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`;
  if (tipo === 'CTOI') return `\nCTOI // ${passante}.\n`;
  return '';
}

/** Primeiras duas palavras do alarme para o texto da agenda. (legado: qUe) */
function duasPalavras(v: string): string {
  return v.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(' ');
}

/** Indicação técnica, com a ONU/ONT interpolada. (legado: Xk) */
function indicacaoTecnica(onu: string): string {
  return `TECNICO: ANALISAR ESTRUTURA INTERNA. CASO FOR FIBRA ROMPIDA OU CONECTOR DANIFICADO, CORRIGIR E RESTABELECER CONEXAO. DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIA NA INSTALACAO QUE NAO TIVER PADRAO E COBRAR VISITA MINIMA DE R$50,00. CASO ${onu} ESTIVER DANIFICADA INFORMAR VALOR DO EQUIPAMENTO (CUSTO DO EQUIPAMENTO + MAO DE OBRA), CLIENTE CONCORDANDO COM A SUBSTITUICAO DA ${onu} ENTRAR EM CONTATO COM RESPONSAVEL DO SUPORTE PARA VERIFICAR FORMA DE PAGAMENTO. ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO: 40 MIN.`;
}

/** Envelope da O.S — terceiro-terceiro (18/20 espaços). (legado: YUe) */
function envelopeYUe(onu: string): string {
  return `${SEP_OS}\n${esp(18)}\nINDICACAO TECNICA:\n${esp(20)}\n${indicacaoTecnica(onu)}`;
}

/** Envelope da O.S — titular-titular e terceiro-titular (linhas em branco). (legado: JUe) */
function envelopeJUe(onu: string): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${indicacaoTecnica(onu)}`;
}

/** Envelope da O.S — titular-terceiro (20/20 espaços). (legado: XUe) */
function envelopeXUe(onu: string): string {
  return `${SEP_OS}\n${esp(20)}\nINDICACAO TECNICA:\n${esp(20)}\n${indicacaoTecnica(onu)}`;
}

export function renderManutOcasConector(valores: Valores): SaidaOS {
  const nRaw: Valores = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Valores = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  const tipo = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const nomeCompleto = maiusc(n.cliente); // i
  const titular = primeiroNome(nomeCompleto); // a
  const solCompleto = maiusc(n.solicitante); // o
  const solNome = primeiroNome(solCompleto); // s
  const parente = maiusc(n.parente); // c
  const canal = n.canal; // l
  const contato = soDigitos(n.contato); // u
  const contatoSol = soDigitos(n.contatoSol); // d
  const onu = primeiroNome(maiusc(n.onu)); // f
  const motivo = maiusc(n.motivo); // p
  const formaPag = maiusc(n.formaPag); // m
  const dataVisita = n.dataVisita; // h
  const horaVisita = n.horaVisita; // g
  const ctoType = n.ctoType || 'CTOE'; // _
  const bloco = blocoCto(ctoType, maiusc(n.cto), maiusc(n.passante)); // v
  const operador = valores.operadorPrimeiroNome ?? ''; // t

  let agenda = `MAN ${duasPalavras(maiusc(n.alarme ?? ''))} (OCASIONADO) ${nomeCompleto} PROT:${
    n.protocolo ?? ''
  } ${formaPag} (${operador}) - ${maiusc(n.bairro)}`; // y
  if (ctoType === 'CTOI') agenda += ` *CTOI*`;

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => ({
    protocolo: protoLinhas.join('\n'),
    os: osTexto,
    agenda,
  });

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
        '',
        SEP_CURTO,
        esp(4),
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onu} SEM SINAL.`,
        esp(4),
        SEP_CURTO,
        esp(4),
        `QUESTIONADO, ${solNome} DISSE QUE A ${onu} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${solNome} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        '',
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
        esp(4),
        `PERGUNTEI A ${solNome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
        '',
        SEP_LONGO,
        '',
        `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA. ESTA VISITA TECNICA POSSUI O CUSTO DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
        '',
        SEP_LONGO,
        '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solCompleto} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${titular} CONCORDOU COM OS TERMOS DA VISITA TECNICA E FARA O PAGAMENTO ${fraseFormaPag(formaPag)}. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
        '',
        `CLIENTE SEM DUVIDAS.`,
      ],
      `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${onu} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS. INFORMEI A ${solNome} QUE E NECESSARIO VISITA TECNICA PARA REPARO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${solNome} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solCompleto} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.` +
        bloco +
        envelopeYUe(onu),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
        '',
        SEP_CURTO,
        esp(4),
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onu} SEM SINAL.`,
        esp(4),
        SEP_CURTO,
        esp(4),
        `QUESTIONADO, DISSE QUE A ${onu} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${solNome} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        '',
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
        esp(4),
        SEP_CURTO,
        '',
        `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
        esp(4),
        SEP_CURTO,
        '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${titular} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA ${fraseFormaPag(formaPag)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
        '',
        `CLIENTE SEM DUVIDAS.`,
      ],
      `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${onu} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS. INFORMEI A ${solNome} QUE E NECESSARIO VISITA TECNICA PARA REPARO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${solNome} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.` +
        bloco +
        envelopeJUe(onu),
    );
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
        esp(20),
        SEP_CURTO,
        esp(24),
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onu} SEM SINAL.`,
        esp(24),
        SEP_CURTO,
        esp(24),
        `QUESTIONADO, DISSE QUE A ${onu} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${titular} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        '',
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA. `,
        esp(24),
        SEP_CURTO,
        esp(20),
        `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
        esp(20),
        SEP_CURTO,
        esp(20),
        `${titular} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${titular} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solCompleto} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
        '',
        `CLIENTE SEM DUVIDAS.`,
      ],
      `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${onu} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS. INFORMEI A ${titular} QUE E NECESSARIO VISITA TECNICA PARA REPARO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${titular} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${titular} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solCompleto} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.` +
        bloco +
        envelopeXUe(onu),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP_CURTO,
      esp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onu} SEM SINAL.`,
      '',
      SEP_CURTO,
      '',
      `QUESTIONADO, DISSE QUE A ${onu} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${titular} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
      '',
      `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA. ESTA VISITA TECNICA POSSUI O CUSTO DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
      SEP_CURTO,
      '',
      `${titular} CONCORDOU COM OS TERMOS DA VISITA TECNICA E FARA O PAGAMENTO ${fraseFormaPag(formaPag)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ],
    `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${onu} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS. INFORMEI A ${titular} QUE E NECESSARIO VISITA TECNICA PARA REPARO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) COBRA-SE VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${titular} CONCORDOU COM OS TERMOS DA VISITA E PAGARA ${fraseFormaPag(formaPag)}. VISITA AGENDADA PARA ${dataVisita} A PARTIR DE ${horaVisita} HRS.` +
      bloco +
      envelopeJUe(onu),
  );
}
