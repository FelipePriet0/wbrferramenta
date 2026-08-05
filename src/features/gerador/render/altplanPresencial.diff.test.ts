import { describe, expect, it } from 'vitest';
import { renderAltplanPresencial } from './altplanPresencial';
import fixtures from './__fixtures__/altplanPresencial.fixtures.json';

/**
 * Diff de fidelidade contra o legado (fixtures geradas rodando a função `bVe`
 * original do bundle). Cobre titular/terceiro × com/sem sinal.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
};

describe('renderAltplanPresencial × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderAltplanPresencial(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
    });
  }
});
