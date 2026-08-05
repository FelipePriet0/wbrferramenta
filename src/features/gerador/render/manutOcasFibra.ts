/**
 * Emulação do modelo `manut-ocas-fibra` (Dano ocasionado · fibra) — porte 1:1 da
 * função `mWe` do bundle legado (conteúdo de O.S do próprio app). Ramifica nos 4
 * tipos de solicitação (titular/terceiro × quem acompanha). Modelo de manutenção:
 * agenda visita técnica, por isso retorna também `agenda`. O 2º argumento do
 * builder legado é o `operadorPrimeiroNome` — aqui lido de
 * `valores.operadorPrimeiroNome`. Validado por diff contra o legado — ver
 * `manutOcasFibra.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, nucleoCustoDrop, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

/** Separador longo do Protocolo — 42 asteriscos. (legado: nA) */
const SEP_LONGO = '*'.repeat(42);
/** Separador curto do Protocolo (fluxos terceiro) — 19 asteriscos. (legado: tA) */
const SEP_CURTO = '*'.repeat(19);
/** Separador antes da INDICAÇÃO TÉCNICA na O.S — 39 sinais de igual. (legado: rWe) */
const SEP_OS = '='.repeat(39);

/** n espaços. (legado: lA) */
function esp(n: number): string {
  return ' '.repeat(n);
}

/** Primeiras 2 palavras do alarme. (legado: fWe) */
function duasPalavras(v: string): string {
  return v.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(' ');
}

/** Bloco CTO na O.S. (legado: dWe) */
function blocoCto(tipo: string, cto: string, passante: string): string {
  if (tipo === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`;
  if (tipo === 'CTOI') return `\nCTOI // ${passante}.\n`;
  return '';
}

/** Indicação técnica da O.S. (legado: lWe) */
function indicacaoTecnica(nome: string): string {
  return `TECNICO: VERIFICAR DROP INTERNO E EXTERNO, SE SOBRA TECNICA FOR SUFICIENTE, USAR PARA REPARO E RESTABELECER CONEXAO. CASO NAO SEJA PASSAR OUTRO DROP. CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO. AO FINALIZAR ENTRAR EM CONTATO COM SUPORTE PARA CONFERIR SINAL E CONFIRMAR NORMALIZACAO COM ${nome}. TEMPO ESTIMADO 60 MIN.`;
}

/** Envelope padrão da O.S (fluxos titular e terceiro-acompanha-titular). (legado: uA) */
function envelopeOS(nome: string): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${indicacaoTecnica(nome)}`;
}

/** Envelope da O.S do fluxo terceiro-solicita-terceiro (linha recuada). (legado: pWe) */
function envelopeOSRecuado(nome: string): string {
  return `${SEP_OS}\n${esp(18)}\nINDICACAO TECNICA:\n\n${indicacaoTecnica(nome)}`;
}

/** Texto do bloco de custo (fluxo terceiro-acompanha-titular). (legado: cWe) */
const BLOCO_CUSTO =
  'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA. ESTA VISITA TECNICA POSSUI O CUSTO DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.';

export function renderManutOcasFibra(valores: Valores): SaidaOS {
  const vRaw: Valores = {};
  for (const [k, val] of Object.entries(valores)) vRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const v: Valores = new Proxy(vRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const t = v.operadorPrimeiroNome; // 2º arg do builder legado

  const i = maiusc(v.cliente); // nome completo
  const a = primeiroNome(i); // primeiro nome do titular
  const o = maiusc(v.solicitante); // nome completo do solicitante
  const s = primeiroNome(o); // primeiro nome do solicitante
  const c = maiusc(v.parente);
  const l = v.canal;
  const u = soDigitos(v.contato);
  const d = soDigitos(v.contatoSol);
  const f = primeiroNome(maiusc(v.onu));
  const p = maiusc(v.motivo);
  const m = v.valor ?? ''; // ausente => '' (some do texto em vez de 'undefined')
  // Explicação dos TERMOS do custo (drop com sobra = R$50 / drop novo = R$100),
  // condicional ao valor. Protocolo: explicação + formas de pagamento. O.S: só a
  // explicação (a frase de pagamento vem logo depois no template). Ausente => ''
  // (fidelidade às fixtures). Núcleo compartilhado em `nucleoCustoDrop`.
  const custoProto = m
    ? `${nucleoCustoDrop(m)} VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.`
    : '';
  const custoOs = m ? `${nucleoCustoDrop(m)} ` : '';
  const h = maiusc(v.formaPag);
  const g = v.dataVisita;
  const hora = v.horaVisita;
  const cto = v.ctoType || 'CTOE';
  const y = blocoCto(cto, maiusc(v.cto), maiusc(v.passante));

  let agenda = `MAN ${duasPalavras(maiusc(v.alarme ?? ''))} (OCASIONADO) ${i} PROT:${v.protocolo ?? ''} ${h} (${t}) - ${maiusc(v.bairro)}`;
  if (cto === 'CTOI') agenda += ` *CTOI*`;

  const montar = (proto: string[], os: string): SaidaOS => ({
    protocolo: proto.join('\n'),
    os,
    agenda,
  });

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        `${s} (${c} DE ${a}) ENTROU EM CONTATO POR ${l} (${d}) INFORMANDO PROBLEMA DE CONEXAO.`,
        '', SEP_CURTO, esp(4),
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${f} SEM SINAL.`,
        esp(4), SEP_CURTO, esp(4),
        `QUESTIONADO, ${s} DISSE QUE A ${f} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${s} DISSE QUE "${p}", E FICOU SEM ACESSO A INTERNET.`,
        '',
        `REMOTAMENTE VERIFIQUEI QUE ${f} ESTA DESCONECTADO/APAGADA.`,
        '', SEP_LONGO, '', custoProto, esp(4), SEP_LONGO, '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${l} (${u}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${o} (${c}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. ${a} CONCORDOU COM OS TERMOS DA VISITA TECNICA E FARA O PAGAMENTO ${fraseFormaPag(h)}. VISITA AGENDADA PARA O DIA ${g} AS ${hora} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      `${s} (${c} DE ${a}) ENTROU EM CONTATO POR ${l} (${d}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${p}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${f} APAGADA. EXPLIQUEI QUE COM A QUEDA/INTERVENCAO PODE TER DANIFICADO A FIBRA, CONECTOR OU ATE MESMO OS EQUIPAMENTOS. ${custoOs}${s} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${h}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${l} (${u}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${o} (${c}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${g} AS ${hora} HRS.` +
        y +
        envelopeOSRecuado(s),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        `${s} (${c} DE ${a}) ENTROU EM CONTATO POR ${l} (${d}) INFORMANDO PROBLEMA DE CONEXAO.`,
        '', SEP_CURTO, esp(4),
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${f} SEM SINAL.`,
        esp(4), SEP_CURTO, esp(4),
        `QUESTIONADO, DISSE QUE A ${f} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${s} DISSE QUE "${p}", E FICOU SEM ACESSO A INTERNET.`,
        '',
        `REMOTAMENTE VERIFIQUEI QUE ${f} ESTA DESCONECTADO/APAGADA.`,
        esp(4), SEP_CURTO, '',
        m ? custoProto : BLOCO_CUSTO,
        '', SEP_CURTO, '',
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${l} (${u}) COM ${a} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${a} CONCORDOU COM OS TERMOS DA VISITA TECNICA E FARA O PAGAMENTO ${fraseFormaPag(h)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA O DIA ${g} AS ${hora} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      `${s} (${c} DE ${a}) ENTROU EM CONTATO POR ${l} (${d}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${p}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${f} APAGADA. ${custoOs}${s} CONCORDOU COM A VISITA E FARA O PAGAMENTO ${fraseFormaPag(h)}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${l} (${u}) COM ${a} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${g} AS ${hora} HRS.` +
        y +
        envelopeOS(a),
    );
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        `${a} ENTROU EM CONTATO POR ${l} (${u}) INFORMANDO PROBLEMA DE CONEXAO.`,
        esp(20), SEP_CURTO, esp(24),
        `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${f} SEM SINAL.`,
        esp(24), SEP_CURTO, esp(24),
        `QUESTIONADO, DISSE QUE A ${f} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${a} DISSE QUE "${p}", E FICOU SEM ACESSO A INTERNET.`,
        '',
        `REMOTAMENTE VERIFIQUEI QUE ${f} ESTA DESCONECTADO/APAGADA.`,
        esp(24), SEP_CURTO, esp(20), custoProto, '', SEP_CURTO, esp(20),
        `${a} CONCORDOU COM A VISITA E FARA O PAGAMENTO COM ${h}. ${a} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${o} (${c}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${g} AS ${hora} HRS.`,
        '',
        'CLIENTE SEM DUVIDAS.',
      ],
      `${a} ENTROU EM CONTATO POR ${l} (${u}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${p}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${f} APAGADA. ${custoOs}${a} CONCORDOU COM A VISITA E FARA O PAGAMENTO COM ${h}. ${a} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${o} (${c}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${g} AS ${hora} HRS.` +
        y +
        envelopeOS(a),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      `${a} ENTROU EM CONTATO POR ${l} (${u}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '', SEP_LONGO, esp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${f} SEM SINAL.`,
      esp(4), SEP_LONGO,
      `REMOTAMENTE VERIFIQUEI QUE ${f} ESTA DESCONECTADO.`,
      '',
      `QUESTIONADO, DISSE QUE A ${f} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${a} DISSE QUE "${p}".`,
      '', custoProto, '', SEP_LONGO, '',
      `${a} CONCORDOU COM OS TERMOS DA VISITA TECNICA E FARA O PAGAMENTO ${fraseFormaPag(h)}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${g} AS ${hora} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ],
    `${a} ENTROU EM CONTATO POR ${l} (${u}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${p}", E FICOU SEM ACESSO A INTERNET. PERGUNTEI SOBRE A ${f}, E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ${f} APAGADA. ${custoOs}${a} AUTORIZOU VISITA E PAGARA ${fraseFormaPag(h)} NO ATO. VISITA AGENDADA PARA ${g} AS ${hora} HRS.` +
      y +
      envelopeOS(a),
  );
}
