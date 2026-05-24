'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import type {
  BasicInfoPF,
  BasicInfoPJ,
  CriarFichaResult,
  PessoaTipo,
} from '@/features/cadastro/types';
import { criarFichaPF, criarFichaPJ } from '@/services/cadastro';
import { useAuth } from '@/components/providers/AuthProvider';
import { fireSideCannonConfetti } from '@/components/effects/welcome-confetti';
import { formatCpf } from '@/lib/masks';

export function BasicInfoModal({
  open,
  tipo,
  onBack,
  onClose,
  onCreated,
}: {
  open: boolean;
  tipo: PessoaTipo | null;
  onBack: () => void;
  onClose: () => void;
  onCreated?: (result: CriarFichaResult) => void;
}) {
  const { user } = useAuth();

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [pf, setPF] = useState<BasicInfoPF>({ nome: '', cpf: '' });
  const [pj, setPJ] = useState<BasicInfoPJ>({ razaoSocial: '' });

  const isPF = tipo === 'PF';
  const headerTitle = isPF ? 'Dados Pessoais Básicos' : 'Dados Básicos - Ficha PJ';
  const headerSubtitle = isPF
    ? 'Preencha as informações fundamentais do cliente'
    : 'Preencha as informações fundamentais da empresa';

  const canContinue = useMemo(() => {
    if (!open || !tipo) return false;
    if (tipo === 'PF') return Boolean(pf.nome && pf.cpf);
    return Boolean(pj.razaoSocial);
  }, [open, tipo, pf, pj]);

  // Reset fields whenever the modal opens or switches type.
  useEffect(() => {
    if (open) {
      setPF({ nome: '', cpf: '' });
      setPJ({ razaoSocial: '', fantasia: '' });
      setError(null);
      setOk(null);
    }
  }, [open, tipo]);

  if (!open || !tipo) return null;

  async function onSubmit() {
    if (!user) {
      setError('Sessão expirada. Faça login novamente.');
      return;
    }
    setError(null);
    setOk(null);
    if (!canContinue) return;
    setLoading(true);
    try {
      const res = isPF
        ? await criarFichaPF(pf, user.id)
        : await criarFichaPJ(pj, user.id);
      setOk('Ficha criada com sucesso.');
      // Notify the board so it can refetch / patch the list.
      try {
        window.dispatchEvent(
          new CustomEvent('mz-card-created', {
            detail: {
              applicantId: res.applicantId,
              cardId: res.cardId,
              personType: tipo,
            },
          }),
        );
      } catch {
        /* event dispatch is best-effort */
      }
      try {
        const path = `/ficha/${isPF ? 'pf' : 'pj'}/${res.applicantId}?welcome=1`;
        window.open(path, '_blank', 'noopener,noreferrer');
        window.focus();
      } catch {
        /* opening the expanded view is best-effort */
      }
      try {
        fireSideCannonConfetti();
      } catch {
        /* confetti is best-effort */
      }
      onCreated?.(res);
      // Brief delay so the user sees the success state before close.
      setTimeout(() => onClose(), 600);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar ficha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm"
        style={{ left: leftOffset }}
      />
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center"
        style={{ left: leftOffset }}
      >
        <div
          className="relative w-[92vw] max-w-[760px] overflow-hidden rounded-2xl bg-neutral-50 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-t-2xl bg-emerald-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/mznet-logo.png"
                  alt="Mznet"
                  width={36}
                  height={36}
                  priority
                  style={{ width: 36, height: 36, objectFit: 'contain' }}
                />
                <div className="flex flex-col">
                  <h2 className="text-base font-semibold sm:text-lg">
                    {headerTitle}
                  </h2>
                  <p className="text-xs text-emerald-50/90 sm:text-sm">
                    {headerSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-emerald-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {isPF ? (
              <div className="space-y-5">
                <Section title="Informações Pessoais" dotColor="bg-blue-500">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Nome do Cliente"
                      placeholder="Nome completo do Lead"
                      value={pf.nome}
                      onChange={(v) => setPF({ ...pf, nome: v })}
                      className="sm:col-span-2"
                    />
                    <Field
                      label="CPF"
                      placeholder="000.000.000-00"
                      value={pf.cpf}
                      onChange={(v) => setPF({ ...pf, cpf: formatCpf(v) })}
                      inputMode="numeric"
                      className="sm:col-span-2"
                    />
                  </div>
                </Section>
              </div>
            ) : (
              <div className="space-y-5">
                <Section title="Dados da empresa" dotColor="bg-blue-500">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Razão Social"
                      placeholder="Ex: Empresa LTDA"
                      value={pj.razaoSocial}
                      onChange={(v) => setPJ({ ...pj, razaoSocial: v })}
                    />
                    <Field
                      label="Nome Fantasia"
                      placeholder="Ex: Mznet"
                      value={pj.fantasia || ''}
                      onChange={(v) => setPJ({ ...pj, fantasia: v })}
                    />
                  </div>
                </Section>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {ok && (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {ok}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={onBack}
                className="rounded-[12px] bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Voltar
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onSubmit}
                  disabled={!canContinue || loading}
                  className="rounded-[12px] bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loading ? 'Salvando…' : 'Continuar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  className,
  inputMode,
  maxLength,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete="off"
        className="h-10 w-full rounded-[12px] border border-gray-300 bg-white px-3 text-sm text-emerald-700 outline-none placeholder:text-emerald-600 placeholder:opacity-60 focus:border-emerald-500"
      />
    </div>
  );
}

function Section({
  title,
  dotColor,
  children,
}: {
  title: string;
  dotColor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <span>{title}</span>
      </div>
      <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
        {children}
      </div>
    </div>
  );
}
