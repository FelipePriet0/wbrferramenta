import { describe, expect, it } from 'vitest';
import { renderManutLuzVermelhaPj } from './manutLuzVermelhaPj';
import fixtures from './__fixtures__/manutLuzVermelhaPj.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutLuzVermelhaPj`) deve bater
 * caractere-a-caractere com a do legado. As fixtures foram geradas rodando a
 * função `EUe` original (extraída do bundle) — ground truth independente do
 * porte. Cobre com/sem ONU informada.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutLuzVermelhaPj × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderManutLuzVermelhaPj(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  }
});
