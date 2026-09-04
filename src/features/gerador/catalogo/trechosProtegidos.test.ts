/**
 * Guarda do acoplamento entre texto e lógica.
 *
 * Alguns modelos produzem uma segunda versão do texto reescrevendo o resultado
 * já montado com regex — no `altplan-remoto` é o modo "ofertado". Isso cria um
 * acoplamento invisível: a regex procura palavras exatas dentro de frases que
 * agora são editáveis pela plataforma.
 *
 * O teste de diff NÃO cobre esse risco. As fixtures usam o texto padrão, então
 * seguem verdes enquanto um override publicado quebra a variante em silêncio.
 * Estes testes cobrem os dois lados: que a variante realmente funciona com o
 * texto padrão, e que a publicação é recusada quando o trecho some.
 */
import { describe, expect, it } from 'vitest';
import { renderAltplanRemoto } from '../render/altplanRemoto';
import { ALTPLAN_REMOTO } from './altplanRemoto';
import { carregarOverrides, limparOverrides } from './store';
import { protegidosFaltando } from './tipos';
import fixtures from '../render/__fixtures__/altplanRemoto.fixtures.json';

type Fixture = { nome: string; input: Record<string, string> };
const CASOS = fixtures as unknown as Fixture[];

/** Um caso qualquer, forçado para o modo ofertado. */
const entradaOfertada = () => ({ ...CASOS[0].input, origem: 'ofertado' });

describe('modo ofertado do altplan-remoto', () => {
  it('reescreve a abertura com o texto padrão', () => {
    const saida = renderAltplanRemoto(entradaOfertada());
    expect(saida.protocolo).toContain('OFERTEI A');
    expect(saida.protocolo).not.toContain('SOLICITANDO ALTERAÇÃO DE PLANO.');
  });

  it('troca "PLANO SOLICITADO" por "PLANO OFERTADO"', () => {
    const saida = renderAltplanRemoto(entradaOfertada());
    expect(saida.protocolo).toContain('PLANO OFERTADO:');
    expect(saida.protocolo).not.toContain('PLANO SOLICITADO:');
  });

  it('remove a linha do motivo do cliente', () => {
    const saida = renderAltplanRemoto(entradaOfertada());
    expect(saida.protocolo).not.toContain('QUESTIONADO, CLIENTE DISSE QUE');
  });

  it('reescreve o cabeçalho da O.S', () => {
    const saida = renderAltplanRemoto(entradaOfertada());
    expect(saida.os).toContain('OFERTEI A');
    expect(saida.os).toContain('PLANO OFERTADO:');
  });

  it('PARA de funcionar se o trecho protegido for removido — o motivo da trava', () => {
    // Simula uma edição inocente: trocar "SOLICITANDO ALTERAÇÃO DE PLANO."
    // por outra redação. A O.S sai dizendo que o cliente pediu.
    try {
      carregarOverrides({
        'altplan-remoto|aberturaTitular':
          '{titular} ENTROU EM CONTATO VIA {canal} ({contato}) PEDINDO MUDANÇA DE PLANO.',
      });
      const saida = renderAltplanRemoto({ ...entradaOfertada(), tipoSolicitacao: 'titular' });
      expect(saida.protocolo).not.toContain('OFERTEI A');
      expect(saida.protocolo).toContain('PEDINDO MUDANÇA DE PLANO.');
    } finally {
      limparOverrides();
    }
  });

  it('e é exatamente essa edição que a validação recusa', () => {
    const def = ALTPLAN_REMOTO.aberturaTitular;
    const editado = '{titular} ENTROU EM CONTATO VIA {canal} ({contato}) PEDINDO MUDANÇA DE PLANO.';
    expect(protegidosFaltando(def, editado)).toEqual(['SOLICITANDO ALTERAÇÃO DE PLANO.']);
  });

  it('aceita edição que preserva o trecho protegido', () => {
    const def = ALTPLAN_REMOTO.aberturaTitular;
    const editado =
      '{titular} NOS PROCUROU VIA {canal} ({contato}) SOLICITANDO ALTERAÇÃO DE PLANO.';
    // "ENTROU EM CONTATO VIA" também é exigido — some junto, então é recusado.
    expect(protegidosFaltando(def, editado)).toEqual(['ENTROU EM CONTATO VIA']);

    const ok = '{titular} ENTROU EM CONTATO VIA {canal} SOLICITANDO ALTERAÇÃO DE PLANO.';
    expect(protegidosFaltando(def, ok)).toEqual([]);
  });
});
