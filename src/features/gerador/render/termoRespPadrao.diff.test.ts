import { describe, expect, it } from 'vitest';
import { renderTermoRespPadrao } from './termoRespPadrao';
import fixtures from './__fixtures__/termoRespPadrao.fixtures.json';

type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
  termo?: string;
};

describe('renderTermoRespPadrao × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderTermoRespPadrao(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
      if (fx.termo !== undefined) expect(saida.termo).toBe(fx.termo);
    });
  }
});
