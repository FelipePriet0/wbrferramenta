

Vou construir a SPEC na seguinte ordem: 

 - Login 
 - Sidebar 
 - Kanban 
 - Expanded Ficha 
 - Modal de Editar ficha (Pareceres, Anexos, Menções e Etiquertas)
 - HIstórico 


**Data:** 2026-05-08

**Pré-requisitos:** ponto 1 (banco) e ponto 2 (endpoints).

Esta spec descreve **o que cada feature é, quais regras respeita, e onde tem sequência crítica**. Formato pensado pra Agent Code construir o código do zero — não é narrativa, é contrato.
  

**Modelo por feature:**

- **O que é** — 1 frase.

- **Quem acessa** — roles permitidos.

- **UI** — componentes, layout, estados visuais.

- **Regras** — invariantes que o código deve respeitar.

- **Endpoints** — refs ao ponto 2.

- **Erros & loading** — o que a UI mostra quando dá ruim.

- **Edge cases** — comportamento não-óbvio.

- **Fluxo crítico** — só quando a ordem importa.

## A. Módulos ativos


## A1. Login -> Clerk

**O que é:** porta de entrada. Email + senha, sem self-signup.

Tabela RLS

**Quem acessa:** todos os 5 roles. Anônimo só vê esta tela.

**UI:** form centralizado: campo email, campo senha, botão "Entrar". Logo Mznet acima. Hero 3D opcional ao fundo (`anomalous-matter-hero.tsx`). Sem link "esqueci a senha" hoje.
  

**Regras:**

- Sessão guardada em `window.sessionStorage`. **Nunca** em `localStorage` — fechar a aba derruba o login (decisão por ser software financeiro).

- Sem self-signup. Conta é criada pelo gestor via Supabase Auth admin.

- Rate-limit é o nativo do Supabase Auth (não implementar nada custom).

- Após login bem-sucedido, redirecionar **por role**:

- `vendedor` → `/kanban`

- `analista` / `gestor` → `/kanban/analise`

- `instalador` → `/kanban/analise`

- `leitor` → `/kanban`

- Se já logado e visitar `/login`, redirecionar direto sem mostrar form.

  

**Endpoints:** `supabase.auth.signInWithPassword` (ponto 2 §2).

  

**Erros & loading:**

- Submit em loading: botão desabilitado + spinner inline.

- Erro genérico Supabase: mostrar mensagem amigável "Email ou senha inválidos".

- Network: "Sem conexão. Tente novamente."

  

**Edge cases:**

- `?from=expired` na URL → toast "Sessão expirou, faça login de novo".

- Se sessão de outro tab acabou de expirar (via `onAuthStateChange`), limpar form se já tinha.


------

## A2. Sidebar / shell de 

**O que é:** menu lateral persistente do app. Mostra os módulos disponíveis ao role logado.


**Tabela RLS/Quem acessa:** todos os autenticados.

**Regras — visibilidade de itens por role:**

|                       | vendedor | analista | gestor | instalador | Leitor |
| --------------------- | -------- | -------- | ------ | ---------- | ------ |
| Kanban                | ✅        | ✅        | ✅      | ✅          | ✅      |
| Histórico             | ✅        | ✅        | ✅      | ✅          | ✅      |
| Icon de user + Logout | ✅        | ✅        | ✅      | ✅          | ✅      |
**Endpoints:** `useAuth()` consome `auth.getUser` + `from('profiles').select('role')`.
  
**Erros:** se `profiles.role` é null/desconhecido, tratar como leitor por segurança.

**Edge cases:**

- Mudança de role em outro tab → propagar pra sidebar via realtime em `profiles`.

- Sidebar colapsada salva preferência em `localStorage` (essa key é a única exceção à regra do A1 — preferência visual, não auth).

  ----


## A3. Kanban (Comercial/Análise)

#### Kanban Comercial

O que é: board do funil comercial. Vendedor move cards desde "Entrada" até serem          
  promovidos pra Análise (em "Concluídas") ou arquivados em "Canceladas".                   

  Quem acessa:                                                                              
  - Vendedor / Analista / Gestor / Instalador: todas as ações da tela.                      
  - Leitor: apenas lê (sem drag, sem menu de ações, sem botão "Nova ficha", clique abre     
  modal em modo read-only).

  Rota: /kanban   
  Query do board: area='comercial' AND deleted_at IS NULL AND archived_at IS NULL, ORDER BY 
  created_at ASC. Agrupamento client-side por lower(stage).  

ayout da tela  

  ┌─ Topo ───────────────────────────────────────────────────────────┐
  │ [Filtros]                                                                                                                                             [+ Nova ficha]  |│ Colunar Kanban           
  │ [Entrada 🔵] [Feitas/MK 🟢] [Aguardando 🟡] [Canceladas 🔴] [Concluídas 🟣] │           
  └──────────────────────────────────────────────────────────────────┘              
  
**UI:**

- Cabeçalho com filtros: data range, responsável, busca (nome/CPF/CNPJ), status especiais.

- Colunas representam `stage` dentro de `area='comercial'` (ex.: entrada, trabalhando, feita, cancelada — confirmar nomes exatos com o produto).
- Cada card mostra: nome do cliente, CPF/CNPJ resumido, badge de tipo (PF/PJ), data, hora_at se houver, foto/iniciais do assignee, anexos count, comentários count.
- Dashboard com `dashboard_kanban_counts` no topo (feitas/aguardando/canceladas/concluídas/atrasadas).
- Drag-and-drop entre colunas (dnd-kit).
- Clique no card abre o expanded (A7) ou modal compacto (decidir no design).
- Botão "+ Nova ficha PF" e "+ Nova ficha PJ" abre A3/A4.


## Ações principais da tela

### Botão “Filtros” >> ESSE É O FILTRO DE A.4

Localizado no topo esquerdo da área principal.

Visual:

- botão cinza claro;
- ícone de filtro;
- texto: **Filtros**.

Função esperada:

- abrir painel/modal/dropdown de filtros;
- permitir refinar fichas por status, data, responsável ou outros critérios definidos na SPEC.

### Botão “Nova ficha”

Localizado no topo direito da área principal.

Visual:

- botão verde;
- ícone de “+”;
- texto: **Nova ficha**.

Função esperada:

- abrir o fluxo de criação de nova ficha;
- provavelmente permitir escolher entre Cadastro PF e Cadastro PJ;
- iniciar o modal de cadastro básico.

### Visual do card (KanbanCard)
 
  Conteúdo (sempre que disponível): 
  
  - Nome do cliente (negrito)                                                               
  - CPF/CNPJ (cinza)                                                                        
  - Telefone (ícone Phone)
  - WhatsApp (ícone /whatsapp.svg) + número                                                 
  - Bairro (ícone MapPin) — vem de applicants.bairro
  - Hora (ícone Clock) — vem de kanban_cards.hora_at[0]                                     
  - Data de agendamento (ícone Calendar) — vem de kanban_cards.due_at, formatada dd/mm/yyyy 
  local                                                                                     

  4 estados visuais:

  ┌───────────────────────────────┬────────────────┬────────────┬────────────────────┐
  │            Estado             │     Borda      │   Fundo    │    Ícone extra     │      
  ├───────────────────────────────┼────────────────┼────────────┼────────────────────┤
  │ Padrão                        │ emerald-100/40 │ bg-white   │ —                  │
  ├───────────────────────────────┼────────────────┼────────────┼────────────────────┤
  │ Mencionado (isMentioned=true) │ emerald-300    │ emerald-50 │ @ verde (AtSign)   │      
  ├───────────────────────────────┼────────────────┼────────────┼────────────────────┤      
  │ Atrasado (dueAt < now())      │ orange-300     │ orange-50  │ 🔥 laranja (Flame) │      
  ├───────────────────────────────┼────────────────┼────────────┼────────────────────┤      
  │ Mencionado + Atrasado         │ orange-300     │ emerald-50 │ ambos              │
  └───────────────────────────────┴────────────────┴────────────┴────────────────────┘      
   
  ▎ isMentioned vem de services.inbox.list() filtrando notificações tipo mention ou         
  ▎ parecer_reply pro usuário corrente — IDs dos cards entram num Set e o flag é setado ao 
  ▎ montar a lista.                                                                         
  
  Ações:
  - Clique no card → abre <EditarFichaModal> (modo compacto) com cardId + applicantId.
  - Menu "..." (MoreVertical) → popover com uma única opção: "Mover…" → abre <MoveModal>    
  (alternativa ao drag, lista todas as colunas válidas).                                

  Drag (dnd-kit): 
  - Ativação por distância (8px) — clique curto não dispara drag.                           
  - opacity:0 no card original durante o drag (DragOverlay mostra o preview).               
  - Sensor desabilitado se readOnly=true.    



Colunas do Kanban


Ordem visual fixa esquerda → direita: Entrada → Feitas → Aguardando → Canceladas → Concluídas.                                                                              

A tela possui cinco colunas principais.

Cada coluna tem:

- cabeçalho verde escuro;
- ponto colorido indicando tipo/status;
- nome da coluna;
- contador em badge branco;
- área interna para cards;
- estado vazio quando não há fichas.


###1. Entrada


Indicador visual: ponto azul.

Contador visível no canto superior da coluna: 

```
0
```

Estado vazio:

```
Nenhuma ficha
Arraste fichas aqui
```

Função esperada:

- receber novas fichas que chegaram via AP;
- Essa coluna não é usada diretamente pelos colaboradores, ou seja, ninguém move nada para dentro dela. 
  
  Para que serve?? 
  
  Receberá as fichas/cadastros on-line que LEADS fazem através de nossos sites, ali será o lugar de chegada/unificação dessas informações, onde ao chegar, o vendedor coletará e preencherá o cadastro completo do mesmo. 
  
  Portanto, não tem nenhum trigger com o Software ainda, pé apenas uma coluna de recebimento futuro desses cadastros. 
  
    - Cards entram aqui apenas via criar_ficha_pf_atomic / criar_ficha_pj_atomic.
    - UI: drop em entrada → alert("Entrada não recebe cards.") e não chama RPC.             
    - Banco: se p_stage='entrada' AND stage_atual != 'entrada' → raise 'invalid_stage'.
      
      
### 2. Feitas / Cadastrar no MK

Indicador visual: ponto verde.

Contador visível no canto superior direito da coluna: 

```
0
```

Função esperada:

- Atualmente: cards entram aqui via criação manual pelo vendedor via "+ Nova ficha").  

Triggers de entrada: drag direto desde Entrada / Aguardando / Concluídas (rollback) /     
  Canceladas (reabertura). Sem modal.
Triggers de saída: drag pra Aguardando (falta doc), Concluídas (pronto) ou Canceladas     
  (desistência).                     
  


  3. Aguardando documentos — aguardando 🟡 (amber #F59E0B)                                  
   
  Função: ficha está no MK mas faltam documentos do cliente (RG, comprovante, etc.) —       
  vendedor aguarda envio.


Triggers de entrada: drag and drop de ida e volta de qualquer coluna
 Triggers de saída:  Drang and drop para qualquer coluna

 Side effects da RPC: mesmo do feitas — UPDATE simples.      


4. Canceladas — canceladas 🔴 (vermelho #EF4444) 

 Função: ficha cancelada por motivo registrado (cliente desistiu, divergência de dados,    
  fraude, etc.).

Triggers de entrada — REGRA ESPECIAL:              
  
  - UI: drop em canceladas não chama changeStage direto. Em vez disso, abre <CancelModal>
  que coleta motivo obrigatório.       

 Resultado visível: card desaparece do Comercial e  vai para HIstórico com Motivo junto

Revversão: CTA RESTAURAR FICHA -> Abre modal de Explicação (Porque você está restaurando essa ficha) -> Sobe ela para Kanban Comercial novamente, na coluna: Feitas / Cadastrar no MK

 5. Concluídas — concluidas 🟣 (roxo #8B5CF6)                                              
   
  Função: cadastro pronto no MK, ficha pode ir pra Análise de crédito.                      

  Triggers de entrada — REGRA ESPECIAL (promoção pra Análise):                              
  - UI: drag direto, sem modal.
  - Banco: change_stage com p_area='comercial' AND p_stage='concluidas':                    
    - area := 'analise' ← card sai do board Comercial.                  
    - stage := 'recebidos' ← renomeia o stage (não fica 'concluidas' em lugar nenhum!).     
    - received_at := COALESCE(received_at, now()) (idempotente — preserva primeira vez).
    - assignee_id := null (libera pra qualquer analista pegar).                             

  Resultado visível: card desaparece do Comercial e aparece em Análise/Recebidos, sem       
  analista atribuído.                                                                       



Query do board: area='comercial' AND deleted_at IS NULL AND archived_at IS NULL, ordenado 
  por created_at ASC. Agrupamento client-side por lower(stage).

  Regras de transição (TODAS centralizadas na RPC change_stage(card_id, area, stage,        
  reason?) — backend é source of truth, UI só dispara):
    
  1. entrada — write-only por criação.                                                      
    - Cards entram aqui apenas via criar_ficha_pf_atomic / criar_ficha_pj_atomic.
    - UI: drop em entrada → alert("Entrada não recebe cards.") e não chama RPC.             
    - Banco: se p_stage='entrada' AND stage_atual != 'entrada' → raise 'invalid_stage'.     
  2. Drop em canceladas — abre modal de motivo antes da RPC.                                
    - UI: setCancel({id, area:'comercial'}) → renderiza <CancelModal> que coleta motivo.    
    - RPC: p_reason vazio/trim='' → raise 'reason_required'.                                
    - Side effects no card:                                                                 
        - area := 'analise' (sai do board Comercial)                                        
      - stage := 'canceladas'                                                               
      - cancel_reason := p_reason
      - cancelled_at := now()                                                               
      - cancelled_by := auth.uid()
  3. Drop em concluidas — PROMOÇÃO automática pra Análise.                                  
    - UI: drag direto, sem modal.
    - RPC detecta p_area='comercial' AND p_stage='concluidas' e faz:                        
        - area := 'analise'
      - stage := 'recebidos' (vai pra coluna Recebidos do Kanban Análise)                   
      - received_at := coalesce(received_at, now()) (idempotente)
      - assignee_id := null (limpa quem pegava antes)                                       
    - Resultado visível: card some do Comercial e aparece em Análise/Recebidos.             
  4. Drop em feitas / aguardando — transição simples.                                       
    - UI: drag direto.                                                                      
    - RPC: cai no fallback — apenas UPDATE area, stage, updated_at. Sem efeitos extras. Card
   permanece em area='comercial'.                                                           
  
  Invariantes da RPC (toda transição):                                                      
  - Lock: SELECT ... FOR UPDATE no card antes de atualizar (atomicidade).
  - Permissão: can_user_manage_card(p_card_id) → false ⇒ raise 'not_allowed'.               
  - Notificação: ao final, sempre chama notify_card_move(row, old_area, old_stage, new_area,
   new_stage) — dispara inbox_notifications apropriadas.                                    
  - SECURITY DEFINER + SET search_path = 'public'.                                          

  UI (dnd-kit) — handler único:                                                             
  onDragEnd({active, over}):                                                                
    if (!over || readOnly) return
    target = over.id                                                                        
    if (target === 'entrada') → alert; return
    if (target === 'canceladas') → openCancelModal(active.id); return                       
    await changeStage(active.id, 'comercial', target)  // RPC                               
    await reload()                                           

  Não fazer (anti-padrões):                                                                 
  - Não usar .from('kanban_cards').update({stage}) direto pra promoção — só change_stage RPC
   sabe ajustar area, received_at, assignee_id, etc.                                        
  - Não filtrar archived_at apenas no front — incluir no select (cards arquivados nunca
  aparecem no board).                                                                       
  - Não chamar change_stage com p_stage='canceladas' sem p_reason.       
    
    

Quero que você me ajude a organizar essa Spec e deixar claro o que cada (Card do dashboard superior faz e como ele conta, Todos triggers das colunas, sem faltar nada.)

Anti-padrões (NÃO fazer)
 
  1. ❌ Não usar supabase.from('kanban_cards').update({stage}) direto. Sempre via
  services.kanban.changeStage → RPC. UPDATE direto perde os side effects (area, received_at,
   assignee_id, cancel_reason, etc.) e não dispara notify_card_move.
  2. ❌ Não filtrar archived_at IS NULL só no client — incluir no select do banco (cards    
  arquivados não devem nem chegar ao front).                                                
  3. ❌ Não chamar change_stage com p_stage='canceladas' sem p_reason — o banco rejeita.
  4. ❌ Não fazer 2ª query pra contar KPI bar — calcular client-side a partir dos cards já  
  carregados (espelhando a fórmula da RPC).                                                 
  5. ❌ Não assumir que a coluna "Concluídas" exibe muitos cards — depois da promoção stage 
  vira recebidos em area='analise', então a Concluídas tende a ficar sempre vazia.          

  ---                                                                                       
  Estado readOnly (leitor)
  
  - useDraggable({ disabled: true }) em todos os cards.
  - Sem botão "Nova ficha".                                                                 
  - Sem menu "..." em cards.                                                                
  - <MoveModal> e <CancelModal> não montam.
  - Estado vazio das colunas oculta a linha "Arraste fichas aqui".                          
  - Clique no card abre <EditarFichaModal> em modo read-only (campos readOnly).      


**Regras:**

- Vendedor **não pode** mover pra/de stage `entrada` (RLS bloqueia, UI deve refletir).

- Drag-drop é otimista: aplicar mudança no state local antes da RPC; se falhar, reverter e mostrar toast.

- Filtros e ordenação ficam em URL (querystring) pra serem compartilháveis.

  

**Endpoints:** `change_stage`, `dashboard_kanban_counts`, REST `from('kanban_cards')` (ponto 2 §3.2).

  

**Realtime:** subscribe em `rt-kanban-cards` (ponto 2 §5).

  

**Erros & loading:**

- Loading inicial do board: skeleton de colunas.

- Erro de drag: reverter posição + toast "Não foi possível mover".

- Sem cards: empty state ilustrado por coluna.

  

**Edge cases:**

- Realtime trazendo mudança de outro usuário enquanto você arrasta um card: aguardar o drag terminar antes de aplicar.

- `hora_at` é array `time[]` (slots) — mostrar só o primeiro/último ou "N slots".
  

**Fluxo crítico — drag entre colunas:**

1. `onDragStart` → snapshot da posição original do card.

2. `onDragOver` → preview otimista do drop.

3. `onDragEnd` → aplica no state local imediatamente (otimismo).

4. Chama `change_stage(cardId, newArea, newStage, reason?)`.

5. Em sucesso: realtime confirma (idempotente — ignorar evento se já aplicado).

6. Em erro: reverter pra snapshot + toast.


### Kanban Análise

 O que é: board da análise de crédito. Analista pega card promovido do Comercial, lê ficha 
  completa, emite parecer e decide (aprovado / negado / reanálise). Após assinatura do app, 
  finaliza e o card auto-arquiva pro Histórico.

  Quem acessa:                                                                              
  - Analista / Gestor: todas as ações (ingressar, decidir, finalizar, mover).
  - Instalador: mover entre colunas (exceto ingressar recebidos→em_analise, que é bloqueado 
  pelo banco).                                                                             
  - Vendedor: lê, abre ficha, edita dados do applicant; não ingressa nem decide.            
  - Leitor: read-only (sem drag, sem botões, sem nada de "Nova ficha").         

  Rota: /kanban/analise                                                                     
  Query do board: area='analise' AND deleted_at IS NULL AND archived_at IS NULL, ORDER BY   
  created_at ASC. Agrupamento client-side por lower(stage).                                 
  Realtime: subscribe em kanban_cards com filter: area=eq.analise, recarrega o board a cada
  evento.                                                                                   
  Tick: setInterval(1000ms) atualiza nowTick no estado — alimenta countdowns visuais dos
  finalizados.                                                                              


Layout da tela  

Layout da tela  

  ┌─ Topo ─────────────────────────────────────────────────────────────────────────────┐
  │ [Filtros]                                                                                                                                                [+ Nova ficha]   │     
  ├─ Board (8 colunas, scroll horizontal) ─────────────────────────────────────────────┤    
  │ [Recebidos 🔵] [Preenchidas🟢]  [Em Análise 🟠] [Reanálise 🟡] [Aprovados 🟢] [Negados 🔴]  
  │  [Finalizados 🟣] [Canceladas 🔴]                                       │   
  └────────────────────────────────────────────────────────────



## Ações principais da tela

Botão "Filtros" topo esquerda)-> Idêntico ao do Comercial

Botão "Nova ficha" (topo direita)

Idêntico ao Comercial

Visual do card

  Idêntico ao A5 Comercial (mesmos 4 estados: padrão, mencionado, atrasado, ambos). Mesmo
  conteúdo (nome, CPF, telefone, whatsapp, bairro, hora, data). Mesmo menu "..." com opção  
  "Mover…".

  Diferenças exclusivas da Análise:
  - Cards em recebidos ganham extraAction = botão Ingressar.
  - Clique no card abre <EditarFichaModal> (mesmo comportamento) — porém em Análise é onde o usuário usa o composer de parecer (A8) e decide.  

Visual da coluna                                                                          

  Idêntico ao A5. 8 colunas com larguras fixas + scroll horizontal. Drop indicator ring-2 
  ring-emerald-400 ao passar drag por cima.      


Colunas e seus triggers (8)

  Ordem visual fixa esquerda → direita: Recebidos → Preenchidas -> Em Análise → Reanálise → Aprovados → Negados  → Finalizados → Canceladas.     
  
Duas RPCs orquestram as transições:                                    

  ▎ - change_stage(card_id, area, stage, reason?) — drag entre colunas.
  ▎ - set_card_decision(card_id, decision) — disparada pelo composer de parecer (A8) com    
  ▎ slash command /aprovado, /negado ou /reanalise. Move o card pra coluna correspondente   
  ▎ automaticamente.    
  
   1. Recebidos — recebidos 🔵 (azul #3B82F6)                                                
  
  Função: fila de entrada. Cards promovidos do Comercial (Concluídas) chegam aqui sem       
  analista atribuído.

  Triggers de entrada:                                                                      
  - Promoção automática desde comercial/concluidas via change_stage — seta area='analise',
  stage='recebidos', received_at=coalesce(received_at, now()), assignee_id=null.            
  - Drag manual de outras colunas (raro, mas permitido).                        

  Triggers de saída:
  - Botão Ingressar OU drag para Em Análise → change_stage com regra especial (próxima      
  coluna).                                                                                  
  - Drag pra outras colunas → change_stage fallback (só UPDATE simples).   


Botão "Ingressar" (extraAction nos cards de Recebidos)                                    
  
  Visual: chip verde pequeno embaixo do card, texto "Ingressar".                            

  Função:             
  
 - Atribui Analista e envia card para coluna -> Preenchidas
  - RPC valida: user_has_role(['analista','gestor']) → senão raise 'not_allowed'.
  - Side effects no banco: stage='preenchidas', assignee_id=auth.uid(), updated_at=now().    
  - Resultado visível: card pula de Recebidos pra preenchidas com o ingressante como         
  responsável.                                                                              

  Oculto se readOnly=true.                               


2.  Preenchidas🟢 

Função: analista está trabalhando no card. Tem responsável definido (assignee_id).     

 Triggers de entrada — REGRA ESPECIAL (ingresso):                                          
  - UI: dispara via botão "Ingressar" OU dragde qualquer coluna
 Triggers de saída:
-  Composer de parecer (A8) com /aprovado / /negado / /reanalise → set_card_decision move  
  automaticamente pra coluna correspondente.                                                
  - Drag manual pra outra coluna.  


3. Em Análise — em_analise 🟠 (orange #F97316)    

Função: Organização/VIsual (Coluna normal SEM disparo / TRigger automatico)

  Triggers de entrada 
  
   - Drag and drop manual dos colaboradores


 Triggers de saída: 
 
 - Drag and drop manual dos colaboradores 
- Composer de parecer (A8) com /aprovado / /negado / /reanalise → set_card_decision move  
  automaticamente pra coluna correspondente.


 4. Reanálise — reanalise 🟡 (amber #F59E0B)

  Função: card precisa de revisão (informação adicional, segunda opinião). 

Triggers de entrada:

- Composer com /reanalise → set_card_decision('reanalise'):
    - stage := 'reanalise', area := 'analise'.                                              
    - decision_status := 'reanalise', decision_at := now(), decision_by := auth.uid().
  - Drag manual desde qualquer coluna (fallback simples).                               

  Triggers de saída:                                                                        
  - Mesma regra de ingresso: drag pra em_analise exige analista/gestor e atribui            
  assignee_id.           
  - Ou composer para /aprovado OU /Negado em um parecer novo (Resposta/Reply OU edição do mesmo) -> Atualizou o Composer, chama o Trigger novamente


5. Aprovados — aprovados 🟢 (green #10B981)              

Função: decisão tomada. Card está aprovado

Função: decisão tomada. Card está aprovado, aguarda passar pra Ass App.                   
   
  Triggers de entrada:                                                                      
  - Composer com /aprovado → set_card_decision('aprovado'):
    - stage := 'aprovados', area := 'analise'.                                              
    - decision_status := 'aprovado', decision_at := now(), decision_by := auth.uid().
  - Drag manual (fallback simples — não atualiza decision_status!).    
    
 Triggers de saída: 
 
 - Drag manual pra qualquer coluna 
- OU composer  para /Reanalise OU /Negado em um parecer novo (Resposta/Reply OU edição do mesmo) -> Atualizou o Composer, chama o Trigger novamente

 5. Negados — negados 🔴 (red #EF4444)                                                     
  
  Idêntico a Aprovados, mas com decision='negado' → stage='negados',                        
  decision_status='negado'.


 7. Finalizados — finalizados 🟣 (purple #8B5CF6)                                          

  Função: card encerrado. Vai sair do board em ~60s (auto-archive) para Histórico

 Triggers de entrada — REGRA ESPECIAL (registra decisão final):                     
        
  - Drag direto pra Finalizados.
  - Banco: change_stage com p_stage='finalizados':                                          
    - final_decision := v_old_stage ← grava o nome do stage anterior ('aprovados',
  'negados', 'ass_app', etc.). É a "decisão registrada" do card.                            
    - finalized_by := auth.uid()                    

      Triggers de saída — auto-archive:
  - Loop client-side a cada 20s chama services.kanban.autoArchiveFinalizados(ttlSec):
    - UPDATE kanban_cards SET archived_at = now() WHERE stage='finalizados' AND archived_at 
  IS NULL AND finalized_at < now() - ttlSec * 1s.                                           
    - ttlSec padrão = 60, configurável via NEXT_PUBLIC_FINALIZADOS_TTL_SEC.   

 8. Canceladas — canceladas 🔴 (red #EF4444)

  Idêntica à coluna Canceladas do A5 Comercial (mesmo <CancelModal>, mesma RPC, mesmas      
  regras):
  - UI abre <CancelModal> que coleta motivo obrigatório.  Passando pela confirmação envia para HIstórico

Edge cases:**

- Card pode mudar de decisão (analista pode aprovar e depois mudar pra negado antes de arquivar) — manter histórico no parecer (cada `set_card_decision` deixa rastro em `decision_at`/`decision_by`, mas só o último valor fica em `decision_status`).


------------------------

A4. FIltros: 

  O que é: barra de filtros compartilhada pelo Kanban Comercial (area='comercial') e Kanban 
  Análise (area='analise'). Mesmo componente, mesmo conjunto de filtros, mesma sincronização
   com URL — só muda quem é o consumidor (KanbanPageClient vs KanbanAnalisePageClient) que  
  aplica os filtros na query do banco.     
  
  
   - Buscar                        ->  texto livre                                                            
   - Responsável            -> UUIDs separados por vírgula                                                          
   - Menções                    ->  "1" quando ativo                                   
   - Horário                       -> HH:MM (5 chars)                                                   
   - Selecionar Período  -> ISO date de início  / ISO date de fim (opcional)  (Calendário no React Puro e com Range Ativo)

 Botão "Filtros" (entrada)

  Visual:
  - Variant secondary, altura h-9, rounded-[10px], padding-x: 18px.
  - Ícone ListFilter (lucide).                                                              
  - Texto "Filtros" só aparece quando não há filtros ativos. Com filtros, o botão fica
  compacto (w-9, só ícone).                                                                 
  - Filtros ativos viram chips à esquerda do botão.                                         

  Popover (largura 200px, side="right", align="start", sideOffset=12):                      
  - Lista vertical de opções com <Command> (cmdk) + busca interna.                          
  - Itens mostrados em ordem:                                                               
    a. Buscar (ícone Search)                                                                                                                            
    c. Responsável (ícone UserCircle)                                                       
    d. Horário (ícone Clock)                                                                
    e. Minhas menções (ícone AtSign — toggle inline, não abre submenu)                      
    f. Selecionar período / Fechar calendário (ícone Calendar — toggle do calendar lateral)

  ▎ O FilterType.PRAZO está oculto do menu inicial — só é setado via o item "Selecionar     
  ▎ período" que abre o calendar lateral. Não confundir.                      
  
  Animação de altura ao trocar de view: <AnimateChangeInHeight> (framer-motion).     
  
  1. Buscar (FilterType.BUSCAR)
       
  Fluxo:
  2. Clique em "Buscar" → tela secundária do popover com input.                             
  3. Input com searchDraft local.                              
  4. Debounce de 350ms ao digitar — só depois aplica o filtro.                              
  5. Enter fecha o popover; Escape volta pra lista de filtros.

  Operator: INCLUDE.                                                                        
  Visual quando ativo: chip "Buscar: " entre os filtros aplicados.                          

  Aplicação no banco (services.kanban.listCards):                                           
  - Escapa caracteres especiais (%, _, \) via escapeIlikePattern.                           
  - Roda OR no PostgREST contra applicants (relação 1:1 com card):                          
    - applicants.primary_name ILIKE '%termo%'                     
    - applicants.cpf_cnpj ILIKE '%termo%'                                                   
  - Case-insensitive, com unaccent no banco (via índice GIN idx_applicants_name_trgm).
 
  ---                                                                                       
  2. Responsável (FilterType.RESPONSAVEL)                                                   
    
  Fluxo:          
  3. Clique em "Responsável" → lista de profiles com avatar (cor por seed do nome) + nome +
  role.                                                                                     
  4. Multi-select: cada clique adiciona o UUID ao array do filtro.
  5. Clique no chip de um responsável já adicionado o remove (controle do componente        
  <Filters>).                                                                               

  Operator: IS.                                                                             

  Carregamento:   
  - Cache em sessionStorage (key: responsavel-options-all) — sobrevive a navegações na mesma
   aba.                                                                                     
  - Query inicial: from('profiles').select('id,full_name,role').in('role',['vendedor','anali
  sta','gestor']).order('full_name').                                                       
  - Note: o filtro lista os mesmos profiles independente da area (Comercial ou Análise).    
  Decisão pendente: filtrar por area (vendedores só no Comercial, analistas só na Análise)?

  Aplicação no banco:
  - kanban_cards.assignee_id IN (uuid1, uuid2, ...).                                        
  - No Kanban Análise, assignee_id é setado pelo "Ingressar" (analista que pegou). No       
  Comercial, é o vendedor responsável.

  ---             
  3. Menções (myMentions — fora do enum)                                                    

  ▎ Filtro especial. Não está em FilterType. É um boolean separado.

  Fluxo:          
  4. Clique em "Minhas menções" no popover → toggle myMentions = !myMentions.               
  5. Quando ativo:                                                                          
    - Chip especial à esquerda da lista de filtros: ícone @ + texto "Minhas menções" + botão
   X (cor var(--color-primary) verde, com border integrado).                                
    - URL ganha ?minhas_mencoes=1.                                                          
  6. Clique no X do chip → desativa.

  Ativável externamente via URL: ao clicar numa notificação da Inbox (A13), o link_url pode
  incluir ?minhas_mencoes=1 pra abrir o board já filtrado nos cards onde o usuário foi      
  mencionado.     

  Aplicação (em KanbanPageClient, NÃO em services.kanban.listCards):                        
  7. Quando myMentions=true, chama services.inbox.listMyMentionCardIds() (RPC
  list_my_mention_cards) que retorna SETOF uuid dos cards onde o usuário foi mencionado.    
  8. Cria um Set allowedCardIds.                                                        
  9. Após carregar os cards via listCards, filtra localmente: cards.filter(c =>             
  allowedCardIds.has(c.id)).                                                    

  ▎ Diferente dos outros 4 filtros, este não vira parte da query Supabase do board — é uma 
  ▎ intersecção feita no front entre 2 fontes (cards do kanban + IDs da inbox).             

  ---                                                                                       
  10. Horário (FilterType.HORARIO)
  Fluxo:
  11. Clique em "Horário" → lista de 4 opções fixas:                                         
    - 08:30                                        
    - 10:30
    - 13:30
    - 15:30                                                                                 
  12. Single-select (clicar em outro horário substitui o anterior).

  Operator: IS.                                                                             
   
  Aplicação no banco:                                                                       
  - kanban_cards.hora_at é time[] (array de horários).
  - Filtro usa operador contains do PostgREST: hora_at @> '{08:30}'.                        
  - Como o tipo time aceita múltiplas representações, o filtro testa variantes:
    - 08:30                                                                                 
    - 08:30:00                                                                              
    - 08:30:00+00
  - Quando há mais de uma variante, monta cláusula OR: hora_at.cs.{08:30},                  
  hora_at.cs.{08:30:00}, ....                                              

  ▎ ⚠ A lista fixa de 4 horários reflete os slots de instalação do Mznet. Se os slots 
  ▎ mudarem, atualizar o enum Horario em components/ui/filters.tsx.                         
                  
  ---                                                                                       
  5. Selecionar Período (FilterType.PRAZO)

  Fluxo:
  6. Clique em "Selecionar período" no popover não fecha o popover — abre um segundo painel
  lateral com <KanbanRangeCalendar> à direita.                                              
  7. Posicionamento do calendar é position: fixed ancorado em popoverRect.right + 16px.
  Atualiza em scroll/resize/animação via ResizeObserver + requestAnimationFrame.            
  8. Calendar permite selecionar 1 dia (filtro pontual) ou range (start + end).             
  9. Se end < start, valores são reordenados automaticamente.                  
  10. Item do popover muda pra "Fechar calendário" enquanto aberto.                          

  Operator: IS.                                                                             
  
  Aplicação no banco:                                                                       
  - Converte start pra startOfDayUtcISO() e end pra endOfDayUtcISO() (timezone
  America/Sao_Paulo).                                                                       
  - Query: kanban_cards.due_at >= startUtc AND due_at <= endUtc.
  - Quando só start está setado, filtra apenas esse dia.                                    

  ---                                                                                       
  Como os 5 filtros chegam ao banco                                                         

  A <FilterCTA> não consulta o banco sozinha — ela emite onFiltersChange(applied). O
  KanbanPageClient recebe o objeto e passa pra services.kanban.listCards(area, opts):       
   
  listCards('comercial', {                                                                  
    hora: applied.hora,
    dateStart: applied.prazo?.start,
    dateEnd: applied.prazo?.end,                                                            
    responsaveis: applied.responsaveis,
    searchTerm: applied.searchTerm,                                                         
  })              

  O filtro Menções vai por fora — KanbanPageClient aplica como pós-filtro local (descrito no
   §3).                                                                                     

  ---             
  Loading / refetch behavior

  - Buscar: debounce 350ms no input → setFilters → useEffect que persiste URL e dispara
  onFiltersChange.                                                                          
  - Outros 4 filtros: aplicados imediatamente ao toggle/select.
  - onFiltersChange é chamado a cada mudança (não tem batching). Cada chamada do consumer   
  (KanbanPageClient) faz novo listCards.                                                    
  - Realtime do board (subscribe em kanban_cards) continua ativo durante mudança de filtros 
  — quando o banco muda, recarrega usando os filtros atuais.                                

  ---                                                                                       
  Visual do chip de filtro aplicado

  Renderizado por <Filters> (components/ui/filters.tsx):
  - Tipo (com ícone) → operator → valor(es).                                                
  - Múltiplos valores aparecem como "X, Y, Z" ou avatars empilhados (caso Responsável).     
  - Botão X em cada chip remove aquele filtro.                                         

  ▎ O chip Minhas menções é renderizado fora do <Filters> (manual, em <FilterCTA>), com     
  ▎ estilo próprio usando var(--color-primary).             

-------------------

A4.1 Chips Estilizantes dos Filtros

Todos os filtros aplicados aparecem como chips coloridos à esquerda do botão "Filtros".   
  Mesmo estilo base, com variações sutis por tipo. Renderizados pelo componente <Filters> em
   components/ui/filters.tsx.                                                               

  ---                                                                                       
  Anatomia universal do chip (3 partes clicáveis)

  ┌──────────────────────────────────────────────┐
  │ [🔍 Buscar]  [“Maria Silva”]  [✕]            │                                          
  │  ↑label fixo  ↑gatilho do valor   ↑remover   │
  └──────────────────────────────────────────────┘                                          
 
  Container externo                                                                         

  inline-flex items-center gap-2 rounded-none px-3 py-1 text-white shadow-sm text-xs
  background-color: var(--color-primary)        /* verde Mznet */                           
  border: 1px solid var(--color-primary)

  - Cantos retos (rounded-none), não arredondado — destaque visual contra a UI geral que é  
  toda arredondada.                                                                         
  - Texto branco.                                                                           
  - text-xs (12px) — chip compacto.
  - Sombra shadow-sm discreta.                                                              

  Cor                                                                                       

  Todos os chips usam a MESMA cor (--color-primary verde Mznet). A diferenciação visual     
  entre tipos vem só do ícone, não da cor. Inclusive o chip especial "Minhas menções" usa o
  mesmo verde.                                                                              
  
  ▎ ⚠ Não fazer: colorir chips por tipo (não há cor diferente por filtro hoje). Se for mudar
  ▎  isso no novo, é decisão de produto.

  ---             
  Estrutura interna (3 zonas)

  Zona 1 — Label fixo (esquerda)

  <FilterIcon type={filter.type} />
  <span className="font-semibold">{filter.type}</span>                                      
   
  Mostra ícone do tipo + nome do tipo em negrito. Não é clicável (apenas decorativo).       
 
  ┌────────────────┬────────────────┬──────────────────┐                                    
  │     Filtro     │ Ícone (lucide) │      Label       │
  ├────────────────┼────────────────┼──────────────────┤
  │ Buscar         │ Search         │ "Buscar"         │
  ├────────────────┼────────────────┼──────────────────┤
  │ Responsável    │ UserCircle     │ "Responsável"    │                                    
  ├────────────────┼────────────────┼──────────────────┤
  │ Prazo          │ Calendar       │ "Prazo"          │                                    
  ├────────────────┼────────────────┼──────────────────┤
  │ Horário        │ Clock          │ "Horário"        │
  ├────────────────┼────────────────┼──────────────────┤                                    
  │ Minhas menções │ AtSign         │ "Minhas menções" │
  └────────────────┴────────────────┴──────────────────┘                                    

  Zona 2 — Gatilho do valor (centro, clicável)                                              
   
  <PopoverTrigger> com estilo próprio:                                                      
 
  inline-flex items-center gap-1 px-2 py-1 text-xs font-medium
  rounded-full text-current                                                                 
  hover:bg-emerald-200/60
  focus:outline-none focus:ring-2 focus:ring-emerald-500/40                                 

  - rounded-full (arredondado) — contraste deliberado com o container retangular.           
  - Hover: fundo verde claro semitransparente (emerald-200/60).                             
  - Focus ring verde médio (emerald-500/40).                                                
  - Clicar aqui abre o picker pra editar o valor do filtro (sem precisar re-abrir o menu    
  principal).                                                                               

  Zona 3 — Botão remover (direita, clicável)                                                
  
  <button aria-label={`Remover filtro ${filter.type}`}>                                     
    <X className="h-3 w-3" />  {/* ícone X de lucide */}
  </button>                                                                                 

  - Tamanho h-5 w-5 (20×20px), ícone X de 12px.                                             
  - Mesma cor de fundo do chip (verde Mznet) — funde com o container.
  - Border transparente (sem destaque visual).                                              
  - Clique remove o filtro inteiro (não só o valor).                                        

  ---                                                                                       
  Comportamento ao clicar no gatilho do valor (Zona 2)                                      

  Abre <Popover> (largura 200px ou 260px no BUSCAR) com:

  Para filtros multi-select (Responsável, Horário) — single-select também usa esse layout   

  ┌─────────────────────────────────┐                                                       
  │ [🔍 Filtros...]                 │  ← CommandInput (busca interna)
  ├─────────────────────────────────┤                                                       
  │ ☑ Maria Silva    @vendedor      │  ← selecionados (checkbox ON)
  │ ☑ João Souza     @analista      │     clicar REMOVE                                     
  ├─────────────────────────────────┤  ← Separator                                          
  │ ☐ Pedro Lima     @gestor        │  ← disponíveis (checkbox OFF, opacity-0)              
  │ ☐ Ana Reis       @analista      │     clicar ADICIONA                                   
  └─────────────────────────────────┘
   
  - Seção superior: valores já aplicados, com checkbox visível e marcado. Clique remove o   
  valor.
  - Separator (<CommandSeparator />).                                                       
  - Seção inferior: valores disponíveis, checkbox opacity-0 (invisível até hover). Clique
  adiciona.                                                                                 
  - Após selecionar/desselecionar: fecha popover e limpa input de busca após 200ms.

  Para BUSCAR (caso especial)                                                               

  ┌─────────────────────────────────┐                                                       
  │ Buscar por nome do card         │
  │ [Maria Silva                 ]  │  ← Input com searchDraft
  │                  [Limpar][Aplicar] │                                                    
  └─────────────────────────────────┘                                                       

  - Largura 260px.                                                                          
  - Enter → aplica e fecha. Escape → fecha sem aplicar.
  - Botão "Limpar" aparece só se já há valor.                                               
  - Reabrir o popover restaura o último valor aplicado (não o draft pendente).

  Para PRAZO (caso especial — chip não abre nada)                                           

  - O gatilho do valor é um <span> simples, sem popover.                                    
  - Mostra só o range formatado: 08/05/26 – 15/05/26 (ou só 08/05/26 se for um único dia).
  - Edição do range é feita pelo calendar lateral da <FilterCTA> (botão "Selecionar período"
   do menu principal).                                                                      
                 
  ▎ ⚠ Inconsistência conhecida: todos os outros chips são clicáveis pra mudar o valor; o de 
  ▎ Prazo não. Decidir no novo: tornar o chip de Prazo clicável (abre o calendar) pra 
  ▎ coerência.                                                                              

  ---
  Múltiplos valores — visual "dual chip" / avatars empilhados

  Quando o filtro tem mais de 1 valor (típico em Responsável):

  Ícones empilhados (até 3)                                                                 
  <div className="flex items-center -space-x-1.5">                                          
    {selectedOptions.slice(0, 3).map(({ value, option }) => (
      <motion.div key={value}                                                               
        initial={{opacity:0, x:-10}}
        animate={{opacity:1, x:0}}                                                          
        exit={{opacity:0, x:-10}}                                                           
        transition={{duration:0.2}}>
        {option?.icon ?? <FilterIcon type={filterType} />}                                  
      </motion.div>                                                                         
    ))}
  </div>                                                                                    

  - -space-x-1.5: ícones se sobrepõem horizontalmente (efeito stacked).                     
  - Limite de 3 ícones visíveis.
  - AnimatePresence + motion.div (framer-motion): ao adicionar/remover, ícones fazem fade + 
  slide horizontal em 200ms.                                                                
   
  Label textual ao lado dos ícones                                                          

  1 valor :  [Avatar Maria] Maria Silva
  2 valores: [A1][A2]       2 selecionados                                                  
  3 valores: [A1][A2][A3]   3 selecionados                                                  
  4+ valores:[A1][A2][A3]   N selecionados   ← 4º+ avatar não aparece                       

  - Com 1 valor: avatar + label completo (nome).                                            
  - Com 2+ valores: avatares empilhados (até 3) + texto "N selecionados" — nunca aparece    
  "Maria +2", sempre o padrão genérico.                                                     

  ▎ Se o 4º+ valor precisar ser visível, abrir o popover do chip mostra todos. O chip em si 
  ▎ só sumariza.  

  Caso especial: Responsável usa <UserAvatar>

  Em vez do ícone genérico UserCircle, cada valor selecionado tem seu próprio avatar        
  colorido com iniciais:
 
  icon: <UserAvatar name={profile.full_name} size="xs" />

  - Avatar gerado por getInitials(name) + getAvatarColor(name) (de lib/utils.ts).
  - Tamanho xs (12px aprox).                                                                
  - Cor de fundo determinística por nome (hash do nome → 1 de 8 paletas Tailwind).          

  Filtros de Horário/Buscar usam ícone do tipo (Clock/Search) — não avatar.                 

  ---                                                                                       
  Operator (status, IS/IS_NOT)

  const FilterOperatorDropdown = () => null;

  Não há toggle de operator visível na UI. Todo filtro é fixo em:                           
  - FilterOperator.IS (default)
  - FilterOperator.INCLUDE (BUSCAR — implícito)                                             

  Se quiser permitir "diferente de" (IS_NOT) ou "não inclui" no novo, é spec de produto.    

  ---                                                                                       
  Chip especial — "Minhas menções"                                                          
  
  Renderizado fora do <Filters>, manualmente em <FilterCTA>:

  ┌──────────────────────────────────────────┐
  │ [@ Minhas menções]  [✕]                  │                                              
  └──────────────────────────────────────────┘

  Diferenças do chip padrão:

  ┌───────────────────────┬───────────────────────┬────────────────────────────────────┐    
  │        Aspecto        │      Chip padrão      │          Chip de menções           │
  ├───────────────────────┼───────────────────────┼────────────────────────────────────┤    
  │ Onde é renderizado    │ dentro de <Filters>   │ direto em <FilterCTA>              │
  ├───────────────────────┼───────────────────────┼────────────────────────────────────┤
  │ Tem gatilho de valor? │ sim (Zona 2 clicável) │ não — chip todo é só label + X     │
  ├───────────────────────┼───────────────────────┼────────────────────────────────────┤    
  │ Valor configurável?   │ sim (lista)           │ toggle on/off                      │
  ├───────────────────────┼───────────────────────┼────────────────────────────────────┤    
  │ Ícone                 │ varia por tipo        │ AtSign (fixo)                      │
  ├───────────────────────┼───────────────────────┼────────────────────────────────────┤    
  │ Cor                   │ var(--color-primary)  │ var(--color-primary) (mesma)       │
  ├───────────────────────┼───────────────────────┼────────────────────────────────────┤    
  │ Remover               │ botão X               │ botão X chama setMyMentions(false) │
  └───────────────────────┴───────────────────────┴────────────────────────────────────┘    
 
  Visualmente é indistinguível dos outros — usuário vê o mesmo "chip verde com label + X".  
 
  ---                                                                                       
  Ordem de renderização dos chips

  {filters
    .filter(filter => filter.value?.length > 0)
    .map(filter => <Chip key={filter.id} ... />)}                                           
   
  - Filtros sem valor são ocultos (a menos que showEmpty=true).                             
  - Ordem é a ordem de inclusão no array (não alfabética nem por prioridade).
  - Chip de Menções aparece antes dos chips de <Filters> (renderizado primeiro no JSX da    
  <FilterCTA>).                                                                             

  Layout: flex gap-2 flex-wrap items-center → chips fluem em múltiplas linhas se a largura  
  for pequena.    

  ---             
  Formatação de valores no chip

  ┌─────────────┬────────────────────────────────────────────────────────────────────────┐
  │    Tipo     │                                Formato                                 │
  ├─────────────┼────────────────────────────────────────────────────────────────────────┤
  │ Buscar      │ “Maria Silva” (entre aspas tipográficas) ou Adicionar termo            │
  │             │ (placeholder se vazio)                                                 │
  ├─────────────┼────────────────────────────────────────────────────────────────────────┤  
  │ Responsável │ nome completo do profile + avatar                                      │
  ├─────────────┼────────────────────────────────────────────────────────────────────────┤  
  │ Horário     │ 08:30 direto                                                           │
  ├─────────────┼────────────────────────────────────────────────────────────────────────┤  
  │ Prazo único │ 08/05/26 (pt-BR, 2-digit ano)                                          │
  ├─────────────┼────────────────────────────────────────────────────────────────────────┤  
  │ Prazo range │ 08/05/26 – 15/05/26 (com en-dash)                                      │
  ├─────────────┼────────────────────────────────────────────────────────────────────────┤  
  │ 2+ valores  │ 2 selecionados / 3 selecionados / etc.                                 │
  └─────────────┴────────────────────────────────────────────────────────────────────────┘  

  Conversão de data: Intl.DateTimeFormat("pt-BR", {day:"2-digit", month:"2-digit",          
  year:"2-digit"}). Note: usa data local (não UTC) pra evitar regressão de 1 dia.

  ---             
  Estados visuais (hover/focus/disabled)
┌──────────────────┬───────────────────────────┬──────────────────────────────────────┐
  │      Estado      │      Zona 2 (valor)       │              Zona 3 (X)              │   
  ├──────────────────┼───────────────────────────┼──────────────────────────────────────┤
  │ Default          │ sem fundo                 │ sem fundo (verde sólido)             │   
  ├──────────────────┼───────────────────────────┼──────────────────────────────────────┤
  │ Hover            │ bg-emerald-200/60         │ sem mudança visível (mesma cor do    │   
  │                  │                           │ chip)                                │   
  ├──────────────────┼───────────────────────────┼──────────────────────────────────────┤   
  │ Focus            │ ring-2                    │ herda focus do button                │   
  │                  │ ring-emerald-500/40       │                                      │
  ├──────────────────┼───────────────────────────┼──────────────────────────────────────┤   
  │ Disabled         │ — (não há disabled hoje)  │ —                                    │
  │ (leitor)         │                           │                                      │
  └──────────────────┴───────────────────────────┴──────────────────────────────────────┘

  ---
  Anti-padrões (NÃO fazer)

  1. ❌ Não trocar a cor do chip por tipo de filtro. Hoje todos são verdes; mudar quebra
  consistência visual e exige decisão de paleta.                                            
  2. ❌ Não mostrar o operator (IS/IS_NOT) no chip — FilterOperatorDropdown retorna null
  deliberadamente. Manter assim.                                                            
  3. ❌ Não mostrar "Maria +2" no chip — usar o padrão genérico "N selecionados" + ícones
  empilhados.                                                                               
  4. ❌ Não fazer o chip de Prazo abrir popover próprio. Hoje ele só mostra o range; edição
  é via calendar da CTA. Se for unificar (recomendado), refatorar a CTA também.             
  5. ❌ Não renderizar chips vazios (sem valor) — filtro só vira chip depois que tem
  value.length > 0. A inicialização limpa filtros vazios da URL.                            
  6. ❌ Não quebrar a animação motion.div ao renderizar avatares — AnimatePresence 
  mode="popLayout" é necessário pro stagger funcionar com lista dinâmica.                   
  7. ❌ Não usar ícone do tipo (UserCircle) nos valores de Responsável — usar <UserAvatar>
  com cor determinística por nome.                                                          
  8. ❌ Não persistir o chip de "Minhas menções" no Filter[] interno — é um boolean separado
   em <FilterCTA> por razão arquitetural (intersecção com inbox, não query de banco).       
  
  ---                                                                                       
  Acessibilidade  

  - Container do chip não é focável (é uma div).
  - Gatilho do valor (PopoverTrigger): focusable, focus ring verde.                         
  - Botão X: focusable, aria-label="Remover filtro {tipo}".                                 
  - Items do popover: focusable via teclado (cmdk), Enter aplica, Escape fecha.             
  - Avatar de responsável: deveria ter aria-label com nome — auditar no novo.               

  ---                                                                                       
  Pontos pro novo (decisões pendentes)                                                      

  1. Unificar chip de Prazo com os demais — torná-lo clicável (abre o calendar inline ou
  popover).                                                                                 
  2. Considerar cores por tipo de filtro (Buscar=cinza, Responsável=verde, Prazo=amber,
  Horário=azul) — coerente com cores das colunas do kanban? Decisão de produto.             
  3. Mostrar nome do primeiro valor + "+N" em vez de "N selecionados" — mais informativo
  (ex: "Maria +2"). Trade-off: ocupa mais largura.                                          
  4. Toggle de operator (IS/IS_NOT) — útil pra "tudo exceto fulano" ou "sem prazo definido".
   Hoje impossível.                                                                         
  5. Acessibilidade: garantir aria-label nos avatares do chip de Responsável (hoje só
  ícone).                                    


----------------------------------

A5. Expanded Ficha PF/PJ


Expanded PF 

O que é: página completa do cliente PF. Visualiza e edita todos os dados (applicants +    
  pf_fichas + agendamento no kanban_cards) com autosave em tempo real, e hospeda o campo de 
  parecer (especificado em doc separado).                                                   

  Quem acessa:                                                                              
  - Leitor: tudo read-only — wrapper inteiro com pointer-events-none opacity-85, queueSave
  early-return, save no banco silenciosamente descartado.                                   
  - Vendedor / Instalador: edita campos da ficha. Não escreve parecer nem decide.
  - Analista / Gestor: edita campos + escreve parecer + decide via slash command no parecer.

Como abrir: 

KANBAN (Comercial OU análise) >> FIcha/Card >> Modaleditarficha >> CTA: Analisar (Expanded Abre em outra ABA do navegador)

 1. Ciclo de vida (carregamento)

  Ao montar, na seguinte ordem:

  1. Lê applicantId da rota.
  2. auth.getUser() → currentUserId.                                                        
  3. SELECT applicants WHERE id = applicantId (25 colunas).
  4. SELECT pf_fichas WHERE applicant_id = applicantId.                                     
     ↳ Se não existe: INSERT { applicant_id } e relê.
  5. Garante card vivo:                                                                     
     SELECT kanban_cards WHERE applicant_id = X AND deleted_at IS NULL LIMIT 1
     ↳ Se vazio: INSERT { applicant_id, person_type:'PF', area:'comercial',                 
        stage:'feitas', created_by: userId }                                                
  6. Triangula card: SELECT id, reanalysis_notes, tipo_instalacao, due_at, hora_at          
     FROM kanban_cards WHERE applicant_id = X ORDER BY updated_at DESC LIMIT 1.             
     → cardIdEff.                                                                           
  7. listProfiles() (para menções no parecer).                                              
  8. listRoutes() filtrado por active=true (para picker de Bairro).                         
  9. Lê profiles.role do currentUserId.                                                     
  10. Subscribe nos 3 canais realtime.                                                      

  Troca de ficha (applicantId muda): limpar imediatamente pareceres, novoParecer, composer  
  ref. Sem isso, dados da ficha anterior "vazam" durante a janela de fetch.
  ---             
  11. Autosave
             
  ┌──────────────────┬──────────────────────────────────────────────────────────────────┐
  │     Aspecto      │                          Comportamento                           │   
  ├──────────────────┼──────────────────────────────────────────────────────────────────┤
  │ Debounce         │ 1.800 ms após última mudança em qualquer campo                   │   
  ├──────────────────┼──────────────────────────────────────────────────────────────────┤
  │ Flush imediato   │ onBlur de qualquer campo dispara custom event mz-field-blur que  │   
  │                  │ chama flushAutosave() sem esperar debounce                       │   
  ├──────────────────┼──────────────────────────────────────────────────────────────────┤   
  │ Flush            │ beforeunload chama flushAutosave() (não garante)                 │   
  │ best-effort      │                                                                  │   
  ├──────────────────┼──────────────────────────────────────────────────────────────────┤
  │ Granularidade    │ Batch: todos os campos pendentes em um UPDATE por tabela         │   
  │                  │ (applicants e/ou pf_fichas)                                      │   
  ├──────────────────┼──────────────────────────────────────────────────────────────────┤
  │ Bloqueio para    │ queueSave early-return; flushAutosave zera payload               │   
  │ leitor           │ silenciosamente                                                  │   
  └──────────────────┴──────────────────────────────────────────────────────────────────┘

  Dirty tracking  

  - dirtyAppFields: Set<keyof AppModel> e dirtyPfFields: Set<keyof PfModel> — campos com    
  alteração pendente.
  - Realtime não sobrescreve campos sujos: applyAppSnapshot / applyPfSnapshot checam        
  dirtyAppFields.has(k) antes de aplicar valor vindo do banco. Sem isso, o que o usuário    
  acabou de digitar é apagado se outro cliente atualizar a linha.
  - Após save OK, o campo sai do dirty set e ganha status idle.      

 3. Conversões UI ↔ canônico
    
  A camada do front opera com labels em português; o banco usa enums lowercase + booleans +
  ints. Converter sempre no boundary (load do banco e flush para o banco).                  
  
  ┌─────────────────────────────────┬───────────────────────┬───────────────────────────┐   
  │              Campo              │      UI (front)       │     Canônico (banco)      │
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤   
  │ birth_date                      │ dd/mm/yyyy            │ yyyy-mm-dd ISO            │
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤
  │ idade, conjuge_idade            │ string até 2 dígitos  │ int                       │
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤   
  │                                 │ Ligação / Whatspp /   │ enum ligacao / whatsapp / │
  │ meio                            │ Presensicial / Whats  │  presencial / whats_uber  │   
  │                                 │ - Uber                │                           │
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤   
  │ venc                            │ string "5" / "10" /   │ int                       │
  │                                 │ "15" / "20" / "25"    │                           │
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤
  │ unica_no_lote, tem_contrato,    │                       │                           │
  │ enviou_contrato,                │ Sim / Não             │ boolean                   │   
  │ enviou_comprovante,             │                       │                           │
  │ tem_internet_fixa               │                       │                           │   
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤
  │ tipo_moradia                    │ Própria / Alugada /   │ enum lowercase            │
  │                                 │ Cedida / Outros       │                           │   
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤
  │                                 │ XXXXX / Parentes /    │ enum (xxxxx, parentes,    │   
  │ nas_outras                      │ Locador(a) / Só       │ locador, so_conhecidos,   │   
  │                                 │ conhecidos / Não      │ nao_conhece)              │
  │                                 │ conhece               │                           │   
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤
  │ tipo_comprovante                │ Energia / Agua /      │ enum lowercase            │
  │                                 │ Internet / Outro      │                           │   
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤
  │                                 │ Carteira Assinada /   │ enum carteira_assinada /  │   
  │ vinculo                         │ Presta Serviços /     │ presta_servicos / etc.    │   
  │                                 │ etc.                  │                           │
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤   
  │ estado_civil                    │ Solteiro(a) /         │ enum sem (a)              │
  │                                 │ Casado(a) / etc.      │                           │   
  ├─────────────────────────────────┼───────────────────────┼───────────────────────────┤
  │ tipo_instalacao (oculto hoje)   │ Casa / Prédio com     │ enum                      │   
  │                                 │ Prumada / etc.        │                           │   
  └─────────────────────────────────┴───────────────────────┴───────────────────────────┘



4. Auto-shrink de fonte (chave para "tudo aparecer")

  Por causa do aspecto portrait 407/670, campos têm largura fixa apertada. Fonte encolhe
  automaticamente para o texto sempre couber sem cortar.                                    

  <Field> (input)                                                                           

  1. Mede value via canvas.measureText com a font-family computada.                         
  2. Reduz font-size de 13 px → 7 px em passos de 0,5 px até caber em clientWidth - 14 px (7
   px de padding cada lado).                                                                
  3. Aplica via CSS custom property --field-fs inline.
  4. Recalcula em cada mudança de value.                                                    

  <Textarea> (modo padrão)                                                                  

  1. Mede scrollHeight > clientHeight.                                                      
  2. Reduz font-size de 13 px → shrinkMin (default 6 px) em passos de 0,5 px.
  3. Se ainda transborda, overflow-y: auto; senão overflow-y: hidden.                       
  
  <Textarea> (modo compact)                                                                 

  - Sem shrink. Height fixa via classe pf-textarea-compact. Overflow hidden.   


5 . Cascatas e obrigatoriedade condicional

Estado calculado em cada render com base nos valores atuais; UI reage instantaneamente.

  ┌────────────────────────┬────────────────────────────────────────────────────────────┐
  │        Condição        │                           Efeito                           │   
  ├────────────────────────┼────────────────────────────────────────────────────────────┤
  │ tipo_moradia =         │ nome_locador e telefone_locador viram obrigatórios (border │
  │ 'Alugada'              │  verde, placeholder "Obrigatório"). Vazios → border        │
  │                        │ vermelha (errs.nome_locador / errs.telefone_locador).      │   
  ├──────────────────────├────────────────────────┼────────────────────────────────────────────────────────────┤
  │ tem_contrato = 'Sim'   │ enviou_contrato vira obrigatório.                          │   
  ├────────────────────────┼────────────────────────────────────────────────────────────┤   
  │ tem_contrato = 'Não'   │ Limpa enviou_contrato e nome_de; ambos disabled.           │
  ├────────────────────────┼────────────────────────────────────────────────────────────┤   
  │ tem_contrato = 'Sim' E │ nome_de vira obrigatório. Cascata automática:              │   
  │  enviou_contrato =     │ enviou_comprovante = 'Sim', tipo_comprovante = 'Outro',    │
  │ 'Sim'                  │ nome_comprovante = nome_de.                                │   
  ├────────────────────────┼────────────────────────────────────────────────────────────┤   
  │ Editar nome_de         │ Sincroniza nome_comprovante = nome_de em tempo real.       │
  │ enquanto cascata ativa │                                                            │   
  ├────────────────────────┼────────────────────────────────────────────────────────────┤
  │ enviou_contrato ≠      │ Limpa nome_de.                                             │   
  │ 'Sim'                  │                                                

Implementação: todas as cascatas rodam dentro do onChange do select gatilho, com          
  setPf(prev => ({...prev, ...patch})) E múltiplas chamadas queueSave('pf', key, value) em
  sequência.    

 Realtime (3 canais)

  ┌─────────────────────────┬────────────┬────────────────────────────┬────────────────┐  
  │          Canal          │   Tabela   │           Filter           │      Uso       │    
  ├─────────────────────────┼────────────┼────────────────────────────┼────────────────┤  
  │                         │            │                            │ aplica applyAp │    
  │ rt-pf-app-${applicantId │ applicants │ id=eq.${applicantId}       │ pSnapshot      │  
  │ }                       │            │                            │ respeitando    │    
  │                         │            │                            │ dirty          │  
  ├─────────────────────────┼────────────┼────────────────────────────┼────────────────┤    
  │                         │            │                            │ aplica applyPf │    
  │ rt-pf-fichas-${applican │ pf_fichas  │ applicant_id=eq.${applican │ Snapshot       │ 
  │ tId}                    │            │ tId}                       │ respeitando    │    
  │                         │            │                            │ dirty          │ 
  ├─────────────────────────┼────────────┼────────────────────────────┼────────────────┤ 
  │                         │            │                            │ só usa reanaly │
  │ rt-pf-card-${cardIdEff} │ kanban_car │ id=eq.${cardIdEff}         │ sis_notes      │    
  │                         │ ds         │                            │ (notas do      │
  │                         │            │                            │ parecer)      
  
   - Subscribe no useEffect que depende de [applicantId, cardIdEff].                         
  - Cleanup obrigatório no unmount: supabase.removeChannel(ch).
    
Campo de parecer

  1. Existe um card no final da página com <Card title="Parecer" noBorder red>.
  2. Habilitado apenas para analista e gestor:                                              
  canWriteParecer = !leitor && currentUserRole !== 'vendedor' && currentUserRole !==
  'instalador'                                                                              
  3. Demais roles (incluindo vendedor e instalador) veem read-only.
  4. A page apenas hospeda o componente do parecer e passa: cardId, profiles, currentUserId,
   canWrite, callbacks de save.                                                             
  5. Toda a especificação do parecer (composer, slash commands, menções, thread de          
  pareceres, decisões, pin, edição, deleção, draft em IndexedDB, anexos por parecer) está na linha de parecer. 

 Zoom (controle do usuário)
  ┌──────────────────────┬─────────────────────────────────────────────────────────────┐
  │       Aspecto        │                            Valor                            │    
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤
  │ Range                │ 0,75x – 1,5x                                                │    
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤
  │ Passo                │ 0,05                                                        │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤    
  │ Aplicação            │ CSS zoom: ${zoom} no form-zoom-scaler                       │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤    
  │ Persistência         │ localStorage key form-zoom-pf (independente PF/PJ)          │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤    
  │ Render dos controles │ React Portal em elemento #mz-zoom-controls (sidebar/header) │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤    
  │ Botões               │ − / 100% (label) / +     
  
  
   Zoom (controle do usuário)

  ┌──────────────────────┬─────────────────────────────────────────────────────────────┐
  │       Aspecto        │                            Valor                            │    
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤
  │ Range                │ 0,75x – 1,5x                                                │    
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤
  │ Passo                │ 0,05                                                        │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤    
  │ Aplicação            │ CSS zoom: ${zoom} no form-zoom-scaler                       │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤    
  │ Persistência         │ localStorage key form-zoom-pf (independente PF/PJ)          │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤    
  │ Render dos controles │ React Portal em elemento #mz-zoom-controls (sidebar/header) │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤    
  │ Botões               │ − / 100% (label) / +     


Expanded PJ

O que é: página completa do cliente PJ. Visualiza e edita todos os dados (applicants +    
  pj_fichas + agendamento no kanban_cards) com autosave em tempo real, e hospeda o campo de 
  parecer (especificado em doc separado).                                                   

  Quem acessa:                                                                              
  - Leitor: tudo read-only — wrapper inteiro com pointer-events-none opacity-85, queueSave
  early-return, save no banco silenciosamente descartado.                                   
  - Vendedor / Instalador: edita campos da ficha. Não escreve parecer nem decide.
  - Analista / Gestor: edita campos + escreve parecer + decide via slash command no parecer.

Como abrir: 

KANBAN (Comercial OU análise) >> FIcha/Card >> Modaleditarficha >> CTA: Analisar (Expanded Abre em outra ABA do navegador)

 A. Ciclo de vida (≡ PF, com diferenças marcadas)
 B. Autosave (≡ PF exatamente)
 
 C. Conversões UI ↔ canônico (∆ schema PJ)                                                 

  ┌──────────────────┬──────────────────────────────┬──────────
  │      Campo       │          UI (front)          │         Canônico (banco)         │ 
  ├──────────────────┼──────────────────────────────┼──────────
  │ meio (≡ PF)      │ Ligação/Whatspp/Presensicial │ enum ligacao/whatsapp/presencial │ 
  │                  │ /Whats - Uber                │ /whats_uber                      │ 
  │ venc (≡ PF)      │ string "5"/"10"/.../"25"     │ int                              │ 
  ├──────────────────┼──────────────────────────────┼──────────
  │ ∆ enviou_comprov │                              │                                  │    
  │ ante,            │ Sim/Não                      │ boolean                          │ 
  │ possui_internet, │                              │                                  │    
  │  contrato_social │                              │                                  │ 
  ├──────────────────┼──────────────────────────────┼──────────
  │ ∆ tipo_imovel    │ Comércio Terreo/Comércio     │ enum comercio_terreo/comercio_sa │ 
  │                  │ Sala/Casa                    │ la/casa                          │    
  ├──────────────────┼──────────────────────────────┼──────────
  │ ∆ tipo_estabelec │ Própria/Alugada/Cedida/Outro │ enum lowercase                   │    
  │ imento           │ s                            │                                  │    
  ├──────────────────┼──────────────────────────────┼──────────
  │ ∆                │ Energia/Agua/Internet/Outro  │ enum lowercase (mesmo da PF)     │    
  │ tipo_comprovante │                              │                                  │    
  ├──────────────────┼──────────────────────────────┼──────────
  │ ∆                │ XXXX/Casa/Prédio com         │                                  │    
  │ tipo_instalacao  │ Prumada/Prédio sem           │ enum (XXXX → null)               │    
  │ (oculto hoje)    │ Prumada/Wi-Fi Extend         │                                  │
  └──────────────────┴──────────────────────────────┴──────────
  PF tinha mas PJ NÃO tem: birth_date, idade, unica_no_lote, tem_contrato, enviou_contrato, 
  tem_internet_fixa, tipo_moradia, nas_outras, vinculo, estado_civil.
  
  
  D. Auto-shrink de fonte (≡ PF exatamente)
  
E. Regras condicionais de campo — cascata MUITO mais simples que PF                       

  ▎ PJ só tem uma cascata real, vs 7 da PF.                                                 
  
  1. enviou_comprovante = 'Sim' → tipo_comprovante habilita; nome_comprovante vira          
  obrigatório (border verde, placeholder "Obrigatório").
  2. enviou_comprovante = 'Não' → limpa tipo_comprovante E nome_comprovante; ambos viram    
  disabled.                                                                                 
  
  Estado calculado: reqComprov = pj.enviou_comprovante === 'Sim'.              

  F. Realtime (≡ PF, prefixo diferente)

  1. rt-pj-app-${applicantId} → UPDATE em applicants.                                       
  2. rt-pj-fichas-${applicantId} → UPDATE em pj_fichas (∆ tabela).
  3. rt-pj-card-${cardIdEff} → UPDATE em kanban_cards (só reanalysis_notes).        

G. Zoom (≡ PF, key diferente)                 
│     Aspecto      │                Valor                 │
  ├──────────────────┼──────────────────────────────────────┤                               
  │ Range            │ 0,75x – 1,5x                         │
  ├──────────────────┼──────────────────────────────────────┤
  │ Passo            │ 0,05                                 │
  ├──────────────────┼──────────────────────────────────────┤
  │ localStorage key │ ∆ form-zoom-pj (PF usa form-zoom-pf) │
  ├──────────────────┼──────────────────────────────────────┤                               
  │ Render           │ React Portal em #mz-zoom-controls    │
  └──────────────────┴──────────────────────────────────────┘     
  
  
  I. Padrões visuais dos campos (≡ PF)         


K. Estrutura visual

  1. ∆ Form root: pj-form ficha-pj expanded-portrait px-3 py-6 (PF usa mz-form ficha-pf).   
  2. ∆ Aspect ratio: mesmo portrait 407/670 (≡ PF).
  3. id="mz-print-root", data-tipo="pj", data-id, data-name (≡ PF estrutura).               
  4. ∆ Banner de status: PJ renderiza condicionalmente ({statusText && ...}) — sem altura   
  fixa quando vazio. PF tem altura fixa 5 px sempre. Pode causar leve layout shift em PJ.   

  L. Padrões visuais dos campos (≡ PF)                                                      

  1. <Field>: h-[21px] rounded-[2px] border-zinc-400 bg-blue-100, label text-[9px] font-bold
   uppercase.     
  2. Cores semânticas (≡ PF):                                                               
    - Default: bg azul claro.                                                               
    - "Do PS" red: end_ps, fones_ps — label vermelho + bg bg-red-50 + texto text-red-700.
    - Obrigatório: border emerald-500 + bg emerald-50 + placeholder "Obrigatório".          
    - Erro: border red-400 + bg red-50.                                                     
    - Disabled: bg zinc-100 + texto zinc-400 + cursor not-allowed.                          
  3. <Textarea> red: 4 instâncias na PJ — info_spc, info_pesquisador, info_mk (e            
  info_relevantes que é vermelho-claro também).                                             
                                          
  M. Layout — ∆ MUITO diferente da PF                                                       

  ▎ Esta é a maior diferença visual entre as duas pages.                                    

  ┌─────────────────────────────────┬───────────────────────────────────────────────────┐   
  │  PF (Adobe-style proporcional)  │       PJ (flex responsivo com widths fixas)       │
  ├─────────────────────────────────┼───────────────────────────────────────────────────┤   
  │ flex gap-x-[5px] com flex-[N]   │ flex flex-col gap-2 sm:flex-row sm:items-center   │
  │ (24/8/6/3)                      │                                                   │
  ├─────────────────────────────────┼───────────────────────────────────────────────────┤   
  │ Pesos relativos                 │ Widths fixas em px (sm:w-44, sm:w-52, sm:w-56,    │
  │                                 │ sm:flex-1)                                        │   
  ├─────────────────────────────────┼───────────────────────────────────────────────────┤
  │ Sempre 1 linha (não quebra)     │ Empilha em mobile (flex-col), enfileira em        │   
  │                                 │ desktop (sm:flex-row)                             │   
  ├─────────────────────────────────┼───────────────────────────────────────────────────┤
  │ Cards no padrão Adobe ficha     │ Cards estilo formulário web tradicional           │   
  │ física                          │                                                   │   
  └─────────────────────────────────┴───────────────────────────────────────────────────┘

  Exemplos de linhas PJ:

  ┌───────────────────────────────────────┬────────────────────
  │                 Linha                 │                 Layout                  │
  ├───────────────────────────────────────┼────────────────────     
  │ Razão Social | CNPJ | Abertura        │ flex-1 / sm:w-56 / sm:w-44              │
  ├───────────────────────────────────────┼──────────────────── 
  │ Nome Fantasia | Nome de Fachada       │ grid-cols-2                             │       
  ├───────────────────────────────────────┼────────────────────
  │ END | N | COMPL                       │ flex-1 / sm:w-20 / sm:w-[250px]         │       
  ├───────────────────────────────────────┼────────────────────
  │ CEP | Bairro | Tempo                  │ sm:w-40 / sm:w-56 / sm:flex-1           │
  ├───────────────────────────────────────┼────────────────────  
  │ Tipo | OBS                            │ sm:w-56 / sm:flex-1                     │
  ├───────────────────────────────────────┼────────────────────
  │ Estabelecimento | OBS                 │ sm:w-56 / sm:flex-1                     │
  ├───────────────────────────────────────┼────────────────────
  │ TEL | WHATS | FONE NO PS              │ sm:w-48 / sm:w-48 / sm:flex-1           │
  ├───────────────────────────────────────┼────────────────────  │ Comprovante | Tipo | Em Nome de       │ sm:w-52 / sm:w-44 / sm:flex-1           │
  ├───────────────────────────────────────┼────────────────────  
  │ Internet | Operadora | Plano | Valor  │ sm:w-44 / sm:w-48 / sm:w-40 / sm:w-40   │
  ├───────────────────────────────────────┼────────────────────
  │ Contrato Social | OBS                 │ sm:w-52 / sm:flex-1                     │
  ├───────────────────────────────────────┼────────────────────   
  │ Sócio (N=1,2,3) Nome | CPF | Telefone │ sm:flex-1 / sm:w-52 / sm:w-56           │
  ├───────────────────────────────────────┼────────────────────
  │ Quem Solicitou | Meio | TEL           │ sm:w-[250px] / sm:w-[190px] / sm:flex-1 │
  └───────────────────────────────────────┴────────────────────

  Agendada/Horário (∆ layout):                                                              
  - PF usa grid grid-cols-2 gap-2.
  - PJ usa flex items-center gap-2 min-w-0 em UMA linha — label + popover + label +         
  multi-select.   

  N. Labels de seção

  1. Sem subseções com bg amarelo (∆ PF tem: "FILIAÇÃO" / "REFERÊNCIAS PESSOAIS"). PJ tem   
  comentários inline no JSX ({/* Seção 4: Sócios */}) sem labels visuais entre blocos.
  2. Label "Sócios": text-[9px] font-bold uppercase tracking-wide leading-none text-zinc-600
   mb-1 — discreto, sem destaque amarelo.                                                   
  3. Card title red: ∆ PJ usa "Parecer da análise:" com : no final (PF usa só "Parecer").
  4. Card title default: mesmo padrão da PF.                                                

  O. Selects (<SimpleSelect>)                                                               

  Variante: Compacto (default)                                                              
  Estilo: h-10 rounded-[7px] px-3 text-sm bg-zinc-50 border border-zinc-200             
    shadow-[0_5.447px_5.447px_rgba(0,0,0,0.25)]                                             
  ≡ ou ∆: ≡ PF                                                                          
  ────────────────────────────────────────                                              
  Variante: "Outras informações" (bloco Plano/Venc/SVA)                                     
  Estilo: h-10 w-full rounded-[7px] px-3 text-sm                                        
  ≡ ou ∆: ∆ PJ mantém h-10 (mais alto que PF que reduz para h-[21px])                       
  ────────────────────────────────────────
  Variante: Agendada/Horário                                                                
  Estilo: h-[21px] rounded-[2px] bg-blue-100 px-1 text-[10px] border-zinc-400
  ≡ ou ∆: ≡ PF                                                                              

  PLANO_OPTIONS e SVA_OPTIONS: estrutura idêntica à PF (3 grupos + headers disabled=true).  
  
  ---                                                                                       
  Resumo das diferenças PJ vs PF

  ┌────────────────┬──────────────────────────────┬────────────
  │    Aspecto     │              PF              │                 PJ                  │   
  ├────────────────┼──────────────────────────────┼────────────
  │ Linhas de      │ 1782                         │ 1488 (–294)                         │
  │ código         │                              │                                     │
  ├────────────────┼──────────────────────────────┼────────────
  │ Tabela         │ pf_fichas                    │ pj_fichas                           │   
  │ detalhada      │                              │                                     │   
  ├────────────────┼──────────────────────────────┼────────────  │ Hook de role   │ listProfiles manual          │ useUserRole()                       │
  ├────────────────┼──────────────────────────────┼────────────
  │                │ Pessoal + cônjuge + filiação │ Empresa + endereço + comprovação +  │
  │ Schema         │  + referências +             │ internet + contrato social + 3      │   
  │                │ profissional                 │ sócios                              │
  ├────────────────┼──────────────────────────────┼────────────
  │                │ 7 (tipo_moradia,             │                                     │
  │ Cascatas       │ tem_contrato,                │ 1 (enviou_comprovante)              │
  │                │ enviou_contrato, etc.)       │                                     │   
  ├────────────────┼──────────────────────────────┼────────────
  │ Subseções      │ 2 (Filiação, Referências)    │ 0                                   │   
  │ amarelas       │                              │                                     │   
  ├────────────────┼──────────────────────────────┼────────────
  │ Layout         │ Adobe-style proporcional     │ Flex responsivo com widths fixas    │   
  │                │ (flex-[N])                   │                                     │
  ├────────────────┼──────────────────────────────┼────────────
  │ Máscaras       │ —                            │ CNPJ + Currency BR +                │
  │ únicas         │                              │ DateBR(abertura)                    │
  ├────────────────┼──────────────────────────────┼────────────
  │ Tipo de        │ 4 opções (canônico)          │ 5 opções (XXXX extra → null)        │
  │ Instalação     │                              │                                     │   
  ├────────────────┼──────────────────────────────┼────────────
  │ Card title     │ "Parecer"                    │ "Parecer da análise:"               │
  │ parecer        │                              │                                     │   
  ├────────────────┼──────────────────────────────┼────────────
  │ Banner de      │ altura fixa 5 px             │ renderiza condicionalmente          │
  │ status         │                              │                                     │   
  ├────────────────┼──────────────────────────────┼────────────
  │ localStorage   │ form-zoom-pf                 │ form-zoom-pj                        │   
  │ zoom key       │                              │                                     │   
  ├────────────────┼──────────────────────────────┼────────────
  │ Prefixo        │ rt-pf-*                      │ rt-pj-*                             │   
  │ realtime       │                              │                                     │   
  └────────────────┴──────────────────────────────┴────────────
 UI — estrutura visual

  Hierarquia de wrappers

  .form-zoom-wrap                  ← flex column, overflow-x hidden
  └── .form-zoom-scaler            ← CSS zoom                                               
      └── ∆ .pj-form .ficha-pj .expanded-portrait .px-3 .py-6                               
          (aspecto portrait 407/670 — mesmo da PF)                                          
          └── [banner de save status — ∆ condicional, sem altura fixa]                      
          └── <Card> Ficha completa (sem título)                                            
          └── <Card title="Parecer da análise:" noBorder red>                               
                  
  ∆ Classes do form root: pj-form ficha-pj (PF usa mz-form ficha-pf).                       
  ∆ data-tipo="pj" no #mz-print-root.

  ---             
  12. UI — padrões visuais dos campos (≡ A7-PF)
  
  <Field> (input) — base

  h-[21px] rounded-[2px]
  border-zinc-400 bg-blue-100
  label: text-[9px] font-bold uppercase tracking-wide leading-none                          
   
  Cores semânticas                                                                          

  ┌────────────┬───────────────────┬──────────────┬────────────
  │   Estado   │      Border       │  Background  │       Texto       │     Quando      │ 
  ├────────────┼───────────────────┼──────────────┼────────────
  │ Default    │ border-zinc-400   │ bg-blue-100  │ text-zinc-900     │ qualquer campo  │ 
  │            │                   │ (azul claro) │                   │ padrão          │ 
  ├────────────┼───────────────────┼──────────────┼────────────
  │ "Do PS"    │ border-red-300    │ bg-red-50    │ text-red-700;     │ apenas end_ps e │
  │ red        │                   │              │ label vermelho    │  fones_ps na PJ │   
  ├────────────┼───────────────────┼──────────────┼────────────
  │ Obrigatóri │                   │              │ placeholder       │ apenas nome_com │   
  │ o por depe │ border-emerald-50 │ bg-emerald-5 │ Obrigatório verde │ provante quando │   
  │ ndência    │ 0                 │ 0            │  semibold         │                 │
  │            │                   │              │                   │ reqComprov=true │   
  ├────────────┼───────────────────┼──────────────┼────────────
  │ Erro de    │                   │              │                   │ (não há erros   │
  │ validação  │ border-red-400    │ bg-red-50    │ normal            │ visíveis hoje   │
  │            │                   │              │                   │ na PJ)          │   
  ├────────────┼───────────────────┼──────────────┼────────────
  │            │                   │              │ text-zinc-400 cur │ campo           │   
  │ Disabled   │ border-zinc-200   │ bg-zinc-100  │ sor-not-allowed   │ desabilitado    │
  │            │                   │              │ opacity-70        │                 │   
  └────────────┴───────────────────┴──────────────┴────────────
  <Textarea> red                                                                            
   
  4 instâncias na PJ (todas em seções de informação):                                       
  - info_spc ("Consulta SPC/Serasa")
  - info_pesquisador ("Outras informações relevantes do PS")                                
  - info_mk ("Informações Relevantes do MK")                
  - info_relevantes ("Informações relevantes da solicitação") — sem red, padrão azul        
                  
  ---                                                                                       
  13. UI — layout (∆ ESTILO TOTALMENTE DIFERENTE da PF)

  ▎ Esta é a maior diferença visual entre A7-PF e A7-PJ.
    
  ┌─────────────────────────────────┬──────────────────────────
  │       A7-PF (Adobe-style        │     A7-PJ (flex responsivo com widths fixas)      │   
  │          proporcional)          │                                                   │   
  ├─────────────────────────────────┼──────────────────────────
  │ flex gap-x-[5px] com flex-[N]   │ flex flex-col gap-2 sm:flex-row sm:items-center   │
  │ (24/8/6/3)                      │                                                   │   
  ├─────────────────────────────────┼──────────────────────────
  │ Pesos relativos sempre na mesma │ Empilha em mobile (flex-col), enfileira em        │   
  │  linha                          │ desktop (sm:flex-row)                             │
  ├─────────────────────────────────┼──────────────────────────
  │ Widths fluidas                  │ Widths fixas em px (sm:w-44, sm:w-52, sm:w-56,    │
  │                                 │ sm:flex-1)                                        │   
  ├─────────────────────────────────┼──────────────────────────
  │ Sem quebra de linha             │ Quebra natural se viewport pequeno                │   
  ├─────────────────────────────────┼──────────────────────────
  │ Densidade alta — parece ficha   │ Densidade média — parece form web tradicional     │
  │ física                          │                                                   │   
  └─────────────────────────────────┴──────────────────────────
  Linhas da PJ (escrito em ordem de aparição na page)                                       
   
	  ┌──────────────────────────────────────────────┬─────────────
	  │                    Linha                     │                Widths                │
	  ├──────────────────────────────────────────────┼─────────────
	  │ Empresa: Razão Social | CNPJ | Abertura      │ flex-1 / sm:w-56 / sm:w-44           │
	  ├──────────────────────────────────────────────┼─────────────
	  │ Nome Fantasia | Nome de Fachada              │ grid-cols-2                          │   
	  ├──────────────────────────────────────────────┼─────────────
	  │ Área de Atuação                              │ w-full                               │   
	  ├──────────────────────────────────────────────┼─────────────
	  │ Endereço: END | N | COMPL                    │ flex-1 / sm:w-20 / sm:w-[250px]      │
	  ├──────────────────────────────────────────────┼─────────────
	  │ Tipo | OBS                                   │ sm:w-56 / sm:flex-1                  │
	  ├──────────────────────────────────────────────┼─────────────
	  │ CEP | Bairro | Tempo                         │ sm:w-40 / sm:w-56 / sm:flex-1        │
	  ├──────────────────────────────────────────────┼─────────────
	  │ Estabelecimento | OBS                        │ sm:w-56 / sm:flex-1                  │
	  ├──────────────────────────────────────────────┼─────────────
	  │ Contatos: TEL | WHATS | FONE NO PS (red)     │ sm:w-48 / sm:w-48 / sm:flex-1        │
	  ├──────────────────────────────────────────────┼─────────────
	  │ END NO PS (red)                              │ w-full                               │
	  ├──────────────────────────────────────────────┼─────────────
	  │ E-mail                                       │ w-full                               │
	  ├──────────────────────────────────────────────┼─────────────
	  │ Comprovante: Comprovante | Tipo | Em Nome de │ sm:w-52 / sm:w-44 / sm:flex-1        │
	  ├──────────────────────────────────────────────┼─────────────
	  │ Internet: Internet | Operadora | Plano |     │ sm:w-44 / sm:w-48 / sm:w-40 /        │
	  │ Valor                                        │ sm:w-40                              │   
	  ├──────────────────────────────────────────────┼─────────────
	  │ Documentação: Contrato Social | OBS          │ sm:w-52 / sm:flex-1                  │   
	  ├──────────────────────────────────────────────┼─────────────
	  │ Sócios (3 linhas iguais): Nome | CPF |       │ sm:flex-1 / sm:w-52 / sm:w-56        │
	  │ Telefone                                     │                                      │   
	  ├──────────────────────────────────────────────┼────────────
	  │ Solicitação: Quem Solicitou | Meio | TEL     │ sm:w-[250px] / sm:w-[190px] /        │   
	  │                                              │ sm:flex-1                            │   
	  ├──────────────────────────────────────────────┼─────────────
	  │ Bloco destacado: Plano de Acesso +           │ wrapper pj-highlight-row; inner usa  │   
	  │ Vencimento + SVA Avulso + (Data | Protocolo  │ grid grid-cols-3 para os 3 últimos   │   
	  │ MK | Representante Mz)                       │                                      │
	  ├──────────────────────────────────────────────┼─────────────
	  │ Agendamento: Agendada (label + popover) |    │ flex items-center gap-2 min-w-0 —    │
	  │ Horário (label + multi-select)               │ uma linha só (∆ PF usa grid          │   
	  │                                              │ grid-cols-2)                         │
	   
	    │ info_relevantes ("Informações relevantes da        │ azul          │ 2,5 px         │
  │ solicitação")                                      │ (default)     │ (extremo)      │
  ├────────────────────────────────────────────────────┼───────────────┼────────────────┤   
  │ info_spc ("Consulta SPC/Serasa")                   │ red           │ 6 px (default) │
  ├────────────────────────────────────────────────────┼───────────────┼────────────────┤   
  │ info_pesquisador ("Outras informações relevantes   │ red           │ 6 px           │
  │ do PS")                                            │               │                │   
  ├────────────────────────────────────────────────────┼───────────────┼────────────────┤
  │ info_mk ("Informações Relevantes do MK")           │ red           │ 6 px           │

  ---
  14. UI — labels de seção
                          
  15. Card title default: text-[9px] font-bold uppercase tracking-widest text-zinc-700.
  16. Card title red: 12 px, cor #dc2626, underline, uppercase, tracking 0.06em — usado em   
  "Parecer da análise:" (∆ PF usa "Parecer" sem :).                                         
  17. ∆ Sem subseções amarelas: PJ NÃO tem labels com bg-yellow-200 (PF tem 2: "FILIAÇÃO DO  
  SOLICITANTE..." e "REFERÊNCIAS PESSOAIS...").                                             
  18. Label "Sócios": discreto, text-[9px] font-bold uppercase tracking-wide leading-none 
  text-zinc-600 mb-1 — sem destaque.                                                        
  19. Comentários inline no JSX marcam blocos ({/* Seção 2: Endereço */}, {/* Seção 4: Sócios
   */}, etc.) sem renderizar label visível.                                                 
     
  ---                                                                                       
  20. UI — selects (<SimpleSelect>)

  ┌───────────────────────┬────────────────────────────────────
  │       Variante        │                      Estilo do trigger                      │   
  ├───────────────────────┼────────────────────────────────────
  │ Compacto (default em  │ h-10 w-full rounded-[7px] px-3 text-sm bg-zinc-50 border    │
  │ campos da ficha)      │ border-zinc-200 shadow-[0_5.447px_5.447px_rgba(0,0,0,0.25)] │
  ├───────────────────────┼────────────────────────────────────
  │ "Bloco destacado"     │                                                             │
  │ (Plano de Acesso,     │ ∆ PJ mantém h-10 (PF reduz para h-[21px] no equivalente)    │   
  │ Vencimento, SVA       │                                                             │   
  │ Avulso)               │                                                             │
  ├───────────────────────┼────────────────────────────────────
  │ Agendada / Horário    │ h-[21px] rounded-[2px] bg-blue-100 px-1 text-[10px]         │
  │                       │ border-zinc-400                                             │   
  └───────────────────────┴────────────────────────────────────

  PLANO_OPTIONS (idêntico à PF) — 3 grupos com headers disabled=true ("— Normais —", "— IP  
  Dinâmico —", "— IP Fixo —").
  SVA_OPTIONS (idêntico à PF) — headers de streaming, hardware, wifi extend.                

  ---
  21. Estado readOnly (leitor) (≡ A7-PF)

  - Wrapper inteiro recebe pointer-events-none opacity-85.
  - queueSave early-return.                                                                 
  - flushAutosave descarta pendingApp/pendingPj silenciosamente.
  - Banner de status nunca aparece para leitor.                                             
  - Campo de parecer: read-only (passa canWrite={false}).                                   

  ---                                                                                       

A6. Modal Editar Ficha

  1. Modal de edição rápida da ficha — abre sobre o kanban (comercial ou análise) quando o  
  usuário clica num card, sem navegar pra rota /cadastro/{pf|pj}/[id].                      
  2. Modal único atende PF e PJ — detecta applicants.person_type no load e adapta:
    - Label do nome (Nome do Cliente ↔ Razão Social).                                       
    - Label e máscara do documento (CPF ↔ CNPJ).                                                   
  3. Edita apenas 15 campos de applicants + 3 de kanban_cards (due_at, hora_at,             
  tipo_instalacao) + technician_id automático. Não edita pf_fichas nem pj_fichas — pra isso 
  o usuário clica em "Analisar" e vai pra Expanded.                                         
  4. Como acessa:                                                                           
    - Clique simples em qualquer card no Kanban Comercial ou Análise.                       
    - Drag-and-drop preserva o modal fechado (sensor de distância 8px).
    - Externalmente via URL ?card=<id> (kanban auto-abre o modal).                          
  5. Como fecha:                                                                            
    - Botão X (top-right) → onClose().                                                      
    - Backdrop não fecha (clique no backdrop é stopPropagation pelo wrapper interno). ESC   
  não fecha hoje.                                                                           
  6. Atalho "Analisar" abre a Expanded em nova aba com
  ?card=<cardId>&from=analisar&standalone=1.                                                
  7. Roles iguais aos expandeds:
    - Leitor: tudo read-only (wrapper pointer-events-none opacity-80).                      
    - Vendedor / Instalador: edita campos, não escreve parecer.                             
    - Analista / Gestor: edita + escreve parecer + decide
8. CTA: Etiquetas (Canto Superior esquerdo, contrário a "Analisar")


A. Ciclo de vida (carregamento)

  1. Boot único por abertura (bootRef): ao abrir, busca dados e seta bootRef.current = true.
   Reabrir com mesmo modal não rebusca. Reseta ao fechar.
  2. Carregamento (ordem):                                                                  
    a. auth.getUser() → currentUserId.                                                      
    b. useEditarFichaData hook lê cache local em localStorage key mz.pareceres.${cardId}
  (hidrata pareceres instantaneamente).                                                     
    c. fetchApplicantCard(applicantId, cardId) traz:
        - applicants: 15 colunas (primary_name, cpf_cnpj, phone, whatsapp, email, endereço  
  completo, plano_acesso, venc, sva_avulso, carne_impresso, person_type).                   
      - kanban_cards: created_at, due_at, hora_at, reanalysis_notes, created_by,            
  assignee_id, tipo_instalacao.                                                             
    d. Converte venc (number → string), due_at (UTC → local), hora_at (array time[] →
  strings HH:MM), tipo_instalacao (canon → UI label).                                       
    e. listProfiles() (pra menções).
    f. listRoutes() filtrado por active=true (pra picker de Bairro).                        
    g. Subscribe nos 2 canais realtime.
  3. Troca de card sem fechar modal: bootRef previne reset; troca de card real exige fechar 
  + reabrir.                  

 B. Autosave  
 
           Aspecto            │                    Comportamento                     │
  ├──────────────────────────────┼──────────────────────────────────────────────────────┤   
  │ Debounce                     │ useDebouncedCallback(flush, 1800) — 1.8s             │
  ├──────────────────────────────┼──────────────────────────────────────────────────────┤
  │ Flush imediato               │ onBlur em qualquer Field via handleFieldBlur (∆ NÃO  │   
  │                              │ usa custom event mz-field-blur como os expandeds)    │   
  ├──────────────────────────────┼──────────────────────────────────────────────────────┤   
  │ Flush best-effort no unload  │ NÃO (∆ expandeds têm; modal não)                     │   
  ├──────────────────────────────┼─────────────────────────────  
  │ Granularidade                │ Batch: 1 UPDATE em applicants + 1 em kanban_cards    │
  
  │                              │ Toda fila checa canWriteParecer antes (modal         │   
  │ Bloqueio para                │ restringe MAIS que expanded — vendedor/instalador    │
  │ leitor/vendedor/instalador   │ também são bloqueados no autosave do parecer; mas    │   
  │                              │ campos básicos do applicant também checam)           │
  └──────────────────────────────┴───────────────────────────── 
  Dirty tracking

  - dirtyAppFields: Set<keyof AppModel> + dirtyCardFields: Set<string>.                     
  - Realtime não sobrescreve campos sujos (mesma regra dos expandeds).
  - Após save OK, campo sai do dirty set e ganha status idle.                               

  Status visual                                                                             

  ┌────────┬───────────────────────┬───────────────────────────
  │ Estado │        Banner         │                       Notas                        │
  ├────────┼───────────────────────┼───────────────────────────  
  │ idle   │ (vazio)               │ banner não renderiza                               │
  ├────────┼───────────────────────┼───────────────────────────
  │ saving │ "Salvando…" verde     │ renderiza condicionalmente                         │
  │        │ primário              │                                                    │   
  ├────────┼───────────────────────┼───────────────────────────
  │ saved  │ (vazio — não mostra   │ ∆ deliberado: comentário no código diz "evita      │   
  │        │ "Salvo")              │ animação/jitter visual"                            │
  ├────────┼───────────────────────┼────────────────────────────
  │ error  │ "Erro ao salvar"      │ renderiza condicionalmente                         │
  └────────┴───────────────────────┴─────────────────────────── 
  
  C. Campos editáveis (lista completa)                                                      
                  
  Em applicants (14 + 1 readonly)                                                           
  
  ┌─────┬────────────────────┬─────────────────────┬───────────
  │  #  │       Campo        │      Label UI       │          Adaptação PF/PJ           │
  ├─────┼────────────────────┼─────────────────────┼───────────
  │ 1   │ primary_name       │ "Nome do Cliente" / │ ∆ label varia por personType       │
  │     │                    │  "Razão Social"     │                                    │   
  ├─────┼────────────────────┼─────────────────────┼───────────
  │     │                    │                     │ ∆ label, máscara (formatCpf 11     │
  │ 2   │ cpf_cnpj           │ "CPF" / "CNPJ"      │ dígitos / formatCnpj 14 dígitos),  │   
  │     │                    │                     │ maxLength (14/18)                  │
  ├─────┼────────────────────┼─────────────────────┼───────────
  │ 3   │ phone              │ "Telefone"          │ maskPhoneLoose                     │
  ├─────┼────────────────────┼─────────────────────┼───────────  │ 4   │ whatsapp           │ "Whatsapp"          │ maskPhoneLoose                     │
  ├─────┼────────────────────┼─────────────────────┼───────────  
  │ 5   │ email              │ "E-mail"            │ sem máscara                        │
  ├─────┼────────────────────┼─────────────────────┼───────────
  │ 6   │ address_line       │ "Logradouro"        │ sem máscara                        │
  ├─────┼────────────────────┼─────────────────────┼─────────── 
  │ 7   │ address_number     │ "Número"            │ sem máscara                        │
  ├─────┼────────────────────┼─────────────────────┼───────────
  │ 8   │ address_complement │ "Complemento"       │ sem máscara                        │
  ├─────┼────────────────────┼─────────────────────┼───────────
  │ 9   │ cep                │ "CEP"               │ sem máscara aqui (∆ expandeds usam │
  │     │                    │                     │  formatCep)                        │   
  ├─────┼────────────────────┼─────────────────────┼───────────
  │ 10  │ bairro             │ "Bairro"            │ Select dinâmico de listRoutes()    │   
  ├─────┼────────────────────┼─────────────────────┼───────────┤   
  │ 11  │ plano_acesso       │ "Plano de Internet" │ SelectAdv com PLANO_OPTIONS        │
  ├─────┼────────────────────┼─────────────────────┼───────────
  │ 12  │ venc               │ "Dia de vencimento" │ Select com VENC_OPTIONS            │
  │     │                    │                     │ (5/10/15/20/25)                    │   
  ├─────┼────────────────────┼─────────────────────┼───────────
  │ 13  │ sva_avulso         │ "SVA Avulso"        │ SelectAdv com SVA_OPTIONS          │   
  ├─────┼────────────────────┼─────────────────────┼───────────- 
  │     │                    │                     │ ∆ APARECE no modal (boolean        │
  │ 14  │ carne_impresso     │ "Carnê impresso"    │ Sim/Não); nos expandeds está no    │   
  │     │                    │                     │ schema mas oculto                  │
  └─────┴────────────────────┴─────────────────────┴───────────-
  Em kanban_cards

  ┌─────┬─────────────────┬─────────────────┬───────────────────────────────────────────┐
  │  #  │      Campo      │    Label UI     │                   Notas                   │
  ├─────┼─────────────────┼─────────────────┼──────────────────-
  │ 1   │ due_at          │ "Instalação     │ <DateSingleKanbanPopover>; persiste como  │
  │     │                 │ agendada para"  │ UTC T12:00 local (estabiliza fuso)        │   
  ├─────┼─────────────────┼─────────────────┼──────────────────- 
  │ 2   │ hora_at         │ "Horário"       │ <TimeMultiSelect> array text[];           │
  │     │                 │                 │ allowedPairs manhã/tarde                  │   
  ├─────┼─────────────────┼─────────────────┼──────────────────-
  │ 3   │ tipo_instalacao │ "Tipo de        │ Select; PF: 4 opções; PJ: 5 (XXXX = null) │   
  │     │                 │ Instalação"     │                                           │   
  ├─────┼─────────────────┼─────────────────┼──────────────────-
  │ 4   │ technician_id   │ (sem UI)        │ ∆ atualizado automaticamente pelo         │   
  │     │                 │                 │ suggest_assignment ao selecionar due_at   │   
  └─────┴─────────────────┴─────────────────┴──────────────────-
  Readonly (display)

  - Feito em ← createdAt (formatado toLocaleString()).                                      
  - Vendedor ← vendorName (resolvido via profiles.find(p => p.id === created_by).full_name).
  - Analistas ← analystName (resolvido via profiles.find(p => p.id ===                      
  assignee_id).full_name).                                                                  
  
  D. Conversões UI ↔ canônico                                                               
                  
  ┌─────────────────┬────────────────────┬──────────────────────────────────────────────┐   
  │      Campo      │         UI         │                   Canônico                   │
  ├─────────────────┼────────────────────┼──────────────────────────────────────────────┤   
  │ venc            │ string "5" / "10"  │ int                                          │
  │                 │ / etc.             │                                              │
  ├─────────────────┼────────────────────┼──────────────────────────────────────────────┤
  │ carne_impresso  │ "Sim" / "Não"      │ boolean (val === 'Sim')                      │   
  ├─────────────────┼────────────────────┼──────────────────────────────────────────────┤
  │                 │ "Casa" / "Prédio   │ enum (casa / predio_com_prumada / etc.);     │   
  │ tipo_instalacao │ com Prumada" /     │ "XXXX" → null                                │
  │                 │ etc.               │                                              │   
  ├─────────────────┼────────────────────┼──────────────────────────────────────────────┤   
  │                 │ YYYY-MM-DD (date   │ ISO UTC ao meio-dia local via                │
  │ due_at          │ input)             │ localDateTimeToUtcISO(val, '12:00',          │   
  │                 │                    │ DEFAULT_TIMEZONE)                            │
  ├─────────────────┼────────────────────┼──────────────────────────────────────────────┤
  │ hora_at         │ string[] ["08:30", │ text[] no banco ["08:30:00", "10:30:00"]     │
  │                 │  "10:30"]          │ (sufixo :00)                                 │   
  └─────────────────┴────────────────────┴─────────────────────

Vendedor 
Analista 

Esses dois campos ficam abaixo da Linha com: 

Feito em | Instalação agendada para | Horário

E são preenchidos pelo SIstema, travados de DIgitação. Onde: Vendedor (ID de quem criou) / Analista (Quem puxou de: Preenchidas para: Em Análise)

Abaixo: Campo de Parecer

 F. Auto-shrink (≡ Expanded — via <Field> de components/Fields.tsx)                        
  
  1. <Field> shrink: canvas measure, 13px → 7px em passos de 0,5px (mesmo algoritmo dos     
  expandeds).     
  2. <Select> e <SelectAdv>: sem shrink — trigger tem altura fixa h-10.                     
  
  G. Cascata condicional                                                                    
  
  Nenhuma. Diferente dos expandeds (PF tem 7, PJ tem 1), o modal não tem cascatas. Cada     
  campo é independente. Decisão deliberada pra manter modal simples — quem precisa de
  cascatas vai pra Expanded.                           

 I. Realtime (2 canais)

  Canal: rt-edit-app-${applicantId}                                                       
  Tabela: applicants                                                                      
  Filter: id=eq.${applicantId}                                                              
  Uso: atualiza 15 campos do app respeitando dirty                                        
  ────────────────────────────────────────                                                  
  Canal: rt-edit-card-${cardId}                                                             
  Tabela: kanban_cards                                                                    
  Filter: id=eq.${cardId}                                                                   
  Uso: atualiza due_at, hora_at, reanalysis_notes, created_by, assignee_id                  
  
  ▎ ∆ Apenas 2 canais — modal não escuta pf_fichas nem pj_fichas (não edita esses).         

  Cleanup obrigatório no unmount.                                                           

  J. onCardUpdate callback (∆ EXCLUSIVO DO MODAL)

  Prop opcional onCardUpdate(patch: CardSnapshotPatch). Modal chama quando edita campos que 
  aparecem no resumo do card do kanban:

  - primary_name → applicantName
  - cpf_cnpj → cpfCnpj
  - phone → phone
  - whatsapp → whatsapp                                                                     
  - bairro → bairro
  - due_at → dueAt                                                                          
  - hora_at → horaAt

  Permite que o kanban atualize o card visualmente em tempo real sem precisar refetchar —   
  otimismo no nível do board.                                                               

  K. Estado otimista (∆ MAIS COMPLETO QUE EXPANDED)                                         
  
  Notas (criação inicial)                                                                   
                  
  1. Antes do RPC retornar, modal insere tempNote em optimisticNotes (state local).         
  2. UI renderiza imediatamente: [...data.pareceres, ...optimisticNotes].
  3. Em erro: remove tempNote e restaura composer com texto digitado.                       
  4. Em sucesso: refreshCardSnapshot() atualiza data.pareceres; useEffect limpa             
  optimisticNotes quando data.pareceres muda.                                               

  Replies (respostas em thread)                                                             
 
  1. Mesma lógica — tempReply em optimisticNotes com parent_id.                             
  2. Sucesso: revolta com noteId real (do RPC).
  3. Erro: remove tempReply, alert.                                                         

  ▎ A PareceresList em si também tem otimismo próprio pra edit/delete (vimos ao ler         
  ▎ PareceresList.tsx). Modal adiciona uma camada extra pra criação inicial.

  L. Cache local em localStorage (∆ EXCLUSIVO)

  - Key: mz.pareceres.${cardId}.                                                            
  - Salva array de pareceres após cada refresh.
  - Lê e hidrata pareceres ao abrir modal antes do fetch (UX rápido).                       
  - Não substitui pareceres se backend retornar null/undefined — preserva UI em respostas   
  transitórias do backend.                                                                  

  M. Bloqueio de scroll do body                                                             
                  
  useEffect(() => {                                                                         
    if (open) {   
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return cleanup que restaura;                                                          
    }
  }, [open]);                                                                               

  N. Draft de parecer em IndexedDB (≡ Expandeds)                                            
  
  - Key: parecer:${cardId}:${currentUserId ?? 'self'}                                       
  - TTL 1h        
  - Migra 'self' → user quando user chega                                                   
  - Hidrata composer ao abrir / mudar de key
  - Flush no beforeunload E no fechamento do modal                                          
  - Limpa após submit bem-sucedido
  O. Campo de parecer

 Q. Sincronização do Kanban via syncDecisionStatus                  

  Ao decidir um parecer (/aprovado, /negado, /reanalise):                                   

  1. Chama setCardDecision(cardId, decision) RPC.                                           
  2. Fallback explícito: chama changeStage(cardId, 'analise', 
  '<aprovados|negados|reanalise>') mesmo após RPC. Comentário no código: "se triggers foram 
  removidas, mova o card explicitamente".
  3. Chama onStageChange?.() callback pra board atualizar.                                  

  ▎ ∆ Expandeds só fazem step 1 (confiam em triggers do banco). Modal faz step 1+2+3 —      
  ▎ comportamento "defensivo" pro caso de triggers terem sido removidas.

rupo 3 — UI (visual e layout)

  R. Overlay e Z-index

  fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm    ← backdrop
  fixed inset-0 z-[70] flex items-start justify-center ← container do modal                 

  - Backdrop: preto 40% + backdrop-blur-sm.                                                 
  - Backdrop NÃO fecha ao clicar (intencional ou bug — confirmar com produto).              
  - Sidebar tem z-[60], então fica entre backdrop e modal — visualmente o sidebar continua  
  acessível por trás (mas dentro do backdrop).                                              

  S. Caixa do modal                                                                         

  w-[96vw] sm:w-[95vw] max-w-[1280px]                                                       
  h-[90vh]
  bg-[var(--neutro)]                                                                        
  shadow-2xl                                                                                
  flex flex-col overflow-hidden
  border-radius: 28px                                                                       
  padding-top: pt-8 sm:pt-12
  padding-bottom: pb-6 sm:pb-8                                                              
  
  onClick com stopPropagation impede que clique interno feche.                              
 
  T. Header                                                                                 

  .header-editar-ficha (cor verde-primária do Mznet provavelmente)                          
  ├── Logo Mznet (Image /brand/mznet.png, 72x24px)                                          
  ├── Título "Editar Ficha"                                                                 
  ├── Subtítulo "Consultar e atualizar dados essenciais da ficha"                           
  └── Botão X (h-9 w-9, rounded-full, hover:bg-emerald-600/10)                              
           
  U. Conteúdo principal — layout                                                            
                  
  .flex h-full min-h-0                                                                      
  └── div.flex-1.basis-[62%]      ← 62% da largura usada
      ├── overflow-y-scroll        ← scroll vertical próprio (modal-scroll)                 
      ├── overscroll-contain       ← previne bubble pro body                                
      └── padding p-6 pb-12 sm:pb-16                                                        
          ├── statusText (se houver)                                                        
          ├── "Carregando..." OU formulário                                                 

  ▎ ∆ 38% lateral está vazio — modal não usa toda a largura. Provavelmente intencional pra  
  ▎ dar respiro lateral / estilo modal compacto. Ou é uma coluna direita que nunca foi      
  ▎ implementada.                                                                           
                  
  V. Layout dos campos (grid responsivo)                                                    
  
  ┌─────────────┬─────────────────────────┬─────────────────────────────────────────────┐   
  │    Linha    │       Grid (sm:)        │                   Campos                    │ 
  ├─────────────┼─────────────────────────┼─────────────────────────────────────────────┤   
  │ Nome + Doc  │ grid-cols-[3fr_2fr]     │ Nome do Cliente / Razão Social | CPF / CNPJ │ 
  ├─────────────┼─────────────────────────┼─────────────────────────────────────────────┤ 
  │ Contatos    │ grid-cols-3             │ Telefone | Whatsapp | E-mail                │   
  ├─────────────┼─────────────────────────┼─────────────────────────────────────────────┤   
  │ Endereço    │ grid-cols-[5fr_2fr_2fr] │ Logradouro | Número | Tipo de Instalação    │   
  │ (1)         │                         │                                             │   
  ├─────────────┼─────────────────────────┼─────────────────────────────────────────────┤ 
  │ Endereço    │ grid-cols-3             │ Complemento | Bairro | CEP                  │   
  │ (2)         │                         │                                             │
  ├─────────────┼─────────────────────────┼────────────────────
  │ Plano       │ grid-cols-4             │ Plano de Internet | Dia de vencimento | SVA │
  │             │                         │  Avulso | Carnê impresso                    │   
  ├─────────────┼─────────────────────────┼────────────────────
  │ Agendamento │ grid-cols-3             │ Feito em (disabled) | Instalação agendada   │
  │             │                         │ para | Horário                              │   
  ├─────────────┼─────────────────────────┼────────────────────
  │ Equipe      │ grid-cols-2             │ Vendedor (disabled) | Analistas (disabled)  │   
  ├─────────────┼─────────────────────────┼────────────────────
  │ Parecer     │ full-width              │ Label "Parecer" + FileUploadDropzone +      │
  │             │                         │ UnifiedComposer + PareceresList             │   
  └─────────────┴─────────────────────────┴────────────────────
    
  gap-4 entre células.
  grid-cols-1 em mobile (empilha tudo).

  W. CTA "Analisar"

  flex items-center justify-end gap-3
  [Span] "Clique aqui para:" (text-xs text-zinc-600)                                        
  [Button] "Analisar" (className btn-primary-mznet)                                         

  Posicionado acima do bloco de Informações Pessoais, alinhado à direita. Cor primária Mznet
   (verde).       
    
  X. Padrões visuais (≡ Expandeds via components/Fields.tsx)                                
  
  <Field> — mesmo do componente PF/PJ:                                                      
  - h-10 (∆ NÃO é o h-[21px] dos expandeds — modal usa altura padrão Tailwind)
  - bg-blue-100 border-zinc-400 rounded-[2px]                                               
  - Label: text-[14px] font-bold uppercase tracking-wide leading-none text-zinc-600 mb-1.5
      
  <Select> e <SelectAdv> — wrapper do SimpleSelect (∆ trigger h-10 rounded-[2px]            
  bg-blue-100).                                                                             
     
  Diferença chave: modal usa labels MAIORES (text-[14px]) que os expandeds (text-[9px]).    
  Modal é mais "respirado", expandeds são mais "ficha apertada".

  Y. Estado readOnly (leitor)                                                               
  
  - Wrapper interno do formulário: pointer-events-none opacity-80.                          
  - queueSave early-return.
  - flushAutosave descarta payload silenciosamente.                                         
  - Composer disabled.                                                                      
  - Botão Analisar continua clicável (abre expanded read-only).                             
   
  Z. Disabled visuais permanentes

  - "Feito em" (createdAt) — sempre disabled.                                               
  - "Vendedor" e "Analistas" — sempre disabled (são displays, não inputs).

-----

Etiqueta: 

Esse é um Novo cta que estou criando. 

O que ele é: 

- Cta "Etiquetas" fica dentro do Modal Editar ficha, abre um popover com as Etiquetas do Sistema, cada uma tem uma função. 
  
  
Etiqueta 1: 

Preenchida

Ao selecionar, via check, seleção, card fica Azul na UI até que alguém o mova para outa coluna.  

Local de Posição da UI: 

- Modal de editar ficha, canto superior esquerdo, contrário a cta: "Analisar"


-------------------

Histórico

1. Página /historico — biblioteca de fichas finalizadas. Apenas leitura/consulta, sem     
  edição. 
2. Quem acessa: todos os 5 roles. Decisão é só de produto (sem RLS específica
  restringindo).    
  3. Como chega aqui: sidebar item "Histórico" OU navegação direta /historico.
  4. 3 tipos de saída desde a tela:                                                         
    - Botão "Ver detalhes" → modal  de editar ficha com todas as infos e pareceres que foram criados para ela, e no lugar de "Analisar" -> "Resgatar Ficha"
    - Botão "Restaurar" → popover com 4 stages; chama restoreCard e abre o Kanban Análise em
   nova aba.                                                                              
    - Modal de detalhes → botão "Resgatar Ficha" → abre Expanded        

A. Ciclo de vida
                                                                                            
  1. Carregamento ao montar:                                                                
    a. listProfiles() (todos com role vendedor/analista/gestor).
    b. load() que chama RPC list_historico(p_search, p_date_start, p_date_end, p_status,    
  p_responsavel).                                                                           
    c. Após receber rows, enriquecimento em batches de 6: para cada row sem analista_name ou
   com status inválido, chama get_historico_details(p_card_id) e preenche analista_name     
  (autor do último parecer) e decision_status (último parecer com decisão > final_decision >
   decision_status > fallback "cancelada" se archived_at && !finalized_at).                 
  2. Recarrega automaticamente quando status ou responsavel mudam (useEffect dependendo
  desses 2). Busca e Período rodam via callback explícito.                                  
  3. Sem realtime — alterações em kanban_cards no banco não aparecem até reload manual.

  B. Filtros (4 + busca textual)      -> UI = a de Kanban

  Filtro: Busca por cliente                                                                 
  Estado: q (input)                                                                     
  Como dispara: load() manual + filtro local                                                
  Server-side ou client-side: RPC manda p_search; cliente também filtra applicant_name  
    localmente (case-insensitive)                                                       
  ────────────────────────────────────────                                                  
  Filtro: Período                                                                       
  Estado: dateRange: DateRangeValue ({start?, end?})                                        
  Como dispara: onDateRange chama load() imediato                                           
  Server-side ou client-side: RPC manda p_date_start = startOfDayUtcISO(start) e p_date_end 
  =                                                                                         
    endOfDayUtcISO(end ?? start)                                                        
  ────────────────────────────────────────
  Filtro: Status                                                                            
  Estado: status: string (""/aprovados/negados/canceladas)
  Como dispara: useEffect em mudança                                                        
  Server-side ou client-side: RPC manda p_status; cliente também refina (matchStatus) com
    aliases (aprovado/aprovados, negado/negados, cancelada/canceladas)
  ────────────────────────────────────────
  Filtro: Responsáveis                                                                      
  Estado: resp: string (UUID do profile)
  Como dispara: useEffect em mudança                                                        
  Server-side ou client-side: RPC manda p_responsavel = profile.full_name (nome, não UUID);
    cliente refina por vendedor_id === resp || analista_id === resp

  ▎ ⚠ Inconsistência: RPC list_historico recebe p_responsavel como full_name (texto), mas o 
  ▎ filtro local compara IDs (vendedor_id/analista_id). Funciona porque o server retorna 
  ▎ apenas cards do responsável certo e o client refina ainda mais. Decisão pro novo:       
  ▎ alinhar — RPC deveria receber UUID.
  
  
   Ação "Ver detalhes"    ao clicar no Olhinho na primeira COluna da tabela, abre Modal de Editar fichas daquela ficha, com todos as INfos. 
   
  Ação "Restaurar ficha": 
    
   Abre modal central: Restaurar ficha com 2 CAMPOS: 
   
   Kanban (Popover com: Comercial/Análise)
   
   Coluna (Popover com as colunas daquela Área do Kanban)

Ação: "Resgatar ficha" => Substitui o CTA "Analisar". Tem a mesma ação, abrir a ficha em outra ABA.

Forma de visualização: Tabela

Colunas: 

Ver -> Icon de olho/view -> Abre modal de editar ficha
Cliente -> Nome do cliente
Documento-> CPF/CNPJ
Status da análise-> Aprovado/Negado/Cancelado
Vendedor -> Nome do vendedor
Analista -> Nome do analista
Data da Decisão -> Data da decisão
Restaurar ficha -> Ação de restaurar ficha.

UI da Tabela: 

npx shadcn-ng@latest add https://www.originui-ng.com/r/table-03.json

Code

import { Component } from '@angular/core';
import {
    OriTable,
    OriTableBody,
    OriTableCell,
    OriTableFooter,
    OriTableHead,
    OriTableHeader,
    OriTableRow
} from '~/components/ui/table';

@Component({
    selector: 'demo-table-03',
    imports: [
        OriTable,
        OriTableHeader,
        OriTableRow,
        OriTableHead,
        OriTableBody,
        OriTableCell,
        OriTableFooter
    ],
    template: `
        <div class="relative w-full overflow-auto">
            <table oriTable>
                <thead class="bg-transparent" oriTableHeader>
                    <tr class="hover:bg-transparent" oriTableRow>
                        <th oriTableHead>Name</th>
                        <th oriTableHead>Email</th>
                        <th oriTableHead>Location</th>
                        <th oriTableHead>Status</th>
                        <th class="text-right" oriTableHead>Balance</th>
                    </tr>
                </thead>
                <tbody class="table-row h-2" aria-hidden="true"></tbody>
                <tbody class="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg" oriTableBody>
                    @for (item of items; track item) {
                        <tr class="odd:bg-muted/50 odd:hover:bg-muted/50 border-none hover:bg-transparent" oriTableRow>
                            <td class="py-2.5 font-medium" oriTableCell>{{ item.name }}</td>
                            <td class="py-2.5" oriTableCell>{{ item.email }}</td>
                            <td class="py-2.5" oriTableCell>{{ item.location }}</td>
                            <td class="py-2.5" oriTableCell>{{ item.status }}</td>
                            <td class="py-2.5 text-right" oriTableCell>{{ item.balance }}</td>
                        </tr>
                    }
                </tbody>
                <tbody class="table-row h-2" aria-hidden="true"></tbody>
                <tfoot class="bg-transparent" oriTableFooter>
                    <tr class="hover:bg-transparent" oriTableRow>
                        <td [colSpan]="4" oriTableCell>Total</td>
                        <td class="text-right" oriTableCell>$2,500.00</td>
                    </tr>
                </tfoot>
            </table>
            <p class="text-muted-foreground mt-4 text-center text-sm">Striped table</p>
        </div>
    `
})
export default class Table03Component {
    readonly items = [
        {
            id: '1',
            name: 'Alex Thompson',
            email: 'alex.t@company.com',
            location: 'San Francisco, US',
            status: 'Active',
            balance: '$1,250.00'
        },
        {
            id: '2',
            name: 'Sarah Chen',
            email: 'sarah.c@company.com',
            location: 'Singapore',
            status: 'Active',
            balance: '$600.00'
        },
        {
            id: '3',
            name: 'James Wilson',
            email: 'j.wilson@company.com',
            location: 'London, UK',
            status: 'Inactive',
            balance: '$650.00'
        },
        {
            id: '4',
            name: 'Maria Garcia',
            email: 'm.garcia@company.com',
            location: 'Madrid, Spain',
            status: 'Active',
            balance: '$0.00'
        },
        {
            id: '5',
            name: 'David Kim',
            email: 'd.kim@company.com',
            location: 'Seoul, KR',
            status: 'Active',
            balance: '-$1,000.00'
        }
    ];
}

---------------------

Campo do Parecer

O que é: 

O campo de Parecer é o campo cujo analistas e gestores dão o Parecer de uma Análise. Nele, existem alguns CTAs que são chamados através do Comando de "/" = ao Notion. 

Que são eles: 

/Aprovado
/Negado
/Reanalise
/Anexo
@Menção

Esse campo fica localizado em: 

Editar modal de ficha: Abaixo de todos os outros campos
Expanded ficha PF e PJ abaixo de todos os campos
Editar modal de ficha do Histórico

Além dos CTAs ele tem uma estruutra de conversa, onde ao ser enviado ele vai cascateando e descendo em todos os Locais em que ele se encontra. O objetivo é criar uma forma de analistas e gestores consigam conversar entre seus pareceres, de uma forma que um Possa responder o Parecer do Outro, como se fosse o Whatsapp;

Regras de comportamento


A. Estrutura do valor

  type ComposerValue = {
    decision: 'aprovado' | 'negado' | 'reanalise' | null;                                   
    text: string;                            // texto puro com @menções inline              
    mentions?: { id?: string; label: string }[];  // metadata das menções
  };                                                                                        
  
  Source of truth divididos:                                                                
  - valueState (React state).
  - rootRef.current.innerHTML (DOM contenteditable).                                        
  - Sincronizados via applyStateToDOM(val) que serializa HTML a partir de val.

  B. Slash commands (/aprovado, /negado, /reanalise, /anexo)

  Detecção        

  - Regex: /\/([\w]*)$/ aplicada em getPrecedingText(root) (texto antes do cursor).         
  - Trigger só funciona se / está no fim do texto + pode ter palavra parcial depois.
  - Dispara onCommandTrigger(query, rect) → parent abre <CmdDropdown>.                      

  Auto-aceitar com Enter                                                                    
  1. Usuário digita /apr e tecla Enter.                                                     
  2. handleKeyDown extrai query e chama onAcceptCommand('apr').
  3. Parent filtra: ['aprovado','negado','reanalise','anexo'].filter(k => k.includes('apr'))
   → 1 match.                                                                               
  4. Match único → executa ação (set decision OU abre file picker) E retorna true.          
  5. Composer não submete o parecer (retornou true).                                        
  6. Múltiplos matches → retorna false → submete normalmente (com /apr no texto).           
 
  Fallback interno (se parent não aceitar)                                                  
 
  handleKeyDown tem fallback embutido para aprovado/negado/reanalise (não inclui anexo):    
  const found = ['aprovado','negado','reanalise'].filter(k => k.includes(q));
  if (found.length === 1) {                                                                 
    cleanText = val.text.replace(/\s*\/[\w]*$/, '').trimEnd();                              
    setValue({ decision: found[0], text: cleanText });        
    return; // não submete                                                                  
  }               

  Comportamentos por comando

  ┌────────────┬────────────────────────────┬─────────────────
  │  Comando   │       Ação imediata        │                Side effect                │
  ├────────────┼─────────────
  │ /aprovado  │ Chip "Aprovado" verde +    │ No submit: chama                          │
  │            │ remove /aprovado do texto  │ set_card_decision('aprovado')             │
  ├────────────┼────────────────────────────┼──────────────────
  │ /negado    │ Chip "Negado" vermelho +   │ No submit: chama                          │
  │            │ remove do texto            │ set_card_decision('negado')               │   
  ├────────────┼────────────────────────────┼──────────────────
  │ /reanalise │ Chip "Reanálise" amarelo + │ No submit: chama                          │   
  │            │  remove do texto           │ set_card_decision('reanalise')            │   
  ├────────────┼────────────────────────────┼──────────────────
  │ /anexo     │ Abre file picker hidden    │ Files vão pra parecerPendingFiles; upload │   
  │            │ (não exibe chip)           │  acontece no submit                       │   
  └────────────┴────────────────────────────┴──────────────────  Chip de decisão                                                                           
  
  - Renderizado dentro do contenteditable como <span class="decision-chip {variant}"        
  contenteditable="false" data-role="decision-chip"> + <button 
  data-role="decision-remove">X</button>.                                                   
  - 3 variants: primary (aprovado verde), destructive (negado vermelho), warning (reanalise
  amber).                                                                                   
  - Sempre seguido de <br><br> (2 quebras) antes do texto.
  - Clique no X → handler handleClick detecta data-role="decision-remove", seta decision:   
  null.                                                                                     
  - Backspace nativo que apaga o chip do DOM → handleInput detecta ausência do
  [data-role="decision-chip"] e zera decision.                                              
                  
  C. Menções (@Nome)                                                                        
                  
  Detecção                                                                                  
  
  - Regex: /@([\w\s]*)$/ em getPrecedingText(root).                                         
  - Suporta nome com espaço (até match).
  - Dispara onMentionTrigger(query, rect) → parent abre <MentionDropdown>.                  

  Filtro no dropdown                                                                        

  - Exclui o próprio usuário (filter p.id !== currentUserId).                               
  - Filtra por full_name.includes(query) case-insensitive.
  - Agrupa por role em 5 buckets: Gestor → Analista → Vendedor → Instalador → Outros.       
  - Normaliza variações: gestao/gerente → gestor; analise → analista; vendas/comercial →
  vendedor; instalacao/tecnico → instalador.                                                
       
  Inserção do chip                                                                          
 
  - Encontra o @xxx no texto via preceding.match(/@([\w\s]*)$/).                            
  - Substitui por @<labelNbsp> onde labelNbsp tem espaços trocados por NBSP \u00A0.
  - Garante 1 espaço normal depois do chip pra cursor ficar fora.                           
  - Aplica mentionLockRef.current = true pra evitar trigger imediato no próximo input.      
  - Adiciona à array mentions[] em state.                                                   
 
  Auto-aceitar com Enter                                                                    
                  
  - Mesma lógica do command: onAcceptMention(query) → parent filtra → se único match, insere
   e retorna true.
 
  Renderização    

  - renderTextWithMentions(text, mentions) percorre mentions[] em ordem, busca o token no   
  texto (com NBSP OU espaço normal), substitui por <span class="mention-chip" 
  data-role="mention-chip" data-label="@{labelEscaped}"                                     
  data-id="{id}">@{labelEscaped}</span>.
  - Texto entre menções: escape HTML + \n vira <br/>.
    
    D. Submit (Enter)

  1. Enter (sem Shift) → preventDefault
  2. Se mention popover aberto + único match: insere mention, NÃO submete
  3. Se command popover aberto + único match: aplica decisão/anexo, NÃO submete             
  4. Fallback interno: detecta /aprovado|/negado|/reanalise único match                     
  5. Sem popover ativo: extrai val = getCurrentValue()                                      
  6. Bloqueia se: !decision && !text.trim() && !hasPendingAttachments                       
  7. onSubmit(val) → parent chama RPC add_parecer                                           

  Shift+Enter: nova linha (não submete).                                                    
  Escape: onCancel().

  E. Toolbar Rich Text (apenas se richText=true)

  ┌──────────────────────────┬─────────────────────────────────
  │          Botão           │                         Comando                          │
  ├──────────────────────────┼─────────────────────────────────
  │ Dropdown "Aa"            │ document.execCommand('formatBlock', false,               │
  │                          │ '<P>'|'<H1>'|...'<H4>')                                  │
  ├──────────────────────────┼─────────────────────────────────
  │ B (negrito)              │ document.execCommand('bold')                             │   
  ├──────────────────────────┼─────────────────────────────────
  │ I (itálico)              │ document.execCommand('italic')                           │   
  ├──────────────────────────┼─────────────────────────────────
  │ Dropdown "Mais" → Lista  │ document.execCommand('insertUnorderedList')              │   
  │ marcadores               │                                                          │
  ├──────────────────────────┼─────────────────────────────────
  │ Dropdown "Mais" → Lista  │ document.execCommand('insertOrderedList')                │
  │ numerada                 │                                                          │   
  └──────────────────────────┴─────────────────────────────────
  Estado dos botões reflete document.queryCommandState(...) via listener selectionchange.

  ▎ ⚠ document.execCommand foi marcado como obsoleto pela W3C. Browsers ainda suportam, mas 
  ▎ não há garantia futura. Tiptap usa Selection API moderna.
    
  F. Paste / Drop de arquivos                                                               
  
  - enablePasteAttachment=true + paste com clipboardData.files ou items com kind='file' →   
  previne paste normal, chama onFilesPasted(files) OU onRequestAttachment().
  - enableDropAttachment=true + drag-over: dropEffect='copy' + overlay verde "Solte para    
  anexar".                                                                                  
  - enableDropAttachment=true + drop com files → onFilesDropped(files) OU
  onRequestAttachment().                                                                    
  - Se nem enablePasteAttachment nem enableDropAttachment → paste normal vira texto via
  insertTextAtCursor.                                                                       
                  
  G. Cursor visível (ensureCaretVisible)                                                    
                  
  Depois de qualquer input, calcula posição do cursor relativo ao container e ajusta        
  scrollTop para mantê-lo visível (8px de padding).

  H. Submit flow no parent (add_parecer)                                                    
  
  1. Captura cardId em closure local (NÃO do state global)                                  
  2. payloadText = hasDecision && !text ? `[decision:${decision}]` : text                   
  3. Insere tempNote em optimisticNotes                                                     
  4. Limpa parecerPendingFiles                                                              
  5. Reset composer: setValue({decision:null, text:'', mentions:[]})                        
  6. Limpa drafts em IndexedDB                                                              
  7. RPC add_parecer(cardId, payloadText, parentId, decision)
  8. Se sucesso + arquivos: uploadAttachmentBatch({cardId, noteId, files})                  
  9. Se decisão: chama set_card_decision (sincroniza coluna do kanban)                      
  10. Se erro em qualquer ponto: reverte tempNote, restaura texto no composer, alert        

  I. Drafts em IndexedDB

  - Key: parecer:${cardId}:${currentUserId ?? 'self'}.                                      
  - Persiste apenas { text, decision } (mentions são derivadas do texto).
  - TTL: 1 hora.                                                                            
  - Hidrata composer ao abrir o modal/page (uma vez por cardId).                            
  - Migra parecer:${cardId}:self → parecer:${cardId}:${userId} quando user chega.           
  - Flush no beforeunload E no fechamento do modal.                                         
  - Limpa após submit OK.                                                                   

  J. Estado otimista

  - optimisticNotes (state local do parent) — array de pareceres ainda não confirmados pelo 
  banco.
  - UI renderiza [...data.pareceres, ...optimisticNotes].                                   
  - Limpa optimisticNotes quando data.pareceres muda (refresh do backend).                  
  - Reverte em erro do RPC.                               
    
    
    
    
    
    K. Estrutura visual
                                                                                            
  .composer-root.composer-root--blue    ← container azul (variant comum)
  └── .relative                                                                             
      ├── .composer-toolbar (se richText) ← absolute top-left, z-10
      ├── .composer-input                  ← contenteditable                                
      │   ├── .decision-chip {variant}    ← chip de decisão (se houver)                     
      │   ├── .mention-chip × N           ← chips de menções                                
      │   └── texto + <br>                                                                  
      └── .composer-placeholder           ← absolute, aria-hidden, se vazio
                                                                                            
  L. Variants de chip de decisão                                                            
                                                                                            
  ┌───────────┬────────────────────────────┬────────────────────────┐                       
  │  Decisão  │           Classe           │          Cor           │
  ├───────────┼────────────────────────────┼────────────────────────┤
  │ Aprovado  │ decision-chip--primary     │ Verde (~`emerald-500`) │
  ├───────────┼────────────────────────────┼────────────────────────┤
  │ Negado    │ decision-chip--destructive │ Vermelho (~`red-500`)  │                       
  ├───────────┼────────────────────────────┼────────────────────────┤                       
  │ Reanálise │ decision-chip--warning     │ Amber (~`amber-500`)   │                       
  └───────────┴────────────────────────────┴────────────────────────┘                       
                  
  Cada chip: label + botão X com SVG M6 18L18 6 M6 6l12 12.                                 
  
  M. Variants de chip de menção                                                             
                  
  - Classe .mention-chip em globals.css.                                                    
  - Atributo data-role="mention-chip", data-label="@Nome", data-id="<uuid>" (opcional).
  - Cor verde clara, padding pequeno, inline.                                               
                                                                                            
  N. Toolbar (richText)                                                                     
                                                                                            
  - Posição absoluta top-left dentro do container, z-10.                                    
  - Botões: dropdown Aa, B, I, dropdown "Mais".
  - Estado ativo: classe is-active (cor diferente).                                         
  - Padding-top do input ajustado para 50px quando toolbar visível.
                                                                                            
  O. Placeholder                                                                            
                                                                                            
  - position: absolute, left: 16px, top: 14px (ou 50px se richText).                        
  - pointerEvents: none, aria-hidden="true".
  - Some quando há texto OU decisão.                                                        
  
  P. Drop overlay (quando enableDropAttachment + dragging)                                  
                  
  position: absolute, inset: 0                                                              
  border: 2px dashed var(--verde-primario, #018942)
  borderRadius: 14px                                                                        
  background: rgba(1,137,66,0.04)
  flex center, fontSize: 12, fontWeight: 600                                                
  texto: "Solte para anexar"                                                                
  pointerEvents: none                                                                       
                                                                                            
  Q. Dropdowns (CmdDropdown + MentionDropdown)                                              
  
  <CmdDropdown>                                                                             
                  
  - Largura w-64 (256px) ou w-[260px] (versão antiga).                                      
  - Header com busca interna (input com ícone lupa).
  - Grupos: "Decisão da análise" (aprovado/negado/reanalise) + "Ações" (anexo).             
  - Cada item: ícone + label.
  - Variantes de hover por categoria: cmd-menu-item--primary (verde), --destructive         
  (vermelho), --warning (amber).                                                            
  - ARIA: role="listbox", items role="option", search é role="combobox".                    
                                                                                            
  <MentionDropdown>
                                                                                            
  - Mesma largura w-64.
  - Header com busca + ícone lupa.
  - Agrupa por role: Gestor / Analista / Vendedor / Instalador / Outros.                    
  - Cada item: <button> com {full_name} ({role}).                                           
  - ARIA semelhante.                                                                        
  - Pode receber excludeIds (para excluir o próprio user — já passa filtrado do parent      
  hoje).                                                                                    
                                                                                            
  ---                                                                                       
  Grupo 4 — Boas práticas que um sênior aplica (a NOVIDADE)
                                                                                            
  Esta é a parte que vamos elevar no novo. Cada item categorizado por prioridade.
                                                                                            
  🔴 Críticas (sem isso, o bug P0 do parecer volta)                                         
                                                                                            
  B1. Isolamento absoluto por cardId                                                        
                  
  <UnifiedComposer                                                                          
    key={cardId}            // ← força remount ao trocar de ficha
    cardId={cardId}         // ← prop OBRIGATÓRIA                                           
    onSubmit={(val) => handleSubmit(cardId, val)}  // ← cardId em closure
  />                                                                                        
                  
  - key={cardId} no parent garante que trocar de ficha desmonta o composer e remonta limpo. 
  - cardId capturado no submit handler (closure local, não state).
  - Service único services/parecer.ts — todas as 6 chamadas atuais passam por ele.          
                                                                                            
  B2. Cleanup completo no unmount
                                                                                            
  useEffect(() => {
    return () => {                                                                          
      // Cancelar debounce pendente
      debounceRef.current?.cancel();                                                        
      // Descartar buffer (não persistir no draft)
      pendingTextRef.current = null;                                                        
      // Fechar popovers
      setMentionOpen(false);                                                                
      setCommandOpen(false);                                                                
    };
  }, []);                                                                                   
                  
  B3. Single source of truth pra estado                                                     
  
  Problema atual: valueState (React) + rootRef.innerHTML (DOM) divergem em casos extremos   
  (paste de HTML, undo nativo).
                                                                                            
  Solução: ou Tiptap (DOM é source) ou state-driven (React é source, DOM é deriv). Não os   
  dois.
                                                                                            
  B4. Sanitização de paste                                                                  
  
  function sanitizePastedHTML(html: string): string {                                       
    // Usar DOMPurify
    return DOMPurify.sanitize(html, {                                                       
      ALLOWED_TAGS: ['br', 'b', 'i', 'p'],
      ALLOWED_ATTR: []                                                                      
    });           
  }                                                                                         
                  
  Hoje: insertTextAtCursor(clipboardData.getData('text/plain')) — extrai só texto, OK. Mas  
  se algum dia mudar pra text/html, vira XSS.
                                                                                            
  🟡 Importantes (qualidade visual + UX)

  B5. Acessibilidade completa                                                               
  
  ┌──────────────────────────┬─────────┬────────────────────────────────────┬───────────┐   
  │         Atributo         │  Onde   │                Hoje                │  Sênior   │
  ├──────────────────────────┼─────────┼────────────────────────────────────┼───────────┤   
  │ aria-label no            │ sim     │ sim                                │ mantém    │
  │ contenteditable          │         │                                    │           │   
  ├──────────────────────────┼─────────┼────────────────────────────────────┼───────────┤
  │ aria-multiline="true"    │ sim     │ sim                                │ mantém    │   
  ├──────────────────────────┼─────────┼────────────────────────────────────┼───────────┤
  │                          │         │ apontar pra texto explicativo "Use │           │   
  │ aria-describedby         │ não     │  @ pra mencionar e / para          │ adicionar │
  │                          │         │ comandos"                          │           │   
  ├──────────────────────────┼─────────┼────────────────────────────────────┼───────────┤
  │ aria-busy durante submit │ não     │ true enquanto RPC roda             │ adicionar │
  ├──────────────────────────┼─────────┼────────────────────────────────────┼───────────┤
  │ aria-live para anúncios  │ não     │ "Decisão Aprovado adicionada",     │ adicionar │   
  │                          │         │ "Menção Felipe inserida"           │           │
  ├──────────────────────────┼─────────┼────────────────────────────────────┼───────────┤   
  │ Foco gerenciado          │ parcial │ restaurar foco após fechar         │ melhorar  │   
  │                          │         │ dropdown                           │           │
  └──────────────────────────┴─────────┴────────────────────────────────────┴───────────┘   
                  
  B6. Navegação por teclado nos dropdowns                                                   
  
  Hoje: dropdowns mostram items, mas setas ↑↓ não navegam — só clique ou auto-aceite por    
  Enter. cmdk dá isso de graça.
                                                                                            
  Sênior:         
  <Command shouldFilter={true}>
    <CommandInput value={query} onValueChange={setQuery} />
    <CommandList>                                                                           
      <CommandGroup heading="Decisão da análise">                                           
        {decisions.map(d => <CommandItem onSelect={...}>{d.label}</CommandItem>)}           
      </CommandGroup>                                                                       
    </CommandList>                                                                          
  </Command>      
                                                                                            
  Setas, Enter, Escape — tudo nativo.
                                                                                            
  B7. Feedback visual de loading
                                                                                            
  Hoje: após Enter, composer limpa imediatamente (otimismo); se RPC falhar volta o texto via
   setValue — usuário fica confuso.
                                                                                            
  Sênior:         
  {submitting && (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm grid place-items-center">
      <Loader2 className="animate-spin" />                                                 
    </div>                                                                                  
  )}      
                                                                                            
  OU manter texto e desabilitar enquanto envia, e só limpar quando confirmar.
  
  11. Componentização                                                                      
   
  Composer → 3 sub-responsabilidades, hoje todas dentro do mesmo arquivo:                   
  12. Editor (input + render).
  13. Toolbar (botões de formatação).                                                        
  14. Triggers (detecção de / e @).  
                                                                                            
  Separar em 3 componentes facilita teste, swap (Tiptap vs custom) e reuso.
                                                                                            
  B12. Hook custom useParecerComposer
                                                                                            
  const { value, setValue, submit, reset, draft, isDraftLoaded } = useParecerComposer({
    cardId,                                                                                 
    initialValue,
    onSubmit,                                                                               
  });                                                                                       
   
  Encapsula draft + debounce + cleanup. Composer vira "burro" (só renderiza).               
                  
  B13. Memoização de regex                                                                  
                  
  Hoje: regex compilada inline a cada detectTriggers (chamada em cada keystroke).           
   
  Sênior:                                                                                   
  const MENTION_RE = /@([^\s@]+(?:\u00A0[^\s@]+)*)/g;
  const COMMAND_RE = /\/([\w]*)$/;                   
        
  Compilar fora do componente. Performance em texto longo.                                  

  B14. Throttle no detectTriggers                                                           

  const detectTriggers = useThrottle(_detectTriggers, 50);  // 50ms throttle                
                                    
  Em texto longo (3k+ chars), regex em cada keystroke vira gargalo no input.                

  B15. Portal pra popovers                                                                  
                  
  Hoje: popovers usam absolute z-50. Pode ficar atrás de outros elementos com z-index maior.
   
  Sênior:                                                                                   
  <Portal>        
    <CmdDropdown style={{ position: 'fixed', top, left }} />                                
  </Portal>                                                 

  Renderiza no document.body. Sem batalha de z-index.                                       
   
  B16. Telemetria                                                                           
                  
  Eventos a registrar:                                                                      
  - parecer_submitted (com decision, has_attachments, is_reply, text_length).
  - slash_command_used (qual comando).                                                      
  - mention_inserted (sem PII).       
  - parecer_edit_started, parecer_edit_cancelled.                                           
  - parecer_delete_started.                                                                 
  - composer_submit_error (com error.code).                                                 
 
 B18. NBSP — substituir por estrutura

  Hoje: menções compostas usam \u00A0 (NBSP) no texto pra não quebrar. Funciona mas é frágil:
  - Regex precisa conhecer NBSP.
  - Copy/paste pra fora do app vira "espaço estranho".
  - Search no banco precisa unaccent + replace NBSP.

  Sênior: usar Tiptap com extension Mention que armazena como nó próprio (não no texto).
  Texto plain serializado limpo.

  B19. Validação no banco também

  Front bloqueia submit vazio, mas o banco também deve validar (RPC add_parecer deve rejeitar
   texto vazio sem decisão).

  B20. Concorrência

  Cenário: 2 analistas escrevendo parecer no mesmo card simultaneamente. Hoje, um sobrescreve
   o outro só se ambos editarem o mesmo parecer existente (banco usa FOR UPDATE). Mas o front
   mostra data.pareceres desatualizado pra B se A acabou de inserir.

  Sênior: realtime no kanban_cards.reanalysis_notes (já existe nos canais rt-*-card-*)
  garante que B vê o parecer de A em segundos. OK como está, só vale documentar.

	