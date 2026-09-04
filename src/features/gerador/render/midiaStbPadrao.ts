/**
 * Emulação do modelo `midia-stb-padrao` — porte da função `iqe` do bundle
 * legado (conteúdo de O.S do próprio app), com `protocolo`/`agenda` adicionados
 * (o legado só tinha `stbPadraoTextoOS` — sem texto de protocolo, sem agenda,
 * sem campo de bairro/nº de protocolo). Estrutura de protocolo/agenda espelha
 * `midiaRokuPadrao.ts` (mesmo fluxo de compra + visita isenta). O 2º argumento
 * do builder legado é o `operadorPrimeiroNome`, lido aqui de
 * `valores.operadorPrimeiroNome`.
 * O texto da O.S (`os`) permanece validado por diff contra o legado — ver
 * `midiaStbPadrao.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { MIDIA_STB_PADRAO } from '../catalogo/midiaStbPadrao';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'midia-stb-padrao';

const frase = fraseDe(SLUG, MIDIA_STB_PADRAO);

/** Espaços finais que o legado deixava numa linha. */
const ESP2 = '  ';

/** Separador de asteriscos entre a O.S e a indicação técnica. (legado: JKe) */
const SEP = '*'.repeat(35);
const esp = (n: number) => ' '.repeat(n);

export function renderMidiaStbPadrao(valores: Valores): SaidaOS {
  const e: Valores = {};
  for (const [k, val] of Object.entries(valores)) e[k] = String(val ?? '');

  const clienteUpper = maiusc(e.cliente);
  const n = primeiroNome(clienteUpper);
  const r = maiusc(e.canal);
  const i = soDigitos(e.contato);
  const a = String(e.valorSTB ?? '');
  const fp = maiusc(e.formaPag);
  const pagFrase = fp === 'CARTAO' ? 'NO CARTÃO' : fp === 'DINHEIRO' ? 'EM DINHEIRO' : fp === 'PIX' ? 'VIA PIX' : `NO ${fp}`;
  const parcelas = a === `R$100,00` ? `1X` : maiusc(e.parcelas);
  const dataVisita = String(e.dataVisita ?? '');
  const horaVisita = String(e.horaVisita ?? '');
  const bairro = maiusc(e.bairro);
  const protocoloNum = String(e.protocolo ?? '');
  const operador = String(e.operadorPrimeiroNome ?? '');

  const base = {
    cliente: n, clienteCompleto: clienteUpper, canal: r, contato: i,
    valorSTB: a, parcelas, pagFrase, formaPag: fp, formaPagFrase: fraseFormaPag(fp),
    dataVisita, horaVisita, protocolo: protocoloNum, bairro, tecnico: operador,
  };

  const cabecalho = frase('cabecalho', base);

  const texto = [
    `${cabecalho} ${frase('osCorpo', base)}`,
    ``,
    SEP,
    ``,
    frase('rotuloIndicacao'),
    ``,
    frase('indicacaoTecnica'),
  ].join(`\n`);

  const protocolo = [
    `${cabecalho}.`,
    ``,
    SEP,
    ``,
    frase('statusCliente'),
    ``,
    SEP,
    esp(8),
    frase('motivoCompra', base) + ESP2,
    ``,
    SEP,
    esp(8),
    frase('valorAparelho', base),
    ``,
    frase('formasPagamento'),
    esp(8),
    SEP,
    esp(8),
    frase('visitaIsenta'),
    ``,
    SEP,
    esp(8),
    frase('semDevolucao', base),
    esp(4),
    frase('garantia'),
  ].join(`\n`);

  const agenda = frase('agenda', base);

  return { protocolo, os: texto, agenda };
}
