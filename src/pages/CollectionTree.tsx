import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCircleCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FlowEditor } from "../editor/FlowEditor";
import { useFlow, type FlowNode } from "../hooks/useFlow";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function parseBRNumber(value: string): number | null {
  if (!value.trim()) return null;
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(/\./g, "");
  const normalized = cleaned.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

type QuestionNode = Extract<FlowNode, { type: "question" }>;
type ResultNode = Extract<FlowNode, { type: "result" }>;

type Step =
  | {
      kind: "question";
      node: QuestionNode;
      answerLabel?: string;
      isCurrent: boolean;
    }
  | { kind: "result"; node: ResultNode };

function buildSteps(
  nodes: Record<string, FlowNode>,
  rootId: string,
  path: string[],
): Step[] {
  const steps: Step[] = [];
  let currentId: string | undefined = rootId;
  let depth = 0;

  while (currentId) {
    const node = nodes[currentId];
    if (!node) break;

    if (node.type === "result") {
      steps.push({ kind: "result", node });
      break;
    }

    const chosenId = path[depth];
    const chosen = chosenId
      ? node.options.find((o) => o.next === chosenId)
      : undefined;

    steps.push({
      kind: "question",
      node,
      answerLabel: chosen?.label,
      isCurrent: !chosen,
    });

    if (!chosen) break;
    currentId = chosen.next;
    depth += 1;
  }

  return steps;
}

export function CollectionTree({ editing }: { editing: boolean }) {
  const flow = useFlow();
  const { nodes, rootNodeId, loading, error } = flow;
  const [path, setPath] = useState<string[]>([]);
  const [contractValue, setContractValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [path.length]);

  if (loading) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Carregando fluxo…
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--color-coral)]/40 bg-[var(--color-coral)]/10 px-4 py-3 text-sm text-[var(--color-coral)]">
        Erro ao carregar o fluxo: {error}
      </div>
    );
  }

  if (editing) {
    return <FlowEditor flow={flow} />;
  }

  if (!rootNodeId || !nodes[rootNodeId]) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 text-center">
        <p className="text-sm font-medium text-[var(--color-text)]">
          Fluxo vazio
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Rode as migrações <code>0004_collection_flow.sql</code> e{" "}
          <code>0005_collection_flow_seed.sql</code> no Supabase Studio para
          popular o fluxo, ou crie nós pelo painel admin (Sprint 17).
        </p>
      </div>
    );
  }

  const steps = buildSteps(nodes, rootNodeId, path);

  const choose = (depth: number, nextId: string) => {
    setPath((prev) => [...prev.slice(0, depth), nextId]);
  };

  const back = () => setPath((prev) => prev.slice(0, -1));
  const restart = () => setPath([]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {steps.map((step, index) =>
          step.kind === "question" ? (
            <QuestionStep
              key={`q-${index}-${step.node.id}`}
              step={step}
              depth={index}
              onChoose={choose}
            />
          ) : (
            <ResultStep
              key={`r-${step.node.id}`}
              node={step.node}
              contractValue={contractValue}
              onContractValueChange={setContractValue}
            />
          ),
        )}
        <div ref={endRef} />
      </div>

      {path.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end gap-2"
        >
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:bg-[var(--color-border)]"
          >
            <IconArrowLeft size={14} stroke={2} />
            Voltar uma etapa
          </button>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-facio-blue)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
          >
            <IconRefresh size={14} stroke={2} />
            Recomeçar
          </button>
        </motion.div>
      ) : null}
    </div>
  );
}

type QuestionStepProps = {
  step: Extract<Step, { kind: "question" }>;
  depth: number;
  onChoose: (depth: number, nextId: string) => void;
};

function QuestionStep({ step, depth, onChoose }: QuestionStepProps) {
  const { node, answerLabel, isCurrent } = step;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="flex flex-col gap-2"
    >
      <div className="flex">
        <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {node.title}
          </p>
          {node.subtitle ? (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {node.subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {answerLabel ? (
        <div className="flex justify-end">
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="max-w-[80%] rounded-2xl rounded-br-md bg-[var(--color-facio-blue)] px-3.5 py-2 text-xs font-medium text-white"
          >
            {answerLabel}
          </motion.div>
        </div>
      ) : isCurrent ? (
        <div className="flex flex-wrap gap-2">
          {node.options.map((opt) => (
            <motion.button
              key={opt.label}
              type="button"
              onClick={() => onChoose(depth, opt.next)}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-[var(--color-facio-blue)] bg-transparent px-3.5 py-1.5 text-xs font-medium text-[var(--color-facio-blue)] transition hover:bg-[var(--color-facio-blue)] hover:text-white"
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

type ResultStepProps = {
  node: ResultNode;
  contractValue: string;
  onContractValueChange: (v: string) => void;
};

function ResultStep({
  node,
  contractValue,
  onContractValueChange,
}: ResultStepProps) {
  const numericValue = parseBRNumber(contractValue);
  const computed =
    node.multiplier !== undefined && numericValue !== null
      ? numericValue * node.multiplier
      : null;

  const accentClass =
    node.tone === "warning"
      ? "border-[var(--color-sun)]/60 bg-[var(--color-sun)]/10"
      : node.tone === "success"
        ? "border-[var(--color-menta)]/50 bg-[var(--color-menta)]/10"
        : "border-[var(--color-border)] bg-[var(--color-surface)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={[
        "flex flex-col gap-3 rounded-2xl border px-4 py-3.5",
        accentClass,
      ].join(" ")}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={[
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            node.tone === "warning"
              ? "bg-[var(--color-sun)]/25 text-[var(--color-sun)]"
              : "bg-[var(--color-menta)]/25 text-[#0F3D2E]",
          ].join(" ")}
        >
          {node.tone === "warning" ? (
            <IconAlertTriangle size={16} stroke={1.75} />
          ) : (
            <IconCircleCheck size={16} stroke={1.75} />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Ação recomendada
          </span>
          <h4 className="text-sm font-semibold leading-snug text-[var(--color-text)]">
            {node.title}
          </h4>
        </div>
      </div>

      {node.multiplier !== undefined ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-2 transition focus-within:border-[var(--color-facio-blue)]">
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
              R$
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={contractValue}
              onChange={(e) => onContractValueChange(e.target.value)}
              placeholder="Valor da contratação"
              className="w-full bg-transparent text-xs text-[var(--color-text)] outline-none"
            />
          </div>
          <div className="flex items-baseline justify-between gap-2 border-t border-dashed border-[var(--color-border)] pt-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              {node.multiplierLabel}
            </span>
            <span className="font-mono text-base font-semibold text-[var(--color-text)]">
              {computed !== null ? brl.format(computed) : "—"}
            </span>
          </div>
        </div>
      ) : node.detail ? (
        <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
          {node.detail}
        </p>
      ) : null}

      {node.description ? (
        <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
          {node.description}
        </p>
      ) : null}
    </motion.div>
  );
}
