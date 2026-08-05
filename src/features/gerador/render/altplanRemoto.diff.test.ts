import { describe, expect, it } from 'vitest';
import { renderAltplanRemoto } from './altplanRemoto';
import fixtures from './__fixtures__/altplanRemoto.fixtures.json';

/**
 * Diff de fidelidade: a saída do porte TS (`renderAltplanRemoto`) deve bater
 * caractere-a-caractere com a do legado. As fixtures foram geradas rodando a
 * função `uVe` original (extraída do bundle) — ground truth independente do
 * porte. Cobre titular/terceiro/PJ × padrão/ofertado × com/sem sinal.
 *
 * Divergência consciente do legado: `os` agora termina com o bloco de
 * "Encerramento" (execução remota + data/hora ATUAL do momento em que o
 * texto é gerado/copiado — não um campo do formulário, ver `agoraDataHora`
 * em `helpers.ts`). Como a data/hora não é determinística, o teste separa
 * esse bloco do restante do texto (que continua batendo com o legado
 * caractere-a-caractere) e valida o formato do bloco por padrão.
 */
type Fixture = {
  nome: string;
  input: Record<string, string>;
  protocolo: string;
  os: string;
};

const ENCERRAMENTO_RE =
  /\n\nALTERAÇÃO DE PLANO EXECUTADA REMOTAMENTE COM SUCESSO\.\nASSINATURA DIGITAL \+ SELFIE EM ANEXO\.\nNÃO HOUVE INTERVENÇÃO TÉCNICA DEVIDO O ROTEADOR EM COMODATO SER COMPATÍVEL AO PLANO ACORDADO \(.*\)\.\nCLIENTE SEM DÚVIDAS\.\n\nDATA\/HORA DO ENCERRAMENTO: \d{2}\/\d{2}\/\d{4} ÀS \d{2}:\d{2}HRS$/;

describe('renderAltplanRemoto × legado (diff)', () => {
  for (const fx of fixtures as Fixture[]) {
    it(`bate no caso ${fx.nome}`, () => {
      const saida = renderAltplanRemoto(fx.input);
      expect(saida.protocolo).toBe(fx.protocolo);
      expect(saida.os).toMatch(ENCERRAMENTO_RE);
      expect(saida.os.replace(ENCERRAMENTO_RE, '')).toBe(fx.os);
    });
  }
});
