import {
  IconArrowRight,
  IconLayoutDashboard,
  IconSitemap,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

type Tool = "dashboard" | "tree";

type Props = {
  workspaceName: string;
  onSelect: (tool: Tool) => void;
};

export function Launcher({ workspaceName, onSelect }: Props) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            {workspaceName}
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-text)]">
            O que você precisa hoje?
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Escolha uma das ferramentas abaixo.
          </p>
        </motion.div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <LauncherCard
            index={0}
            icon={<IconLayoutDashboard size={28} stroke={1.75} />}
            title="Dashboard de Operações"
            description="Links, processos e instruções do time. Organizado por grupos e seções."
            onClick={() => onSelect("dashboard")}
          />
          <LauncherCard
            index={1}
            icon={<IconSitemap size={28} stroke={1.75} />}
            title="Árvore de Cobrança"
            description="Fluxo de decisão: dado os dias de atraso, qual ação tomar com o cliente."
            onClick={() => onSelect("tree")}
          />
        </div>
      </div>
    </main>
  );
}

type CardProps = {
  index: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
};

function LauncherCard({ index, icon, title, description, onClick }: CardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="group flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left transition hover:border-[var(--color-accent)] hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-facio-blue)]/10 text-[var(--color-facio-blue)]">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          {title}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
      </div>
      <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] transition group-hover:text-[var(--color-accent)]">
        Abrir
        <IconArrowRight
          size={14}
          stroke={2}
          className="transition group-hover:translate-x-0.5"
        />
      </div>
    </motion.button>
  );
}
