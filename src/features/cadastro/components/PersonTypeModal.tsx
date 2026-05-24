'use client';

import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import type { PessoaTipo } from '@/features/cadastro/types';

export function PersonTypeModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (tipo: PessoaTipo) => void;
}) {
  // Align modal with the right edge of #kanban-page-root so the sidebar
  // doesn't get covered by the backdrop.
  const [leftOffset, setLeftOffset] = useState(0);
  useEffect(() => {
    if (!open) return;
    const updateLeft = () => {
      try {
        const el = document.getElementById('kanban-page-root');
        const left = el
          ? Math.max(0, Math.round(el.getBoundingClientRect().left))
          : 0;
        setLeftOffset(left);
      } catch {
        setLeftOffset(0);
      }
    };
    updateLeft();
    window.addEventListener('resize', updateLeft);
    return () => window.removeEventListener('resize', updateLeft);
  }, [open]);

  // Keyboard shortcuts: P → PF, J → PJ, Esc → close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'p') onSelect('PF');
      else if (k === 'j') onSelect('PJ');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, onSelect]);

  if (!open) return null;

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm"
        style={{ left: leftOffset }}
        onClick={onClose}
      />
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center"
        style={{ left: leftOffset }}
        onClick={onClose}
      >
        <div
          className="relative w-[96vw] max-w-[720px] bg-zinc-50 shadow-2xl sm:w-[95vw]"
          style={{ borderRadius: '28px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="rounded-t-[28px] bg-[var(--verde-primario)] px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <Image
                src="/mznet-logo.png"
                alt="Mznet"
                width={36}
                height={36}
                priority
                style={{ width: 36, height: 36, objectFit: 'contain' }}
              />
              <div className="leading-tight">
                <div className="text-[17px] font-semibold">
                  Qual tipo de ficha deseja criar?
                </div>
                <div className="text-[13px] opacity-90">
                  Escolha o tipo de pessoa para iniciarmos a criação
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-zinc-700">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
              <span>Selecione o Tipo de Cadastro</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Card PF */}
              <button
                className="group relative w-full rounded-2xl border border-zinc-200 bg-white p-5 text-left text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
                onClick={() => onSelect('PF')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-[18px] text-sky-700">
                      📇
                    </div>
                    <div>
                      <div className="text-[17px] font-semibold text-zinc-900">
                        Pessoa Física
                      </div>
                      <div className="mt-0.5 text-[13px] text-zinc-600">
                        Para clientes individuais
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 rounded-full p-1 text-zinc-400 group-hover:text-zinc-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-[13px]">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-sky-500" />
                    <span>Cadastro com CPF</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Dados pessoais e contato</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-violet-500" />
                    <span>Análise de crédito individual</span>
                  </div>
                </div>
                <div className="my-4 h-px bg-zinc-100" />
                <div className="flex items-center justify-between text-[12px] text-zinc-500">
                  <span>Atalho do teclado:</span>
                  <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-zinc-300 bg-white px-2 font-semibold text-zinc-700">
                    P
                  </span>
                </div>
              </button>

              {/* Card PJ */}
              <button
                className="group relative w-full rounded-2xl border border-zinc-200 bg-white p-5 text-left text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
                onClick={() => onSelect('PJ')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-[18px] text-amber-600">
                      📑
                    </div>
                    <div>
                      <div className="text-[17px] font-semibold text-zinc-900">
                        Pessoa Jurídica
                      </div>
                      <div className="mt-0.5 text-[13px] text-zinc-600">
                        Para empresas e organizações
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 rounded-full p-1 text-zinc-400 group-hover:text-zinc-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-[13px]">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
                    <span>Cadastro com CNPJ</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Dados corporativos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-violet-500" />
                    <span>Análise empresarial</span>
                  </div>
                </div>
                <div className="my-4 h-px bg-zinc-100" />
                <div className="flex items-center justify-between text-[12px] text-zinc-500">
                  <span>Atalho do teclado:</span>
                  <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-zinc-300 bg-white px-2 font-semibold text-zinc-700">
                    J
                  </span>
                </div>
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-900">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                <span>💡</span>
                <span>Dica!</span>
              </div>
              <div>
                Use os atalhos do teclado{' '}
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-emerald-300 bg-white px-2 font-semibold text-emerald-700">
                  P
                </span>{' '}
                para Pessoa Física ou{' '}
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-emerald-300 bg-white px-2 font-semibold text-emerald-700">
                  J
                </span>{' '}
                para Pessoa Jurídica e crie uma ficha rapidamente.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
