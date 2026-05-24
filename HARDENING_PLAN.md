# Plano de Hardening do toolmznet

> **Pra agents que estão lendo isso:** este arquivo é a sua única fonte de verdade. Você foi chamado pra executar **uma fase** (ou um shard de fase) desse plano. Leia até o fim da seção "Como usar este plano" antes de tocar em qualquer arquivo.

**Versão:** 1.0
**Criado:** 2026-05-18
**Owner do plano:** Felipe (felipepriet0mz@gmail.com)
**Repositório:** `/home/usuario/Documentos/toolmznet/toolmznet-novo`
**Branch base:** `main` (`origin/main` em `https://github.com/FelipePriet0/toolmz.git`)

---

## 0. Contexto mínimo do projeto

- **toolmznet** = CRM/gestão para o provedor de internet Mznet.
- **Stack:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript strict + Tailwind v4 + Supabase (Postgres/Auth/Storage/Realtime) + TanStack Query + dnd-kit.
- **Em produção** com ~15 usuários (vendedores, analistas, gestores, instaladores, leitores).
- **MCP server pra Supabase:** `supabase-mznet-novo` (project_ref `zwmlhwwgbjmopuhxxooo`, organização `jarvis`).
- **Plataforma de deploy:** Vercel (Next.js auto). `next.config.ts` na raiz. **Não existe** `vercel.json` nem `vercel.ts`.
- **Idioma do projeto:** PT-BR no UI/copy/comentários. Termos técnicos em inglês. Mantenha o padrão.

### Diagnóstico baseline (executado em 2026-05-18, antes deste plano existir)

| Métrica | Valor |
|---|---|
| Arquivos TS/TSX em `src/` | 114 |
| LOC em `src/` | ~19.847 |
| Erros de lint | **86** |
| Warnings de lint | **43** |
| Top regra violada | `@typescript-eslint/no-explicit-any` (35) |
| 2ª | `@typescript-eslint/no-unused-vars` (31) |
| 3ª | `react-hooks/set-state-in-effect` (30, regra nova do React 19) |
| 4ª | `react-hooks/exhaustive-deps` (11) |
| `.env*` no `git ls-files` | nada (correto) |
| Secrets hardcoded em `src/` | nada encontrado (greps por `eyJ`, `sk_live_`, `service_role`) |
| Husky / pre-commit | inexistente |
| Prettier | inexistente |
| Testes | zero |
| Sentry / Grafana / Prometheus | nenhum |

---

## 1. Regras inegociáveis (lê isso, sério)

Estas regras foram impostas pelo owner com base em incidentes anteriores. Quebrá-las quebra o trust do owner com agents.

1. **Branch isolada por unidade de trabalho.** Nunca commite direto em `main`. Use os nomes definidos na seção da sua fase.
2. **NUNCA dê merge sem aprovação explícita do owner.** O fluxo é: você termina → reporta no chat com smoke instructions → owner roda o smoke → owner aprova → você (ou outro agent) merga. Não interprete "ok continue" como "merga".
3. **NUNCA dê push em `main` ou força em qualquer branch sem ordem direta.** Push da sua branch de trabalho pra `origin/<sua-branch>` pode ser feito depois do smoke aprovado, mas o merge em `main` espera ordem.
4. **Migrations são append-only.** Nunca edite uma migration já aplicada. Sempre crie uma nova com timestamp `YYYYMMDDHHMMSS_descricao.sql` em `supabase/migrations/`.
5. **Mudanças de banco passam por playbook antes de aplicar.** Apresente UP + DOWN (granular) ao owner, espere aprovação, aí sim chame `mcp__supabase-mznet-novo__apply_migration`. **Para fases de hardening sem mudança de banco, isso não se aplica.**
6. **Conventional Commits.** Formato: `<tipo>(<escopo>): <descrição>` (ex: `chore(lint): remove unused imports em src/features/labels`). Tipos válidos: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`, `perf`, `style`.
7. **Trailer obrigatório em commits feitos por agent:**
   ```
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```
   (ajuste o nome pro modelo que você é, mas mantenha o trailer)
8. **TypeScript strict não pode regredir.** Se você adicionou um `any` pra "passar", isso é falha de execução — pare e reporte.
9. **Sem `--no-verify`, sem `--amend` em commits já pushados, sem `git reset --hard` sem ordem.**
10. **Reportar smoke incluindo:** (a) o que mudou, (b) como o owner verifica em 5 min, (c) golden path e edge cases, (d) qualquer comportamento que **mudou de propósito** (UX, perf, error message).

---

## 2. Como usar este plano

### 2.1. Multi-agent: protocolo de claim

Como esse plano roda com **múltiplos agents em paralelo**, é obrigatório claim de fase pra evitar colisão.

**Antes de começar:**

1. Rode `git fetch origin && git branch -r | grep chore/hardening` pra ver quais branches de hardening já existem.
2. Cada fase/shard abaixo tem um **nome de branch fixo**. Se a branch já existe remotamente, outro agent pegou — escolha outra fase.
3. Se você é o primeiro: `git checkout main && git pull && git checkout -b <nome-da-branch-da-sua-fase>`.
4. Push da branch vazia imediato: `git push -u origin <nome-da-branch>`. Isso é o "claim" — outros agents vão ver e pular.
5. Comece a trabalhar.

**Se você precisa de algo que outra fase tá fazendo:**
- NÃO espere. Trabalhe em cima do `main` atual e deixe o merge fazer o reconcile.
- A ordem de merge é decidida pelo owner, não por você.

### 2.2. Como saber se você terminou

Cada fase tem uma seção **"DONE quando"** com critérios objetivos. Não reporte como concluído se algum critério não bate.

### 2.3. Como reportar

Quando terminar, mande no chat do owner exatamente esse template:

```
✅ Fase <N> — <nome> finalizada na branch `<branch>`

📦 Commits:
  - <hash> <subject>
  - <hash> <subject>

📊 Resultado:
  - Lint: <X> erros → <Y> erros
  - <outras métricas relevantes>

🧪 Smoke (5 min):
  1. <passo>
  2. <passo>
  3. <esperado>

⚠️ Atenção:
  - <se mudou comportamento de propósito>
  - <se algo ficou parcial e por quê>

Aguardando OK pra merge.
```

---

## 3. Fase 1 — Code Health

**Objetivo:** zerar lint, instalar guardrails (Husky + Prettier + knip), bloquear regressão via CI.

**Por que essa fase primeiro:** com 86 erros e 43 warnings, qualquer agent que abre o repo perde sinal. Os 30 `set-state-in-effect` são regra nova do React 19 que indica cascading renders — provavelmente já causa flicker invisível. Knip vai apontar componentes/funções/state vars que nunca rodam (exatamente o que o owner pediu) em uma execução.

**Esta fase está dividida em 6 shards independentes** — escolha um:

---

### Fase 1A — Tooling setup (Husky + Prettier + lint-staged)

**Branch:** `chore/hardening-1a-tooling`
**Toca em:** arquivos de config na raiz (não toca em `src/`).
**Não conflita com:** 1B, 1C, 1D, 1E, 1F.

**Tasks:**

1. Instalar dev deps:
   ```bash
   npm install -D prettier prettier-plugin-tailwindcss husky lint-staged
   ```
2. Criar `.prettierrc.json` na raiz:
   ```json
   {
     "semi": true,
     "singleQuote": true,
     "trailingComma": "all",
     "printWidth": 80,
     "tabWidth": 2,
     "plugins": ["prettier-plugin-tailwindcss"]
   }
   ```
3. Criar `.prettierignore` na raiz com:
   ```
   .next/
   node_modules/
   out/
   build/
   supabase/migrations/
   *.md
   ```
4. Adicionar scripts ao `package.json`:
   ```json
   "format": "prettier --write .",
   "format:check": "prettier --check .",
   "prepare": "husky"
   ```
5. Rodar `npx husky init` (cria `.husky/pre-commit`).
6. Substituir conteúdo de `.husky/pre-commit` por:
   ```bash
   npx lint-staged
   ```
7. Adicionar ao `package.json`:
   ```json
   "lint-staged": {
     "*.{ts,tsx,js,jsx}": [
       "prettier --write",
       "eslint --fix"
     ],
     "*.{json,md,yml,yaml}": [
       "prettier --write"
     ]
   }
   ```
8. **Não rodar `npm run format` em tudo ainda** — isso é trabalho do shard 1F. Aqui só instalar.

**DONE quando:**
- [ ] `npm run format:check` roda e mostra arquivos que precisam de format (não precisa estar limpo aqui)
- [ ] `.husky/pre-commit` existe e contém `npx lint-staged`
- [ ] Um commit de teste (toque um arquivo, commit) dispara o hook visivelmente
- [ ] `package.json` tem `format`, `format:check`, `prepare`, `lint-staged` configurados
- [ ] Nenhuma alteração em `src/`

---

### Fase 1B — Limpar `@typescript-eslint/no-unused-vars` (31 ocorrências)

**Branch:** `chore/hardening-1b-unused-vars`
**Toca em:** `src/**/*.{ts,tsx}` onde a regra dispara.
**Pode conflitar com:** 1C (mesmo escopo), 1D (mesmo escopo). Roda **sozinho ou depois desses**.

**Tasks:**

1. Listar todas as ocorrências:
   ```bash
   npm run lint 2>&1 | grep "no-unused-vars" -B1 | head -100
   ```
2. Pra cada ocorrência:
   - **Se é import:** deletar a linha de import.
   - **Se é variável local não usada:** deletar a declaração. Se é destructure (`const { a, b } = obj`) e só `b` é usado, vire `const { b } = obj`.
   - **Se é parâmetro de função:** prefixar com `_` (ex: `(_event, value) => ...`). NÃO delete o parâmetro se ele faz parte de uma assinatura de callback fornecida por API externa (ex: handler do dnd-kit).
   - **Se é função/const declarada e nunca chamada:** investigar com `grep -rn` em `src/`. Se realmente nunca usada, deletar. Se usada via dynamic import ou `eval`, prefixar com `_` e adicionar comentário do uso.
3. Rodar `npm run lint 2>&1 | grep "no-unused-vars" | wc -l` ao final — deve ser 0.
4. Rodar `npx tsc --noEmit` — deve passar limpo (zero output).
5. Rodar `npm run build` — deve completar sem erro.
6. Commits granulares por diretório, ex:
   - `chore(lint): remove unused vars em src/features/labels`
   - `chore(lint): remove unused vars em src/features/kanban`
   - `chore(lint): remove unused imports em src/services`

**DONE quando:**
- [ ] `npm run lint 2>&1 | grep "no-unused-vars" | wc -l` retorna `0`
- [ ] `npx tsc --noEmit` passa limpo
- [ ] `npm run build` completa sem erro
- [ ] Nada foi deletado que era usado dinamicamente (verificado por grep)

---

### Fase 1C — Limpar `@typescript-eslint/no-explicit-any` (35 ocorrências)

**Branch:** `chore/hardening-1c-no-any`
**Toca em:** `src/**/*.{ts,tsx}` onde a regra dispara.
**Pode conflitar com:** 1B (mesmo escopo). Roda **sozinho ou depois de 1B**.

**Tasks:**

1. Listar ocorrências:
   ```bash
   npm run lint 2>&1 | grep "no-explicit-any" -B1 | head -120
   ```
2. Pra cada `any`:
   - **Se é callback de evento:** use o tipo correto (`React.MouseEvent<HTMLButtonElement>`, `React.ChangeEvent<HTMLInputElement>`, etc).
   - **Se é payload de Supabase:** olhe a definição em `src/lib/types.ts` ou regenere os types com `mcp__supabase-mznet-novo__generate_typescript_types` e importe.
   - **Se é JSON arbitrário vindo de uma API:** use `unknown` e narrow com `zod` (já tá no projeto). Pegue o padrão de `src/lib/errors.ts` se já tiver schema.
   - **Se é genérico de função utilitária:** introduza um type parameter (`function foo<T>(x: T): T`).
   - **Quando nada disso couber e é genuinamente unknown:** use `unknown`, **nunca** `any`. Se precisar acessar campo, cast com `as { campo: tipo }` no ponto de uso e justifique no commit message.
3. Rodar `npm run lint 2>&1 | grep "no-explicit-any" | wc -l` ao final — deve ser 0.
4. `npx tsc --noEmit` deve passar limpo.
5. Commits granulares por diretório.

**DONE quando:**
- [ ] `npm run lint 2>&1 | grep "no-explicit-any" | wc -l` retorna `0`
- [ ] `npx tsc --noEmit` passa limpo
- [ ] `npm run build` completa sem erro
- [ ] Nenhum `any` novo introduzido pra "passar"

---

### Fase 1D — Refatorar `react-hooks/set-state-in-effect` (30 ocorrências)

**Branch:** `chore/hardening-1d-effect-setstate`
**Toca em:** `src/**/*.{ts,tsx}` onde a regra dispara.
**Pode conflitar com:** 1B, 1C. Roda **depois de 1B e 1C idealmente** pra reduzir conflito.
**⚠️ Mais arriscado que 1B/1C** — exige entendimento do componente.

**Contexto:** React 19 adicionou essa regra. Ela aponta `setState(...)` chamado dentro do body de `useEffect`, o que causa cascading renders.

**Tasks:**

1. Listar:
   ```bash
   npm run lint 2>&1 | grep "set-state-in-effect" -B5 | head -200
   ```
2. Pra cada ocorrência, classifique:
   - **Padrão A — derivação síncrona de prop/state:** o setState dentro do effect tá calculando algo a partir de outra state. **Solução:** mova pra `useMemo` ou derivação inline no render. Não precisa de effect.
   - **Padrão B — sync com external store:** legítimo, mas a regra ainda berra. **Solução:** trocar `useEffect` por `useSyncExternalStore` se o external store tiver subscribe API. Se for Supabase realtime, manter `useEffect` mas usar `// eslint-disable-next-line react-hooks/set-state-in-effect` no setState específico, com comentário justificando.
   - **Padrão C — inicialização condicional:** ex: `if (!loaded) { setState(x); setLoaded(true); }`. **Solução:** mova pra um `useState(() => initialValue)` ou pra fora do effect.
   - **Padrão D — reset on prop change:** ex: `useEffect(() => { setState(initial); }, [id])`. **Solução:** usar `key={id}` no componente pai (remount limpo) ou aceitar o disable da regra com comentário.
3. **Pra cada fix, smoke obrigatório:** monte o componente e teste o caminho que o effect cobria. Se tirou um effect e quebrou comportamento → você errou o padrão.
4. Rodar `npm run lint 2>&1 | grep "set-state-in-effect" | wc -l` — deve ser 0 ou só ocorrências com `eslint-disable-next-line` justificado.
5. `npx tsc --noEmit` passa limpo.
6. Commits granulares por componente.

**DONE quando:**
- [ ] `npm run lint 2>&1 | grep "set-state-in-effect"` mostra **apenas** ocorrências com `eslint-disable-next-line` justificado em comentário
- [ ] Cada justificativa explica o porquê (não só "evita warning")
- [ ] Smoke manual feito em pelo menos 5 componentes alterados
- [ ] `npx tsc --noEmit` passa limpo

---

### Fase 1E — Dead code scan com Knip

**Branch:** `chore/hardening-1e-knip`
**Toca em:** raiz (`knip.json`), depois `src/` conforme achados.
**Pode conflitar com:** 1B, 1C, 1D quando for deletar arquivos. Roda **depois das fases anteriores idealmente**.

**Tasks:**

1. Instalar:
   ```bash
   npm install -D knip
   ```
2. Criar `knip.json` na raiz:
   ```json
   {
     "$schema": "https://unpkg.com/knip@5/schema.json",
     "entry": [
       "src/app/**/{page,layout,route,template,loading,not-found,error}.{ts,tsx}",
       "src/middleware.ts",
       "next.config.ts"
     ],
     "project": ["src/**/*.{ts,tsx}"],
     "ignore": [
       "src/lib/database.types.ts"
     ]
   }
   ```
3. Adicionar script:
   ```json
   "dead": "knip"
   ```
4. Rodar `npm run dead 2>&1 | tee knip-report.txt` (não commitar o `.txt`).
5. Analisar o relatório. Categorias típicas:
   - **Unused files** — arquivos órfãos. Verificar antes de deletar (pode ser usado via dynamic import).
   - **Unused exports** — exports que ninguém importa. Mudar pra `export` interno ou deletar.
   - **Unused dependencies** — remover do `package.json` via `npm uninstall <nome>`.
   - **Unused dev dependencies** — mesmo.
   - **Unused types** — deletar do arquivo de types.
6. Pra cada categoria, fazer commit separado. Ex:
   - `chore(dead): remove arquivos órfãos apontados pelo knip`
   - `chore(dead): remove deps não usadas do package.json`
   - `chore(dead): remove exports não importados`
7. Re-rodar `npm run dead` no final — relatório deve estar limpo ou só com falsos positivos documentados em `knip.json` na seção `ignore`.

**DONE quando:**
- [ ] `npm run dead` roda e relatório está limpo OU os items restantes estão em `knip.json/ignore` com comentário em commit
- [ ] `npm run build` completa
- [ ] `npx tsc --noEmit` passa
- [ ] Nenhum arquivo deletado quebrou import (verificado pelo build)

---

### Fase 1F — Format + CI gatekeeping

**Branch:** `chore/hardening-1f-ci`
**Toca em:** `.github/workflows/*.yml`, e roda `prettier --write` em todo o repo.
**Depende de:** 1A precisa estar mergeado (precisa do Prettier instalado).
**Não conflita com:** 1B, 1C, 1D, 1E se feito **após** todos eles mergeados.

**Tasks:**

1. Confirmar que `prettier` tá instalado (Fase 1A).
2. Rodar `npm run format` — formata todo o repo. Espere muitas mudanças.
3. Commit único: `chore(format): aplica prettier em todo o codebase`.
4. Criar `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on:
     pull_request:
       branches: [main]
     push:
       branches: [main]
   jobs:
     check:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '24'
             cache: 'npm'
         - run: npm ci
         - run: npm run format:check
         - run: npm run lint
         - run: npx tsc --noEmit
         - run: npm run build
   ```
5. Verificar que Vercel já roda `next build` no deploy. Se quiser também rodar lint no Vercel, adicionar ao `package.json`:
   ```json
   "build": "next build && eslint . --max-warnings=0"
   ```
   **Mas só se 1B+1C+1D zeraram lint** — senão Vercel deploy para de funcionar.
6. Push da branch e abrir PR (mas não merge — owner aprova).

**DONE quando:**
- [ ] `.github/workflows/ci.yml` existe
- [ ] PR aberto no GitHub mostra CI rodando e passando
- [ ] `npm run format:check` retorna 0 (todos formatados)
- [ ] Se mexeu no `build` script, Vercel deploy de teste passou

---

## 4. Fase 2 — Security & Secrets Audit

**Objetivo:** rotacionar credenciais expostas pra agents/MCP, fechar buracos de RLS, adicionar gitleaks no CI, CSP headers.

**Por que essa fase:** a `SUPABASE_ANON_KEY` foi configurada via MCP — passou por logs, terminal, screenshots, prompt history. Não há evidência de vazamento, mas higiene proativa custa pouco. Supabase advisors normalmente acham 3-10 issues invisíveis. Gitleaks impede commits acidentais futuros.

---

### Fase 2A — Auditoria Supabase advisors + RLS review

**Branch:** `chore/hardening-2a-rls-audit`
**Toca em:** docs (cria `docs/security-audit-2026-05.md`) e potencialmente migrations novas se achar buraco.

**Tasks:**

1. Rodar `mcp__supabase-mznet-novo__get_advisors` com `type='security'`.
2. Rodar `mcp__supabase-mznet-novo__get_advisors` com `type='performance'`.
3. Listar todas as tables com RLS:
   ```sql
   SELECT schemaname, tablename, rowsecurity
   FROM pg_tables WHERE schemaname = 'public'
   ORDER BY rowsecurity, tablename;
   ```
4. Listar policies por table:
   ```sql
   SELECT schemaname, tablename, policyname, cmd, qual, with_check
   FROM pg_policies WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```
5. Pra cada table sem RLS: avaliar se é intencional (logs, views materializadas) ou esquecimento.
6. Pra cada policy: confirmar que o `qual`/`with_check` tá no nível de role esperado (vendedor não deve ler ficha de outro vendedor, etc).
7. Documentar findings em `docs/security-audit-2026-05.md` no formato:
   ```markdown
   # Security Audit — 2026-05-18

   ## Findings

   ### CRÍTICO
   - [ ] <issue> — table X sem RLS, qualquer auth user lê tudo

   ### ALTO
   - [ ] <issue>

   ### MÉDIO
   - [ ] <issue>
   ```
8. **NÃO aplicar fixes nessa fase.** Só documentar. Owner decide o que fechar e em que ordem (algumas mudanças de RLS quebram features).

**DONE quando:**
- [ ] `docs/security-audit-2026-05.md` existe com findings priorizados
- [ ] Output completo de `get_advisors` (security + performance) anexado ao doc
- [ ] Tabela de RLS por table no doc
- [ ] Nenhum DDL aplicado (essa fase é só audit)

---

### Fase 2B — Rotação da `SUPABASE_ANON_KEY`

**Branch:** `chore/hardening-2b-key-rotation`
**Toca em:** `.env.local.example`, docs.
**⚠️ Requer ação manual do owner** — não dá pra agent fazer sozinho.

**Tasks:**

1. Criar `docs/key-rotation-runbook.md` com o passo a passo:
   ```markdown
   # Rotação da SUPABASE_ANON_KEY

   ## Passo a passo (owner executa)

   1. Acesse https://supabase.com/dashboard/project/zwmlhwwgbjmopuhxxooo/settings/api
   2. Clique "Generate new anon key" (mantém ambas válidas por X horas)
   3. Copie a nova key
   4. Cole no Vercel:
      - https://vercel.com/<seu-time>/toolmznet-novo/settings/environment-variables
      - Edite `NEXT_PUBLIC_SUPABASE_ANON_KEY` em Production, Preview, Development
   5. Cole no `.env.local` local
   6. Trigger redeploy no Vercel (aba Deployments → ⋯ → Redeploy)
   7. Confirma que app funciona em produção (login + listar fichas)
   8. Revoga a key antiga no Supabase dashboard

   ## Por que rotacionar

   A key atual foi configurada via Claude MCP — passou por logs, terminal, prompt history.
   Não há evidência de vazamento, mas higiene proativa.
   ```
2. Apresentar o runbook ao owner. Não execute nada sozinho.

**DONE quando:**
- [ ] `docs/key-rotation-runbook.md` existe
- [ ] Owner foi notificado e tem o runbook pra executar quando quiser

---

### Fase 2C — Gitleaks no CI

**Branch:** `chore/hardening-2c-gitleaks`
**Toca em:** `.github/workflows/`.
**Depende de:** nada (independente das outras).

**Tasks:**

1. Criar `.github/workflows/gitleaks.yml`:
   ```yaml
   name: gitleaks
   on:
     pull_request:
     push:
       branches: [main]
   jobs:
     scan:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
           with:
             fetch-depth: 0
         - uses: gitleaks/gitleaks-action@v2
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```
2. Rodar `gitleaks` local primeiro pra validar baseline:
   ```bash
   docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source="/path" -v
   ```
3. Se baseline tem findings (não devia ter, mas confere), criar `.gitleaks.toml` pra ignorar falsos positivos com comentário.
4. Commit + push.

**DONE quando:**
- [ ] `.github/workflows/gitleaks.yml` existe
- [ ] PR mostra gitleaks rodando e passando
- [ ] Baseline local sem findings (ou com `.gitleaks.toml` documentado)

---

### Fase 2D — CSP headers via `next.config.ts`

**Branch:** `chore/hardening-2d-csp`
**Toca em:** `next.config.ts`.

**Tasks:**

1. Ler `next.config.ts` atual.
2. Adicionar header CSP via `headers()`:
   ```ts
   async headers() {
     return [
       {
         source: '/(.*)',
         headers: [
           {
             key: 'Content-Security-Policy',
             value: [
               "default-src 'self'",
               "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
               "style-src 'self' 'unsafe-inline'",
               "img-src 'self' data: blob: https://*.supabase.co",
               "font-src 'self' data:",
               "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com",
               "frame-ancestors 'none'",
             ].join('; '),
           },
           { key: 'X-Frame-Options', value: 'DENY' },
           { key: 'X-Content-Type-Options', value: 'nosniff' },
           { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
           { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
         ],
       },
     ];
   }
   ```
3. **⚠️ Testar localmente primeiro:** `npm run dev` → abrir app → DevTools Console — qualquer violação CSP aparece em vermelho. Ajustar a policy até zerar.
4. Smoke obrigatório no owner antes de merge: login + upload de arquivo + drag&drop + modal de transferência.

**DONE quando:**
- [ ] `next.config.ts` retorna headers com CSP + os 4 headers complementares
- [ ] Smoke manual sem violações CSP no console (dev e production build)
- [ ] Owner aprovou via smoke

---

## 5. Fase 3 — Observabilidade

**Objetivo:** instalar telemetria proporcional ao tamanho atual da app (15 users, 1 serviço). Sentry + Vercel Analytics + uptime monitor. **NÃO subir Grafana/Prometheus agora** — overkill.

**Por que essa stack ao invés de Grafana:** Grafana/Prometheus brilham com 5+ serviços (microservices, workers, queues). toolmznet hoje é 1 Next.js + 1 Postgres gerenciado. Sentry resolve 90% dos casos com 10% do esforço. Migrar pra Grafana quando tiver >3 serviços (provavelmente quando subir o multi-agent server da Fase 4).

---

### Fase 3A — Sentry

**Branch:** `chore/hardening-3a-sentry`
**Toca em:** `src/`, raiz (configs), Vercel env vars.

**Tasks:**

1. Owner cria conta no Sentry (sentry.io), cria projeto Next.js.
2. Owner anota o DSN.
3. Agent roda o wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
4. Wizard cria: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `next.config.ts` wrapping.
5. Validar:
   - `sample_rate` em produção: `0.1` (10%) pra economizar cota.
   - `tracesSampleRate`: `0.1` em prod, `1.0` em dev.
   - `replaysSessionSampleRate`: `0` (não precisa de session replay agora).
6. Adicionar env vars no Vercel (owner faz):
   - `SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN` (pra source maps upload)
   - `SENTRY_ORG`, `SENTRY_PROJECT`
7. Testar: forçar um erro em dev (`throw new Error('test sentry')` num botão), verificar que aparece no dashboard.
8. Source maps em produção: garantir que o build do Vercel uploada (Sentry CLI roda automaticamente se env vars tão setados).

**DONE quando:**
- [ ] Sentry SDK instalado e configurado
- [ ] Erro de teste apareceu no dashboard
- [ ] Source maps uploadando no build de prod
- [ ] Sample rates configurados pra não estourar free tier

---

### Fase 3B — Vercel Analytics + Speed Insights

**Branch:** `chore/hardening-3b-vercel-analytics`
**Toca em:** `src/app/layout.tsx`.

**Tasks:**

1. Instalar:
   ```bash
   npm install @vercel/analytics @vercel/speed-insights
   ```
2. Adicionar em `src/app/layout.tsx`:
   ```tsx
   import { Analytics } from '@vercel/analytics/next';
   import { SpeedInsights } from '@vercel/speed-insights/next';

   // dentro do <body>
   <Analytics />
   <SpeedInsights />
   ```
3. Owner ativa Analytics e Speed Insights no dashboard Vercel (1 clique cada).
4. Deploy → esperar 24h → owner verifica dashboards.

**DONE quando:**
- [ ] Componentes montados no layout
- [ ] Owner confirmou que dashboards no Vercel populam dados

---

### Fase 3C — Uptime monitor + endpoint de health

**Branch:** `chore/hardening-3c-uptime`
**Toca em:** `src/app/api/health/route.ts` (novo).

**Tasks:**

1. Criar `src/app/api/health/route.ts`:
   ```ts
   import { createClient } from '@supabase/supabase-js';

   export const dynamic = 'force-dynamic';

   export async function GET() {
     const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
     const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
     if (!url || !key) {
       return Response.json({ ok: false, reason: 'missing_env' }, { status: 500 });
     }
     try {
       const supabase = createClient(url, key);
       // Lightweight ping — count com head=true não traz rows
       const { error } = await supabase
         .from('kanban_cards')
         .select('id', { count: 'exact', head: true })
         .limit(1);
       if (error) {
         return Response.json({ ok: false, reason: 'db_error', detail: error.message }, { status: 503 });
       }
       return Response.json({ ok: true, ts: new Date().toISOString() });
     } catch (e) {
       return Response.json({ ok: false, reason: 'exception', detail: String(e) }, { status: 503 });
     }
   }
   ```
2. Testar local: `curl http://localhost:3000/api/health` → `{"ok":true,...}`.
3. Owner cria conta em Better Stack (betterstack.com) ou UptimeRobot. Free tier.
4. Owner configura monitor: GET `https://<dominio>/api/health` a cada 5 min, alerta por email/Telegram se status != 200 OR `ok: false` por 2 checks consecutivos.

**DONE quando:**
- [ ] Endpoint responde 200 com `{ok: true}` em prod
- [ ] Endpoint responde 503 quando DB está down (testar setando env errado em dev)
- [ ] Owner configurou monitor externo
- [ ] Alert chegou no canal escolhido (testar derrubando endpoint)

---

## 6. Fase 4 — Multi-LLM agent server (escopo separado)

**⚠️ NÃO execute essa fase como agent automático.** Essa fase exige decisão de plataforma do owner.

Esta seção existe pra documentar o escopo, **não** pra ser executada por um agent sem nova sessão de planejamento com o owner.

### O que precisa ser decidido

| Pergunta | Opções |
|---|---|
| Onde hospedar? | Hetzner Cloud / Railway / Fly.io / Contabo |
| Como SSH compartilhado? | Tailscale SSH (zero-config) / chaves SSH manuais |
| Como isolar serviços? | Docker Compose / systemd / Kubernetes (overkill) |
| Como expor APIs publicamente? | Caddy (HTTPS auto) / Cloudflare Tunnel / Nginx |
| Como agents persistem estado? | Postgres no mesmo host / Redis / SQLite |
| Quais agents/MCPs subir primeiro? | <a definir com owner> |

### Recomendação atual do owner (em discussão)

Hetzner CX22 (€5/mês) + Docker Compose + Caddy + Tailscale.

### Próximo passo

Quando Fase 1+2 estiverem mergeadas, o owner abre nova sessão pra desenhar arquitetura dessa fase em detalhe.

---

## 7. Ordem sugerida de execução

Se rodando com **vários agents em paralelo**, essa é a ordem de dependência:

```
Wave 1 (paralelo, sem deps):
  - 1A (tooling setup)
  - 2A (RLS audit, só leitura)
  - 2C (gitleaks, só CI)
  - 2D (CSP, isolado em next.config.ts)
  - 3B (Vercel Analytics)
  - 3C (uptime + /api/health)

Wave 2 (depois de 1A mergeado):
  - 1B (no-unused-vars)
  - 1C (no-explicit-any)

Wave 3 (depois de 1B+1C mergeados, mais arriscado):
  - 1D (set-state-in-effect)
  - 1E (knip dead code)

Wave 4 (depois de 1B+1C+1D+1E mergeados):
  - 1F (format + CI gatekeeping com --max-warnings=0)

Wave 5 (depois de owner ter conta Sentry):
  - 3A (Sentry)

Wave 6 (manual, owner executa):
  - 2B (key rotation runbook)

Fase 4: nova sessão de planejamento.
```

---

## 8. Checklist final (owner usa pra fechar o hardening)

- [ ] Fase 1A mergeada — Husky/Prettier/lint-staged ativos
- [ ] Fase 1B mergeada — 0 `no-unused-vars`
- [ ] Fase 1C mergeada — 0 `no-explicit-any`
- [ ] Fase 1D mergeada — `set-state-in-effect` zerado ou justificado
- [ ] Fase 1E mergeada — knip relatório limpo
- [ ] Fase 1F mergeada — CI gatekeeping rodando, format aplicado
- [ ] Fase 2A mergeada — `docs/security-audit-2026-05.md` revisado, ações priorizadas
- [ ] Fase 2B executada — anon key rotacionada
- [ ] Fase 2C mergeada — gitleaks no CI
- [ ] Fase 2D mergeada — CSP aplicado
- [ ] Fase 3A mergeada — Sentry capturando erros prod
- [ ] Fase 3B mergeada — Vercel Analytics ligado
- [ ] Fase 3C mergeada — uptime monitor pingando
- [ ] Fase 4 — sessão de planejamento separada agendada

Quando todos checks acima fechados, **delete este arquivo** (`rm HARDENING_PLAN.md && git commit -m "chore: remove HARDENING_PLAN.md (concluído)"`). Tem `CLEANUP_AND_DOCS_PLAN.md` na raiz também — esse é trabalho separado, mantém.
