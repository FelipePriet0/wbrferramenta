# ARCHITECTURE.md — Spec Viva

Referência técnica do projeto Toolmznet. Atualizar ao mudar schema, RPCs ou triggers.

## Glossário de domínio

| Termo | Significado |
|---|---|
| Ficha PF / PJ | Cadastro de cliente pessoa física ou jurídica |
| Kanban Comercial | Estágios: Entrada → Feitas → Aguardando → Canceladas → Concluídas |
| Kanban Análise | Estágios: Recebidos → Preenchidas → Em Análise → Reanálise → Aprovados → Negados → Finalizados → Canceladas |
| Parecer | Comentário do analista no card; pode ter decisão (aprovar/negar/reanálise) |
| Etiqueta | Marker visual no card (Preenchida, Urgente, etc.) |
| Vendedor | Profile com role `vendedor`; criou a ficha originalmente E/OU responde hoje (`vendor_id` mutável) |
| Analista | Profile com role `analista`; pega ficha em Análise (`assignee_id`) |
| Gestor | Profile com role `gestor`; tudo + admin |
| Leitor | Profile com role `leitor`; só lê |
| Instalador | Profile com role `instalador`; pode mover cards mas não decidir |
| Urgência | Estado especial via etiqueta Urgente + motivo registrado |
| Transferência | Mudança de `vendor_id` ou `assignee_id`; registrada em `card_ownership_history` |

---

## Esquema do banco

### `applicants`

Registro principal do cliente. Uma row por cliente.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `created_by` | uuid FK → profiles | **IMUTÁVEL** — audit trail |
| `tipo` | text | `'pf'` ou `'pj'` |
| `created_at` | timestamptz | |
| `deleted_at` | timestamptz | soft delete |

### `kanban_cards`

Um card por ficha, por área. Um cliente pode ter card em Comercial E em Análise.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `applicant_id` | uuid FK → applicants | |
| `area` | text | `'comercial'` ou `'analise'` |
| `stage` | text | stage atual (lower-case, normalizado por trigger) |
| `vendor_id` | uuid FK → profiles | **mutável** — quem responde hoje |
| `assignee_id` | uuid FK → profiles | **mutável** — analista responsável |
| `urgent_reason` | text | zerado por trigger ao remover etiqueta Urgente |
| `finalized_at` | timestamptz | preenchido ao finalizar; archive após 60s |
| `deleted_at` | timestamptz | soft delete |
| `updated_at` | timestamptz | atualizado por trigger |

### `pf_fichas`

Dados cadastrais de pessoa física.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `applicant_id` | uuid FK → applicants | |
| `nome`, `cpf`, `rg`, `data_nascimento` | text | |
| `telefone`, `email` | text | |
| `endereco_*` | text | rua, número, bairro, cidade, estado, cep |
| `plano_interesse` | text | |
| `observacoes` | text | |

### `pj_fichas`

Dados cadastrais de pessoa jurídica.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `applicant_id` | uuid FK → applicants | |
| `razao_social`, `cnpj`, `nome_fantasia` | text | |
| `responsavel_nome`, `responsavel_cpf` | text | |
| `telefone`, `email` | text | |
| `endereco_*` | text | |
| `plano_interesse` | text | |
| `observacoes` | text | |

### `card_attachments`

Arquivos anexados a um card.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `card_id` | uuid FK → kanban_cards | |
| `author_id` | uuid FK → profiles | setado por trigger BEFORE INSERT |
| `file_name`, `file_url`, `file_size`, `mime_type` | text/int | |
| `created_at` | timestamptz | |

### `card_labels`

Definição das etiquetas disponíveis.

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `name` | text |
| `color` | text |

### `card_label_assignments`

Etiquetas atribuídas a cards (many-to-many).

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `card_id` | uuid FK → kanban_cards |
| `label_id` | uuid FK → card_labels |
| `created_at` | timestamptz |

### `card_ownership_history`

Auditoria de transferências de `vendor_id` e `assignee_id`.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `card_id` | uuid FK → kanban_cards | |
| `field_changed` | text | `'vendor_id'` ou `'assignee_id'` |
| `old_value` | uuid | profile anterior |
| `new_value` | uuid | profile novo |
| `changed_at` | timestamptz | |
| `changed_by` | uuid FK → profiles | |

### `profiles`

Um profile por usuário autenticado.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | = `auth.uid()` |
| `email` | text | sincronizado de `auth.users` |
| `full_name` | text | |
| `role` | text | `vendedor`, `analista`, `gestor`, `leitor`, `instalador` |
| `avatar_url` | text | |

### `deletion_log`

Log de cards deletados/arquivados.

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `card_id` | uuid |
| `action` | text |
| `performed_by` | uuid |
| `performed_at` | timestamptz |
| `metadata` | jsonb |

---

## RPCs (todas SECURITY DEFINER)

| Nome | RBAC | O que faz |
|---|---|---|
| `criar_ficha_pf_atomic` | vendedor+ | INSERT `applicants` + `pf_fichas` + `kanban_cards` atomicamente |
| `criar_ficha_pj_atomic` | vendedor+ | idem PJ |
| `change_stage` | varia por stage | Move card; aplica regras de cancellation/revert/promotion/ingress/finalization |
| `add_parecer` | analista/gestor | Adiciona parecer no jsonb `reanalysis_notes` |
| `edit_parecer` | autor | Edita parecer próprio |
| `delete_parecer` | autor/gestor | Soft-delete in-place |
| `set_card_decision` | analista/gestor | Aprovar/negar/reanálise |
| `restore_card` | gestor | Restaura card do Histórico |
| `soft_delete_card` | gestor | Marca `deleted_at` |
| `list_historico` | autenticado | Lista cards finalizados via view |
| `get_historico_details` | autenticado | Detalhes completos |
| `list_my_mention_cards` | autenticado | Cards onde o user foi mencionado |
| `dashboard_kanban_counts` | autenticado | Contadores por stage/área/período |
| `can_user_manage_card` | helper | `true` se user tem RBAC para o card |
| `user_has_role` | helper | `true` se user tem alguma das roles passadas |
| `is_installer` | helper | `true` se `role = 'instalador'` |
| `assign_urgent_with_reason` | vendedor+ | Aplica etiqueta Urgente com motivo (atomic) |
| `update_urgent_reason` | autor original | Edita motivo da Urgente |

---

## Triggers

| Nome | Tabela | Quando | O que faz |
|---|---|---|---|
| `handle_new_user` | `auth.users` | INSERT | Cria profile correspondente |
| `sync_profile_from_auth` | `auth.users` | UPDATE | Sincroniza email/metadata em profiles |
| `trg_kanban_normalize_stage` | `kanban_cards` | BEFORE INSERT/UPDATE | Lower-case stage |
| `trg_kanban_cards_updated_at` | `kanban_cards` | BEFORE UPDATE | Atualiza `updated_at` |
| `trg_kanban_cards_log_deletion` | `kanban_cards` | AFTER DELETE/UPDATE | Loga em `deletion_log` |
| `kanban_cards_clear_labels_on_stage_change` | `kanban_cards` | AFTER UPDATE OF stage, area | Remove "Preenchida" ao sair de Preenchidas; outras labels persistem |
| `kanban_cards_log_ownership_change` | `kanban_cards` | AFTER UPDATE OF vendor_id, assignee_id | Registra em `card_ownership_history` |
| `card_label_assignments_clear_urgent_reason_on_delete` | `card_label_assignments` | AFTER DELETE | Zera `urgent_reason` quando "Urgente" é removida |
| `trg_card_attachments_set_author` | `card_attachments` | BEFORE INSERT | Seta `author_id = auth.uid()` |
| `protect_objects_delete` | `storage.objects` | BEFORE DELETE | Bloqueia DELETE direto (forçar via API) |

---

## Realtime — tabelas publicadas

```
applicants, kanban_cards, pf_fichas, pj_fichas, profiles, card_attachments, card_label_assignments
```

`REPLICA IDENTITY FULL` em: `kanban_cards`, `card_attachments`, `card_label_assignments`.

---

## Features (fluxos completos)

### Cadastro de Ficha PF/PJ

1. Modal `BasicInfo` coleta dados mínimos
2. Chama `criar_ficha_pf_atomic` ou `criar_ficha_pj_atomic` via RPC
3. Retorna `{ applicant_id, card_id }`
4. Expanded-ficha auto-abre via router

### Kanban + movimentação

1. Drag & drop via dnd-kit → `changeStage` no serviço
2. `change_stage` RPC: valida RBAC, aplica regras de stage, zera `assignee_id` se voltar para Recebidos
3. Triggers disparam (normalize, labels, ownership)
4. Realtime publica mudança → `useTableChanges` recarrega

### Parecer

1. `UnifiedComposer` com `key={cardId}` (evita vazamento entre fichas)
2. Slash commands para mencionar usuários
3. Chama `add_parecer` RPC
4. Realtime atualiza a lista de pareceres em tempo real

### Etiqueta Urgente (com motivo)

1. `LabelsPopover` detecta seleção de "Urgente"
2. Abre `UrgenteMotivoModal` para coletar o motivo
3. Chama `assign_urgent_with_reason` RPC (atomicamente insere label + salva motivo)
4. `update_urgent_reason` para editar o motivo depois
5. Trigger AFTER DELETE em `card_label_assignments` zera `urgent_reason` ao remover

### Transferência de operador

1. `EditarFichaModal` → `TransferOperatorModal`
2. UPDATE `vendor_id` ou `assignee_id`
3. Trigger `kanban_cards_log_ownership_change` registra em `card_ownership_history`

### Histórico (fichas finalizadas)

1. Card chega em `finalized_at`
2. Auto-archive após 60s: move para view `v_historico_cards`
3. `list_historico` RPC lista com paginação
4. `get_historico_details` retorna detalhes completos

---

## Mapa de arquivos

| Pasta | Responsabilidade |
|---|---|
| `src/app/(app)/kanban/` | Páginas de Kanban Comercial e Análise |
| `src/app/(app)/ficha/pf/[id]/` | Expanded de ficha PF |
| `src/app/(app)/ficha/pj/[id]/` | Expanded de ficha PJ |
| `src/app/(app)/historico/` | Página de histórico |
| `src/features/kanban/` | Componentes do board, cards, modais (Cancel/Move/Revert) |
| `src/features/cadastro/` | Modal inicial de cadastro |
| `src/features/editar-ficha/` | Modal de edição rápida + transferência |
| `src/features/expanded-ficha/` | Componentes da página Expanded (AdobeField, etc.) |
| `src/features/labels/` | Popover de etiquetas + modal de motivo urgente |
| `src/features/parecer/` | Composer de parecer |
| `src/features/historico/` | Componentes do histórico |
| `src/services/` | Camada de dados (única que chama supabase) |
| `src/hooks/` | Hooks compartilhados (useAuth, useFichaCache, useFichaSync, useMentionReads) |
| `src/lib/` | Utilitários (masks, datetime, errors, supabase client, types globais) |
| `src/components/ui/` | shadcn-style primitives |
| `src/components/app/` | Componentes globais do app (sidebar, filter-cta) |
| `src/components/providers/` | Context providers (Auth, Realtime) |
| `supabase/migrations/` | Histórico de migrations (append-only) |
| `docs/specs-originais/` | Specs originais do projeto (contexto histórico) |
