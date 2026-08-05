import { describe, expect, it } from 'vitest';
import { renderManutOcasConector } from './manutOcasConector';
import fixtures from './__fixtures__/manutOcasConector.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutOcasConector`) deve bater
 * caractere-a-caractere com a do legado (função `ZUe`). As fixtures são ground
 * truth independente do porte. Cobre os 4 tipos de solicitação × com/sem sinal.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutOcasConector × legado (diff)', () => {
  (fixtures as Fixture[]).forEach((fx, i) => {
    it(`bate no caso ${i} (${fx.nome})`, () => {
      const saida = renderManutOcasConector(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  });
});
