/**
 * O segmentador é o que liga a saída de texto à tela de edição. Se ele errar,
 * a líder do suporte edita uma frase achando que é outra — ou pior, a tela
 * mostra um texto e o atendente copia outro. Por isso o teste central é a
 * invariante de preservação, rodada contra as fixtures reais do modelo.
 */
import { describe, expect, it } from 'vitest';
import { iniciarTrace, pararTrace } from './store';
import { chavesDe, conferePreserva, segmentar } from './segmentar';
import { renderManutSinalAlto } from '../render/manutSinalAlto';
import fixtures from '../render/__fixtures__/manutSinalAlto.fixtures.json';

type Fixture = { nome: string; input: Record<string, string> };
const CASOS = fixtures as unknown as Fixture[];

describe('segmentar', () => {
  it('preserva o texto: juntar os segmentos devolve a saída original', () => {
    for (const fx of CASOS) {
      iniciarTrace();
      const saida = renderManutSinalAlto(fx.input);
      const trace = pararTrace();

      for (const aba of ['protocolo', 'os', 'agenda'] as const) {
        const texto = saida[aba] ?? '';
        const segs = segmentar(texto, trace);
        expect(conferePreserva(texto, segs), `${fx.nome} / ${aba}`).toBe(true);
      }
    }
  });

  it('reconhece as frases do protocolo no caso titular', () => {
    const caso = CASOS.find((c) => c.input.tipoSolicitacao?.startsWith('titular-solicita-titular'));
    expect(caso, 'fixture do ramo titular').toBeDefined();

    iniciarTrace();
    const saida = renderManutSinalAlto(caso!.input);
    const trace = pararTrace();

    const chaves = chavesDe(segmentar(saida.protocolo, trace));
    expect(chaves).toContain('aberturaTitular');
    expect(chaves).toContain('relato');
    expect(chaves).toContain('termosVisita');
    expect(chaves).toContain('encerramento');
    // O corpo da O.S não pertence à aba Protocolo.
    expect(chaves).not.toContain('osTitular');
  });

  it('trata os separadores como trecho fixo, não editável', () => {
    iniciarTrace();
    const saida = renderManutSinalAlto(CASOS[0].input);
    const trace = pararTrace();

    const fixos = segmentar(saida.protocolo, trace).filter((s) => s.tipo === 'fixo');
    expect(fixos.some((s) => s.texto.includes('*'.repeat(19)))).toBe(true);
  });

  it('ignora frase que não está na aba segmentada', () => {
    const segs = segmentar('so isto', [{ chave: 'x', texto: 'nao existe aqui' }]);
    expect(segs).toEqual([{ tipo: 'fixo', texto: 'so isto' }]);
  });

  it('ignora frase vazia — indexOf("") casaria em qualquer posição', () => {
    const segs = segmentar('abc', [{ chave: 'vazia', texto: '' }]);
    expect(segs).toEqual([{ tipo: 'fixo', texto: 'abc' }]);
  });

  it('acerta duas frases de texto idêntico usando a ordem do trace', () => {
    const trace = [
      { chave: 'primeira', texto: 'IGUAL' },
      { chave: 'segunda', texto: 'IGUAL' },
    ];
    const segs = segmentar('IGUAL // IGUAL', trace);
    expect(segs).toEqual([
      { tipo: 'frase', texto: 'IGUAL', chave: 'primeira' },
      { tipo: 'fixo', texto: ' // ' },
      { tipo: 'frase', texto: 'IGUAL', chave: 'segunda' },
    ]);
  });

  it('não deixa trace ligado depois de parar', () => {
    iniciarTrace();
    renderManutSinalAlto(CASOS[0].input);
    expect(pararTrace().length).toBeGreaterThan(0);
    // Segundo render sem iniciar: nada é coletado.
    renderManutSinalAlto(CASOS[0].input);
    expect(pararTrace()).toEqual([]);
  });
});
