-- ============================================================
-- Facio Dashboard — Seed do fluxo de cobrança
-- Sprint 16. Migra o conteúdo de src/data/collectionFlow.ts pro banco.
-- Rodar APÓS 0004_collection_flow.sql.
-- Idempotente (on conflict do nothing nos nós; opções limpas e re-inseridas).
-- ============================================================

-- ------------------------------------------------------------
-- Nós (perguntas e ações terminais)
-- ------------------------------------------------------------

insert into public.flow_nodes (id, type, title, subtitle, description, detail, tone, multiplier, multiplier_label, is_root) values
  ('start',
   'question',
   'Quantos dias em atraso?',
   'Selecione a faixa do cliente para ver a ação recomendada.',
   null, null, null, null, null, true),

  ('q_aceitou',
   'question',
   'O cliente aceitou seguir com o pagamento parcial?',
   'Para atrasos entre 1 e 28 dias a proposta inicial é pagamento parcial via boleto.',
   null, null, null, null, null, false),

  ('q_faixa_60plus',
   'question',
   'Em qual faixa de atraso o cliente se encontra?',
   'O desconto oferecido cresce conforme o tempo de inadimplência.',
   null, null, null, null, null, false),

  ('r_boleto',
   'result',
   'Gerar boleto no charges (Retool)',
   null,
   'Use o valor combinado na proposta de pagamento parcial.',
   null, 'success', null, null, false),

  ('r_recusou',
   'result',
   'Proposta recusada',
   null,
   'Cliente não aceitou pagamento parcial. Encaminhar conforme procedimento padrão da equipe.',
   null, 'neutral', null, null, false),

  ('r_app',
   'result',
   'Parcelamento pelo App em até 4 vezes',
   null,
   'Direcionar o cliente para o fluxo de parcelamento no app.',
   null, 'success', null, null, false),

  ('r_desc_10',
   'result',
   'Desconto de 10%',
   null, null,
   'Valor da contratação × 0,90',
   'success', 0.9, '× 0,90', false),

  ('r_desc_20',
   'result',
   'Desconto de 20%',
   null, null,
   'Valor da contratação × 0,80',
   'success', 0.8, '× 0,80', false),

  ('r_desc_30',
   'result',
   'Desconto de 30%',
   null, null,
   'Valor da contratação × 0,70',
   'success', 0.7, '× 0,70', false),

  ('r_desc_50',
   'result',
   'Desconto de 50%',
   null, null,
   'Valor da contratação × 0,50',
   'success', 0.5, '× 0,50', false),

  ('r_desc_70',
   'result',
   'Desconto de 70%',
   null,
   'Atenção: source original diz × 0,20 (aritmeticamente esperado seria × 0,30). Confirmar com Operations.',
   'Valor da contratação × 0,20',
   'warning', 0.2, '× 0,20', false)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Opções (caminhos entre nós)
-- Limpa e reinsere — assim re-rodar o seed reseta os caminhos
-- pra fonte canônica sem mexer nos nós (que mantêm conteúdo).
-- ------------------------------------------------------------

delete from public.flow_options
  where node_id in ('start', 'q_aceitou', 'q_faixa_60plus');

insert into public.flow_options (node_id, label, next_node_id, "order") values
  ('start',          'Entre 1 e 28 dias',  'q_aceitou',      0),
  ('start',          'Exatamente 30 dias', 'r_app',          1),
  ('start',          'Acima de 60 dias',   'q_faixa_60plus', 2),

  ('q_aceitou',      'Sim',                'r_boleto',       0),
  ('q_aceitou',      'Não',                'r_recusou',      1),

  ('q_faixa_60plus', '60 até 89 dias',     'r_desc_10',      0),
  ('q_faixa_60plus', '90 até 119 dias',    'r_desc_20',      1),
  ('q_faixa_60plus', '120 até 149 dias',   'r_desc_30',      2),
  ('q_faixa_60plus', '150 até 179 dias',   'r_desc_50',      3),
  ('q_faixa_60plus', 'Acima de 180 dias',  'r_desc_70',      4);
