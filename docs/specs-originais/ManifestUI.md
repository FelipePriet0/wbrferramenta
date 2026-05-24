# Reconstrução — Ponto 4: Manifest da UI (ENXUTO)

**Data:** 2026-05-11
**Substitui:** `20260508_reconstrucao_ponto4_manifest_ui.md` (kept como referência histórica).
**Pré-requisitos:**
- `20260511_reconstrucao_ponto1_spec_banco_enxuta.md` (banco)
- `20260511_reconstrucao_ponto2_spec_endpoints_enxuta.md` (endpoints)
- `Spec (Cópia).md` (features — funciona como ponto 3)
- `20260508_reconstrucao_ponto5_arquivos_reusaveis.md` (Tiers A–D)

Este manifest é o **mapa que conecta a UI levada (Tier D do ponto 5) com as specs 1/2/3 enxutas**. O Agent Code abre qualquer arquivo de UI, consulta este manifest, descobre:
1. Qual feature realiza.
2. Quais props/callbacks/effects espera.
3. Quais imports antigos precisam ser substituídos.

---

## 0. O que SAIU em relação ao escopo amplo

Features descartadas (e portanto **todos os seus arquivos de UI também**):

| Feature | Pastas/arquivos eliminados |
|---|---|
| Agenda | `features/agenda/**`, `app/(app)/agenda/**` |
| Builder | `features/builder/**` (BuilderPage + canvas), `app/(app)/builder/**` |
| Técnicos (CRUD) | `features/builder/AddTechnicianModal.tsx`, `features/builder/EditTechnicianModal.tsx`, qualquer `features/technicians/**` |
| Inbox | `features/inbox/**` (drawer, toasts, controllers) |
| Comentários em thread | `services/comments` (não criar), `CommentsThread.tsx` (não criar) |
| Tarefas dedicadas | `app/(app)/tarefas/**` (não criar), `components/app/task-filter-cta.tsx`, `services/tasks` (não criar) |
| Export PDF | `app/api/export/**`, `web/middleware.ts`, `lib/pdf/**`, `services/pdf.ts` (não criar), qualquer `PdfCard*` |
| Cadastro standalone (rotas) | `app/(app)/cadastro/pf/[id]/page.tsx`, `app/(app)/cadastro/pj/[id]/page.tsx` (a URL muda — ver §0.1) |
| Routes/Bairros picker | `services/routes` (não criar), `listRoutes()` chamadas |

### 0.1 Mudanças de rota

| Antiga | Nova | Razão |
|---|---|---|
| `/cadastro/pf/[id]` | `/ficha/pf/[id]` | Expanded não é "cadastro"; URL descreve o que a tela faz |
| `/cadastro/pj/[id]` | `/ficha/pj/[id]` | Idem |

A criação inicial (`+ Nova ficha`) **permanece como fluxo dentro do Kanban** (PersonTypeModal + BasicInfoModal → redirect pra `/ficha/...`) — não há mais rota dedicada `/cadastro`.

### 0.2 Novas features (sem equivalente no manifest antigo)

- **Modal Editar Ficha** (já existe como `EditarFichaModal.tsx` — só ganha CTA "Etiquetas" e adapta cliclo de criação).
- **Etiquetas** — popover dentro do Modal Editar Ficha + CRUD do catálogo (administração).

---

## 1. Convenções

### 1.1 Estrutura proposta no projeto novo

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   └── (app)/
│       ├── layout.tsx                    # shell autenticado
│       ├── AppLayoutClient.tsx
│       ├── HeaderNav.tsx, RouteBg.tsx
│       ├── kanban/page.tsx               # Comercial
│       ├── kanban/analise/page.tsx       # Análise
│       ├── ficha/pf/[id]/page.tsx        # Expanded PF (era /cadastro/pf)
│       ├── ficha/pj/[id]/page.tsx        # Expanded PJ
│       ├── historico/page.tsx
│       ├── perfil/page.tsx
│       └── admin/etiquetas/page.tsx      # CRUD do catálogo de etiquetas (gestor)
├── components/
│   ├── ui/                               # primitivos shadcn/Radix (Tier B do ponto 5)
│   ├── app/                              # transversais não-domínio (Tier D)
│   ├── unified-composer/                 # composer de parecer (bug P0 corrigido)
│   └── mentions/                         # mention dropdown
├── features/
│   ├── kanban/components/                # boards, colunas, cards (saíram de legacy/)
│   ├── cadastro/components/              # PersonTypeModal + BasicInfoModal
│   ├── editar-ficha/components/          # modal + composer subcomponents
│   ├── ficha/                            # expanded PF/PJ (subcomponents)
│   ├── labels/                           # NOVO — popover de etiquetas + admin
│   └── perfil/                           # ProfileCard + ProfileForm (saíram de legacy/)
├── services/                             # NOVO — toda chamada Supabase mora aqui
│   ├── supabase.ts                       # cliente + helpers
│   ├── auth.ts                           # signIn, signOut, getSession
│   ├── profiles.ts                       # listProfiles, updateProfile
│   ├── kanban.ts                         # change_stage, set_card_decision, dashboard_kanban_counts,
│   │                                     #   listCards, autoArchiveFinalizados, listMyMentionCards
│   ├── cadastro.ts                       # criar_ficha_p{f,j}_atomic + updateApplicant + updateFicha
│   ├── parecer.ts                        # add/edit/delete_parecer (single source of truth — fix bug P0)
│   ├── attachments.ts                    # uploadAttachment atômico, getSignedUrl, remove
│   ├── historico.ts                      # list_historico, get_historico_details, restore_card
│   └── labels.ts                         # NOVO — CRUD card_labels + card_label_assignments
├── hooks/
│   ├── useAuth.ts                        # context único (substitui 13 chamadas getUser dispersas)
│   ├── useRealtime.ts                    # provider único (substitui channels recriados por componente)
│   ├── useUserRole.ts                    # atalho de useAuth
│   ├── useInactivityLogout.ts            # REESCRITO do zero (não herda bug P0 do 910e361)
│   ├── useIndexedDraft.ts                # rascunhos por (cardId, autorId) em IndexedDB
│   └── useDebouncedCallback.ts           # genérico (Tier C do ponto 5)
├── lib/
│   ├── utils.ts                          # cn, getInitials, getAvatarColor (Tier C)
│   ├── datetime.ts                       # parse/format timezone (Tier C)
│   └── constants.ts                      # TABLE_*, BUCKET_*
└── utils/
    ├── richText.tsx                      # renderTextWithChips (Tier C)
    └── parserSlash.ts                    # /aprovado /negado /reanalise /anexo
```

**Pastas/arquivos que NÃO existem no novo:**
- `services/` → sem `comments.ts`, `tasks.ts`, `inbox.ts`, `agenda.ts`, `builder.ts`, `technicians.ts`, `pdf.ts`
- `features/` → sem `inbox/`, `agenda/`, `builder/`, `technicians/`, `tarefas/`
- `app/(app)/` → sem `agenda/`, `builder/`, `tarefas/`, `cadastro/`
- `app/api/` → vazia (não há nenhuma rota Next API)
- `lib/pdf/` → não existe
- `web/middleware.ts` → não existe (não há `/api/export` pra proteger)
- `lib/features.ts` → opcional (feature flags só se necessário; spec nova não cita)

### 1.2 Regra de ouro do Agent Code

- **Componentes UI nunca chamam Supabase diretamente.** Tudo passa por `services/`.
- **Componentes UI nunca chamam `auth.getUser` diretamente.** Tudo passa por `useAuth()`.
- **Componentes UI nunca abrem channels de realtime.** Tudo passa por `useRealtime()`.
- **Composer de parecer:** sempre `<UnifiedComposer key={cardId} cardId={cardId} />` + `cardId` capturado no submit em closure. Isso corrige o bug P0.

---

## 2. Inventário master — arquivos de UI a migrar

### 2.1 Pages e layouts (`app/`)

| Path | Tipo | Feature | Notas |
|---|---|---|---|
| `app/(app)/layout.tsx` | layout | Sidebar | Shell autenticado |
| `app/(app)/AppLayoutClient.tsx` | layout | Sidebar | Sidebar + provider de inactivity |
| `app/(app)/HeaderNav.tsx` | layout | Sidebar | Cabeçalho topo |
| `app/(app)/RouteBg.tsx` | layout | Sidebar | Background dinâmico por rota |
| `app/(app)/not-found.tsx` | page | — | 404 genérica |
| `app/(auth)/layout.tsx` | layout | Login | Shell anônimo |
| `app/(auth)/login/page.tsx` | page | Login | Tela de login |
| `app/(app)/kanban/page.tsx` | page | Kanban Comercial | Wrapper que renderiza `<KanbanPageClient>` |
| `app/(app)/kanban/analise/page.tsx` | page | Kanban Análise | Wrapper que renderiza `<KanbanAnalisePageClient>` |
| `app/(app)/ficha/pf/[id]/page.tsx` | page | Expanded PF | **Crítico** — bug P0 do composer; era `/cadastro/pf/[id]` |
| `app/(app)/ficha/pj/[id]/page.tsx` | page | Expanded PJ | **Crítico**; era `/cadastro/pj/[id]` |
| `app/(app)/historico/page.tsx` | page | Histórico | Lista + modal de detalhes |
| `app/(app)/perfil/page.tsx` | page | Perfil | Tela de perfil |
| `app/(app)/admin/etiquetas/page.tsx` | page | Etiquetas (admin) | **NOVO** — CRUD do catálogo (gestor) |

**❌ Removidas:** `app/(app)/agenda/page.tsx`, `app/(app)/builder/page.tsx`, `app/(app)/builder/canvas/page.tsx`, `app/(app)/cadastro/pf/[id]/page.tsx`, `app/(app)/cadastro/pj/[id]/page.tsx`.

### 2.2 Containers e subcomponentes de feature (`features/`)

| Path | Tipo | Feature | Notas |
|---|---|---|---|
| `features/kanban/KanbanPageClient.tsx` | container | Kanban Comercial | Renderiza `<KanbanBoard>` |
| `features/kanban/KanbanAnalisePageClient.tsx` | container | Kanban Análise | Renderiza `<KanbanBoardAnalise>` |
| `features/kanban/components/KanbanBoard.tsx` | container | Kanban | Drag-drop dnd-kit (vinha de `legacy/`) |
| `features/kanban/components/KanbanBoardAnalise.tsx` | container | Kanban Análise | Idem |
| `features/kanban/components/KanbanColumn.tsx` | subcomponent | Kanban | Coluna do board |
| `features/kanban/components/KanbanCard.tsx` | subcomponent | Kanban | Card do board (estados: padrão, mencionado, atrasado, etiqueta "Preenchida") |
| `features/kanban/components/Modal.tsx` | subcomponent | Kanban | Modal genérico |
| `features/kanban/components/MoveModal.tsx` | subcomponent | Kanban | Alternativa ao drag |
| `features/kanban/components/CancelModal.tsx` | subcomponent | Kanban | Coleta motivo no cancelamento |
| `features/cadastro/components/PersonTypeModal.tsx` | subcomponent | Nova ficha (Kanban) | Escolher PF ou PJ |
| `features/cadastro/components/BasicInfoModal.tsx` | subcomponent | Nova ficha (Kanban) | Form inicial PF/PJ → redirect `/ficha/...` |
| `features/cadastro/types.ts` | type | Nova ficha | Tipos compartilhados |
| `features/editar-ficha/EditarFichaModal.tsx` | container | Modal Editar Ficha | + CTA "Etiquetas" (novo) |
| `features/editar-ficha/components/Layout.tsx` | subcomponent | Modal Editar Ficha | Layout |
| `features/editar-ficha/components/Fields.tsx` | subcomponent | Modal Editar Ficha | Campos (sem `tipo_instalacao`; bairro = input livre) |
| `features/editar-ficha/components/PareceresList.tsx` | subcomponent | Composer / parecer | Lista de pareceres com composer reply |
| `features/editar-ficha/components/CmdDropdown.tsx` | subcomponent | Composer | Dropdown de slash commands (`/aprovado /negado /reanalise /anexo`) |
| `features/editar-ficha/utils/decision.tsx` | util | Composer | Helper visual de decisão (chips) |
| `features/editar-ficha/constants.ts` | const | Modal Editar Ficha | — |
| `features/labels/LabelsPopover.tsx` | subcomponent | Etiquetas | **NOVO** — popover dentro do Modal Editar Ficha |
| `features/labels/LabelsAdminPage.tsx` | container | Etiquetas (admin) | **NOVO** — CRUD do catálogo (gestor) |
| `features/perfil/components/ProfileCard.tsx` | subcomponent | Perfil | Vinha de `legacy/` |
| `features/perfil/components/ProfileForm.tsx` | subcomponent | Perfil | Vinha de `legacy/` |

**❌ Removidos (pastas inteiras):**
- `features/agenda/` (AgendaPage + grid + matching + types + mock)
- `features/builder/` (BuilderPage + AddTechnicianModal + EditTechnicianModal + canvas/*)
- `features/inbox/` (InboxDrawer + componentes + controllers)
- `features/technicians/` (se existir)
- `features/tarefas/` (não criar)

### 2.3 Componentes transversais (`components/`)

| Path | Tipo | Feature | Notas |
|---|---|---|---|
| `components/app/sidebar-logo.tsx` | subcomponent | Sidebar | Topo da sidebar |
| `components/app/sidebar-user.tsx` | subcomponent | Sidebar | Avatar + dropdown logout |
| `components/app/filter-cta.tsx` | subcomponent | Filtros do Kanban | CTA de filtros |
| `components/app/filter-portal.tsx` | subcomponent | Filtros do Kanban | Portal de filtros |
| `components/app/kanban-range-calendar.tsx` | subcomponent | Filtros do Kanban | Calendar range |
| `components/app/kanban-single-calendar.tsx` | subcomponent | Filtros do Kanban / Modal | Calendar single |
| `components/unified-composer/UnifiedComposer.tsx` | container | Composer | **Crítico — bug P0** Composer wrapper |
| `components/unified-composer/UnifiedComposer.tiptap.tsx` | container | Composer | Implementação Tiptap |
| `components/unified-composer/adapter.tsx` | adapter | Composer | Adaptador shape de pareceres |
| `components/mentions/MentionDropdown.tsx` | subcomponent | Composer | Dropdown de @menções |

**❌ Removidos:**
- `components/app/task-filter-cta.tsx` (tarefas saem)
- `components/Navbar.tsx` (zero usagens)
- `components/PointerDemo1.tsx` (demo magicui)
- `web/registry/**` (não usado em prod)

### 2.4 Primitivos (`components/ui/`) — Tier B do ponto 5

Migram em bloco do ponto 5 §Tier B. **Sem mudança.**

### 2.5 Hooks

| Path | Migrar? | Substituto / decisão |
|---|---|---|
| `hooks/useUserRole.ts` | NÃO | `useAuth().role` |
| `hooks/useIndexedDraft.ts` | SIM (rewrite) | Mesma API, schema novo |
| `hooks/useInactivityLogout.ts` | **NÃO** (bug P0) | Reescrever do zero conforme critérios em §5.Inatividade |
| `utils/useDebouncedCallback.ts` | SIM | Mesmo path |
| `utils/richText.tsx` | SIM | Mesmo path |

---

## 3. Mapa de imports antigo → novo

Tabela mecânica pro Agent Code rodar find/replace inicial.

### 3.1 Manter / Reescrever

| Import antigo | Import novo | Decisão |
|---|---|---|
| `@/lib/supabaseClient` | `@/services/supabase` | Reescrever (cliente + helpers) |
| `@/lib/profiles` (`listProfiles`, `ProfileLite`) | `@/services/profiles` | Reescrever |
| `@/lib/drafts` (`saveDraft`, `getDraft`, `deleteDraft`) | `@/services/drafts` (ou inline em `useIndexedDraft`) | Reescrever |
| `@/lib/utils` (`cn`, `getInitials`, `getAvatarColor`) | `@/lib/utils` | **Manter** (Tier C) |
| `@/lib/datetime` (helpers de timezone) | `@/lib/datetime` | **Manter** (Tier C) |
| `@/lib/constants` (`TABLE_*`, `BUCKET_*`) | `@/lib/constants` | **Manter** (revisar valores conforme schema novo) |
| `@/hooks/useUserRole` | `@/hooks/useAuth` (ou `useAuth().role`) | Substituir |
| `@/hooks/useInactivityLogout` | `@/hooks/useInactivityLogout` | **Reescrever do zero** (não herda bug P0) |
| `@/hooks/useIndexedDraft` | `@/hooks/useIndexedDraft` | Reescrever conforme schema novo |
| `@/utils/useDebouncedCallback` | `@/utils/useDebouncedCallback` | **Manter** |
| `@/utils/richText` | `@/utils/richText` | **Manter** |
| `@/features/cadastro/services` | `@/services/cadastro` | Reescrever |
| `@/features/kanban/services` (`changeStage`, etc.) | `@/services/kanban` | Reescrever |
| `@/features/editar-ficha/services` | `@/services/parecer` (consolida add/edit/delete) | **Single source of truth — fix bug P0** |
| `@/features/editar-ficha/hooks/useEditarFichaData` | hook novo + `useRealtime()` provider | Reescrever |
| `@/features/attachments/services` | `@/services/attachments` | Reescrever (sem `publicUrl` — deprecated) |
| `@/features/attachments/upload` (`uploadAttachmentBatch`) | `@/services/attachments` (`uploadAttachment` atômico) | Reescrever |
| `@/components/ui/*` | `@/components/ui/*` | **Manter** (Tier B) |
| `@/components/app/*` | `@/components/app/*` | Migrar (sem `task-filter-cta`) |
| `@/components/unified-composer/*` | `@/components/unified-composer/*` | Migrar **com fix do bug P0** |
| `@/components/mentions/*` | `@/components/mentions/*` | Migrar |
| `@/legacy/components/kanban/*` | `@/features/kanban/components/*` | **Mover de pasta** |
| `@/legacy/components/cadastro/*` | `@/features/cadastro/components/*` | **Mover de pasta** |
| `@/legacy/components/perfil/*` | `@/features/perfil/components/*` | **Mover de pasta** |

### 3.2 ❌ Remover imports (sem substituto)

Qualquer arquivo que tenha um destes imports **não migra junto** — o arquivo consumidor (se também sair) é descartado; se permanecer, o trecho é apagado.

| Import antigo | Razão |
|---|---|
| `@/features/agenda/*` | Feature Agenda removida |
| `@/features/builder/**` | Feature Builder removida |
| `@/features/inbox/*` | Feature Inbox removida (menções derivam de pareceres) |
| `@/features/technicians/*` | CRUD de técnicos removido |
| `@/features/tarefas/*` | Tarefas removidas |
| `@/lib/pdf/*` | Export PDF removido |
| `@/lib/features` (`FEATURES.*`) | Opcional; flags antigas (`AGENDA`, `BUILDER`, etc.) não existem mais |
| `@/components/app/task-filter-cta` | Tarefas removidas |
| `@/registry/magicui/*` | Não usado em prod |

### 3.3 ❌ Listas e funções a remover (apagar uso, não substituir)

| Uso antigo | Decisão |
|---|---|
| `listRoutes()` (qualquer chamada) | Bairro vira input livre — remover |
| `listPriorities()` | Era do builder — remover |
| `listTechnicians()` | Técnicos saem — remover |
| `suggest_assignment` | Modal não usa mais — remover do form do agendamento |
| `publicUrl(path)` | Bucket é privado — sempre `services.attachments.getSignedUrl(...)` |
| `services.inbox.*`, `services.comments.*`, `services.tasks.*`, `services.agenda.*`, `services.builder.*`, `services.technicians.*`, `services.pdf.*` | Nenhum desses services existe no novo |
| `useInboxController` | Inbox sai |
| `set_card_decision` chamado em 11 lugares | Consolidar em **1** chamada em `services/kanban.ts` ou `services/parecer.ts` |
| `add_parecer` chamado em 6 lugares | Consolidar em **1** chamada em `services/parecer.ts` |

---

## 4. Convenções gerais de migração

Regras que o Agent Code aplica em **todo arquivo de UI** durante a migração:

### 4.1 Substituir chamadas Supabase inline por chamadas a `services/`
```diff
- const { data } = await supabase.from('kanban_cards').update({...}).eq('id', id);
+ await services.kanban.updateCard(id, {...});
```

### 4.2 Substituir `auth.getUser()` por `useAuth()`
```diff
- const { data } = await supabase.auth.getUser();
- const uid = data?.user?.id;
+ const { user } = useAuth();
+ const uid = user?.id;
```

### 4.3 Substituir abertura de channel por `useRealtime()`
```diff
- const ch = supabase.channel(`rt-pf-card-${cardId}`).on(...).subscribe();
- return () => supabase.removeChannel(ch);
+ useRealtime('kanban_cards', { filter: `id=eq.${cardId}` }, (payload) => {...});
```

### 4.4 Composer: sempre `key={cardId}` (corrige bug P0)
```diff
- <UnifiedComposer />
+ <UnifiedComposer key={cardId} cardId={cardId} onSubmit={handleSubmit} />
```

### 4.5 Substituir `useUserRole` por `useAuth().role`
```diff
- const role = useUserRole();
+ const { role } = useAuth();
```

### 4.6 Limpar imports de `legacy/`
```diff
- import { KanbanBoard } from '@/legacy/components/kanban/components/KanbanBoard';
+ import { KanbanBoard } from '@/features/kanban/components/KanbanBoard';
```

### 4.7 Remover qualquer chamada a `publicUrl(path)` (bucket é privado)
```diff
- const url = publicUrl(path);
+ const url = await services.attachments.getSignedUrl(attachmentId);
```

### 4.8 Soft-delete sempre via service
```diff
- await supabase.from('kanban_cards').delete().eq('id', id);
+ await services.kanban.softDeleteCard(id, reason);
```

### 4.9 Remover trechos que dependem de features descartadas
Se um arquivo importa `@/features/inbox/*` ou similar (ver §3.2), apagar o bloco que usa — não tentar adaptar. Exemplos comuns:

- `KanbanPageClient.tsx` carregava `services.inbox.listMyMentionCardIds()` → substituir por `services.kanban.listMyMentionCards()` (RPC nova derivada de pareceres).
- `KanbanCard.tsx` mostrava badge de "tarefas pendentes" → remover.
- `EditarFichaModal.tsx` tinha CommentsThread → remover seção.
- `useEditarFichaData.ts` lia `card_tasks` → remover.

### 4.10 Renomear rotas do Expanded
- Move-se `app/(app)/cadastro/pf/[id]/page.tsx` → `app/(app)/ficha/pf/[id]/page.tsx`
- Move-se `app/(app)/cadastro/pj/[id]/page.tsx` → `app/(app)/ficha/pj/[id]/page.tsx`
- Todos os `router.push('/cadastro/...')` → `router.push('/ficha/...')`
- Toda chamada `window.open('/cadastro/...')` → `window.open('/ficha/...')`

---

## 5. Árvore + contrato por feature

### 5.1 Login

**Árvore:**
```
app/(auth)/login/page.tsx (page)
└── (primitivos: Input, Button, Label; hero 3D opcional)
```

**Contrato — `app/(auth)/login/page.tsx`:**
```ts
// Inputs: nenhum
// Outputs: services.auth.signIn(email, password) → redirect por role:
//   vendedor → /kanban
//   analista | gestor → /kanban/analise
//   instalador → /kanban/analise
//   leitor → /kanban
// Effects: se já logado, redirect imediato
// Imports a substituir: @/lib/supabaseClient → @/services/auth
```

---

### 5.2 Sidebar / shell

**Árvore:**
```
app/(app)/layout.tsx (server layout)
└── app/(app)/AppLayoutClient.tsx (client layout)
    ├── components/ui/sidebar.tsx (primitive)
    ├── components/app/sidebar-logo.tsx
    ├── components/app/sidebar-user.tsx
    └── app/(app)/HeaderNav.tsx
        └── app/(app)/RouteBg.tsx
```

**Contrato — `AppLayoutClient.tsx`:**
```ts
// Inputs: useAuth() → { user, profile, role }
// Outputs: services.auth.signOut() (via dropdown do sidebar-user)
// Effects:
//   - useInactivityLogout(timeoutMs, () => services.auth.signOut({local:true}) + redirect /login?from=expired)
//   - useRealtime('profiles', { id: user.id }) → reflete mudança de role em outro tab
// Items visíveis (todos os 5 roles): Kanban, Histórico, Avatar (Perfil/Sair)
// ❌ REMOVIDOS: Agenda, Builder, Técnicos, Inbox, Tarefas
// Imports a substituir:
//   @/hooks/useInactivityLogout (reescrever do zero)
//   @/lib/supabaseClient → useAuth()
//   @/features/inbox/* → APAGAR (sem substituto)
```

---

### 5.3 Nova ficha (botão "+" no Kanban)

> **Atenção:** **não há mais rota `/cadastro`.** A criação é um fluxo de modais disparado dentro do Kanban; ao final, redireciona pro Expanded em `/ficha/{tipo}/[id]`.

**Árvore:**
```
(disparado de KanbanPageClient ou KanbanAnalisePageClient)
PersonTypeModal (escolher PF ou PJ)
└── BasicInfoModal (form inicial: nome, CPF/CNPJ, telefone, etc.)
    └── services.cadastro.criarFichaPf(...) ou criarFichaPj(...)
        └── router.push(`/ficha/${tipo}/${applicantId}`)  ← rota NOVA
```

**Contrato — `features/cadastro/components/PersonTypeModal.tsx`:**
```ts
// Inputs: open: boolean, onClose: () => void
// Outputs: onSelect: (type: 'PF' | 'PJ') => void
// Sem chamadas a Supabase — 100% UI
```

**Contrato — `features/cadastro/components/BasicInfoModal.tsx`:**
```ts
// Inputs: open, personType: 'PF' | 'PJ', onClose
// Outputs:
//   onCreated: (applicantId: string, cardId: string) => void
//     → handler chama services.cadastro.criarFichaPf/Pj e redirect /ficha/{tipo}/{id}
// Validações client-side: CPF formato, CNPJ formato, idade range
// ❌ REMOVIDO: suggest_assignment automático (técnicos saem)
// Imports a substituir: @/lib/supabaseClient → @/services/cadastro
```

---

### 5.4 Kanban Comercial

**Árvore:**
```
app/(app)/kanban/page.tsx (page wrapper)
└── features/kanban/KanbanPageClient.tsx (container)
    ├── components/app/filter-cta.tsx
    │   ├── components/app/kanban-range-calendar.tsx
    │   └── components/app/kanban-single-calendar.tsx
    ├── components/app/filter-portal.tsx
    ├── features/kanban/components/KanbanBoard.tsx (drag-drop dnd-kit)
    │   ├── KanbanColumn.tsx
    │   │   └── KanbanCard.tsx
    │   ├── Modal.tsx (genérico)
    │   ├── MoveModal.tsx (alternativa ao drag)
    │   └── CancelModal.tsx (coleta motivo)
    ├── PersonTypeModal + BasicInfoModal (criar nova ficha)
    └── EditarFichaModal (abrir card em modal)
```

**Contrato — `features/kanban/KanbanPageClient.tsx`:**
```ts
// Inputs: useAuth() → { user, role }
// Estado:
//   - filtros (URL querystring): searchTerm, responsaveis, prazo (start/end), hora, myMentions
//   - cards: KanbanCard[] (consultados via services.kanban.listCards)
//   - dashboardCounts: ContagensComercial
// Outputs:
//   - services.kanban.changeStage(cardId, area, stage, reason?) ao soltar drag
//     - target='entrada' → alert; sem RPC
//     - target='canceladas' → abre <CancelModal> que coleta motivo
//   - services.kanban.softDeleteCard(cardId, reason)
//   - services.cadastro.criarFichaPf/Pj ao salvar nova ficha
//   - services.kanban.listMyMentionCards() quando myMentions ativo (intersection client-side)
// Effects:
//   - useRealtime('kanban_cards', { area: 'comercial', deleted_at: null, archived_at: null })
//     → patch local em INSERT/UPDATE/DELETE
//   - services.kanban.dashboardKanbanCounts('comercial') a cada N min
// Anti-padrões (NÃO fazer):
//   - .from('kanban_cards').update({stage}) direto pra promoção — só change_stage RPC
//   - filtrar archived_at apenas no front — sempre incluir no select
//   - chamar change_stage com p_stage='canceladas' sem p_reason — RPC rejeita
// Imports a substituir:
//   @/lib/supabaseClient → @/services/kanban
//   @/features/inbox/services → APAGAR; usar @/services/kanban.listMyMentionCards
//   @/legacy/components/kanban/* → @/features/kanban/components/*
//   @/legacy/components/cadastro/* → @/features/cadastro/components/*
```

**Contrato — `features/kanban/components/KanbanBoard.tsx`:**
```ts
// Inputs:
//   cards: KanbanCard[]
//   columns: { id: string; label: string; stages: string[] }[]
//   onDragEnd: (cardId, fromStage, toStage) => Promise<void>
//   onCardClick: (cardId) => void
//   readOnly?: boolean   // leitor: useDraggable({disabled:true}), sem botões, modais não montam
// Outputs: callbacks acima
// Sem chamadas a Supabase — recebe dados/handlers via prop
```

**Contrato — `features/kanban/components/KanbanCard.tsx`:**
```ts
// Inputs:
//   card: KanbanCard (com flags isMentioned + atrasado derivados)
//   labels: CardLabel[] (etiquetas aplicadas — vindas de card_label_assignments)
//   readOnly?: boolean
// Estados visuais (combinatórios):
//   - Padrão: border emerald-100/40, bg-white
//   - Mencionado: border emerald-300, bg-emerald-50, ícone @ verde
//   - Atrasado: border orange-300, bg-orange-50, ícone 🔥 laranja
//   - Mencionado + Atrasado: ambos
//   - Etiqueta "Preenchida": classe card--preenchida (border/bg azul) — convive com os outros
// Conteúdo: nome, CPF/CNPJ, telefone, whatsapp, bairro, hora_at[0], due_at (dd/mm/yyyy)
// Ações:
//   - Clique → onCardClick → abre <EditarFichaModal>
//   - Menu "..." (MoreVertical) → popover com "Mover…" → <MoveModal>
// Drag (dnd-kit): ativação por distância 8px; opacity:0 no original durante drag
```

---

### 5.5 Kanban Análise

**Árvore:** mesma do Comercial, com `KanbanBoardAnalise`, `KanbanAnalisePageClient`. 8 colunas em vez de 5. Difere no `extraAction` do card em "Recebidos" (botão "Ingressar"), no auto-archive de "Finalizados", e nos triggers do composer (`/aprovado` move pra "Aprovados", etc.).

**Contrato — `features/kanban/KanbanAnalisePageClient.tsx`:**
```ts
// Inputs: useAuth() → { user, role }
// Estado: cards filtrados por area='analise' + dashboardCounts('analise')
// Outputs:
//   - services.kanban.changeStage(...)
//   - services.kanban.setCardDecision(cardId, decision) ← CONSOLIDAR (era 11 lugares)
//   - services.kanban.softDeleteCard(...)
//   - services.kanban.autoArchiveFinalizados(60) ← chamado a cada 20s via setInterval
//     UPDATE kanban_cards SET archived_at=now() WHERE stage='finalizados'
//     AND archived_at IS NULL AND finalized_at < now() - interval '60 seconds'
//   - "Ingressar" (extraAction em cards de Recebidos): services.kanban.changeStage(id, 'analise', 'preenchidas')
//     RPC seta stage='preenchidas', assignee_id=auth.uid()
// Effects:
//   - useRealtime('kanban_cards', { area: 'analise' })
//   - setInterval(autoArchive, 20000) (auto-archive de Finalizados)
//   - setInterval(tick, 1000) (nowTick pra countdowns visuais)
```

---

### 5.6 Filtros do Kanban (compartilhados Comercial/Análise)

**Árvore:**
```
components/app/filter-cta.tsx (FilterCTA — wrapper do popover)
├── (popover principal com Command/cmdk)
│   └── 5 itens: Buscar, Responsável, Minhas menções, Horário, Selecionar período
├── components/ui/filters.tsx (chips estilizados — verde Mznet)
└── components/app/kanban-range-calendar.tsx (calendar lateral pro Prazo)
```

**Contrato — `FilterCTA`:**
```ts
// Inputs:
//   filters: Filter[]                  // estado controlado externamente
//   onFiltersChange: (next) => void   // emite mudanças (sem batching — cada toggle dispara)
//   myMentions: boolean
//   onMyMentionsChange: (b) => void
// Implementação:
//   - 5 itens (incl. "Minhas menções" como toggle inline)
//   - Cache em sessionStorage (key `responsavel-options-all`) pros profiles
//   - Animação <AnimateChangeInHeight> (framer-motion)
// Filtros aplicados ao banco via services.kanban.listCards(area, opts):
//   { hora, dateStart, dateEnd, responsaveis, searchTerm }
// Filtro "Minhas menções" vai por fora (pós-filtro local em KanbanPageClient).
// Anti-padrões: NÃO colorir chips por tipo (todos verde Mznet); NÃO mostrar operator (IS/IS_NOT)
```

---

### 5.7 Expanded da ficha (PF/PJ) — `/ficha/{pf,pj}/[id]`

**Árvore (PF; PJ análogo):**
```
app/(app)/ficha/pf/[id]/page.tsx (page)
├── (header com dados do applicant — editável inline)
├── (seções da pf_fichas — Fields.tsx-like, sem 'tipo_instalacao', bairro = input livre)
├── components/unified-composer/UnifiedComposer.tsx (Composer parecer)
├── features/editar-ficha/components/PareceresList.tsx
│   ├── UnifiedComposer (reply)
│   └── components/ui/file-upload.tsx (anexos por parecer via /anexo)
└── (zoom controls via React Portal em #mz-zoom-controls)
```

**Contrato — `app/(app)/ficha/pf/[id]/page.tsx`:**
```ts
// Inputs:
//   params.id: string (applicantId)
//   (sem searchParams.print — Export PDF saiu)
// Hooks:
//   useAuth() → { user, role }
//   useRealtime('applicants', { id: applicantId })            // rt-pf-app-*
//   useRealtime('pf_fichas', { applicant_id: applicantId })   // rt-pf-fichas-*
//   useRealtime('kanban_cards', { id: cardIdEff })            // rt-pf-card-*
//   useIndexedDraft(`parecer:${cardId}:${userId ?? 'self'}`, ttlMs: 3600000)
// Estado:
//   applicant, ficha, card, loading flags
//   dirtyAppFields: Set, dirtyPfFields: Set
//   pareceres (vindos de kanban_cards.reanalysis_notes filtrados !deleted)
// Outputs (autosave: debounce 1800ms + flush onBlur via custom event 'mz-field-blur'):
//   - services.cadastro.updateApplicant(applicantId, patch)
//   - services.cadastro.updatePfFicha(fichaId, patch)
//   - services.parecer.add(cardId, text, parentId?, decision?) ← single source of truth
//   - services.parecer.edit(cardId, noteId, text, decision?)
//   - services.parecer.delete(cardId, noteId)
//   - services.attachments.upload(cardId, noteId, file) atômico
//   - services.kanban.setCardDecision(cardId, decision)
// Auto-shrink de fonte:
//   <Field>: canvas measure, 13→7px em passos 0.5
//   <Textarea>: scrollHeight check, 13→6px em passos 0.5 (default), overflow-y auto se ainda transborda
// Zoom: localStorage form-zoom-pf (range 0.75–1.5x, step 0.05); React Portal em #mz-zoom-controls
// Convenções (§4): aplicar 4.1–4.10 integralmente
```

**Idem para PJ:** `app/(app)/ficha/pj/[id]/page.tsx` — diferenças no schema (`pj_fichas`), localStorage key `form-zoom-pj`, canais `rt-pj-*`.

---

### 5.8 Modal Editar Ficha

> Modal que abre sobre o Kanban ao clicar em um card. Edita só 14 campos de `applicants` + 2 de `kanban_cards` (due_at, hora_at).

**Árvore:**
```
features/editar-ficha/EditarFichaModal.tsx (container)
├── header (Logo Mznet + título + X)
├── Etiquetas (CTA canto superior esquerdo — abre features/labels/LabelsPopover.tsx) ← NOVO
├── CTA "Analisar" (canto superior direito — abre /ficha/{tipo}/[id] em nova aba)
├── features/editar-ficha/components/Layout.tsx
│   └── features/editar-ficha/components/Fields.tsx
└── features/editar-ficha/components/PareceresList.tsx (parecer)
    └── UnifiedComposer + CmdDropdown + MentionDropdown
```

**Contrato — `features/editar-ficha/EditarFichaModal.tsx`:**
```ts
// Inputs:
//   open: boolean
//   cardId: string
//   applicantId: string
//   onClose: () => void
//   onCardUpdate?: (patch: CardSnapshotPatch) => void  // permite kanban atualizar visualmente sem refetch
// Hooks:
//   useAuth()
//   useRealtime('applicants', { id: applicantId })   // rt-edit-app-*
//   useRealtime('kanban_cards', { id: cardId })      // rt-edit-card-*
//   useIndexedDraft(`parecer:${cardId}:${userId ?? 'self'}`)
// Cache local:
//   localStorage key `mz.pareceres.${cardId}` — hidrata pareceres antes do fetch (UX rápido)
// Estado:
//   data { applicant, card, pareceres }
//   dirtyAppFields, dirtyCardFields
//   optimisticNotes (criação otimista de pareceres)
//   parecerPendingFiles (anexos pendentes do composer)
// Outputs (autosave: debounce 1800ms + onBlur flush):
//   - services.cadastro.updateApplicant(applicantId, patch)
//   - services.kanban.updateCard(cardId, { due_at, hora_at })
//   - services.parecer.add/edit/delete(cardId, ...)
//   - services.attachments.upload(cardId, noteId, file)
//   - services.labels.attach(cardId, labelId) / detach(cardId, labelId)
//   - syncDecisionStatus: após /aprovado /negado /reanalise, chama set_card_decision E changeStage explicitamente
// Campos editáveis (14 de applicants + 2 de kanban_cards):
//   primary_name, cpf_cnpj, phone, whatsapp, email,
//   address_line, address_number, address_complement, cep, bairro (input livre),
//   plano_acesso, venc, sva_avulso, carne_impresso,
//   due_at (DateSingleKanbanPopover), hora_at (TimeMultiSelect)
// ❌ REMOVIDOS: tipo_instalacao, technician_id, suggest_assignment, CommentsThread
// Bloqueio scroll body enquanto open
// onCardUpdate dispara em: primary_name, cpf_cnpj, phone, whatsapp, bairro, due_at, hora_at
```

---

### 5.9 Etiquetas (popover + admin)

**Árvore — popover dentro do Modal:**
```
features/labels/LabelsPopover.tsx (NOVO)
├── components/ui/popover.tsx (primitivo)
└── lista de checkboxes (uma por etiqueta ativa do catálogo)
```

**Contrato — `LabelsPopover.tsx`:**
```ts
// Inputs:
//   cardId: string
//   open: boolean
//   onClose: () => void
// Estado:
//   catalog: CardLabel[]              // de services.labels.listCatalog({activeOnly:true})
//   appliedLabelIds: Set<string>       // de services.labels.listForCard(cardId)
// Outputs:
//   - services.labels.attach(cardId, labelId)
//   - services.labels.detach(cardId, labelId)
// Effects:
//   useRealtime('card_label_assignments', { card_id: cardId })
//   → atualiza appliedLabelIds em INSERT/DELETE
// UI: cada item = checkbox + nome + bola de cor; clique alterna
```

**Árvore — admin do catálogo (rota separada, só gestor):**
```
app/(app)/admin/etiquetas/page.tsx
└── features/labels/LabelsAdminPage.tsx (NOVO)
    ├── lista com CRUD (criar, renomear, mudar cor, desativar)
    └── modal de confirmação ao desativar (soft-delete)
```

**Contrato — `LabelsAdminPage.tsx`:**
```ts
// Inputs: useAuth() → role === 'gestor' (senão redirect 403)
// Outputs:
//   - services.labels.create({name, color})
//   - services.labels.update(id, patch)
//   - services.labels.softDelete(id)
//   - services.labels.toggleActive(id, active)
// Sem realtime (catálogo muda raramente — refetch após mutação)
```

---

### 5.10 Composer de parecer

**Árvore:**
```
components/unified-composer/UnifiedComposer.tsx (wrapper)
└── components/unified-composer/UnifiedComposer.tiptap.tsx (Tiptap real)
    ├── @tiptap/starter-kit
    ├── @tiptap/extension-mention
    ├── @tiptap/extension-placeholder
    └── components/mentions/MentionDropdown.tsx (suggestion render)
components/unified-composer/adapter.tsx (converte shape jsonb ↔ UI)
features/editar-ficha/components/CmdDropdown.tsx (UI dos slash commands)
features/editar-ficha/utils/decision.tsx (mapping decision → cor/label)
utils/parserSlash.ts (regex extractor — NOVO)
```

**Contrato — `UnifiedComposer.tsx`:**
```ts
// Props (OBRIGATÓRIAS — fix bug P0):
//   cardId: string                 // capturado em closure no submit, NUNCA do state global
//   parentId?: string              // se for reply
//   initialValue?: ComposerValue   // pra modo edição
//   placeholder?: string
//   profiles: ProfileLite[]        // pra mention dropdown
//   onSubmit: (value: ComposerValue) => Promise<void>
//                                  // service consumer: services.parecer.add(cardId, text, parentId, decision)
//                                  // com upload de attachments via services.attachments.upload(cardId, noteId, file)
//   onCancel?: () => void
//   enablePasteAttachment?: boolean (default true)
//   enableDropAttachment?: boolean (default true)
// Uso (corrige bug P0):
//   <UnifiedComposer key={cardId} cardId={cardId} ... />
// Cleanup no unmount: cancelar debounce + descartar buffer + fechar popovers
// Slash commands: regex /\/([\w]*)$/ → /aprovado /negado /reanalise /anexo (auto-aceitar Enter se match único)
// Menções: regex /@([\w\s]*)$/ → MentionDropdown; insere chip <span data-role="mention-chip" data-id="<uuid>">
// 3 caminhos de upload de anexo:
//   1. /anexo (slash) → file picker hidden
//   2. drag-and-drop sobre composer → overlay "Solte para anexar"
//   3. Ctrl+V (paste) com clipboardData.files → mesmo handler do drop
// Drafts em IndexedDB: key parecer:${cardId}:${userId ?? 'self'}, TTL 1h
```

**Contrato — `MentionDropdown.tsx`:**
```ts
// Inputs:
//   profiles: ProfileLite[]
//   query: string                 // texto após @
//   excludeIds?: string[]         // por default exclui o currentUser
//   onSelect: (profile: ProfileLite) => void
//   anchorRect: DOMRect           // posicionamento
// Agrupa por role: Gestor → Analista → Vendedor → Instalador → Outros
// Normaliza variações: gestao/gerente → gestor, analise → analista, vendas/comercial → vendedor, instalacao/tecnico → instalador
// Sem chamadas a Supabase
```

---

### 5.11 Anexos (sempre via composer)

> Não há mais anexos "soltos" no card. Toda upload acontece dentro do `<UnifiedComposer>` (via `/anexo`, drag, ou Ctrl+V) e gera anexo ligado a um `note_id`.

**Árvore:**
```
features/editar-ficha/components/PareceresList.tsx → usa file-upload + chips
components/ui/file-upload.tsx (FileUploadDropzone, AttachmentChip, PendingFileChip) [primitive]
components/ui/modal-preview.tsx [primitive]
services/attachments.ts (consolida services.ts + upload.ts atuais — atômico)
```

**Contrato — uso de `<FileUploadDropzone>`:**
```ts
// Inputs:
//   accept: ATTACHMENT_ALLOWED_TYPES (lista do ponto 2 §3.7)
//   maxSize: 10 * 1024 * 1024
//   onFiles: (files: File[]) => void
// services.attachments.upload(cardId, noteId, file) faz:
//   1. validar tamanho/mime
//   2. path = `<cardId>/<noteId>/<uuid>-<filename>`
//   3. storage.upload(path, file, {upsert:false})
//   4. INSERT card_attachments (sem comment_id — coluna não existe)
//   5. se INSERT falhar: storage.remove([path])
```

**Contrato — uso de `<ModalPreview>`:**
```ts
// Inputs: target {url, mime?, name?, extension?}, open, onClose
// Recebe URL pronta (signed, TTL 1h) — não chama Supabase
```

---

### 5.12 Histórico

**Árvore:**
```
app/(app)/historico/page.tsx
├── components/ui/date-range-popover.tsx [primitive]
├── components/app/filter-cta.tsx (mesma do Kanban)
├── components/ui/table (originui-ng table-03 striped)
└── EditarFichaModal (modo read-only com CTA "Resgatar Ficha")
    ├── (no popover de Restaurar: dropdown Kanban + dropdown Coluna)
```

**Contrato — `historico/page.tsx`:**
```ts
// Inputs: useAuth()
// Estado: list: HistoricoCard[] + selected: HistoricoDetail | null
// Outputs (read-only):
//   - services.historico.list({search?, dateStart?, dateEnd?, status?, responsavel? /* UUID */})
//   - services.historico.getDetails(cardId)
//   - services.historico.restoreCard(cardId, targetArea, targetStage)  ← RPC NOVA
// 3 ações na tabela:
//   - Olho (ícone) → abre EditarFichaModal read-only com CTA "Resgatar Ficha" (= "Analisar", abre /ficha/...)
//   - "Restaurar" → popover com 2 popovers (Kanban: Comercial/Análise; Coluna: contextual) → restoreCard
//   - "Resgatar Ficha" dentro do modal → abre /ficha/{tipo}/[id] em nova aba
// Sem realtime — refetch manual em filtros
// Colunas da tabela: Ver | Cliente | Documento | Status da análise | Vendedor | Analista | Data da Decisão | Restaurar ficha
```

---

### 5.13 Perfil

**Árvore:**
```
app/(app)/perfil/page.tsx
├── features/perfil/components/ProfileCard.tsx (mover de legacy/)
└── features/perfil/components/ProfileForm.tsx (mover de legacy/)
```

**Contrato — `app/(app)/perfil/page.tsx`:**
```ts
// Inputs: useAuth() → { user, profile }
// Outputs:
//   - services.profiles.updateMine({ full_name })
//   - services.auth.signOut() → redirect /login
// Sem realtime
```

---

### 5.14 Logout por inatividade — `hooks/useInactivityLogout.ts`

> **Reescrito do zero.** Não herda código do commit 910e361 (bug P0 de logout aleatório).

**Contrato — `useInactivityLogout(timeoutMs, onTimeout)`:**
```ts
// Args:
//   timeoutMs: number (default 30 * 60 * 1000 = 30 min)
//   onTimeout: () => void (default: services.auth.signOut({local:true}) + router.push('/login?from=expired'))
// Listeners: ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'] (passive:true)
// Reset throttled (300ms) — não resetar 1000x/s
// Single timer (não recriar em cada render) — useRef
// Cleanup completo no unmount (removeEventListener + clearTimeout)
// CRÍTICO: NÃO acoplar a onAuthStateChange — era a causa do bug (loop infinito quando sessão renovava)
```

---

### 5.15 Realtime — `hooks/useRealtime.ts`

**Contrato — `useRealtime(table, filter, callback)`:**
```ts
// Args:
//   table: 'kanban_cards' | 'applicants' | 'pf_fichas' | 'pj_fichas' | 'profiles' | 'card_attachments' | 'card_label_assignments'
//   filter: { [col]: value } — vira filter PostgREST do channel (ex: `id=eq.${cardId}`)
//   callback: (payload) => void
// Internamente: deduplica subscriptions (mesma table+filter compartilha 1 channel)
// Cleanup automático no unmount (removeChannel)
// REPLICA IDENTITY FULL no banco: kanban_cards, card_attachments, card_label_assignments
// Tabelas suportadas no novo (sem inbox, sem comments, sem tasks, sem technicians, sem builder_workflows)
```

---

### 5.16 Sistêmicos (sem componente próprio)

| Comportamento | Onde mora |
|---|---|
| Soft-delete | `services/<feature>.softDelete*()` — sempre via service, nunca DELETE direto em tabela protegida |
| RBAC | `useAuth()` expõe `role`; RLS no banco reforça |
| Auto-archive de Finalizados | `services/kanban.ts → autoArchiveFinalizados(ttlSec)` chamado a cada 20s pelo `KanbanAnalisePageClient` |
| Menção visual / filtro "Minhas menções" | `services/kanban.ts → listMyMentionCards()` (RPC nova derivada de pareceres) |
| Etiqueta visual no card | `card_label_assignments` carregado junto com cards; classe CSS aplicada |

---

## 6. Arquivos a NÃO migrar (lixo + features descartadas)

### 6.1 Features descartadas (pastas inteiras)

| Path | Por quê |
|---|---|
| `features/agenda/**` | Feature Agenda removida |
| `features/builder/**` | Feature Builder removida (inclui canvas e modais de técnicos) |
| `features/inbox/**` | Feature Inbox removida |
| `features/technicians/**` | CRUD de técnicos removido (se existir) |
| `features/tarefas/**` | Tarefas removidas (não criar) |
| `app/(app)/agenda/**` | Sem rota |
| `app/(app)/builder/**` | Sem rota |
| `app/(app)/tarefas/**` | Sem rota |
| `app/(app)/cadastro/**` | Rota renomeada pra `/ficha/...` — migra como rename, não copia |
| `app/api/**` | Nenhuma Next API no novo |
| `web/middleware.ts` | Sem `/api/export` pra proteger |
| `lib/pdf/**` | Export PDF removido |
| `components/app/task-filter-cta.tsx` | Tarefas removidas |

### 6.2 Lixo confirmado (não relacionado às features)

| Path | Por quê |
|---|---|
| `components/Navbar.tsx` | Zero usagens |
| `components/PointerDemo1.tsx` | Demo magicui |
| `features/agenda/mock.ts` | (já coberto em 6.1) |
| `web/registry/` | Magicui registry, não usado em prod |
| `web/lint-`, `web/lint-output.txt`, `web/build-output.txt` | Logs |
| `web/test-results/`, `web/playwright-report/` | Artefatos de teste |
| Arquivos na raiz: `dummy`, `github.com`, `https`, `password`, `username`, `Password for https:/`, `Username for https:/` | Placeholders criados por erro |

---

## 7. Resumo numérico

| Categoria | Antes | Agora | Δ |
|---|---|---|---|
| Pages e layouts | 16 | 14 | −2 (agenda, builder, builder/canvas removidas; +admin/etiquetas; rotas /cadastro → /ficha) |
| Containers de feature | 13 | 6 | −7 |
| Subcomponentes de feature | ~36 | ~17 | −19 |
| Componentes transversais | 12 | 10 | −2 (task-filter-cta; Navbar) |
| `legacy/` (mover de path) | 11 | 11 | 0 (mesmos arquivos, novo destino) |
| Primitivos (`components/ui/`) | 25 | 25 | 0 |
| Hooks UI-puros a migrar | 4 | 4 | 0 (useInactivityLogout reescrito) |
| **Total UI a migrar** | **~117** | **~70** | **−40%** |

---

## 8. Ordem prática de migração

1. **Tier S do ponto 5** — configs, package.json, tsconfig (5 min)
2. **Tier A do ponto 5** — `globals.css` + `public/` + mockups (1 min)
3. **Tier C do ponto 5** — `lib/utils`, `lib/datetime`, `utils/*` (1 min)
4. **Tier B do ponto 5** — `components/ui/*` primitivos (5 min)
5. **§3 deste manifest** — Agent Code roda find/replace dos imports antigos→novos (+ remove blocos que dependem de features descartadas, §3.2 e §3.3)
6. **Camada `services/` nova** — Agent Code escreve do zero, lendo specs 1+2 (~40 min — escopo enxuto)
7. **`useAuth`, `useRealtime`, `useInactivityLogout` reescrito** — hooks novos (~15 min)
8. **Tier D do ponto 5** — copiar arquivos UI (10 min)
9. **§4 + §5 deste manifest** — Agent Code aplica convenções de migração e contratos por feature, página por página (~80–120 min)
10. **Pages renomeadas** — mover `app/(app)/cadastro/{pf,pj}/[id]/page.tsx` para `app/(app)/ficha/{pf,pj}/[id]/page.tsx`; atualizar todos os `router.push` (~10 min)
11. **Migrations do banco** — Agent Code escreve as 9 migrations da spec do banco enxuta §19 (~30 min)
12. **Smoke test manual** — login → kanban → criar ficha → expanded → parecer + decisão + anexo → mover card → restaurar do histórico

**Total estimado:** ~2,5–3,5 h (era 3–4h no escopo amplo).

---

## 9. O que NÃO está neste manifest

- Schema das tabelas/RPCs/triggers/RLS → `20260511_reconstrucao_ponto1_spec_banco_enxuta.md`
- Endpoints e contratos de RPC → `20260511_reconstrucao_ponto2_spec_endpoints_enxuta.md`
- Fluxos detalhados das features (UI, regras, edge cases, slash commands, conversões UI ↔ canônico) → `Spec (Cópia).md`
- Configs/CSS/assets → `20260508_reconstrucao_ponto5_arquivos_reusaveis.md`
- **Implementação dos services/hooks novos** — Agent Code escreve a partir das specs.
