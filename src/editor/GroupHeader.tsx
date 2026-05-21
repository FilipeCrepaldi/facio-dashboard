import { IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import type { Group } from "../types";

type Props = {
  group: Group;
  editing: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
};

export function GroupHeader({ group, editing, onRename, onDelete }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!renaming) setDraft(group.name);
  }, [group.name, renaming]);

  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== group.name) onRename(trimmed);
    else setDraft(group.name);
    setRenaming(false);
  };

  const cancel = () => {
    setDraft(group.name);
    setRenaming(false);
  };

  const handleDelete = () => {
    const ok = window.confirm(
      `Deletar o grupo "${group.name}"?\n\nIsso remove também as seções e links dentro dele.`
    );
    if (ok) onDelete();
  };

  if (!editing) {
    return (
      <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {group.name}
      </p>
    );
  }

  return (
    <div className="group/header flex items-center gap-1 px-2">
      {renaming ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            else if (e.key === "Escape") cancel();
          }}
          maxLength={40}
          className="w-full rounded border border-[var(--color-facio-blue)] bg-transparent px-1 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text)] outline-none"
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setRenaming(true)}
            title="Clique para renomear"
            className="flex-1 truncate rounded px-1 py-0.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
          >
            {group.name}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            title="Deletar grupo"
            className="rounded p-1 text-[var(--color-text-muted)] opacity-0 transition hover:bg-[var(--color-coral)]/10 hover:text-[var(--color-coral)] group-hover/header:opacity-100"
          >
            <IconTrash size={14} stroke={1.75} aria-hidden />
          </button>
        </>
      )}
    </div>
  );
}
