import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Workspace } from "../types";

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase
      .from("workspace")
      .select("id, name")
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setWorkspace(data);
        setLoading(false);
      });

    const channel = supabase
      .channel("workspace-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspace" },
        (payload) => {
          if (payload.new && "id" in payload.new) {
            setWorkspace(payload.new as Workspace);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { workspace, loading, error };
}
