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
import { fraseDe } from '../catalogo/store';
import { MANUT_OCAS_FIBRA } from '../catalogo/manutOcasFibra';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-ocas-fibra';

// `frase` e não `f`: `f` já é o 1º nome da ONU (nome herdado do bundle).
const frase = fraseDe(SLUG, MANUT_OCAS_FIBRA);

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
  return frase('indicacaoTecnica', { pessoa: nome });
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
const BLOCO_CUSTO = () => frase('blocoCustoPadrao');

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
  const custoProto = m ? `${nucleoCustoDrop(m)} ${frase('custoFormasPagamento')}` : '';
  const custoOs = m ? `${nucleoCustoDrop(m)} ` : '';
  const h = maiusc(v.formaPag);
  const g = v.dataVisita;
  const hora = v.horaVisita;
  const cto = v.ctoType || 'CTOE';
  const y = blocoCto(cto, maiusc(v.cto), maiusc(v.passante));

  const base = {
    cliente: a, clienteCompleto: i, solicitante: s, solicitanteCompleto: o,
    parente: c, canal: l, contato: u, contatoSolicitante: d, onu: f,
    motivo: p, formaPag: h, formaPagFrase: fraseFormaPag(h),
    dataVisita: g, horaVisita: hora,
  };

  let agenda = frase('agenda', {
    ...base,
    alarme: duasPalavras(maiusc(v.alarme ?? '')),
    protocolo: v.protocolo ?? '',
    tecnico: t ?? '',
    bairro: maiusc(v.bairro),
  });
  if (cto === 'CTOI') agenda += ` *CTOI*`;

  const montar = (proto: string[], os: string): SaidaOS => ({
    protocolo: proto.join('\n'),
    os,
    agenda,
  });

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        frase('aberturaTerceiro', base),
        '', SEP_CURTO, esp(4),
        frase('statusOnu', base),
        esp(4), SEP_CURTO, esp(4),
        frase('relatoComSolicitante', base),
        '',
        frase('verificacaoApagada', base),
        '', SEP_LONGO, '', custoProto, esp(4), SEP_LONGO, '',
        frase('aceiteTerceiroAutorizado', base),
        '',
        frase('semDuvidas'),
      ],
      `${frase('osTerceiroAutorizado', base)} ${custoOs}${frase('osFechoTerceiroAutorizado', base)}` +
        y +
        envelopeOSRecuado(s),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        frase('aberturaTerceiro', base),
        '', SEP_CURTO, esp(4),
        frase('statusOnu', base),
        esp(4), SEP_CURTO, esp(4),
        frase('relatoTerceiro', base),
        '',
        frase('verificacaoApagada', base),
        esp(4), SEP_CURTO, '',
        m ? custoProto : BLOCO_CUSTO(),
        '', SEP_CURTO, '',
        frase('aceiteTitularAcompanha', base),
        '',
        frase('semDuvidas'),
      ],
      `${frase('osTerceiroTitularAcompanha', base)} ${custoOs}${frase('osFechoTerceiroTitularAcompanha', base)}` +
        y +
        envelopeOS(a),
    );
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        frase('aberturaTitular', base),
        esp(20), SEP_CURTO, esp(24),
        frase('statusOnu', base),
        esp(24), SEP_CURTO, esp(24),
        frase('relatoTitular', base),
        '',
        frase('verificacaoApagada', base),
        esp(24), SEP_CURTO, esp(20), custoProto, '', SEP_CURTO, esp(20),
        frase('aceiteTitularAusente', base),
        '',
        frase('semDuvidas'),
      ],
      `${frase('osTitular', base)} ${custoOs}${frase('aceiteTitularAusente', base)}` +
        y +
        envelopeOS(a),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      frase('aberturaTitular', base),
      '', SEP_LONGO, esp(4),
      frase('statusOnu', base),
      esp(4), SEP_LONGO,
      frase('verificacaoDesconectado', base),
      '',
      frase('relatoTitularSemAcesso', base),
      '', custoProto, '', SEP_LONGO, '',
      frase('aceiteTitularSozinho', base),
      '',
      frase('semDuvidas'),
    ],
    `${frase('osTitularSozinho', base)} ${custoOs}${frase('osFechoTitularSozinho', base)}` +
      y +
      envelopeOS(a),
  );
}
