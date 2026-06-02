-- ============================================================
-- Sprint 18 — Cálculos de desconto corretos
-- Rodar APÓS 0006_calc_type.sql.
-- Idempotente.
-- ============================================================

-- ─── 1. Corrige multipliers dos nós existentes (taxa de desconto, não multiplicador de preço)
--     e define calc_type = 'antecipacao' para os nós de desconto antecipado
-- ─────────────────────────────────────────────────────────────────────────────

update public.flow_nodes set
  multiplier       = 0.10,
  multiplier_label = '10% de desconto',
  calc_type        = 'antecipacao',
  detail           = null
where id = 'r_desc_10';

update public.flow_nodes set
  multiplier       = 0.20,
  multiplier_label = '20% de desconto',
  calc_type        = 'antecipacao',
  detail           = null
where id = 'r_desc_20';

update public.flow_nodes set
  multiplier       = 0.30,
  multiplier_label = '30% de desconto',
  calc_type        = 'antecipacao',
  detail           = null
where id = 'r_desc_30';

update public.flow_nodes set
  multiplier       = 0.50,
  multiplier_label = '50% de desconto',
  calc_type        = 'antecipacao',
  detail           = null
where id = 'r_desc_50';

update public.flow_nodes set
  multiplier       = 0.70,
  multiplier_label = '70% de desconto',
  calc_type        = 'antecipacao',
  description      = null,
  detail           = null,
  tone             = 'warning'
where id = 'r_desc_70';

-- ─── 2. Cria nós de resultado para Acordo CF (um por faixa de atraso)
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.flow_nodes (id, type, title, description, tone, multiplier, multiplier_label, calc_type, is_root) values
  ('r_cf_10', 'result', 'Acordo CF — 10% de desconto',
   'Insira o valor em atraso com taxas e juros para calcular o valor do acordo.',
   'success', 0.10, '10% de desconto', 'acordo_cf', false),

  ('r_cf_20', 'result', 'Acordo CF — 20% de desconto',
   'Insira o valor em atraso com taxas e juros para calcular o valor do acordo.',
   'success', 0.20, '20% de desconto', 'acordo_cf', false),

  ('r_cf_30', 'result', 'Acordo CF — 30% de desconto',
   'Insira o valor em atraso com taxas e juros para calcular o valor do acordo.',
   'success', 0.30, '30% de desconto', 'acordo_cf', false),

  ('r_cf_50', 'result', 'Acordo CF — 50% de desconto',
   'Insira o valor em atraso com taxas e juros para calcular o valor do acordo.',
   'success', 0.50, '50% de desconto', 'acordo_cf', false),

  ('r_cf_70', 'result', 'Acordo CF — 70% de desconto',
   'Insira o valor em atraso com taxas e juros para calcular o valor do acordo.',
   'warning', 0.70, '70% de desconto', 'acordo_cf', false)
on conflict (id) do nothing;

-- ─── 3. Cria nós de pergunta "Qual tipo de acordo?" por faixa de atraso
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.flow_nodes (id, type, title, subtitle, is_root) values
  ('q_tipo_10', 'question', 'Qual tipo de acordo?',
   'Faixa de 60 a 89 dias — desconto de 10% aplicável.', false),

  ('q_tipo_20', 'question', 'Qual tipo de acordo?',
   'Faixa de 90 a 119 dias — desconto de 20% aplicável.', false),

  ('q_tipo_30', 'question', 'Qual tipo de acordo?',
   'Faixa de 120 a 149 dias — desconto de 30% aplicável.', false),

  ('q_tipo_50', 'question', 'Qual tipo de acordo?',
   'Faixa de 150 a 179 dias — desconto de 50% aplicável.', false),

  ('q_tipo_70', 'question', 'Qual tipo de acordo?',
   'Faixa acima de 180 dias — desconto de 70% aplicável.', false)
on conflict (id) do nothing;

-- ─── 4. Reconfigura as opções de q_faixa_60plus para apontar pros novos q_tipo_*
-- ─────────────────────────────────────────────────────────────────────────────

delete from public.flow_options where node_id = 'q_faixa_60plus';

insert into public.flow_options (node_id, label, next_node_id, "order") values
  ('q_faixa_60plus', '60 até 89 dias',    'q_tipo_10', 0),
  ('q_faixa_60plus', '90 até 119 dias',   'q_tipo_20', 1),
  ('q_faixa_60plus', '120 até 149 dias',  'q_tipo_30', 2),
  ('q_faixa_60plus', '150 até 179 dias',  'q_tipo_50', 3),
  ('q_faixa_60plus', 'Acima de 180 dias', 'q_tipo_70', 4);

-- ─── 5. Opções dos novos q_tipo_* (Antecipação ou Acordo CF por faixa)
-- ─────────────────────────────────────────────────────────────────────────────

delete from public.flow_options
  where node_id in ('q_tipo_10', 'q_tipo_20', 'q_tipo_30', 'q_tipo_50', 'q_tipo_70');

insert into public.flow_options (node_id, label, next_node_id, "order") values
  ('q_tipo_10', 'Desconto Antecipação', 'r_desc_10', 0),
  ('q_tipo_10', 'Acordo CF',            'r_cf_10',   1),

  ('q_tipo_20', 'Desconto Antecipação', 'r_desc_20', 0),
  ('q_tipo_20', 'Acordo CF',            'r_cf_20',   1),

  ('q_tipo_30', 'Desconto Antecipação', 'r_desc_30', 0),
  ('q_tipo_30', 'Acordo CF',            'r_cf_30',   1),

  ('q_tipo_50', 'Desconto Antecipação', 'r_desc_50', 0),
  ('q_tipo_50', 'Acordo CF',            'r_cf_50',   1),

  ('q_tipo_70', 'Desconto Antecipação', 'r_desc_70', 0),
  ('q_tipo_70', 'Acordo CF',            'r_cf_70',   1);
