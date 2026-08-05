import { describe, expect, it } from 'vitest';
import { renderManutMudPontoInt } from './manutMudPontoInt';
import fixtures from './__fixtures__/manutMudPontoInt.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutMudPontoInt`) deve bater
 * caractere-a-caractere com a do legado. As fixtures foram geradas rodando a
 * função construtora `nGe` original (extraída do bundle) — ground truth
 * independente do porte. Cobre os 5 tipos de solicitação × com/sem sinal.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutMudPontoInt × legado (diff)', () => {
  for (const [idx, fx] of (fixtures as Fixture[]).entries()) {
    it(`bate no caso ${idx} (${fx.nome})`, () => {
      const saida = renderManutMudPontoInt(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) {
        expect(saida.agenda).toBe(fx.agenda);
      }
      if (fx.saida !== undefined) {
        expect(saida.saida).toBe(fx.saida);
      }
    });
  }
});
