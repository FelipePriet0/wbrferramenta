/**
 * Emulação do modelo `altplan-remoto` — porte 1:1 da função `uVe` do bundle
 * legado (conteúdo de O.S do próprio app). Ramifica em titular/terceiro/PJ e no
 * modo "ofertado". Validado por diff contra o legado — ver
 * `altplanRemoto.diff.test.ts`.
 */
import {
  agoraDataHora,
  descreveSinal,
  linhas,
  maiusc,
  parteData,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import {
  BENEFICIOS_APOS_ASSINATURA,
  OPCAO_REMOTA,
  OPCAO_VISITA_PAGA,
  OPCOES_INTRO,
  SEM_CUSTOS,
  SEP,
} from './frases';

export interface SaidaOS {
  protocolo: string;
  os: string;
  /** Texto de agendamento (modelos com visita técnica). */
  agenda?: string;
  /** Saída única combinada (alguns modelos de manutenção). */
  saida?: string;
  /** Termo para o cliente ler/assinar (modelo Termo de responsabilidade). */
  termo?: string;
}

/** origem === 'ofertado' (legado: UD). */
function ehOfertado(v: Valores): boolean {
  return String(v.origem ?? 'padrao') === 'ofertado';
}

/** Transforma o Protocolo para o modo ofertado (legado: WD). */
function ofertadoProtocolo(texto: string): string {
  return texto
    .replace(
      /^(.+?) ENTROU EM CONTATO (?:VIA|POR) (.+?) SOLICITANDO ALTERAÇÃO DE PLANO\./m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO.',
    )
    .replace(/QUESTIONADO, CLIENTE DISSE QUE "[^\n]*"\.\n/, '')
    .replace(/PLANO SOLICITADO: ?/, 'PLANO OFERTADO: ');
}

/** Transforma a O.S para o modo ofertado (legado: GD). */
function ofertadoOS(texto: string): string {
  return texto
    .replace(
      /^(.+?) SOLICITOU POR (.+?) ALTERAÇÃO DO PLANO DE INTERNET:/m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO DE INTERNET:',
    )
    .replace(
      /^(.+?) ENTROU EM CONTATO VIA (.+?) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET:/m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO DE INTERNET:',
    )
    .replace(/PLANO ESCOLHIDO: ?/, 'PLANO OFERTADO: ');
}

export function renderAltplanRemoto(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular';
  const titular = primeiroNome(maiusc(v.cliente));
  const sol = primeiroNome(maiusc(v.solicitante));
  const parente = maiusc(v.parente);
  const cargo = maiusc(v.cargo);
  const canal = v.canal ?? '';
  const contato = soDigitos(v.contato);
  const contatoSol = soDigitos(v.contatoSol);
  const motivo = maiusc(v.motivo);
  const planoAtual = v.planoAtual ?? '';
  const planoEscolhido = v.planoEscolhido ?? '';
  const roteador = maiusc(v.roteador);
  const dataContrato = maiusc(v.dataContrato);
  const protocolo = v.protocolo ?? '';
  const sinal = descreveSinal(v);
  const [ligData, ligHora] = parteData(v.dataLigacao);
  const [protData, protHora] = parteData(v.dataProtocolo);
  const ofertado = ehOfertado(v);

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => {
    const proto = linhas(...protoLinhas);
    return {
      protocolo: ofertado ? ofertadoProtocolo(proto) : proto,
      os: ofertado ? ofertadoOS(osTexto) : osTexto,
    };
  };

  const blocoPlano = [
    `PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${roteador}`,
    '',
    `PLANO SOLICITADO: ${planoEscolhido}`,
  ];
  /**
   * Encerramento da O.S (execução remota, sem intervenção técnica) — puxa o
   * roteador/ONT já informado no formulário e a data/hora ATUAL (do momento
   * em que o texto é gerado/copiado, não um campo preenchido pelo operador).
   */
  const blocoEncerramento = (): string => {
    const [dataAtual, horaAtual] = agoraDataHora();
    return linhas(
      '',
      '',
      'ALTERAÇÃO DE PLANO EXECUTADA REMOTAMENTE COM SUCESSO.',
      'ASSINATURA DIGITAL + SELFIE EM ANEXO.',
      `NÃO HOUVE INTERVENÇÃO TÉCNICA DEVIDO O ROTEADOR EM COMODATO SER COMPATÍVEL AO PLANO ACORDADO (${roteador}).`,
      'CLIENTE SEM DÚVIDAS.',
      '',
      `DATA/HORA DO ENCERRAMENTO: ${dataAtual} ÀS ${horaAtual}HRS`,
    );
  };

  const blocoOpcoes = [
    `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA.`,
    OPCOES_INTRO,
    '',
    OPCAO_VISITA_PAGA,
    '',
  ];

  if (tipo === 'terceiro') {
    return montar(
      [
        `${sol} (${parente} DE ${titular}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.`,
        '', SEP, '',
        `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}.`,
        '', SEP,
        `QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`,
        '', ...blocoPlano, '',
        'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. ',
        '', '', SEP, ...blocoOpcoes, OPCAO_REMOTA, SEM_CUSTOS, BENEFICIOS_APOS_ASSINATURA, '', SEP,
        `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${titular} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR ${canal} (${contato}) SOB PROTOCOLO Nº${protocolo} EM ${ligData} ÀS ${ligHora} HRS.`,
        '',
        `${titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES.`,
        '',
        'CLIENTE NÃO TEM DÚVIDAS',
      ],
      `${sol} (${parente} DE ${titular}) SOLICITOU POR ${canal} (${contatoSol}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${sol} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${titular} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR ${canal} (${contato}) SOB PROTOCOLO Nº${protocolo} EM ${ligData} ÀS ${ligHora} HRS.${blocoEncerramento()}`,
    );
  }

  if (tipo === 'pj') {
    return montar(
      [
        `${sol} (${cargo}) ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`,
        '', SEP, '',
        `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}`,
        '', SEP,
        `QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`,
        '', ...blocoPlano, '', SEP, ...blocoOpcoes, OPCAO_REMOTA, SEM_CUSTOS, '', SEP, '',
        `${sol} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA POR ${canal} (${contato}) DIA ${ligData} ÀS ${ligHora} HRS.`,
      ],
      `${sol} (${cargo}) SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${sol} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº${protocolo} EM ${protData} ÀS ${protHora} HRS.${blocoEncerramento()}`,
    );
  }

  // titular (padrão)
  return montar(
    [
      `${titular} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`,
      '', SEP, '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}`,
      '', SEP,
      `QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`,
      '', ...blocoPlano, '',
      'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. ',
      '', '', SEP, ...blocoOpcoes, OPCAO_REMOTA, SEM_CUSTOS, BENEFICIOS_APOS_ASSINATURA, '', SEP, '',
      `${titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA POR ${canal} (${contato}) DIA ${ligData} ÀS ${ligHora} HRS.`,
    ],
    `${titular} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${titular} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº${protocolo} EM ${protData} ÀS ${protHora} HRS.${blocoEncerramento()}`,
  );
}
