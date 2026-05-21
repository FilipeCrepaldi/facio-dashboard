type Props = {
  label: string;
  icon?: string | null;
  active?: boolean;
  onClick?: () => void;
};

export function NavItem({ label, icon, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition",
        active
          ? "bg-[var(--color-accent)]/15 text-[var(--color-text)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]",
      ].join(" ")}
    >
      {icon ? (
        <span aria-hidden className="text-base leading-none">
          {icon}
        </span>
      ) : (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-50"
        />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}
