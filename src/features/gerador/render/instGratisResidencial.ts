/**
 * Emulação do modelo `inst-gratis-residencial` — porte 1:1 da função `VXe` do
 * bundle legado (conteúdo de O.S do próprio app). Instalação grátis, residencial
 * (PF). Assinatura original `(valores, operadorPrimeiroNome)`. Saída = protocolo
 * + O.S (texto fixo). Validado por diff contra o legado — ver
 * `instGratisResidencial.diff.test.ts`.
 */
import { maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { INST_GRATIS_RESIDENCIAL } from '../catalogo/instGratisResidencial';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'inst-gratis-residencial';

const frase = fraseDe(SLUG, INST_GRATIS_RESIDENCIAL);

/**
 * Modos do solicitante — os 4 tipos do legado (builder VXe: WN/OXe/GN/KN).
 * O sujeito muda quando é TERCEIRO quem solicita; o fecho muda entre TITULAR
 * acompanhar ou AUTORIZAR o terceiro a acompanhar.
 */
const TITULAR_ACOMPANHA = 'titular-acompanha'; // WN — titular solicita e acompanha
const TITULAR_AUTORIZA = 'titular-autoriza'; // OXe — titular solicita e autoriza terceiro
const TERCEIRO_AUTORIZA = 'terceiro-autoriza'; // GN — terceiro solicita, titular autoriza terceiro
const TERCEIRO_ACOMPANHA = 'terceiro-acompanha'; // KN — terceiro solicita, titular acompanha

/** Texto fixo da O.S (legado: LXe). */
const OS_TEXTO = () => frase('indicacaoTecnica');

const CANAIS_COM_CONTATO = ['VIA LIGAÇÃO', 'VIA WHATSAPP'];

export function renderInstGratisResidencial(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = t.tipoSolicitacao || TITULAR_ACOMPANHA;
  const r = primeiroNome(maiusc(t.cliente));
  const i = primeiroNome(maiusc(t.solicitante || ''));
  const a = maiusc(t.solicitante || '');
  const o = maiusc(t.parente || '');
  const s = t.canal || '';
  const c = CANAIS_COM_CONTATO.includes(s)
    ? `${s} ${soDigitos(t.contato || '')}`
    : s;
  const l = t.filtroPlano || '150';
  const planoMap: Record<string, string> = {
    '150': t.plano150,
    '300': t.plano300,
    '600': t.plano600,
    '1g': t.plano1g,
    ittv: t.planoIttv,
  };
  const u = planoMap[l] ?? '';
  const d = t.vencimento || '';
  const f = t.dataVisita || '';
  const p = t.horaVisita || '';

  // Terceiro é o sujeito quando ele solicita (autoriza ou acompanha).
  const sujeito =
    n === TERCEIRO_AUTORIZA || n === TERCEIRO_ACOMPANHA
      ? `${i} (${o} DE ${r})`
      : r;
  // Titular acompanha em WN/KN; nos demais, autoriza o terceiro a acompanhar.
  const acompanhamento =
    n === TITULAR_ACOMPANHA || n === TERCEIRO_ACOMPANHA
      ? frase('titularAcompanha', { cliente: r })
      : frase('titularAutorizaTerceiro', { cliente: r, solicitanteCompleto: a, parente: o });

  const protocolo = `${frase('protocolo', { sujeito: sujeito, canal: c, plano: u, vencimento: d, dataVisita: f, horaVisita: p })} ${acompanhamento}`;

  return { protocolo, os: OS_TEXTO() };
}
