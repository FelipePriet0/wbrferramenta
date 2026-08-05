import { describe, expect, it } from 'vitest';
import { renderManutFibraExterna } from './manutFibraExterna';
import fixtures from './__fixtures__/manutFibraExterna.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutFibraExterna`) deve bater
 * caractere-a-caractere com a do legado (função construtora `zUe`). As fixtures
 * foram geradas rodando o builder original — ground truth independente do porte.
 * Cobre os 5 tipos de solicitação × com/sem sinal (ONU vazia).
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutFibraExterna × legado (diff)', () => {
  (fixtures as Fixture[]).forEach((fx, i) => {
    it(`bate no caso ${fx.nome} (#${i})`, () => {
      const saida = renderManutFibraExterna(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  });
});
