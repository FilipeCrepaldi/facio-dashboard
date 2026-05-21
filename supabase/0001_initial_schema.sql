-- ============================================================
-- Facio Dashboard — schema inicial
-- Sprint 1 (já aplicado no projeto nwrdntvoylzwvvsyecrm em 2026-05-21)
-- Executar em: Supabase → SQL Editor → New query
-- Idempotente.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Tabelas
-- ------------------------------------------------------------

create table if not exists public.workspace (
  id   uuid primary key default gen_random_uuid(),
  name text not null
);

create table if not exists public.groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  "order"    int  not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sections (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  name        text not null,
  icon        text,
  description text,
  "order"     int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.links (
  id         uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  label      text not null,
  url        text not null,
  icon       text,
  "order"    int  not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists sections_group_id_idx on public.sections(group_id);
create index if not exists links_section_id_idx  on public.links(section_id);

-- ------------------------------------------------------------
-- RLS
-- Controle de acesso fica no Notion. Anon role tem acesso total.
-- ------------------------------------------------------------

alter table public.workspace enable row level security;
alter table public.groups    enable row level security;
alter table public.sections  enable row level security;
alter table public.links     enable row level security;

drop policy if exists "anon full access workspace" on public.workspace;
drop policy if exists "anon full access groups"    on public.groups;
drop policy if exists "anon full access sections"  on public.sections;
drop policy if exists "anon full access links"     on public.links;

create policy "anon full access workspace" on public.workspace
  for all to anon using (true) with check (true);

create policy "anon full access groups" on public.groups
  for all to anon using (true) with check (true);

create policy "anon full access sections" on public.sections
  for all to anon using (true) with check (true);

create policy "anon full access links" on public.links
  for all to anon using (true) with check (true);

-- ------------------------------------------------------------
-- Realtime (necessário pros postgres_changes nos hooks)
-- ------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['workspace','groups','sections','links'] loop
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

-- ------------------------------------------------------------
-- Workspace inicial
-- ------------------------------------------------------------

insert into public.workspace (name)
select 'Facio'
where not exists (select 1 from public.workspace);
