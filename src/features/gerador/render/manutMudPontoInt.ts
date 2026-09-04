/**
 * Emulação do modelo `manut-mud-ponto-int` (Mudança de ponto interno) — porte
 * 1:1 da função construtora `nGe` do bundle legado (conteúdo de O.S do próprio
 * app). Ramifica nos 5 tipos de solicitação (titular/PJ/terceiro × quem
 * acompanha) e agenda visita técnica, por isso retorna também `agenda`.
 *
 * O 2º argumento do builder legado é o primeiro nome do operador; aqui é lido de
 * `valores.operadorPrimeiroNome`. Validado por diff contra o legado — ver
 * `manutMudPontoInt.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, nucleoCustoDrop, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_MUD_PONTO_INT } from '../catalogo/manutMudPontoInt';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-mud-ponto-int';

// `frase` e não `f`: `f` já é o contato do solicitante (nome do bundle).
const frase = fraseDe(SLUG, MANUT_MUD_PONTO_INT);

/** Separador de blocos — 35 asteriscos. (legado: HA) */
const HA = '*'.repeat(35);

/** N espaços em branco. (legado: YA) */
function espacos(n: number): string {
  return ' '.repeat(n);
}

/** Indicação técnica fixa da O.S. (legado: tGe) */
const INDICACAO_TECNICA = () => frase('indicacaoTecnica');

/** Envelope da O.S com separador + indicação técnica. (legado: XA) */
function envelopeOS(corpo: string): string {
  return `${corpo}\n\n${HA}\n\nINDICACAO TECNICA:\n\n${INDICACAO_TECNICA()}`;
}

export function renderManutMudPontoInt(valores: Valores): SaidaOS {
  const nRaw: Valores = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Valores = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  // 2º arg do builder legado = primeiro nome do operador.
  const t = n.operadorPrimeiroNome;

  const r = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const i = maiusc(n.cliente); // nome completo / razão social
  const a = primeiroNome(i); // primeiro nome do cliente
  const o = maiusc(n.solicitante); // solicitante completo
  const s = primeiroNome(o); // primeiro nome do solicitante
  const c = maiusc(n.parente);
  const l = maiusc(n.cargo);
  const u = n.canal;
  const d = soDigitos(n.contato);
  const f = soDigitos(n.contatoSol);
  const p = maiusc(n.sinalONU);
  const bairro = maiusc(n.bairro);
  const h = maiusc(n.motivo);
  const g = maiusc(n.ambienteAtual);
  const amb = maiusc(n.ambienteNovo);
  const v = n.valor;
  const y = maiusc(n.formaPag);
  const b = n.dataVisita;
  const x = n.horaVisita;

  // Explicação dos TERMOS do custo (drop com sobra = R$50 / drop novo = R$100),
  // condicional ao valor escolhido. A O.S não afirma um valor específico na frase
  // de pagamento — a explicação já carrega o custo e a frase diz só a forma.
  // Só aplica quando há valor; vazio mantém a redação original (fidelidade às
  // fixtures/legado). Núcleo compartilhado em `nucleoCustoDrop`.
  const base = {
    cliente: a, clienteCompleto: i, solicitante: s, solicitanteCompleto: o,
    parente: c, cargo: l, canal: u, contato: d, contatoSolicitante: f,
    sinalONU: p, motivo: h, ambienteAtual: g, ambienteNovo: amb, valor: v,
    formaPag: y, formaPagFrase: fraseFormaPag(y), dataVisita: b, horaVisita: x,
    protocolo: n.protocolo, bairro, tecnico: t,
  };

  const pagouCliente = v
    ? `${nucleoCustoDrop(v)} ${frase('pagamentoCliente', base)}`
    : frase('pagamentoClienteSemValor', base);
  const pagouSolSolicitou = v
    ? `${nucleoCustoDrop(v)} ${frase('pagamentoSolicitouPagar', base)}`
    : frase('pagamentoSolicitouPagarSemValor', base);
  const pagouSolEscolheu = v
    ? `${nucleoCustoDrop(v)} ${frase('pagamentoEscolheuPagar', base)}`
    : frase('pagamentoEscolheuPagarSemValor', base);

  // Linha de custo do Protocolo: explicação dos termos + formas de pagamento.
  const custoLinhaProto = v
    ? `${nucleoCustoDrop(v)} ${frase('custoFormasPagamento')}`
    : frase('custoSemValor', base);

  const agenda = frase('agenda', base);

  const montar = (protoLinhas: string[], osCorpo: string): SaidaOS => ({
    protocolo: protoLinhas.join('\n'),
    os: envelopeOS(osCorpo),
    agenda,
  });

  if (r === 'pessoa-juridica') {
    return montar(
      [
        frase('aberturaPj', base),
        HA,
        frase('statusOnu', base),
        HA,
        frase('motivoCliente', { ...base, pessoa: s }),
        '',
        frase('ambienteAtual', base),
        frase('ambienteNovo', base),
        '',
        custoLinhaProto,
        espacos(4),
        HA,
        espacos(4),
        frase('aceitePresencial', { ...base, pessoa: s }),
      ],
      `${frase('osAberturaPj', base)} ${pagouCliente}. ${frase('osAgendada', base)}`,
    );
  }

  if (r === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        frase('aberturaTitular', base),
        HA,
        frase('statusOnu', base),
        HA,
        frase('motivoCliente', { ...base, pessoa: a }),
        espacos(4),
        frase('ambienteAtual', base),
        frase('ambienteNovo', base),
        espacos(8),
        custoLinhaProto,
        espacos(4),
        HA,
        espacos(4),
        frase('aceiteTitularAusente', base),
      ],
      `${frase('osAberturaTitular', base)} ${pagouCliente}. ${frase('osTitularAusente', base)}`,
    );
  }

  if (r === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        frase('aberturaTerceiro', base),
        '',
        HA,
        '',
        frase('statusOnuSemOscilacao', base),
        '',
        HA,
        '',
        frase('motivoCliente', { ...base, pessoa: s }),
        '',
        frase('ambienteAtual', base),
        frase('ambienteNovo', base),
        '',
        custoLinhaProto,
        '',
        HA,
        espacos(4),
        frase('aceiteSemAcompanhante', base),
        '',
        frase('contatoAutorizaTerceiro', base),
      ],
      `${frase('osAberturaTerceiro', base)} ${pagouSolSolicitou}. ${frase('contatoAutorizaTerceiro', base)}`,
    );
  }

  if (r === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        frase('aberturaTerceiro', base),
        '',
        HA,
        '',
        frase('statusOnu', base),
        '',
        HA,
        '',
        frase('motivoCliente', { ...base, pessoa: s }),
        '',
        frase('ambienteAtual', base),
        frase('ambienteNovo', base),
        '',
        custoLinhaProto,
        espacos(4),
        HA,
        espacos(4),
        frase('aceiteSemAcompanhante', base),
        '',
        frase('contatoTitularAcompanhaProtocolo', base),
      ],
      `${frase('osAberturaTerceiro', base)} ${pagouSolEscolheu}. ${frase('contatoTitularAcompanhaOs', base)}`,
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      frase('aberturaTitular', base),
      HA,
      frase('statusOnu', base),
      HA,
      frase('motivoCliente', { ...base, pessoa: a }),
      '',
      frase('ambienteAtual', base),
      frase('ambienteNovo', base),
      '',
      custoLinhaProto,
      espacos(4),
      HA,
      espacos(4),
      frase('aceitePresencial', { ...base, pessoa: a }),
    ],
    `${frase('osAberturaTitular', base)} ${pagouCliente}. ${frase('osAgendada', base)}`,
  );
}
