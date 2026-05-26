# Facio — Operations Dashboard

## Visão geral

Painel interno da Facio que reúne duas ferramentas usadas pelo time de Operations:

1. **Dashboard de Operações** — centraliza links, processos e instruções (grupos, seções e links editáveis).
2. **Árvore de Cobrança** — fluxo conversacional que guia o atendente pela decisão de inadimplência (pergunta → botões de resposta → próxima pergunta → ação final). Editável por gestão sem mexer em código.

A tela inicial é um **launcher** com as duas opções no centro. Hospedado na Cloudflare Pages e incorporado via `/embed` no Notion. O controle de acesso é feito pelo próprio Notion — quem tem acesso à página já é da equipe e pode visualizar e editar.

---

## Conceito

```
Equipe acessa o Notion
→ página tem o painel embedado via /embed
→ launcher com 2 cards aparece no centro
→ escolhe Dashboard de Operações OU Árvore de Cobrança
→ usa a ferramenta (visualizar ou editar)
→ salva no Supabase
→ todo mundo vê atualizado em tempo real
→ botão "voltar" retorna pro launcher a qualquer momento
```

---

## Rodando localmente

```bash
cd facio-dashboard
npm install
npm run dev
```

Pré-requisitos:
- `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Migrações `supabase/0001_initial_schema.sql`, `0002_seed.sql`, `0003_replace_emoji_icons.sql`, `0004_collection_flow.sql` e `0005_collection_flow_seed.sql` aplicadas no Supabase Studio (ordem importa)

---

## Permissões

Sem autenticação própria. O Notion já controla quem acessa o quê. Quem tem acesso à página do Notion tem acesso ao dashboard — incluindo o modo de edição.

---

## O que é editável

```
Workspace
└── Nome (ex: "Facio")

Grupos
└── Criar, renomear, reordenar, deletar
    (ex: Atendimento, Gestão, Docs & Time)

Seções
└── Criar, renomear, trocar ícone
└── Mover de grupo
└── Reordenar, deletar
    (ex: Canais críticos, Ferramentas)

Links
└── Criar, editar label, trocar URL
└── Trocar ícone
└── Reordenar, deletar
```

---

## Árvore de Cobrança

Segunda ferramenta do painel. Representa o fluxo de decisão usado pelo time de cobrança da Facio: dado o número de dias de atraso de um cliente, decide qual ação tomar.

**Formato de exibição:** Conversational UI linear. Em vez de um diagrama com galhos, o atendente vê **uma pergunta por vez** em formato de card de chat, escolhe a resposta entre botões e a próxima pergunta aparece logo abaixo. Quando o caminho chega num nó terminal, mostra a ação recomendada destacada. Botões "voltar uma etapa" e "recomeçar" sempre disponíveis.

**Editabilidade:** Todo o conteúdo — texto das perguntas, botões de resposta, próximos passos, ações terminais e descontos — é alterado por um painel admin dentro da própria ferramenta. Sem PR no código. Pessoa responsável de Operations mantém o fluxo.

**Ações terminais possíveis:**
- Gerar boleto (`charges` no Retool) — atraso 1-28 dias com aceite de pagamento parcial
- Direcionar para parcelamento pelo App em até 4x — atraso de 30 dias
- Oferecer desconto progressivo conforme faixa de atraso:

| Faixa de atraso | Desconto | Multiplicador do valor da contratação |
|---|---|---|
| 60–89 dias | 10% | × 0,90 |
| 90–119 dias | 20% | × 0,80 |
| 120–149 dias | 30% | × 0,70 |
| 150–179 dias | 50% | × 0,50 |
| Acima de 180 dias | 70% | × 0,20 ⚠️ (revisar — esperado × 0,30) |

> ⚠️ A última linha tem inconsistência aritmética no source original (70% off deveria ser × 0,30, mas o flowchart diz × 0,20). Tratar como bug a confirmar com Operations antes do deploy do wizard.

### Fonte canônica do fluxo

O fluxo vive nas tabelas Supabase **`flow_nodes`** e **`flow_options`** (esquema na seção "Modelo de dados"). O hook [`useFlow()`](src/hooks/useFlow.ts) lê as duas tabelas, combina em `Record<string, FlowNode>` e assina realtime — qualquer alteração no banco (manual no Studio ou pelo painel admin da Sprint 17) reflete na UI sem refresh.

Tipos no front (em `src/hooks/useFlow.ts`):

- `question` — texto da pergunta + lista de opções (cada opção tem `label` e aponta para o `next`)
- `result` — ação terminal (com `tone` para destaque visual e `multiplier` opcional p/ calcular valor com desconto)

O conteúdo inicial é semeado pela migração [`supabase/0005_collection_flow_seed.sql`](supabase/0005_collection_flow_seed.sql).

---

## Stack

| Camada | Tecnologia | Motivo |
|---|---|---|
| Frontend | React + TypeScript | Estado complexo, modo edição inline, base para o chatbot |
| Build | Vite | Já na stack, dev server rápido |
| Hospedagem | Cloudflare Pages | Já na stack |
| Banco de dados | Supabase | Persistência e sincronização em tempo real |
| Estilo | Tailwind | Agilidade para montar os dois modos (visualização e edição) |
| Ícones | `@tabler/icons-react` | Conjunto consistente de ícones SVG (line) com tree-shaking |
| Automações | Make (Integromat) | Integrações futuras se necessário |

### Por que React + TypeScript e não vanilla JS?

O projeto tem dois modos de interface (visualização e edição) com estado compartilhado e dados vindos de API. Na Fase 3 entra um chatbot, que adiciona mais camadas de estado. Vanilla JS é tecnicamente possível mas vira um problema de manutenção. React + TypeScript resolve de forma limpa desde o início.

### Compatibilidade com /embed do Notion

O Vite gera arquivos estáticos (HTML + CSS + JS). O Notion não sabe que é React — carrega como qualquer URL. JavaScript executa normalmente dentro do iframe, Supabase conecta sem restrições. O botão de edição funciona inline sem precisar abrir nova aba ou mudar de URL.

---

## Arquitetura do projeto

```
facio-dashboard/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx            # Menu lateral com grupos, seções e edição inline
│   │   ├── PageContent.tsx        # Área de conteúdo principal
│   │   ├── NavItem.tsx            # Item do menu lateral (com slot de ações no hover)
│   │   ├── ItemRow.tsx            # Linha de link clicável
│   │   ├── EditButton.tsx         # Botão que ativa o modo edição
│   │   ├── Icon.tsx               # Resolver Tabler Icons + lista pro picker
│   │   ├── Logo.tsx               # Logo Facio (azul + dot menta)
│   │   ├── ThemeToggle.tsx        # Botão sol/lua para alternar tema
│   │   └── Chatbot.tsx            # (fase 3) Widget do chatbot
│   ├── editor/
│   │   ├── GroupHeader.tsx        # Header do grupo com rename inline + deletar
│   │   ├── NewGroupButton.tsx     # Botão "+ Novo grupo" da sidebar
│   │   ├── NewSectionButton.tsx   # Botão "+ Nova seção" por grupo
│   │   ├── SectionEditor.tsx      # Modal completo (nome, ícone, descrição, grupo, deletar)
│   │   ├── LinkEditor.tsx         # Modal criar/editar/deletar link (label, URL, ícone)
│   │   └── FlowEditor.tsx         # Painel admin da Árvore (lista de nós + form + toasts)
│   ├── pages/
│   │   ├── Launcher.tsx           # Tela inicial com os 2 cards (Dashboard / Árvore)
│   │   ├── Home.tsx               # Dashboard com os cards de seções
│   │   ├── SectionPage.tsx        # Página genérica de seção
│   │   └── CollectionTree.tsx     # Fluxo conversacional de cobrança (Conversational UI)
│   ├── lib/
│   │   └── supabase.ts            # Client do Supabase
│   ├── hooks/
│   │   ├── useWorkspace.ts        # Workspace + updateName
│   │   ├── useGroups.ts           # Grupos + CRUD
│   │   ├── useSections.ts         # Seções + CRUD (rename, ícone, descrição, mover, deletar)
│   │   ├── useLinks.ts            # Links + CRUD com realtime
│   │   ├── useFlow.ts             # Fluxo de cobrança (flow_nodes + flow_options) com realtime
│   │   └── useTheme.ts            # Hook de tema persistente
│   ├── types/
│   │   └── index.ts               # Tipos TypeScript do projeto
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── 0001_initial_schema.sql      # Tabelas do dashboard + RLS + Realtime
│   ├── 0002_seed.sql                # Seed do dashboard (grupos, seções, links)
│   ├── 0003_replace_emoji_icons.sql # Migração: troca emojis legados por nomes Tabler
│   ├── 0004_collection_flow.sql     # Tabelas flow_nodes + flow_options + RLS + Realtime
│   └── 0005_collection_flow_seed.sql # Seed do fluxo de cobrança
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

---

## Modelo de dados (Supabase)

### Tabela `workspace`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária |
| name | text | Nome exibido (ex: "Facio") |

### Tabela `groups`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária |
| name | text | Nome do grupo (ex: "Atendimento") |
| order | int | Ordem de exibição |
| created_at | timestamp | Data de criação |

### Tabela `sections`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária |
| group_id | uuid | FK para groups |
| name | text | Nome da seção (ex: "Canais críticos") |
| icon | text | Classe do ícone (Tabler Icons) |
| description | text | Subtítulo opcional |
| order | int | Ordem dentro do grupo |
| created_at | timestamp | Data de criação |

### Tabela `links`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária |
| section_id | uuid | FK para sections |
| label | text | Texto exibido |
| url | text | URL do Notion ou externo |
| icon | text | Ícone opcional |
| order | int | Ordem dentro da seção |
| created_at | timestamp | Data de criação |

### Tabela `flow_nodes` (sprint 16)
| Campo | Tipo | Descrição |
|---|---|---|
| id | text | Chave primária (slug curto, ex: `start`, `q_aceitou`, `r_desc_10`) |
| type | text | `question` ou `result` |
| title | text | Texto principal exibido |
| subtitle | text | Subtítulo da pergunta (só `question`) |
| description | text | Descrição auxiliar (só `result`) |
| detail | text | Detalhe técnico, ex: "Valor da contratação × 0,90" |
| tone | text | `success` / `neutral` / `warning` (só `result`) |
| multiplier | numeric | Multiplicador do valor da contratação (opcional) |
| multiplier_label | text | Label visual do multiplicador, ex: "× 0,90" |
| is_root | bool | `true` no nó raiz do fluxo (único por tabela) |
| created_at | timestamp | Data de criação |

### Tabela `flow_options` (sprint 16)
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária |
| node_id | text | FK para `flow_nodes` (pergunta que oferece a opção) |
| label | text | Texto do botão de resposta |
| next_node_id | text | FK para `flow_nodes` (próximo nó ao escolher) |
| order | int | Ordem de exibição |
| created_at | timestamp | Data de criação |

---

## Sprints

Entrega incremental — cada sprint termina em algo testável de ponta a ponta antes da próxima começar.

### Sprint 0 — Bootstrap ✅
- [x] Vite + React + TypeScript inicializado
- [x] Tailwind v4 configurado (`@tailwindcss/vite`)
- [x] Cliente Supabase + `.env`/`.env.example`
- [x] Estrutura de pastas (`components/`, `editor/`, `pages/`, `lib/`, `hooks/`, `types/`)
- [x] Hook de tema com persistência em `localStorage`
- [x] Componentes base (Sidebar, NavItem, PageContent, ItemRow, EditButton, ThemeToggle, Logo)

### Sprint 1 — Schema + leitura ✅
- [x] SQL de migração rodado no Supabase (4 tabelas + RLS + Realtime)
- [x] Hooks `useWorkspace`, `useGroups`, `useSections`, `useLinks` com subscription realtime
- [x] Páginas Home e SectionPage renderizando dados do Supabase

### Sprint 2 — Seed de dados reais ✅
- [x] Arquivo `.sql` com grupos, seções e links reais da Facio
- [x] Validar navegação Home → SectionPage com conteúdo verdadeiro
- [x] Validar realtime (editar uma row no Supabase Studio e ver atualizar no front)

### Sprint 3 — Editar nome do workspace ✅
- [x] Click-to-edit no título da sidebar (Enter salva, Esc cancela)
- [x] Persistência no Supabase com update optimistic (rollback se falhar)
- [x] Primeiro fluxo de escrita validado

### Sprint 4 — CRUD de grupos ✅
- [x] Botão "+ Novo grupo" inline no fim da sidebar (modo edição)
- [x] Click-to-edit no nome do grupo
- [x] Ícone de lixeira no hover com `confirm()` nativo antes de deletar
- [x] `on delete cascade` no banco remove seções e links junto

### Sprint 5 — CRUD de seções ✅
- [x] "+ Nova seção" por grupo abre modal `SectionEditor`
- [x] Modal cobre nome, ícone (picker visual), descrição e grupo (mover entre grupos)
- [x] Pencil/lixeira no hover de cada seção; deletar pede confirmação
- [x] 49 ícones Tabler disponíveis no picker (substituem os emojis do seed)
- [x] Migração `0003_replace_emoji_icons.sql` atualiza ícones de seeds antigos

### Sprint 6 — CRUD de links ✅
- [x] `useLinks` estendido com `createLink` / `updateLink` / `deleteLink` (mesmo padrão de `useSections` — optimistic update + rollback)
- [x] [`LinkEditor`](src/editor/LinkEditor.tsx) — modal com label, URL, picker de ícone (49 Tabler) + botão deletar com `confirm()`
- [x] `ItemRow` ganhou prop `onEdit?` — botão pencil aparece no hover do row sem quebrar o `<a>` (stopPropagation no click)
- [x] `SectionPage` no modo edição mostra "Novo link" no fim e pencil em cada link existente

### Sprint 7 — Reordenação
- [ ] Drag-and-drop (dnd-kit) ou setas para grupos, seções e links
- [ ] Update em lote do campo `order`

### Sprint 8 — Polish do modo edição
- [ ] Confirmação antes de deletar
- [ ] Toasts de sucesso/erro
- [ ] Estados de loading e empty state ilustrado
- [ ] Validação de URL

### Sprint 9 — Deploy + embed no Notion
- [ ] Build de produção testado
- [ ] Configuração da Cloudflare Pages (env vars no painel)
- [ ] Headers permitindo iframe no Notion
- [ ] Teste do `/embed` na página do Notion

### Sprint 10 — Chatbot (Fase 3)
- [ ] Widget flutuante no dashboard
- [ ] Base de conhecimento alimentada via modo edição
- [ ] Integração com API de LLM (modelo a definir)

### Sprint 11 — Launcher (tela inicial com 2 opções) ✅
- [x] Navegação por estado local em `App` (sem React Router — overhead desnecessário pro escopo atual)
- [x] Componente `<Launcher />` com 2 cards no centro (Dashboard de Operações / Árvore de Cobrança)
- [x] Header compacto com Logo + ThemeToggle + botão "Início" visível em todas as telas
- [x] Transição entre views animada com `framer-motion`

### Sprint 12 — Árvore de Cobrança: estrutura de dados + UI inicial ✅
- [x] Decisão: descartar Mermaid. JSON tipado direto em `src/data/collectionFlow.ts` (tipos `FlowNode` = `question | result`)
- [x] Seed manual do fluxo da Facio a partir do flowchart original
- [x] Componente `<CollectionTree />` renderiza a árvore com pergunta-raiz e galhos expandindo conforme escolhas
- [x] Botões pras opções, destaque visual da escolha selecionada, "Recomeçar"
- [x] Nós terminais: cards com tom (`success`/`warning`) + input "valor da contratação" + cálculo automático com `multiplier`

> **Substituída pela Sprint 15:** a UI de árvore com galhos foi trocada por Conversational UI linear.

### Sprint 13 — Wizard interativo básico ✅
- [x] Estado `path: string[]` rastreia caminho percorrido
- [x] Cliques avançam pra próxima pergunta; nó terminal mostra ação destacada
- [x] Botão "Recomeçar" reseta o estado
- [x] Auto-scroll suave conforme o caminho avança

### Sprint 14 — CRUD de seções avançado (pendente, baixa prioridade)
- [ ] Reabrir se necessário; hoje o `SectionEditor` (Sprint 5) cobre o caso.

### Sprint 15 — Árvore de Cobrança: refator pra Conversational UI linear ✅
- [x] `<CollectionTree />` reescrito como renderização linear baseada no `path` (função `buildSteps` percorre o fluxo do root até o nó atual)
- [x] Cada pergunta vira card de chat: bubble com a pergunta + botões redondos das opções; ao escolher, a opção vira pill alinhada à direita
- [x] Nó terminal vira card "Ação recomendada" destacado (success / warning) com cálculo de desconto preservado
- [x] Botões "Voltar uma etapa" + "Recomeçar" no rodapé
- [x] Animações `framer-motion` por card (`opacity` + `y`) e por opção
- [x] Componentes antigos (`QuestionBranch`, `SubBranch`, `VerticalLine`, `QuestionNode`) removidos

### Sprint 16 — Persistência do fluxo no Supabase ✅
- [x] Migração [`0004_collection_flow.sql`](supabase/0004_collection_flow.sql): tabelas `flow_nodes` (PK text) + `flow_options` (FK com `on delete restrict` no `next_node_id` pra impedir refs órfãs), unique index garantindo um único `is_root`, RLS anon + Realtime
- [x] Seed [`0005_collection_flow_seed.sql`](supabase/0005_collection_flow_seed.sql) com os 11 nós e 10 opções do fluxo atual (idempotente — `on conflict do nothing` nos nós, `delete + re-insert` nas opções pra resetar caminhos)
- [x] Hook [`useFlow()`](src/hooks/useFlow.ts) retorna `{ nodes, rootNodeId, loading, error }` combinando as duas tabelas, com subscription realtime nas duas
- [x] `<CollectionTree />` consome o hook (estados de loading, erro e empty state quando não há nó raiz)
- [x] `src/data/collectionFlow.ts` deletado

### Sprint 17 — Painel admin do fluxo ✅
- [x] `EditButton` no header da Árvore alterna entre modo "wizard" e modo "edição"
- [x] [`FlowEditor`](src/editor/FlowEditor.tsx) com layout 2 colunas: lista lateral de nós (ordenada raiz → perguntas → ações) e form do nó selecionado
- [x] Editor de **pergunta**: título + subtítulo (uncontrolled inputs com commit no blur), lista de opções com edição inline do label, dropdown de `next`, mover ↑/↓, deletar, e linha "Nova opção" inline
- [x] Editor de **ação terminal**: título + descrição, seletor de `tone` (success/neutral/warning), toggle "tem cálculo de desconto?" que revela `multiplier` + `multiplier_label`
- [x] Criar nó (pergunta ou ação) via prompts no botão "+ Pergunta" / "+ Ação"
- [x] Deletar nó com `confirm()` + validação no hook: bloqueia se for raiz ou se outras opções apontam pra ele (mensagem informa quantas)
- [x] "Definir como raiz" disponível em nós-pergunta não-raiz; o hook zera o `is_root` anterior e seta o novo
- [x] Toasts de sucesso/erro auto-dismiss em 3.2s, com cor por tom
- [x] Realtime já vinha da Sprint 16 — mudanças no editor refletem em quem está vendo o wizard

---

## Próximos passos

Estado atual: dashboard de Operações com CRUD completo (Sprints 0–6) + Árvore de Cobrança com Conversational UI editável (11, 12, 13, 15, 16, 17). Deploy parcial: já está no Cloudflare Pages mas alguns ajustes da Sprint 9 ainda faltam (testar embed, headers, etc.). Próximos focos:

- **Sprint 7 — Reordenação** + **Sprint 8 — Polish**: melhorias do modo edição do dashboard.
- **Sprint 9 — Deploy**: validar `/embed` no Notion, configurar headers, conferir env vars no painel da CF.
- **Sprint 10 — Chatbot** (Fase 3): widget + base de conhecimento + LLM.

Sequência sugerida: **7** → **8** → **9** (finalizar embed) → **10**.

---

## Identidade visual

### Paleta de cores

| Nome | Hex | Uso |
|---|---|---|
| Facio Blue | `#3F6AE3` | Cor primária, destaques, botões |
| Menta | `#3FE1B6` | Acentos, ícones ativos, dot do logo |
| Carbono | `#1E252F` | Background dark, header dark |
| Grafite | `#333333` | Superfícies secundárias dark |
| Off-white | `#E5E5E5` | Background light, logo light |
| Sky Blue | `#75A7FA` | Estados hover, links, ícones |
| Coral | `#E13F6A` | Alertas, canais críticos |
| Sun | `#FEC553` | Avisos, destaques secundários |

### Logo

Duas versões:
- **Dark** — fundo Facio Blue (`#3F6AE3`), letra `f` branca, dot Menta
- **Light** — fundo Off-white (`#E5E5E5`), letra `f` Carbono, dot Menta

O dot Menta é constante nas duas versões.

### Temas

O sistema terá suporte a tema claro e escuro. A preferência será salva localmente no navegador do usuário.

**Tema escuro (padrão)**
| Elemento | Cor |
|---|---|
| Background principal | `#191919` |
| Background sidebar | `#1E252F` (Carbono) |
| Superfície de cards | `#262626` |
| Texto primário | `#E8E8E6` |
| Texto secundário | `#9B9B96` |
| Bordas | `rgba(255,255,255,0.07)` |
| Destaque ativo | `#3F6AE3` (Facio Blue) |

**Tema claro**
| Elemento | Cor |
|---|---|
| Background principal | `#F5F5F5` |
| Background sidebar | `#E5E5E5` (Off-white) |
| Superfície de cards | `#FFFFFF` |
| Texto primário | `#1E252F` (Carbono) |
| Texto secundário | `#666660` |
| Bordas | `rgba(0,0,0,0.08)` |
| Destaque ativo | `#3F6AE3` (Facio Blue) |

### Troca de tema

Botão discreto no dashboard (ícone de sol/lua) que alterna entre claro e escuro. Preferência salva em `localStorage` e persiste entre sessões — inclusive dentro do embed no Notion.
