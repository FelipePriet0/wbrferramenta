import { describe, expect, it } from 'vitest';
import { renderAltplanTrocaVisitaPaga } from './altplanTrocaVisitaPaga';
import { renderAltplanTrocaVisitaIsenta } from './altplanTrocaVisitaIsenta';
import { renderAltplanSemTrocaVisitaPaga } from './altplanSemTrocaVisitaPaga';
import { renderAltplanSemTrocaVisitaIsenta } from './altplanSemTrocaVisitaIsenta';
import type { Valores } from './helpers';

/**
 * Regressão: o texto de agenda dos 4 modelos de Alteração de Plano deve puxar o
 * nome do operador de `valores.operadorPrimeiroNome`, igual aos demais modelos do
 * gerador. As fixtures do legado (`*.diff.test.ts`) foram geradas SEM operador,
 * então não cobrem esse caminho — daí este teste dedicado.
 */

const BASE: Valores = {
  cliente: 'JOAO DA SILVA',
  protocolo: '123.456',
  formaPag: 'PIX',
  bairro: 'CENTRO',
  canal: 'LIGAÇÃO',
  contato: '34999999999',
  planoAtual: '100 MEGA',
  planoEscolhido: '500 MEGA',
  roteador: 'ZTE H199-A',
  dataVisita: '20/07/2026',
  horaVisita: '14:00',
};

const RENDERS = [
  { nome: 'altplan-troca-visita-paga', fn: renderAltplanTrocaVisitaPaga },
  { nome: 'altplan-troca-visita-isenta', fn: renderAltplanTrocaVisitaIsenta },
  { nome: 'altplan-sem-troca-visita-paga', fn: renderAltplanSemTrocaVisitaPaga },
  { nome: 'altplan-sem-troca-visita-isenta', fn: renderAltplanSemTrocaVisitaIsenta },
] as const;

describe('altplan — operador na agenda', () => {
  for (const { nome, fn } of RENDERS) {
    it(`${nome}: inclui (OPERADOR) quando operadorPrimeiroNome está preenchido`, () => {
      const saida = fn({ ...BASE, operadorPrimeiroNome: 'PEDRO' });
      expect(saida.agenda).toContain('(PEDRO)');
    });

    it(`${nome}: sem operador, o slot não aparece (paridade com o legado)`, () => {
      const saida = fn({ ...BASE });
      expect(saida.agenda).not.toContain('()');
      expect(saida.agenda).not.toContain('( )');
    });
  }
});
