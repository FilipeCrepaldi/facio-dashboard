import type { ReactNode } from "react";
import { Icon } from "./Icon";

type Props = {
  label: string;
  icon?: string | null;
  active?: boolean;
  onClick?: () => void;
  actions?: ReactNode;
};

export function NavItem({ label, icon, active, onClick, actions }: Props) {
  return (
    <div
      className={[
        "group/nav flex w-full items-center gap-1 rounded-md transition",
        active
          ? "bg-[var(--color-accent)]/15 text-[var(--color-text)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left text-sm"
      >
        <Icon name={icon} size={16} />
        <span className="truncate">{label}</span>
      </button>
      {actions ? (
        <div className="flex shrink-0 items-center pr-1 opacity-0 transition group-hover/nav:opacity-100">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
