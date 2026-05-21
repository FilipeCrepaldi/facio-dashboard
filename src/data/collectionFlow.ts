// Fluxo de cobrança da Facio — estrutura interativa.
// Source original em flowcharr-facio.txt (Mermaid).
//
// ⚠️ "Desconto 70% → x 0,20" reproduz o source original mas
// aritmeticamente 70% off seria x 0,30. Confirmar com Operations.

export type FlowOption = {
  label: string;
  next: string;
};

export type FlowNode =
  | {
      id: string;
      type: "question";
      title: string;
      subtitle?: string;
      options: FlowOption[];
    }
  | {
      id: string;
      type: "result";
      title: string;
      description?: string;
      detail?: string;
      tone: "success" | "neutral" | "warning";
      // Quando presente, o card mostra input de "valor da contratação"
      // e calcula automaticamente valor * multiplier.
      multiplier?: number;
      multiplierLabel?: string;
    };

export const ROOT_NODE_ID = "start";

export const flowNodes: Record<string, FlowNode> = {
  start: {
    id: "start",
    type: "question",
    title: "Quantos dias em atraso?",
    subtitle: "Selecione a faixa do cliente para ver a ação recomendada.",
    options: [
      { label: "Entre 1 e 28 dias", next: "q_aceitou" },
      { label: "Exatamente 30 dias", next: "r_app" },
      { label: "Acima de 60 dias", next: "q_faixa_60plus" },
    ],
  },

  q_aceitou: {
    id: "q_aceitou",
    type: "question",
    title: "O cliente aceitou seguir com o pagamento parcial?",
    subtitle:
      "Para atrasos entre 1 e 28 dias a proposta inicial é pagamento parcial via boleto.",
    options: [
      { label: "Sim", next: "r_boleto" },
      { label: "Não", next: "r_recusou" },
    ],
  },

  q_faixa_60plus: {
    id: "q_faixa_60plus",
    type: "question",
    title: "Em qual faixa de atraso o cliente se encontra?",
    subtitle: "O desconto oferecido cresce conforme o tempo de inadimplência.",
    options: [
      { label: "60 até 89 dias", next: "r_desc_10" },
      { label: "90 até 119 dias", next: "r_desc_20" },
      { label: "120 até 149 dias", next: "r_desc_30" },
      { label: "150 até 179 dias", next: "r_desc_50" },
      { label: "Acima de 180 dias", next: "r_desc_70" },
    ],
  },

  r_boleto: {
    id: "r_boleto",
    type: "result",
    title: "Gerar boleto no charges (Retool)",
    description: "Use o valor combinado na proposta de pagamento parcial.",
    tone: "success",
  },

  r_recusou: {
    id: "r_recusou",
    type: "result",
    title: "Proposta recusada",
    description:
      "Cliente não aceitou pagamento parcial. Encaminhar conforme procedimento padrão da equipe.",
    tone: "neutral",
  },

  r_app: {
    id: "r_app",
    type: "result",
    title: "Parcelamento pelo App em até 4 vezes",
    description: "Direcionar o cliente para o fluxo de parcelamento no app.",
    tone: "success",
  },

  r_desc_10: {
    id: "r_desc_10",
    type: "result",
    title: "Desconto de 10%",
    detail: "Valor da contratação × 0,90",
    tone: "success",
    multiplier: 0.9,
    multiplierLabel: "× 0,90",
  },
  r_desc_20: {
    id: "r_desc_20",
    type: "result",
    title: "Desconto de 20%",
    detail: "Valor da contratação × 0,80",
    tone: "success",
    multiplier: 0.8,
    multiplierLabel: "× 0,80",
  },
  r_desc_30: {
    id: "r_desc_30",
    type: "result",
    title: "Desconto de 30%",
    detail: "Valor da contratação × 0,70",
    tone: "success",
    multiplier: 0.7,
    multiplierLabel: "× 0,70",
  },
  r_desc_50: {
    id: "r_desc_50",
    type: "result",
    title: "Desconto de 50%",
    detail: "Valor da contratação × 0,50",
    tone: "success",
    multiplier: 0.5,
    multiplierLabel: "× 0,50",
  },
  r_desc_70: {
    id: "r_desc_70",
    type: "result",
    title: "Desconto de 70%",
    detail: "Valor da contratação × 0,20",
    description:
      "Atenção: source original diz × 0,20 (aritmeticamente esperado seria × 0,30). Confirmar com Operations.",
    tone: "warning",
    multiplier: 0.2,
    multiplierLabel: "× 0,20",
  },
};
