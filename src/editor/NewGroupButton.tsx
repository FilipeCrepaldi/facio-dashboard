import { IconPlus } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  onCreate: (name: string) => void;
};

export function NewGroupButton({ onCreate }: Props) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onCreate(trimmed);
    setDraft("");
    setCreating(false);
  };

  const cancel = () => {
    setDraft("");
    setCreating(false);
  };

  if (creating) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          else if (e.key === "Escape") cancel();
        }}
        placeholder="Nome do grupo"
        maxLength={40}
        className="mx-2 rounded border border-[var(--color-facio-blue)] bg-transparent px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text)] outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setCreating(true)}
      className="mx-2 flex items-center gap-1.5 rounded-md border border-dashed border-[var(--color-border)] px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
    >
      <IconPlus size={14} stroke={2} aria-hidden />
      Novo grupo
    </button>
  );
}
