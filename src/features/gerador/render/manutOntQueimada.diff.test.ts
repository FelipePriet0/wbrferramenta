import { describe, expect, it } from 'vitest';
import { renderManutOntQueimada } from './manutOntQueimada';
import fixtures from './__fixtures__/manutOntQueimada.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutOntQueimada`) deve bater
 * caractere-a-caractere com a do legado. As fixtures foram geradas rodando a
 * função `XGe` original (extraída do bundle) — ground truth independente do
 * porte. Cobre as 5 variantes de `tipoSolicitacao` × com/sem sinal.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutOntQueimada × legado (diff)', () => {
  (fixtures as Fixture[]).forEach((fx, idx) => {
    it(`bate no caso ${fx.nome} (#${idx})`, () => {
      const saida = renderManutOntQueimada(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  });
});
