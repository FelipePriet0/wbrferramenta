'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PersonTypeModal } from './PersonTypeModal';
import { BasicInfoModal } from './BasicInfoModal';
import type { PessoaTipo } from '@/features/cadastro/types';

/**
 * "+ Nova ficha" CTA + the two-step modal flow:
 *   PersonTypeModal  →  BasicInfoModal  →  RPC criar_ficha_*_atomic
 *
 * After creating, dispatches the global "mz-card-created" event so the
 * kanban board (Task #7/#8) can refetch / patch its list.
 */
export function NovaFichaCTA() {
  const [openType, setOpenType] = useState(false);
  const [openBasic, setOpenBasic] = useState(false);
  const [tipo, setTipo] = useState<PessoaTipo | null>(null);

  function handleSelectType(t: PessoaTipo) {
    setTipo(t);
    setOpenType(false);
    setOpenBasic(true);
  }

  function handleBack() {
    setOpenBasic(false);
    setOpenType(true);
  }

  function handleCloseAll() {
    setOpenBasic(false);
    setOpenType(false);
    setTipo(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenType(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        <Plus className="h-4 w-4" />
        Nova ficha
      </button>

      <PersonTypeModal
        open={openType}
        onClose={handleCloseAll}
        onSelect={handleSelectType}
      />
      <BasicInfoModal
        open={openBasic}
        tipo={tipo}
        onBack={handleBack}
        onClose={handleCloseAll}
      />
    </>
  );
}
