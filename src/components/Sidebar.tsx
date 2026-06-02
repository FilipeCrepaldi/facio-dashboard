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
import { IconArrowLeft, IconPencil, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { GroupHeader } from "../editor/GroupHeader";
import { NewGroupButton } from "../editor/NewGroupButton";
import { NewSectionButton } from "../editor/NewSectionButton";
import {
  SectionEditor,
  type SectionFormValues,
} from "../editor/SectionEditor";
import type { Group, Section } from "../types";
import { Logo } from "./Logo";
import { NavItem } from "./NavItem";

type EditorState =
  | { mode: "create"; groupId: string }
  | { mode: "edit"; sectionId: string }
  | null;

type Props = {
  workspaceName: string;
  groups: Group[];
  sections: Section[];
  activeSectionId: string | null;
  editing: boolean;
  onSelectHome: () => void;
  onGoLauncher?: () => void;
  onSelectSection: (sectionId: string) => void;
  onRenameWorkspace: (name: string) => void;
  onCreateGroup: (name: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onReorderGroups: (orderedIds: string[]) => void;
  onCreateSection: (values: SectionFormValues) => void;
  onUpdateSection: (id: string, values: SectionFormValues) => void;
  onDeleteSection: (id: string) => void;
  onReorderSections: (groupId: string, orderedIds: string[]) => void;
};

export function Sidebar({
  workspaceName,
  groups,
  sections,
  activeSectionId,
  editing,
  onSelectHome,
  onGoLauncher,
  onSelectSection,
  onRenameWorkspace,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onReorderGroups,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  onReorderSections,
}: Props) {
  const [renamingWorkspace, setRenamingWorkspace] = useState(false);
  const [workspaceDraft, setWorkspaceDraft] = useState(workspaceName);
  const workspaceInputRef = useRef<HTMLInputElement>(null);
  const [editorState, setEditorState] = useState<EditorState>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    if (!renamingWorkspace) setWorkspaceDraft(workspaceName);
  }, [workspaceName, renamingWorkspace]);

  useEffect(() => {
    if (renamingWorkspace) {
      workspaceInputRef.current?.focus();
      workspaceInputRef.current?.select();
    }
  }, [renamingWorkspace]);

  useEffect(() => {
    if (!editing) setEditorState(null);
  }, [editing]);

  const commitWorkspace = () => {
    const trimmed = workspaceDraft.trim();
    if (trimmed && trimmed !== workspaceName) onRenameWorkspace(trimmed);
    else setWorkspaceDraft(workspaceName);
    setRenamingWorkspace(false);
  };

  const cancelWorkspace = () => {
    setWorkspaceDraft(workspaceName);
    setRenamingWorkspace(false);
  };

  const editingSection =
    editorState?.mode === "edit"
      ? sections.find((s) => s.id === editorState.sectionId)
      : undefined;

  const handleGroupsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = groups.map((g) => g.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    if (oldIdx === -1 || newIdx === -1) return;
    onReorderGroups(arrayMove(ids, oldIdx, newIdx));
  };

  const handleSectionsDragEnd = (groupId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const groupSections = sections.filter((s) => s.group_id === groupId);
    const ids = groupSections.map((s) => s.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    if (oldIdx === -1 || newIdx === -1) return;
    onReorderSections(groupId, arrayMove(ids, oldIdx, newIdx));
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-4 border-r border-[var(--color-border)] bg-[var(--color-sidebar)] px-3 py-4">
      {onGoLauncher ? (
        <button
          type="button"
          onClick={onGoLauncher}
          className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
        >
          <IconArrowLeft size={14} stroke={2} />
          Início
        </button>
      ) : null}

      <div className="flex items-center gap-2 rounded-md px-2 py-1">
        <button
          type="button"
          onClick={onSelectHome}
          className="shrink-0 rounded-md transition hover:opacity-80"
          aria-label="Ir para a home"
        >
          <Logo size={28} />
        </button>
        {renamingWorkspace ? (
          <input
            ref={workspaceInputRef}
            value={workspaceDraft}
            onChange={(e) => setWorkspaceDraft(e.target.value)}
            onBlur={commitWorkspace}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitWorkspace();
              else if (e.key === "Escape") cancelWorkspace();
            }}
            maxLength={40}
            className="w-full rounded border border-[var(--color-facio-blue)] bg-transparent px-1 py-0.5 text-sm font-medium text-[var(--color-text)] outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setRenamingWorkspace(true)}
            title="Clique para renomear"
            className="flex-1 truncate rounded px-1 py-0.5 text-left text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-border)]"
          >
            {workspaceName || "Workspace"}
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {groups.length === 0 && !editing ? (
          <p className="px-2 text-xs text-[var(--color-text-muted)]">
            Nenhum grupo cadastrado ainda.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleGroupsDragEnd}
          >
            <SortableContext
              items={groups.map((g) => g.id)}
              strategy={verticalListSortingStrategy}
            >
              {groups.map((group) => {
                const groupSections = sections
                  .filter((s) => s.group_id === group.id)
                  .sort((a, b) => a.order - b.order);

                return (
                  <SortableGroupRow
                    key={group.id}
                    group={group}
                    groupSections={groupSections}
                    allSections={sections}
                    editing={editing}
                    activeSectionId={activeSectionId}
                    sensors={sensors}
                    onRenameGroup={onRenameGroup}
                    onDeleteGroup={onDeleteGroup}
                    onSelectSection={onSelectSection}
                    onSetEditorCreate={(groupId) =>
                      setEditorState({ mode: "create", groupId })
                    }
                    onSetEditorEdit={(sectionId) =>
                      setEditorState({ mode: "edit", sectionId })
                    }
                    onDeleteSection={onDeleteSection}
                    onSectionsDragEnd={handleSectionsDragEnd(group.id)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        )}

        {editing ? (
          <div className="flex flex-col">
            <NewGroupButton onCreate={onCreateGroup} />
          </div>
        ) : null}
      </nav>

      {editorState && groups.length > 0 ? (
        <SectionEditor
          mode={editorState.mode}
          groups={groups}
          section={editingSection}
          defaultGroupId={
            editorState.mode === "create" ? editorState.groupId : undefined
          }
          onSave={(values) => {
            if (editorState.mode === "create") onCreateSection(values);
            else onUpdateSection(editorState.sectionId, values);
          }}
          onDelete={
            editorState.mode === "edit" && editingSection
              ? () => onDeleteSection(editingSection.id)
              : undefined
          }
          onClose={() => setEditorState(null)}
        />
      ) : null}
    </aside>
  );
}

// ─── Sortable group row ───────────────────────────────────────────────────────

type SortableGroupRowProps = {
  group: Group;
  groupSections: Section[];
  allSections: Section[];
  editing: boolean;
  activeSectionId: string | null;
  sensors: ReturnType<typeof useSensors>;
  onRenameGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onSelectSection: (id: string) => void;
  onSetEditorCreate: (groupId: string) => void;
  onSetEditorEdit: (sectionId: string) => void;
  onDeleteSection: (id: string) => void;
  onSectionsDragEnd: (event: DragEndEvent) => void;
};

function SortableGroupRow({
  group,
  groupSections,
  editing,
  activeSectionId,
  sensors,
  onRenameGroup,
  onDeleteGroup,
  onSelectSection,
  onSetEditorCreate,
  onSetEditorEdit,
  onDeleteSection,
  onSectionsDragEnd,
}: SortableGroupRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: group.id, disabled: !editing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-1">
      <GroupHeader
        group={group}
        editing={editing}
        dragHandleProps={editing ? ({ ...listeners, ...attributes } as React.HTMLAttributes<HTMLButtonElement>) : undefined}
        onRename={(name) => onRenameGroup(group.id, name)}
        onDelete={() => onDeleteGroup(group.id)}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onSectionsDragEnd}
      >
        <SortableContext
          items={groupSections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-0.5">
            {groupSections.length === 0 && !editing ? (
              <p className="px-2 py-1 text-xs text-[var(--color-text-muted)]">
                Sem seções
              </p>
            ) : (
              groupSections.map((section) => (
                <SortableSectionRow
                  key={section.id}
                  section={section}
                  editing={editing}
                  active={section.id === activeSectionId}
                  onSelect={() => onSelectSection(section.id)}
                  onEdit={() => onSetEditorEdit(section.id)}
                  onDelete={() => onDeleteSection(section.id)}
                />
              ))
            )}
            {editing ? (
              <NewSectionButton
                onClick={() => onSetEditorCreate(group.id)}
              />
            ) : null}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ─── Sortable section row ─────────────────────────────────────────────────────

type SortableSectionRowProps = {
  section: Section;
  editing: boolean;
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function SortableSectionRow({
  section,
  editing,
  active,
  onSelect,
  onEdit,
  onDelete,
}: SortableSectionRowProps) {
  const [confirming, setConfirming] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id, disabled: !editing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <NavItem
          label={section.name}
          icon={section.icon}
          active={active}
          onClick={onSelect}
          dragHandleProps={
            editing
              ? ({ ...listeners, ...attributes } as React.HTMLAttributes<HTMLButtonElement>)
              : undefined
          }
          actions={
            editing ? (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  title="Editar seção"
                  className="rounded p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
                >
                  <IconPencil size={13} stroke={1.75} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  title="Deletar seção"
                  className="rounded p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-coral)]/10 hover:text-[var(--color-coral)]"
                >
                  <IconTrash size={13} stroke={1.75} aria-hidden />
                </button>
              </>
            ) : undefined
          }
        />
      </div>
      {confirming ? (
        <ConfirmDialog
          title={`Deletar "${section.name}"?`}
          description="Isso remove também todos os links dentro desta seção."
          confirmLabel="Deletar seção"
          onConfirm={() => {
            setConfirming(false);
            onDelete();
          }}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
    </>
  );
}
