import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type FlowOption = {
  id: string;
  label: string;
  next: string;
};

export type FlowQuestion = {
  id: string;
  type: "question";
  title: string;
  subtitle?: string;
  options: FlowOption[];
};

export type FlowResult = {
  id: string;
  type: "result";
  title: string;
  description?: string;
  detail?: string;
  tone: "success" | "neutral" | "warning";
  multiplier?: number;
  multiplierLabel?: string;
};

export type FlowNode = FlowQuestion | FlowResult;

export type Tone = "success" | "neutral" | "warning";

export type CreateNodeInput =
  | {
      type: "question";
      title: string;
      subtitle?: string;
    }
  | {
      type: "result";
      title: string;
      description?: string;
      detail?: string;
      tone: Tone;
      multiplier?: number;
      multiplierLabel?: string;
    };

export type UpdateNodePatch = Partial<{
  title: string;
  subtitle: string | null;
  description: string | null;
  detail: string | null;
  tone: Tone;
  multiplier: number | null;
  multiplier_label: string | null;
}>;

type MutationResult<T = unknown> = { error?: string } & T;

type NodeRow = {
  id: string;
  type: "question" | "result";
  title: string;
  subtitle: string | null;
  description: string | null;
  detail: string | null;
  tone: Tone | null;
  multiplier: number | null;
  multiplier_label: string | null;
  is_root: boolean;
};

type OptionRow = {
  id: string;
  node_id: string;
  label: string;
  next_node_id: string;
  order: number;
};

function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildNodes(
  nodeRows: NodeRow[],
  optionRows: OptionRow[],
): Record<string, FlowNode> {
  const optionsByNode = new Map<string, FlowOption[]>();
  for (const o of [...optionRows].sort((a, b) => a.order - b.order)) {
    const list = optionsByNode.get(o.node_id) ?? [];
    list.push({ id: o.id, label: o.label, next: o.next_node_id });
    optionsByNode.set(o.node_id, list);
  }

  const out: Record<string, FlowNode> = {};
  for (const row of nodeRows) {
    if (row.type === "question") {
      out[row.id] = {
        id: row.id,
        type: "question",
        title: row.title,
        subtitle: row.subtitle ?? undefined,
        options: optionsByNode.get(row.id) ?? [],
      };
    } else {
      out[row.id] = {
        id: row.id,
        type: "result",
        title: row.title,
        description: row.description ?? undefined,
        detail: row.detail ?? undefined,
        tone: row.tone ?? "neutral",
        multiplier: row.multiplier ?? undefined,
        multiplierLabel: row.multiplier_label ?? undefined,
      };
    }
  }
  return out;
}

export function useFlow() {
  const [nodes, setNodes] = useState<Record<string, FlowNode>>({});
  const [rootNodeId, setRootNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [nodesRes, optionsRes] = await Promise.all([
        supabase.from("flow_nodes").select("*"),
        supabase.from("flow_options").select("*"),
      ]);

      if (!active) return;

      if (nodesRes.error) {
        setError(nodesRes.error.message);
        setLoading(false);
        return;
      }
      if (optionsRes.error) {
        setError(optionsRes.error.message);
        setLoading(false);
        return;
      }

      const nodeRows = (nodesRes.data ?? []) as NodeRow[];
      const optionRows = (optionsRes.data ?? []) as OptionRow[];

      setNodes(buildNodes(nodeRows, optionRows));
      setRootNodeId(nodeRows.find((n) => n.is_root)?.id ?? null);
      setError(null);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("collection-flow-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "flow_nodes" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "flow_options" },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const createNode = useCallback(
    async (input: CreateNodeInput): Promise<MutationResult<{ id?: string }>> => {
      const title = input.title.trim();
      if (!title) return { error: "Título é obrigatório." };

      const prefix = input.type === "question" ? "q_" : "r_";
      const id = `${prefix}${shortId()}`;

      const row =
        input.type === "question"
          ? {
              id,
              type: "question" as const,
              title,
              subtitle: input.subtitle?.trim() || null,
              is_root: false,
            }
          : {
              id,
              type: "result" as const,
              title,
              description: input.description?.trim() || null,
              detail: input.detail?.trim() || null,
              tone: input.tone,
              multiplier: input.multiplier ?? null,
              multiplier_label: input.multiplierLabel?.trim() || null,
              is_root: false,
            };

      const { error } = await supabase.from("flow_nodes").insert(row);
      if (error) return { error: error.message };
      return { id };
    },
    [],
  );

  const updateNode = useCallback(
    async (id: string, patch: UpdateNodePatch): Promise<MutationResult> => {
      const cleaned: UpdateNodePatch = { ...patch };
      if (typeof cleaned.title === "string") cleaned.title = cleaned.title.trim();
      if (cleaned.title === "") return { error: "Título não pode ficar vazio." };

      const { error } = await supabase
        .from("flow_nodes")
        .update(cleaned)
        .eq("id", id);
      if (error) return { error: error.message };
      return {};
    },
    [],
  );

  const deleteNode = useCallback(
    async (id: string): Promise<MutationResult> => {
      if (id === rootNodeId) {
        return {
          error:
            "Esse é o nó raiz. Defina outro nó como raiz antes de deletar.",
        };
      }

      const { data, error } = await supabase
        .from("flow_options")
        .select("id")
        .eq("next_node_id", id);

      if (error) return { error: error.message };

      const refCount = (data ?? []).length;
      if (refCount > 0) {
        return {
          error: `${refCount} opção(ões) apontam para esse nó. Redirecione-as antes de deletar.`,
        };
      }

      const { error: deleteError } = await supabase
        .from("flow_nodes")
        .delete()
        .eq("id", id);
      if (deleteError) return { error: deleteError.message };
      return {};
    },
    [rootNodeId],
  );

  const setRoot = useCallback(
    async (id: string): Promise<MutationResult> => {
      if (!nodes[id]) return { error: "Nó não encontrado." };
      if (nodes[id].type !== "question") {
        return { error: "Apenas nós do tipo pergunta podem ser raiz." };
      }

      const { error: unsetError } = await supabase
        .from("flow_nodes")
        .update({ is_root: false })
        .eq("is_root", true);
      if (unsetError) return { error: unsetError.message };

      const { error: setRootError } = await supabase
        .from("flow_nodes")
        .update({ is_root: true })
        .eq("id", id);
      if (setRootError) return { error: setRootError.message };
      return {};
    },
    [nodes],
  );

  const createOption = useCallback(
    async (
      nodeId: string,
      label: string,
      nextNodeId: string,
    ): Promise<MutationResult> => {
      const trimmed = label.trim();
      if (!trimmed) return { error: "Texto da resposta é obrigatório." };

      const node = nodes[nodeId];
      if (!node || node.type !== "question") {
        return { error: "Nó alvo não é uma pergunta." };
      }
      if (!nodes[nextNodeId]) {
        return { error: "Nó de destino não encontrado." };
      }

      const order = node.options.length;
      const { error } = await supabase.from("flow_options").insert({
        node_id: nodeId,
        label: trimmed,
        next_node_id: nextNodeId,
        order,
      });
      if (error) return { error: error.message };
      return {};
    },
    [nodes],
  );

  const updateOption = useCallback(
    async (
      id: string,
      patch: { label?: string; nextNodeId?: string },
    ): Promise<MutationResult> => {
      const row: Record<string, unknown> = {};
      if (typeof patch.label === "string") {
        const trimmed = patch.label.trim();
        if (!trimmed) return { error: "Texto da resposta não pode ficar vazio." };
        row.label = trimmed;
      }
      if (typeof patch.nextNodeId === "string") {
        if (!nodes[patch.nextNodeId]) {
          return { error: "Nó de destino não encontrado." };
        }
        row.next_node_id = patch.nextNodeId;
      }
      if (Object.keys(row).length === 0) return {};

      const { error } = await supabase
        .from("flow_options")
        .update(row)
        .eq("id", id);
      if (error) return { error: error.message };
      return {};
    },
    [nodes],
  );

  const deleteOption = useCallback(
    async (id: string): Promise<MutationResult> => {
      const { error } = await supabase
        .from("flow_options")
        .delete()
        .eq("id", id);
      if (error) return { error: error.message };
      return {};
    },
    [],
  );

  const moveOption = useCallback(
    async (
      nodeId: string,
      optionId: string,
      direction: "up" | "down",
    ): Promise<MutationResult> => {
      const node = nodes[nodeId];
      if (!node || node.type !== "question") return {};

      const idx = node.options.findIndex((o) => o.id === optionId);
      if (idx < 0) return {};

      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= node.options.length) return {};

      const a = node.options[idx];
      const b = node.options[swapWith];

      const [r1, r2] = await Promise.all([
        supabase.from("flow_options").update({ order: swapWith }).eq("id", a.id),
        supabase.from("flow_options").update({ order: idx }).eq("id", b.id),
      ]);

      const errored = r1.error ?? r2.error;
      if (errored) return { error: errored.message };
      return {};
    },
    [nodes],
  );

  return {
    nodes,
    rootNodeId,
    loading,
    error,
    createNode,
    updateNode,
    deleteNode,
    setRoot,
    createOption,
    updateOption,
    deleteOption,
    moveOption,
  };
}
