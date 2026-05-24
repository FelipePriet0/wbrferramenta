'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

type Role = 'vendedor' | 'analista' | 'gestor' | 'leitor';

const ROLES: { key: Role; label: string; color: string; bg: string }[] = [
  { key: 'vendedor',  label: 'Vendedor',  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200'   },
  { key: 'analista',  label: 'Analista',  color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  { key: 'gestor',    label: 'Gestor',    color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200'},
  { key: 'leitor',    label: 'Leitor',    color: 'text-zinc-600',   bg: 'bg-zinc-50 border-zinc-200'   },
];

type Permission = {
  label: string;
  vendedor: boolean;
  analista: boolean;
  gestor: boolean;
  leitor: boolean;
};

const PERMISSIONS: Permission[] = [
  { label: 'Ver Kanban Comercial',          vendedor: true,  analista: true,  gestor: true,  leitor: true  },
  { label: 'Ver Kanban Análise',            vendedor: false, analista: true,  gestor: true,  leitor: true  },
  { label: 'Criar nova ficha',              vendedor: true,  analista: true,  gestor: true,  leitor: false },
  { label: 'Editar campos da ficha',        vendedor: true,  analista: true,  gestor: true,  leitor: false },
  { label: 'Mover card entre etapas',       vendedor: true,  analista: true,  gestor: true,  leitor: false },
  { label: 'Transferir para analista',      vendedor: true,  analista: false, gestor: true,  leitor: false },
  { label: 'Transferir para vendedor',      vendedor: false, analista: true,  gestor: true,  leitor: false },
  { label: 'Aplicar etiqueta Urgente',      vendedor: false, analista: true,  gestor: true,  leitor: false },
  { label: 'Cancelar card',                 vendedor: false, analista: true,  gestor: true,  leitor: false },
  { label: 'Escrever parecer / decisão',    vendedor: false, analista: true,  gestor: true,  leitor: false },
  { label: 'Ver pareceres',                 vendedor: true,  analista: true,  gestor: true,  leitor: true  },
  { label: 'Ver Histórico',                 vendedor: true,  analista: true,  gestor: true,  leitor: true  },
  { label: 'Restaurar ficha do Histórico',  vendedor: false, analista: true,  gestor: true,  leitor: false },
];

export function DemoRoles() {
  const [active, setActive] = useState<Role>('vendedor');
  const role = ROLES.find((r) => r.key === active)!;
  const perms = PERMISSIONS.filter((p) => p[active]);
  const denied = PERMISSIONS.filter((p) => !p[active]);

  return (
    <div className="not-prose rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Tabs de perfil */}
      <div className="flex border-b border-zinc-100 bg-zinc-50">
        {ROLES.map((r) => (
          <button
            key={r.key}
            onClick={() => setActive(r.key)}
            className={`flex-1 px-3 py-2.5 text-[12px] font-semibold transition-colors ${
              active === r.key
                ? `bg-white ${r.color} border-b-2 border-current`
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Conteúdo do perfil selecionado */}
      <div className="p-4">
        <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold ${role.bg} ${role.color}`}>
          {role.label}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {/* Pode */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pode fazer</p>
            <ul className="space-y-1">
              {perms.map((p) => (
                <li key={p.label} className="flex items-start gap-2 text-[12px] text-zinc-700">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {p.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Não pode */}
          {denied.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Não pode fazer</p>
              <ul className="space-y-1">
                {denied.map((p) => (
                  <li key={p.label} className="flex items-start gap-2 text-[12px] text-zinc-400">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-300" />
                    {p.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
