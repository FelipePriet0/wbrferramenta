import { describe, expect, it } from 'vitest';
import { renderAltplanTrocaVisitaPaga } from './altplanTrocaVisitaPaga';
import fixtures from './__fixtures__/altplanTrocaVisitaPaga.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderAltplanTrocaVisitaPaga`) deve
 * bater caractere-a-caractere com a do legado. As fixtures foram geradas
 * rodando a função `PHe` original (extraída do bundle) — ground truth
 * independente do porte. Cobre os 4 tipos de solicitação × padrão/ofertado ×
 * com/sem sinal, incluindo protocolo, o.s e agenda.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda: string;
};

describe('renderAltplanTrocaVisitaPaga × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderAltplanTrocaVisitaPaga(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      expect(saida.agenda).toBe(fx.agenda);
    });
  }
});
