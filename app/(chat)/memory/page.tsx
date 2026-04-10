"use client";

import { Brain, Save, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/hooks/use-workspace";

export default function MemoryPage() {
  const { data: session } = useSession();
  const { state, setState, syncRemote, hydrated } = useWorkspace(
    session?.user?.type
  );
  const [tab, setTab] = useState<"global" | "project">("global");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");

  const memories = useMemo(
    () =>
      state.memories.filter((entry) =>
        tab === "global" ? !entry.projectId : Boolean(entry.projectId)
      ),
    [state.memories, tab]
  );

  const addMemory = async (
    source: "auto_silent" | "auto_confirmed" | "manual"
  ) => {
    if (!content.trim()) {
      return;
    }
    const memory = {
      id: crypto.randomUUID(),
      content: content.trim(),
      source,
      projectId: tab === "project" ? projectId || null : null,
      createdAt: new Date().toISOString(),
    };
    setState({ ...state, memories: [memory, ...state.memories] });
    await syncRemote("POST", { type: "memory", payload: memory });
    setContent("");
  };

  if (!hydrated) {
    return null;
  }

  return (
    <div className="liquid-glass flex h-full flex-col gap-4 overflow-y-auto p-6 md:p-10">
      <header className="liquid-panel rounded-2xl p-4">
        <h1 className="text-2xl font-semibold">Mémoire persistante</h1>
        <p className="text-sm text-muted-foreground">
          Globale ou locale au projet, avec origine 🤖 ✨ ✦.
        </p>
      </header>

      <section className="liquid-panel rounded-2xl p-4">
        <div className="mb-3 flex gap-2">
          <Button
            onClick={() => setTab("global")}
            variant={tab === "global" ? "default" : "outline"}
          >
            Globale
          </Button>
          <Button
            onClick={() => setTab("project")}
            variant={tab === "project" ? "default" : "outline"}
          >
            Par projet
          </Button>
        </div>
        {tab === "project" ? (
          <select
            className="mb-2 h-10 w-full rounded-xl border bg-background px-3"
            onChange={(e) => setProjectId(e.target.value)}
            value={projectId}
          >
            <option value="">Sélectionner un projet</option>
            {state.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        ) : null}
        <div className="flex gap-2">
          <Input
            onChange={(e) => setContent(e.target.value)}
            placeholder='Ex: "Mémorise que je code en Next.js"'
            value={content}
          />
          <Button onClick={() => addMemory("manual")}>
            <Save className="mr-2 size-4" />
            Enregistrer
          </Button>
        </div>
        <div className="mt-2 flex gap-2 text-xs">
          <Button
            onClick={() => addMemory("auto_silent")}
            size="sm"
            variant="ghost"
          >
            🤖 Auto silencieux
          </Button>
          <Button
            onClick={() => addMemory("auto_confirmed")}
            size="sm"
            variant="ghost"
          >
            ✨ Auto confirmé
          </Button>
        </div>
      </section>

      <section className="grid gap-3">
        {memories.map((entry) => (
          <article
            className="liquid-panel flex items-center justify-between rounded-2xl p-3"
            key={entry.id}
          >
            <div>
              <p>{entry.content}</p>
              <p className="text-xs text-muted-foreground">
                <Brain className="mr-1 inline size-3" /> {entry.source} ·{" "}
                {new Date(entry.createdAt).toLocaleString("fr-FR")}
              </p>
            </div>
            <Button
              onClick={async () => {
                setState({
                  ...state,
                  memories: state.memories.filter(
                    (memory) => memory.id !== entry.id
                  ),
                });
                await syncRemote("DELETE", { type: "memory", id: entry.id });
              }}
              size="icon"
              variant="destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
