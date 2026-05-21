import type { Group, Link, Section } from "../types";

type Props = {
  groups: Group[];
  sections: Section[];
  links: Link[];
  onSelectSection: (sectionId: string) => void;
};

export function Home({ groups, sections, links, onSelectSection }: Props) {
  if (groups.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
        Nenhum grupo ainda. Ative o modo edição para criar o primeiro.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => {
        const groupSections = sections.filter((s) => s.group_id === group.id);
        if (groupSections.length === 0) return null;
        return (
          <section key={group.id} className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {group.name}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupSections.map((section) => {
                const count = links.filter(
                  (l) => l.section_id === section.id
                ).length;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onSelectSection(section.id)}
                    className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition hover:border-[var(--color-accent)]"
                  >
                    <div className="flex items-center gap-2">
                      {section.icon ? (
                        <span aria-hidden className="text-lg leading-none">
                          {section.icon}
                        </span>
                      ) : null}
                      <span className="font-medium text-[var(--color-text)]">
                        {section.name}
                      </span>
                    </div>
                    {section.description ? (
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {section.description}
                      </p>
                    ) : null}
                    <p className="mt-auto text-xs text-[var(--color-text-muted)]">
                      {count} {count === 1 ? "link" : "links"}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
