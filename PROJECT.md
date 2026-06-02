# Facio — Painel de Operations

> Uma ferramenta interna que troca planilhas, prints e mensagens soltas no Slack por um painel único, editável pelo próprio time e embedado direto no Notion onde a equipe já trabalha.

---

## O problema

O time de Operations da Facio convivia com dois pontos de atrito recorrentes:

1. **Conhecimento espalhado.** Links importantes (Retool, dashboards, runbooks, canais críticos) viviam em DMs, blocos do Notion isolados, favoritos do navegador de cada pessoa. Onboarding novo demorava porque cada atendente reconstruía esse mapa do zero.
2. **Regras de cobrança fora do código mas fora de mão.** A árvore de decisão de inadimplência (faixa de atraso → ação → desconto) existia num flowchart estático. Quando a regra mudava — uma faixa de desconto nova, uma ação que não rola mais — alguém da gestão dependia de dev pra atualizar, ou aceitava o desencontro entre o desenho e o que o time realmente fazia.

Os dois problemas têm o mesmo formato: **conteúdo operacional que muda com frequência, gerido por gente não-técnica, mas que precisa estar visível, atualizado e auditável em um lugar só.**

---

## A solução

Um painel React único com duas ferramentas, embedado no Notion via `/embed` e plugado no Supabase em tempo real:

### 1. Dashboard de Operações
Sidebar com **grupos → seções → links**, totalmente editável inline pelo próprio time. Sem PR, sem deploy, sem dev. Quem tem acesso à página do Notion edita direto no painel.

### 2. Árvore de Cobrança
Fluxo conversacional que guia o atendente pela decisão de inadimplência. Em vez de um flowchart estático, o atendente responde uma pergunta por vez, vê a próxima aparecer, e no fim recebe a ação recomendada — com cálculo automático de desconto baseado no valor da contratação. **Tudo editável** por um painel admin embutido na própria ferramenta.

### Tela inicial
Um launcher com dois cards no centro. O usuário escolhe qual das ferramentas quer abrir.

---

## Por que isso resolve

| Dor | Como o painel resolve |
|---|---|
| Onboarding lento por dispersão de links | Sidebar única, sempre atualizada, embedada na página que o time já abre todo dia |
| Mudança de regra de cobrança bloqueada em dev | Painel admin permite gestão editar nó, opção, desconto e ação terminal — sem código |
| Divergência entre flowchart e prática real | A única fonte da verdade é o banco; o flowchart É a UI que o time usa |
| Re-acesso ao mesmo conhecimento por canais diferentes | Embed no Notion = está onde a pessoa já estava |
| Múltiplos atendentes editando ao mesmo tempo | Realtime nativo do Supabase propaga mudança pra todos sem refresh |
| Auth duplicada (mais um login) | Sem auth própria. Quem entra no Notion entra no painel — o controle de acesso já existe lá |

---

## Decisões de produto

Algumas escolhas que moldaram o projeto e merecem destaque:

**Conversational UI em vez de diagrama com galhos.**
A primeira versão da árvore renderizava o flowchart inteiro com galhos visíveis. Funcionava, mas obrigava o atendente a procurar o galho certo no meio de um desenho. Refatoramos pra UI de chat linear: uma pergunta por vez, resposta vira pill alinhada à direita, próxima pergunta aparece logo abaixo. Mesma informação, fricção zero.

**Edição inline, não modal "abrir editor".**
Cada elemento (workspace, grupo, seção, link, nó da árvore) é editado no mesmo lugar onde aparece. Click-to-edit no título, pencil no hover do link, "+ Novo grupo" inline no fim da sidebar. Reduz o caminho mental entre "isso está errado" e "consertei".

**Sem autenticação própria.**
O Notion já controla quem acessa a página. Construir login no painel seria refazer trabalho e criar mais um lugar pra revogar acesso quando alguém sai. Delegar é a decisão certa.

**Optimistic update em todas as mutações.**
Quando o time edita algo, a UI responde no mesmo frame. O Supabase confirma em background; se falhar, rollback automático. Sem spinners, sem latência percebida.

**Realtime como default, não como feature.**
Toda subscription Supabase está sempre ligada. Se a gestão edita um nó da árvore, o atendente que está no meio do fluxo vê a próxima pergunta atualizada sem refresh. Coordenação por construção, não por aviso.

---

## O que foi entregue

O projeto foi construído em sprints incrementais. Cada sprint termina em algo testável de ponta a ponta antes da próxima começar.

### Bloco 1 — Fundação (Sprints 0–3) ✅
- Projeto Vite + React 19 + TS + Tailwind v4 bootstrapado.
- Cliente Supabase configurado, `.env` e schema inicial.
- 4 tabelas + RLS + Realtime no banco.
- Hooks de leitura (`useWorkspace`, `useGroups`, `useSections`, `useLinks`) com subscription Realtime.
- Páginas Home e SectionPage renderizando dados reais.
- Tema claro/escuro com persistência em `localStorage`.
- Click-to-edit no nome do workspace — primeiro fluxo de escrita validado.

### Bloco 2 — CRUD completo do dashboard (Sprints 4–6) ✅
- **Grupos:** criar, renomear, deletar (com `on delete cascade` removendo seções e links).
- **Seções:** modal com nome, ícone (picker visual de 49 Tabler icons), descrição, mover entre grupos.
- **Links:** modal com label, URL e ícone. Pencil aparece no hover do link sem quebrar o clique no `<a>`.
- Optimistic update + rollback em todos os mutates.

### Bloco 3 — Launcher e Árvore inicial (Sprints 11–13) ✅
- Tela inicial com dois cards (Dashboard / Árvore de Cobrança).
- Transição animada entre views com Framer Motion.
- Primeira versão da árvore com galhos expandindo conforme escolhas.
- Wizard interativo com estado `path: string[]`, "Recomeçar", auto-scroll suave.

### Bloco 4 — Refator pra Conversational UI (Sprint 15) ✅
- `<CollectionTree />` reescrito como renderização linear baseada no `path`.
- Cards de chat para cada pergunta, opções como pílulas, resposta selecionada alinhada à direita.
- Card "Ação recomendada" destacado com tom (success/warning) e cálculo de desconto preservado.
- Botões "Voltar uma etapa" e "Recomeçar" no rodapé.
- Componentes antigos (`QuestionBranch`, `SubBranch`, `VerticalLine`, `QuestionNode`) removidos.

### Bloco 5 — Árvore persistida + admin (Sprints 16–17) ✅
- Tabelas `flow_nodes` e `flow_options` no Supabase, com RLS, Realtime e integridade referencial.
- Seed manual dos 11 nós e 10 opções da Facio em SQL idempotente.
- Hook `useFlow()` combina as duas tabelas, expõe `{ nodes, rootNodeId, loading, error }` e assina Realtime.
- `<FlowEditor />` — painel admin completo:
  - Lista lateral de nós ordenada (raiz → perguntas → ações).
  - Edição de pergunta com título, subtítulo, opções inline (label + dropdown de `next`), reordenação, deletar.
  - Edição de ação terminal com título, descrição, tom, toggle de cálculo de desconto (multiplier + label).
  - Criar nó via prompt do botão "+ Pergunta" / "+ Ação".
  - Deletar com validação: bloqueia se for raiz ou se outras opções apontam pra ele.
  - "Definir como raiz" para nós-pergunta — atualiza o `is_root` atomicamente.
  - Toasts de sucesso/erro com cor por tom, auto-dismiss em 3.2s.

---

## Estado atual

- ✅ Dashboard de Operações com CRUD completo (workspace, grupos, seções, links).
- ✅ Árvore de Cobrança com Conversational UI e painel admin completo.
- ✅ Realtime em todas as tabelas — mudanças propagam pra todos os clientes.
- ✅ Tema claro/escuro persistido.
- ✅ Deploy parcial na Cloudflare Pages.
- ⏳ Falta: reordenação por drag-and-drop (Sprint 7), polish do modo edição (Sprint 8), validação final do embed no Notion (Sprint 9), chatbot (Sprint 10 — Fase 3).

---

## Visão técnica resumida

Stack completa em [STACK.md](STACK.md). TL;DR:

- **Frontend:** React 19 + TypeScript + Vite + Tailwind v4 + Framer Motion + Tabler Icons.
- **Backend:** Supabase (PostgreSQL + Realtime + RLS), sem código de servidor próprio.
- **Hospedagem:** Cloudflare Pages, embedado no Notion via `/embed`.
- **Auth:** delegada ao Notion (sem login próprio).

### Modelo de dados

```
workspace
├── groups
│   └── sections
│       └── links
└── flow_nodes (question | result)
    └── flow_options (next_node_id → flow_nodes)
```

- Integridade garantida em SQL: cascade nos grupos, restrict no destino das opções, unique no `is_root`.
- Tudo editável pelo painel — o banco é só onde o conteúdo mora, não onde precisa ser mexido.

---

## Identidade visual

**Paleta:**
| | |
|---|---|
| Facio Blue `#3F6AE3` | Cor primária, botões, destaque ativo |
| Menta `#3FE1B6` | Acentos, dot do logo, sucesso |
| Carbono `#1E252F` | Background dark / sidebar |
| Coral `#E13F6A` | Alertas, canais críticos |
| Sun `#FEC553` | Avisos, faixas de atenção |

**Tema:** claro e escuro com toggle persistido. Funciona dentro do iframe do Notion.

**Logo:** duas versões (dark sobre azul, light sobre off-white) — sempre com o dot menta.

---

## Próximos passos

| Sprint | Foco |
|---|---|
| 7 | Reordenação por drag-and-drop (dnd-kit) em grupos, seções e links |
| 8 | Polish do modo edição: confirmação antes de deletar, toasts globais, empty states ilustrados, validação de URL |
| 9 | Validar embed final no Notion, headers da Cloudflare, env vars de produção |
| 10 | Chatbot (Fase 3): widget flutuante, base de conhecimento alimentada via modo edição, integração com LLM |

Sequência sugerida: **7 → 8 → 9 → 10**.


