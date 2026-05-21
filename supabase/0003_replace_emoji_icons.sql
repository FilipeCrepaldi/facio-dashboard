-- ============================================================
-- Facio Dashboard — substituir emojis por nomes Tabler Icons
-- Sprint 3 (sidequest)
-- Executar em: Supabase → SQL Editor → New query
--
-- Atualiza só as linhas que ainda têm os emojis do seed inicial.
-- Se você já editou um ícone manualmente, ele é preservado.
-- ============================================================

-- Seções
update public.sections set icon = 'alert-triangle' where icon = '🚨';
update public.sections set icon = 'tools'           where icon = '🧰';
update public.sections set icon = 'chart-bar'       where icon = '📊';
update public.sections set icon = 'compass'         where icon = '🧭';
update public.sections set icon = 'books'           where icon = '📚';
update public.sections set icon = 'users'           where icon = '👥';

-- Links
update public.links set icon = 'brand-slack'   where icon = '💬';
update public.links set icon = 'device-mobile' where icon = '📟';
update public.links set icon = 'circle-check'  where icon = '🟢';
update public.links set icon = 'ticket'        where icon = '🎫';
update public.links set icon = 'address-book'  where icon = '📇';
update public.links set icon = 'trending-up'   where icon = '📈';
update public.links set icon = 'coin'          where icon = '💰';
update public.links set icon = 'book'          where icon = '📖';
update public.links set icon = 'clock'         where icon = '⏱️';
update public.links set icon = 'brain'         where icon = '🧠';
update public.links set icon = 'rocket'        where icon = '🚀';
update public.links set icon = 'sitemap'       where icon = '🗂️';
update public.links set icon = 'beach'         where icon = '🏖️';
