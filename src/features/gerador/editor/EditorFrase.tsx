'use client';

/**
 * Editor de UMA frase, aberto no lugar do parágrafo dentro da saída.
 *
 * A escolha de abrir aqui, e não num modal com a lista de frases, resolve um
 * problema concreto: na saída lê-se "QUESTIONADO JOAO DISSE...", mas o que se
 * edita é "QUESTIONADO {pessoa} DISSE...". Numa lista, seria preciso adivinhar
 * qual item corresponde ao parágrafo que incomodou. Clicando nele, não há o que
 * adivinhar.
 *
 * Publicar vale na hora para todo o time — por isso o botão diz "Publicar
 * alteração" e não "Salvar", e a confirmação aparece aqui dentro em vez de num
 * toast que some no canto.
 */
import { useMemo, useRef, useState } from 'react';
import { Check, History, Info, RotateCcw, X } from 'lucide-react';
import type { FraseDef } from '../catalogo/tipos';
import { obrigatoriosFaltando, placeholdersDe, protegidosFaltando } from '../catalogo/tipos';
import { interpolar } from '../catalogo/store';
import type { FraseHistorico, MetaFrase } from '@/services/osFrases';

const LARANJA = '#FF6600';

export function EditorFrase({
  def,
  textoAtual,
  meta,
  tambemEm,
  vars,
  ramos,
  onPublicar,
  onRestaurar,
  onHistorico,
  onFechar,
}: {
  def: FraseDef;
  /** Texto vigente — o override quando existe, senão o padrão do código. */
  textoAtual: string;
  /** Presente quando a frase está sobrescrita. */
  meta?: MetaFrase;
  /** Em quantos OUTROS modelos este mesmo texto aparece. 0 esconde a nota. */
  tambemEm: number;
  /** Valores do formulário — alimentam a prévia. */
  vars: Record<string, string>;
  /** Em quantos ramos do modelo esta frase é usada. */
  ramos: number;
  onPublicar: (texto: string) => Promise<void>;
  onRestaurar: () => Promise<void>;
  onHistorico: () => Promise<FraseHistorico[]>;
  onFechar: () => void;
}) {
  // Abre no texto VIGENTE, não no padrão: senão a líder do suporte reabriria a
  // frase que acabou de editar e veria a versão antiga de volta.
  const [texto, setTexto] = useState(textoAtual);
  const [salvando, setSalvando] = useState(false);
  const [publicado, setPublicado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [hist, setHist] = useState<FraseHistorico[] | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const faltando = useMemo(() => obrigatoriosFaltando(def, texto), [def, texto]);
  // Trechos que a lógica do modelo lê de volta — apagá-los desliga uma variante
  // sem qualquer aviso na O.S. Ver `trechosProtegidos` em catalogo/tipos.ts.
  const protegidos = useMemo(() => protegidosFaltando(def, texto), [def, texto]);
  const podePublicar = faltando.length === 0 && protegidos.length === 0 && !salvando;

  /** Campos oferecidos: os do texto padrão mais os que o formulário preencheu. */
  const campos = useMemo(() => {
    const doPadrao = placeholdersDe(def.texto);
    const extras = Object.keys(vars).filter((v) => !doPadrao.includes(v));
    return [...doPadrao, ...extras];
  }, [def.texto, vars]);

  const inserir = (campo: string) => {
    const el = areaRef.current;
    if (!el) return;
    const marca = `{${campo}}`;
    const antes = texto.slice(0, el.selectionStart);
    const depois = texto.slice(el.selectionEnd);
    setTexto(antes + marca + depois);
    requestAnimationFrame(() => {
      el.focus();
      const pos = antes.length + marca.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const acao = async (fn: () => Promise<void>, marcarPublicado: boolean) => {
    setSalvando(true);
    setErro(null);
    try {
      await fn();
      if (marcarPublicado) setPublicado(true);
      else onFechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível publicar.');
    } finally {
      setSalvando(false);
    }
  };

  const abrirHistorico = async () => {
    if (hist) return setHist(null);
    try {
      setHist(await onHistorico());
    } catch {
      setErro('Não foi possível carregar o histórico.');
    }
  };

  return (
    <div
      className="my-2 rounded-xl border bg-white p-3.5 dark:bg-zinc-900"
      style={{ borderColor: `${LARANJA}66`, borderLeft: `3px solid ${LARANJA}` }}
    >
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <strong className="text-[13px] font-bold">{def.rotulo}</strong>
        <span className="flex items-center gap-2 text-[11px] text-zinc-500">
          {/* Responde antes da pergunta: "se eu mudar aqui, quebra o PJ?" */}
          usada {ramos > 1 ? `nos ${ramos} tipos` : 'em 1 tipo'}
          {meta && (
            <b className="font-semibold text-zinc-600">
              · editada{meta.autor_nome ? ` por ${meta.autor_nome}` : ''} ·{' '}
              {new Date(meta.criado_em).toLocaleDateString('pt-BR')}
            </b>
          )}
          <button
            type="button"
            onClick={abrirHistorico}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-0.5 font-semibold text-zinc-600 hover:border-zinc-400"
          >
            <History className="h-3 w-3" /> histórico
          </button>
        </span>
      </div>

      <textarea
        ref={areaRef}
        spellCheck={false}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={5}
        className="w-full resize-y rounded-lg border px-3 py-2.5 font-mono text-[13px] leading-relaxed outline-none dark:bg-zinc-950"
        style={{ borderColor: faltando.length || protegidos.length ? '#dc2626' : '#d4d4d8' }}
      />

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] text-zinc-500">Campos:</span>
        {campos.map((campo) => {
          const obrigatorio = def.obrigatorios.includes(campo);
          const sumiu = faltando.includes(campo);
          return (
            <button
              key={campo}
              type="button"
              onClick={() => inserir(campo)}
              className="rounded-md border px-2 py-0.5 font-mono text-[11.5px] transition-colors"
              style={
                sumiu
                  ? { borderColor: '#dc2626', color: '#dc2626', background: '#fef2f2' }
                  : { borderColor: '#d4d4d8', color: '#52525b' }
              }
            >
              {`{${campo}}`}
              {obrigatorio && <span style={{ color: LARANJA }}>*</span>}
            </button>
          );
        })}
      </div>

      {faltando.length > 0 && (
        <p className="mt-2 text-xs font-semibold text-red-600">
          Falta {faltando.map((c) => `{${c}}`).join(', ')} — sem isso a O.S sai incompleta.
        </p>
      )}

      {protegidos.length > 0 && (
        <p className="mt-2 text-xs font-semibold text-red-600">
          Estes trechos não podem sair: {protegidos.map((t) => `"${t}"`).join(', ')} — o
          modelo usa essas palavras para montar outra versão do texto.
        </p>
      )}

      {(def.trechosProtegidos?.length ?? 0) > 0 && protegidos.length === 0 && (
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
          🔒 Trechos que precisam continuar na frase:{' '}
          {def.trechosProtegidos!.map((t) => `"${t}"`).join(', ')}
        </p>
      )}

      <p className="mb-1.5 mt-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
        Prévia com os dados do formulário
      </p>
      <div className="whitespace-pre-wrap rounded-lg bg-zinc-50 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
        {interpolar(texto, vars) || '—'}
      </div>

      {hist && (
        <div className="mt-3 border-t border-zinc-100 pt-3">
          {hist.length === 0 && (
            <p className="text-xs text-zinc-500">Esta frase nunca foi editada.</p>
          )}
          {hist.map((h) => (
            <div key={h.id} className="flex items-start justify-between gap-3 border-b border-zinc-100 py-2 last:border-0">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-600">
                  {h.autor_nome ?? 'Autor desconhecido'}
                  {h.texto === null && ' — voltou ao padrão'}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {new Date(h.criado_em).toLocaleString('pt-BR')}
                </div>
                {h.texto && (
                  <div className="mt-1 line-clamp-2 font-mono text-[11.5px] text-zinc-500">
                    {h.texto}
                  </div>
                )}
              </div>
              {h.texto && (
                <button
                  type="button"
                  onClick={() => setTexto(h.texto!)}
                  className="shrink-0 rounded-md border border-zinc-300 px-2 py-1 text-[11.5px] font-semibold text-zinc-600 hover:border-zinc-400"
                >
                  Restaurar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tambemEm > 0 && (
        <div className="mt-3 flex gap-2 rounded-lg bg-zinc-50 px-3 py-2.5 text-xs leading-relaxed text-zinc-600 dark:bg-zinc-800/60">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <span>
            Este mesmo texto existe em <b>outros {tambemEm} modelos</b>. Editar aqui não
            altera os outros.
          </span>
        </div>
      )}

      {erro && <p className="mt-2 text-xs font-semibold text-red-600">{erro}</p>}

      {publicado ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[12.5px] font-semibold text-green-700">
          <Check className="h-4 w-4" /> Publicado. Os atendentes já geram com este texto.
        </div>
      ) : (
        <div className="mt-3.5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-zinc-500 hover:text-zinc-700"
          >
            <X className="h-3.5 w-3.5" /> Cancelar
          </button>
          <button
            type="button"
            disabled={!meta || salvando}
            onClick={() => void acao(onRestaurar, false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-[13px] font-semibold text-zinc-600 enabled:hover:bg-zinc-50 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Voltar ao padrão
          </button>
          <button
            type="button"
            disabled={!podePublicar}
            onClick={() => void acao(() => onPublicar(texto), true)}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-opacity enabled:hover:opacity-90 disabled:bg-zinc-200 disabled:text-zinc-400"
            style={podePublicar ? { backgroundColor: LARANJA } : undefined}
          >
            {salvando ? 'Publicando…' : 'Publicar alteração'}
          </button>
        </div>
      )}
    </div>
  );
}
