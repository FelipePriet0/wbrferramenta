import { describe, expect, it } from 'vitest';
import { renderManutRealocFibra } from './manutRealocFibra';
import fixtures from './__fixtures__/manutRealocFibra.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutRealocFibra`) deve bater
 * caractere-a-caractere com a do legado (função `KWe`). As fixtures foram
 * geradas rodando a função original — ground truth independente do porte. Cobre
 * os 5 tipos de solicitação × com/sem sinal.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutRealocFibra × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome} (${fx.input.tipoSolicitacao}/${fx.input.semSinal})`, () => {
      const saida = renderManutRealocFibra(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  }
});
