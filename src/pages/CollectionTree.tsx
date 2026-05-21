import {
  IconAlertTriangle,
  IconChevronDown,
  IconCircleCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ROOT_NODE_ID,
  flowNodes,
  type FlowNode,
} from "../data/collectionFlow";

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

// path[i] = id do nó "next" escolhido no nível i.
// Ex.: [] = nada escolhido. ["q_faixa_60plus"] = escolheu "Acima de 60 dias" na raiz.
//      ["q_faixa_60plus", "r_desc_20"] = escolheu também "90-119" no segundo nível.
export function CollectionTree() {
  const [path, setPath] = useState<string[]>([]);
  const [contractValue, setContractValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [path]);

  const chooseAt = (depth: number, nextId: string) => {
    setPath((prev) => [...prev.slice(0, depth), nextId]);
  };

  const restart = () => setPath([]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full overflow-x-auto pb-4">
        <div className="mx-auto flex min-w-fit justify-center px-4">
          <QuestionBranch
            questionId={ROOT_NODE_ID}
            path={path}
            depth={0}
            onChoose={chooseAt}
            contractValue={contractValue}
            onContractValueChange={setContractValue}
          />
        </div>
      </div>
      <div ref={endRef} />

      {path.length > 0 ? (
        <motion.button
          type="button"
          onClick={restart}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-facio-blue)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
        >
          <IconRefresh size={14} stroke={2} />
          Recomeçar
        </motion.button>
      ) : null}
    </div>
  );
}

// ---------- Recursão da árvore ----------

type BranchProps = {
  path: string[];
  depth: number;
  onChoose: (depth: number, nextId: string) => void;
  contractValue: string;
  onContractValueChange: (v: string) => void;
};

type QuestionBranchProps = BranchProps & {
  questionId: string;
};

function QuestionBranch({
  questionId,
  path,
  depth,
  onChoose,
  contractValue,
  onContractValueChange,
}: QuestionBranchProps) {
  const node = flowNodes[questionId];
  if (node.type !== "question") return null;

  const selectedNextId = path[depth];
  const hasMultiple = node.options.length > 1;

  return (
    <div className="flex flex-col items-center">
      <QuestionNode title={node.title} expanded={selectedNextId !== undefined} />

      {/* Tronco vertical entre a pergunta e a linha horizontal */}
      <VerticalLine />

      <div
        className={[
          "flex justify-center",
          hasMultiple ? "gap-6 sm:gap-8" : "",
        ].join(" ")}
      >
        {node.options.map((opt, idx) => {
          const isSelected = opt.next === selectedNextId;
          const isDimmed =
            selectedNextId !== undefined && !isSelected;

          const showHorizontal = hasMultiple;
          // Determina qual lado da linha horizontal renderizar
          let hLineClass = "";
          if (showHorizontal) {
            if (idx === 0) hLineClass = "left-1/2 right-0";
            else if (idx === node.options.length - 1)
              hLineClass = "left-0 right-1/2";
            else hLineClass = "left-0 right-0";
          }

          return (
            <div
              key={opt.label}
              className="relative flex flex-col items-center"
            >
              {showHorizontal ? (
                <span
                  className={[
                    "absolute top-0 h-px border-t border-dashed border-[var(--color-text-muted)]/35",
                    hLineClass,
                  ].join(" ")}
                />
              ) : null}
              {/* Vertical do horizontal até o nó da opção */}
              <span className="block h-5 w-px border-l border-dashed border-[var(--color-text-muted)]/35" />

              <motion.button
                type="button"
                onClick={() => onChoose(depth, opt.next)}
                initial={{ opacity: 0, y: -6 }}
                animate={{
                  opacity: isDimmed ? 0.45 : 1,
                  y: 0,
                }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                whileTap={{ scale: 0.97 }}
                whileHover={isDimmed ? { opacity: 0.75 } : { y: -1 }}
                className={[
                  "max-w-[200px] rounded-lg border px-3 py-2 text-center text-xs font-medium transition",
                  isSelected
                    ? "border-[var(--color-facio-blue)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-[0_0_0_3px_var(--color-facio-blue)]/20"
                    : "border-[var(--color-text-muted)]/35 bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]",
                ].join(" ")}
                style={
                  isSelected
                    ? {
                        boxShadow:
                          "0 0 0 3px color-mix(in srgb, var(--color-facio-blue) 25%, transparent)",
                      }
                    : undefined
                }
              >
                {opt.label}
              </motion.button>

              {/* Quando esta opção está escolhida, renderiza o que vem abaixo */}
              <AnimatePresence>
                {isSelected ? (
                  <motion.div
                    key={opt.next}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex flex-col items-center"
                  >
                    <SubBranch
                      nodeId={opt.next}
                      path={path}
                      depth={depth + 1}
                      onChoose={onChoose}
                      contractValue={contractValue}
                      onContractValueChange={onContractValueChange}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type SubBranchProps = BranchProps & {
  nodeId: string;
};

function SubBranch({
  nodeId,
  path,
  depth,
  onChoose,
  contractValue,
  onContractValueChange,
}: SubBranchProps) {
  const node = flowNodes[nodeId];

  if (node.type === "result") {
    return (
      <>
        <VerticalLine />
        <ResultNode
          node={node}
          contractValue={contractValue}
          onContractValueChange={onContractValueChange}
        />
      </>
    );
  }

  return (
    <>
      <VerticalLine />
      <QuestionBranch
        questionId={nodeId}
        path={path}
        depth={depth}
        onChoose={onChoose}
        contractValue={contractValue}
        onContractValueChange={onContractValueChange}
      />
    </>
  );
}

// ---------- Nós visuais ----------

function VerticalLine() {
  return (
    <span className="block h-6 w-px border-l border-dashed border-[var(--color-text-muted)]/35" />
  );
}

function QuestionNode({
  title,
  expanded,
}: {
  title: string;
  expanded: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg border border-[var(--color-facio-blue)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-facio-blue)]"
      style={{
        boxShadow:
          "0 0 0 3px color-mix(in srgb, var(--color-facio-blue) 22%, transparent)",
      }}
    >
      <IconChevronDown
        size={12}
        stroke={2.5}
        className={[
          "transition-transform",
          expanded ? "" : "-rotate-90",
        ].join(" ")}
        aria-hidden
      />
      {title}
    </div>
  );
}

type ResultNodeProps = {
  node: Extract<FlowNode, { type: "result" }>;
  contractValue: string;
  onContractValueChange: (v: string) => void;
};

function ResultNode({
  node,
  contractValue,
  onContractValueChange,
}: ResultNodeProps) {
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
    <div
      className={[
        "flex max-w-[260px] flex-col gap-2 rounded-lg border px-3 py-2.5",
        accentClass,
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <div
          className={[
            "flex h-6 w-6 shrink-0 items-center justify-center rounded",
            node.tone === "warning"
              ? "bg-[var(--color-sun)]/25 text-[var(--color-sun)]"
              : "bg-[var(--color-menta)]/25 text-[#0F3D2E]",
          ].join(" ")}
        >
          {node.tone === "warning" ? (
            <IconAlertTriangle size={14} stroke={1.75} />
          ) : (
            <IconCircleCheck size={14} stroke={1.75} />
          )}
        </div>
        <h4 className="text-xs font-semibold leading-snug text-[var(--color-text)]">
          {node.title}
        </h4>
      </div>

      {node.multiplier !== undefined ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 transition focus-within:border-[var(--color-facio-blue)]">
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
          <div className="flex items-baseline justify-between gap-2 border-t border-dashed border-[var(--color-border)] pt-1.5">
            <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              {node.multiplierLabel}
            </span>
            <span className="font-mono text-sm font-semibold text-[var(--color-text)]">
              {computed !== null ? brl.format(computed) : "—"}
            </span>
          </div>
        </div>
      ) : node.detail ? (
        <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
          {node.detail}
        </p>
      ) : null}

      {node.description ? (
        <p className="text-[10px] leading-snug text-[var(--color-text-muted)]">
          {node.description}
        </p>
      ) : null}
    </div>
  );
}
