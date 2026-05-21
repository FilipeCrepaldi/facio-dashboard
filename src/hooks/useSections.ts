import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Section } from "../types";

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

  return { sections, loading, error };
}
