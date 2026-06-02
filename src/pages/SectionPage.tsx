import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  onReorderLinks: (sectionId: string, orderedIds: string[]) => void;
};

export function SectionPage({
  section,
  links,
  editing,
  onCreateLink,
  onUpdateLink,
  onDeleteLink,
  onReorderLinks,
}: Props) {
  const [editor, setEditor] = useState<EditorState>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sectionLinks.map((l) => l.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    if (oldIdx === -1 || newIdx === -1) return;
    onReorderLinks(section.id, arrayMove(ids, oldIdx, newIdx));
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionLinks.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1">
            {sectionLinks.length === 0 && !editing ? (
              <p className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
                Nenhum link nesta seção ainda.
              </p>
            ) : null}

            {sectionLinks.map((link) => (
              <SortableLinkRow
                key={link.id}
                link={link}
                editing={editing}
                onEdit={() => setEditor({ mode: "edit", link })}
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
        </SortableContext>
      </DndContext>

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

// ─── Sortable link row ────────────────────────────────────────────────────────

function SortableLinkRow({
  link,
  editing,
  onEdit,
}: {
  link: Link;
  editing: boolean;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id, disabled: !editing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ItemRow
        link={link}
        onEdit={editing ? onEdit : undefined}
        dragHandleProps={
          editing
            ? ({ ...listeners, ...attributes } as React.HTMLAttributes<HTMLButtonElement>)
            : undefined
        }
      />
    </div>
  );
}
