/**
 * Emulação do modelo `altplan-troca-visita-isenta` — porte 1:1 da função `hHe`
 * do bundle legado (conteúdo de O.S do próprio app). É a troca de plano COM troca
 * de roteador (visita técnica) porém ISENTA de custo. Ramifica nos 4 tipos de
 * solicitação (titular/terceiro × solicita/acompanha) e no modo "ofertado".
 * Retorna também o texto de agenda. Validado por diff contra o legado — ver
 * `altplanTrocaVisitaIsenta.diff.test.ts`.
 */
import {
  descreveSinal,
  maiusc,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador de bloco do protocolo (legado: qD desta família). */
const SEP_BLOCO = '**************';
/** Separador da indicação técnica na O.S. */
const SEP_INDICACAO = '***********************************';

/**
 * Trecho fixo de renovação/necessidade de visita para troca de roteador.
 * (legado: pHe)
 */
const CONTRATO_VISITA =
  'RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. É NECESSÁRIA VISITA TÉCNICA PARA TROCA DO ROTEADOR WI-FI POR OUTRO COMPATÍVEL COM O NOVO PLANO ESCOLHIDO, TAL EQUIPAMENTO IRÁ SUBSTITUIR O ROTEADOR INSTALADO ANTERIORMENTE E PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO.';

/** Bloco de indicação técnica (legado: mHe). */
const INDICACAO_TECNICA =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO, FAZER TESTES ANTES E DEPOIS DA TROCA DO ROTEADOR. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), SOLICITAR ESCOLHA DA SENHA, CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.';

interface Plano {
  motivo: string;
  planoAtual: string;
  planoEscolhido: string;
  roteador: string;
  dataContrato: string;
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

/** Envelope da indicação técnica na O.S (legado: GO). */
function comIndicacaoTecnica(texto: string): string {
  return `${texto}\n\n${SEP_INDICACAO}\n\nINDICAÇÃO TÉCNICA:\n\n${INDICACAO_TECNICA}`;
}

/** Bloco superior do protocolo, comum a todos os tipos (legado: KO desta família). */
function blocoProtocolo(intro: string, sinal: string, compat: string, plano: Plano): string[] {
  return [
    intro,
    '',
    SEP_BLOCO,
    '    ',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}`,
    '    ',
    SEP_BLOCO,
    `QUESTIONADO, CLIENTE DISSE QUE "${plano.motivo}".`,
    '',
    `PLANO ATUAL: ${plano.planoAtual} CONTRATADO EM ${plano.dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${plano.roteador}`,
    '',
    `PLANO SOLICITADO: ${plano.planoEscolhido}`,
    '',
    'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. ',
    '',
    '',
    SEP_BLOCO,
    '',
    compat,
    '',
    SEP_BLOCO,
    '',
  ];
}

export function renderAltplanTrocaVisitaIsenta(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const clienteFull = maiusc(v.cliente);
  const titular = primeiroNome(clienteFull);
  const solFull = maiusc(v.solicitante);
  const sol = primeiroNome(solFull);
  const autorizado = maiusc(v.autorizado);
  const parente = maiusc(v.parente);
  const canal = v.canal ?? '';
  const contato = soDigitos(v.contato);
  const contatoSol = soDigitos(v.contatoSol);
  const bairro = maiusc(v.bairro);
  const roteadorTxt = maiusc(v.roteador);
  const compat =
    maiusc(v.compativel) === 'NÃO'
      ? `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteadorTxt}) NÃO É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA, E ASSIM SE FAZ NECESSÁRIO O AGENDAMENTO DE VISITA TÉCNICA PARA SUBSTITUIÇÃO DO ROTEADOR PARA UM MODELO COMPATÍVEL COM TAL VELOCIDADE, REALIZAR OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER. VISITA ISENTA DE CUSTOS.`
      : `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteadorTxt}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA, PORÉM FAREMOS O AGENDAMENTO DE VISITA TÉCNICA PARA INSTALAÇÃO DE UM NOVO ROTEADOR COM VERSÃO ATUALIZADA. APÓS INSTALADO, FAREMOS OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER. VISITA ISENTA DE CUSTOS.`;
  const roteadorSug = maiusc(v.roteadorSug);
  const plano: Plano = {
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
  // O 2º arg do builder legado (`t`) era o primeiro nome do operador, impresso na
  // agenda como ` (${t})`. Aqui é lido de `valores.operadorPrimeiroNome`, igual aos
  // demais modelos do gerador — sem operador, o slot some (fixtures do legado).
  const operador = maiusc(v.operadorPrimeiroNome ?? '');
  const ref = operador ? ` (${operador})` : '';
  const sug = roteadorSug ? ` // ${roteadorSug}` : '';
  const agenda = `ALT PLANO ${clienteFull} PROT:${protocolo} ISENTO${ref} - ${bairro}${sug}`;
  const ofertado = ehOfertado(v);

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => {
    const proto = protoLinhas.join('\n');
    return {
      protocolo: ofertado ? ofertadoProtocolo(proto) : proto,
      os: ofertado ? ofertadoOS(osTexto) : osTexto,
      agenda,
    };
  };

  const introTitular = `${titular} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`;
  const introTerceiro = `${sol} (${parente} DE ${titular}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.`;
  const osTitular = `${titular} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${plano.planoAtual}. PLANO ESCOLHIDO: ${plano.planoEscolhido}. ${CONTRATO_VISITA}`;
  const osTerceiro = `${sol} (${parente} DE ${titular}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${plano.planoAtual}. PLANO ESCOLHIDO: ${plano.planoEscolhido}. ${CONTRATO_VISITA}`;

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        ...blocoProtocolo(introTitular, sinal, compat, plano),
        `${titular} CONCORDOU COM A VISITA E DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA ISENTA DE CUSTOS AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      comIndicacaoTecnica(
        `${osTitular} ${titular} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        ...blocoProtocolo(introTerceiro, sinal, compat, plano),
        `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      comIndicacaoTecnica(
        `${osTerceiro} POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA ISENTA DE CUSTOS AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        ...blocoProtocolo(introTerceiro, sinal, compat, plano),
        `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solFull} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${titular} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      comIndicacaoTecnica(
        `${osTerceiro} POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${titular} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solFull} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA ISENTA DE CUSTOS AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      ...blocoProtocolo(introTitular, sinal, compat, plano),
      `${titular} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS, E VISITA TÉCNICA ISENTA DE CUSTOS FOI AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO.`,
    ],
    comIndicacaoTecnica(
      `${osTitular} VISITA TÉCNICA ISENTA DE CUSTOS. VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
    ),
  );
}
