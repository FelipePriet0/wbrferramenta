import { describe, expect, it } from 'vitest';
import { renderManutOcasFibra } from './manutOcasFibra';
import fixtures from './__fixtures__/manutOcasFibra.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutOcasFibra`) deve bater
 * caractere-a-caractere com a do legado. As fixtures foram geradas rodando a
 * função `mWe` original (extraída do bundle) — ground truth independente do
 * porte. Cobre os 4 tipos de solicitação × com/sem sinal.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutOcasFibra × legado (diff)', () => {
  (fixtures as Fixture[]).forEach((fx, idx) => {
    it(`bate no caso ${idx} ${fx.nome}`, () => {
      const saida = renderManutOcasFibra(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  });
});
