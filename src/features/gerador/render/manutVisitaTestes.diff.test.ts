import { describe, expect, it } from 'vitest';
import { renderManutVisitaTestes } from './manutVisitaTestes';
import fixtures from './__fixtures__/manutVisitaTestes.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutVisitaTestes`) deve bater
 * caractere-a-caractere com a do legado. As fixtures foram geradas rodando a
 * função `vGe` original (extraída do bundle) — ground truth independente do
 * porte. Cobre PF/PJ × padrão/isento/dispensou-remoto × com/sem sinal.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutVisitaTestes × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderManutVisitaTestes(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  }
});
