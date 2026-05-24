-- ============================================================
-- Facio Dashboard — Árvore de Cobrança (fluxo persistido)
-- Sprint 16
-- Executar em: Supabase → SQL Editor → New query
-- Idempotente. Rodar ANTES de 0005_collection_flow_seed.sql.
-- ============================================================

-- ------------------------------------------------------------
-- Tabelas
-- ------------------------------------------------------------

create table if not exists public.flow_nodes (
  id               text primary key,
  type             text not null check (type in ('question','result')),
  title            text not null,
  subtitle         text,
  description      text,
  detail           text,
  tone             text check (tone in ('success','neutral','warning')),
  multiplier       numeric,
  multiplier_label text,
  is_root          boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Garante no máximo um nó raiz por fluxo.
create unique index if not exists flow_nodes_single_root_idx
  on public.flow_nodes (is_root)
  where is_root = true;

create table if not exists public.flow_options (
  id           uuid primary key default gen_random_uuid(),
  node_id      text not null references public.flow_nodes(id) on delete cascade,
  label        text not null,
  next_node_id text not null references public.flow_nodes(id) on delete restrict,
  "order"      int  not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists flow_options_node_id_idx
  on public.flow_options(node_id);

create index if not exists flow_options_next_node_id_idx
  on public.flow_options(next_node_id);

-- ------------------------------------------------------------
-- RLS — acesso controlado pelo Notion (igual às outras tabelas)
-- ------------------------------------------------------------

alter table public.flow_nodes   enable row level security;
alter table public.flow_options enable row level security;

drop policy if exists "anon full access flow_nodes"   on public.flow_nodes;
drop policy if exists "anon full access flow_options" on public.flow_options;

create policy "anon full access flow_nodes" on public.flow_nodes
  for all to anon using (true) with check (true);

create policy "anon full access flow_options" on public.flow_options
  for all to anon using (true) with check (true);

-- ------------------------------------------------------------
-- Realtime
-- ------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['flow_nodes','flow_options'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
