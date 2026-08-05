import { describe, expect, it } from 'vitest';
import { renderManutFonteQueimada } from './manutFonteQueimada';
import fixtures from './__fixtures__/manutFonteQueimada.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutFonteQueimada`) deve
 * bater caractere-a-caractere com a do legado. As fixtures foram geradas
 * rodando a função `AGe` original (extraída do bundle) — ground truth
 * independente do porte. Cobre com-visita × loja × com/sem sinal.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutFonteQueimada × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderManutFonteQueimada(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  }
});
