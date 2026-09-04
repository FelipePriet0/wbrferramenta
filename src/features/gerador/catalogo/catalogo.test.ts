/**
 * Guardas do catálogo de frases. Rodam sobre todos os catálogos extraídos e
 * pegam no commit os erros que só apareceriam na tela da líder do suporte —
 * ou, pior, numa O.S emitida.
 */
import { describe, expect, it } from 'vitest';
import { MANUT_SINAL_ALTO } from './manutSinalAlto';
import { obrigatoriosFaltando, placeholdersDe, protegidosFaltando } from './tipos';
import { carregarOverrides, fraseDe, limparOverrides, temOverride } from './store';
import { todosCatalogos } from './registry';

// Varre o que o registry conhece — sem lista manual para esquecer de atualizar.
describe.each(todosCatalogos())('catálogo %s', (slug, catalogo) => {
  const entradas = Object.entries(catalogo);

  it('declara obrigatórios que existem no próprio texto padrão', () => {
    // Um obrigatório ausente do padrão trava a publicação de QUALQUER edição:
    // a validação exigiria um placeholder que a frase nunca teve.
    for (const [chave, def] of entradas) {
      expect(obrigatoriosFaltando(def, def.texto), `${slug}.${chave}`).toEqual([]);
    }
  });

  it('declara trechos protegidos que existem no próprio texto padrão', () => {
    // Um protegido ausente do padrão travaria QUALQUER edição da frase: a
    // validação exigiria um trecho que a frase nunca teve.
    for (const [chave, def] of entradas) {
      expect(protegidosFaltando(def, def.texto), `${slug}.${chave}`).toEqual([]);
    }
  });

  it('não deixa espaço no começo nem no fim do texto', () => {
    // Espaço nas bordas é diagramação e mora no render. No catálogo ele seria
    // invisível para quem edita — e sumiria no primeiro save.
    for (const [chave, def] of entradas) {
      expect(def.texto, `${slug}.${chave}`).toBe(def.texto.trim());
    }
  });

  it('dá um rótulo legível a cada frase', () => {
    for (const [chave, def] of entradas) {
      expect(def.rotulo.trim().length, `${slug}.${chave}`).toBeGreaterThan(0);
      // O rótulo é o que a líder do suporte lê na tela; não pode ser a chave.
      expect(def.rotulo, `${slug}.${chave}`).not.toBe(chave);
    }
  });

  it('não repete o mesmo texto em duas chaves', () => {
    // Duas chaves com texto idêntico significam extração incompleta: ela
    // editaria uma e a outra continuaria como estava, sem explicação na tela.
    const vistos = new Map<string, string>();
    for (const [chave, def] of entradas) {
      const anterior = vistos.get(def.texto);
      expect(anterior, `${slug}.${chave} repete ${slug}.${anterior}`).toBeUndefined();
      vistos.set(def.texto, chave);
    }
  });
});

describe('resolução de frase', () => {
  const slug = 'manut-sinal-alto';
  const f = fraseDe(slug, MANUT_SINAL_ALTO);

  it('serve o padrão do código quando não há override', () => {
    expect(f('encerramento')).toBe(MANUT_SINAL_ALTO.encerramento.texto);
    expect(temOverride(slug, 'encerramento')).toBe(false);
  });

  it('serve o override quando existe', () => {
    carregarOverrides({ [`${slug}|encerramento`]: 'CLIENTE ORIENTADO E SEM DUVIDAS.' });
    expect(f('encerramento')).toBe('CLIENTE ORIENTADO E SEM DUVIDAS.');
    expect(temOverride(slug, 'encerramento')).toBe(true);
  });

  it('interpola os placeholders com os valores dados', () => {
    expect(f('aberturaTitular', { cliente: 'JOAO', canal: 'WHATSAPP', contato: '11999998888' }))
      .toBe('JOAO ENTROU EM CONTATO POR WHATSAPP (11999998888) INFORMANDO PROBLEMA DE CONEXAO.');
  });

  it('troca placeholder sem valor por vazio, como o legado fazia', () => {
    expect(f('aberturaTitular', { cliente: 'JOAO' }))
      .toBe('JOAO ENTROU EM CONTATO POR  () INFORMANDO PROBLEMA DE CONEXAO.');
  });

  it('estoura em chave inexistente — é typo de extração, não caso de runtime', () => {
    expect(() => f('naoExiste')).toThrow(/não existe no catálogo/);
  });

  it('volta ao padrão do código depois de limpar os overrides', () => {
    carregarOverrides({ [`${slug}|encerramento`]: 'OUTRA COISA.' });
    limparOverrides();
    expect(f('encerramento')).toBe(MANUT_SINAL_ALTO.encerramento.texto);
  });
});

describe('extração de placeholders', () => {
  it('lista sem repetir', () => {
    expect(placeholdersDe('{a} e {b} e {a}')).toEqual(['a', 'b']);
  });

  it('aponta só os obrigatórios que sumiram', () => {
    const def = { rotulo: 'x', texto: '{a} {b}', obrigatorios: ['a', 'b'] as const };
    expect(obrigatoriosFaltando(def, '{a} só')).toEqual(['b']);
    expect(obrigatoriosFaltando(def, '{a} {b}')).toEqual([]);
  });
});
