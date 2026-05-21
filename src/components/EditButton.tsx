type Props = {
  editing: boolean;
  onToggle: () => void;
};

export function EditButton({ editing, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition",
        editing
          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)]",
      ].join(" ")}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
      {editing ? "Concluir edição" : "Edição"}
    </button>
  );
}
