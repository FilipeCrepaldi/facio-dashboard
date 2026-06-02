import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Tone = "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  tone: Tone;
};

type ToastAPI = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastAPI | null>(null);

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: Tone) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const api: ToastAPI = {
    success: (msg) => show(msg, "success"),
    error: (msg) => show(msg, "error"),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col items-end gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={[
                "pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm shadow-lg",
                t.tone === "success"
                  ? "border-[var(--color-menta)]/40 bg-[var(--color-surface)] text-[var(--color-text)]"
                  : "border-[var(--color-coral)]/40 bg-[var(--color-surface)] text-[var(--color-coral)]",
              ].join(" ")}
            >
              {t.tone === "success" ? (
                <IconCheck
                  size={15}
                  stroke={2.5}
                  className="shrink-0 text-[var(--color-menta)]"
                />
              ) : (
                <IconAlertTriangle
                  size={15}
                  stroke={2}
                  className="shrink-0"
                />
              )}
              <span className={t.tone === "success" ? "text-[var(--color-text)]" : ""}>
                {t.message}
              </span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="ml-1 rounded p-0.5 opacity-50 transition hover:opacity-100"
                aria-label="Fechar notificação"
              >
                <IconX size={12} stroke={2} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
