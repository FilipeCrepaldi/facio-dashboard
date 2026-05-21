import { useEffect, useState } from "react";
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

  return { groups, loading, error };
}
