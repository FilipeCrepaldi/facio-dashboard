import { IconPencil } from "@tabler/icons-react";
import type { Link } from "../types";
import { Icon } from "./Icon";

type Props = {
  link: Link;
  onEdit?: () => void;
};

export function ItemRow({ link, onEdit }: Props) {
  return (
    <div className="group/row relative flex items-center">
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer noopener"
        className="group/link flex flex-1 items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-border)] hover:bg-[var(--color-surface)]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icon name={link.icon} size={16} />
          <span className="truncate">{link.label}</span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-[var(--color-text-muted)] opacity-0 transition group-hover/link:opacity-100"
          aria-hidden
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </a>
      {onEdit ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          className="absolute right-2 rounded p-1 text-[var(--color-text-muted)] opacity-0 transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)] group-hover/row:opacity-100"
          aria-label="Editar link"
        >
          <IconPencil size={14} stroke={1.75} />
        </button>
      ) : null}
    </div>
  );
}
