'use client';

import { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { UserAvatar } from '@/components/ui/avatar';
import { listProfiles, type ProfileLite } from '@/services/profiles';

const ITEM_CLS =
  'group command-item mx-1 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-gray-700 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-700';

type Props = {
  value: string;
  label: string;
  area: 'comercial' | 'analise';
  onChange: (id: string, name: string) => void;
};

export function ColaboradorFilter({ value, label, area, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const roles: import('@/lib/types').UserRole[] = area === 'comercial' ? ['vendedor'] : ['analista', 'gestor'];
        const data = await listProfiles({ roles });
        setProfiles(data);
      } catch (e) {
        console.error('[ColaboradorFilter]', e);
      }
    })();
  }, [area]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition"
          style={
            value
              ? { background: 'white', borderColor: '#d4d4d8', color: '#3f3f46' }
              : { background: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'white' }
          }
        >
          {value ? (
            <UserAvatar name={label} size="xs" />
          ) : (
            <UserCircle className="h-4 w-4 text-white" />
          )}
          {value ? label : 'Todos'}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] rounded-lg border-0 bg-white p-0 shadow-lg"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Buscar colaborador…"
            className="command-input h-9 !border-0 !border-b-0"
          />
          <CommandList className="p-1">
            <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
            <CommandGroup className="p-0">
              {/* "Todos" option — only visible when someone is selected */}
              {value && (
                <CommandItem
                  value="todos"
                  onSelect={() => {
                    onChange('', '');
                    setOpen(false);
                  }}
                  className={ITEM_CLS}
                >
                  <UserCircle className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium">Todos</span>
                </CommandItem>
              )}
              {profiles.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.full_name ?? p.id}
                  onSelect={() => {
                    onChange(p.id, p.full_name ?? p.id);
                    setOpen(false);
                  }}
                  className={ITEM_CLS}
                >
                  <UserAvatar name={p.full_name ?? '—'} size="xs" />
                  <span className="text-sm font-medium">{p.full_name ?? '—'}</span>
                  <span className="ml-auto text-xs text-muted-foreground capitalize">
                    {p.role}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
