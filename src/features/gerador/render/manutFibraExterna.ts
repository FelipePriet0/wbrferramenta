/**
 * Emulação do modelo `manut-fibra-externa` — porte 1:1 da função construtora
 * legada `zUe` do bundle (conteúdo de O.S do próprio app). Ramifica nos 5 tipos
 * de solicitação (titular/PJ/terceiro × acompanhamento). Modelo de manutenção
 * com visita técnica: retorna `protocolo`, `os` e `agenda`. O 2º argumento do
 * builder legado é o primeiro nome do operador (`operadorPrimeiroNome`).
 * Validado por diff contra o legado — ver `manutFibraExterna.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador curto de blocos — 19 asteriscos. (legado: Ik) */
const SEP = '*'.repeat(19);
/** Separador longo — 42 asteriscos. (legado: AUe) */
const SEP_LONGO = '*'.repeat(42);
/** Separador da O.S antes da indicação técnica — 39 iguais. (legado: jUe) */
const SEP_OS = '='.repeat(39);

/** N espaços. (legado: Uk) */
function esp(n: number): string {
  return ' '.repeat(n);
}

/** Indicação técnica da O.S (fibra externa). (legado: NUe) */
const INDICACAO_TECNICA =
  'TECNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE E DE OBRIGACAO DO PROVEDOR, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZACAO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.';

/** Envelope padrão da O.S. (legado: Wk) */
function envelopeOS(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${INDICACAO_TECNICA}`;
}

/** Envelope da O.S do fluxo terceiro-terceiro. (legado: LUe) */
function envelopeOSTerceiro(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n${esp(20)}\n${INDICACAO_TECNICA}`;
}

/** Bloco da CTO no fim da O.S. (legado: IUe) */
function blocoCto(tipo: string, cto: string, passante: string): string {
  if (tipo === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`;
  if (tipo === 'CTOI') return `\nCTOI // ${passante}.\n`;
  return '';
}

/** Prefixo do alarme na agenda. (legado: FUe — vazio quando sem alarme) */
function prefixoAlarme(alarme: string): string {
  return alarme ? maiusc(alarme) : '';
}

export function renderManutFibraExterna(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const nomeCompleto = maiusc(v.cliente); // i
  const titular = primeiroNome(nomeCompleto); // a
  const solCompleto = maiusc(v.solicitante); // o
  const solNome = primeiroNome(solCompleto); // s
  const parente = maiusc(v.parente); // c
  const cargo = maiusc(v.cargo); // l
  const canal = v.canal ?? ''; // u
  const contato = soDigitos(v.contato); // d
  const contatoSol = soDigitos(v.contatoSol); // f
  const onu = maiusc(v.onu); // p
  const onuNome = primeiroNome(onu); // m
  const motivo = maiusc(v.motivo); // h
  const formaPag = maiusc(v.formaPag); // g
  const dataVisita = v.dataVisita ?? ''; // _
  const horaVisita = v.horaVisita ?? ''; // v
  const ctoType = v.ctoType || 'CTOE'; // y
  const operador = maiusc(v.operadorPrimeiroNome); // t (2º arg do builder)

  const b = blocoCto(ctoType, maiusc(v.cto), maiusc(v.passante));

  const agenda = (() => {
    let s = `MAN ${prefixoAlarme(v.alarme ?? '')} ${nomeCompleto} PROT:${
      v.protocolo ?? ''
    } ${formaPag} (${operador}) - ${maiusc(v.bairro)}`;
    if (ctoType === 'CTOI') s += ' *CTOI*';
    return s;
  })();

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => ({
    protocolo: protoLinhas.join('\n'),
    os: osTexto,
    agenda,
  });

  if (tipo === 'pessoa-juridica') {
    return montar(
      [
        `${solNome} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
        '',
        SEP,
        esp(4),
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuNome} SEM SINAL.`,
        esp(4),
        SEP,
        esp(4),
        `QUESTIONADO, DISSE QUE A ${onuNome} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${solNome} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        '',
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
        '',
        SEP,
        '',
        `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
        '',
        SEP,
        '',
        `${solNome} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA ${fraseFormaPag(formaPag)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
        '',
        `CLIENTE SEM DUVIDAS.`,
      ],
      `${solNome} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. PERGUNTEI SOBRE A ${onuNome}, E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ${onuNome} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${solNome} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${solNome} AUTORIZOU VISITA E PAGARA ${fraseFormaPag(formaPag)} NO ATO. VISITA AGENDADA PARA ${dataVisita} AS ${horaVisita} HRS.` +
        b +
        envelopeOS(),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
        '',
        SEP,
        esp(4),
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuNome} SEM SINAL.`,
        esp(4),
        SEP,
        esp(4),
        `QUESTIONADO, ${solNome} DISSE QUE A ${onuNome} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${solNome} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        '',
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
        esp(4),
        `PERGUNTEI A ${solNome} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
        '',
        SEP_LONGO,
        '',
        `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
        esp(4),
        SEP_LONGO,
        '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solCompleto} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${titular} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA ${fraseFormaPag(formaPag)}. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
        '',
        `CLIENTE SEM DUVIDAS.`,
      ],
      `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${onuNome} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${solNome} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${solNome} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solCompleto} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.` +
        b +
        envelopeOSTerceiro(),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
        '',
        SEP,
        esp(4),
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuNome} SEM SINAL.`,
        esp(4),
        SEP,
        esp(4),
        `QUESTIONADO, DISSE QUE A ${onuNome} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${solNome} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        '',
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
        esp(4),
        SEP,
        '',
        `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
        esp(4),
        SEP,
        '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${titular} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA ${fraseFormaPag(formaPag)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
        '',
        `CLIENTE SEM DUVIDAS.`,
      ],
      `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${onuNome} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${solNome} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${solNome} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.` +
        b +
        envelopeOS(),
    );
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
        esp(20),
        SEP,
        esp(24),
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuNome} SEM SINAL.`,
        esp(24),
        SEP,
        esp(24),
        `QUESTIONADO, DISSE QUE A ${onuNome} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${titular} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        '',
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA. `,
        esp(24),
        SEP,
        esp(20),
        `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`,
        esp(20),
        SEP,
        esp(20),
        `${titular} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${titular} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solCompleto} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
        '',
        `CLIENTE SEM DUVIDAS.`,
      ],
      `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${onuNome} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${titular} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${titular} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${titular} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solCompleto} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.` +
        b +
        envelopeOS(),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${onuNome} SEM SINAL.`,
      '',
      SEP,
      '',
      `QUESTIONADO, DISSE QUE "${motivo}".`,
      `PERGUNTEI SOBRE A ${onu} E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${onuNome} ESTA DESCONECTADO/APAGADA. `,
      `ORIENTEI ${titular} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
      '',
      `PERGUNTEI A ${titular} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
      '',
      SEP,
      '',
      `INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${titular} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.`,
      esp(4),
      SEP,
      esp(4),
      `${titular} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ],
    `${titular} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE "${motivo}", E FICOU SEM CONEXAO COM A INTERNET. PERGUNTEI SOBRE A ${onu} E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA. PERGUNTEI A ${titular} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${titular} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${titular} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.` +
      b +
      envelopeOS(),
  );
}
