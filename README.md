# Toolmznet

CRM/gestão para provedor de internet Mznet. Cadastro PF/PJ + Kanban
comercial/análise + parecer + etiquetas + transferência + histórico.

## Stack

- Next.js 15 (App Router, Turbopack)
- TypeScript estrito
- Supabase (Postgres + Auth + Storage + Realtime)
- Tailwind v4
- TanStack Query, dnd-kit, lucide-react
- Hosting: Vercel
- Banco prod: zwmlhwwgbjmopuhxxooo (organização: jarvis)

## Como rodar

```bash
pnpm install
cp .env.local.example .env.local  # preencher com credenciais
pnpm dev   # localhost:3000
```

## Decision matrix — "Quero fazer X, vou em Y"

| Quero | Vá em |
|---|---|
| Mexer numa feature do Kanban | `src/features/kanban/` |
| Mudar query de banco | `src/services/*.ts` |
| Adicionar campo numa ficha | `docs/ARCHITECTURE.md` (esquema) + `src/features/expanded-ficha/types.ts` |
| Mudar lógica de RLS/RPC | `supabase/migrations/` + ler `AGENTS.md` primeiro |
| Adicionar modal novo | `src/features/kanban/components/Modal.tsx` (portal) |
| Entender uma feature a fundo | `docs/specs-originais/` |
| Saber o que NÃO posso quebrar | `AGENTS.md` → Invariantes |

## Links

- [`AGENTS.md`](AGENTS.md) — Manual operacional para agents code
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Spec viva (tabelas, RPCs, RLS, fluxos)
- [`docs/specs-originais/`](docs/specs-originais/) — Specs originais do projeto (contexto histórico)
- [`supabase/migrations/`](supabase/migrations/) — Histórico de mudanças no banco

## Scripts

```bash
pnpm dev                    # dev server
pnpm build                  # build de produção
pnpm exec tsc --noEmit      # type-check
pnpm lint
```

## Deploy

Vercel auto-deploya em push para `main`. Manual via `vercel` CLI.
