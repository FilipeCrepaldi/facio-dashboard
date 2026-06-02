-- ============================================================
-- Facio Dashboard — Campo calc_type em flow_nodes
-- Sprint 18
-- Executar em: Supabase → SQL Editor → New query
-- Idempotente.
-- ============================================================

-- Adiciona coluna calc_type (nullable — null = sem cálculo ou legado Antecipação)
alter table public.flow_nodes
  add column if not exists calc_type text
    check (calc_type in ('antecipacao', 'acordo_cf'));
