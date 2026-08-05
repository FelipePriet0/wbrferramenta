import { describe, expect, it } from 'vitest';
import { renderManutLuzVermelhaIsento } from './manutLuzVermelhaIsento';
import fixtures from './__fixtures__/manutLuzVermelhaIsento.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutLuzVermelhaIsento`) deve
 * bater caractere-a-caractere com a do legado. As fixtures foram geradas rodando
 * a função `wWe` original (extraída do bundle) — ground truth independente do
 * porte. O 2º argumento do builder é o primeiro nome do operador
 * (`operadorPrimeiroNome`).
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutLuzVermelhaIsento × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderManutLuzVermelhaIsento(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  }
});
