# Reconstrução — Ponto 1: Spec do Banco e Backend (ENXUTA)

**Data:** 2026-05-11
**Substitui:** `20260508_reconstrucao_ponto1_spec_banco.md` (kept como referência histórica do escopo amplo).
**Stack:** Supabase Postgres 15 + Supabase Auth + Storage. **Sem edge functions, sem pg_cron ativo.**

**Resumo numérico:** 11 tabelas (era 17), 7 enums (era 10), ~18 RPCs (era 78), ~10 triggers (era 39), 1 storage bucket, 1 view.

Esta spec descreve **o que o banco precisa fazer** no software enxugado. O Agent Code escreve as migrations do zero a partir daqui — sem herdar lints (`auth_rls_initplan`, `unindexed_foreign_keys`, etc.) nem código morto das features descartadas.

---

## 0. O que SAIU em relação ao escopo amplo (referência)

Features descartadas e seus dados:
- **Agenda** → tabelas `agenda_free_rows`, `schedule_reassignments`; 9 RPCs de scheduling; coluna `kanban_cards.free_row_id`.
- **Builder** (engine de auto-assignment) → `builder_workflows`, `builder_rules`, `priorities`; 9 RPCs; trigger `trg_reassign_*` (3); coluna `kanban_cards.assign_origin`.
- **Técnicos (CRUD)** → tabela `technicians`; 7 RPCs; coluna `kanban_cards.technician_id`; trigger `trg_prevent_slot_conflict`.
- **Inbox / Notificações** → tabela `inbox_notifications`; enums `notification_type`/`notification_priority2`; 4 RPCs; triggers `inbox_notify_*` (2), `enforce_priority_expiry`, `notify_card_move`.
- **Comentários em thread** → tabela `card_comments`; triggers `propagate_role_to_comments`, `set_comment_author_role`.
- **Tarefas** → tabela `card_tasks`; enum `task_status`; 3 RPCs; trigger `trg_card_tasks_defaults`; view `v_my_tasks`.
- **Routes/Bairros (catálogo)** → tabela `routes`. Bairro vira input de texto livre no Modal/Expanded.
- **Tipo de Instalação** → coluna `kanban_cards.tipo_instalacao`.
- **Export PDF** → nenhum dado de banco; tudo era client/server-side.

Decisão substituta para **menção**: como `inbox_notifications` sai, o estado visual "mencionado" no card e o filtro "Minhas menções" derivam de `kanban_cards.reanalysis_notes` (campo `mentions` dentro de cada parecer). Nova RPC `list_my_mention_cards()`.

---

## 1. Domínio em uma frase

CRM/gestão para provedor de internet **Mznet**: vendedor cadastra cliente (PF ou PJ) → ficha vira card no Kanban Comercial → é promovido para Análise → analista emite parecer (composer com `/aprovado` `/negado` `/reanalise` `/anexo` e `@menção`) e decide → após 60 s em "Finalizados", card auto-arquiva e aparece no Histórico. Em paralelo: anexos (sempre via composer de parecer), etiquetas configuráveis no card.

---

## 2. Roles (enum `user_role`)

| Role | Pode | Não pode |
|---|---|---|
| `vendedor` | Cadastrar PF/PJ, mover card no Comercial, escrever no parecer (sem decidir), anexar via composer | Decidir parecer; mover card pra/de stage `entrada` |
| `analista` | Tudo do vendedor + decidir (aprovado/negado/reanálise), ingressar cards de Recebidos | — |
| `gestor` | Tudo de analista + admin de usuários, ler `deletion_log`, CRUD em `card_labels`, deletar anexos alheios | — |
| `instalador` | Tudo de gestor | — |
| `leitor` | **Apenas SELECT** em tudo | Qualquer INSERT/UPDATE/DELETE |

Função-âncora: `user_has_role(p_roles user_role[]) → bool` — `SECURITY DEFINER`, lê `profiles.role` por `(SELECT auth.uid())`. Toda RLS usa essa função.

> Pro novo: **um overload só** (com `user_role[]`). Toda policy usa `(SELECT auth.uid())` em `qual`/`with_check` para evitar `auth_rls_initplan`.

---

## 3. Enums (7)

```
person_type            : PF, PJ
kanban_area            : comercial, analise
kanban_decision_status : aprovado, negado, reanalise
user_role              : vendedor, analista, gestor, instalador, leitor
app_meio               : ligacao, whatsapp, presencial, whats_uber

pf_tipo_moradia        : propria, alugada, cedida, outros
pf_nas_outras          : parentes, locador, so_conhecidos, nao_conhece
pf_tipo_comprovante    : energia, agua, internet, outro
pf_vinculo             : carteira_assinada, presta_servicos, contrato_trabalho, autonomo, concursado, outro
pf_estado_civil        : solteiro, casado, amasiado, separado, viuvo

pj_tipo_imovel         : comercio_terreo, comercio_sala, casa
pj_tipo_estabelecimento: propria, alugada, cedida, outros
pj_tipo_comprovante    : energia, agua, internet, outro
```

❌ Removidos: `notification_type`, `notification_priority2`, `task_status`.

---

## 4. Tabelas (11)

> Convenções padrão de **todas** as tabelas: `id uuid PK default gen_random_uuid()`, `created_at`/`updated_at timestamptz default now()` com trigger `set_updated_at_generic`. Tabelas com soft-delete também têm `deleted_at`, `deleted_by`, `deletion_reason` + trigger `log_deletion_generic`. RLS habilitada em todas.

### 4.1 `profiles` — usuário do sistema
- `id uuid` (FK pra `auth.users(id)`)
- `full_name text`
- `role user_role`

Trigger `handle_new_user` (no `auth.users`) cria o profile no signup. Usuário só altera o próprio profile (`(SELECT auth.uid()) = id` AND não-leitor).

### 4.2 `applicants` — cliente (centro de identidade)
PF ou PJ. Tem 1 ficha (`pf_fichas` OU `pj_fichas`) e múltiplos `kanban_cards` ao longo do tempo.

Campos: `person_type`, `primary_name`, `cpf_cnpj`, `phone`, `whatsapp`, `email`, endereço (`address_line/number/bairro/cep/address_complement`), `plano_acesso`, `venc smallint CHECK IN (5,10,15,20,25)`, `carne_impresso bool`, `sva_avulso`, `quem_solicitou`, `telefone_solicitante`, `protocolo_mk`, `meio app_meio`, `info_spc`, `info_pesquisador`, `info_relevantes`, `info_mk`, `parecer_analise`, `representante_mz` (preenchido por trigger `set_representante_mz`).

Regra: **`bairro` é texto livre** — não há mais tabela `routes`.
Regra: DELETE bloqueado (`no_delete_applicants`).

### 4.3 `pf_fichas` — dados detalhados PF (1:1 `applicants`)

Campos completos:
- Pessoais: `birth_date`, `naturalidade`, `uf_naturalidade`, `idade smallint CHECK 0..130`, `do_ps`, `cond`
- Endereço/moradia: `tempo_endereco`, `tipo_moradia pf_tipo_moradia` + `_obs`, `endereco_do_ps`, `unica_no_lote bool` + `_obs`, `com_quem_reside`, `nas_outras pf_nas_outras`, `tem_contrato bool`, `enviou_contrato bool`, `nome_de`, `enviou_comprovante bool`, `tipo_comprovante pf_tipo_comprovante`, `nome_comprovante`, `nome_locador`, `telefone_locador`
- Internet atual: `tem_internet_fixa bool`, `empresa_internet`, `plano_internet`, `valor_internet`, `observacoes`
- Profissional: `profissao`, `empresa`, `vinculo pf_vinculo` + `_obs`, `emprego_do_ps`
- Cônjuge: `estado_civil pf_estado_civil`, `conjuge_obs`, `conjuge_nome`, `conjuge_telefone`, `conjuge_whatsapp`, `conjuge_cpf`, `conjuge_naturalidade`, `conjuge_uf`, `conjuge_idade int`, `conjuge_do_ps`
- Pais: `pai_nome`, `pai_reside`, `pai_telefone`, `mae_nome`, `mae_reside`, `mae_telefone`
- Referências: `ref1_nome/parentesco/reside/telefone`, `ref2_nome/parentesco/reside/telefone`

Regra: `no_delete_pf_fichas`.

### 4.4 `pj_fichas` — dados detalhados PJ (1:1 `applicants`)

- Empresa: `data_abertura`, `nome_fantasia`, `nome_fachada`, `area_atuacao`, `tipo_imovel pj_tipo_imovel` + `obs_tipo_imovel`, `tempo_endereco`, `tipo_estabelecimento pj_tipo_estabelecimento` + `obs_estabelecimento`, `end_ps`, `fones_ps`
- Comprovação: `enviou_comprovante bool`, `tipo_comprovante pj_tipo_comprovante`, `nome_comprovante`
- Internet atual: `possui_internet bool`, `operadora_internet`, `plano_internet`, `valor_internet`
- Documentação: `contrato_social bool`, `obs_contrato_social`
- Sócios (até 3): `socio{1,2,3}_nome/cpf/telefone`

Regra: `no_delete_pj_fichas`.

### 4.5 `kanban_cards` — ficha no fluxo (centro do sistema)

- Identidade: `applicant_id → applicants`, `person_type`
- Localização: `area kanban_area` (default `'comercial'`), `stage text` normalizado por trigger
- Atribuições: `assignee_id → profiles` (analista responsável), `created_by → profiles`
- Datas: `received_at`, `due_at`, `decision_at`, `finalized_at`, `archived_at`, `cancelled_at`, `hora_at time[]` (slots de instalação — vira `text[]`/`time[]` mantém)
- Decisão: `decision_status kanban_decision_status`, `decision_by → profiles`, `final_decision text`, `finalized_by → profiles`
- Soft-delete: `deleted_at`, `deleted_by`, `deletion_reason`, `cancel_reason`, `cancelled_by`
- Conteúdo: `reanalysis_notes jsonb` (**parecer/thread do composer mora aqui** — shape detalhado em §13)

**Colunas explicitamente removidas em relação ao escopo amplo:**
- ❌ `technician_id` (técnicos saem)
- ❌ `assign_origin` (era do builder)
- ❌ `free_row_id` (agenda sai)
- ❌ `comments text` (comentários saem; `reanalysis_notes` é o único canal de texto)
- ❌ `tipo_instalacao` (campo sai do produto)

Regras:
- DELETE bloqueado (`no_delete_kanban_cards`). Sempre via RPC `soft_delete_card`.
- **Stage `entrada`** não pode ser editado por nenhum role via UPDATE (constraint na policy + raise na RPC `change_stage`).
- Triggers `trg_kanban_normalize` + `trg_kanban_stage_normalize` normalizam `stage` (lowercase).

### 4.6 `card_attachments` — anexos (sempre via composer de parecer)

Anexos são **exclusivamente** ligados a um parecer (via `note_id`) — não a comentários, não a cards "soltos".

- `card_id → kanban_cards`
- `applicant_id → applicants` (denormalizado pra busca/filtro)
- `note_id text` — id do parecer dentro de `kanban_cards.reanalysis_notes` (obrigatório)
- `author_id`, `author_name`, `author_role` (denormalizados via trigger `trg_card_attachments_set_author`)
- `file_name`, `file_path` (chave no bucket), `file_size bigint`, `file_type`, `file_extension`

**❌ Coluna `comment_id` removida** (não existe mais a tabela `card_comments`).

Convenção do path no bucket: **`<card_id>/<note_id>/<uuid>-<filename>`**. O primeiro segmento é UUID de `kanban_cards` (alimenta a RLS do bucket); o segundo é o `note_id` do parecer (agrupa anexos por parecer no Storage).

### 4.7 `deletion_log` — auditoria global de soft-delete

- `table_name`, `record_id`, `deleted_by`, `record_snapshot jsonb`, `reason`

Trigger `log_deletion_generic` em todas as tabelas com soft-delete (kanban_cards, card_attachments, pf_fichas, pj_fichas) capturando tanto DELETE quanto UPDATE com `deleted_at` setado.

### 4.8 `card_labels` — **NOVA**: catálogo de etiquetas

- `id uuid PK`
- `name text UNIQUE` (ex: "Preenchida")
- `color text` (token de cor ou hex — ex: `'azul'` ou `#3B82F6`)
- `active bool default true`
- `created_by → profiles`, `created_at`, `updated_at`
- `deleted_at`, `deleted_by`

CRUD: gestor pode criar/editar/desativar. Outros roles só leem.
Seed inicial: 1 etiqueta — `{name:'Preenchida', color:'azul', active:true}`.

### 4.9 `card_label_assignments` — **NOVA**: N:N card ↔ etiqueta

- `id uuid PK`
- `card_id → kanban_cards`
- `label_id → card_labels`
- `assigned_by → profiles`, `assigned_at timestamptz default now()`
- UNIQUE `(card_id, label_id)` — não duplica

Sem soft-delete (registro DELETE direto). Uma "remoção" da etiqueta do card é DELETE da linha.

**Estado visual no Kanban:** card "Preenchida" = existe assignment com label.name='Preenchida' → card recebe border/bg azul (UI). Etiquetas convivem com os 4 estados visuais existentes (padrão, mencionado, atrasado, ambos).

---

## 5. Storage

| Bucket | Visibilidade | Limite | MIME aceitos |
|---|---|---|---|
| `card-attachments` | private | **10 MB por arquivo** | imagens (jpeg/png/gif/webp/heic/heif), docs (pdf/doc/docx/xls/xlsx/txt), arquivos (zip/rar) — lista fechada no bucket |

Convenção de path: `<card_id>/<note_id>/<uuid>-<filename>`. Acesso via signed URL com TTL de 1 h.

---

## 6. RPCs (~18) — agrupadas por feature

### 6.1 Cadastro de fichas
| RPC | Faz |
|---|---|
| `criar_ficha_pf_atomic(p_user_id, p_primary_name, p_cpf_cnpj, p_phone, p_whatsapp, p_email, p_birth_date, p_naturalidade, p_uf_naturalidade) → jsonb` | Cria atomicamente: `applicants` + `pf_fichas` + `kanban_cards` (área `comercial`, stage `entrada`). Retorna `{applicant_id, ficha_id, card_id}`. |
| `criar_ficha_pj_atomic(p_user_id, p_primary_name, p_cpf_cnpj, p_phone, p_whatsapp, p_email, p_nome_fantasia) → jsonb` | Idem PJ. |

### 6.2 Kanban — movimentação e decisão
| RPC | Faz |
|---|---|
| `change_stage(p_card_id, p_area, p_stage, p_reason)` | Move card respeitando RBAC e regras especiais (promoção `comercial/concluidas → analise/recebidos`, cancelamento exige `p_reason`, finalização grava `final_decision`). Vendedor não move pra `entrada`. |
| `set_card_decision(p_card_id, p_decision)` | Aplica decisão `aprovado`/`negado`/`reanalise`. Move card pra coluna correspondente (`stage := decision`). |
| `soft_delete_card(p_card_id, p_reason)` | Marca `deleted_at`, grava em `deletion_log`. |
| `restore_card(p_card_id, p_area, p_stage)` | **NOVA.** Restaura card do Histórico: zera `archived_at`, `finalized_at`, `final_decision`; atualiza `area`/`stage` pro destino escolhido pelo gestor; valida RBAC (gestor/analista) + auditoria. Lock `FOR UPDATE`. |
| `can_user_manage_card(p_card_id) → bool` | Helper de autorização — usado em UI e nas RPCs do parecer. |
| `dashboard_kanban_counts(p_area, p_now) → jsonb` | Contadores agregados do dashboard (entrada/feitas/aguardando/canceladas/concluídas/atrasadas — Comercial; recebidos/em_analise/reanalise/aprovados/negados/finalizados — Análise). |

### 6.3 Parecer (composer)
| RPC | Faz |
|---|---|
| `add_parecer(p_card_id, p_text, p_parent_id?, p_decision?)` | Adiciona parecer no `kanban_cards.reanalysis_notes` (jsonb append) com id próprio. Suporta thread (`p_parent_id`). Se `p_decision` setado, chama `set_card_decision` no mesmo statement. Lock `FOR UPDATE`. |
| `edit_parecer(p_card_id, p_note_id, p_text, p_decision?)` | Edita parecer existente (jsonb in-place). Só o `author_id = (SELECT auth.uid())` pode editar. |
| `delete_parecer(p_card_id, p_note_id)` | Soft-delete in-place — marca `"deleted":true` no nó do jsonb. UI filtra. |

**Sem `notify_card_move` nem notificações de reply** — inbox saiu. Reply em parecer apenas atualiza o jsonb e o realtime do `kanban_cards.reanalysis_notes` propaga pro autor original (se estiver com a ficha aberta).

### 6.4 Histórico
| RPC | Faz |
|---|---|
| `list_historico(p_search, p_date_start, p_date_end, p_status, p_responsavel)` | Lista cards finalizados/decididos via view `v_historico_cards`. `p_responsavel` aceita **UUID** (não texto). |
| `get_historico_details(p_card_id) → jsonb` | Detalhes completos do card + ficha + pareceres + decisão. |

### 6.5 Menções (derivada de pareceres)
| RPC | Faz |
|---|---|
| `list_my_mention_cards() → SETOF uuid` | `SELECT DISTINCT c.id FROM kanban_cards c, jsonb_array_elements(coalesce(c.reanalysis_notes,'[]'::jsonb)) p, jsonb_array_elements(coalesce(p->'mentions','[]'::jsonb)) m WHERE m->>'id' = (SELECT auth.uid())::text AND coalesce((p->>'deleted')::bool,false) = false AND c.deleted_at IS NULL AND c.archived_at IS NULL`. Usada pelo filtro "Minhas menções" e pelo estado visual "mencionado" no card. |

### 6.6 Etiquetas
CRUD via REST direto (RLS cobre). Sem RPC dedicada. **REST direto** em `card_labels` (gestor) e `card_label_assignments` (qualquer não-leitor).

### 6.7 Helpers / RBAC
| Função | Faz |
|---|---|
| `user_has_role(p_roles user_role[]) → bool` | RBAC central — single overload. |
| `is_installer() → bool` | Atalho. |
| `normalize_user_role(src text) → user_role` | Migração de roles antigos. |
| `f_unaccent`, `norm_text` | Normalização para busca textual. |
| `handle_new_user`, `sync_profile_from_auth` | Sincroniza `auth.users → profiles`. |
| `set_updated_at_generic`, `log_deletion_generic` | Funções de trigger reusáveis. |
| `set_representante_mz`, `trg_kanban_normalize`, `trg_card_attachments_set_author` | Funções de trigger específicas. |

❌ Removidas em relação ao escopo amplo: `norm_priority` (era do builder), todos os overloads antigos de `user_has_role(text[])`.

---

## 7. Triggers (~10)

### Padrão `set_updated_at_generic` (BEFORE UPDATE)
Em: `profiles`, `applicants`, `kanban_cards`, `card_attachments`, `pf_fichas`, `pj_fichas`, `card_labels`. (7 tabelas)

### Padrão `log_deletion_generic` (AFTER DELETE + AFTER UPDATE)
Em: `kanban_cards`, `card_attachments`, `pf_fichas`, `pj_fichas`. (4 tabelas)

### Específicos
| Trigger | Quando | O quê |
|---|---|---|
| `applicants.trg_set_representante_mz` | BEFORE INSERT | Preenche `representante_mz` baseado no role do `(SELECT auth.uid())` |
| `card_attachments.trg_card_attachments_set_author` | BEFORE INSERT | Denormaliza `author_id`, `author_name`, `author_role` |
| `kanban_cards.trg_kanban_normalize` + `trg_kanban_stage_normalize` | BEFORE INSERT/UPDATE | Normaliza `stage` (lowercase, etc.) |
| `auth.users.handle_new_user` | AFTER INSERT | Cria linha em `profiles` |
| `auth.users.sync_profile_from_auth` | AFTER UPDATE | Sincroniza email/metadata em `profiles` |

**❌ Removidos em relação ao escopo amplo:**
- `propagate_role_to_comments`, `set_comment_author_role`, `inbox_notify_comment_mentions`, `inbox_notify_comment_replies` (comments saem)
- `trg_card_tasks_defaults` (tasks)
- `enforce_priority_expiry` (inbox)
- `trg_prevent_slot_conflict` (dependia de `technician_id`)
- `trg_reassign_on_card_update`, `trg_reassign_on_applicant_update`, `trg_reassign_on_technician_change` (builder)

---

## 8. RLS — padrão por categoria

Toda tabela do `public` tem RLS habilitada. **Todas as policies usam `(SELECT auth.uid())`** (evita `auth_rls_initplan`).

### 8.1 SELECT (leitura)
- Tabelas de domínio (`kanban_cards`, `applicants`, `pf_fichas`, `pj_fichas`, `card_attachments`, `card_labels`, `card_label_assignments`, `deletion_log`): **todos os 5 roles**, incluindo leitor.
- `profiles`: todos os roles + `service_role`/`supabase_auth_admin`.

### 8.2 INSERT
- Domínio (cards, fichas, attachments, applicants, label_assignments): vendedor, analista, gestor, instalador.
- `card_labels`: gestor.
- `deletion_log`: analista, gestor, instalador (gerado por trigger; sem cliente).
- `profiles`: `(SELECT auth.uid()) = id` AND não-leitor.

### 8.3 UPDATE
- `kanban_cards`: vendedor/instalador (movimentação) OR analista/gestor/instalador (mudanças mais amplas), **nunca em stage `entrada`**. **Uma única policy permissiva com OR no `qual`** (sem `multiple_permissive_policies`).
- `card_attachments`: autor OR gestor/instalador, exceto leitor.
- `applicants`, `pf_fichas`, `pj_fichas`: vendedor, analista, gestor, instalador.
- `card_labels`: gestor.
- `profiles`: `(SELECT auth.uid()) = id` AND não-leitor.

### 8.4 DELETE
- **Bloqueado** em `applicants`, `kanban_cards`, `pf_fichas`, `pj_fichas` (`USING false`). Soft-delete via RPC.
- `card_attachments`: autor OR gestor/instalador, exceto leitor.
- `card_label_assignments`: qualquer não-leitor (DELETE = remover etiqueta do card).
- `card_labels`: gestor (soft-delete — marca `deleted_at`).

---

## 9. Indexes — o que vale criar

Princípio: **só criar índice quando existe query que justifica.** Sem índices preventivos.

### Manter (úteis pelas queries da spec nova)
- PKs em todas as tabelas.
- `applicants(cpf_cnpj)` — busca por documento no filtro do Kanban.
- `applicants` GIN trigram em `f_unaccent(primary_name)` — busca textual do filtro.
- `kanban_cards`:
  - `(area)`, `(stage)`, `(assignee_id)`, `(applicant_id)` — board.
  - `(decision_status)`, `(decision_at)` — Histórico.
  - `(deleted_at)`, `(archived_at)` — filtros do board (sempre `IS NULL`).
  - GIN em `hora_at WHERE deleted_at IS NULL` — filtro Horário.
  - GIN em `(reanalysis_notes jsonb_path_ops)` — usado pela RPC `list_my_mention_cards`.
- `card_attachments(card_id, note_id)` — listar anexos por parecer.
- `card_attachments(author_id)`, `(applicant_id)` — FKs consultadas.
- `card_label_assignments(card_id)`, `(label_id)` — listar etiquetas do card e cards por etiqueta.
- `card_labels(active) WHERE deleted_at IS NULL`.

### Política sobre FKs
**Toda FK que vai ser consultada deve ter índice.** Listar e indexar uma a uma na migration `06_indexes`. Sem `unindexed_foreign_keys`.

---

## 10. Extensões instaladas

```
plpgsql, uuid-ossp, pgcrypto, unaccent, pg_trgm, pg_stat_statements, supabase_vault
```

Todas movidas pro schema `extensions`. Manter padrão.

**Sem `pg_cron`** — não há mais jobs cron a agendar (todos eram da inbox).

---

## 11. Seed inicial (mínimo)

| Tabela | Conteúdo |
|---|---|
| `card_labels` | `{name:'Preenchida', color:'azul', active:true}` (1 linha) |
| `profiles` | Automático via trigger `handle_new_user` quando admin convida usuário pelo Supabase Auth |

**Removidos do seed:** `routes` (não existe mais), `priorities` (builder saiu).

---

## 12. Realtime — tabelas publicadas em `supabase_realtime` (6)

```
applicants, kanban_cards, pf_fichas, pj_fichas, profiles, card_attachments, card_label_assignments
```

Não publicadas: `card_labels` (catálogo muda raramente; refetch manual no popover de gerenciamento), `deletion_log` (auditoria — sem realtime).

**❌ Removidas do realtime em relação ao escopo amplo:** `card_comments`, `card_tasks`, `inbox_notifications`, `technicians`, `builder_workflows`.

> Configurar `REPLICA IDENTITY FULL` em `kanban_cards`, `card_attachments`, `card_label_assignments` — o front depende do payload completo no UPDATE/DELETE pra evitar refetch.

---

## 13. Formato do parecer (`kanban_cards.reanalysis_notes` jsonb)

> 🔑 **Crítico para o composer.** Forma exata que o front lê/escreve.

`reanalysis_notes` é um **array de pareceres**. Cada parecer:

```jsonc
{
  "id": "<uuid>",
  "text": "<texto livre — pode conter @menções inline>",
  "mentions": [{"id":"<uuid de profiles>", "label":"<nome>"}],  // ← alimentação do filtro "Minhas menções"
  "author_id": "<uuid de profiles>",
  "author_name": "<full_name no momento da escrita>",
  "author_role": "<role no momento da escrita>",
  "created_at": "<timestamptz>",
  "parent_id": "<uuid|null>",     // null = raiz da thread
  "level": 0,                      // 0 = raiz; +1 a cada reply
  "thread_id": "<uuid>",           // = id (quando raiz) ou parent.thread_id
  "is_thread_starter": true,       // true só na raiz da thread
  "decision": "aprovado|negado|reanalise|null",

  // adicionados em edit_parecer:
  "updated_by_id": "<uuid>",
  "updated_by_name": "<string>",
  "updated_at": "<timestamptz>",

  // adicionado em delete_parecer (soft-delete in-place):
  "deleted": true
}
```

**Regras de negócio embutidas nas RPCs:**
- `add_parecer` exige `can_user_manage_card(p_card_id)`. Se `p_decision in ('aprovado','negado','reanalise')` também chama `set_card_decision` (atualiza `decision_status` + move stage).
- Reply (`p_parent_id != null`): herda `thread_id` do pai, incrementa `level`. **Sem notificação** — realtime via `rt-*-card-*` propaga.
- `edit_parecer`/`delete_parecer` são `SECURITY DEFINER`; só o **próprio autor** (`author_id = (SELECT auth.uid())`).
- Delete é soft in-place. UI filtra `where !item.deleted`.
- `add_parecer` faz `SELECT ... FOR UPDATE` no card antes do append — sem race em writes concorrentes.

> **Bug P0 conhecido (parecer vazando entre fichas) é do front, não do banco.** O backend recebe `p_card_id` por parâmetro. Spec do front (ponto 3): `key={cardId}` no `<UnifiedComposer>`, debounce com closure de `cardId`, cleanup no unmount, payload sempre carregando `cardId` capturado no submit.

---

## 14. Auto-archive de Finalizados

Comportamento: **60 s após `finalized_at`**, card desaparece do board (vai pro Histórico).

Implementação **client-side** (mesma estratégia do escopo amplo, sem cron):
- Loop no front a cada 20 s chama service `kanban.autoArchiveFinalizados(ttlSec)` que faz:
  ```sql
  UPDATE kanban_cards SET archived_at = now()
  WHERE area='analise' AND stage='finalizados'
    AND archived_at IS NULL
    AND finalized_at < now() - interval '60 seconds';
  ```
- TTL configurável via env (`NEXT_PUBLIC_FINALIZADOS_TTL_SEC`, default 60).
- Não há trigger no banco — UI dispara via REST direto (RLS permite UPDATE em `archived_at` pra analista/gestor/instalador).

Vantagem desta abordagem: nenhuma dependência de `pg_cron`, lógica visível e debugável no front, mesmo card pode "voltar" se algum analista clicar Restaurar antes do tick.

---

## 15. Decisões obrigatórias pro projeto novo

Resumo dos lints e dívidas que **NÃO devem existir** no banco novo:

| # | Categoria | Decisão |
|---|---|---|
| 1 | `auth_rls_initplan` | Toda policy usa `(SELECT auth.uid())` |
| 2 | `unindexed_foreign_keys` | Toda FK consultada tem índice (lista no §9) |
| 3 | `unused_index` | Não criar índices "preventivos" |
| 4 | `no_primary_key` | Toda tabela tem PK explícita |
| 5 | `multiple_permissive_policies` | Uma policy por (tabela, comando) — usar OR no `qual` |
| 6 | `duplicate_index` | Não duplicar |
| 7 | `user_has_role` com 2 overloads | Single overload com `user_role[]` |
| 8 | RPCs sem `SET search_path` | Toda função tem `SET search_path = public, extensions` |
| 9 | Bucket sem limite | `file_size_limit: 10 MB` e `allowed_mime_types` explícitos |
| 10 | Mutações em campos sensíveis sem auditoria | Restaurar/cancelar/finalizar **sempre via RPC** (lock + log) |

---

## 16. Convenções resumidas

- Todas as tabelas: `id uuid PK default gen_random_uuid()`.
- Toda tabela com escrita: `created_at`, `updated_at` (trigger único).
- Toda tabela "soft-deletável": `deleted_at`, `deleted_by`, `deletion_reason` + trigger `log_deletion_generic`.
- Soft-delete via RPC dedicada; DELETE bloqueado por policy.
- Datas em `timestamptz` (UTC); o front converte pro fuso `America/Sao_Paulo`.
- RPCs que mutam dados são `SECURITY DEFINER` quando precisam escrever em tabelas com RLS restritiva; senão `INVOKER`.
- Busca textual: sempre via `f_unaccent(coluna) gin_trgm_ops`.
- **Sem cron, sem notificações persistidas, sem comentários paralelos.** Toda comunicação acontece dentro de `reanalysis_notes`.

---

## 17. Views (1)

### `v_historico_cards` — usada por `list_historico`
Apenas cards com `area='analise' AND stage='finalizados' AND archived_at IS NOT NULL`. Junta `kanban_cards` + `applicants` + `profiles` (vendedor + analista). Colunas:
```
id, applicant_id, applicant_name, cpf_cnpj,
final_decision, finalized_at, archived_at,
vendedor_id, vendedor_name, analista_id, analista_name
```

❌ `v_my_tasks` removida (tasks saem).

---

## 18. Storage policies — bucket `card-attachments`

4 policies em `storage.objects` filtradas por `bucket_id='card-attachments'`:

| Cmd | Quem | Regra |
|---|---|---|
| SELECT | autenticado | role ∈ {vendedor, analista, gestor, instalador, leitor} |
| INSERT | autenticado | role ∈ {vendedor, analista, gestor, instalador} **AND** existe `kanban_cards` com `id::text = split_part(name,'/',1)` |
| UPDATE | autenticado | `owner = (SELECT auth.uid())` AND não-leitor |
| DELETE | autenticado | `owner = (SELECT auth.uid())` AND não-leitor |

**Convenção do path:** `<card_id>/<note_id>/<uuid>-<filename>`. O primeiro segmento DEVE ser UUID de `kanban_cards`.

---

## 19. Migrations alvo (estrutura recomendada)

Pro Agent Code escrever do zero, sugestão de divisão:

```
01_extensions_and_enums.sql       -- extensões + 7 enums
02_tables.sql                     -- 11 tabelas + comentários
03_rls.sql                        -- policies (com (SELECT auth.uid()))
04_functions.sql                  -- RPCs + helpers (com SET search_path)
05_triggers.sql                   -- ~10 triggers
06_indexes.sql                    -- só os justificados (§9)
07_seed.sql                       -- card_labels: "Preenchida"
08_storage.sql                    -- bucket + policies + limits
09_realtime.sql                   -- ALTER PUBLICATION supabase_realtime ADD TABLE …
```

---

## 20. O que NÃO está nesta spec

- Como cada feature mostra/usa esses dados → **ponto 3** (`Spec (Cópia).md` — a Spec enxuta colada pelo Felipe em 2026-05-11).
- Como o cliente chama essas RPCs (auth headers, SDK Supabase) → **ponto 2 enxuto** (`20260511_reconstrucao_ponto2_spec_endpoints_enxuta.md`).
- Como a UI desenha → **ponto 4** (manifest UI, a ser revisado pra remover componentes das features descartadas) + **ponto 5** (arquivos reusáveis Tier A–D).
