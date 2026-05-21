import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Section } from "../types";

export type SectionInput = {
  group_id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
};

export type SectionPatch = Partial<Omit<Section, "id" | "created_at" | "order">>;

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .order("order", { ascending: true });
      if (!active) return;
      if (error) setError(error.message);
      else setSections((data ?? []) as Section[]);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("sections-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sections" },
        () => load()
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const createSection = useCallback(
    async (input: SectionInput) => {
      const trimmed = input.name.trim();
      if (!trimmed) return;

      const sameGroup = sections.filter((s) => s.group_id === input.group_id);
      const nextOrder = sameGroup.length
        ? Math.max(...sameGroup.map((s) => s.order)) + 1
        : 0;

      const { error } = await supabase.from("sections").insert({
        group_id: input.group_id,
        name: trimmed,
        icon: input.icon ?? null,
        description: input.description?.trim() || null,
        order: nextOrder,
      });

      if (error) setError(error.message);
    },
    [sections]
  );

  const updateSection = useCallback(
    async (id: string, patch: SectionPatch) => {
      const target = sections.find((s) => s.id === id);
      if (!target) return;

      const cleaned: SectionPatch = { ...patch };
      if (typeof cleaned.name === "string") cleaned.name = cleaned.name.trim();
      if (typeof cleaned.description === "string") {
        cleaned.description = cleaned.description.trim() || null;
      }

      if (cleaned.name === "") return;

      const previous = sections;
      setSections(
        sections.map((s) => (s.id === id ? { ...s, ...cleaned } : s))
      );

      const { error } = await supabase
        .from("sections")
        .update(cleaned)
        .eq("id", id);

      if (error) {
        setSections(previous);
        setError(error.message);
      }
    },
    [sections]
  );

  const deleteSection = useCallback(
    async (id: string) => {
      const previous = sections;
      setSections(sections.filter((s) => s.id !== id));

      const { error } = await supabase.from("sections").delete().eq("id", id);

      if (error) {
        setSections(previous);
        setError(error.message);
      }
    },
    [sections]
  );

  return {
    sections,
    loading,
    error,
    createSection,
    updateSection,
    deleteSection,
  };
}
