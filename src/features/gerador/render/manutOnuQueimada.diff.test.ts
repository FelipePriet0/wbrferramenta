import { describe, expect, it } from 'vitest';
import { renderManutOnuQueimada } from './manutOnuQueimada';
import fixtures from './__fixtures__/manutOnuQueimada.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutOnuQueimada`) deve bater
 * caractere-a-caractere com a do legado. As fixtures foram geradas rodando a
 * função `uKe` original (extraída do bundle) — ground truth independente do
 * porte. Cobre os 5 tipos de solicitação × com/sem sinal.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutOnuQueimada × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderManutOnuQueimada(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  }
});
