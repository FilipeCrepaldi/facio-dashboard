import { ItemRow } from "../components/ItemRow";
import type { Link, Section } from "../types";

type Props = {
  section: Section;
  links: Link[];
};

export function SectionPage({ section, links }: Props) {
  const sectionLinks = links
    .filter((l) => l.section_id === section.id)
    .sort((a, b) => a.order - b.order);

  if (sectionLinks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
        Nenhum link nesta seção ainda.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {sectionLinks.map((link) => (
        <ItemRow key={link.id} link={link} />
      ))}
    </div>
  );
}
