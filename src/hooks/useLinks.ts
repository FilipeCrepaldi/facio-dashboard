import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Link } from "../types";

export function useLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("order", { ascending: true });
      if (!active) return;
      if (error) setError(error.message);
      else setLinks((data ?? []) as Link[]);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("links-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "links" },
        () => load()
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { links, loading, error };
}
