# AGENTS.md — Manual para Agents Code

Leia este arquivo antes de tocar em qualquer código. Ele define o workflow obrigatório, convenções e invariantes do projeto.

## Tools disponíveis (MCP)

| Tool | O que faz | Quando usar |
|---|---|---|
| `supabase-mznet-novo` | apply_migration, execute_sql, list_tables, get_logs, etc. | Mexer no banco de produção |
| `Bash` | rodar pnpm, git, ls, grep | Tudo de FS e Git |
| `Read/Edit/Write` | manipular arquivos | Mudanças de código |
| `TaskCreate/Update` | rastrear progresso | Sessões com 3+ etapas |
| `WebFetch` | docs externas | Quando precisar de info de fora |

## Workflow OBRIGATÓRIO de mudança

1. Criar branch git: `git checkout -b feat/<nome>` ou `fix/<nome>`
2. Se mexe no banco:
   - Apresentar playbook: snapshot pré, migration UP, migration DOWN (rollback granular)
   - Aplicar via `apply_migration` (ou `execute_sql` se ad-hoc)
   - Espelhar SQL em `supabase/migrations/<timestamp>_<nome>.sql`
3. Se mexe no FE:
   - Edit + `pnpm exec tsc --noEmit`
4. Commit na branch com mensagem descritiva (formato Conventional Commits)
5. **ESPERAR aprovação do usuário no smoke test**
6. Só depois: `merge --no-ff` em main
7. Só depois: `git push origin main`

**NUNCA commitar direto em main sem branch.**
**NUNCA mergear sem aprovação visual do usuário no smoke test.**

## Padrão de commit

```
<tipo>(<escopo>): <título curto>

<corpo opcional explicando POR QUÊ>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Tipos: `feat`, `fix`, `style`, `refactor`, `chore`, `docs`, `perf`, `test`.

## Convenções de código (não-negociáveis)

- **UI nunca chama supabase direto** — sempre via `src/services/*.ts` ou hook
- **Modais** usam o componente `@/features/kanban/components/Modal` (portal para body)
- **`useAuth()`** é a única fonte de `user/role`
- **Realtime** via `useTableChanges` (RealtimeProvider)
- **TS estrito**, sem `any` sem justificativa
- **Sem comentários narrando o "o quê"** — só invariantes não-óbvias
- **Imports absolutos** via `@/`

## Invariantes não-negociáveis (NUNCA quebrar)

| Invariante | Por quê |
|---|---|
| `applicants.created_by` é IMUTÁVEL | Audit trail. Não usar para "quem é o vendedor hoje" |
| `kanban_cards.vendor_id` é mutável | Quem responde HOJE; transfere-se |
| `kanban_cards.assignee_id` é mutável | Quem analisa; transfere-se |
| `assignee_id` é zerado ao voltar para Recebidos | Regra de negócio (Bug 11C); triggered pela RPC `change_stage` |
| Etiqueta "Preenchida" cai ao SAIR de Preenchidas | Trigger no banco (Bug 14) |
| Etiqueta "Urgente" persiste sempre, exceto se removida manualmente | Trigger no banco |
| Motivo da Urgente é zerado ao remover a etiqueta | Trigger AFTER DELETE em `card_label_assignments` |
| RLS habilitada em TODAS as tabelas `public.*` | Defesa em profundidade |
| RPCs `SECURITY DEFINER` têm `IF NOT user_has_role THEN RAISE` | Verificar sempre |
| Migrations são append-only | NUNCA reescrever migration antiga, criar uma nova que ALTER |

## Anti-patterns (já mordemos antes — não repetir)

| Bug histórico | Como evitar |
|---|---|
| Parecer vazando entre fichas (P0) | `UnifiedComposer` com `key={cardId}` + `cardId` capturado em closure |
| Logout aleatório (P0) | `useInactivityLogout` usa throttle 1s, sem listeners duplicados |
| Decidir card errado (P0) | Service único `services.kanban.setCardDecision` |
| Flicker no alt+tab | `useEffect` deps usar `user?.id` (não `user` inteiro) |
| Modal abre dentro do card transformado | Modal usa `createPortal(<>, document.body)` |
| Backdrop fecha modal MAS dispara onClick do pai | `onBackdropClick` faz `stopPropagation` antes do `onClose` |
| Cache stale do TanStack após mudança no banco | `useFichaCache.invalidateApplicantCardByCardId` |
| Máscara double-mask infinita | Formatters em `src/lib/masks.ts` são idempotentes |
| Filtro Horário não funciona (PostgREST escape) | Filtrar client-side em `services/kanban.ts` |
| Migration falha por deadlock com sessões ativas | Dividir em chunks pequenos |

## Comandos exatos para cenários comuns

```bash
# Criar feature
git checkout -b feat/nome-da-feature
# ... edita arquivos ...
pnpm exec tsc --noEmit  # SEMPRE antes de commit
git add <arquivos-específicos>  # nunca git add -A
git commit -m "feat(escopo): título"

# Merge depois de smoke aprovado
git checkout main
git merge --no-ff feat/nome-da-feature -m "Merge feat/nome-da-feature into main"
git push origin main
git branch -D feat/nome-da-feature
```

## Banco — quando preciso aplicar migration em produção

NUNCA aplicar sem:
1. Snapshot (SELECT do estado anterior das rows afetadas)
2. Migration UP escrita E revisada pelo user
3. Migration DOWN escrita E pronta para rodar
4. Sinais de "deu ruim" definidos
5. OK explícito do user

Migration deve ser **aditiva quando possível** (`ADD COLUMN`, `CREATE TABLE`, `CREATE OR REPLACE FUNCTION`). Operações destrutivas (`DROP`, `ALTER TYPE`) exigem branch Supabase.

Se der deadlock com sessões ativas: dividir a migration em chunks menores (cada `ALTER`/`UPDATE`/`CREATE` separado).
