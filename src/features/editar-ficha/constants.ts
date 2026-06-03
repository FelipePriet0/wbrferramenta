import type { Opt } from './types';

export const PLANO_OPTIONS: Opt[] = [
  // ── Rádio (sem variação de IP) ──
  { label: '— Rádio —', value: '__hdr_radio', disabled: true },
  { label: '10 Mega + WBR TV+, SVOD - R$ 150,00', value: '10 Mega + WBR TV+, SVOD - R$ 150,00' },
  { label: '15 Mega + WBR TV+, SVOD - R$ 200,00', value: '15 Mega + WBR TV+, SVOD - R$ 200,00' },
  { label: '20 Mega + WBR TV+, SVOD - R$ 280,00', value: '20 Mega + WBR TV+, SVOD - R$ 280,00' },

  // ── Fibra: Patrocínio / Serra do Salitre / Guimarânia / São João / Cruzeiro da Fortaleza / Patos de Minas ──
  // IP Dinâmico = +R$ 20,00 · IP Fixo = +R$ 200,00
  { label: '— Fibra: Patrocínio / Serra do Salitre / Guimarânia / São João / Cruzeiro da Fortaleza / Patos de Minas —', value: '__hdr_fibra1', disabled: true },
  { label: '150 Mega + WBR TV - R$ 59,90', value: '150 Mega + WBR TV - R$ 59,90' },
  { label: '150 Mega + WBR TV + IP Dinâmico - R$ 79,90', value: '150 Mega + WBR TV + IP Dinâmico - R$ 79,90' },
  { label: '150 Mega + WBR TV + IP Fixo - R$ 259,90', value: '150 Mega + WBR TV + IP Fixo - R$ 259,90' },
  { label: '300 Mega + WBR TV - R$ 69,90', value: '300 Mega + WBR TV - R$ 69,90' },
  { label: '300 Mega + WBR TV + IP Dinâmico - R$ 89,90', value: '300 Mega + WBR TV + IP Dinâmico - R$ 89,90' },
  { label: '300 Mega + WBR TV + IP Fixo - R$ 269,90', value: '300 Mega + WBR TV + IP Fixo - R$ 269,90' },
  { label: '600 Mega + WBR TV - R$ 79,90', value: '600 Mega + WBR TV - R$ 79,90' },
  { label: '600 Mega + WBR TV + IP Dinâmico - R$ 99,90', value: '600 Mega + WBR TV + IP Dinâmico - R$ 99,90' },
  { label: '600 Mega + WBR TV + IP Fixo - R$ 279,90', value: '600 Mega + WBR TV + IP Fixo - R$ 279,90' },
  { label: '1000 Mega + WBR TV+, SVOD - R$ 99,90', value: '1000 Mega + WBR TV+, SVOD - R$ 99,90' },
  { label: '1000 Mega + WBR TV+, SVOD + IP Dinâmico - R$ 119,90', value: '1000 Mega + WBR TV+, SVOD + IP Dinâmico - R$ 119,90' },
  { label: '1000 Mega + WBR TV+, SVOD + IP Fixo - R$ 299,90', value: '1000 Mega + WBR TV+, SVOD + IP Fixo - R$ 299,90' },

  // ── Fibra: Salitre de Minas / São Benedito ──
  { label: '— Fibra: Salitre de Minas / São Benedito —', value: '__hdr_fibra2', disabled: true },
  { label: '100 Mega + WBR TV - R$ 69,90', value: '100 Mega + WBR TV - R$ 69,90' },
  { label: '100 Mega + WBR TV + IP Dinâmico - R$ 89,90', value: '100 Mega + WBR TV + IP Dinâmico - R$ 89,90' },
  { label: '100 Mega + WBR TV + IP Fixo - R$ 269,90', value: '100 Mega + WBR TV + IP Fixo - R$ 269,90' },
  { label: '200 Mega + WBR TV - R$ 79,90', value: '200 Mega + WBR TV - R$ 79,90' },
  { label: '200 Mega + WBR TV + IP Dinâmico - R$ 99,90', value: '200 Mega + WBR TV + IP Dinâmico - R$ 99,90' },
  { label: '200 Mega + WBR TV + IP Fixo - R$ 279,90', value: '200 Mega + WBR TV + IP Fixo - R$ 279,90' },
  { label: '300 Mega + WBR TV+, SVOD - R$ 99,90', value: '300 Mega + WBR TV+, SVOD - R$ 99,90' },
  { label: '300 Mega + WBR TV+, SVOD + IP Dinâmico - R$ 119,90', value: '300 Mega + WBR TV+, SVOD + IP Dinâmico - R$ 119,90' },
  { label: '300 Mega + WBR TV+, SVOD + IP Fixo - R$ 299,90', value: '300 Mega + WBR TV+, SVOD + IP Fixo - R$ 299,90' },

  // ── Fibra: Tejuco ──
  { label: '— Fibra: Tejuco —', value: '__hdr_fibra3', disabled: true },
  { label: '300 Mega + WBR TV+, SVOD - R$ 99,90', value: '300 Mega + WBR TV+, SVOD - R$ 99,90' },
  { label: '300 Mega + WBR TV+, SVOD + IP Dinâmico - R$ 119,90', value: '300 Mega + WBR TV+, SVOD + IP Dinâmico - R$ 119,90' },
  { label: '300 Mega + WBR TV+, SVOD + IP Fixo - R$ 299,90', value: '300 Mega + WBR TV+, SVOD + IP Fixo - R$ 299,90' },
  { label: '400 Mega + WBR TV+, SVOD - R$ 129,90', value: '400 Mega + WBR TV+, SVOD - R$ 129,90' },
  { label: '400 Mega + WBR TV+, SVOD + IP Dinâmico - R$ 149,90', value: '400 Mega + WBR TV+, SVOD + IP Dinâmico - R$ 149,90' },
  { label: '400 Mega + WBR TV+, SVOD + IP Fixo - R$ 329,90', value: '400 Mega + WBR TV+, SVOD + IP Fixo - R$ 329,90' },
  { label: '500 Mega + WBR TV+, SVOD - R$ 149,90', value: '500 Mega + WBR TV+, SVOD - R$ 149,90' },
  { label: '500 Mega + WBR TV+, SVOD + IP Dinâmico - R$ 169,90', value: '500 Mega + WBR TV+, SVOD + IP Dinâmico - R$ 169,90' },
  { label: '500 Mega + WBR TV+, SVOD + IP Fixo - R$ 349,90', value: '500 Mega + WBR TV+, SVOD + IP Fixo - R$ 349,90' },
];

export const SVA_OPTIONS: Opt[] = [
  { label: 'XXXXX', value: 'XXXXX' },
  { label: 'IP PÚBLICO - R$ 20,00', value: 'IP PÚBLICO - R$ 20,00' },
  { label: 'IP FIXO - R$ 200,00', value: 'IP FIXO - R$ 200,00' },
  { label: 'WIFI EXTEND - R$ 35,00 CADA PONTO', value: 'WIFI EXTEND - R$ 35,00 CADA PONTO' },
  {
    label: 'ROKU TV - R$ 230,00 À VISTA / R$ 280,00 PARA DIVIDIR',
    value: 'ROKU TV - R$ 230,00 À VISTA / R$ 280,00 PARA DIVIDIR',
  },
  { label: '— Telefone Fixo —', value: '__hdr_tel', disabled: true },
  { label: 'PLANO 150 MB + TEL. FIXO - R$ 79,90', value: 'PLANO 150 MB + TEL. FIXO - R$ 79,90' },
  { label: 'PLANO 300 MB + TEL. FIXO - R$ 89,90', value: 'PLANO 300 MB + TEL. FIXO - R$ 89,90' },
  { label: 'PLANO 600 MB + TEL. FIXO - R$ 99,90', value: 'PLANO 600 MB + TEL. FIXO - R$ 99,90' },
  { label: 'PLANO 1.000 MB + TEL. FIXO - R$ 129,90', value: 'PLANO 1.000 MB + TEL. FIXO - R$ 129,90' },
];

export const VENC_OPTIONS = ['5', '10', '15', '20', '25'] as const;

// ─── Ficha Rural ─────────────────────────────────────────────────────────────
// Planos, SVA, taxa de instalação e "via" exclusivos da ficha Rural (WBR).

export const RURAL_PLANO_OPTIONS: Opt[] = [
  { label: 'XXXXXX', value: 'XXXXXX' },
  { label: '10 MEGA + CINE PLAY + WBR TV - R$ 150,00', value: '10 MEGA + CINE PLAY + WBR TV - R$ 150,00' },
  { label: '15 MEGA + CINE PLAY + WBR TV - R$ 200,00', value: '15 MEGA + CINE PLAY + WBR TV - R$ 200,00' },
  { label: '20 MEGA + CINE PLAY + WBR TV - R$ 280,00', value: '20 MEGA + CINE PLAY + WBR TV - R$ 280,00' },
];

export const RURAL_SVA_OPTIONS: Opt[] = [
  { label: 'XXXXX', value: 'XXXXX' },
  { label: 'WBR PLAY (AVULSO) - R$ 29,90', value: 'WBR PLAY (AVULSO) - R$ 29,90' },
];

export const TAXA_INST_OPTIONS: Opt[] = [
  { label: 'XXXXX', value: 'XXXXX' },
  { label: 'R$ 150,00', value: 'R$ 150,00' },
  { label: 'R$ 300,00', value: 'R$ 300,00' },
  { label: 'R$ 900,00', value: 'R$ 900,00' },
  { label: 'R$ 760,00 (ROUTER DO CLIENTE)', value: 'R$ 760,00 (ROUTER DO CLIENTE)' },
];

export const VIA_OPTIONS: Opt[] = [
  { label: 'XXXXXXXXX', value: 'XXXXXXXXX' },
  { label: 'RÁDIO', value: 'RÁDIO' },
  { label: 'OUTDOOR', value: 'OUTDOOR' },
  { label: 'INSTAGRAM', value: 'INSTAGRAM' },
  { label: 'FACEBOOK', value: 'FACEBOOK' },
  { label: 'SITE', value: 'SITE' },
  { label: 'INDICAÇÃO', value: 'INDICAÇÃO' },
];
