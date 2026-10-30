import { describe, expect, it } from 'vitest';
import { formatAuditValue, toSvaList } from './sva';

describe('toSvaList', () => {
  it('returns the array as-is when already a list', () => {
    expect(toSvaList(['IP PÚBLICO - R$ 20,00', 'PREMIERE - R$ 30,00'])).toEqual([
      'IP PÚBLICO - R$ 20,00',
      'PREMIERE - R$ 30,00',
    ]);
  });

  it('wraps a legacy single string from cache or realtime', () => {
    expect(toSvaList('WIFI EXTEND - R$ 35,00 CADA PONTO')).toEqual(['WIFI EXTEND - R$ 35,00 CADA PONTO']);
  });

  it('treats null, empty and the XXXXX placeholder as no SVA', () => {
    expect(toSvaList(null)).toEqual([]);
    expect(toSvaList(undefined)).toEqual([]);
    expect(toSvaList('')).toEqual([]);
    expect(toSvaList('XXXXX')).toEqual([]);
    expect(toSvaList(['XXXXX', 'COMBATE - R$ 30,00'])).toEqual(['COMBATE - R$ 30,00']);
  });
});

describe('formatAuditValue', () => {
  it('joins a JSON array logged by the audit trigger', () => {
    expect(formatAuditValue('["IP PÚBLICO - R$ 20,00", "PREMIERE - R$ 30,00"]')).toBe(
      'IP PÚBLICO - R$ 20,00 + PREMIERE - R$ 30,00',
    );
  });

  it('keeps plain text and empty values untouched', () => {
    expect(formatAuditValue('WIFI EXTEND - R$ 35,00 CADA PONTO')).toBe('WIFI EXTEND - R$ 35,00 CADA PONTO');
    expect(formatAuditValue('')).toBe('');
    expect(formatAuditValue(null)).toBe(null);
  });

  it('keeps text that only looks like an array', () => {
    expect(formatAuditValue('[nota do analista')).toBe('[nota do analista');
  });
});
