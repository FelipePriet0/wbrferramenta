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
import { fraseDe } from '../catalogo/store';
import { MANUT_FIBRA_EXTERNA } from '../catalogo/manutFibraExterna';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-fibra-externa';

const f = fraseDe(SLUG, MANUT_FIBRA_EXTERNA);

/** Espaço final que o legado deixava em várias linhas do Protocolo. */
const ESP = ' ';

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
const INDICACAO_TECNICA = () => f('indicacaoTecnica');

/** Envelope padrão da O.S. (legado: Wk) */
function envelopeOS(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${INDICACAO_TECNICA()}`;
}

/** Envelope da O.S do fluxo terceiro-terceiro. (legado: LUe) */
function envelopeOSTerceiro(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n${esp(20)}\n${INDICACAO_TECNICA()}`;
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

  const base = {
    cliente: titular, clienteCompleto: nomeCompleto, solicitante: solNome,
    solicitanteCompleto: solCompleto, parente, cargo, canal, contato,
    contatoSolicitante: contatoSol, onu: onuNome, equipamento: onu, motivo,
    formaPag, formaPagFrase: fraseFormaPag(formaPag), dataVisita, horaVisita,
    protocolo: v.protocolo ?? '', bairro: maiusc(v.bairro), tecnico: operador,
    alarme: prefixoAlarme(v.alarme ?? ''),
  };

  const agenda = (() => {
    let s = f('agenda', base);
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
        f('aberturaPj', base),
        '',
        SEP,
        esp(4),
        f('statusOnu', base),
        esp(4),
        SEP,
        esp(4),
        f('relatoSemSolicitante', { ...base, pessoa: solNome }),
        '',
        f('verificacaoEquipamento', base),
        '',
        SEP,
        '',
        f('custoVisitaCondicional'),
        '',
        SEP,
        '',
        f('aceitePjPresencial', base),
        '',
        f('semDuvidas'),
      ],
      `${f('osAberturaPj', base)} ${f('trocaDropSemCusto', { ...base, pessoa: solNome })} ${f('osPagouPj', base)}` +
        b +
        envelopeOS(),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        f('aberturaTerceiro', base),
        '',
        SEP,
        esp(4),
        f('statusOnu', base),
        esp(4),
        SEP,
        esp(4),
        f('relatoComSolicitante', base),
        '',
        f('verificacaoEquipamento', base),
        esp(4),
        f('perguntaIntervencao', { ...base, pessoa: solNome }) + ESP,
        '',
        SEP_LONGO,
        '',
        f('custoVisitaCondicional'),
        esp(4),
        SEP_LONGO,
        '',
        f('aceiteTerceiroAutorizado', base),
        '',
        f('semDuvidas'),
      ],
      `${f('osAberturaTerceiro', base)} ${f('trocaDropSemCusto', { ...base, pessoa: solNome })} ${f('osFechoTerceiroAutorizado', base)}` +
        b +
        envelopeOSTerceiro(),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        f('aberturaTerceiro', base),
        '',
        SEP,
        esp(4),
        f('statusOnu', base),
        esp(4),
        SEP,
        esp(4),
        f('relatoSemSolicitante', { ...base, pessoa: solNome }),
        '',
        f('verificacaoEquipamento', base),
        esp(4),
        SEP,
        '',
        f('custoVisitaCondicional'),
        esp(4),
        SEP,
        '',
        f('aceiteTitularAcompanha', base),
        '',
        f('semDuvidas'),
      ],
      `${f('osAberturaTerceiro', base)} ${f('trocaDropSemCusto', { ...base, pessoa: solNome })} ${f('osFechoTitularAcompanha', base)}` +
        b +
        envelopeOS(),
    );
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        f('aberturaTitular', base),
        esp(20),
        SEP,
        esp(24),
        f('statusOnu', base),
        esp(24),
        SEP,
        esp(24),
        f('relatoSemSolicitante', { ...base, pessoa: titular }),
        '',
        f('verificacaoEquipamento', base) + ESP,
        esp(24),
        SEP,
        esp(20),
        f('custoVisitaCondicional'),
        esp(20),
        SEP,
        esp(20),
        f('aceiteTitularAusente', base),
        '',
        f('semDuvidas'),
      ],
      `${f('osAberturaTitular', base)} ${f('trocaDropSemCusto', { ...base, pessoa: titular })} ${f('aceiteTitularAusente', base)}` +
        b +
        envelopeOS(),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      f('aberturaTitular', base),
      '',
      SEP,
      '',
      f('statusOnu', base),
      '',
      SEP,
      '',
      f('relatoSimples', base),
      f('perguntaLuzVermelha', base),
      '',
      f('verificacaoOnu', base) + ESP,
      f('orientacaoReinicio', base) + ESP,
      '',
      f('perguntaIntervencao', { ...base, pessoa: titular }),
      '',
      SEP,
      '',
      f('trocaDropSemCusto', { ...base, pessoa: titular }),
      esp(4),
      SEP,
      esp(4),
      f('aceiteTitularSozinho', base),
      '',
      f('semDuvidas'),
    ],
    `${f('osAberturaTitularSemConexao', base)} ${f('trocaDropSemCusto', { ...base, pessoa: titular })} ${f('aceiteTitularSozinho', base)}` +
      b +
      envelopeOS(),
  );
}
