import type { Group, Section } from "../types";
import { Logo } from "./Logo";
import { NavItem } from "./NavItem";

type Props = {
  workspaceName: string;
  groups: Group[];
  sections: Section[];
  activeSectionId: string | null;
  onSelectHome: () => void;
  onSelectSection: (sectionId: string) => void;
};

export function Sidebar({
  workspaceName,
  groups,
  sections,
  activeSectionId,
  onSelectHome,
  onSelectSection,
}: Props) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-4 border-r border-[var(--color-border)] bg-[var(--color-sidebar)] px-3 py-4">
      <button
        type="button"
        onClick={onSelectHome}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-left transition hover:bg-[var(--color-border)]"
      >
        <Logo size={28} />
        <span className="text-sm font-medium text-[var(--color-text)]">
          {workspaceName || "Workspace"}
        </span>
      </button>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {groups.length === 0 ? (
          <p className="px-2 text-xs text-[var(--color-text-muted)]">
            Nenhum grupo cadastrado ainda.
          </p>
        ) : (
          groups.map((group) => {
            const groupSections = sections.filter(
              (s) => s.group_id === group.id
            );
            return (
              <div key={group.id} className="flex flex-col gap-1">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {group.name}
                </p>
                <div className="flex flex-col gap-0.5">
                  {groupSections.length === 0 ? (
                    <p className="px-2 py-1 text-xs text-[var(--color-text-muted)]">
                      Sem seções
                    </p>
                  ) : (
                    groupSections.map((section) => (
                      <NavItem
                        key={section.id}
                        label={section.name}
                        icon={section.icon}
                        active={section.id === activeSectionId}
                        onClick={() => onSelectSection(section.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}
