/**
 * Emulação do modelo `altplan-troca-visita-paga` — porte 1:1 da função `PHe` do
 * bundle legado (conteúdo de O.S do próprio app). Troca de plano COM visita
 * técnica paga (troca de roteador). Ramifica nos 4 tipos de solicitação e no
 * modo "ofertado". Retorna protocolo, os e agenda. Validado por diff contra o
 * legado — ver `altplanTrocaVisitaPaga.diff.test.ts`.
 */
import {
  descreveSinal,
  fraseFormaPag,
  maiusc,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** origem === 'ofertado' (legado: UD / sVe). */
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

/** Separador de bloco do modelo (legado). */
const SEP_BLOCO = '**************';
/** Separador longo antes da indicação técnica (legado: CHe). */
const SEP_LONGO = '***********************************';

/** Cláusula de renovação + necessidade de visita/troca de roteador (legado: MHe). */
const CLAUSULA_RENOVACAO =
  'RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. É NECESSÁRIA VISITA TÉCNICA PARA TROCA DO ROTEADOR WI-FI POR OUTRO COMPATÍVEL COM O NOVO PLANO ESCOLHIDO, TAL EQUIPAMENTO IRÁ SUBSTITUIR O ROTEADOR INSTALADO ANTERIORMENTE E PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO.';

/** Indicação técnica padrão (legado: NHe). */
const INDICACAO_TECNICA =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO, FAZER TESTES ANTES E DEPOIS DA TROCA DO ROTEADOR. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), SOLICITAR ESCOLHA DA SENHA, CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.';

interface DadosPlano {
  motivo: string;
  planoAtual: string;
  planoEscolhido: string;
  roteador: string;
  dataContrato: string;
}

/** Bloco comum do protocolo, do 1º parágrafo até o separador de opções (legado: nk). */
function blocoProtocolo(
  entrada: string,
  sinal: string,
  compat: string,
  p: DadosPlano,
): string[] {
  return [
    entrada,
    '',
    SEP_BLOCO,
    '    ',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}`,
    '    ',
    SEP_BLOCO,
    `QUESTIONADO, CLIENTE DISSE QUE "${p.motivo}".`,
    '',
    `PLANO ATUAL: ${p.planoAtual} CONTRATADO EM ${p.dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${p.roteador}`,
    '',
    `PLANO SOLICITADO: ${p.planoEscolhido}`,
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

/** Fecha a O.S com o separador longo + indicação técnica (legado: tk). */
function fechaOS(corpo: string): string {
  return `${corpo}\n\n${SEP_LONGO}\n\nINDICAÇÃO TÉCNICA:\n\n${INDICACAO_TECNICA}`;
}

export function renderAltplanTrocaVisitaPaga(
  valores: Valores,
): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const nomeCompleto = maiusc(v.cliente);
  const a = primeiroNome(nomeCompleto);
  const o = maiusc(v.solicitante);
  const s = primeiroNome(o);
  const autorizado = maiusc(v.autorizado);
  const parente = maiusc(v.parente);
  const canal = v.canal ?? '';
  const contato = soDigitos(v.contato);
  const contatoSol = soDigitos(v.contatoSol);
  const bairro = maiusc(v.bairro);
  const roteadorTxt = maiusc(v.roteador);
  const compat =
    maiusc(v.compativel) === 'NÃO'
      ? `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteadorTxt}) NÃO É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA, E ASSIM SE FAZ NECESSÁRIO O AGENDAMENTO DE VISITA TÉCNICA PARA SUBSTITUIÇÃO DO ROTEADOR PARA UM MODELO COMPATÍVEL COM TAL VELOCIDADE, REALIZAR OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER. ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO, A SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.`
      : `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteadorTxt}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA, PORÉM FAREMOS O AGENDAMENTO DE VISITA TÉCNICA PARA INSTALAÇÃO DE UM NOVO ROTEADOR COM VERSÃO ATUALIZADA. APÓS INSTALADO, FAREMOS OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER. ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO, A SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.`;
  const roteadorSug = maiusc(v.roteadorSug);
  const formaPag = maiusc(v.formaPag);
  const p: DadosPlano = {
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
  const agenda = `ALT PLANO ${nomeCompleto} PROT:${protocolo} ${formaPag}${ref} - ${bairro}${sug}`;
  const custoVisita = `VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO ${fraseFormaPag(formaPag)}.`;
  const ofertado = ehOfertado(v);

  const montar = (proto: string, osTexto: string): SaidaOS => ({
    protocolo: ofertado ? ofertadoProtocolo(proto) : proto,
    os: ofertado ? ofertadoOS(osTexto) : osTexto,
    agenda,
  });

  const entradaTitular = `${a} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO ALTERAÇÃO DE PLANO.`;
  const entradaTerceiro = `${s} (${parente} DE ${a}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) SOLICITANDO ALTERAÇÃO DE PLANO.`;
  const osTitular = `${a} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${p.planoAtual}. PLANO ESCOLHIDO: ${p.planoEscolhido}. ${CLAUSULA_RENOVACAO}`;
  const osTerceiro = `${s} (${parente} DE ${a}) ENTROU EM CONTATO VIA ${canal} (${contatoSol}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${p.planoAtual}. PLANO ESCOLHIDO: ${p.planoEscolhido}. ${CLAUSULA_RENOVACAO}`;

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        ...blocoProtocolo(entradaTitular, sinal, compat, p),
        `${a} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS. OPTOU POR REALIZAR O PAGAMENTO ${fraseFormaPag(formaPag)}, NO ATO. ${a} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ].join('\n'),
      fechaOS(
        `${osTitular} ${a} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${custoVisita} VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        ...blocoProtocolo(entradaTerceiro, sinal, compat, p),
        `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${a} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${custoVisita} AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ].join('\n'),
      fechaOS(
        `${osTerceiro} POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${custoVisita} AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        ...blocoProtocolo(entradaTerceiro, sinal, compat, p),
        `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${o} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${a} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. PAGAMENTO SERÁ REALIZADO ${fraseFormaPag(formaPag)}. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ].join('\n'),
      fechaOS(
        `${osTerceiro} POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${o} (${parente}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${custoVisita} AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      ),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      ...blocoProtocolo(entradaTitular, sinal, compat, p),
      `${a} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS. OPTOU POR REALIZAR O PAGAMENTO ${fraseFormaPag(formaPag)}, NO ATO, E A VISITA TÉCNICA FOI AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO.`,
    ].join('\n'),
    fechaOS(`${osTitular} ${custoVisita} VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`),
  );
}
