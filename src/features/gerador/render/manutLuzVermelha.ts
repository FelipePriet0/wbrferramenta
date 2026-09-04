/**
 * Emulação do modelo `manut-luz-vermelha` — porte 1:1 da função `hUe` do bundle
 * legado (conteúdo de O.S do próprio app). Manutenção "Luz vermelha": ramifica
 * nos 4 tipos de solicitação (titular/terceiro × acompanhamento) e agenda visita
 * técnica, por isso retorna também `agenda`. O 2º argumento do builder legado é
 * o `operadorPrimeiroNome`, lido aqui de `valores.operadorPrimeiroNome`.
 * Validado por diff contra o legado — ver `manutLuzVermelha.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_LUZ_VERMELHA } from '../catalogo/manutLuzVermelha';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-luz-vermelha';

const f = fraseDe(SLUG, MANUT_LUZ_VERMELHA);

/** Espaço final que o legado deixava em várias linhas do Protocolo. */
const ESP = ' ';

/** Campos comuns montados a partir dos valores já normalizados. */
function dados(v: Valores, extra: Record<string, string> = {}): Record<string, string> {
  return {
    canal: v.canal ?? '', contato: v.contato ?? '', contatoSolicitante: v.contatoSol ?? '',
    parente: v.parente ?? '', equipamento: v.onu ?? '', alarme: maiusc(v.alarme),
    formaPag: maiusc(v.formaPag ?? ''), formaPagFrase: fraseFormaPag(v.formaPag ?? ''),
    dataVisita: v.dataVisita ?? '', horaVisita: v.horaVisita ?? '', ...extra,
  };
}

/** Separador de asteriscos no Protocolo. (legado: yk) */
const SEP_AST = '*';
/** Separador de igual no Protocolo. (legado: vk) */
const SEP_EQ = '=';
/** Separador de igual antes da INDICAÇÃO TÉCNICA na O.S. (legado: bk) */
const SEP_OS = '=';
/** Indentação: N espaços. (legado: Ok) */
function esp(n: number): string {
  return ' '.repeat(n);
}
/** Bloco de indicação técnica da O.S. (legado: wk) */
const TECNICO = () => f('indicacaoTecnica');

/**
 * Nome do alarme para a agenda, POR EXTENSO. (legado: iUe abreviava
 * "LUZ VERMELHA"→"LV" e "LUZ PON PISCANDO"→"PON"; abandonado a pedido do time —
 * a agenda passa a puxar o nome completo.)
 */
function nomeAlarme(alarme: string): string {
  return maiusc(alarme);
}

/** Bloco CTO da O.S. (legado: aUe) */
function blocoCto(ctoType: string, cto: string, passante: string): string {
  if (ctoType === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`;
  if (ctoType === 'CTOI') return `\nCTOI // ${passante}.\n`;
  return '';
}

/** Linha de agenda. (legado: uUe) */
function linhaAgenda(v: Valores, clienteMaiusc: string, operador: string): string {
  const tipoCto = v.ctoType || 'CTOE';
  let linha = f('agenda', {
    alarme: nomeAlarme(v.alarme ?? ''),
    clienteCompleto: clienteMaiusc,
    protocolo: v.protocolo ?? '',
    formaPag: maiusc(v.formaPag ?? ''),
    tecnico: operador,
    bairro: maiusc(v.bairro),
  });
  if (tipoCto === 'CTOI') linha += ` *CTOI*`;
  return linha;
}

/** Protocolo — terceiro solicita, terceiro acompanha. (legado: fUe) */
function protoTerceiroTerceiro(
  v: Valores,
  solNome: string,
  titular: string,
  solMaiusc: string,
  onuNome: string,
): string {
  const { canal, contato, contatoSol, alarme, onu, formaPag, dataVisita, horaVisita, parente } = v;
  return [
    f('aberturaTerceiro', dados(v, { solicitante: solNome, cliente: titular })),
    '',
    SEP_AST,
    esp(4),
    f('statusOnu', dados(v, { onu: onuNome })),
    esp(4),
    SEP_AST,
    esp(4),
    f('alarmeRelato', dados(v, { onu: onuNome })),
    esp(4),
    f('verificacaoRemota', dados(v, { onu: onuNome })) + ESP,
    f('orientacaoUmEquipamento', dados(v, { pessoa: solNome })) + ESP,
    esp(4),
    f('perguntaIntervencao', dados(v, { pessoa: solNome })) + ESP,
    '',
    SEP_AST,
    '',
    f('termosVisitaProtocolo'),
    esp(4),
    SEP_AST,
    '',
    f('aceiteTerceiroAutorizado', dados(v, { cliente: titular, solicitanteCompleto: solMaiusc })),
    '',
    f('semDuvidas'),
  ].join('\n');
}

/** Sufixo O.S — terceiro solicita, terceiro acompanha. (legado: sUe) */
function sufixoTerceiroTerceiro(): string {
  return `${SEP_OS}\n${esp(18)}\nINDICACAO TECNICA:\n${esp(20)}\n${TECNICO()}`;
}

/** Protocolo — terceiro solicita, titular acompanha. (legado: pUe) */
function protoTerceiroTitular(
  v: Valores,
  solNome: string,
  titular: string,
  onuNome: string,
): string {
  const { canal, contato, contatoSol, alarme, onu, formaPag, dataVisita, horaVisita, parente } = v;
  return [
    f('aberturaTerceiro', dados(v, { solicitante: solNome, cliente: titular })),
    '',
    SEP_AST,
    esp(4),
    f('statusOnu', dados(v, { onu: onuNome })),
    esp(4),
    SEP_AST,
    esp(4),
    f('alarmeRelato', dados(v, { onu: onuNome })),
    esp(4),
    f('verificacaoRemota', dados(v, { onu: onuNome })) + ESP,
    f('orientacaoEquipamentos', dados(v, { pessoa: solNome })) + ESP,
    esp(4),
    f('perguntaIntervencao', dados(v, { pessoa: solNome })) + ESP,
    esp(4),
    SEP_AST,
    '',
    f('termosVisitaProtocolo'),
    esp(4),
    SEP_AST,
    '',
    f('aceiteTitularAcompanha', dados(v, { cliente: titular })),
    '',
    f('semDuvidas'),
  ].join('\n');
}

/** Sufixo O.S — terceiro solicita, titular acompanha. (legado: cUe) */
function sufixoTerceiroTitular(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${TECNICO()}`;
}

/** Protocolo — titular solicita, terceiro acompanha. (legado: mUe) */
function protoTitularTerceiro(
  v: Valores,
  titular: string,
  onuNome: string,
  solMaiusc: string,
): string {
  const { canal, contato, alarme, onu, formaPag, dataVisita, horaVisita, parente } = v;
  return [
    f('aberturaTitular', dados(v, { cliente: titular })),
    esp(20),
    SEP_AST,
    esp(24),
    f('statusOnu', dados(v, { onu: onuNome })),
    esp(24),
    SEP_AST,
    esp(24),
    f('alarmeRelato', dados(v, { onu: onuNome })),
    esp(24),
    f('verificacaoRemota', dados(v, { onu: onuNome })) + ESP,
    f('orientacaoEquipamentos', dados(v, { pessoa: titular })) + ESP,
    esp(24),
    f('perguntaIntervencao', dados(v, { pessoa: titular })) + ESP,
    esp(24),
    SEP_AST,
    esp(20),
    f('termosVisitaProtocolo'),
    esp(20),
    SEP_AST,
    esp(20),
    f('aceiteTitularAusente', dados(v, { cliente: titular, solicitanteCompleto: solMaiusc })),
    '',
    f('semDuvidas'),
  ].join('\n');
}

/** Sufixo O.S — titular solicita, terceiro acompanha. (legado: lUe) */
function sufixoTitularTerceiro(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n${esp(20)}\n${TECNICO()}`;
}

/** Protocolo — titular solicita e acompanha (padrão). (legado: dUe) */
function protoTitularTitular(v: Valores, titular: string, onuNome: string): string {
  const { canal, contato, alarme, formaPag, dataVisita, horaVisita, onu } = v;
  return [
    f('aberturaTitular', dados(v, { cliente: titular })),
    '',
    SEP_EQ,
    '',
    f('statusOnu', dados(v, { onu: onuNome })),
    esp(8),
    SEP_EQ,
    esp(8),
    f('alarmeRelato', dados(v, { onu: onuNome })),
    esp(8),
    f('verificacaoRemota', dados(v, { onu: onuNome })) + ESP,
    f('orientacaoEquipamentos', dados(v, { pessoa: titular })) + ESP,
    esp(8),
    f('perguntaIntervencao', dados(v, { pessoa: titular })),
    esp(8),
    SEP_EQ,
    '',
    f('termosVisitaProtocolo'),
    esp(8),
    SEP_EQ,
    esp(8),
    f('aceiteTitularSozinho', dados(v, { cliente: titular })),
    '',
    f('semDuvidas'),
  ].join('\n');
}

/** Sufixo O.S — titular solicita e acompanha (padrão). (legado: oUe) */
function sufixoTitularTitular(): string {
  return `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${TECNICO()}`;
}

export function renderManutLuzVermelha(valores: Valores): SaidaOS {
  const vRaw: Valores = {};
  for (const [k, val] of Object.entries(valores)) vRaw[k] = String(val ?? "");
  // Proxy: qualquer chave ausente lê "" (nunca "undefined") — mantém escritas pós-loop.
  const v: Valores = new Proxy(vRaw, { get: (o, k) => (typeof k === "string" ? (k in o ? (o as Record<string, string>)[k] : "") : (o as Record<string | symbol, unknown>)[k]) });

  const operador = v.operadorPrimeiroNome ?? '';
  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const clienteMaiusc = maiusc(v.cliente);
  const titular = primeiroNome(clienteMaiusc);
  const solMaiusc = maiusc(v.solicitante);
  const solNome = primeiroNome(solMaiusc);
  const parente = maiusc(v.parente);
  const contato = soDigitos(v.contato);
  const contatoSol = soDigitos(v.contatoSol);
  const onu = maiusc(v.onu);
  const onuNome = primeiroNome(onu);
  const cto = blocoCto(v.ctoType || 'CTOE', maiusc(v.cto), maiusc(v.passante));
  const agenda = linhaAgenda(v, clienteMaiusc, operador);

  // Espelha as mutações do legado antes de montar os textos.
  v.contato = contato;
  v.contatoSol = contatoSol;
  v.parente = parente;
  v.onu = onu;
  v.alarme = maiusc(v.alarme);

  const canal = v.canal ?? '';
  const alarme = maiusc(v.alarme);
  const formaPag = maiusc(v.formaPag ?? '');
  const dataVisita = v.dataVisita ?? '';
  const horaVisita = v.horaVisita ?? '';

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    const os = [f('osAberturaTerceiro', dados(v, { solicitante: solNome, cliente: titular, onu: onuNome })), f('verificacaoRemota', dados(v, { onu: onuNome })), f('orientacaoUmEquipamento', dados(v, { pessoa: solNome })), f('perguntaIntervencao', dados(v, { pessoa: solNome })), f('termosVisitaOs'), f('osPagouSolicitante', dados(v, { solicitante: solNome })), f('osContatoAutorizaTerceiro', dados(v, { cliente: titular, solicitanteCompleto: solMaiusc }))].join(' ');
    return {
      protocolo: protoTerceiroTerceiro(v, solNome, titular, solMaiusc, onuNome),
      os: os + cto + sufixoTerceiroTerceiro(),
      agenda,
    };
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    const os = [f('osAberturaTerceiro', dados(v, { solicitante: solNome, cliente: titular, onu: onuNome })), f('verificacaoRemota', dados(v, { onu: onuNome })), f('orientacaoEquipamentosOs', dados(v, { pessoa: solNome })), f('perguntaIntervencao', dados(v, { pessoa: solNome })), f('termosVisitaOs'), f('osPagouSolicitante', dados(v, { solicitante: solNome })), f('osContatoTitularAcompanha', dados(v, { cliente: titular }))].join(' ');
    return {
      protocolo: protoTerceiroTitular(v, solNome, titular, onuNome),
      os: os + cto + sufixoTerceiroTitular(),
      agenda,
    };
  }

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    const os = [f('osAberturaTitular', dados(v, { cliente: titular, onu: onuNome })), f('verificacaoRemota', dados(v, { onu: onuNome })), f('orientacaoEquipamentos', dados(v, { pessoa: titular })), f('perguntaIntervencao', dados(v, { pessoa: titular })), f('termosVisitaOs'), f('osPagouTitular', dados(v, { cliente: titular })), f('osTitularAusente', dados(v, { cliente: titular, solicitanteCompleto: solMaiusc }))].join(' ');
    return {
      protocolo: protoTitularTerceiro(v, titular, onuNome, solMaiusc),
      os: os + cto + sufixoTitularTerceiro(),
      agenda,
    };
  }

  // titular-solicita-titular-acompanha (padrão)
  const os = [f('osAberturaTitular', dados(v, { cliente: titular, onu: onuNome })), f('verificacaoRemota', dados(v, { onu: onuNome })), f('orientacaoEquipamentos', dados(v, { pessoa: titular })), f('perguntaIntervencao', dados(v, { pessoa: titular })), f('termosVisitaOs'), f('osPagouTitular', dados(v, { cliente: titular })), f('osAgendadaSemAcompanhante', dados(v))].join(' ');
  return {
    protocolo: protoTitularTitular(v, titular, onuNome),
    os: os + cto + sufixoTitularTitular(),
    agenda,
  };
}
