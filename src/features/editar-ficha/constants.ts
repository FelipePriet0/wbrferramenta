import type { Opt } from './types';

export const PLANO_OPTIONS: Opt[] = [
  { label: '— Normais —', value: '__hdr_norm', disabled: true },
  { label: '150 Mega - R$ 59,90', value: '150 Mega - R$ 59,90' },
  { label: '300 Mega - R$ 69,90', value: '300 Mega - R$ 69,90' },
  { label: '600 Mega - R$ 79,90', value: '600 Mega - R$ 79,90' },
  { label: '1000 Mega (1Gb) - R$ 99,90', value: '1000 Mega (1Gb) - R$ 99,90' },
  { label: '— IP Dinâmico —', value: '__hdr_ipdin', disabled: true },
  {
    label: '150 Mega + IP Dinâmico - R$ 80,00',
    value: '150 Mega + IP Dinâmico - R$ 80,00',
  },
  {
    label: '300 Mega + IP Dinâmico - R$ 90,00',
    value: '300 Mega + IP Dinâmico - R$ 90,00',
  },
  {
    label: '600 Mega + IP Dinâmico - R$ 100,00',
    value: '600 Mega + IP Dinâmico - R$ 100,00',
  },
  {
    label: '1000 Mega (1Gb) + IP Dinâmico - R$ 120,00',
    value: '1000 Mega (1Gb) + IP Dinâmico - R$ 120,00',
  },
  { label: '— IP Fixo —', value: '__hdr_ipfixo', disabled: true },
  {
    label: '150 Mega + IP Fixo - R$ 259,90',
    value: '150 Mega + IP Fixo - R$ 259,90',
  },
  {
    label: '300 Mega + IP Fixo - R$ 269,90',
    value: '300 Mega + IP Fixo - R$ 269,90',
  },
  {
    label: '600 Mega + IP Fixo - R$ 279,90',
    value: '600 Mega + IP Fixo - R$ 279,90',
  },
  {
    label: '1000 Mega (1Gb) + IP Fixo - R$ 299,90',
    value: '1000 Mega (1Gb) + IP Fixo - R$ 299,90',
  },
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
