'use client';

/**
 * A saída no modo de edição: os mesmos bytes que o atendente copiaria, só que
 * cortados em pedaços clicáveis.
 *
 * O que NÃO foi extraído para catálogo aparece cinza, travado e sem clique:
 * separadores, indentação, e também os trechos de texto que ainda não passaram
 * pela extração. Isso é deliberado e é o que torna a extração PARCIAL viável —
 * um modelo não precisa ser convertido inteiro para já ser útil. O que dá para
 * editar, edita; o resto fica visível, legível e explicitamente bloqueado, em
 * vez de oferecer um clique que não faz nada.
 */
import { Pencil } from 'lucide-react';
import type { Catalogo } from '../catalogo/tipos';
import type { Segmento } from '../catalogo/segmentar';
import { textoVigente } from '../catalogo/store';
import type { FraseHistorico, MetaFrase } from '@/services/osFrases';
import { EditorFrase } from './EditorFrase';

const LARANJA = '#FF6600';

export function SaidaEditavel({
  modeloSlug,
  segmentos,
  catalogo,
  metas,
  ramos,
  tambemEm,
  vars,
  chaveAberta,
  onAbrir,
  onFechar,
  onPublicar,
  onRestaurar,
  onHistorico,
}: {
  modeloSlug: string;
  segmentos: readonly Segmento[];
  catalogo: Catalogo;
  metas: Record<string, MetaFrase>;
  ramos: Record<string, number>;
  tambemEm: Record<string, number>;
  vars: Record<string, string>;
  chaveAberta: string | null;
  onAbrir: (chave: string) => void;
  onFechar: () => void;
  onPublicar: (chave: string, texto: string) => Promise<void>;
  onRestaurar: (chave: string) => Promise<void>;
  onHistorico: (chave: string) => Promise<FraseHistorico[]>;
}) {
  return (
    <div className="max-h-[62vh] overflow-auto px-3 py-2.5">
      {segmentos.map((seg, i) => {
        if (seg.tipo === 'fixo') {
          // Cinza + cursor bloqueado + title: o estado precisa se explicar
          // sozinho, senão parece bug ("por que essa parte não abre?").
          const soEspacos = seg.texto.trim() === '';
          return (
            <div
              key={i}
              title={soEspacos ? undefined : 'Trecho travado — não editável pela plataforma'}
              className="select-none whitespace-pre-wrap px-2 font-mono text-[13px] leading-relaxed text-zinc-400"
              style={soEspacos ? undefined : { cursor: 'not-allowed' }}
            >
              {seg.texto}
            </div>
          );
        }

        const chave = seg.chave!;
        const def = catalogo[chave];
        if (!def) return null;

        if (chaveAberta === chave) {
          return (
            <EditorFrase
              key={i}
              def={def}
              textoAtual={textoVigente(modeloSlug, chave, catalogo)}
              meta={metas[chave]}
              tambemEm={tambemEm[chave] ?? 0}
              ramos={ramos[chave] ?? 1}
              vars={vars}
              onPublicar={(texto) => onPublicar(chave, texto)}
              onRestaurar={() => onRestaurar(chave)}
              onHistorico={() => onHistorico(chave)}
              onFechar={onFechar}
            />
          );
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => onAbrir(chave)}
            title={def.rotulo}
            className="group relative block w-full rounded-lg border-l-[3px] border-transparent py-1.5 pl-3 pr-8 text-left font-mono text-[13px] leading-relaxed text-zinc-800 transition-colors hover:border-l-[color:var(--laranja)] hover:bg-[color:var(--laranja-fraco)] dark:text-zinc-200"
            style={
              {
                '--laranja': LARANJA,
                '--laranja-fraco': `${LARANJA}12`,
              } as React.CSSProperties
            }
          >
            {metas[chave] && (
              <span
                className="mr-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full align-middle"
                style={{ backgroundColor: LARANJA }}
                title="modificada"
              />
            )}
            <span className="whitespace-pre-wrap">{seg.texto}</span>
            <Pencil
              className="absolute right-2.5 top-2 h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: LARANJA }}
            />
          </button>
        );
      })}
    </div>
  );
}
