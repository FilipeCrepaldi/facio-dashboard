import { IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ICON_NAMES, Icon } from "../components/Icon";
import type { Group, Section } from "../types";

export type SectionFormValues = {
  group_id: string;
  name: string;
  icon: string | null;
  description: string | null;
};

type Props = {
  mode: "create" | "edit";
  groups: Group[];
  section?: Section;
  defaultGroupId?: string;
  onSave: (values: SectionFormValues) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export function SectionEditor({
  mode,
  groups,
  section,
  defaultGroupId,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState(section?.name ?? "");
  const [icon, setIcon] = useState<string | null>(section?.icon ?? null);
  const [description, setDescription] = useState(section?.description ?? "");
  const [groupId, setGroupId] = useState(
    section?.group_id ?? defaultGroupId ?? groups[0]?.id ?? ""
  );
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSave = name.trim().length > 0 && groupId !== "";

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      group_id: groupId,
      name: name.trim(),
      icon,
      description: description.trim() || null,
    });
    onClose();
  };

  return (
    <>
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
              {mode === "create" ? "Nova seção" : "Editar seção"}
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
                Nome
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-facio-blue)]"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                Grupo
              </span>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-facio-blue)]"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                Descrição
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={200}
                className="resize-none rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-facio-blue)]"
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
                  onClick={() => setConfirming(true)}
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

      {confirming && onDelete ? (
        <ConfirmDialog
          title={`Deletar "${section?.name ?? "seção"}"?`}
          description="Isso remove também todos os links dentro desta seção."
          confirmLabel="Deletar seção"
          onConfirm={() => {
            setConfirming(false);
            onDelete();
            onClose();
          }}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
    </>
  );
}
