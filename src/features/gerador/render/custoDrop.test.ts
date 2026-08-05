import { describe, expect, it } from 'vitest';
import { nucleoCustoDrop } from './helpers';
import { renderManutMudPontoInt } from './manutMudPontoInt';
import { renderManutRealocFibra } from './manutRealocFibra';
import { renderManutOcasFibra } from './manutOcasFibra';

/**
 * Explicação dos termos de custo (drop com sobra = R$50 / drop novo = R$100)
 * nos 3 modelos que dependem de reaproveitar o cabo drop. Os diff tests só
 * exercitam `valor` vazio; aqui cobrimos o comportamento REAL (valor preenchido)
 * no Protocolo e na O.S. Ver `helpers.ts#nucleoCustoDrop`.
 */

const EXPLICA_50 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS APROVEITANDO O MESMO DROP (CABO/FIBRA) O CUSTO DO SERVICO E DE R$50,00.';
const EXPLICA_100 =
  'EXPLIQUEI TAMBEM QUE CASO DROP (CABO/FIBRA) NAO TENHA SOBRA E FOR NECESSARIO SER SUBSTITUIDO POR OUTRO, O CUSTO PASSA A SER DE R$100,00 (INCLUI PECAS E SERVICOS).';
const FORMAS_PAG = 'VALOR PAGO NO ATO EM DINHEIRO, CARTAO OU PIX.';

const renders = [
  { nome: 'mudanca de ponto', fn: renderManutMudPontoInt },
  { nome: 'remanejamento de fibra', fn: renderManutRealocFibra },
  { nome: 'dano ocasionado fibra', fn: renderManutOcasFibra },
] as const;

const baseInput = {
  cliente: 'Erika Souza',
  solicitante: 'Erika Souza',
  canal: 'WHATSAPP',
  contato: '34998836589',
  motivo: 'quer mudar de lugar',
  formaPag: 'CARTAO',
  dataVisita: '17/06/2026',
  horaVisita: '17:30',
  protocolo: '123.456',
  bairro: 'Centro',
  operadorPrimeiroNome: 'Pedro',
};

describe('explicação dos termos de custo (drop) — Protocolo e O.S', () => {
  describe('nucleoCustoDrop', () => {
    it('R$50 OU R$100 → explica os dois cenários', () => {
      const t = nucleoCustoDrop('R$50 OU R$100');
      expect(t).toContain(EXPLICA_50);
      expect(t).toContain(EXPLICA_100);
    });

    it('R$50,00 fixo → só o cenário de aproveitar o drop', () => {
      const t = nucleoCustoDrop('R$50,00');
      expect(t).toBe(
        'EXPLIQUEI QUE, APROVEITANDO O MESMO DROP (CABO/FIBRA), O CUSTO DO SERVICO E DE R$50,00.',
      );
    });

    it('R$100,00 fixo → só o cenário de substituir o drop (inclui peças)', () => {
      const t = nucleoCustoDrop('R$100,00');
      expect(t).toBe(
        'EXPLIQUEI QUE, POR SER NECESSARIO SUBSTITUIR O DROP (CABO/FIBRA) POR OUTRO, O CUSTO DO SERVICO E DE R$100,00 (INCLUI PECAS E SERVICOS).',
      );
    });

    it('vazio → string vazia (fidelidade às fixtures)', () => {
      expect(nucleoCustoDrop('')).toBe('');
      expect(nucleoCustoDrop(undefined)).toBe('');
    });
  });

  for (const { nome, fn } of renders) {
    describe(nome, () => {
      it('valor "R$50 OU R$100": explica os dois cenários no Protocolo e na O.S', () => {
        const saida = fn({ ...baseInput, valor: 'R$50 OU R$100' });
        for (const campo of [saida.protocolo, saida.os]) {
          expect(campo).toContain(EXPLICA_50);
          expect(campo).toContain(EXPLICA_100);
        }
        // Protocolo fecha com as formas de pagamento.
        expect(saida.protocolo).toContain(`${EXPLICA_100} ${FORMAS_PAG}`);
        // Sem pontuação dobrada herdada da junção com o restante do template.
        expect(saida.os).not.toContain(').;');
        expect(saida.os).not.toContain('..');
      });

      it('valor "R$50,00" fixo: afirma R$50 sem citar R$100', () => {
        const saida = fn({ ...baseInput, valor: 'R$50,00' });
        expect(saida.os).toContain(
          'EXPLIQUEI QUE, APROVEITANDO O MESMO DROP (CABO/FIBRA), O CUSTO DO SERVICO E DE R$50,00.',
        );
        expect(saida.os).not.toContain('R$100,00');
      });

      it('valor "R$100,00" fixo: afirma R$100 com peças e serviços', () => {
        const saida = fn({ ...baseInput, valor: 'R$100,00' });
        expect(saida.os).toContain(
          'POR SER NECESSARIO SUBSTITUIR O DROP (CABO/FIBRA) POR OUTRO, O CUSTO DO SERVICO E DE R$100,00 (INCLUI PECAS E SERVICOS).',
        );
      });
    });
  }
});
