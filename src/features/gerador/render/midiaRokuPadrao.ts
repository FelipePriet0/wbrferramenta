/**
 * Emulação do modelo `midia-roku-padrao` — porte 1:1 da função `LKe` do bundle
 * legado (conteúdo de O.S do próprio app). Compra do ROKU-TV (conversor de
 * mídia): protocolo + O.S + agenda. SEM variável de tipo. 2º arg do builder =
 * operador (lido de `valores.operadorPrimeiroNome`). Validado por diff contra o
 * legado — ver `midiaRokuPadrao.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { MIDIA_ROKU_PADRAO } from '../catalogo/midiaRokuPadrao';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'midia-roku-padrao';

const f = fraseDe(SLUG, MIDIA_ROKU_PADRAO);

/** Espaços finais que o legado deixava em duas linhas. */
const ESP2 = '  ';

/** Separador do corpo (legado: EKe). */
const SEP = '*';
/** Indentação literal preservada dos template-strings do legado. */
const esp = (n: number) => ' '.repeat(n);

interface Dados {
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

/** Extrai/normaliza os campos usados no modelo (legado: Qj). */
function extrai(e: Valores): Dados {
  const clienteUpper = maiusc(e.cliente);
  return {
    clienteUpper,
    cp: primeiroNome(clienteUpper),
    sinalONU: maiusc(e.sinalONU),
    bairro: maiusc(e.bairro),
    valorSTB: String(e.valorSTB ?? ''),
    parcelas: String(e.parcelas ?? ''),
    formaPag: String(e.formaPag ?? ''),
    dataVisita: String(e.dataVisita ?? ''),
    horaVisita: String(e.horaVisita ?? ''),
    protocolo: String(e.protocolo ?? ''),
  };
}

/** Corpo do protocolo (legado: FKe). */
function corpoProtocolo(n: Dados): string[] {
  return [
    SEP,
    '',
    f('statusOnu', { ...n }),
    '',
    SEP,
    esp(8),
    f('motivoCompra', { ...n, cliente: n.cp }) + ESP2,
    '',
    SEP,
    esp(8),
    f('valorAparelho'),
    '',
    f('formasPagamento'),
    esp(8),
    SEP,
    esp(8),
    f('visitaIsenta'),
    '',
    SEP,
    esp(8),
    f('semDevolucao', { ...n, cliente: n.cp, formaPagFrase: fraseFormaPag(n.formaPag) }),
    esp(4),
    f('garantia'),
  ];
}

/** Texto da O.S (legado: IKe). */
function montarOS(cabecalho: string, n: Dados): string {
  return [
    `${cabecalho} ${f('osCorpo', { ...n, parcelas: maiusc(n.parcelas), formaPagFrase: fraseFormaPag(n.formaPag) })}`,
    '',
    SEP,
    '',
    f('rotuloIndicacao'),
    '',
    f('indicacaoTecnica'),
  ].join('\n');
}

export function renderMidiaRokuPadrao(valores: Valores): SaidaOS {
  const n = extrai(valores);
  const canal = String(valores.canal ?? '');
  const contato = soDigitos(valores.contato);
  const operador = String(valores.operadorPrimeiroNome ?? '');

  const cabecalho = f('cabecalho', { ...n, cliente: n.cp, canal, contato });

  const protocolo = [`${cabecalho}.`, '', ...corpoProtocolo(n)].join('\n');
  const os = montarOS(cabecalho, n);
  const agenda = f('agenda', { ...n, clienteCompleto: n.clienteUpper, formaPag: maiusc(n.formaPag), tecnico: operador });

  return { protocolo, os, agenda };
}
