import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Link } from "../types";

export type LinkInput = {
  section_id: string;
  label: string;
  url: string;
  icon?: string | null;
};

export type LinkPatch = Partial<Omit<Link, "id" | "created_at" | "order">>;

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
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const createLink = useCallback(
    async (input: LinkInput) => {
      const label = input.label.trim();
      const url = input.url.trim();
      if (!label || !url) return;

      const sameSection = links.filter((l) => l.section_id === input.section_id);
      const nextOrder = sameSection.length
        ? Math.max(...sameSection.map((l) => l.order)) + 1
        : 0;

      const { error } = await supabase.from("links").insert({
        section_id: input.section_id,
        label,
        url,
        icon: input.icon ?? null,
        order: nextOrder,
      });

      if (error) setError(error.message);
    },
    [links],
  );

  const updateLink = useCallback(
    async (id: string, patch: LinkPatch) => {
      const target = links.find((l) => l.id === id);
      if (!target) return;

      const cleaned: LinkPatch = { ...patch };
      if (typeof cleaned.label === "string") cleaned.label = cleaned.label.trim();
      if (typeof cleaned.url === "string") cleaned.url = cleaned.url.trim();
      if (cleaned.label === "" || cleaned.url === "") return;

      const previous = links;
      setLinks(links.map((l) => (l.id === id ? { ...l, ...cleaned } : l)));

      const { error } = await supabase
        .from("links")
        .update(cleaned)
        .eq("id", id);

      if (error) {
        setLinks(previous);
        setError(error.message);
      }
    },
    [links],
  );

  const deleteLink = useCallback(
    async (id: string) => {
      const previous = links;
      setLinks(links.filter((l) => l.id !== id));

      const { error } = await supabase.from("links").delete().eq("id", id);

      if (error) {
        setLinks(previous);
        setError(error.message);
      }
    },
    [links],
  );

  return {
    links,
    loading,
    error,
    createLink,
    updateLink,
    deleteLink,
  };
}
