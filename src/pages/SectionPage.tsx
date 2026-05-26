import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { ItemRow } from "../components/ItemRow";
import { LinkEditor, type LinkFormValues } from "../editor/LinkEditor";
import type { LinkInput, LinkPatch } from "../hooks/useLinks";
import type { Link, Section } from "../types";

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; link: Link }
  | null;

type Props = {
  section: Section;
  links: Link[];
  editing: boolean;
  onCreateLink: (input: LinkInput) => void;
  onUpdateLink: (id: string, patch: LinkPatch) => void;
  onDeleteLink: (id: string) => void;
};

export function SectionPage({
  section,
  links,
  editing,
  onCreateLink,
  onUpdateLink,
  onDeleteLink,
}: Props) {
  const [editor, setEditor] = useState<EditorState>(null);

  const sectionLinks = links
    .filter((l) => l.section_id === section.id)
    .sort((a, b) => a.order - b.order);

  const handleSave = (values: LinkFormValues) => {
    if (editor?.mode === "create") {
      onCreateLink({
        section_id: section.id,
        label: values.label,
        url: values.url,
        icon: values.icon,
      });
    } else if (editor?.mode === "edit") {
      onUpdateLink(editor.link.id, {
        label: values.label,
        url: values.url,
        icon: values.icon,
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        {sectionLinks.length === 0 && !editing ? (
          <p className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
            Nenhum link nesta seção ainda.
          </p>
        ) : null}

        {sectionLinks.map((link) => (
          <ItemRow
            key={link.id}
            link={link}
            onEdit={
              editing
                ? () => setEditor({ mode: "edit", link })
                : undefined
            }
          />
        ))}

        {editing ? (
          <button
            type="button"
            onClick={() => setEditor({ mode: "create" })}
            className="mt-2 inline-flex items-center gap-1.5 self-start rounded-md border border-dashed border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-facio-blue)] hover:text-[var(--color-facio-blue)]"
          >
            <IconPlus size={14} stroke={2} />
            Novo link
          </button>
        ) : null}
      </div>

      {editor ? (
        <LinkEditor
          mode={editor.mode}
          link={editor.mode === "edit" ? editor.link : undefined}
          onSave={handleSave}
          onDelete={
            editor.mode === "edit"
              ? () => onDeleteLink(editor.link.id)
              : undefined
          }
          onClose={() => setEditor(null)}
        />
      ) : null}
    </>
  );
}
