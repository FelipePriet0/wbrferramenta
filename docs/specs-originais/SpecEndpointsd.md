# Reconstrução — Ponto 2: Spec dos Endpoints / APIs (ENXUTA)

**Data:** 2026-05-11
**Substitui:** `20260508_reconstrucao_ponto2_spec_endpoints.md` (kept como referência histórica).
**Pré-requisito:** `20260511_reconstrucao_ponto1_spec_banco_enxuta.md` — toda RPC/tabela citada aqui está documentada lá.

Esta spec descreve **todas as superfícies de API** que o front consome no software enxugado, organizadas por feature. O Agent Code constrói a camada `services/` direto a partir daqui + spec do banco.

**Resumo numérico:**
- **~14 RPCs** únicas chamadas pelo front (era 36)
- **~10 padrões** de `.from(table)` direto (era 15)
- **0 endpoints Next API** (era 2 — PDF saiu)
- **9 templates de canal realtime** agrupando 3 conceitos (era 11)
- **1 bucket** Storage com 4 policies (mantém)
- **8 chamadas** de `supabase.auth.*` (mantém)

---

## 0. O que SAIU em relação ao escopo amplo

❌ Inbox, Comentários, Tarefas, Builder, Técnicos, Agenda, Export PDF, Routes (bairros), Tipo de Instalação.
❌ Realtime: `card_comments`, `card_tasks`, `inbox_notifications`, `technicians`, `builder_workflows`, `deletion_log`.
❌ Next API: `/api/export/ficha` (ambas rotas) + middleware `/api/export/:path*`.

---

## 1. Superfícies de API (2)

| # | Camada | Cliente | Quando usar |
|---|---|---|---|
| A | **Supabase RPC** (`supabase.rpc('nome', args)`) | `@supabase/supabase-js` | Operações com regra de negócio (criar ficha atômica, mover stage, parecer, restaurar do histórico) |
| B | **Supabase REST/PostgREST** (`supabase.from('tabela').select/insert/update/delete`) | mesmo SDK | Leitura/escrita simples de linhas em tabelas com RLS já cobrindo o caso |

**Convenção universal:** o SDK do Supabase gerencia o `Authorization: Bearer <jwt>` automaticamente quando o cliente é construído com sessão.

**Sem edge functions. Sem Next API routes** (export de PDF foi removido).

---

## 2. Auth — endpoints transversais

| Chamada | O que faz | Onde é usado |
|---|---|---|
| `supabase.auth.signInWithPassword({ email, password })` | Login | `/login` |
| `supabase.auth.signOut()` | Logout normal | Perfil |
| `supabase.auth.signOut({ scope: 'local' })` | Logout só local | `useInactivityLogout` (reescrito do zero — sem herdar bug P0 do commit 910e361) |
| `supabase.auth.getUser()` | Lê usuário corrente | Hook `useAuth()` único |
| `supabase.auth.getSession()` | Lê sessão local (sem roundtrip) | Hook `useAuth()` |
| `supabase.auth.onAuthStateChange(cb)` | Subscribe em mudanças de sessão | Hook `useAuth()` |

Sessão em **`window.sessionStorage`** (não `localStorage`) — fechar a aba derruba o login. Decisão deliberada por ser software financeiro.

**Hook único `useAuth()`** centraliza todas as chamadas e expõe `{ user, profile, role, signIn, signOut }` pra árvore inteira. Sem `getUser()` espalhado.

---

## 3. Endpoints por feature

### 3.1 Cadastro de ficha (PF/PJ) — botão "+ Nova ficha" no Kanban

| Tipo | Endpoint | Faz | RBAC |
|---|---|---|---|
| RPC | `criar_ficha_pf_atomic(p_user_id, p_primary_name, p_cpf_cnpj, p_phone, p_whatsapp, p_email, p_birth_date, p_naturalidade, p_uf_naturalidade)` | Cria atomicamente `applicants` + `pf_fichas` + `kanban_cards` (área `comercial`, stage `entrada`). Retorna `{applicant_id, ficha_id, card_id}` | vendedor/analista/gestor/instalador |
| RPC | `criar_ficha_pj_atomic(p_user_id, p_primary_name, p_cpf_cnpj, p_phone, p_whatsapp, p_email, p_nome_fantasia)` | Idem PJ | mesmas |
| REST | `from('profiles').select('full_name, role').eq('id', uid)` | Lê metadados do autor após cadastro | qualquer autenticado |

**Tabelas tocadas (via RPC):** `applicants`, `pf_fichas` ou `pj_fichas`, `kanban_cards`. Trigger `set_representante_mz` preenche `representante_mz` no INSERT do applicant.

**❗ Bairro é input livre** — não há mais picker dinâmico (era `listRoutes`). Cadastro grava `applicants.bairro` como texto.

---

### 3.2 Kanban (Comercial + Análise) — `/kanban` e `/kanban/analise`

| Tipo | Endpoint | Faz | RBAC |
|---|---|---|---|
| RPC | `change_stage(p_card_id, p_area, p_stage, p_reason?)` | Move card. Regras especiais: promoção `comercial/concluidas → analise/recebidos`; cancelamento exige `p_reason`; finalização grava `final_decision`. Vendedor nunca move pra `entrada` | RLS + RPC restringem |
| RPC | `set_card_decision(p_card_id, p_decision)` | Aplica decisão (aprovado/negado/reanalise). Move card pra coluna correspondente | analista/gestor |
| RPC | `soft_delete_card(p_card_id, p_reason)` | Soft-delete com auditoria | analista/gestor/instalador |
| RPC | `dashboard_kanban_counts(p_area, p_now) → jsonb` | Contadores agregados do dashboard | qualquer SELECT |
| RPC | `list_my_mention_cards() → SETOF uuid` | Cards onde o user foi mencionado (deriva de `kanban_cards.reanalysis_notes`) | qualquer (filtra por `auth.uid()`) |
| REST | `from('kanban_cards').select(...)` | Lê lista/colunas com filtros por `area`, `stage`, `assignee_id`, `deleted_at IS NULL`, `archived_at IS NULL`, `hora_at`, `due_at` | todos os 5 roles |
| REST | `from('kanban_cards').update({archived_at: now()})` | **Auto-archive de finalizados** (loop client-side a cada 20s, ttlSec=60) — UPDATE direto, RLS permite | analista/gestor/instalador |
| REST | `from('applicants').select(...)` | Junta nome/cpf/bairro/telefone do cliente nos cards | todos |
| REST | `from('profiles').select('id, full_name, role')` | Lista de assignees pro filtro "Responsável" (com cache `sessionStorage` key `responsavel-options-all`) | todos |
| REST | `from('card_label_assignments').select(...)` | Lista etiquetas dos cards (pro estado visual "Preenchida" etc.) | todos |
| REST | `from('card_labels').select(...).eq('active', true)` | Catálogo de etiquetas disponíveis | todos |

**Realtime:** `channel('rt-kanban-cards')` filtrado por `area=eq.<area>` — escuta toda alteração em `kanban_cards` (e dispara refetch quando necessário).

> **Service único** `services/kanban.ts` consolida TODAS as chamadas. Sem `set_card_decision` espalhado em 11 lugares.

---

### 3.3 Filtros do Kanban — barra compartilhada Comercial/Análise

5 filtros + busca textual. Aplicados via querystring (compartilháveis).

| Filtro | Endpoint subjacente |
|---|---|
| Buscar (debounce 350ms) | REST `applicants` com `or(primary_name.ilike.%term%,cpf_cnpj.ilike.%term%)` — usa índice `gin_trgm_ops` em `f_unaccent(primary_name)` |
| Responsável (multi-select UUIDs) | REST `kanban_cards.assignee_id IN (...)` (cache de profiles em sessionStorage) |
| Horário (single-select dos 4 slots: 08:30/10:30/13:30/15:30) | REST `kanban_cards.hora_at @> '{08:30}'` (testa variantes `08:30`, `08:30:00`, `08:30:00+00`) |
| Prazo (single dia OU range) | REST `kanban_cards.due_at` entre `startOfDayUtcISO(start)` e `endOfDayUtcISO(end ?? start)` |
| **Minhas menções** (toggle) | RPC `list_my_mention_cards()` → cards retornados são intersectados client-side com o resultado do board |

**Pós-filtro local de menções:** ao contrário dos outros 4, "Minhas menções" não vai dentro da query Supabase do board — chama a RPC, monta `Set<cardId>`, filtra localmente. Necessário porque mistura 2 fontes (cards do kanban + IDs da RPC derivada de pareceres).

---

### 3.4 Modal Editar Ficha — abre sobre o Kanban ao clicar em card

| Tipo | Endpoint | Faz | RBAC |
|---|---|---|---|
| REST | `from('applicants').select(...)` (15 cols) + `from('kanban_cards').select(...)` (due_at, hora_at, created_by, assignee_id, created_at) | Carrega dados do modal | todos |
| REST | `from('applicants').update({...})` | Autosave de 14 campos editáveis (debounce 1800ms + flush onBlur) | vendedor+ |
| REST | `from('kanban_cards').update({due_at, hora_at})` | Autosave de agendamento | analista/gestor/instalador |
| REST | `from('profiles').select(...)` | Carrega lista pra `@menções` no composer | todos |
| REST | `from('card_labels').select(...).eq('active', true)` | Popover de Etiquetas (CTA canto superior esquerdo) | todos |
| REST | `from('card_label_assignments').insert({card_id, label_id, assigned_by})` | Aplica etiqueta no card (com UNIQUE no `(card_id, label_id)` evita duplicar) | vendedor+ |
| REST | `from('card_label_assignments').delete().eq('card_id', x).eq('label_id', y)` | Remove etiqueta | vendedor+ |
| RPC | `add_parecer`, `edit_parecer`, `delete_parecer`, `set_card_decision` | (composer — ver 3.6) | conforme RPC |

**❌ Removidos:** `suggest_assignment` (technician_id automático sai), `listRoutes` (bairro é input livre), `tipo_instalacao` (campo sai).

**Realtime (2 canais por modal aberto):**
- `rt-edit-app-${applicantId}` em `applicants`
- `rt-edit-card-${cardId}` em `kanban_cards`

> Modal não escuta `pf_fichas`/`pj_fichas` (não edita esses).

**Cache local em `localStorage`** (`mz.pareceres.${cardId}`) hidrata pareceres instantaneamente ao abrir; backend confirma depois.

---

### 3.5 Expanded PF/PJ — `/ficha/pf/[applicantId]` e `/ficha/pj/[applicantId]`

> Nova URL (substitui `/cadastro/{pf,pj}/[id]` do escopo amplo). Aberta em **nova aba** pelo CTA "Analisar" do Modal.

| Tipo | Endpoint | Faz | RBAC |
|---|---|---|---|
| REST | `from('applicants').select(...).eq('id', applicantId)` (25 cols) | Carrega dados do applicant | todos |
| REST | `from('pf_fichas').select(...).eq('applicant_id', x)` ou `from('pj_fichas')...` | Carrega ficha detalhada. Se não existe, INSERT + relê | todos / vendedor+ |
| REST | `from('kanban_cards').select(...).eq('applicant_id', x).is('deleted_at', null).order('updated_at desc').limit(1)` | Triangula card ativo. Se não existe, INSERT com `area='comercial', stage='feitas'` | vendedor+ |
| REST | `from('applicants').update({...})` / `from('pf_fichas').update({...})` / `from('pj_fichas').update({...})` | Autosave por campo (debounce 1800ms + flush onBlur via custom event `mz-field-blur`) | conforme tabela |
| REST | `from('kanban_cards').update({reanalysis_notes})` | (somente via RPC `add/edit/delete_parecer`; não chamar direto) | — |
| REST | `from('profiles').select(...)` | Carrega lista pra menções | todos |
| RPC | parecer + decisão (ver 3.6) | — | — |

**Realtime (3 canais por expanded aberto):**
- `rt-pf-app-${applicantId}` ou `rt-pj-app-${applicantId}` em `applicants`
- `rt-pf-fichas-${applicantId}` ou `rt-pj-fichas-${applicantId}` em `pf_fichas`/`pj_fichas`
- `rt-pf-card-${cardIdEff}` ou `rt-pj-card-${cardIdEff}` em `kanban_cards`

> Cleanup obrigatório no unmount (`supabase.removeChannel`). Cada channel checa `dirtyFields` antes de aplicar payload (não sobrescreve campo que o usuário está digitando).

---

### 3.6 Composer de parecer (transversal — Modal + Expanded + modal do Histórico)

| Tipo | Endpoint | Faz | RBAC |
|---|---|---|---|
| RPC | `add_parecer(p_card_id, p_text, p_parent_id?, p_decision?)` | Adiciona parecer root ou reply em `kanban_cards.reanalysis_notes`. Se `p_decision` setado, chama `set_card_decision` internamente | analista/gestor (via `can_user_manage_card`) |
| RPC | `edit_parecer(p_card_id, p_note_id, p_text, p_decision?)` | Edita o próprio parecer | autor (`author_id = auth.uid()`) |
| RPC | `delete_parecer(p_card_id, p_note_id)` | Soft-delete in-place (`"deleted":true`) | autor |
| RPC | `set_card_decision(p_card_id, p_decision)` | Chamada **direta** quando o composer tem chip de decisão mas o usuário só edita o texto depois | analista/gestor |
| Storage | (ver 3.7 — anexos via `/anexo`, drag-and-drop, ctrl+V) | — | — |

> 🔑 **Bug P0 do composer — convenção que o Agent Code DEVE seguir:**
> - **`<UnifiedComposer key={cardId} cardId={cardId} />`** — `key` força remount ao trocar de ficha.
> - **`cardId` capturado no closure do submit handler**, não lido do state global.
> - **Service único `services/parecer.ts`** com `addParecer(cardId, text, opts)`, `editParecer(cardId, noteId, ...)`, `deleteParecer(cardId, noteId)`. Toda chamada de RPC do parecer passa por aqui. Sem `add_parecer` espalhado em 6 lugares.
> - **Cleanup no unmount:** cancelar debounce pendente, descartar buffer (`pendingTextRef.current = null`), fechar popovers.

**Slash commands** (`/aprovado`, `/negado`, `/reanalise`, `/anexo`) e **`@menção`** são detecção/UI puramente no front (regex). Persistência: `decision` no payload e `mentions[]` dentro do nó do parecer (`reanalysis_notes`).

**Drafts em IndexedDB:** key `parecer:${cardId}:${userId ?? 'self'}`, TTL 1h, flush no `beforeunload` + ao fechar modal/expanded. Limpa após submit OK.

---

### 3.7 Anexos — sempre via composer de parecer

Anexos são exclusivamente ligados a um `note_id` (id do parecer). Não há mais anexos em comentários (comments saíram).

| Tipo | Endpoint | Faz | RBAC |
|---|---|---|---|
| Storage | `storage.from('card-attachments').upload(path, file, {upsert:false})` | Upload com path `<cardId>/<noteId>/<uuid>-<filename>` | INSERT policy: role válido + `kanban_cards.id = split_part(name,'/',1)` |
| Storage | `storage.from('card-attachments').createSignedUrl(path, 3600)` | URL assinada de 1h pra preview/download | SELECT policy |
| Storage | `storage.from('card-attachments').remove([path])` | Remove arquivo (rollback se metadata falhar) | DELETE policy: `owner = (SELECT auth.uid())` |
| REST | `from('card_attachments').insert({card_id, note_id, author_id, file_name, file_path, file_size, file_type, file_extension, applicant_id})` | Persiste metadados (sem `comment_id` — coluna removida) | vendedor+ |
| REST | `from('card_attachments').select(...).eq('card_id', x).in('note_id', [...])` | Lista anexos por parecer | todos |
| REST | `from('card_attachments').delete().eq('id', id)` | Remove metadado (Storage continua até GC) | autor OR gestor/instalador |

**Limites client-side (já aplicados no bucket também):**
- `ATTACHMENT_MAX_SIZE = 10 MB`
- `ATTACHMENT_ALLOWED_TYPES`: imagens (jpeg/png/gif/webp/heic/heif), documentos (pdf/doc/docx/xls/xlsx/txt), arquivos (zip/rar)

**3 caminhos de upload (UI):**
1. Slash command `/anexo` no composer → abre file picker hidden.
2. Drag-and-drop sobre o composer → overlay "Solte para anexar".
3. **Ctrl+V** (paste) com `clipboardData.files` → mesmo handler do drop.

**Atomicidade:** o front faz upload → metadata; se a metadata falhar, faz `storage.remove([path])` pra evitar arquivo órfão. **Encapsulado num único service** `services/attachments.ts → uploadAttachment(cardId, noteId, file)`.

**Convenção de path:** `<cardId>/<noteId>/<uuid>-<filename>` (mais granular que escopo amplo — agrupa anexos por parecer no Storage também).

---

### 3.8 Histórico — `/historico`

| Tipo | Endpoint | Faz | RBAC |
|---|---|---|---|
| RPC | `list_historico(p_search?, p_date_start?, p_date_end?, p_status?, p_responsavel?)` | View `v_historico_cards`. `p_responsavel` agora é **UUID** (alinhado com o filtro do Kanban) | qualquer |
| RPC | `get_historico_details(p_card_id) → jsonb` | Detalhes completos do card + ficha + pareceres + decisão | qualquer |
| RPC | `restore_card(p_card_id, p_area, p_stage)` | **NOVA.** Restaura ficha do histórico: zera `archived_at`, `finalized_at`, `final_decision`; aplica `area`/`stage` escolhidos no popover (Kanban Comercial/Análise + Coluna destino). Lock + auditoria | analista/gestor |
| REST | `from('profiles').select(...)` | Lista pra filtro "Responsáveis" | todos |

**3 saídas da tela:**
- "Ver detalhes" (ícone 👁 na primeira coluna) → abre Modal Editar Ficha em modo read-only, com CTA "Resgatar Ficha" no lugar de "Analisar".
- "Restaurar" → popover com 2 campos (Kanban: Comercial/Análise; Coluna: dropdown contextual). Chama `restore_card` e abre o Kanban destino em nova aba.
- "Resgatar Ficha" (dentro do Modal de detalhes) → abre Expanded em nova aba (`/ficha/{pf,pj}/[id]`).

**Sem realtime** — alterações no banco não atualizam a tela até reload manual (decisão de produto, baixo volume).

**Tabela** usa `originui-ng` table-03 (striped). Colunas: Ver | Cliente | Documento | Status da análise | Vendedor | Analista | Data da Decisão | Restaurar ficha.

---

### 3.9 Sidebar / Shell de navegação

| Tipo | Endpoint | Faz | RBAC |
|---|---|---|---|
| Auth | `auth.getUser()` + REST `from('profiles').select('role')` | Mostra itens conforme role | todos |

**Itens visíveis (todos os 5 roles):** Kanban, Histórico, Avatar do usuário (com dropdown Perfil/Sair).

**Realtime em `profiles`:** mudança de role em outro tab propaga (channel `profiles:${uid}` ou similar — agrupado no `RealtimeProvider`).

**Preferência de sidebar colapsada:** em `localStorage` (única exceção à regra de `sessionStorage`).

---

### 3.10 Perfil — `/perfil`

| Tipo | Endpoint | Faz | RBAC |
|---|---|---|---|
| Auth | `supabase.auth.getUser()` | Lê dados do usuário | autor |
| Auth | `supabase.auth.signOut()` | Logout | autor |
| REST | `from('profiles').select('full_name, role').eq('id', uid)` | Lê profile | todos |
| REST | `from('profiles').update({full_name})` | Atualiza próprio nome | `(SELECT auth.uid()) = id` |

---

### 3.11 Logout por inatividade — hook `useInactivityLogout` (reescrito)

Mantém a feature, **reescrito do zero** — não herda código do commit 910e361 (bug P0 de logout aleatório).

| Endpoint | Quando |
|---|---|
| `supabase.auth.signOut({ scope: 'local' })` | Após X minutos sem interação do usuário (mouse/teclado/touch). Default: 30 min |
| `auth.onAuthStateChange` | Re-arma o timer quando sessão renova |

**Critérios da reescrita** (pra evitar o bug):
- **Timer único** por sessão (não recriar em cada render).
- **Não resetar timer dentro do callback `onAuthStateChange`** — era a causa do bug (loop).
- Eventos escutados: `mousemove`, `keydown`, `touchstart`, `click` (com `passive: true`).
- Throttle de 30s no handler de reset (não resetar 1000×/s).
- Cleanup obrigatório no unmount.

---

### 3.12 Etiquetas — popover dentro do Modal Editar Ficha

| Tipo | Endpoint | Faz | RBAC |
|---|---|---|---|
| REST | `from('card_labels').select('id, name, color').eq('active', true)` | Lista catálogo no popover | todos |
| REST | `from('card_label_assignments').select('label_id').eq('card_id', x)` | Etiquetas atuais do card (pra marcar checks) | todos |
| REST | `from('card_label_assignments').insert({card_id, label_id, assigned_by})` | Aplica etiqueta (UNIQUE no banco evita duplicar) | vendedor+ |
| REST | `from('card_label_assignments').delete().eq('card_id', x).eq('label_id', y)` | Remove etiqueta | vendedor+ |
| REST | `from('card_labels').insert(...)` / `update(...)` / `update({deleted_at: now()})` | CRUD do catálogo (UI separada — admin) | gestor |

**Estado visual no Kanban:** ao carregar o board, fazer JOIN/select correlato em `card_label_assignments` (já carregado no realtime) e aplicar classes CSS (`card--preenchida` = border/bg azul) por label.

---

## 4. Realtime — 9 templates de canal (agrupando 3 conceitos)

| Canal (template) | Tabela | Onde |
|---|---|---|
| `rt-kanban-cards` (filtrado por area) | `kanban_cards` | Board (Comercial e Análise) |
| `rt-pf-app-${applicantId}` | `applicants` | Expanded PF |
| `rt-pf-fichas-${applicantId}` | `pf_fichas` | Expanded PF |
| `rt-pf-card-${cardId}` | `kanban_cards` | Expanded PF |
| `rt-pj-app-${applicantId}` | `applicants` | Expanded PJ |
| `rt-pj-fichas-${applicantId}` | `pj_fichas` | Expanded PJ |
| `rt-pj-card-${cardId}` | `kanban_cards` | Expanded PJ |
| `rt-edit-app-${applicantId}` | `applicants` | Modal Editar Ficha |
| `rt-edit-card-${cardId}` | `kanban_cards` | Modal Editar Ficha |

**❌ Removidos:** `rt-builder-workflows`, `inbox-rt-${uid}`.

**Pro novo:**
- Centralizar em **1 provider único** (`RealtimeProvider`) — não recriar canal por componente.
- Cada channel faz `removeChannel` no unmount, senão acumula leak.
- Usar `REPLICA IDENTITY FULL` em `kanban_cards`, `card_attachments`, `card_label_assignments`.

---

## 5. Storage — bucket `card-attachments`

| Operação | Quem chama | Path |
|---|---|---|
| Upload | `services/attachments.ts → uploadAttachment(cardId, noteId, file)` | `<cardId>/<noteId>/<uuid>-<filename>` |
| Signed URL (1h) | `services/attachments.ts → getAttachmentUrl(path)` | path lido de `card_attachments.file_path` |
| Remove (rollback ou exclusão) | mesmo service | path do arquivo |

**Limites aplicados no bucket:**
- `file_size_limit: 10 MB`
- `allowed_mime_types`: lista fechada (~22 mimes)

**Política do bucket:** INSERT exige `kanban_cards.id = split_part(name,'/',1)`. Mantém a regra do escopo amplo.

---

## 6. Mapa cruzado: feature → endpoints → tabelas

| Feature | RPCs principais | REST direto em | Bucket | Realtime |
|---|---|---|---|---|
| Login | (auth) | — | — | — |
| Sidebar | — | `profiles` | — | `profiles:${uid}` |
| Cadastro PF/PJ (botão Nova ficha) | `criar_ficha_p{f,j}_atomic` | `profiles` | — | — |
| Kanban (board) | `change_stage`, `set_card_decision`, `dashboard_kanban_counts`, `soft_delete_card`, `list_my_mention_cards` | `kanban_cards`, `applicants`, `profiles`, `card_labels`, `card_label_assignments` | — | `rt-kanban-cards` |
| Modal Editar Ficha | `add/edit/delete_parecer`, `set_card_decision` | `applicants`, `kanban_cards`, `profiles`, `card_labels`, `card_label_assignments` | upload/signed/remove | `rt-edit-app/card-*` |
| Expanded PF/PJ | `add/edit/delete_parecer`, `set_card_decision` | `applicants`, `pf_fichas`, `pj_fichas`, `kanban_cards`, `profiles` | upload/signed/remove | `rt-pf-*` ou `rt-pj-*` (3 canais) |
| Anexos (transversal) | — | `card_attachments` | upload + signed URL + remove | (via canais do card) |
| Histórico | `list_historico`, `get_historico_details`, `restore_card` | `profiles` | — | — |
| Perfil | — | `profiles` | — | — |
| Inatividade | (auth.signOut local) | — | — | — |

---

## 7. Decisões obrigatórias pro projeto novo

1. **Camada `services/` única por feature.** Toda chamada de API mora em `services/<feature>.ts` e a UI só chama o service. Sem RPCs espalhadas em `page.tsx`.

2. **`useAuth()` único.** Substitui as 13 ocorrências dispersas de `supabase.auth.getUser()`. Context que lê uma vez e expõe `{ user, profile, role, signIn, signOut }`.

3. **`RealtimeProvider` único.** Hook `useTableChanges('kanban_cards', filter)`. Sem canal por componente.

4. **Upload atômico encapsulado.** `services/attachments.ts → uploadAttachment(cardId, noteId, file)` faz upload + insert + rollback. Ninguém chama `storage.upload` direto.

5. **Path do anexo permanece com `<cardId>` como primeiro segmento** — alimenta a RLS do bucket. Documentar em código.

6. **Sem Next API.** Export PDF foi removido; toda operação roda no SDK Supabase direto.

7. **Composer (`add_parecer`/`edit_parecer`/`delete_parecer`):** sempre passar `cardId` capturado no submit (não do state). Service único `services/parecer.ts`. **`key={cardId}`** no `<UnifiedComposer>`. Detalhe em §3.6 e ponto 1 §13.

8. **Sessão em `sessionStorage`** (manter). Não migrar pra `localStorage`. Única exceção: preferência de sidebar colapsada.

9. **`useInactivityLogout` reescrito do zero** — não herdar código do commit 910e361. Critérios em §3.11.

10. **Sem chamadas RPC dentro de primitivos UI.** Calendars/time-pickers recebem dados via prop, não chamam RPC.

11. **Bairro é input livre** (não há mais `listRoutes`). Modal e Expanded usam `<Field>` simples.

12. **Tipo de Instalação removido** — sem `tipo_instalacao` em `kanban_cards`, sem select no Modal/Expanded.

13. **Auto-archive de finalizados client-side** — loop a cada 20s chamando `services/kanban.ts → autoArchiveFinalizados(60)`. UPDATE direto via REST.

14. **Etiquetas via REST direto** — não há RPC. CRUD do catálogo é gestor (RLS cobre); aplicar/remover é vendedor+.

---

## 8. Resumo numérico

- **~14 RPCs únicas** chamadas pelo front (era 36)
- **~10 padrões** de `.from(table)` direto
- **0 endpoints Next API** (era 2)
- **9 templates de canal realtime** (era 11)
- **1 bucket** Storage com 4 policies
- **8 chamadas** distintas de `supabase.auth.*`
- **Zero edge functions, zero cron jobs**

---

## 9. O que NÃO está nesta spec

- Schema das tabelas/RPCs/triggers/RLS detalhado → `20260511_reconstrucao_ponto1_spec_banco_enxuta.md`.
- Fluxo do usuário em cada feature (UI, regras, edge cases) → `Spec (Cópia).md` (Spec enxuta colada em 2026-05-11 — funciona como ponto 3).
- Manifest de UI (componentes, props, contratos) → ponto 4 (a ser revisado pra remover componentes das features descartadas).
- Arquivos reusáveis (Tier A–D) → ponto 5 (`20260508_reconstrucao_ponto5_arquivos_reusaveis.md`).
