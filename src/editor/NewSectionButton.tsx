import { IconPlus } from "@tabler/icons-react";

type Props = {
  onClick: () => void;
};

export function NewSectionButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
    >
      <IconPlus size={14} stroke={2} aria-hidden />
      Nova seção
    </button>
  );
}
