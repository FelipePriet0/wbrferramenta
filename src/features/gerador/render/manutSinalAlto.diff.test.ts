import { describe, expect, it } from 'vitest';
import { renderManutSinalAlto } from './manutSinalAlto';
import fixtures from './__fixtures__/manutSinalAlto.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutSinalAlto`) deve bater
 * caractere-a-caractere com a do legado (função `FWe`). As fixtures foram
 * geradas rodando a construtora original — ground truth independente do porte.
 * Cobre os 5 tipos de solicitação × com/sem sinal.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutSinalAlto × legado (diff)', () => {
  for (const [idx, fx] of (fixtures as Fixture[]).entries()) {
    it(`bate no caso ${fx.nome} (#${idx})`, () => {
      const saida = renderManutSinalAlto(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  }
});
