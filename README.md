# Operations Dashboard

Painel interno com duas ferramentas: um **dashboard de links editável** e uma **árvore de decisão conversacional**. Embedado em qualquer iframe (ex: Notion via `/embed`). Sem autenticação própria — o controle de acesso é delegado à plataforma que faz o embed.

---

## Fluxo geral

```
Usuário acessa a página que embeda o painel
→ launcher com 2 cards aparece no centro
→ escolhe Dashboard de Operações OU Árvore de Decisão
→ usa a ferramenta (visualizar ou editar inline)
→ mudanças são salvas no Supabase
→ todos os clientes recebem as atualizações em tempo real
→ botão "voltar" retorna ao launcher
```

---

## As duas ferramentas

### Dashboard de Operações

Sidebar com **grupos → seções → links**, totalmente editável inline. Qualquer pessoa com acesso à página pode renomear grupos, criar seções com ícone e descrição, e adicionar ou editar links — sem PR, sem deploy.

### Árvore de Decisão

Fluxo conversacional que guia o usuário por uma sequência de perguntas até uma ação recomendada. Em vez de um diagrama com galhos, cada pergunta aparece como card de chat; a resposta escolhida vira pill alinhada à direita; a próxima pergunta aparece abaixo. Ao chegar num nó terminal, exibe a ação recomendada com calculadora automática (quando configurada).

**Tipos de cálculo nos nós terminais:**

| Tipo | Inputs | Saída |
|---|---|---|
| Desconto Antecipação | Valor da contratação | Desconto = valor × taxa |
| Acordo CF | Valor total da dívida + valor já pago | Acordo = total − pago − (total × taxa) |

Todo o conteúdo — perguntas, opções, ações e cálculos — é editável pelo painel admin embutido na própria ferramenta.

---

## Rodando localmente

```bash
npm install
npm run dev
```

**Pré-requisitos:**
- `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Migrações aplicadas no Supabase Studio na ordem:
  1. `supabase/0001_initial_schema.sql`
  2. `supabase/0002_seed.sql`
  3. `supabase/0003_replace_emoji_icons.sql`
  4. `supabase/0004_collection_flow.sql`
  5. `supabase/0005_collection_flow_seed.sql`
  6. `supabase/0006_calc_type.sql`
  7. `supabase/0007_update_flow_calcs.sql`

---

## Arquitetura

```
src/
├── components/        # UI compartilhada (Sidebar, NavItem, ItemRow, Logo, ThemeToggle…)
├── editor/            # Componentes de edição inline (GroupHeader, SectionEditor, LinkEditor, FlowEditor)
├── pages/             # Telas (Launcher, Home, SectionPage, CollectionTree)
├── hooks/             # Lógica de dados (useWorkspace, useGroups, useSections, useLinks, useFlow, useTheme)
├── lib/               # Cliente Supabase
└── types/             # Tipos TypeScript globais

supabase/              # Migrações SQL (schema, seeds, patches)
```

### Modelo de dados

```
workspace
├── groups
│   └── sections
│       └── links
└── flow_nodes (question | result)
    └── flow_options (→ flow_nodes)
```

**`flow_nodes`** — nós do fluxo de decisão:
- `type`: `question` (pergunta com opções) ou `result` (ação terminal)
- `multiplier`: taxa de desconto (ex: `0.10` para 10%)
- `calc_type`: `antecipacao` | `acordo_cf` | `null` — determina qual calculadora exibir
- `is_root`: único nó raiz por fluxo

**`flow_options`** — arestas do grafo: `node_id → next_node_id`

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Estilo | Tailwind v4 |
| Animações | Framer Motion |
| Ícones | Tabler Icons |
| Banco | Supabase (PostgreSQL + Realtime + RLS) |
| Hospedagem | Cloudflare Pages |

---

## Permissões

Sem autenticação própria. Quem tem acesso ao contexto que embeda o painel (ex: página do Notion) tem acesso a tudo — incluindo o modo de edição. Controle de acesso é responsabilidade da plataforma externa.

---

## Tema

Claro e escuro com toggle discreto. Preferência salva em `localStorage` e persiste entre sessões, inclusive dentro do iframe.
