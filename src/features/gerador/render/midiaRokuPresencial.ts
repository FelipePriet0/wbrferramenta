/**
 * Emulação do modelo `midia-roku-presencial` — porte 1:1 da função `zKe` do
 * bundle legado (conteúdo de O.S do próprio app). Compra presencial do Roku-TV
 * (conversor de mídia): cliente comparece na loja e agenda visita para
 * instalação. Sem variável `tipoSolicitacao`. O 2º argumento do builder legado é
 * o `operadorPrimeiroNome`, lido aqui de `valores.operadorPrimeiroNome`.
 * Validado por diff contra o legado — ver `midiaRokuPresencial.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { MIDIA_ROKU_PRESENCIAL } from '../catalogo/midiaRokuPresencial';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'midia-roku-presencial';

const f = fraseDe(SLUG, MIDIA_ROKU_PRESENCIAL);

/** Espaços finais que o legado deixava em duas linhas. */
const ESP2 = '  ';

/** Separador de asteriscos. (legado: EKe / separadores do FKe) */
const SEP_AST = '*';
/** Indentação: N espaços. */
function esp(n: number): string {
  return ' '.repeat(n);
}

/** Campos normalizados do modelo. (legado: Qj) */
interface DadosRoku {
  clienteUpper: string;
  cp: string;
  sinalONU: string;
  bairro: string;
  valorSTB: string;
  parcelas: string;
  formaPag: string;
  dataVisita: string;
  horaVisita: string;
  protocolo: string;
}

/** Normaliza os valores do formulário. (legado: Qj) */
function normaliza(v: Valores): DadosRoku {
  const clienteUpper = maiusc(v.cliente);
  return {
    clienteUpper,
    cp: primeiroNome(clienteUpper), // OKe
    sinalONU: maiusc(v.sinalONU),
    bairro: maiusc(v.bairro),
    valorSTB: String(v.valorSTB ?? ''),
    parcelas: String(v.parcelas ?? ''),
    formaPag: String(v.formaPag ?? ''),
    dataVisita: String(v.dataVisita ?? ''),
    horaVisita: String(v.horaVisita ?? ''),
    protocolo: String(v.protocolo ?? ''),
  };
}

/** Corpo do Protocolo, após a linha de abertura. (legado: FKe) */
function corpoProtocolo(n: DadosRoku): string[] {
  return [
    SEP_AST,
    '',
    f('statusOnu', { ...n }),
    '',
    SEP_AST,
    esp(8),
    f('motivoCompra', { ...n, cliente: n.cp }) + ESP2,
    '',
    SEP_AST,
    esp(8),
    f('valorAparelho'),
    '',
    f('formasPagamento'),
    esp(8),
    SEP_AST,
    esp(8),
    f('visitaIsenta'),
    '',
    SEP_AST,
    esp(8),
    f('semDevolucao', { ...n, cliente: n.cp, formaPagFrase: fraseFormaPag(n.formaPag) }),
    esp(4),
    f('garantia'),
  ];
}

/** Texto da O.S. (legado: IKe) */
function textoOS(e: string, t: DadosRoku): string {
  return [
    `${e} ${f('osCorpo', { ...t, parcelas: maiusc(t.parcelas), formaPagFrase: fraseFormaPag(t.formaPag) })}`,
    '',
    SEP_AST,
    '',
    f('rotuloIndicacao'),
    '',
    f('indicacaoTecnica'),
  ].join('\n');
}

export function renderMidiaRokuPresencial(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const operador = v.operadorPrimeiroNome ?? '';
  const n = normaliza(v);

  const protocolo = [
    f('cabecalho', { ...n, cliente: n.cp }),
    '',
    ...corpoProtocolo(n),
  ].join('\n');

  const aberturaOS = `${n.cp} COMPARECEU NA LOJA E SOLICITOU A COMPRA DE ROKU-TV (CONVERSOR DE MÍDIA)`;
  const os = textoOS(aberturaOS, n);

  const agenda = f('agenda', { ...n, clienteCompleto: n.clienteUpper, formaPag: maiusc(n.formaPag), tecnico: operador });

  return { protocolo, os, agenda };
}
