/**
 * Corta a saída do render em pedaços editáveis e pedaços fixos.
 *
 * O render devolve string plana. Para a tela de edição destacar frases, é
 * preciso saber onde cada uma caiu. A alternativa seria fazer os 47 renders
 * devolverem estrutura em vez de texto — mudança grande, arriscada, e que
 * quebraria todos os testes de diff.
 *
 * Em vez disso: `iniciarTrace()` registra as frases NA ORDEM em que o render as
 * pediu; aqui a gente varre a saída procurando cada uma a partir de onde parou.
 * Como a ordem do trace é a ordem da montagem, a varredura sequencial acerta
 * mesmo quando duas frases têm texto idêntico.
 *
 * O que sobra entre uma frase e outra — separadores, indentação, quebras — sai
 * como segmento fixo e a UI mostra inerte. É honesto: aquilo não é editável.
 */
import type { FraseResolvida } from './store';

export interface Segmento {
  tipo: 'frase' | 'fixo';
  texto: string;
  /** Só em `tipo: 'frase'` — a chave no catálogo do modelo. */
  chave?: string;
}

/**
 * Uma frase do trace pode não aparecer na saída em questão: o trace cobre o
 * render inteiro (Protocolo + O.S + Agenda) e a gente segmenta uma aba por vez.
 * A frase que não estiver nesta aba é simplesmente pulada.
 *
 * Frases de texto vazio também são puladas — `indexOf('')` casa em qualquer
 * posição e sujaria a segmentação inteira.
 */
export function segmentar(saida: string, trace: readonly FraseResolvida[]): Segmento[] {
  const segmentos: Segmento[] = [];
  let cursor = 0;

  for (const { chave, texto } of trace) {
    if (!texto) continue;

    const inicio = saida.indexOf(texto, cursor);
    if (inicio === -1) continue;

    if (inicio > cursor) {
      segmentos.push({ tipo: 'fixo', texto: saida.slice(cursor, inicio) });
    }
    segmentos.push({ tipo: 'frase', texto, chave });
    cursor = inicio + texto.length;
  }

  if (cursor < saida.length) {
    segmentos.push({ tipo: 'fixo', texto: saida.slice(cursor) });
  }

  return segmentos;
}

/**
 * Invariante que a UI depende: concatenar os segmentos reproduz a saída exata.
 * Se isto quebrar, a tela estaria mostrando um texto diferente do que o
 * atendente copia — o pior erro possível nesta feature.
 */
export function conferePreserva(saida: string, segmentos: readonly Segmento[]): boolean {
  return segmentos.map((s) => s.texto).join('') === saida;
}

/** Chaves distintas presentes nos segmentos, na ordem de aparição. */
export function chavesDe(segmentos: readonly Segmento[]): string[] {
  const vistas: string[] = [];
  for (const s of segmentos) {
    if (s.tipo === 'frase' && s.chave && !vistas.includes(s.chave)) vistas.push(s.chave);
  }
  return vistas;
}
