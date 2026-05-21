-- ============================================================
-- Facio Dashboard — seed inicial (Sprint 2)
-- 3 grupos · 6 seções · 13 links
-- Executar em: Supabase → SQL Editor → New query
--
-- IMPORTANTE: este seed só insere se a tabela `groups` estiver
-- vazia. Se você já criou grupos no modo edição, o script pula
-- tudo e avisa via NOTICE.
--
-- URLs estão como placeholders (https://...) — troque pelas
-- URLs reais da Facio antes de usar em produção.
-- ============================================================

do $$
declare
  g_atendimento uuid;
  g_gestao      uuid;
  g_docs        uuid;

  s_canais_criticos uuid;
  s_ferramentas     uuid;
  s_metricas        uuid;
  s_processos       uuid;
  s_conhecimento    uuid;
  s_pessoas         uuid;
begin
  if exists (select 1 from public.groups) then
    raise notice 'Seed pulado: já existem grupos cadastrados.';
    return;
  end if;

  -- ----------------------------------------------------------
  -- Grupos
  -- ----------------------------------------------------------
  insert into public.groups (name, "order") values
    ('Atendimento', 0) returning id into g_atendimento;
  insert into public.groups (name, "order") values
    ('Gestão',      1) returning id into g_gestao;
  insert into public.groups (name, "order") values
    ('Docs & Time', 2) returning id into g_docs;

  -- ----------------------------------------------------------
  -- Seções
  -- ----------------------------------------------------------
  insert into public.sections (group_id, name, icon, description, "order") values
    (g_atendimento, 'Canais críticos', '🚨', 'Onde ficam os alertas, plantões e status do produto', 0)
    returning id into s_canais_criticos;

  insert into public.sections (group_id, name, icon, description, "order") values
    (g_atendimento, 'Ferramentas', '🧰', 'Apps usados no atendimento do dia a dia', 1)
    returning id into s_ferramentas;

  insert into public.sections (group_id, name, icon, description, "order") values
    (g_gestao, 'Métricas', '📊', 'Dashboards de operação e receita', 0)
    returning id into s_metricas;

  insert into public.sections (group_id, name, icon, description, "order") values
    (g_gestao, 'Processos', '🧭', 'SLAs, runbooks e fluxos internos', 1)
    returning id into s_processos;

  insert into public.sections (group_id, name, icon, description, "order") values
    (g_docs, 'Conhecimento', '📚', 'Wiki, FAQs e onboarding', 0)
    returning id into s_conhecimento;

  insert into public.sections (group_id, name, icon, description, "order") values
    (g_docs, 'Pessoas & Time', '👥', 'Organograma, contatos e folgas', 1)
    returning id into s_pessoas;

  -- ----------------------------------------------------------
  -- Links
  -- ----------------------------------------------------------
  insert into public.links (section_id, label, url, icon, "order") values
    (s_canais_criticos, 'Slack — #ops-alertas',  'https://slack.com/app_redirect?channel=ops-alertas', '💬', 0),
    (s_canais_criticos, 'Plantão (on-call)',     'https://example.com/oncall',                          '📟', 1),
    (s_canais_criticos, 'Status page',           'https://status.example.com',                          '🟢', 2);

  insert into public.links (section_id, label, url, icon, "order") values
    (s_ferramentas, 'Helpdesk',  'https://example.com/helpdesk', '🎫', 0),
    (s_ferramentas, 'CRM',       'https://example.com/crm',      '📇', 1);

  insert into public.links (section_id, label, url, icon, "order") values
    (s_metricas, 'Dashboard Operações', 'https://example.com/dash-ops',     '📈', 0),
    (s_metricas, 'BI Receita',          'https://example.com/bi-receita',   '💰', 1);

  insert into public.links (section_id, label, url, icon, "order") values
    (s_processos, 'Runbooks',   'https://example.com/runbooks', '📖', 0),
    (s_processos, 'Matriz SLA', 'https://example.com/sla',      '⏱️', 1);

  insert into public.links (section_id, label, url, icon, "order") values
    (s_conhecimento, 'Wiki Facio',  'https://example.com/wiki',      '🧠', 0),
    (s_conhecimento, 'Onboarding',  'https://example.com/onboarding','🚀', 1);

  insert into public.links (section_id, label, url, icon, "order") values
    (s_pessoas, 'Organograma', 'https://example.com/org',     '🗂️', 0),
    (s_pessoas, 'Folgas',      'https://example.com/folgas',  '🏖️', 1);

  raise notice 'Seed aplicado: 3 grupos, 6 seções, 13 links.';
end $$;
