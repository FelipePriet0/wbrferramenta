/**
 * Emulação do modelo `altplan-sem-troca-visita-isenta` — porte 1:1 da função
 * `PVe` do bundle legado (conteúdo de O.S do próprio app). Ramifica nos 4 tipos
 * de solicitação (titular/terceiro × acompanhamento) e no modo "ofertado".
 * Diferente do remoto/presencial, este modelo agenda VISITA TÉCNICA ISENTA, por
 * isso retorna também `agenda`. Validado por diff contra o legado — ver
 * `altplanSemTrocaVisitaIsenta.diff.test.ts`.
 */
import {
  descreveSinal,
  maiusc,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { ALTPLAN_SEM_TROCA_VISITA_ISENTA } from '../catalogo/altplanSemTrocaVisitaIsenta';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'altplan-sem-troca-visita-isenta';

const f = fraseDe(SLUG, ALTPLAN_SEM_TROCA_VISITA_ISENTA);

/** Espaço final que o legado deixava na linha de acesso aos apps. */
const ESP = ' ';

/** Separador do bloco ONU/plano no Protocolo — 14 asteriscos. (legado: _O) */
const SEP_ONU = '*'.repeat(14);
/** Separador antes da INDICAÇÃO TÉCNICA na O.S — 35 asteriscos. (legado: EVe) */
const SEP_OS = '*'.repeat(35);

/** origem === 'ofertado'. (legado: UD com sVe = 'ofertado') */
function ehOfertado(v: Valores): boolean {
  return String(v.origem ?? 'padrao') === 'ofertado';
}

/** Transforma o Protocolo para o modo ofertado. (legado: WD) */
function ofertadoProtocolo(texto: string): string {
  return texto
    .replace(
      /^(.+?) ENTROU EM CONTATO (?:VIA|POR) (.+?) SOLICITANDO ALTERAÇÃO DE PLANO\./m,
      'OFERTEI A $1 VIA $2 ALTERAÇÃO DE PLANO.',
    )
    .replace(/QUESTIONADO, CLIENTE DISSE QUE "[^\n]*"\.\n/, '')
    .replace(/PLANO SOLICITADO: ?/, 'PLANO OFERTADO: ');
}

/** Transforma a O.S para o modo ofertado. (legado: GD) */
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

/** Bloco motivo + plano do Protocolo. (legado: TO) */
function blocoPlano(m: Record<string, string>): string[] {
  return [
    f('motivoCliente', m),
    '',
    f('planoAtual', m),
    '',
    f('planoSolicitado', m),
    '',
    f('acesso') + ESP,
    '',
    '',
    SEP_ONU,
    '',
  ];
}

/**
 * Indicação técnica da O.S. O bundle usa espaço duplo após "CONTRATADA." apenas
 * no fluxo titular-solicita-titular (t = true). (legado: NVe)
 */
function indicacaoTecnica(duploEspaco: boolean): string {
  const sep = duploEspaco ? '  ' : ' ';
  return `${f('indicacaoTecnicaInicio')}${sep}${f('indicacaoTecnicaResto')}`;
}

/** Envelope da O.S com separador + indicação técnica. (legado: EO) */
function envelopeOS(corpo: string, duploEspaco = false): string {
  return `${corpo}\n\n${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${indicacaoTecnica(duploEspaco)}`;
}

export function renderAltplanSemTrocaVisitaIsenta(
  valores: Valores,
): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular-solicita-titular-acompanha';
  const nomeCompleto = maiusc(v.cliente);
  const titular = primeiroNome(nomeCompleto);
  const solNome = primeiroNome(maiusc(v.solicitante));
  const solCompleto = maiusc(v.solicitante);
  const autorizado = maiusc(v.autorizado);
  const parente = maiusc(v.parente);
  const canal = v.canal ?? '';
  const contato = soDigitos(v.contato);
  const contatoSol = soDigitos(v.contatoSol);
  const bairro = maiusc(v.bairro);
  const m = {
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
  const ofertado = ehOfertado(v);

  const base = {
    titular, solicitante: solNome, solicitanteCompleto: solCompleto, autorizado,
    parente, canal, contato, contatoSolicitante: contatoSol, sinal,
    dataVisita, horaVisita, bairro, protocolo, clienteCompleto: nomeCompleto,
    ...m,
  };

  // O 2º arg do builder legado (`t`) era o primeiro nome do operador, impresso na
  // agenda como ` (${t})`. Aqui é lido de `valores.operadorPrimeiroNome`, igual aos
  // demais modelos do gerador — sem operador, o slot some (fixtures do legado).
  const operador = maiusc(v.operadorPrimeiroNome ?? '');
  const ref = operador ? ` (${operador})` : '';
  const agenda = f('agenda', {
    clienteCompleto: nomeCompleto,
    protocolo,
    operador: ref,
    bairro,
  });

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => {
    const proto = protoLinhas.join('\n');
    return {
      protocolo: ofertado ? ofertadoProtocolo(proto) : proto,
      os: ofertado ? ofertadoOS(osTexto) : osTexto,
      agenda,
    };
  };

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        f('aberturaTitular', base),
        '', SEP_ONU, '',
        f('statusOnu', base),
        '', SEP_ONU,
        ...blocoPlano(m),
        f('desejaVisitaIsenta', { ...base, pessoa: titular }),
        '', SEP_ONU, '',
        f('aceiteTitularAutorizaTerceiro', base),
        '',
        f('semDuvidas'),
      ],
      envelopeOS(
        f('osTitularAutorizaTerceiro', base),
      ),
    );
  }

  if (tipo === 'terceiro-solicita-titular-acompanha') {
    return montar(
      [
        f('aberturaTerceiro', base),
        '', SEP_ONU, '',
        f('statusOnu', base),
        '', SEP_ONU,
        ...blocoPlano(m),
        f('desejaVisitaIsenta', { ...base, pessoa: solNome }),
        '', SEP_ONU, '',
        f('aceiteTitularAcompanha', base),
        '',
        f('semDuvidas'),
      ],
      envelopeOS(
        f('osTerceiroTitularAcompanha', base),
      ),
    );
  }

  if (tipo === 'terceiro-solicita-terceiro-acompanha') {
    return montar(
      [
        f('aberturaTerceiro', base),
        '', SEP_ONU, '',
        f('statusOnu', base),
        '', SEP_ONU,
        ...blocoPlano(m),
        f('desejaVisitaIsenta', { ...base, pessoa: solNome }),
        '', SEP_ONU, '',
        f('aceiteTerceiroAutorizado', base),
        '',
        f('semDuvidas'),
      ],
      envelopeOS(
        f('osTerceiroAutorizado', base),
      ),
    );
  }

  // titular-solicita-titular-acompanha (padrão)
  return montar(
    [
      f('aberturaTitular', base),
      '', SEP_ONU, '',
      f('statusOnu', base),
      '', SEP_ONU,
      ...blocoPlano(m),
      f('desejaVisitaIsenta', { ...base, pessoa: titular }),
      '', SEP_ONU, '',
      f('aceiteTitularSozinho', base),
    ],
    envelopeOS(
      f('osTitular', base),
      true,
    ),
  );
}
