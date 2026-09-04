/**
 * Emulação do modelo `manut-fonte-queimada` — porte 1:1 da função `AGe` do
 * bundle legado (conteúdo de O.S do próprio app). Ramifica no modo de
 * atendimento (`com-visita` × `loja`). O 2º argumento do builder legado é o
 * `operadorPrimeiroNome`; aqui ele é lido de `valores.operadorPrimeiroNome`.
 * Validado por diff contra o legado — ver `manutFonteQueimada.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_FONTE_QUEIMADA } from '../catalogo/manutFonteQueimada';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-fonte-queimada';

// `frase` e não `f`: `f` já é o protocolo aqui (nome herdado do bundle).
const frase = fraseDe(SLUG, MANUT_FONTE_QUEIMADA);

/** Espaço final que o legado deixava em três linhas do Protocolo. */
const ESP = ' ';

/** Separador dos blocos do Protocolo — 19 asteriscos. (legado: oj) */
const SEP = '*'.repeat(19);
/** Separador antes da INDICAÇÃO TÉCNICA na O.S — 42 asteriscos. (legado: wGe) */
const SEP_OS = '*'.repeat(42);
/** Indentação de linha em branco recuada — 4 espaços. (legado: uj(4)) */
const ESP4 = ' '.repeat(4);

export function renderManutFonteQueimada(valores: Valores): SaidaOS {
  const nRaw: Record<string, string> = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Record<string, string> = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  const tipo = n.tipoSolicitacao || 'com-visita';
  const i = maiusc(n.cliente);
  const a = primeiroNome(i);
  const o = n.canal;
  const s = soDigitos(n.contato);
  const c = maiusc(n.sinalONU);
  const l = maiusc(n.bairro);
  const u = maiusc(n.equip);
  const d = n.dataVisita;
  const f = n.protocolo;
  const p = maiusc(n.formaPag);
  const op = n.operadorPrimeiroNome;

  const base = {
    cliente: a, clienteCompleto: i, canal: o, contato: s, sinalONU: c,
    bairro: l, equip: u, dataVisita: d, protocolo: f, formaPag: p,
    formaPagFrase: fraseFormaPag(p), tecnico: op,
  };

  let m = '';
  let h = '';
  let g = '';
  let rotuloAgenda = 'Texto da Agenda';

  if (tipo === 'loja') {
    const e = maiusc(n.proced);
    const periodo = n.periodo;
    m = [
      frase('abertura', base),
      ``,
      SEP,
      ESP4,
      frase('statusFibra', base),
      ESP4,
      SEP,
      ESP4,
      frase('relatoEquipamento'),
      ESP4,
      frase('verificacaoRemota') + ESP,
      `${e}`,
      ESP4,
      frase('perguntaIntervencao', base) + ESP,
      ESP4,
      SEP,
      ``,
      frase('isencaoFonteLoja', base),
      ``,
      frase('sugestaoLoja'),
      ``,
      SEP,
      ESP4,
      frase('optouLoja', { ...base, periodo }),
      ``,
      frase('semDuvidas'),
    ].join('\n');
    g = [
      `*${i}*`,
      frase('avisoLojaCorpo', { ...base, periodo }),
      frase('avisoLojaProtocolo', base),
    ].join('\n');
    rotuloAgenda = 'Encaminhar no grupo LEIA';
  } else {
    const e = maiusc(n.proced);
    const r = n.horaVisita;
    m = [
      frase('abertura', base),
      ``,
      SEP,
      ESP4,
      frase('statusOnu', base),
      ESP4,
      SEP,
      ESP4,
      frase('relatoEquipamento'),
      ``,
      frase('verificacaoRemota') + ESP,
      `${e}.`,
      ESP4,
      frase('perguntaIntervencao', base) + ESP,
      ESP4,
      SEP,
      ESP4,
      frase('isencaoFonteVisita', base),
      ESP4,
      SEP,
      ESP4,
      frase('aceiteVisita', { ...base, horaVisita: r }),
      ``,
      frase('semDuvidas'),
    ].join('\n');
    const osCorpo = frase('corpoOs', { ...base, proced: e, horaVisita: r });
    const tecnico = frase('indicacaoTecnica', base);
    h = `${osCorpo}\n\n${SEP_OS}\n\nINDICACAO TECNICA:\n\n${tecnico}`;
    g = frase('agenda', base);
  }

  const saida =
    tipo === 'loja'
      ? [`=== Texto Protocolo ===`, m, ``, `=== ${rotuloAgenda} ===`, g].join('\n')
      : [
          `=== Texto Protocolo ===`,
          m,
          ``,
          `=== Texto O.S ===`,
          h,
          ``,
          `=== ${rotuloAgenda} ===`,
          g,
        ].join('\n');

  return { protocolo: m, os: h, agenda: g, saida };
}
