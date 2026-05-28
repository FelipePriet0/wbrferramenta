# CLAUDE.md — wbrferramenta-novo

Leia este arquivo inteiro antes de qualquer ação. Ele é o briefing completo do projeto.

## O que é este projeto

**wbrferramenta** é o sistema de gestão de fichas da **WBR** — provedor de internet em Patrocínio, MG.

É um clone do **toolmznet-novo** (sistema equivalente da MZnet, Uberlândia), compartilhando 100% da lógica de negócio, banco e features. As únicas diferenças são branding e credenciais.

---

## Relação com toolmznet-novo

| | toolmznet-novo | wbrferramenta-novo |
|--|---------------|-------------------|
| Caminho local | `/home/usuario/Documentos/toolmznet/toolmznet-novo` | `/home/usuario/Documentos/wbrferramenta/wbrferramenta-novo` |
| Supabase | `zwmlhwwgbjmopuhxxooo` (MZnet) | A definir (WBR — pendente) |
| Cor primária | `#018942` (verde) | `#0B42C6` (azul) |
| Cor secundária | — | `#FF6600` (laranja) |
| Logo | `public/mznet-logo.png` | `public/wbr-logo.png` |
| Remote git | `upstream` → toolmznet-novo | — |

**toolmznet-novo é a fonte da verdade.** Nunca desenvolver features novas aqui primeiro — sempre parte da toolmznet e depois sincroniza via `/wbr-sync`.

---

## Estado atual do projeto

### Código
- Sincronizado com o `main` do toolmznet em **2026-05-28** (commit `1c39c1b`)
- 80 arquivos sincronizados, branding WBR aplicado, paleta de cores trocada

### Banco (Supabase WBR)
- **PENDENTE** — projeto Supabase WBR ainda não foi criado
- Quando criado: rodar todas as migrations em `supabase/migrations/` do zero
- As migrations já estão na pasta, prontas para aplicar

### Deploy (Vercel)
- **PENDENTE** — aguarda banco criado

---

## Features incluídas (main do toolmznet)

| Feature | Status |
|---------|--------|
| Kanban Comercial + Análise | ✅ |
| Fichas PF e PJ (expanded) | ✅ |
| Pareceres / Composer | ✅ |
| Etiquetas | ✅ |
| Histórico + Revert | ✅ |
| Dashboard Métricas | ✅ |
| Realtime / Presence | ✅ |
| Auth + Segurança | ✅ |
| Field Audit Log | ✅ |

## Features NÃO incluídas (aguardar toolmznet mergear primeiro)

| Feature | Branch toolmznet | Motivo |
|---------|-----------------|--------|
| Builder | `feature/builder-agenda` | Não testado, não mergeado |
| Agenda | `feature/builder-agenda` | Não testado, não mergeado |

**Regra:** só sobe para wbrferramenta depois de estar no `main` do toolmznet.

---

## Branding WBR — regras de ouro

### Nunca sobrescrever no sync
| Arquivo | Motivo |
|---------|--------|
| `src/app/globals.css` | Paleta WBR (#0B42C6 / #FF6600) |
| `public/wbr-logo.png` | Logo WBR |
| `public/wbr-logo.svg` | Logo WBR |
| `.env.local` | Credenciais Supabase WBR |

### Substituições de texto que devem existir neste projeto
```
"WBR"           (não "Mznet")
"/wbr-logo.png" (não "/mznet-logo.png")
"wbrferramenta" (não "toolmznet")
"WBRFerramenta" (não "Toolmznet")
```

### Paleta de cores no globals.css
```css
--cor-primaria:   #0B42C6   /* azul WBR */
--cor-secundaria: #FF6600   /* laranja WBR */
--verde-primario: #0B42C6   /* mantém nome da variável, valor é azul */
```

---

## Como sincronizar com toolmznet

Use a skill `/wbr-sync`. Ela sabe exatamente:
- Qual é o último commit sincronizado
- Quais arquivos copiar (e quais nunca tocar)
- Em quais 6 arquivos re-aplicar o branding após copiar
- Quais migrations novas precisam ser rodadas no banco WBR

**Nunca fazer sync manual sem usar a skill** — risco de sobrescrever globals.css ou logo.

---

## Banco de dados — quando o Supabase WBR estiver criado

### Setup inicial (primeira vez)
1. Criar `.env.local` com as credenciais WBR
2. Rodar TODAS as migrations em ordem: `supabase/migrations/*.sql`
3. Configurar MCP `supabase-wbr` no settings.json global

### Migrations contínuas (após syncs)
- O `/wbr-sync` lista as migrations novas
- Rodar via MCP `supabase-wbr` — **nunca via `supabase-mznet-novo`**
- Sempre confirmar o banco alvo antes (hook de aviso já configurado globalmente)

### Proteção anti-banco-errado
Hook `PreToolUse` configurado em `~/.claude/settings.json`:
- Intercepta `apply_migration`, `execute_sql`, `reset_branch` em qualquer MCP Supabase
- Exibe `🔴 BANCO ALVO: <nome-do-mcp>` antes de executar
- Se aparecer `supabase-mznet-novo` quando estiver trabalhando aqui → PARAR

---

## MCP a usar neste projeto

| MCP | Para quê |
|-----|---------|
| `supabase-wbr` | Banco WBR — migrations, queries, logs |

**Nunca usar `supabase-mznet-novo` neste projeto.**

---

## Estrutura de pastas relevante

```
src/
  app/
    (app)/          → rotas autenticadas (kanban, fichas, métricas, histórico)
    (auth)/         → login
  features/         → lógica de cada feature
  services/         → toda comunicação com Supabase (nunca chamar direto da UI)
  components/       → componentes compartilhados
  lib/              → constants, utils, types
  hooks/            → hooks reutilizáveis
supabase/
  migrations/       → todas as migrations em ordem
public/
  wbr-logo.png      → logo WBR (placeholder — trocar pela logo real)
  wbr-logo.svg      → logo WBR SVG
```

---

## Próximos passos pendentes

1. **Você:** criar projeto Supabase WBR → passar URL + anon key
2. **Claude:** criar `.env.local` + configurar MCP `supabase-wbr`
3. **Claude:** rodar todas as migrations no banco WBR
4. **Você:** criar repositório GitHub para wbrferramenta
5. **Claude:** subir código no GitHub
6. **Você:** criar projeto Vercel + linkar GitHub → deploy
7. **Você:** criar primeiro usuário WBR no painel Supabase Auth
8. **Você/Claude:** substituir `public/wbr-logo.png` pela logo real da WBR
