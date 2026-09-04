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
import { fraseDe } from '../catalogo/store';
import { MANUT_OCAS_CONECTOR } from '../catalogo/manutOcasConector';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-ocas-conector';

const f = fraseDe(SLUG, MANUT_OCAS_CONECTOR);

/** Espaço final que o legado deixava em duas linhas do Protocolo. */
const ESP = ' ';

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
  return f('indicacaoTecnica', { onu });
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

  const base = {
    cliente: titular, clienteCompleto: nomeCompleto, solicitante: solNome,
    solicitanteCompleto: solCompleto, parente, canal, contato,
    contatoSolicitante: contatoSol, onu, motivo, formaPag,
    formaPagFrase: fraseFormaPag(formaPag), dataVisita, horaVisita,
    protocolo: n.protocolo ?? '', bairro: maiusc(n.bairro), tecnico: operador,
    alarme: duasPalavras(maiusc(n.alarme ?? '')),
  };

  let agenda = f('agenda', base); // y
  if (ctoType === 'CTOI') agenda += ` *CTOI*`;

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => ({
    protocolo: protoLinhas.join('\n'),
    os: osTexto,
    agenda,
  });

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        f('aberturaTerceiro', base),
        '',
        SEP_CURTO,
        esp(4),
        f('statusOnu', base),
        esp(4),
        SEP_CURTO,
        esp(4),
        f('relatoComSolicitante', base),
        '',
        f('verificacaoRemota', base),
        esp(4),
        f('perguntaIntervencao', base) + ESP,
        '',
        SEP_LONGO,
        '',
        f('custoVisitaFixo'),
        '',
        SEP_LONGO,
        '',
        f('aceiteTerceiroAutorizado', base),
        '',
        f('semDuvidas'),
      ],
      `${f('osAberturaTerceiro', base)} ${f('osExplicacaoDano', { ...base, pessoa: solNome })} ${f('osFechoTerceiroAutorizado', base)}` +
        bloco +
        envelopeYUe(onu),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        f('aberturaTerceiro', base),
        '',
        SEP_CURTO,
        esp(4),
        f('statusOnu', base),
        esp(4),
        SEP_CURTO,
        esp(4),
        f('relatoSemSolicitante', { ...base, pessoa: solNome }),
        '',
        f('verificacaoRemota', base),
        esp(4),
        SEP_CURTO,
        '',
        f('custoVisitaCondicional'),
        esp(4),
        SEP_CURTO,
        '',
        f('aceiteTitularAcompanha', base),
        '',
        f('semDuvidas'),
      ],
      `${f('osAberturaTerceiro', base)} ${f('osExplicacaoDano', { ...base, pessoa: solNome })} ${f('osFechoTitularAcompanha', base)}` +
        bloco +
        envelopeJUe(onu),
    );
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        f('aberturaTitular', base),
        esp(20),
        SEP_CURTO,
        esp(24),
        f('statusOnu', base),
        esp(24),
        SEP_CURTO,
        esp(24),
        f('relatoSemSolicitante', { ...base, pessoa: titular }),
        '',
        f('verificacaoRemota', base) + ESP,
        esp(24),
        SEP_CURTO,
        esp(20),
        f('custoVisitaCondicional'),
        esp(20),
        SEP_CURTO,
        esp(20),
        f('aceiteTitularAusente', base),
        '',
        f('semDuvidas'),
      ],
      `${f('osAberturaTitular', base)} ${f('osExplicacaoDano', { ...base, pessoa: titular })} ${f('aceiteTitularAusente', base)}` +
        bloco +
        envelopeXUe(onu),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      f('aberturaTitular', base),
      '',
      SEP_CURTO,
      esp(4),
      f('statusOnu', base),
      '',
      SEP_CURTO,
      '',
      f('relatoSemSolicitante', { ...base, pessoa: titular }),
      '',
      f('verificacaoRemota', base),
      '',
      f('custoVisitaFixo'),
      SEP_CURTO,
      '',
      f('aceiteTitularSozinho', base),
      '',
      f('semDuvidas'),
    ],
    `${f('osAberturaTitular', base)} ${f('osExplicacaoDano', { ...base, pessoa: titular })} ${f('osFechoTitularSozinho', base)}` +
      bloco +
      envelopeJUe(onu),
  );
}
