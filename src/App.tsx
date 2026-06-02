import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EditButton } from "./components/EditButton";
import { Logo } from "./components/Logo";
import { PageContent } from "./components/PageContent";
import { Sidebar } from "./components/Sidebar";
import { ThemeToggle } from "./components/ThemeToggle";
import { ToastProvider, useToast } from "./components/Toast";
import { useGroups } from "./hooks/useGroups";
import { useLinks } from "./hooks/useLinks";
import { useSections } from "./hooks/useSections";
import { useTheme } from "./hooks/useTheme";
import { useWorkspace } from "./hooks/useWorkspace";
import { isSupabaseConfigured } from "./lib/supabase";
import { CollectionTree } from "./pages/CollectionTree";
import { Home } from "./pages/Home";
import { Launcher } from "./pages/Launcher";
import { SectionPage } from "./pages/SectionPage";

type View = "launcher" | "dashboard" | "tree";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28, ease: "easeOut" as const },
};

function AppInner() {
  const toast = useToast();
  const { theme, toggle } = useTheme();
  const { workspace, updateName: renameWorkspace } = useWorkspace();
  const { groups, error: groupsError, createGroup, renameGroup, deleteGroup, reorderGroups } = useGroups();
  const { sections, error: sectionsError, createSection, updateSection, deleteSection, reorderSections } = useSections();
  const { links, error: linksError, createLink, updateLink, deleteLink, reorderLinks } = useLinks();

  const [view, setView] = useState<View>("tree");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [treeEditing, setTreeEditing] = useState(false);

  // Surface Supabase errors as toasts
  useEffect(() => {
    if (groupsError) toast.error(groupsError);
  }, [groupsError]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sectionsError) toast.error(sectionsError);
  }, [sectionsError]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (linksError) toast.error(linksError);
  }, [linksError]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSection =
    sections.find((s) => s.id === activeSectionId) ?? null;
  const workspaceName = workspace?.name ?? "Facio";

  const goLauncher = () => {
    setView("launcher");
    setEditing(false);
    setTreeEditing(false);
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-2">
        {view !== "dashboard" ? (
          <div className="pointer-events-auto flex items-center gap-2">
            <Logo size={24} />
          </div>
        ) : (
          <div />
        )}
        <div className="pointer-events-auto">
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === "launcher" ? (
            <motion.div
              key="launcher"
              {...pageTransition}
              className="flex flex-1 overflow-y-auto"
            >
              <Launcher workspaceName={workspaceName} onSelect={setView} />
            </motion.div>
          ) : null}

          {view === "tree" ? (
            <motion.main
              key="tree"
              {...pageTransition}
              className="flex-1 overflow-y-auto"
            >
              <div
                className={[
                  "mx-auto flex flex-col gap-8 px-6 pt-20 pb-10",
                  treeEditing ? "max-w-5xl" : "max-w-3xl",
                ].join(" ")}
              >
                <header className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                      Árvore de Cobrança
                    </h1>
                    <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
                      {treeEditing
                        ? "Edite perguntas, respostas e ações terminais. Alterações são salvas automaticamente."
                        : "Responda cada pergunta e o fluxo guia até a ação recomendada."}
                    </p>
                  </div>
                  <EditButton
                    editing={treeEditing}
                    onToggle={() => setTreeEditing((v) => !v)}
                  />
                </header>
                <CollectionTree editing={treeEditing} />
              </div>
            </motion.main>
          ) : null}

          {view === "dashboard" ? (
            <motion.div
              key="dashboard"
              {...pageTransition}
              className="flex flex-1 overflow-hidden"
            >
              <Sidebar
                workspaceName={workspaceName}
                groups={groups}
                sections={sections}
                activeSectionId={activeSectionId}
                editing={editing}
                onSelectHome={() => setActiveSectionId(null)}
                onGoLauncher={goLauncher}
                onSelectSection={setActiveSectionId}
                onRenameWorkspace={renameWorkspace}
                onCreateGroup={createGroup}
                onRenameGroup={renameGroup}
                onDeleteGroup={deleteGroup}
                onReorderGroups={reorderGroups}
                onCreateSection={createSection}
                onUpdateSection={(id, values) => updateSection(id, values)}
                onDeleteSection={deleteSection}
                onReorderSections={reorderSections}
              />

              <div className="flex flex-1 flex-col">
                {!isSupabaseConfigured ? (
                  <div className="border-b border-[var(--color-coral)]/30 bg-[var(--color-coral)]/10 px-6 py-2 text-xs text-[var(--color-coral)]">
                    Supabase não configurado. Preencha <code>.env</code> com{" "}
                    <code>VITE_SUPABASE_URL</code> e{" "}
                    <code>VITE_SUPABASE_ANON_KEY</code>.
                  </div>
                ) : null}

                {activeSection ? (
                  <PageContent
                    title={activeSection.name}
                    description={activeSection.description}
                    actions={
                      <EditButton
                        editing={editing}
                        onToggle={() => setEditing((v) => !v)}
                      />
                    }
                  >
                    <SectionPage
                      section={activeSection}
                      links={links}
                      editing={editing}
                      onCreateLink={createLink}
                      onUpdateLink={updateLink}
                      onDeleteLink={deleteLink}
                      onReorderLinks={reorderLinks}
                    />
                  </PageContent>
                ) : (
                  <PageContent
                    title={workspaceName}
                    description="Dashboard de Operations — links, processos e instruções do time."
                    actions={
                      <EditButton
                        editing={editing}
                        onToggle={() => setEditing((v) => !v)}
                      />
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
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

export default App;
