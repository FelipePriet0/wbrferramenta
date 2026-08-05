/**
 * Emulação do modelo `altplan-sem-troca-visita-isenta` — porte 1:1 da função
 * `PVe` do bundle legado (conteúdo de O.S do próprio app). Ramifica nos 4 tipos
 * de solicitação (titular/terceiro × acompanhamento) e no modo "ofertado".
 * Diferente do remoto/presencial, este modelo agenda VISITA TÉCNICA ISENTA, por
 * isso retorna também `agenda`. Validado por diff contra o legado — ver
 * `altplanSemTrocaVisitaIsenta.diff.test.ts`.
 */
import {
  descreveSinal,
  maiusc,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador do bloco ONU/plano no Protocolo — 14 asteriscos. (legado: _O) */
const SEP_ONU = '*'.repeat(14);
/** Separador antes da INDICAÇÃO TÉCNICA na O.S — 35 asteriscos. (legado: EVe) */
const SEP_OS = '*'.repeat(35);

/** origem === 'ofertado'. (legado: UD com sVe = 'ofertado') */
function ehOfertado(v: Valores): boolean {
  return String(v.origem ?? 'padrao') === 'ofertado';
}

/** Transforma o Protocolo para o modo ofertado. (legado: WD) */
function ofertadoProtocolo(texto: string): string {
  return texto
    .replace(
      /^(.+?) ENTROU EM CONTATO (?:VIA|POR) (.+?) SOLICITANDO ALTERAÇÃO DE PLANO\./m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO.',
    )
    .replace(/QUESTIONADO, CLIENTE DISSE QUE "[^\n]*"\.\n/, '')
    .replace(/PLANO SOLICITADO: ?/, 'PLANO OFERTADO: ');
}

/** Transforma a O.S para o modo ofertado. (legado: GD) */
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

/** Bloco motivo + plano do Protocolo. (legado: TO) */
function blocoPlano(m: {
  motivo: string;
  planoAtual: string;
  planoEscolhido: string;
  roteador: string;
  dataContrato: string;
}): string[] {
  return [
    `QUESTIONADO, CLIENTE DISSE QUE "${m.motivo}".`,
    '',
    `PLANO ATUAL: ${m.planoAtual} CONTRATADO EM ${m.dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${m.roteador}`,
    '',
    `PLANO SOLICITADO: ${m.planoEscolhido}`,
    '',
    'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. ',
    '',
    '',
    SEP_ONU,
    '',
  ];
}

/**
 * Indicação técnica da O.S. O bundle usa espaço duplo após "CONTRATADA." apenas
 * no fluxo titular-solicita-titular (t = true). (legado: NVe)
 */
function indicacaoTecnica(duploEspaco: boolean): string {
  const sep = duploEspaco ? '  ' : ' ';
  return `TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. FAZER TESTE DA BANDA CONTRATADA.${sep}PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.`;
}

/** Envelope da O.S com separador + indicação técnica. (legado: EO) */
function envelopeOS(corpo: string, duploEspaco = false): string {
  return `${corpo}\n\n${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${indicacaoTecnica(duploEspaco)}`;
}

export function renderAltplanSemTrocaVisitaIsenta(
  valores: Valores,
): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const nomeCompleto = maiusc(v.cliente);
  const titular = primeiroNome(nomeCompleto);
  const solNome = primeiroNome(maiusc(v.solicitante));
  const solCompleto = maiusc(v.solicitante);
  const autorizado = maiusc(v.autorizado);
  const parente = maiusc(v.parente);
  const canal = v.canal ?? '';
  const contato = soDigitos(v.contato);
  const contatoSol = soDigitos(v.contatoSol);
  const bairro = maiusc(v.bairro);
  const m = {
    motivo: maiusc(v.motivo),
    planoAtual: v.planoAtual ?? '',
    planoEscolhido: v.planoEscolhido ?? '',
    roteador: maiusc(v.roteador),
    dataContrato: maiusc(v.dataContrato),
  };
  const dataVisita = v.dataVisita ?? '';
  const horaVisita = v.horaVisita ?? '';
  const protocolo = v.protocolo ?? '';
  const sinal = descreveSinal(v);
  const ofertado = ehOfertado(v);

  // O 2º arg do builder legado (`t`) era o primeiro nome do operador, impresso na
  // agenda como ` (${t})`. Aqui é lido de `valores.operadorPrimeiroNome`, igual aos
  // demais modelos do gerador — sem operador, o slot some (fixtures do legado).
  const operador = maiusc(v.operadorPrimeiroNome ?? '');
  const ref = operador ? ` (${operador})` : '';
  const agenda = `ALT PLANO ${nomeCompleto} PROT:${protocolo} ISENTO${ref} - ${bairro}`;

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => {
    const proto = protoLinhas.join('\n');
    return {
      protocolo: ofertado ? ofertadoProtocolo(proto) : proto,
      os: ofertado ? ofertadoOS(osTexto) : osTexto,
      agenda,
    };
  };

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        `${titular} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`,
        '', SEP_ONU, '',
        `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}`,
        '', SEP_ONU,
        ...blocoPlano(m),
        `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${m.roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${titular} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${titular} POSSA TER, NO QUAL ESSA VISITA É ISENTA DE CUSTOS.`,
        '', SEP_ONU, '',
        `${titular} CONCORDOU COM A VISITA E DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA ISENTA DE CUSTOS AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      envelopeOS(
        `${titular} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${m.planoAtual}. PLANO ESCOLHIDO: ${m.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${titular} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. ${titular} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.`,
        '', SEP_ONU, '',
        `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}`,
        '', SEP_ONU,
        ...blocoPlano(m),
        `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${m.roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${solNome} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${solNome} POSSA TER, NO QUAL ESSA VISITA É ISENTA DE CUSTOS.`,
        '', SEP_ONU, '',
        `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      envelopeOS(
        `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${m.planoAtual}. PLANO ESCOLHIDO: ${m.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solNome} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.`,
        '', SEP_ONU, '',
        `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}`,
        '', SEP_ONU,
        ...blocoPlano(m),
        `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${m.roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${solNome} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${solNome} POSSA TER, NO QUAL ESSA VISITA É ISENTA DE CUSTOS.`,
        '', SEP_ONU, '',
        `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solCompleto} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      envelopeOS(
        `${solNome} (${parente} DE ${titular}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${m.planoAtual}. PLANO ESCOLHIDO: ${m.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solNome} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solCompleto} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      `${titular} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`,
      '', SEP_ONU, '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}`,
      '', SEP_ONU,
      ...blocoPlano(m),
      `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${m.roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${titular} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${titular} POSSA TER, NO QUAL ESSA VISITA É ISENTA DE CUSTOS.`,
      '', SEP_ONU, '',
      `${titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ],
    envelopeOS(
      `${titular} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${m.planoAtual}. PLANO ESCOLHIDO: ${m.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${titular} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      true,
    ),
  );
}
