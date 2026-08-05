import { describe, expect, it } from 'vitest';
import { REGISTRO } from '../modelos/registry';
import type { ModeloForm } from '../modelos/altplanRemotoForm';
import type { Valores } from './helpers';

// Réplica EXATA do initialValores do GeradorOS (com o override de INICIAL).
const INICIAL: Valores = { tipoSolicitacao: 'titular', origem: 'padrao', semSinal: 'nao' };
function initialValores(form: ModeloForm): Valores {
  const v: Valores = {};
  const campos = form.secoes.flatMap((s) => s.campos);
  for (const c of campos) v[c.id] = '';
  const base: Valores = { ...v, ...INICIAL };
  if (form.variavelId) {
    const varCampo = campos.find((c) => c.id === form.variavelId);
    if (varCampo?.opcoes?.length) base[form.variavelId] = varCampo.opcoes[0].value;
  }
  return base;
}

describe('nenhum modelo estoura ao abrir (render + mostrarQuando)', () => {
  for (const [slug, modelo] of Object.entries(REGISTRO)) {
    it(`${slug} — render e mostrarQuando não lançam`, () => {
      const valores = initialValores(modelo.form);
      // 1) todo mostrarQuando de todo campo (é o que o GeradorOS avalia ao abrir)
      for (const secao of modelo.form.secoes) {
        for (const campo of secao.campos) {
          expect(() => campo.mostrarQuando?.(valores), `mostrarQuando de ${slug}.${campo.id}`).not.toThrow();
        }
      }
      // 2) o render
      expect(() => modelo.render(valores), `render de ${slug}`).not.toThrow();
    });
  }
});
