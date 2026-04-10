"use client";

import { Download, Link2, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/hooks/use-workspace";

const starter = {
  "index.html": "<main><h1>mAI Coder</h1><p>Éditez ce fichier.</p></main>",
  "styles.css":
    "body { font-family: Inter, sans-serif; background: #0b1020; color: #e6ecff; padding: 2rem; }",
  "script.js": "console.log('mAI coder prêt');",
};

export default function CoderPage() {
  const { data: session } = useSession();
  const { state, setState, syncRemote, hydrated } = useWorkspace(
    session?.user?.type
  );
  const [name, setName] = useState("Nouveau Coder");
  const [projectId, setProjectId] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeProject = useMemo(
    () => state.coderProjects.find((item) => item.id === activeId) ?? null,
    [state.coderProjects, activeId]
  );

  const previewDoc = useMemo(() => {
    if (!activeProject) {
      return "";
    }
    return `<!doctype html><html><head><style>${activeProject.files["styles.css"] ?? ""}</style></head><body>${activeProject.files["index.html"] ?? ""}<script>${activeProject.files["script.js"] ?? ""}</script></body></html>`;
  }, [activeProject]);

  const createProject = async () => {
    const next = {
      id: crypto.randomUUID(),
      name,
      projectId: projectId || null,
      language: "html",
      files: starter,
      updatedAt: new Date().toISOString(),
    };
    setState({ ...state, coderProjects: [next, ...state.coderProjects] });
    setActiveId(next.id);
    await syncRemote("POST", { type: "coder", payload: next });
  };

  const updateFile = async (filename: string, value: string) => {
    if (!activeProject) {
      return;
    }
    const updated = {
      ...activeProject,
      files: { ...activeProject.files, [filename]: value },
      updatedAt: new Date().toISOString(),
    };
    setState({
      ...state,
      coderProjects: state.coderProjects.map((project) =>
        project.id === activeProject.id ? updated : project
      ),
    });
    await syncRemote("PATCH", {
      type: "coder",
      id: activeProject.id,
      payload: updated,
    });
  };

  const exportZip = () => {
    if (!activeProject) {
      return;
    }
    const blob = new Blob([JSON.stringify(activeProject.files, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeProject.name}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hydrated) {
    return null;
  }

  return (
    <div className="liquid-glass flex h-full flex-col gap-4 overflow-y-auto p-6 md:p-10">
      <header className="liquid-panel rounded-2xl p-4">
        <h1 className="text-2xl font-semibold">Coder</h1>
        <p className="text-sm text-muted-foreground">
          Chat + éditeur + preview sandbox iframe. Les modifications manuelles
          sont conservées.
        </p>
      </header>

      <section className="liquid-panel flex flex-wrap gap-2 rounded-2xl p-4">
        <Input
          className="max-w-xs"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <select
          className="h-10 rounded-xl border bg-background px-3"
          onChange={(e) => setProjectId(e.target.value)}
          value={projectId}
        >
          <option value="">Aucun projet lié</option>
          {state.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <Button onClick={createProject}>
          <Save className="mr-1 size-4" />
          Créer
        </Button>
        <Button onClick={exportZip} variant="outline">
          <Download className="mr-1 size-4" />
          Export ZIP
        </Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="liquid-panel space-y-2 rounded-2xl p-4">
          {state.coderProjects.map((project) => (
            <button
              className="block w-full rounded-xl border p-3 text-left hover:bg-muted/20"
              key={project.id}
              onClick={() => setActiveId(project.id)}
              type="button"
            >
              <p className="font-medium">{project.name}</p>
              <p className="text-xs text-muted-foreground">
                <Link2 className="mr-1 inline size-3" /> Projet lié:{" "}
                {state.projects.find((p) => p.id === project.projectId)?.name ??
                  "Aucun"}
              </p>
            </button>
          ))}
        </div>

        <div className="liquid-panel rounded-2xl p-4">
          {activeProject ? (
            <div className="grid gap-2">
              {(["index.html", "styles.css", "script.js"] as const).map(
                (filename) => (
                  <textarea
                    className="h-28 rounded-xl border bg-background/70 p-2 font-mono text-xs"
                    key={filename}
                    onChange={(e) => updateFile(filename, e.target.value)}
                    value={activeProject.files[filename] ?? ""}
                  />
                )
              )}
              <iframe
                className="h-64 w-full rounded-xl border bg-white"
                sandbox="allow-scripts"
                srcDoc={previewDoc}
                title="preview"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sélectionnez ou créez un projet Coder.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
