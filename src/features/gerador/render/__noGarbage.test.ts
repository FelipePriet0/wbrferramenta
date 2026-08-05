import { describe, expect, it } from 'vitest';
import { REGISTRO } from '../modelos/registry';
import type { ModeloForm } from '../modelos/altplanRemotoForm';
import type { Valores } from './helpers';

/**
 * Guarda contra "lixo de máquina" no texto emulado. Em uso real, o GeradorOS
 * semeia TODO campo do form como '' (initialValores). Este teste reproduz esse
 * estado (nenhum campo preenchido) para CADA modelo e garante que a saída nunca
 * contém `undefined`, `(undefined)`, `(true)`, `(false)` ou `NaN` — que seriam
 * valores de máquina vazando no texto oficial da O.S.
 */
function estadoInicial(form: ModeloForm): Valores {
  const v: Valores = { tipoSolicitacao: 'titular', origem: 'padrao', semSinal: 'nao' };
  const campos = form.secoes.flatMap((s) => s.campos);
  for (const c of campos) v[c.id] = '';
  if (form.variavelId) {
    const varCampo = campos.find((c) => c.id === form.variavelId);
    if (varCampo?.opcoes?.length) v[form.variavelId] = varCampo.opcoes[0].value;
  }
  return v;
}

const LIXO = /\bundefined\b|\(undefined\)|\(true\)|\(false\)|\bNaN\b|\bnull\b/;

describe('nenhum modelo emite lixo de máquina no texto (estado inicial)', () => {
  for (const [slug, modelo] of Object.entries(REGISTRO)) {
    it(`${slug} — saída sem undefined/true/false/NaN`, () => {
      const saida = modelo.render(estadoInicial(modelo.form));
      const texto = [saida.protocolo, saida.os, saida.agenda, saida.saida]
        .filter(Boolean)
        .join('\n');
      const m = texto.match(LIXO);
      expect(m ? `${slug}: "${m[0]}" em → ...${texto.slice(Math.max(0, (m.index ?? 0) - 30), (m.index ?? 0) + 15)}...` : null).toBeNull();
    });
  }
});
