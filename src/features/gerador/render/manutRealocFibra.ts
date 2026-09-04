/**
 * Emulação do modelo `manut-realoc-fibra` — porte 1:1 da função `KWe` do bundle
 * legado (conteúdo de O.S do próprio app). Ramifica nos 5 tipos de solicitação
 * (titular/PJ/terceiro × acompanhamento). Modelo de MANUTENÇÃO: agenda visita
 * técnica de remanejamento de fibra, por isso retorna também `agenda`. O 2º
 * argumento do builder legado é o operador (primeiro nome) — aqui lido de
 * `valores.operadorPrimeiroNome`. Validado por diff contra o legado — ver
 * `manutRealocFibra.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, nucleoCustoDrop, primeiroNome, soDigitos } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_REALOC_FIBRA } from '../catalogo/manutRealocFibra';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-realoc-fibra';

const f = fraseDe(SLUG, MANUT_REALOC_FIBRA);

/** Separador do fluxo titular/PJ — 39 sinais de igual. (legado: AA) */
const SEP_TITULAR = '='.repeat(39);
/** Separador do fluxo titular-solicita-terceiro — 38 sinais de igual. (legado: jA) */
const SEP_TERCEIRO_ACOMPANHA = '='.repeat(38);
/** Separador dos fluxos terceiro-solicita — 41 sinais de igual. (legado: MA) */
const SEP_TERCEIRO = '='.repeat(41);
/** Linha de 4 espaços usada como separador em branco. (legado: zA(4)) */
const ESP4 = ' '.repeat(4);

/**
 * Indicação técnica da O.S (bloco fixo do remanejamento de fibra). O `nome` vem
 * do 3º argumento do envelope legado. (legado: GWe)
 */
function indicacaoTecnica(nome: string): string {
  return f('indicacaoTecnica', { pessoa: nome });
}

/**
 * Envelope da O.S: corpo + separador + indicação técnica. `trailing` adiciona a
 * quebra final (4º argumento do legado). (legado: BA)
 */
function envelopeOS(
  corpo: string,
  sep: string,
  nome: string,
  trailing: boolean,
): string {
  let out = `${corpo}\n\n${sep}\n\nINDICACAO TECNICA:\n\n${indicacaoTecnica(nome)}`;
  if (trailing) out += '\n';
  return out;
}

export function renderManutRealocFibra(valores: Record<string, string>): SaidaOS {
  // Espelha `n[t]=String(r??'')`: só copia chaves existentes; ausentes ficam
  // undefined (o legado imprime "undefined" literal p/ `valor` não preenchido).
  const nRaw: Record<string, string> = {};
  for (const [k, val] of Object.entries(valores)) nRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const n: Record<string, string> = new Proxy(nRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  const tipo = n.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const clienteFull = maiusc(n.cliente);
  const cliente = primeiroNome(clienteFull);
  const solFull = maiusc(n.solicitante);
  const sol = primeiroNome(solFull);
  const parente = maiusc(n.parente);
  const cargo = maiusc(n.cargo);
  const canal = n.canal;
  const contato = soDigitos(n.contato);
  const contatoSol = soDigitos(n.contatoSol);
  const sinal = maiusc(n.sinalONU);
  const bairro = maiusc(n.bairro);
  const motivo = maiusc(n.motivo);
  const valor = maiusc(n.valor);
  const formaPag = n.formaPag;
  const dataVisita = n.dataVisita;
  const horaVisita = n.horaVisita;
  const operador = n.operadorPrimeiroNome;

  // Explicação dos TERMOS do custo (drop com sobra = R$50 / drop novo = R$100),
  // condicional ao valor. Só aplica quando há valor; vazio mantém a redação
  // original (fidelidade às fixtures/legado). Núcleo em `nucleoCustoDrop`.
  const temValor = valor !== '';
  const custoLinhaProto = temValor
    ? `${nucleoCustoDrop(valor)} ${f('custoFormasPagamento')}`
    : f('custoSemValor', { valor });
  // Cláusula de custo da O.S: com valor, a explicação (terminada em ponto)
  // antecede a frase de quem paga; vazio mantém "CUSTO DE ; ..." das fixtures.
  const custoClauseOs = temValor
    ? `${nucleoCustoDrop(valor)} `
    : `CUSTO DE ${valor}; `;

  const base = {
    cliente, clienteCompleto: clienteFull, solicitante: sol,
    solicitanteCompleto: solFull, parente, cargo, canal, contato,
    contatoSolicitante: contatoSol, sinalONU: sinal, motivo, valor,
    formaPag, formaPagFrase: fraseFormaPag(formaPag),
    dataVisita, horaVisita, protocolo: n.protocolo, bairro, tecnico: operador,
  };

  const agenda = f('agenda', base);

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => ({
    protocolo: protoLinhas.join('\n'),
    os: osTexto,
    agenda,
  });

  if (tipo === 'pessoa-juridica') {
    return montar(
      [
        f('aberturaPj', base),
        '', SEP_TITULAR, '',
        f('statusOnu', base),
        '', SEP_TITULAR, '',
        f('motivoCliente', { ...base, pessoa: sol }),
        '',
        custoLinhaProto,
        ESP4, SEP_TITULAR, ESP4,
        f('aceitePresencial', { ...base, pessoa: sol }),
      ],
      envelopeOS(
        `${f('osAberturaPj', base)} ${custoClauseOs}${f('osFechoClientePaga', base)}`,
        SEP_TITULAR,
        sol,
        false,
      ),
    );
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        f('aberturaTitular', base),
        '', SEP_TERCEIRO_ACOMPANHA, '',
        f('statusOnu', base),
        '', SEP_TERCEIRO_ACOMPANHA, '',
        f('motivoCliente', { ...base, pessoa: cliente }),
        '',
        custoLinhaProto,
        ESP4, SEP_TERCEIRO_ACOMPANHA, ESP4,
        f('aceiteTitularAusente', base),
      ],
      envelopeOS(
        `${f('osAberturaTitular', base)} ${custoClauseOs}${f('osFechoTitularAusente', base)}`,
        SEP_TERCEIRO_ACOMPANHA,
        'CLIENTE',
        true,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        f('aberturaTerceiro', base),
        '', SEP_TERCEIRO, '',
        f('statusOnuSemOscilacao', base),
        '', SEP_TERCEIRO, '',
        f('motivoCliente', { ...base, pessoa: sol }),
        '',
        custoLinhaProto,
        '', SEP_TERCEIRO, ESP4,
        f('aceiteSemAcompanhante', base),
        '',
        f('contatoAutorizaTerceiro', base),
      ],
      envelopeOS(
        `${f('osAberturaTerceiro', base)} ${custoClauseOs}${f('osFechoTerceiroAutorizado', base)}`,
        SEP_TERCEIRO,
        'CLIENTE',
        false,
      ),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        f('aberturaTerceiro', base),
        '', SEP_TERCEIRO, '',
        f('statusOnu', base),
        '', SEP_TERCEIRO, '',
        f('motivoCliente', { ...base, pessoa: sol }),
        '',
        custoLinhaProto,
        ESP4, SEP_TERCEIRO, ESP4,
        f('aceiteSemAcompanhante', base),
        '',
        f('contatoTitularAcompanha', base),
      ],
      envelopeOS(
        `${f('osAberturaTerceiro', base)} ${custoClauseOs}${f('osFechoTitularAcompanha', base)}`,
        SEP_TERCEIRO,
        'CLIENTE',
        false,
      ),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      f('aberturaTitular', base),
      '', SEP_TITULAR, '',
      f('statusOnu', base),
      '', SEP_TITULAR, '',
      f('motivoCliente', { ...base, pessoa: cliente }),
      '',
      custoLinhaProto,
      '', SEP_TITULAR, '',
      f('aceitePresencial', { ...base, pessoa: cliente }),
    ],
    envelopeOS(
      `${f('osAberturaTitular', base)} ${custoClauseOs}${f('osFechoClientePaga', base)}`,
      SEP_TITULAR,
      cliente,
      true,
    ),
  );
}
