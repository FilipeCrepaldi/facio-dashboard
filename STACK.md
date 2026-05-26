# Stack Técnica — Facio Dashboard

Referência única das tecnologias, versões e decisões de infraestrutura usadas no projeto.

---

## Visão geral

| Camada | Tecnologia | Versão |
|---|---|---|
| Linguagem | TypeScript | ~6.0 |
| Framework UI | React | 19.2 |
| Build / Dev server | Vite | 8.0 |
| Estilo | Tailwind CSS (plugin Vite) | 4.3 |
| Animações | Framer Motion | 12.40 |
| Ícones | `@tabler/icons-react` | 3.44 |
| Backend / DB | Supabase (PostgreSQL + Realtime + RLS) | client `@supabase/supabase-js` 2.106 |
| Hospedagem | Cloudflare Pages | — |
| Embed | iframe `/embed` no Notion | — |
| Lint | ESLint + typescript-eslint + plugins React Hooks / React Refresh | 10.x / 8.x |

---

## Frontend

### Linguagem e framework
- **React 19** com hooks funcionais, sem class components.
- **TypeScript 6** em modo estrito (`tsconfig.app.json`) — todas as props, hooks e tabelas Supabase são tipados.
- **Vite 8** como bundler e dev server (HMR instantâneo). Build de produção gera estáticos puros (HTML + CSS + JS) — requisito do embed do Notion.

### Estilo
- **Tailwind CSS v4** via `@tailwindcss/vite` (plugin oficial, sem `tailwind.config.js` — config inline em CSS).
- Tema claro/escuro via CSS variables (`--color-bg`, `--color-text`, `--color-facio-blue`, etc.) trocadas por classe `dark` no `<html>`.
- Preferência de tema persistida em `localStorage` (hook `useTheme`) — funciona dentro do iframe do Notion.

### Animações
- **Framer Motion 12** para:
  - Transição entre views (launcher / dashboard / árvore) com `AnimatePresence`.
  - Aparição em cascata dos cards e botões da Conversational UI.
  - Micro-interações nos botões (`whileHover`, `whileTap`).

### Ícones
- **Tabler Icons React 3** — biblioteca SVG line consistente, com tree-shaking automático.
- Componente `Icon.tsx` centraliza o resolver: aceita nome string e devolve o componente correto. Também exporta lista pro picker visual usado nos editores.

### Roteamento
- **Sem React Router.** Navegação por estado local (`useState<View>`) — overhead desnecessário pro escopo (3 views).
- Justificativa documentada na Sprint 11.

---

## Backend (Supabase)

### Banco
- **PostgreSQL gerenciado** pelo Supabase.
- 6 tabelas:
  - `workspace`, `groups`, `sections`, `links` — dashboard de Operações.
  - `flow_nodes`, `flow_options` — árvore de cobrança.
- Migrações versionadas em `supabase/000X_*.sql` (5 migrações no momento, ordem importa).

### Realtime
- Subscription ativa em todas as tabelas via `@supabase/supabase-js`.
- Cada hook (`useGroups`, `useSections`, `useLinks`, `useFlow`, `useWorkspace`) registra um `channel` que escuta INSERT / UPDATE / DELETE e atualiza o estado local.
- Edição feita por qualquer usuário propaga em tempo real para todos os clientes conectados.

### Segurança
- **RLS (Row-Level Security)** habilitado em todas as tabelas.
- Policies permitem leitura/escrita para o role `anon` — controle de acesso é delegado ao Notion (quem vê a página vê o painel).
- `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (anon key — sem `service_role` no frontend).

### Integridade
- `on delete cascade` em `groups → sections → links` (deletar um grupo limpa toda a hierarquia).
- `on delete restrict` em `flow_options.next_node_id` (impede deletar um nó que ainda é destino de outra opção).
- Unique index garantindo um único `is_root = true` em `flow_nodes`.

---

## Hospedagem e deploy

- **Cloudflare Pages** — build estático servido na borda.
- Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) configuradas no painel da CF.
- Headers ajustados para permitir embed em iframe (`X-Frame-Options` removido / CSP `frame-ancestors`).
- Embed final exposto via URL pública, incorporada no Notion com `/embed`.

---

## Arquitetura interna

### Estrutura de pastas
```
src/
├── components/   # UI compartilhada (Logo, Sidebar, ItemRow, EditButton, etc.)
├── editor/       # Modais e painéis do modo edição (SectionEditor, LinkEditor, FlowEditor, …)
├── pages/        # Views de alto nível (Launcher, Home, SectionPage, CollectionTree)
├── hooks/        # Acesso a dados + estado (useWorkspace, useGroups, useSections, useLinks, useFlow, useTheme)
├── lib/          # Clients externos (supabase.ts)
└── types/        # Tipos TS dos modelos Supabase
```

### Padrão dos hooks de dados
Todos os hooks de leitura/escrita seguem o mesmo contrato:
- Carregam o estado inicial com `select()`.
- Assinam canal Realtime e fazem merge incremental.
- Expõem mutações com **optimistic update + rollback** em caso de erro.
- Retornam `{ data, loading, error, create*, update*, delete* }`.

### Modo edição
- Cada page tem um `EditButton` que alterna um state `editing` local.
- Quando ativo, revela controles inline (rename, picker de ícone, lixeira, drag handle futuro).
- Não usa rotas separadas — UX inline reduz fricção pro time de Operations.

---

## Ferramentas de desenvolvimento

| Tool | Função |
|---|---|
| `npm run dev` | Vite dev server (`http://localhost:5173`) com HMR |
| `npm run build` | TS check (`tsc -b`) + bundle de produção (`vite build`) → `dist/` |
| `npm run preview` | Servir `dist/` localmente para sanity check pré-deploy |
| `npm run lint` | ESLint (flat config — `eslint.config.js`) com regras de Hooks e React Refresh |

---

## Decisões técnicas-chave (com motivo)

| Decisão | Por quê |
|---|---|
| React + TS em vez de vanilla JS | Dois modos de UI (view + edição) com estado compartilhado, Realtime, e chatbot na Fase 3. Vanilla ficaria insustentável. |
| Tailwind v4 em vez de v3 | v4 elimina config JS e tem build muito mais rápido via plugin Vite. |
| Supabase em vez de backend próprio | Realtime out-of-the-box + Postgres real + RLS — 80% do backend de graça. Sem precisar manter API. |
| Sem React Router | 3 views, navegação por estado local. Adicionar router é peso desnecessário. |
| Sem auth própria | Controle de acesso já existe no Notion. Replicar = re-trabalho e mais um lugar pra dar manutenção. |
| `flow_nodes.id = text` (slug) em vez de uuid | Slug é legível no painel admin (`q_aceitou`, `r_desc_10`) e simplifica o seed manual da migração `0005`. |
| Optimistic update em todos os mutates | UI responde instantaneamente; o rollback cobre o caminho de erro. Sem spinner em cada clique. |
| Tabler Icons | Conjunto consistente line-style + tree-shaking + 4k+ ícones cobrindo qualquer caso do picker. |
| Framer Motion | API declarativa pra animação coordenada (cascata de opções, troca de views). CSS puro não cobriria. |

---

## Pré-requisitos para rodar local

```bash
cd facio-dashboard
npm install
cp .env.example .env   # preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

Aplicar as migrações no Supabase Studio em ordem:
1. `0001_initial_schema.sql`
2. `0002_seed.sql`
3. `0003_replace_emoji_icons.sql`
4. `0004_collection_flow.sql`
5. `0005_collection_flow_seed.sql`
