import { describe, expect, it } from 'vitest';
import { renderWifiExtendPonto } from './wifiExtendPonto';
import fixtures from './__fixtures__/wifiExtendPonto.fixtures.json';

type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderWifiExtendPonto × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderWifiExtendPonto(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  }
});
