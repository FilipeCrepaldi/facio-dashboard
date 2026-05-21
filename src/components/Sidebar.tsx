import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
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
  onSelectSection: (sectionId: string) => void;
  onRenameWorkspace: (name: string) => void;
  onCreateGroup: (name: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onCreateSection: (values: SectionFormValues) => void;
  onUpdateSection: (id: string, values: SectionFormValues) => void;
  onDeleteSection: (id: string) => void;
};

export function Sidebar({
  workspaceName,
  groups,
  sections,
  activeSectionId,
  editing,
  onSelectHome,
  onSelectSection,
  onRenameWorkspace,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
}: Props) {
  const [renamingWorkspace, setRenamingWorkspace] = useState(false);
  const [workspaceDraft, setWorkspaceDraft] = useState(workspaceName);
  const workspaceInputRef = useRef<HTMLInputElement>(null);

  const [editorState, setEditorState] = useState<EditorState>(null);

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

  const deleteSectionConfirm = (section: Section) => {
    const ok = window.confirm(
      `Deletar a seção "${section.name}"?\n\nIsso remove também os links dentro dela.`
    );
    if (ok) onDeleteSection(section.id);
  };

  const editingSection =
    editorState?.mode === "edit"
      ? sections.find((s) => s.id === editorState.sectionId)
      : undefined;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-4 border-r border-[var(--color-border)] bg-[var(--color-sidebar)] px-3 py-4">
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
          groups.map((group) => {
            const groupSections = sections.filter(
              (s) => s.group_id === group.id
            );
            return (
              <div key={group.id} className="flex flex-col gap-1">
                <GroupHeader
                  group={group}
                  editing={editing}
                  onRename={(name) => onRenameGroup(group.id, name)}
                  onDelete={() => onDeleteGroup(group.id)}
                />
                <div className="flex flex-col gap-0.5">
                  {groupSections.length === 0 && !editing ? (
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
                        actions={
                          editing ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditorState({
                                    mode: "edit",
                                    sectionId: section.id,
                                  })
                                }
                                title="Editar seção"
                                className="rounded p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
                              >
                                <IconPencil
                                  size={13}
                                  stroke={1.75}
                                  aria-hidden
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSectionConfirm(section)}
                                title="Deletar seção"
                                className="rounded p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-coral)]/10 hover:text-[var(--color-coral)]"
                              >
                                <IconTrash
                                  size={13}
                                  stroke={1.75}
                                  aria-hidden
                                />
                              </button>
                            </>
                          ) : undefined
                        }
                      />
                    ))
                  )}
                  {editing ? (
                    <NewSectionButton
                      onClick={() =>
                        setEditorState({
                          mode: "create",
                          groupId: group.id,
                        })
                      }
                    />
                  ) : null}
                </div>
              </div>
            );
          })
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
