/**
 * Emulação do modelo `inst-taxa-residencial` — porte 1:1 da função `SZe` do
 * bundle legado (conteúdo de O.S do próprio app). Instalação com taxa,
 * residencial (PF). Ramifica no modo do solicitante (titular acompanha /
 * terceiro autorizado / terceiro acompanha). 2º arg = operador.
 * Validado por diff contra o legado — ver `instTaxaResidencial.diff.test.ts`.
 */
import { fraseFormaPag, maiusc, primeiroNome, soDigitos, type Valores } from './helpers';
import type { SaidaOS } from './altplanRemoto';

import { fraseDe } from '../catalogo/store';
import { INST_TAXA_RESIDENCIAL } from '../catalogo/instTaxaResidencial';

/** Slug no registry — é a chave dos overrides no banco. */
const SLUG = 'inst-taxa-residencial';

const frase = fraseDe(SLUG, INST_TAXA_RESIDENCIAL);

/**
 * Modos do solicitante — os 4 tipos do legado (mesmo builder do irmão VXe).
 * O sujeito muda quando é TERCEIRO quem solicita; o fecho muda entre TITULAR
 * acompanhar ou AUTORIZAR o terceiro a acompanhar.
 */
const TITULAR_ACOMPANHA = 'titular-acompanha'; // titular solicita e acompanha
const TITULAR_AUTORIZA = 'titular-autoriza'; // titular solicita e autoriza terceiro
const TERCEIRO_AUTORIZA = 'terceiro-autoriza'; // terceiro solicita, titular autoriza terceiro
const TERCEIRO_ACOMPANHA = 'terceiro-acompanha'; // terceiro solicita, titular acompanha

/** Texto fixo da O.S (legado: vZe). */
const OS_TEXTO = () => frase('indicacaoTecnica');

/**
 * Remove o benefício "INSTALAÇÃO/ATIVAÇÃO GRÁTIS" do value do plano — os modelos
 * COM TAXA cobram a instalação, então o benefício grátis embutido no catálogo
 * geraria contradição na mesma O.S.
 */
function removerInstalacaoGratis(plano: string): string {
  return plano
    .replace(/ ?\+ ?INSTALAÇÃO\/ATIVAÇÃO GRÁTIS/g, '')
    .replace(/INSTALAÇÃO\/ATIVAÇÃO GRÁTIS ?\+ ?/g, '');
}

/** Mapa filtroPlano → campo de plano. */
const PLANO_POR_FILTRO: Record<string, string> = {
  '150': 'plano150',
  '300': 'plano300',
  '600': 'plano600',
  '1g': 'plano1g',
  ittv: 'planoIttv',
};

export function renderInstTaxaResidencial(valores: Valores): SaidaOS {
  const t: Valores = {};
  for (const [k, val] of Object.entries(valores)) t[k] = String(val ?? '');

  const n = t.tipoSolicitacao || TITULAR_ACOMPANHA;
  const r = primeiroNome(maiusc(t.cliente));
  const i = primeiroNome(maiusc(t.solicitante || ''));
  const a = maiusc(t.solicitante || '');
  const o = maiusc(t.parente || '');
  const s = t.canal || '';
  const c = ['VIA LIGAÇÃO', 'VIA WHATSAPP'].includes(s)
    ? `${s} ${soDigitos(t.contato || '')}`
    : s;
  const l = t.filtroPlano || '150';
  const u = t[PLANO_POR_FILTRO[l]] ?? '';
  // O value do catálogo já começa pela velocidade: usar o plano inteiro como
  // PLANO DE ACESSO (sem split) e ler a taxa de um campo próprio. Como este é o
  // modelo COM TAXA, remove o benefício "INSTALAÇÃO/ATIVAÇÃO GRÁTIS" do plano.
  const f = removerInstalacaoGratis(u);
  const d = maiusc(t.valorTaxa || '');
  const p = t.vencimento || '';
  const m = t.dataVisita || '';
  const h = t.horaVisita || '';
  // Parcelamento (feature nova — o legado era pagamento único). Ex.: "3X".
  const parcelas = maiusc(t.parcelas || '1X');
  // Regência da forma de pagamento (NO CARTÃO / EM DINHEIRO / VIA PIX).
  const formaPagFrase = fraseFormaPag(t.formaPag || '');

  // Terceiro é o sujeito quando ele solicita (autoriza ou acompanha).
  const sujeito =
    n === TERCEIRO_AUTORIZA || n === TERCEIRO_ACOMPANHA
      ? `${i} (${o} DE ${r})`
      : r;
  // Titular acompanha em titular-acompanha/terceiro-acompanha; nos demais,
  // autoriza o terceiro a acompanhar.
  const acompanhamento =
    n === TITULAR_ACOMPANHA || n === TERCEIRO_ACOMPANHA
      ? frase('titularAcompanha', { cliente: r })
      : frase('titularAutorizaTerceiro', { cliente: r, solicitanteCompleto: a, parente: o });

  const protocolo = `${frase('protocolo', { sujeito: sujeito, canal: c, plano: f, vencimento: p, dataVisita: m, horaVisita: h })} ${acompanhamento} ${frase('taxaInstalacao', { taxa: d, parcelas, formaPagFrase })}`;

  return { protocolo, os: OS_TEXTO() };
}
