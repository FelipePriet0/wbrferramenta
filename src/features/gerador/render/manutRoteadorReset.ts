/**
 * Emulação do modelo `manut-roteador-reset` — porte 1:1 da função `bKe` do
 * bundle legado. 3 modos (visita técnica / trazer na loja / orientação remota).
 * Saída única combinada (`saida`) + protocolo/os/agenda. 2º arg = operador.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';
import { fraseDe } from '../catalogo/store';
import { MANUT_ROTEADOR_RESET } from '../catalogo/manutRoteadorReset';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'manut-roteador-reset';

// `frase` e não `f`: `f` já é usado aqui para o texto da O.S (nome do bundle).
const frase = fraseDe(SLUG, MANUT_ROTEADOR_RESET);

/** Espaço final que o legado deixava em três linhas do Protocolo. */
const ESP = ' ';

const esp = (n: number) => ' '.repeat(n);
const SEP = '*'.repeat(19); // Bj
const SEP_OS = '*'.repeat(42); // gKe

export function renderManutRoteadorReset(valores: Valores): SaidaOS {
  const n: Valores = {};
  for (const [k, val] of Object.entries(valores)) n[k] = String(val ?? '');

  const r = n.tipoSolicitacao || 'visita';
  const i = maiusc(n.cliente);
  const a = primeiroNome(i);
  const o = n.canal;
  const s = soDigitos(n.contato);
  const c = maiusc(n.sinalONU);
  const l = maiusc(n.oscila);
  const u = maiusc(n.roteador);
  const operador = n.operadorPrimeiroNome ?? '';
  const base = {
    cliente: a, clienteCompleto: i, canal: o, contato: s,
    sinalONU: c, oscila: l, roteador: u, tecnico: operador,
  };

  /** Miolo comum aos três desfechos — era copiado três vezes no legado. */
  const miolo = () => [
    frase('abertura', base),
    '', SEP, '',
    frase('statusOnu', base),
    '', SEP, esp(4),
    frase('relatoSemRede', base),
    esp(4),
    frase('verificacaoRemota', base) + ESP,
    esp(4), SEP, esp(4),
    frase('orientacaoReinicio', base) + ESP,
    esp(4),
    frase('perguntaIntervencao', base) + ESP,
    esp(4), SEP, esp(4),
  ];

  /** As duas opções repassadas ao cliente (loja e visita). */
  const opcoes = () => [
    frase('duasOpcoes'),
    '',
    frase('opcaoVisita'),
    '',
    frase('opcaoLoja'),
  ];

  let d = '', f = '', p = '';

  if (r === 'loja') {
    const [e = '', t = ''] = (n.dataLigacao ?? '').split(' ');
    d = [
      ...miolo(),
      ...opcoes(),
      SEP, esp(4),
      frase('optouLoja', { ...base, dataLoja: e, horaLoja: t }),
      '', frase('semDuvidas'),
    ].join('\n');
  } else if (r === 'remoto') {
    const e = n.ssid?.trim() ?? '';
    const t = n.senhaWifi?.trim() ?? '';
    d = [
      ...miolo(),
      frase('reconfiguracaoRemota', base),
      '',
      frase('linhaSsid', { ...base, ssid: e }),
      frase('linhaSenha', { ...base, senhaWifi: t }),
      '', frase('semDuvidas'),
    ].join('\n');
  } else {
    const e = maiusc(n.bairro);
    const rv = n.dataVisita;
    const mv = n.horaVisita;
    const h = n.protocolo;
    const gv = n.formaPag;
    const dados = { ...base, dataVisita: rv, horaVisita: mv, formaPag: gv, formaPagFrase: fraseFormaPag(gv), protocolo: h, bairro: e };
    d = [
      frase('abertura', base),
      '', '', SEP, '',
      frase('statusOnu', base),
      '', SEP, esp(4),
      frase('relatoSemRede', base),
      esp(4),
      frase('verificacaoRemota', base) + ESP,
      esp(4), SEP, esp(4),
      frase('orientacaoReinicio', base) + ESP,
      esp(4),
      frase('perguntaIntervencao', base) + ESP,
      esp(4), SEP, esp(4),
      ...opcoes(),
      SEP, esp(4),
      frase('optouVisita', dados),
      '', frase('semDuvidas'),
    ].join('\n');
    f = `${frase('corpoOs', dados)}\n\n${SEP_OS}\n\nINDICACAO TECNICA:\n\n${frase('indicacaoTecnica', base)}`;
    p = frase('agenda', dados);
  }

  const saida = r === 'loja' || r === 'remoto'
    ? ['=== Texto Protocolo ===', d].join('\n')
    : ['=== Texto Protocolo ===', d, '', '=== Texto O.S ===', f, '', '=== Texto da Agenda ===', p].join('\n');

  return { protocolo: d, os: f, agenda: p, saida };
}
