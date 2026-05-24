import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCirclePlus,
  IconHelp,
  IconHome,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type {
  FlowNode,
  Tone,
  useFlow,
} from "../hooks/useFlow";

type FlowState = ReturnType<typeof useFlow>;

type Toast = { tone: "success" | "error"; message: string };

type Props = { flow: FlowState };

export function FlowEditor({ flow }: Props) {
  const {
    nodes,
    rootNodeId,
    createNode,
    updateNode,
    deleteNode,
    setRoot,
    createOption,
    updateOption,
    deleteOption,
    moveOption,
  } = flow;

  const nodeList = Object.values(nodes).sort((a, b) => {
    if (a.id === rootNodeId) return -1;
    if (b.id === rootNodeId) return 1;
    if (a.type !== b.type) return a.type === "question" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  const [selectedId, setSelectedId] = useState<string | null>(
    rootNodeId ?? nodeList[0]?.id ?? null,
  );

  useEffect(() => {
    if (selectedId && nodes[selectedId]) return;
    const fallback = rootNodeId ?? Object.keys(nodes)[0] ?? null;
    if (fallback !== selectedId) setSelectedId(fallback);
  }, [selectedId, nodes, rootNodeId]);

  const [toast, setToast] = useState<Toast | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const showError = (message?: string) => {
    if (message) setToast({ tone: "error", message });
  };
  const showSuccess = (message: string) =>
    setToast({ tone: "success", message });

  const handleCreate = async (type: "question" | "result") => {
    const title = window.prompt(
      type === "question"
        ? "Texto da nova pergunta:"
        : "Título da nova ação:",
    );
    if (!title?.trim()) return;
    const input =
      type === "question"
        ? { type: "question" as const, title }
        : {
            type: "result" as const,
            title,
            tone: "success" as Tone,
          };
    const res = await createNode(input);
    if (res.error) return showError(res.error);
    showSuccess("Nó criado.");
    if (res.id) setSelectedId(res.id);
  };

  const selected = selectedId ? nodes[selectedId] : null;

  return (
    <div className="flex flex-col gap-4">
      {toast ? <ToastBanner toast={toast} onDismiss={() => setToast(null)} /> : null}

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <aside className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
          <div className="flex items-center justify-between px-1 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Nós ({nodeList.length})
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleCreate("question")}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text)] transition hover:border-[var(--color-facio-blue)] hover:text-[var(--color-facio-blue)]"
                title="Nova pergunta"
              >
                <IconCirclePlus size={11} stroke={2} />
                Pergunta
              </button>
              <button
                type="button"
                onClick={() => handleCreate("result")}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text)] transition hover:border-[var(--color-menta)] hover:text-[var(--color-menta)]"
                title="Nova ação"
              >
                <IconCirclePlus size={11} stroke={2} />
                Ação
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            {nodeList.map((node) => (
              <NodeListItem
                key={node.id}
                node={node}
                isRoot={node.id === rootNodeId}
                isSelected={node.id === selectedId}
                onSelect={() => setSelectedId(node.id)}
              />
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          {selected ? (
            <NodeForm
              key={selected.id}
              node={selected}
              isRoot={selected.id === rootNodeId}
              allNodes={nodes}
              onUpdate={async (patch) => {
                const res = await updateNode(selected.id, patch);
                if (res.error) return showError(res.error);
                showSuccess("Salvo.");
              }}
              onDelete={async () => {
                if (!window.confirm(`Deletar "${selected.title}"?`)) return;
                const res = await deleteNode(selected.id);
                if (res.error) return showError(res.error);
                showSuccess("Nó deletado.");
              }}
              onSetRoot={async () => {
                const res = await setRoot(selected.id);
                if (res.error) return showError(res.error);
                showSuccess("Nó raiz atualizado.");
              }}
              onCreateOption={async (label, nextNodeId) => {
                const res = await createOption(selected.id, label, nextNodeId);
                if (res.error) return showError(res.error);
                showSuccess("Opção adicionada.");
              }}
              onUpdateOption={async (id, patch) => {
                const res = await updateOption(id, patch);
                if (res.error) return showError(res.error);
              }}
              onDeleteOption={async (id) => {
                const res = await deleteOption(id);
                if (res.error) return showError(res.error);
              }}
              onMoveOption={async (id, direction) => {
                const res = await moveOption(selected.id, id, direction);
                if (res.error) showError(res.error);
              }}
            />
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              Selecione um nó na lista ao lado para editar — ou crie um novo.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

// ---------- Lista lateral ----------

type NodeListItemProps = {
  node: FlowNode;
  isRoot: boolean;
  isSelected: boolean;
  onSelect: () => void;
};

function NodeListItem({ node, isRoot, isSelected, onSelect }: NodeListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition",
        isSelected
          ? "bg-[var(--color-facio-blue)]/15 text-[var(--color-text)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center rounded",
          node.type === "question"
            ? "bg-[var(--color-facio-blue)]/15 text-[var(--color-facio-blue)]"
            : "bg-[var(--color-menta)]/20 text-[#0F3D2E]",
        ].join(" ")}
      >
        {node.type === "question" ? (
          <IconHelp size={12} stroke={2} />
        ) : (
          <IconCircleCheck size={12} stroke={2} />
        )}
      </span>
      <span className="flex-1 truncate">{node.title}</span>
      {isRoot ? (
        <IconHome
          size={11}
          stroke={2}
          className="text-[var(--color-facio-blue)]"
        />
      ) : null}
    </button>
  );
}

// ---------- Form ----------

type NodeFormProps = {
  node: FlowNode;
  isRoot: boolean;
  allNodes: Record<string, FlowNode>;
  onUpdate: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  onSetRoot: () => void;
  onCreateOption: (label: string, nextNodeId: string) => void;
  onUpdateOption: (
    id: string,
    patch: { label?: string; nextNodeId?: string },
  ) => void;
  onDeleteOption: (id: string) => void;
  onMoveOption: (id: string, direction: "up" | "down") => void;
};

function NodeForm({
  node,
  isRoot,
  allNodes,
  onUpdate,
  onDelete,
  onSetRoot,
  onCreateOption,
  onUpdateOption,
  onDeleteOption,
  onMoveOption,
}: NodeFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {node.type === "question" ? "Pergunta" : "Ação terminal"}
            {isRoot ? " · raiz" : ""}
          </span>
          <h3 className="mt-0.5 text-sm font-semibold text-[var(--color-text)]">
            {node.title || "Sem título"}
          </h3>
        </div>
        <div className="flex gap-2">
          {!isRoot && node.type === "question" ? (
            <button
              type="button"
              onClick={onSetRoot}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-1 text-[10px] font-medium text-[var(--color-text)] transition hover:border-[var(--color-facio-blue)] hover:text-[var(--color-facio-blue)]"
            >
              <IconHome size={11} stroke={2} />
              Definir como raiz
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-coral)]/40 px-2 py-1 text-[10px] font-medium text-[var(--color-coral)] transition hover:bg-[var(--color-coral)]/10"
          >
            <IconTrash size={11} stroke={2} />
            Deletar
          </button>
        </div>
      </header>

      {node.type === "question" ? (
        <QuestionFields node={node} onUpdate={onUpdate} />
      ) : (
        <ResultFields node={node} onUpdate={onUpdate} />
      )}

      {node.type === "question" ? (
        <OptionsList
          node={node}
          allNodes={allNodes}
          onCreateOption={onCreateOption}
          onUpdateOption={onUpdateOption}
          onDeleteOption={onDeleteOption}
          onMoveOption={onMoveOption}
        />
      ) : null}
    </div>
  );
}

// ---------- Fields ----------

function QuestionFields({
  node,
  onUpdate,
}: {
  node: Extract<FlowNode, { type: "question" }>;
  onUpdate: (patch: Record<string, unknown>) => void;
}) {
  return (
    <div className="grid gap-3">
      <TextField
        label="Texto da pergunta"
        defaultValue={node.title}
        onCommit={(v) => onUpdate({ title: v })}
      />
      <TextAreaField
        label="Subtítulo (opcional)"
        defaultValue={node.subtitle ?? ""}
        onCommit={(v) => onUpdate({ subtitle: v.trim() || null })}
      />
    </div>
  );
}

function ResultFields({
  node,
  onUpdate,
}: {
  node: Extract<FlowNode, { type: "result" }>;
  onUpdate: (patch: Record<string, unknown>) => void;
}) {
  const [hasMultiplier, setHasMultiplier] = useState(
    node.multiplier !== undefined,
  );

  return (
    <div className="grid gap-3">
      <TextField
        label="Título da ação"
        defaultValue={node.title}
        onCommit={(v) => onUpdate({ title: v })}
      />
      <TextAreaField
        label="Descrição (opcional)"
        defaultValue={node.description ?? ""}
        onCommit={(v) => onUpdate({ description: v.trim() || null })}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Tom visual
        </label>
        <div className="flex gap-2">
          {(["success", "neutral", "warning"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onUpdate({ tone: t })}
              className={[
                "rounded-md border px-2.5 py-1 text-[11px] font-medium capitalize transition",
                node.tone === t
                  ? t === "warning"
                    ? "border-[var(--color-sun)] bg-[var(--color-sun)]/15 text-[var(--color-sun)]"
                    : t === "success"
                      ? "border-[var(--color-menta)] bg-[var(--color-menta)]/15 text-[var(--color-text)]"
                      : "border-[var(--color-facio-blue)] bg-[var(--color-facio-blue)]/15 text-[var(--color-facio-blue)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
              ].join(" ")}
            >
              {t === "success" ? "Sucesso" : t === "warning" ? "Aviso" : "Neutro"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-dashed border-[var(--color-border)] p-3">
        <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={hasMultiplier}
            onChange={(e) => {
              setHasMultiplier(e.target.checked);
              if (!e.target.checked) {
                onUpdate({ multiplier: null, multiplier_label: null });
              }
            }}
          />
          Tem cálculo de desconto sobre o valor da contratação
        </label>
        {hasMultiplier ? (
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="Multiplicador (ex: 0.9)"
              defaultValue={node.multiplier?.toString() ?? ""}
              onCommit={(v) => {
                const n = Number(v.replace(",", "."));
                onUpdate({ multiplier: Number.isFinite(n) ? n : null });
              }}
            />
            <TextField
              label="Label exibido (ex: × 0,90)"
              defaultValue={node.multiplierLabel ?? ""}
              onCommit={(v) => onUpdate({ multiplier_label: v.trim() || null })}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---------- Options list ----------

function OptionsList({
  node,
  allNodes,
  onCreateOption,
  onUpdateOption,
  onDeleteOption,
  onMoveOption,
}: {
  node: Extract<FlowNode, { type: "question" }>;
  allNodes: Record<string, FlowNode>;
  onCreateOption: (label: string, nextNodeId: string) => void;
  onUpdateOption: (
    id: string,
    patch: { label?: string; nextNodeId?: string },
  ) => void;
  onDeleteOption: (id: string) => void;
  onMoveOption: (id: string, direction: "up" | "down") => void;
}) {
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newNext, setNewNext] = useState("");

  const otherNodes = Object.values(allNodes).filter((n) => n.id !== node.id);

  const handleAdd = () => {
    if (!newLabel.trim() || !newNext) return;
    onCreateOption(newLabel, newNext);
    setNewLabel("");
    setNewNext("");
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Opções de resposta ({node.options.length})
        </span>
        {!creating ? (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-1 text-[10px] font-medium text-[var(--color-text)] transition hover:border-[var(--color-facio-blue)] hover:text-[var(--color-facio-blue)]"
          >
            <IconCirclePlus size={11} stroke={2} />
            Nova opção
          </button>
        ) : null}
      </div>

      {node.options.length === 0 && !creating ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          Nenhuma opção ainda. Sem opções, essa pergunta é um beco sem saída.
        </p>
      ) : null}

      {node.options.map((opt, idx) => (
        <OptionRow
          key={opt.id}
          option={opt}
          allNodes={allNodes}
          ownerId={node.id}
          isFirst={idx === 0}
          isLast={idx === node.options.length - 1}
          onUpdate={(patch) => onUpdateOption(opt.id, patch)}
          onDelete={() => onDeleteOption(opt.id)}
          onMove={(direction) => onMoveOption(opt.id, direction)}
        />
      ))}

      {creating ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-[1fr_1fr_auto_auto] items-end gap-2 rounded-md border border-dashed border-[var(--color-facio-blue)]/50 bg-[var(--color-facio-blue)]/5 p-2"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Texto do botão
            </label>
            <input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Ex: Sim"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-facio-blue)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Vai para
            </label>
            <select
              value={newNext}
              onChange={(e) => setNewNext(e.target.value)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-facio-blue)]"
            >
              <option value="">— escolher —</option>
              {otherNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  [{n.type === "question" ? "P" : "A"}] {n.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newLabel.trim() || !newNext}
            className="rounded-md bg-[var(--color-facio-blue)] px-3 py-1.5 text-[11px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setNewLabel("");
              setNewNext("");
            }}
            className="rounded-md border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
            title="Cancelar"
          >
            <IconX size={12} stroke={2} />
          </button>
        </motion.div>
      ) : null}
    </div>
  );
}

function OptionRow({
  option,
  allNodes,
  ownerId,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMove,
}: {
  option: { id: string; label: string; next: string };
  allNodes: Record<string, FlowNode>;
  ownerId: string;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: { label?: string; nextNodeId?: string }) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
}) {
  const otherNodes = Object.values(allNodes).filter((n) => n.id !== ownerId);

  return (
    <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5">
      <input
        defaultValue={option.label}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v && v !== option.label) onUpdate({ label: v });
        }}
        className="rounded border border-transparent bg-transparent px-1.5 py-1 text-xs text-[var(--color-text)] outline-none transition focus:border-[var(--color-facio-blue)] focus:bg-[var(--color-surface)]"
      />
      <select
        value={option.next}
        onChange={(e) => onUpdate({ nextNodeId: e.target.value })}
        className="rounded border border-transparent bg-transparent px-1.5 py-1 text-xs text-[var(--color-text)] outline-none transition hover:border-[var(--color-border)] focus:border-[var(--color-facio-blue)] focus:bg-[var(--color-surface)]"
      >
        {otherNodes.map((n) => (
          <option key={n.id} value={n.id}>
            [{n.type === "question" ? "P" : "A"}] {n.title}
          </option>
        ))}
        {!allNodes[option.next] ? (
          <option value={option.next}>⚠ destino inexistente</option>
        ) : null}
      </select>
      <button
        type="button"
        onClick={() => onMove("up")}
        disabled={isFirst}
        className="rounded p-1 text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-30"
        title="Mover pra cima"
      >
        <IconChevronUp size={12} stroke={2} />
      </button>
      <button
        type="button"
        onClick={() => onMove("down")}
        disabled={isLast}
        className="rounded p-1 text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-30"
        title="Mover pra baixo"
      >
        <IconChevronDown size={12} stroke={2} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded p-1 text-[var(--color-text-muted)] transition hover:text-[var(--color-coral)]"
        title="Deletar opção"
      >
        <IconTrash size={11} stroke={2} />
      </button>
    </div>
  );
}

// ---------- Inputs auxiliares ----------

function TextField({
  label,
  defaultValue,
  onCommit,
}: {
  label: string;
  defaultValue: string;
  onCommit: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </label>
      <input
        defaultValue={defaultValue}
        onBlur={(e) => {
          if (e.target.value !== defaultValue) onCommit(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-xs text-[var(--color-text)] outline-none transition focus:border-[var(--color-facio-blue)]"
      />
    </div>
  );
}

function TextAreaField({
  label,
  defaultValue,
  onCommit,
}: {
  label: string;
  defaultValue: string;
  onCommit: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </label>
      <textarea
        defaultValue={defaultValue}
        rows={2}
        onBlur={(e) => {
          if (e.target.value !== defaultValue) onCommit(e.target.value);
        }}
        className="resize-y rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-xs text-[var(--color-text)] outline-none transition focus:border-[var(--color-facio-blue)]"
      />
    </div>
  );
}

// ---------- Toast ----------

function ToastBanner({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const isError = toast.tone === "error";
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={[
        "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs",
        isError
          ? "border-[var(--color-coral)]/40 bg-[var(--color-coral)]/10 text-[var(--color-coral)]"
          : "border-[var(--color-menta)]/40 bg-[var(--color-menta)]/15 text-[var(--color-text)]",
      ].join(" ")}
    >
      <span className="flex items-center gap-2">
        {isError ? (
          <IconAlertTriangle size={14} stroke={2} />
        ) : (
          <IconCircleCheck size={14} stroke={2} />
        )}
        {toast.message}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded p-0.5 transition hover:opacity-70"
      >
        <IconX size={12} stroke={2} />
      </button>
    </motion.div>
  );
}
