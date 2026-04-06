"use client";

import {
  FolderKanbanIcon,
  Loader2Icon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Project = {
  createdAt: string;
  description: string | null;
  id: string;
  image: string | null;
  instructions: string | null;
  memory: string | null;
  name: string;
  updatedAt: string;
};

type ProjectTask = {
  done: boolean;
  id: string;
  text: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const createTaskId = () =>
  `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createConversationId = () =>
  `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function extractTasksFromPrompt(prompt: string): ProjectTask[] {
  return prompt
    .split(/[\n,.!?;:]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 18)
    .slice(0, 3)
    .map((line) => ({ done: false, id: createTaskId(), text: line }));
}

export default function ProjectsPage() {
  const {
    data: projects,
    error,
    mutate,
  } = useSWR<Project[]>("/api/projects", fetcher);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "sources" | "conversations" | "tasks"
  >("sources");

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [memory, setMemory] = useState("");
  const [image, setImage] = useState("");
  const [sourceDraft, setSourceDraft] = useState("");

  const [taskInput, setTaskInput] = useState("");
  const [assistantTaskPrompt, setAssistantTaskPrompt] = useState("");
  const [tasksByProject, setTasksByProject] = useState<
    Record<string, ProjectTask[]>
  >({});

  const [conversationInput, setConversationInput] = useState("");
  const [conversationByProject, setConversationByProject] = useState<
    Record<
      string,
      Array<{ id: string; role: "user" | "assistant"; text: string }>
    >
  >({});

  const selectedProject = useMemo(
    () => projects?.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const projectTasks = selectedProjectId
    ? (tasksByProject[selectedProjectId] ?? [])
    : [];
  const projectConversation = selectedProjectId
    ? (conversationByProject[selectedProjectId] ?? [])
    : [];

  useEffect(() => {
    setSourceDraft(selectedProject?.memory ?? "");
  }, [selectedProject?.memory]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setInstructions("");
    setMemory("");
    setImage("");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          instructions,
          memory,
          image,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur de création");
      }

      const createdProject = (await res.json()) as Project;
      toast.success("Projet créé avec succès");
      setIsCreateOpen(false);
      resetForm();
      await mutate();
      setSelectedProjectId(createdProject.id);
    } catch (_err) {
      toast.error("Impossible de créer le projet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSettings = (project: Project) => {
    setSelectedProjectId(project.id);
    setName(project.name);
    setDescription(project.description ?? "");
    setInstructions(project.instructions ?? "");
    setMemory(project.memory ?? "");
    setImage(project.image ?? "");
    setIsSettingsOpen(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          instructions,
          memory,
          image,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur de mise à jour");
      }

      toast.success("Projet modifié");
      setIsSettingsOpen(false);
      await mutate();
    } catch {
      toast.error("Impossible de modifier le projet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erreur de suppression");
      }

      toast.success("Projet supprimé");
      setIsSettingsOpen(false);
      const deletedId = selectedProjectId;
      setSelectedProjectId(null);
      setTasksByProject((prev) => {
        const next = { ...prev };
        delete next[deletedId];
        return next;
      });
      setConversationByProject((prev) => {
        const next = { ...prev };
        delete next[deletedId];
        return next;
      });
      await mutate();
    } catch {
      toast.error("Impossible de supprimer le projet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTask = (text: string) => {
    if (!selectedProjectId || !text.trim()) {
      return;
    }

    setTasksByProject((prev) => ({
      ...prev,
      [selectedProjectId]: [
        ...(prev[selectedProjectId] ?? []),
        { done: false, id: createTaskId(), text: text.trim() },
      ],
    }));
    setTaskInput("");
  };

  const addTasksWithAssistant = () => {
    if (!selectedProjectId || !assistantTaskPrompt.trim()) {
      return;
    }
    const generatedTasks = extractTasksFromPrompt(assistantTaskPrompt);
    if (generatedTasks.length === 0) {
      toast.error("Ajoutez un prompt plus détaillé pour générer des tâches.");
      return;
    }

    setTasksByProject((prev) => ({
      ...prev,
      [selectedProjectId]: [
        ...(prev[selectedProjectId] ?? []),
        ...generatedTasks,
      ],
    }));
    setAssistantTaskPrompt("");
    toast.success("Tâches proposées par IA ajoutées.");
  };

  const toggleTask = (taskId: string) => {
    if (!selectedProjectId) {
      return;
    }

    setTasksByProject((prev) => ({
      ...prev,
      [selectedProjectId]: (prev[selectedProjectId] ?? []).map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      ),
    }));
  };

  const addConversationMessage = () => {
    if (!selectedProjectId || !conversationInput.trim()) {
      return;
    }
    const userMessage = {
      id: createConversationId(),
      role: "user" as const,
      text: conversationInput.trim(),
    };
    const assistantMessage = {
      id: createConversationId(),
      role: "assistant" as const,
      text: `Compris. Je l'intègre au contexte du projet "${selectedProject?.name ?? "Projet"}".`,
    };

    setConversationByProject((prev) => ({
      ...prev,
      [selectedProjectId]: [
        ...(prev[selectedProjectId] ?? []),
        userMessage,
        assistantMessage,
      ],
    }));
    setConversationInput("");
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col overflow-y-auto p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <FolderKanbanIcon className="size-8 text-primary" />
            Projets
          </h1>
          <p className="mt-2 text-muted-foreground">
            Créez, modifiez et pilotez vos projets avec une vue Sources,
            Conversations et Tâches.
          </p>
        </div>

        <Dialog onOpenChange={setIsCreateOpen} open={isCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Créer un projet
            </Button>
          </DialogTrigger>
          <DialogContent className="liquid-panel max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
              <DialogDescription>
                Ajoutez le titre, la description, les instructions IA, les
                sources et un logo.
              </DialogDescription>
            </DialogHeader>
            <form className="mt-4 space-y-5" onSubmit={handleCreateProject}>
              <div className="space-y-2">
                <Label htmlFor="name">Titre du projet</Label>
                <Input
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Refonte site web"
                  required
                  value={name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectif et périmètre du projet"
                  rows={2}
                  value={description}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Logo du projet (URL)</Label>
                <Input
                  id="image"
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://.../logo.png"
                  value={image}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions IA</Label>
                <Textarea
                  id="instructions"
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Règles globales pour les conversations de ce projet"
                  rows={3}
                  value={instructions}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memory">Sources / connaissances</Label>
                <Textarea
                  id="memory"
                  onChange={(e) => setMemory(e.target.value)}
                  placeholder="Documentation, notes, contexte métier"
                  rows={4}
                  value={memory}
                />
              </div>

              <DialogFooter>
                <Button
                  onClick={() => setIsCreateOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting && (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  )}
                  Créer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          Erreur lors du chargement des projets.
        </div>
      ) : projects ? (
        <div className="grid flex-1 gap-6 lg:grid-cols-[340px,1fr]">
          <div className="liquid-panel rounded-2xl border border-border/40 p-4">
            {projects.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-center">
                <FolderKanbanIcon className="mb-4 size-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">Aucun projet</h3>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">
                  Vous n'avez pas encore créé de projet.
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  Créer mon premier projet
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => {
                  const isActive = selectedProjectId === project.id;
                  return (
                    <button
                      className={`liquid-glass flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                        isActive
                          ? "border-primary/50 bg-primary/10"
                          : "border-border/35 hover:border-border/70"
                      }`}
                      key={project.id}
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setActiveSection("sources");
                      }}
                      type="button"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10">
                        {project.image ? (
                          <Image
                            alt={`Logo ${project.name}`}
                            className="h-full w-full object-cover"
                            height={36}
                            src={project.image}
                            unoptimized
                            width={36}
                          />
                        ) : (
                          <FolderKanbanIcon className="size-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{project.name}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {project.description || "Aucune description."}
                        </p>
                      </div>
                      <Button
                        className="size-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          openSettings(project);
                        }}
                        size="icon"
                        title="Paramètres du projet"
                        type="button"
                        variant="ghost"
                      >
                        <SettingsIcon className="size-4" />
                      </Button>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="liquid-panel min-h-[520px] rounded-2xl border border-border/40 p-5">
            {selectedProject ? (
              <>
                <div className="mb-5 flex flex-wrap items-start gap-3 border-b border-border/40 pb-4">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
                    {selectedProject.image ? (
                      <Image
                        alt={`Logo ${selectedProject.name}`}
                        className="h-full w-full object-cover"
                        height={48}
                        src={selectedProject.image}
                        unoptimized
                        width={48}
                      />
                    ) : (
                      <FolderKanbanIcon className="size-6 text-primary" />
                    )}
                  </div>
                  <div className="min-w-[220px] flex-1">
                    <h2 className="text-2xl font-semibold">
                      {selectedProject.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedProject.description || "Aucune description."}
                    </p>
                  </div>
                  <Button
                    onClick={() => openSettings(selectedProject)}
                    variant="outline"
                  >
                    <SettingsIcon className="mr-2 size-4" />
                    Paramètres
                  </Button>
                </div>

                <div className="mb-4 flex gap-2">
                  {[
                    { id: "sources", label: "Sources" },
                    { id: "conversations", label: "Conversations" },
                    { id: "tasks", label: "Tâches" },
                  ].map((tab) => (
                    <Button
                      className="rounded-full"
                      key={tab.id}
                      onClick={() =>
                        setActiveSection(
                          tab.id as "sources" | "conversations" | "tasks"
                        )
                      }
                      size="sm"
                      variant={activeSection === tab.id ? "default" : "outline"}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>

                {activeSection === "sources" && (
                  <div className="space-y-3">
                    <Label>Sources du projet</Label>
                    <Textarea
                      className="min-h-[280px]"
                      onChange={(event) => setSourceDraft(event.target.value)}
                      placeholder="Ajoutez vos sources, notes et documents ici"
                      value={sourceDraft}
                    />
                    <Button
                      onClick={async () => {
                        if (!selectedProjectId) {
                          return;
                        }
                        await fetch(`/api/projects/${selectedProjectId}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ memory: sourceDraft }),
                        });
                        toast.success("Sources mises à jour.");
                        mutate();
                      }}
                      type="button"
                    >
                      Enregistrer les sources
                    </Button>
                  </div>
                )}

                {activeSection === "conversations" && (
                  <div className="flex h-[420px] flex-col gap-3">
                    <div className="liquid-glass flex-1 space-y-2 overflow-y-auto rounded-2xl border border-border/40 p-3">
                      {projectConversation.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Aucune conversation pour ce projet.
                        </p>
                      ) : (
                        projectConversation.map((message) => (
                          <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                              message.role === "user"
                                ? "ml-auto bg-primary/20"
                                : "bg-muted"
                            }`}
                            key={message.id}
                          >
                            {message.text}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="liquid-glass rounded-2xl border border-border/40 p-3">
                      <Textarea
                        onChange={(event) =>
                          setConversationInput(event.target.value)
                        }
                        placeholder="Posez votre question sur ce projet..."
                        rows={3}
                        value={conversationInput}
                      />
                      <div className="mt-2 flex justify-end">
                        <Button onClick={addConversationMessage} type="button">
                          Envoyer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "tasks" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        onChange={(event) => setTaskInput(event.target.value)}
                        placeholder="Ajouter un rappel ou une tâche"
                        value={taskInput}
                      />
                      <Button onClick={() => addTask(taskInput)} type="button">
                        Ajouter
                      </Button>
                    </div>

                    <div className="liquid-glass rounded-2xl border border-border/40 p-3">
                      <Label>Ajouter via IA</Label>
                      <Textarea
                        className="mt-2"
                        onChange={(event) =>
                          setAssistantTaskPrompt(event.target.value)
                        }
                        placeholder="Ex: prépare le lancement produit la semaine prochaine avec les étapes clés"
                        rows={3}
                        value={assistantTaskPrompt}
                      />
                      <Button
                        className="mt-2"
                        onClick={addTasksWithAssistant}
                        type="button"
                        variant="outline"
                      >
                        <SparklesIcon className="mr-2 size-4" />
                        Générer des tâches
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {projectTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Aucune tâche pour ce projet.
                        </p>
                      ) : (
                        projectTasks.map((task) => (
                          <button
                            className="liquid-glass flex w-full items-center gap-3 rounded-xl border border-border/40 px-3 py-2 text-left"
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            type="button"
                          >
                            <span
                              className={`h-3.5 w-3.5 rounded-full border ${
                                task.done
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/50"
                              }`}
                            />
                            <span
                              className={
                                task.done
                                  ? "text-muted-foreground line-through"
                                  : ""
                              }
                            >
                              {task.text}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <FolderKanbanIcon className="mb-3 size-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Sélectionnez un projet pour voir ses Sources, Conversations et
                  Tâches.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <Dialog onOpenChange={setIsSettingsOpen} open={isSettingsOpen}>
        <DialogContent className="liquid-panel max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
            <DialogDescription>
              Modifiez le titre, la description, les instructions, les sources
              ou le logo. Vous pouvez aussi supprimer le projet.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateProject}>
            <div className="space-y-2">
              <Label htmlFor="settings-name">Titre</Label>
              <Input
                id="settings-name"
                onChange={(e) => setName(e.target.value)}
                required
                value={name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-description">Description</Label>
              <Textarea
                id="settings-description"
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                value={description}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-image">Logo (URL)</Label>
              <Input
                id="settings-image"
                onChange={(e) => setImage(e.target.value)}
                value={image}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-instructions">Instructions IA</Label>
              <Textarea
                id="settings-instructions"
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                value={instructions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-memory">Sources</Label>
              <Textarea
                id="settings-memory"
                onChange={(e) => setMemory(e.target.value)}
                rows={4}
                value={memory}
              />
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <Button
                className="text-destructive hover:text-destructive"
                disabled={isSubmitting}
                onClick={handleDeleteProject}
                type="button"
                variant="ghost"
              >
                <TrashIcon className="mr-2 size-4" />
                Supprimer le projet
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting && (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                )}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
