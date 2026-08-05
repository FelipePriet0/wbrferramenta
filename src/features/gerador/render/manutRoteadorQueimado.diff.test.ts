import { describe, expect, it } from 'vitest';
import { renderManutRoteadorQueimado } from './manutRoteadorQueimado';
import fixtures from './__fixtures__/manutRoteadorQueimado.fixtures.json';

type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderManutRoteadorQueimado × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderManutRoteadorQueimado(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
    });
  }
});
