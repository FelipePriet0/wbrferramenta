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
import { fraseDe } from '../catalogo/store';
import { ALTPLAN_SEM_TROCA_VISITA_PAGA } from '../catalogo/altplanSemTrocaVisitaPaga';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'altplan-sem-troca-visita-paga';

// Chamado `frase` e não `f`: este arquivo já usa `f` para o contato do
// solicitante (nome herdado do bundle minificado).
const frase = fraseDe(SLUG, ALTPLAN_SEM_TROCA_VISITA_PAGA);

/** Espaço final que o legado deixava na linha de acesso aos apps. */
const ESP = ' ';

/** Separador de bloco do protocolo (legado: BAR de 14 asteriscos). */
const BAR = '**************';

/** Separador da indicação técnica na O.S (legado: VVe, 35 asteriscos). */
const VVe = '***********************************';

/** Bloco de indicação técnica padrão (legado: JVe). */
const JVe = () => frase('indicacaoTecnica');

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
    frase('statusOnu', { sinal }),
    '    ',
    BAR,
    frase('motivoCliente', { ...m }),
    '',
    frase('planoAtual', { ...m }),
    '',
    frase('planoSolicitado', { ...m }),
    '',
    frase('acesso') + ESP,
    '',
    '',
    BAR,
    '',
  ];
}

/** Linha de compatibilidade + desejo de visita (legado: LO). */
function LO(nome: string, roteador: string): string {
  return frase('desejaVisitaPaga', { pessoa: nome, roteador });
}

/** Envolve a O.S com o rodapé de indicação técnica (legado: FO). */
function FO(texto: string): string {
  return `${texto}

${VVe}

INDICAÇÃO TÉCNICA:

${JVe()}`;
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
  const agenda = frase('agenda', { clienteCompleto: i, protocolo: proto, formaPag: v, operador: ref, bairro: p });
  const ofertado = String(n.origem ?? 'padrao') === 'ofertado';

  const base = {
    titular: a, solicitante: s, solicitanteCompleto: o, autorizado: c, parente: l,
    canal: u, contato: d, contatoSolicitante: f, bairro: p, sinal: y,
    dataVisita: h, horaVisita: g, protocolo: proto, formaPag: v,
    formaPagFrase: fraseFormaPag(v), clienteCompleto: i, ...m,
  };

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => {
    const protoTexto = protoLinhas.join('\n');
    return {
      protocolo: ofertado ? ofertadoProtocolo(protoTexto) : protoTexto,
      os: ofertado ? ofertadoOS(osTexto) : osTexto,
      agenda,
    };
  };

  const C = frase('aberturaTitular', base);
  const w = frase('aberturaTerceiro', base);

  if (tipo === 'titular-solicita-terceiro-acompanha') {
    return montar(
      [
        ...IO(C, y, m),
        LO(a, m.roteador),
        '',
        BAR,
        '',
        frase('aceiteTitularAutorizaTerceiro', base),
        '',
        frase('semDuvidas'),
      ],
      FO(
        frase('osTitularAutorizaTerceiro', base),
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
        frase('aceiteTitularAcompanha', base),
        '',
        frase('semDuvidas'),
      ],
      FO(
        frase('osTerceiroTitularAcompanha', base),
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
        frase('aceiteTerceiroAutorizado', base),
        '',
        frase('semDuvidas'),
      ],
      FO(
        frase('osTerceiroAutorizado', base),
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
      frase('aceiteTitularSozinho', base),
    ],
    FO(
      frase('osTitular', base),
    ),
  );
}
