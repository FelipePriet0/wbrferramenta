import { describe, expect, it } from 'vitest';
import { renderFeedbackTrocaEquip } from './feedbackTrocaEquip';
import fixtures from './__fixtures__/feedbackTrocaEquip.fixtures.json';

type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda?: string;
  saida?: string;
};

describe('renderFeedbackTrocaEquip × legado (diff)', () => {
  // `as unknown` porque os casos da fixture têm conjuntos de chaves diferentes
  // entre si (o c2 tem MAC e observação, os outros não), e o TS infere uma união
  // onde algumas chaves são `undefined` — incompatível com Record<string,string>
  // sem passar por unknown.
  for (const fx of fixtures as unknown as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderFeedbackTrocaEquip(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      if (fx.agenda !== undefined) expect(saida.agenda).toBe(fx.agenda);
      if (fx.saida !== undefined) expect(saida.saida).toBe(fx.saida);
    });
  }
});
