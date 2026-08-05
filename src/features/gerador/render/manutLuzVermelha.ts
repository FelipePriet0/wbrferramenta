/**
 * Emulação do modelo `manut-luz-vermelha` — porte 1:1 da função `hUe` do bundle
 * legado (conteúdo de O.S do próprio app). Manutenção "Luz vermelha": ramifica
 * nos 4 tipos de solicitação (titular/terceiro × acompanhamento) e agenda visita
 * técnica, por isso retorna também `agenda`. O 2º argumento do builder legado é
 * o `operadorPrimeiroNome`, lido aqui de `valores.operadorPrimeiroNome`.
 * Validado por diff contra o legado — ver `manutLuzVermelha.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador de asteriscos no Protocolo. (legado: yk) */
const SEP_AST = '*';
/** Separador de igual no Protocolo. (legado: vk) */
const SEP_EQ = '=';
/** Separador de igual antes da INDICAÇÃO TÉCNICA na O.S. (legado: bk) */
const SEP_OS = '=';
/** Indentação: N espaços. (legado: Ok) */
function esp(n: number): string {
  return ' '.repeat(n);
}
/** Bloco de indicação técnica da O.S. (legado: wk) */
const TECNICO =
  'TECNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE E DE OBRIGACAO DO PROVEDOR, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZACAO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.';

/**
 * Nome do alarme para a agenda, POR EXTENSO. (legado: iUe abreviava
 * "LUZ VERMELHA"→"LV" e "LUZ PON PISCANDO"→"PON"; abandonado a pedido do time —
 * a agenda passa a puxar o nome completo.)
 */
function nomeAlarme(alarme: string): string {
  return maiusc(alarme);
}

/** Bloco CTO da O.S. (legado: aUe) */
function blocoCto(ctoType: string, cto: string, passante: string): string {
  if (ctoType === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`;
  if (ctoType === 'CTOI') return `\nCTOI // ${passante}.\n`;
  return '';
}

/** Linha de agenda. (legado: uUe) */
function linhaAgenda(v: Valores, clienteMaiusc: string, operador: string): string {
  const tipoCto = v.ctoType || 'CTOE';
  let linha = `MAN ${nomeAlarme(v.alarme ?? '')} ${clienteMaiusc} PROT:${v.protocolo ?? ''} ${maiusc(v.formaPag ?? '')} (${operador}) - ${maiusc(v.bairro)}`;
  if (tipoCto === 'CTOI') linha += ` *CTOI*`;
  return linha;
}

/** Protocolo — terceiro solicita, terceiro acompanha. (legado: fUe) */
function protoTerceiroTerceiro(
  v: Valores,
  solNome: string,
  titular: string,
  solMaiusc: string,
  onuNome: string,
): string {
  const { canal, contato, contatoSol, alarme, onu, formaPag, dataVisita, horaVisita, parente } = v;
  return [
    `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP_AST,
    esp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuNome} SEM SINAL.`,
    esp(4),
    SEP_AST,
    esp(4),
    `QUESTIONADO, DISSE QUE A ${onuNome} ESTA COM ${alarme}.`,
    esp(4),
    `REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${solNome} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    esp(4),
    `PERGUNTEI A ${solNome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
    '',
    SEP_AST,
    '',
    `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
    esp(4),
    SEP_AST,
    '',
    `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solMaiusc} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${titular} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA ${fraseFormaPag(formaPag)}. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
    '',
    `CLIENTE SEM DUVIDAS.`,
  ].join('\n');
}

/** Sufixo O.S — terceiro solicita, terceiro acompanha. (legado: sUe) */
function sufixoTerceiroTerceiro(): string {
  return `${SEP_OS}\n${esp(18)}\nINDICACAO TECNICA:\n${esp(20)}\n${TECNICO}`;
}

/** Protocolo — terceiro solicita, titular acompanha. (legado: pUe) */
function protoTerceiroTitular(
  v: Valores,
  solNome: string,
  titular: string,
  onuNome: string,
): string {
  const { canal, contato, contatoSol, alarme, onu, formaPag, dataVisita, horaVisita, parente } = v;
  return [
    `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP_AST,
    esp(4),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuNome} SEM SINAL.`,
    esp(4),
    SEP_AST,
    esp(4),
    `QUESTIONADO, DISSE QUE A ${onuNome} ESTA COM ${alarme}.`,
    esp(4),
    `REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${solNome} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    esp(4),
    `PERGUNTEI A ${solNome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
    esp(4),
    SEP_AST,
    '',
    `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
    esp(4),
    SEP_AST,
    '',
    `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${titular} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA ${fraseFormaPag(formaPag)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
    '',
    `CLIENTE SEM DUVIDAS.`,
  ].join('\n');
}

/** Sufixo O.S — terceiro solicita, titular acompanha. (legado: cUe) */
function sufixoTerceiroTitular(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${TECNICO}`;
}

/** Protocolo — titular solicita, terceiro acompanha. (legado: mUe) */
function protoTitularTerceiro(
  v: Valores,
  titular: string,
  onuNome: string,
  solMaiusc: string,
): string {
  const { canal, contato, alarme, onu, formaPag, dataVisita, horaVisita, parente } = v;
  return [
    `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
    esp(20),
    SEP_AST,
    esp(24),
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuNome} SEM SINAL.`,
    esp(24),
    SEP_AST,
    esp(24),
    `QUESTIONADO, DISSE QUE A ${onuNome} ESTA COM ${alarme}.`,
    esp(24),
    `REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${titular} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    esp(24),
    `PERGUNTEI A ${titular} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
    esp(24),
    SEP_AST,
    esp(20),
    `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
    esp(20),
    SEP_AST,
    esp(20),
    `${titular} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${titular} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solMaiusc} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
    '',
    `CLIENTE SEM DUVIDAS.`,
  ].join('\n');
}

/** Sufixo O.S — titular solicita, terceiro acompanha. (legado: lUe) */
function sufixoTitularTerceiro(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n${esp(20)}\n${TECNICO}`;
}

/** Protocolo — titular solicita e acompanha (padrão). (legado: dUe) */
function protoTitularTitular(v: Valores, titular: string, onuNome: string): string {
  const { canal, contato, alarme, formaPag, dataVisita, horaVisita, onu } = v;
  return [
    `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP_EQ,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuNome} SEM SINAL.`,
    esp(8),
    SEP_EQ,
    esp(8),
    `QUESTIONADO, DISSE QUE A ${onuNome} ESTA COM ${alarme}.`,
    esp(8),
    `REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${titular} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    esp(8),
    `PERGUNTEI A ${titular} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
    esp(8),
    SEP_EQ,
    '',
    `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
    esp(8),
    SEP_EQ,
    esp(8),
    `${titular} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA ${fraseFormaPag(formaPag)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
    '',
    `CLIENTE SEM DUVIDAS.`,
  ].join('\n');
}

/** Sufixo O.S — titular solicita e acompanha (padrão). (legado: oUe) */
function sufixoTitularTitular(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${TECNICO}`;
}

export function renderManutLuzVermelha(valores: Valores): SaidaOS {
  const vRaw: Valores = {};
  for (const [k, val] of Object.entries(valores)) vRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const v: Valores = new Proxy(vRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  const operador = v.operadorPrimeiroNome ?? '';
  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const clienteMaiusc = maiusc(v.cliente);
  const titular = primeiroNome(clienteMaiusc);
  const solMaiusc = maiusc(v.solicitante);
  const solNome = primeiroNome(solMaiusc);
  const parente = maiusc(v.parente);
  const contato = soDigitos(v.contato);
  const contatoSol = soDigitos(v.contatoSol);
  const onu = maiusc(v.onu);
  const onuNome = primeiroNome(onu);
  const cto = blocoCto(v.ctoType || 'CTOE', maiusc(v.cto), maiusc(v.passante));
  const agenda = linhaAgenda(v, clienteMaiusc, operador);

  // Espelha as mutações do legado antes de montar os textos.
  v.contato = contato;
  v.contatoSol = contatoSol;
  v.parente = parente;
  v.onu = onu;
  v.alarme = maiusc(v.alarme);

  const canal = v.canal ?? '';
  const alarme = maiusc(v.alarme);
  const formaPag = maiusc(v.formaPag ?? '');
  const dataVisita = v.dataVisita ?? '';
  const horaVisita = v.horaVisita ?? '';

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    const os = `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${onuNome} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA. ORIENTEI ${solNome} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${solNome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${solNome} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solMaiusc} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`;
    return {
      protocolo: protoTerceiroTerceiro(v, solNome, titular, solMaiusc, onuNome),
      os: os + cto + sufixoTerceiroTerceiro(),
      agenda,
    };
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    const os = `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${onuNome} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA. ORIENTEI ${solNome} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${solNome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${solNome} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`;
    return {
      protocolo: protoTerceiroTitular(v, solNome, titular, onuNome),
      os: os + cto + sufixoTerceiroTitular(),
      agenda,
    };
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    const os = `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${onuNome} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA. ORIENTEI ${titular} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${titular} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${titular} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${titular} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solMaiusc} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`;
    return {
      protocolo: protoTitularTerceiro(v, titular, onuNome, solMaiusc),
      os: os + cto + sufixoTitularTerceiro(),
      agenda,
    };
  }

  // titular-solicita-titular-acompanha (padrão)
  const os = `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${onuNome} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA. ORIENTEI ${titular} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${titular} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${titular} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`;
  return {
    protocolo: protoTitularTitular(v, titular, onuNome),
    os: os + cto + sufixoTitularTitular(),
    agenda,
  };
}
