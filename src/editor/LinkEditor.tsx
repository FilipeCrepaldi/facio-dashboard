import { IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ICON_NAMES, Icon } from "../components/Icon";
import type { Link } from "../types";

export type LinkFormValues = {
  label: string;
  url: string;
  icon: string | null;
};

type Props = {
  mode: "create" | "edit";
  link?: Link;
  onSave: (values: LinkFormValues) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export function LinkEditor({
  mode,
  link,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [label, setLabel] = useState(link?.label ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [icon, setIcon] = useState<string | null>(link?.icon ?? null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSave = label.trim().length > 0 && url.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      label: label.trim(),
      url: url.trim(),
      icon,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!onDelete || !link) return;
    const ok = window.confirm(`Deletar o link "${link.label}"?`);
    if (ok) {
      onDelete();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            {mode === "create" ? "Novo link" : "Editar link"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
            aria-label="Fechar"
          >
            <IconX size={16} stroke={1.75} />
          </button>
        </header>

        <div className="flex flex-col gap-4 overflow-y-auto px-5">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Texto exibido
            </span>
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={80}
              placeholder="Ex: Tabela de processos"
              className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-facio-blue)]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              URL
            </span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
              placeholder="https://…"
              className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-facio-blue)]"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Ícone
            </span>
            <div className="grid max-h-44 grid-cols-8 gap-1 overflow-y-auto rounded border border-[var(--color-border)] p-2">
              <button
                type="button"
                onClick={() => setIcon(null)}
                title="Sem ícone"
                className={[
                  "flex h-8 w-8 items-center justify-center rounded text-[var(--color-text-muted)] transition",
                  icon === null
                    ? "bg-[var(--color-facio-blue)]/15 text-[var(--color-facio-blue)]"
                    : "hover:bg-[var(--color-border)]",
                ].join(" ")}
              >
                <span className="text-base leading-none">∅</span>
              </button>
              {ICON_NAMES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setIcon(n)}
                  title={n}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded transition",
                    icon === n
                      ? "bg-[var(--color-facio-blue)]/15 text-[var(--color-facio-blue)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]",
                  ].join(" ")}
                >
                  <Icon name={n} size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-[var(--color-border)] px-5 py-3">
          <div>
            {mode === "edit" && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-2.5 py-1.5 text-xs font-medium text-[var(--color-coral)] transition hover:bg-[var(--color-coral)]/10"
              >
                <IconTrash size={14} stroke={1.75} />
                Deletar
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-md bg-[var(--color-facio-blue)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
