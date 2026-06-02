# PLANO — Ficha Rural (wbrferramenta)

> Branch: `fix/expandedrural` · Banco: `supabase-wbr-ferramenta` (`sqsupskuhqsxjbtdilnx`) — **nunca** tocar PROD `supabase-mznet-novo`.

## Decisões tomadas
1. **Onde:** implementar aqui no wbrferramenta (Rural é exclusiva da WBR; não passa pelo toolmznet).
2. **Literal do tipo:** `'Rural'` (capitalizado) — enum value `'Rural'`, segmento de URL `rural`.
3. **Labels:** estilo PF (`Nome do Cliente` / `CPF`).
4. **Escopo:** só paridade mínima — sem badge no kanban, sem breakdown por tipo nas métricas, sem filtro de tipo no histórico.

## Princípio
A Ficha Rural é cidadão de primeira classe igual PF/PJ. A arquitetura é quase toda agnóstica a tipo — o trabalho é majoritariamente **clonar o padrão PF**.

---

## FASE 1 — Banco (no projeto WBR, via MCP `supabase-wbr-ferramenta`)

Migrations NOVAS (nunca editar existentes). Reusar funções genéricas: `user_has_role`, `set_updated_at_generic`, `log_deletion_generic`.

1. **Migration isolada:** `ALTER TYPE public.person_type ADD VALUE IF NOT EXISTS 'Rural';`
   - Deve ser COMMITADA antes de qualquer migration que use o literal (regra do Postgres).
2. **Tabela `rural_fichas`** — espelha `pf_fichas` com:
   - `id`, `applicant_id uuid NOT NULL UNIQUE REFERENCES applicants(id) ON DELETE CASCADE`
   - Pessoais: `birth_date, idade, naturalidade, uf_naturalidade, do_ps, endereco_do_ps`
   - Endereço rural (renomeados): `fazenda` (FAZENDA/SÍTIO/CHÁCARA), `localizacao` (LOCALIZAÇÃO), `end_urbano` (END. URBANO)
   - Moradia: `tipo_moradia, tipo_moradia_obs, unica_no_lote, unica_no_lote_obs, com_quem_reside, nas_outras, pertence_a` (PERTENCE A), `proprietario_patrao` (PROPRIETÁRIO/PATRÃO), `tel_proprietario` (TEL), `obs_moradia` (OBS)
   - Internet: `tem_internet_fixa, empresa_internet, plano_internet, valor_internet, observacoes`
   - Profissão: `profissao, empresa, vinculo, admissao` (novo), `vinculo_obs` (novo OBS), `emprego_do_ps`
   - Cônjuge: `estado_civil, conjuge_obs, conjuge_nome, conjuge_telefone, conjuge_whatsapp, conjuge_cpf, conjuge_naturalidade, conjuge_uf, conjuge_idade, conjuge_do_ps`
   - Filiação: `pai_nome, pai_reside, pai_telefone, mae_nome, mae_reside, mae_telefone`
   - Referências: `ref1_nome, ref1_parentesco, ref1_reside, ref1_telefone, ref2_*`
   - Soft-delete: `deleted_at, deleted_by, deletion_reason`
   - Audit: `created_at, updated_at`
   - **Removidos vs PF** (não criar): `cond`, `enviou_comprovante`, `tipo_comprovante`, `nome_comprovante`, `nome_locador`, `telefone_locador`, `tem_contrato`, `enviou_contrato`, `nome_de`
3. **Colunas novas em `applicants`:** `taxa_instalacao text`, `via text`.
4. **RLS:** 4 policies `rural_fichas_select/insert/update/no_delete` (clone de pf).
5. **Triggers:** `trg_rural_fichas_updated_at`, `trg_rural_fichas_log_deletion` (genéricos).
6. **Field audit:** função+trigger `trg_field_audit_log_rural_fichas` (clone de pf, literal `'rural_fichas'`) + migration de rollback.
7. **Índice:** `idx_rural_fichas_deleted_by`.
8. **Realtime:** `ALTER PUBLICATION supabase_realtime ADD TABLE rural_fichas;`
9. **RPC:** `criar_ficha_rural_atomic` (clone de `criar_ficha_pf_atomic`: applicants `person_type='Rural'` + rural_fichas + kanban_cards `'Rural'`/`comercial`/`feitas`/vendor_id; `user_has_role`; GRANT authenticated).
10. **(Opcional)** `get_historico_details` += `LEFT JOIN rural_fichas` — não bloqueia (frontend não lê a chave).

## FASE 2 — Tipos TS
- `src/lib/types.ts:9` → `PersonType = 'PF' | 'PJ' | 'Rural'`; (recomendado) add `PERSON_TYPE_SEGMENT`.
- `src/features/cadastro/types.ts:1` → `PessoaTipo += 'Rural'`; + `BasicInfoRural { nome, cpf }`.
- `src/services/historico.ts:10,48` → tipos += `'Rural'`.
- `src/features/expanded-ficha/types.ts` → novo `RuralModel` (espelha rural_fichas).
- `src/features/editar-ficha/types.ts` → `AppModel += taxa_instalacao?, via?`.

## FASE 3 — Constants
`src/features/editar-ficha/constants.ts`:
- `RURAL_PLANO_OPTIONS`: XXXXXX / 10MB+CINE+WBR TV R$150 / 15MB R$200 / 20MB R$280
- `RURAL_SVA_OPTIONS`: WBR PLAY (AVULSO) R$29,90
- `TAXA_INST_OPTIONS`: R$150 / R$300 / R$900 / R$760 (Router do cliente)
- `VIA_OPTIONS`: XXXXXXXXX / RÁDIO / OUTDOOR / INSTAGRAM / FACEBOOK / SITE / INDICAÇÃO

`src/features/expanded-ficha/enums.ts`:
- `NAS_OUTRAS` += `PROPRIETÁRIO DO LOCAL`, `DEMAIS FUNCIONÁRIOS`
- `TIPO_MORADIA` += `ARRENDADA` (após OUTRO)

## FASE 4 — Serviços + Cache + Sync
- `src/services/cadastro.ts`: `criarFichaRural`, `fetchExpandedRural`, `updateRuralFicha`; ampliar `fetchApplicantCard` select com `taxa_instalacao, via`.
- `src/hooks/useFichaCache.ts:15` → `expandedRural`.
- `src/hooks/useFichaSync.ts:15` → `FichaScope += 'rural'`.

## FASE 5 — Página expandida
`src/app/(app)/ficha/rural/[id]/page.tsx` — clone de pf com: `fetchExpandedRural`, cache `expandedRural`, scope `'rural'`, realtime `rural_fichas`, `ZOOM_KEY='form-zoom-rural'`, `data-tipo="rural"`, `RURAL_PLANO_OPTIONS`/`RURAL_SVA_OPTIONS`.
Mudanças de campo:
- Endereço: bind em `rural.fazenda/localizacao/end_urbano`; remover Bairro/Cond.
- Moradia: `pertence_a/proprietario_patrao/tel_proprietario/obs_moradia`; remover Comprovante×3 e Locador×2.
- Emprego: linha extra `VÍNCULO | ADMISSÃO | OBS`.
- SVA Avulso: + coluna `TAXA INST` (app.taxa_instalacao).
- Solicitante: 4 colunas `SOLICITANTE | VIA | MEIO | FONE` (app.via).

## FASE 6 — Roteamento + Criação + Histórico
- `EditarFichaModal.tsx:57-58` → FICHA_PATH 3-vias; labels Rural estilo PF (`isPF || isRural`); options Rural condicionais; campos Taxa Inst + Via condicionais.
- `BasicInfoModal.tsx` → discriminador 3-vias (cuidado: `else` cai em PJ hoje); estado/campos/validação/submit/path Rural.
- `PersonTypeModal.tsx` → 3º card "Rural", atalho `r`, grid `sm:grid-cols-3`.
- `historico/page.tsx:328` → mapa 3-vias.

## FASE 7 — Verificação
Criar ficha Rural → card no kanban (stage feitas) → abrir `/ficha/rural/[id]` → editar (realtime + broadcast + field_audit) → presence 2 abas → histórico roteia p/ `/ficha/rural` → soft-delete grava em deletion_log.

---

## NÃO MUDAM (confirmado agnóstico)
RealtimeProvider, PresenceContext/usePresence/useCursorSync, lógica do useFichaSync, KanbanBoard/Column/Card + drag-drop + changeStage/change_stage, NovaFichaCTA, ParecerComposer/PareceresList/AnexosList, fetchFieldHistory (frontend), funções genéricas do DB. Métricas e export/PDF: paridade estrita = nada.

## Detalhe em aberto (não-bloqueante)
`fazenda/localizacao/end_urbano` ficam em `rural_fichas` (page-only). O EditarFichaModal não exibe esses campos para Rural (mostra os de `applicants.address_*`, que ficam vazios) — decidir se oculta a seção de endereço no modal para Rural ou deixa como está.

---

## FUTURO — paridade de `get_historico_details` (NÃO APLICAR AGORA)

**Por que está fora do escopo atual:** essa função monta o "dossiê completo de uma ficha" (a pasta com o formulário inteiro). Hoje **ninguém a chama** — nenhum componente importa `getHistoricoDetails`. A tabela do Histórico é alimentada por `list_historico` (função diferente). Então adicionar Rural aqui agora não muda nada visível.

**Quando aplicar:** SOMENTE quando existir uma feature que leia a chave `rural_ficha` desse JSON — tipicamente um **popup/preview da ficha completa ao clicar numa linha do Histórico**. Nesse momento, liga os 3 tipos de uma vez (coerente). Não confundir com:
- adicionar **coluna** na tabela do Histórico → isso é `list_historico`, não esta função;
- **restaurar** card → `restore_card`;
- **resgatar/abrir** ficha → página expandida (`fetchExpandedRural`).

**Pré-requisito:** tabela `rural_fichas` já criada (Fase 1, migration 2).

**Risco quando aplicar:** baixo. É `CREATE OR REPLACE` (reversível — basta recolar a versão de 2 joins). É o único toque numa função PROD existente, por isso fica isolado aqui.

### Migration pronta (colar como `supabase/migrations/<ts>_get_historico_details_add_rural.sql`)

```sql
-- Adiciona rural_fichas ao dossiê de get_historico_details (paridade com PF/PJ).
-- Aplicar somente quando alguma feature ler a chave 'rural_ficha'.
-- Reverter: recolar a versão original (sem o LEFT JOIN rural_fichas / sem a chave rural_ficha).

CREATE OR REPLACE FUNCTION public.get_historico_details(p_card_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT jsonb_build_object(
    'card',        to_jsonb(c),
    'applicant',   to_jsonb(a),
    'pf_ficha',    to_jsonb(pf),
    'pj_ficha',    to_jsonb(pj),
    'rural_ficha', to_jsonb(r),          -- <<< NOVO
    'pareceres',   c.reanalysis_notes
  )
  FROM public.kanban_cards c
  JOIN public.applicants a ON a.id = c.applicant_id
  LEFT JOIN public.pf_fichas    pf ON pf.applicant_id = a.id
  LEFT JOIN public.pj_fichas    pj ON pj.applicant_id = a.id
  LEFT JOIN public.rural_fichas r  ON r.applicant_id  = a.id   -- <<< NOVO
  WHERE c.id = p_card_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_historico_details(uuid) TO authenticated;
```

### Ajuste de frontend que acompanha (quando a feature for construída)
`src/services/historico.ts` — na interface `HistoricoDetails`, adicionar a chave que o consumidor for ler:
```ts
export interface HistoricoDetails {
  applicant?: { person_type?: 'PF' | 'PJ' | 'Rural' } | null;  // 'Rural' já entra na Fase 2
  // ...
  rural_ficha?: Record<string, unknown> | null;                // <<< NOVO, junto da feature
  // ...
}
```
> A única mudança desta interface que já acontece na Fase 2 é o `person_type` ganhar `'Rural'`. A chave `rural_ficha` só se adiciona junto com o consumidor.
