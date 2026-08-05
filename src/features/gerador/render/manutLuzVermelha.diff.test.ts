import { describe, expect, it } from 'vitest';
import { renderManutLuzVermelha } from './manutLuzVermelha';
import fixtures from './__fixtures__/manutLuzVermelha.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderManutLuzVermelha`) deve bater
 * caractere-a-caractere com a do legado. As fixtures foram geradas rodando a
 * função `hUe` original (extraída do bundle) — ground truth independente do
 * porte. Cobre os 4 tipos de solicitação × com/sem sinal, incluindo o texto de
 * agendamento da visita técnica.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
  agenda: string;
};

describe('renderManutLuzVermelha × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome} (${fx.input.tipoSolicitacao})`, () => {
      const saida = renderManutLuzVermelha(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toBe(fx.os);
      expect(saida.agenda).toBe(fx.agenda);
    });
  }
});
