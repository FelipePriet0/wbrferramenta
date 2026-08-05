import { describe, expect, it } from 'vitest';
import { renderAltplanSemTrocaVisitaPaga } from './altplanSemTrocaVisitaPaga';
import fixtures from './__fixtures__/altplanSemTrocaVisitaPaga.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderAltplanSemTrocaVisitaPaga`)
 * deve bater caractere-a-caractere com a do legado. As fixtures foram geradas
 * rodando a função `YVe` original (extraída do bundle) — ground truth
 * independente do porte. Cobre os 4 tipos de solicitação × padrão/ofertado ×
 * com/sem sinal, incluindo o texto de agendamento.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda: string;
};

describe('renderAltplanSemTrocaVisitaPaga × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderAltplanSemTrocaVisitaPaga(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      expect(saida.agenda).toBe(fx.agenda);
    });
  }
});
