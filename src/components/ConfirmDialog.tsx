import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

type Props = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onConfirm, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={[
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                tone === "danger"
                  ? "bg-[var(--color-coral)]/15 text-[var(--color-coral)]"
                  : "bg-[var(--color-sun)]/20 text-[var(--color-sun)]",
              ].join(" ")}
            >
              <IconAlertTriangle size={16} stroke={2} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                {title}
              </h3>
              {description ? (
                <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 rounded p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
            aria-label="Fechar"
          >
            <IconX size={14} stroke={1.75} />
          </button>
        </header>

        <footer className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90",
              tone === "danger"
                ? "bg-[var(--color-coral)]"
                : "bg-[var(--color-sun)] text-[var(--color-carbono)]",
            ].join(" ")}
          >
            {confirmLabel}
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
