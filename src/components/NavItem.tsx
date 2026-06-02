import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";

type Props = {
  label: string;
  icon?: string | null;
  active?: boolean;
  onClick?: () => void;
  actions?: ReactNode;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
};

export function NavItem({ label, icon, active, onClick, actions, dragHandleProps }: Props) {
  return (
    <div
      className={[
        "group/nav flex w-full items-center gap-1 rounded-md transition",
        active
          ? "bg-[var(--color-accent)]/15 text-[var(--color-text)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]",
      ].join(" ")}
    >
      {dragHandleProps ? (
        <button
          type="button"
          {...dragHandleProps}
          className="cursor-grab pl-1 pr-0 py-1.5 text-[var(--color-text-muted)] opacity-0 transition hover:text-[var(--color-text)] group-hover/nav:opacity-100 active:cursor-grabbing"
          title="Arrastar para reordenar"
          aria-label="Reordenar seção"
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
            <circle cx="3" cy="2.5" r="1.2" />
            <circle cx="7" cy="2.5" r="1.2" />
            <circle cx="3" cy="7" r="1.2" />
            <circle cx="7" cy="7" r="1.2" />
            <circle cx="3" cy="11.5" r="1.2" />
            <circle cx="7" cy="11.5" r="1.2" />
          </svg>
        </button>
      ) : null}
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
