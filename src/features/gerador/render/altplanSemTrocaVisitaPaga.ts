/**
 * Emulação do modelo `altplan-sem-troca-visita-paga` — porte 1:1 da função `YVe`
 * do bundle legado (conteúdo de O.S do próprio app). Sem troca de equipamento,
 * com visita técnica paga (R$50,00). Ramifica nos 4 valores de `tipoSolicitacao`
 * e no modo "ofertado". Retorna também `agenda`. Validado por diff contra o
 * legado — ver `altplanSemTrocaVisitaPaga.diff.test.ts`.
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

/** Separador de bloco do protocolo (legado: BAR de 14 asteriscos). */
const BAR = '**************';

/** Separador da indicação técnica na O.S (legado: VVe, 35 asteriscos). */
const VVe = '***********************************';

/** Bloco de indicação técnica padrão (legado: JVe). */
const JVe =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO.  FAZER TESTE DA BANDA CONTRATADA.  PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_WBR"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.';

interface DadosPlano {
  motivo: string;
  planoAtual: string;
  planoEscolhido: string;
  roteador: string;
  dataContrato: string;
}

/** Cabeçalho + sinal + motivo + plano (legado: IO). */
function IO(abertura: string, sinal: string, m: DadosPlano): string[] {
  return [
    abertura,
    '',
    BAR,
    '    ',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinal}`,
    '    ',
    BAR,
    `QUESTIONADO, CLIENTE DISSE QUE "${m.motivo}".`,
    '',
    `PLANO ATUAL: ${m.planoAtual} CONTRATADO EM ${m.dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${m.roteador}`,
    '',
    `PLANO SOLICITADO: ${m.planoEscolhido}`,
    '',
    'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. ',
    '',
    '',
    BAR,
    '',
  ];
}

/** Linha de compatibilidade + desejo de visita (legado: LO). */
function LO(nome: string, roteador: string): string {
  return `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA. PORÉM, ${nome} DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DOS APLICATIVOS. O TÉCNICO REALIZARÁ OS TESTES DE ABRANGÊNCIA, QUALIDADE E VELOCIDADE, SANAR TODAS AS DÚVIDAS QUE ${nome} POSSA TER, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO, ESTE VALOR A SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.`;
}

/** Envolve a O.S com o rodapé de indicação técnica (legado: FO). */
function FO(texto: string): string {
  return `${texto}

${VVe}

INDICAÇÃO TÉCNICA:

${JVe}`;
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

export function renderAltplanSemTrocaVisitaPaga(valores: Valores): SaidaOS {
  const n: Valores = {};
  for (const [k, val] of Object.entries(valores)) n[k] = String(val ?? '');

  const tipo = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const i = maiusc(n.cliente);
  const a = primeiroNome(i);
  const o = maiusc(n.solicitante);
  const s = primeiroNome(o);
  const c = maiusc(n.autorizado);
  const l = maiusc(n.parente);
  const u = n.canal ?? '';
  const d = soDigitos(n.contato);
  const f = soDigitos(n.contatoSol);
  const p = maiusc(n.bairro);
  const m: DadosPlano = {
    motivo: maiusc(n.motivo),
    planoAtual: n.planoAtual ?? '',
    planoEscolhido: n.planoEscolhido ?? '',
    roteador: maiusc(n.roteador),
    dataContrato: maiusc(n.dataContrato),
  };
  const h = n.dataVisita ?? '';
  const g = n.horaVisita ?? '';
  const proto = n.protocolo ?? '';
  const v = maiusc(n.formaPag);
  const y = descreveSinal(n);
  // Legado: YVe(e,t) usa o 2º parâmetro `t` (primeiro nome do operador) na agenda.
  // Aqui é lido de `valores.operadorPrimeiroNome`, igual aos demais modelos do
  // gerador — sem operador, o slot some (fixtures do legado geradas sem `t`).
  const t = maiusc(n.operadorPrimeiroNome ?? '');
  const ref = t ? ` (${t})` : '';
  const agenda = `ALT PLANO ${i} PROT:${proto} ${v}${ref} - ${p}`;
  const ofertado = String(n.origem ?? 'padrao') === 'ofertado';

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => {
    const protoTexto = protoLinhas.join('\n');
    return {
      protocolo: ofertado ? ofertadoProtocolo(protoTexto) : protoTexto,
      os: ofertado ? ofertadoOS(osTexto) : osTexto,
      agenda,
    };
  };

  const C = `${a} ENTROU EM CONTATO VIA ${u} (${d}) SOLICITANDO ALTERAÇÃO DE PLANO.`;
  const w = `${s} (${l} DE ${a}) ENTROU EM CONTATO VIA ${u} (${f}) SOLICITANDO ALTERAÇÃO DE PLANO.`;

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        ...IO(C, y, m),
        LO(a, m.roteador),
        '',
        BAR,
        '',
        `${a} CONCORDOU COM A VISITA E DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${c} (${l}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${v}, AGENDADA (A PEDIDO DO CLIENTE) PARA ${h} ÀS ${g} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      FO(
        `${a} SOLICITOU POR ${u} (${d}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${m.planoAtual}. PLANO ESCOLHIDO: ${m.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${a} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. ${a} CONCORDOU COM A VISITA, DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${c} (${l}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO ${fraseFormaPag(v)}. AGENDADA (A PEDIDO DO CLIENTE) PARA ${h} ÀS ${g} HRS.`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        ...IO(w, y, m),
        LO(s, m.roteador),
        '',
        BAR,
        '',
        `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${u} (${d}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${a} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${v}, AGENDADA PARA O DIA ${h} ÀS ${g} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      FO(
        `${s} (${l} DE ${a}) ENTROU EM CONTATO VIA ${u} (${f}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${m.planoAtual}. PLANO ESCOLHIDO: ${m.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${s} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${u} (${d}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO ${fraseFormaPag(v)}. AGENDADA PARA O DIA ${h} ÀS ${g} HRS.`,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        ...IO(w, y, m),
        LO(s, m.roteador),
        '',
        BAR,
        '',
        `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${u} (${d}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${o} (${l}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. ${a} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${v}, AGENDADA PARA O DIA ${h} ÀS ${g} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      FO(
        `${s} (${l} DE ${a}) ENTROU EM CONTATO VIA ${u} (${f}) E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${m.planoAtual}. PLANO ESCOLHIDO: ${m.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${s} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${u} (${d}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${o} (${l}) A ACOMPANHAR O TÉCNICO E ASSINAR O.S. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO ${fraseFormaPag(v)}. AGENDADA PARA ${h} ÀS ${g} HRS.`,
      ),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      ...IO(C, y, m),
      LO(a, m.roteador),
      '',
      BAR,
      '',
      `${a} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VISITA COM CUSTO DE R$50,00 SERÁ PAGA NO ATO COM ${v}, E FOI AGENDADA PARA O DIA ${h} ÀS ${g} HRS.`,
    ],
    FO(
      `${a} SOLICITOU POR ${u} (${d}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${m.planoAtual}. PLANO ESCOLHIDO: ${m.planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${a} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, PORÉM, DESEJA VISITA TÉCNICA PARA INSTRUÇÕES, AFERIÇÃO DO NOVO PLANO E INSTALAÇÃO DO APLICATIVO. VISITA TÉCNICA COM CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO E SERÁ PAGO NO ATO ${fraseFormaPag(v)}. AGENDADA PARA ${h} ÀS ${g} HRS.`,
    ),
  );
}
