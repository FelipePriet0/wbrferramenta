/**
 * Emulação do modelo `wifi-extend-ponto` — porte 1:1 da função `Jqe` do bundle
 * legado (venda de ponto adicional / roteador extend). SEM variável de tipo;
 * ramifica só em segmento (PF/PJ) e troca do roteador primário. 2º arg =
 * operador. Validado por diff contra o legado — ver `wifiExtendPonto.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { WIFI_EXTEND_PONTO } from '../catalogo/wifiExtendPonto';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'wifi-extend-ponto';

const f = fraseDe(SLUG, WIFI_EXTEND_PONTO);

/** Separador da O.S (legado: mqe). */
const SEP_OS = '*'.repeat(35);

/** Indicação técnica padrão, sem troca do roteador primário (legado: Kqe). */
const INDICACAO_PADRAO = () => f('indicacaoPadrao');

/** Indicação técnica com troca do roteador primário (legado: qqe). */
function indicacaoTroca(roteador: string): string {
  return f('indicacaoTroca', { roteador });
}

export function renderWifiExtendPonto(valores: Valores): SaidaOS {
  const v: Valores = {};
  for (const [k, val] of Object.entries(valores)) v[k] = String(val ?? '');

  const operador = v.operadorPrimeiroNome ?? '';
  const ehPJ = maiusc(v.segmento ?? 'PF') === 'PJ';
  const ehTroca = String(v.troca ?? 'NAO') === 'SIM';
  const cliente = maiusc(v.cliente);
  const clientePrimeiro = primeiroNome(cliente);
  const solicitante = primeiroNome(maiusc(v.solicitante));
  const cargo = maiusc(v.cargo);
  const canal = v.canal ?? '';
  const contato = soDigitos(v.contato);
  const bairro = maiusc(v.bairro);
  const dataVisita = v.dataVisita ?? '';
  const horaVisita = v.horaVisita ?? '';
  const protocolo = v.protocolo ?? '';
  const parcela = v.parcela ?? '';
  const formaPag = v.formaPag ?? '';
  const roteador = maiusc(v.roteador);

  const quem = ehPJ ? `${solicitante} (${cargo})` : clientePrimeiro;
  const local = ehPJ ? 'EMPRESA' : 'RESIDÊNCIA';
  const ponto = ehTroca ? `(${roteador})` : '(ROTEADOR PRIMÁRIO)';
  const pagFrase = fraseFormaPag(formaPag);

  const base = {
    canal, contato, quem, local, ponto, parcela, pagFrase,
    dataVisita, horaVisita, clienteCompleto: cliente,
    protocolo, formaPag: maiusc(formaPag), tecnico: operador, bairro, roteador,
  };

  const os = f('corpoOs', base);

  const indicacao = ehTroca ? indicacaoTroca(roteador) : INDICACAO_PADRAO();

  const pontoTextoOS = `${os}\n\n${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${indicacao}`;
  const pontoTextoAgenda = f('agenda', base);

  return { protocolo: '', os: pontoTextoOS, agenda: pontoTextoAgenda };
}
