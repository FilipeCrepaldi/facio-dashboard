import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Group } from "../types";

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("order", { ascending: true });
      if (!active) return;
      if (error) setError(error.message);
      else setGroups((data ?? []) as Group[]);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("groups-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "groups" },
        () => load()
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const createGroup = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const nextOrder = groups.length
        ? Math.max(...groups.map((g) => g.order)) + 1
        : 0;

      const { error } = await supabase
        .from("groups")
        .insert({ name: trimmed, order: nextOrder });

      if (error) setError(error.message);
    },
    [groups]
  );

  const renameGroup = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim();
      const target = groups.find((g) => g.id === id);
      if (!target || !trimmed || trimmed === target.name) return;

      const previous = groups;
      setGroups(groups.map((g) => (g.id === id ? { ...g, name: trimmed } : g)));

      const { error } = await supabase
        .from("groups")
        .update({ name: trimmed })
        .eq("id", id);

      if (error) {
        setGroups(previous);
        setError(error.message);
      }
    },
    [groups]
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      const previous = groups;
      setGroups(groups.filter((g) => g.id !== id));

      const { error } = await supabase.from("groups").delete().eq("id", id);

      if (error) {
        setGroups(previous);
        setError(error.message);
      }
    },
    [groups]
  );

  return { groups, loading, error, createGroup, renameGroup, deleteGroup };
}
