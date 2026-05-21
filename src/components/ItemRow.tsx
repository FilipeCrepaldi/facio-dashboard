import type { Link } from "../types";

type Props = {
  link: Link;
};

export function ItemRow({ link }: Props) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-border)] hover:bg-[var(--color-surface)]"
    >
      <span className="flex min-w-0 items-center gap-2">
        {link.icon ? (
          <span aria-hidden className="text-base leading-none">
            {link.icon}
          </span>
        ) : (
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-text-muted)]"
          />
        )}
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
        className="shrink-0 text-[var(--color-text-muted)] opacity-0 transition group-hover:opacity-100"
        aria-hidden
      >
        <path d="M7 17L17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </a>
  );
}
