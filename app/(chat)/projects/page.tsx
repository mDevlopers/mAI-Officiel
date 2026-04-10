"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/hooks/use-workspace";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const { state, setState, syncRemote, hydrated } = useWorkspace(
    session?.user?.type
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);

  const tasksByProject = useMemo(() => {
    return state.tasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.projectId] = (acc[task.projectId] ?? 0) + 1;
      return acc;
    }, {});
  }, [state.tasks]);

  const addProject = async () => {
    if (!name.trim()) {
      return;
    }
    const project = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      files: [],
      createdAt: new Date().toISOString(),
    };

    setState({ ...state, projects: [project, ...state.projects] });
    await syncRemote("POST", { type: "project", payload: project });

    setName("");
    setDescription("");
    setInstructions("");
  };

  const addSuggestedTask = async (projectId: string) => {
    setPendingProjectId(projectId);
  };

  const confirmSuggestedTask = async (projectId: string) => {
    const task = {
      id: crypto.randomUUID(),
      projectId,
      title: "Tâche suggérée par l'IA",
      description: "Valider les sources et prioriser les prochaines actions.",
      dueDate: null,
      status: "todo" as const,
      priority: "normal" as const,
      createdByAi: true,
    };

    setState({ ...state, tasks: [task, ...state.tasks] });
    await syncRemote("POST", { type: "task", payload: task });
    setPendingProjectId(null);
  };

  if (!hydrated) {
    return null;
  }

  return (
    <div className="liquid-glass flex h-full flex-col gap-4 overflow-y-auto p-6 md:p-10">
      <header className="liquid-panel rounded-2xl p-4">
        <h1 className="text-2xl font-semibold">Projets</h1>
        <p className="text-sm text-muted-foreground">
          Espaces isolés avec sources, instructions personnalisées et tâches
          partagées.
        </p>
        {session?.user?.type !== "regular" ? (
          <p className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2 text-xs">
            Mode invité : sauvegarde locale uniquement. Créez un compte pour
            synchroniser.
          </p>
        ) : null}
      </header>

      <section className="liquid-panel grid gap-3 rounded-2xl p-4 md:grid-cols-3">
        <Input
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du projet"
          value={name}
        />
        <Input
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          value={description}
        />
        <Button className="rounded-xl" onClick={addProject}>
          <Plus className="mr-2 size-4" />
          Créer
        </Button>
        <Textarea
          className="md:col-span-3"
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Instructions personnalisées injectées au contexte système..."
          value={instructions}
        />
      </section>

      <section className="grid gap-3">
        {state.projects.map((project) => (
          <article className="liquid-panel rounded-2xl p-4" key={project.id}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-medium">{project.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {project.description}
                </p>
                <p className="mt-1 text-xs">
                  {tasksByProject[project.id] ?? 0} tâche(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => addSuggestedTask(project.id)}
                  size="sm"
                  variant="outline"
                >
                  <Sparkles className="mr-1 size-3" /> Suggérer tâche
                </Button>
                {pendingProjectId === project.id ? (
                  <Button
                    onClick={() => confirmSuggestedTask(project.id)}
                    size="sm"
                  >
                    Confirmer
                  </Button>
                ) : null}
                <Button
                  onClick={async () => {
                    setState({
                      ...state,
                      projects: state.projects.filter(
                        (p) => p.id !== project.id
                      ),
                    });
                    await syncRemote("DELETE", {
                      type: "project",
                      id: project.id,
                    });
                  }}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {project.instructions}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
