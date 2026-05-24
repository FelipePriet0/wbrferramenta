1. Identidade de cada feature (o que é, em 1 frase)
 ┌─────────────────┬───────────────────────────────────┬──────
  │     Feature     │                               É                 │                       Para              │    
  ├─────────────────┼───────────────────────────────────┼──────  
  │ Kanban          │ Visão diária de trabalho — onde   │ Mover cards entre etapas, ver │ 
  │ (Comercial +    │ vendedor, analista, gestor e      │  atrasos, abrir fichas        │    
  │ Análise)        │ instalador "passam o dia"         │                               │    
  ├─────────────────┼───────────────────────────────────┼──────
  │ Modal de Editar │ Edição rápida dos dados           │ Pequenos ajustes de contato,  │    
  │  Ficha          │ essenciais do cliente, sem sair   │ agendamento, parecer rápido   │    
  │                 │ do Kanban                         │                               │ 
  ├─────────────────┼───────────────────────────────────┼──────
  │ Expanded Ficha  │ A ficha completa do cliente,      │ Trabalho profundo: preencher  │ 
  │ (PF/PJ)         │ página inteira                    │ todos os campos, escrever     │    
  │                 │                                   │ parecer, decidir              │ ├─────────────────┼───────────────────────────────────┼───── 
  │                 │ Biblioteca de fichas já           │ Consultar o passado,          │
  │ Histórico       │ finalizadas (aprovadas, negadas,  │ restaurar para o fluxo,       │    
  │                 │ canceladas)                       │ resgatar pra estudo           │
  └─────────────────┴───────────────────────────────────┴──────

 2. Como cada feature se conecta com as outras
    
    A. Kanban → Modal de Editar Ficha
    
     Quando: clique simples em qualquer card. 
     Como: Via card no Kanban. Sempre que uma ficha/cliente é criado em "+ Nova ficha" um card no kanban é criado com os campos descritos na Spec e ao clicar abre: Modal Editar ficha
     
     
  B. Kanban → Modal editar ficha -> Expanded Ficha
    
Quando: Existem duas formas de acessar Expanded FIcha: 

Via modal de editar ficha: 

CARD KANBAN -> Modal editar ficha -> "Analisar" -> Abre expanded em outra aba

+Nova ficha -> Modal: Qual tipo de ficha deseja criar? -> Dados Pessoais Básicos (PF ou PJ) -> Expanded PF ou PJ.

