/**
 * Emulação do modelo `altplan-remoto` — porte 1:1 da função `uVe` do bundle
 * legado (conteúdo de O.S do próprio app). Ramifica em titular/terceiro/PJ e no
 * modo "ofertado". Validado por diff contra o legado — ver
 * `altplanRemoto.diff.test.ts`.
 */
import {
  agoraDataHora,
  descreveSinal,
  linhas,
  maiusc,
  parteData,
  primeiroNome,
  soDigitos,
  type Valores,
} from './helpers';
import { SEP } from './frases';
import { fraseDe } from '../catalogo/store';
import { ALTPLAN_REMOTO } from '../catalogo/altplanRemoto';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'altplan-remoto';

const f = fraseDe(SLUG, ALTPLAN_REMOTO);

/** Espaço final que o legado deixava na linha de acesso aos apps. */
const ESP = ' ';

export interface SaidaOS {
  protocolo: string;
  os: string;
  /** Texto de agendamento (modelos com visita técnica). */
  agenda?: string;
  /** Saída única combinada (alguns modelos de manutenção). */
  saida?: string;
  /** Termo para o cliente ler/assinar (modelo Termo de responsabilidade). */
  termo?: string;
}

/** origem === 'ofertado' (legado: UD). */
function ehOfertado(v: Valores): boolean {
  return String(v.origem ?? 'padrao') === 'ofertado';
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

export function renderAltplanRemoto(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const tipo = v.tipoSolicitacao || 'titular';
  const titular = primeiroNome(maiusc(v.cliente));
  const sol = primeiroNome(maiusc(v.solicitante));
  const parente = maiusc(v.parente);
  const cargo = maiusc(v.cargo);
  const canal = v.canal ?? '';
  const contato = soDigitos(v.contato);
  const contatoSol = soDigitos(v.contatoSol);
  const motivo = maiusc(v.motivo);
  const planoAtual = v.planoAtual ?? '';
  const planoEscolhido = v.planoEscolhido ?? '';
  const roteador = maiusc(v.roteador);
  const dataContrato = maiusc(v.dataContrato);
  const protocolo = v.protocolo ?? '';
  const sinal = descreveSinal(v);
  const [ligData, ligHora] = parteData(v.dataLigacao);
  const [protData, protHora] = parteData(v.dataProtocolo);
  const ofertado = ehOfertado(v);

  const montar = (protoLinhas: string[], osTexto: string): SaidaOS => {
    const proto = linhas(...protoLinhas);
    return {
      protocolo: ofertado ? ofertadoProtocolo(proto) : proto,
      os: ofertado ? ofertadoOS(osTexto) : osTexto,
    };
  };

  const base = {
    titular, solicitante: sol, parente, cargo, canal, contato,
    contatoSolicitante: contatoSol, motivo, planoAtual, planoEscolhido,
    roteador, dataContrato, protocolo, sinal, ligData, ligHora, protData, protHora,
  };

  const blocoPlano = [f('planoAtual', base), '', f('planoSolicitado', base)];
  /**
   * Encerramento da O.S (execução remota, sem intervenção técnica) — puxa o
   * roteador/ONT já informado no formulário e a data/hora ATUAL (do momento
   * em que o texto é gerado/copiado, não um campo preenchido pelo operador).
   */
  const blocoEncerramento = (): string => {
    const [dataAtual, horaAtual] = agoraDataHora();
    return linhas(
      '',
      '',
      f('encExecutada'),
      f('encAssinatura'),
      f('encSemIntervencao', base),
      f('encSemDuvidas'),
      '',
      f('encDataHora', { ...base, dataAtual, horaAtual }),
    );
  };

  const blocoOpcoes = [
    f('roteadorCompativel', base),
    f('opcoesIntro'),
    '',
    f('opcaoVisitaPaga'),
    '',
  ];

  if (tipo === 'terceiro') {
    return montar(
      [
        f('aberturaTerceiro', base),
        '', SEP, '',
        f('statusOnu', base) + '.',
        '', SEP,
        f('motivoCliente', base),
        '', ...blocoPlano, '',
        f('acesso') + ESP,
        '', '', SEP, ...blocoOpcoes,
        f('opcaoRemota'), f('semCustos'), f('beneficiosAposAssinatura'), '', SEP,
        f('autorizacaoTitular', base),
        '',
        f('aceiteRemoto', base),
        '',
        f('semDuvidas'),
      ],
      `${f('osTerceiro', base)}${blocoEncerramento()}`,
    );
  }

  if (tipo === 'pj') {
    return montar(
      [
        f('aberturaPj', base),
        '', SEP, '',
        f('statusOnu', base),
        '', SEP,
        f('motivoCliente', base),
        '', ...blocoPlano, '', SEP, ...blocoOpcoes,
        f('opcaoRemota'), f('semCustos'), '', SEP, '',
        f('aceiteRemotoValidado', { ...base, pessoa: sol }),
      ],
      `${f('osPj', base)}${blocoEncerramento()}`,
    );
  }

  // titular (padrão)
  return montar(
    [
      f('aberturaTitular', base),
      '', SEP, '',
      f('statusOnu', base),
      '', SEP,
      f('motivoCliente', base),
      '', ...blocoPlano, '',
      f('acesso') + ESP,
      '', '', SEP, ...blocoOpcoes,
      f('opcaoRemota'), f('semCustos'), f('beneficiosAposAssinatura'), '', SEP, '',
      f('aceiteRemotoValidado', { ...base, pessoa: titular }),
    ],
    `${f('osTitular', base)}${blocoEncerramento()}`,
  );
}
