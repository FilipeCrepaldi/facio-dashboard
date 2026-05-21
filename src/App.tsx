import { useState } from "react";
import { EditButton } from "./components/EditButton";
import { PageContent } from "./components/PageContent";
import { Sidebar } from "./components/Sidebar";
import { ThemeToggle } from "./components/ThemeToggle";
import { useGroups } from "./hooks/useGroups";
import { useLinks } from "./hooks/useLinks";
import { useSections } from "./hooks/useSections";
import { useTheme } from "./hooks/useTheme";
import { useWorkspace } from "./hooks/useWorkspace";
import { isSupabaseConfigured } from "./lib/supabase";
import { Home } from "./pages/Home";
import { SectionPage } from "./pages/SectionPage";

function App() {
  const { theme, toggle } = useTheme();
  const { workspace, updateName: renameWorkspace } = useWorkspace();
  const { groups, createGroup, renameGroup, deleteGroup } = useGroups();
  const { sections, createSection, updateSection, deleteSection } =
    useSections();
  const { links } = useLinks();

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const activeSection =
    sections.find((s) => s.id === activeSectionId) ?? null;

  const workspaceName = workspace?.name ?? "Facio";

  return (
    <div className="flex h-full w-full bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar
        workspaceName={workspaceName}
        groups={groups}
        sections={sections}
        activeSectionId={activeSectionId}
        editing={editing}
        onSelectHome={() => setActiveSectionId(null)}
        onSelectSection={setActiveSectionId}
        onRenameWorkspace={renameWorkspace}
        onCreateGroup={createGroup}
        onRenameGroup={renameGroup}
        onDeleteGroup={deleteGroup}
        onCreateSection={createSection}
        onUpdateSection={(id, values) => updateSection(id, values)}
        onDeleteSection={deleteSection}
      />

      <div className="flex flex-1 flex-col">
        {!isSupabaseConfigured ? (
          <div className="border-b border-[var(--color-coral)]/30 bg-[var(--color-coral)]/10 px-6 py-2 text-xs text-[var(--color-coral)]">
            Supabase não configurado. Preencha <code>.env</code> com{" "}
            <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
          </div>
        ) : null}

        {activeSection ? (
          <PageContent
            title={activeSection.name}
            description={activeSection.description}
            actions={
              <>
                <EditButton
                  editing={editing}
                  onToggle={() => setEditing((v) => !v)}
                />
                <ThemeToggle theme={theme} onToggle={toggle} />
              </>
            }
          >
            <SectionPage section={activeSection} links={links} />
          </PageContent>
        ) : (
          <PageContent
            title={workspaceName}
            description="Dashboard de Operations — links, processos e instruções do time."
            actions={
              <>
                <EditButton
                  editing={editing}
                  onToggle={() => setEditing((v) => !v)}
                />
                <ThemeToggle theme={theme} onToggle={toggle} />
              </>
            }
          >
            <Home
              groups={groups}
              sections={sections}
              links={links}
              onSelectSection={setActiveSectionId}
            />
          </PageContent>
        )}
      </div>
    </div>
  );
}

export default App;
