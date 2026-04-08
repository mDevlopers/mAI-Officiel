"use client";

import {
  FolderKanbanIcon,
  Loader2Icon,
  SettingsIcon,
  SparklesIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chatModels, DEFAULT_CHAT_MODEL } from "@/lib/ai/models";

type Project = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  instructions: string | null;
  memory: string | null;
};
type Msg = { id: string; role: "user" | "assistant"; text: string };

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    data: project,
    error,
    mutate,
  } = useSWR<Project>(`/api/projects/${params.id}`, fetcher);
  const { data: modelsData } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/models`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const [activeSection, setActiveSection] = useState<
    "sources" | "conversations" | "tasks"
  >("sources");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationInput, setConversationInput] = useState("");
  const [assistantTaskPrompt, setAssistantTaskPrompt] = useState("");
  const [tasks, setTasks] = useState<
    Array<{ id: string; text: string; done: boolean }>
  >([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [memory, setMemory] = useState("");
  const [image, setImage] = useState("");
  const [selectedModel, setSelectedModel] = useState(DEFAULT_CHAT_MODEL);
  const logoRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!project) {
      return;
    }
    setMemory(project.memory ?? "");
  }, [project]);
  const allModels = useMemo(() => {
    const customAgents = modelsData?.customAgents ?? [];
    return [
      ...chatModels.map((model) => ({ id: model.id, name: model.name })),
      ...customAgents.map((agent: any) => ({
        id: `agent-${agent.id}`,
        name: `mAI · ${agent.name}`,
      })),
    ];
  }, [modelsData]);

  const openSettings = () => {
    if (!project) {
      return;
    }
    setName(project.name);
    setDescription(project.description ?? "");
    setInstructions(project.instructions ?? "");
    setMemory(project.memory ?? "");
    setImage(project.image ?? "");
    setIsSettingsOpen(true);
  };

  const sendConversation = async () => {
    if (!conversationInput.trim()) {
      return;
    }
    const userText = conversationInput.trim();
    setConversationInput("");
    setMessages((prev) => [
      ...prev,
      { id: createId(), role: "user", text: userText },
    ]);

    try {
      const res = await fetch(`/api/projects/${params.id}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, modelId: selectedModel }),
      });
      if (!res.ok) {
        throw new Error("Erreur IA");
      }
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "assistant", text: data.text },
      ]);
    } catch {
      toast.error("Réponse IA indisponible");
    }
  };

  if (error) {
    return <div className="p-8 text-destructive">Projet introuvable.</div>;
  }
  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2Icon className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="liquid-glass flex h-full w-full flex-col overflow-y-auto p-6 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            className="text-sm text-muted-foreground hover:underline"
            href="/projects"
          >
            ← Tous les projets
          </Link>
        </div>
        <Button onClick={openSettings} variant="outline">
          <SettingsIcon className="mr-2 size-4" />
          Paramètres
        </Button>
      </div>

      <div className="mb-5 flex items-start gap-3 border-b border-border/40 pb-4">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
          {project.image ? (
            <Image
              alt={`Logo ${project.name}`}
              className="h-full w-full object-cover"
              height={48}
              src={project.image}
              unoptimized
              width={48}
            />
          ) : (
            <FolderKanbanIcon className="size-6 text-primary" />
          )}
        </div>
        <div className="min-w-[220px] flex-1">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.description || "Aucune description."}
          </p>
        </div>
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
            onClick={() => setActiveSection(tab.id as any)}
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
            onChange={(event) => setMemory(event.target.value)}
            placeholder="Ajoutez vos sources, notes et documents ici"
            value={memory}
          />
          <input
            accept=".txt,.md,.csv,.json,.pdf,.doc,.docx"
            className="hidden"
            multiple
            onChange={async (event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length === 0) {
                return;
              }
              const contents = await Promise.all(
                files.map(
                  async (file) =>
                    `\n\n--- ${file.name} ---\n${await file.text()}`
                )
              );
              setMemory((prev) => `${prev}${contents.join("\n")}`.trim());
              toast.success("Documents importés");
            }}
            ref={sourceRef}
            type="file"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => sourceRef.current?.click()}
              type="button"
              variant="outline"
            >
              <UploadIcon className="mr-2 size-4" />
              Importer des documents
            </Button>
            <Button
              onClick={async () => {
                await fetch(`/api/projects/${params.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ memory }),
                });
                toast.success("Sources mises à jour.");
                mutate();
              }}
              type="button"
            >
              Enregistrer les sources
            </Button>
          </div>
        </div>
      )}

      {activeSection === "conversations" && (
        <div className="flex h-[520px] flex-col gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="project-model">Modèle IA</Label>
            <select
              className="h-9 rounded-lg border border-border/60 bg-background px-2 text-sm"
              id="project-model"
              onChange={(e) => setSelectedModel(e.target.value)}
              value={selectedModel}
            >
              {allModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="liquid-glass flex-1 space-y-2 overflow-y-auto rounded-2xl border border-border/40 p-3">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune conversation pour ce projet.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.role === "user" ? "ml-auto bg-primary/20" : "bg-muted"}`}
                  key={message.id}
                >
                  {message.text}
                </div>
              ))
            )}
          </div>
          <div className="liquid-glass rounded-2xl border border-border/40 p-3">
            <Textarea
              onChange={(event) => setConversationInput(event.target.value)}
              placeholder="Posez votre question sur ce projet..."
              rows={3}
              value={conversationInput}
            />
            <div className="mt-2 flex justify-end">
              <Button onClick={sendConversation} type="button">
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeSection === "tasks" && (
        <div className="space-y-4">
          <div className="liquid-glass rounded-2xl border border-border/40 p-3">
            <Label>Ajouter via IA</Label>
            <Textarea
              className="mt-2"
              onChange={(event) => setAssistantTaskPrompt(event.target.value)}
              placeholder="Ex: prépare le lancement produit la semaine prochaine avec les étapes clés"
              rows={3}
              value={assistantTaskPrompt}
            />
            <Button
              className="mt-2"
              onClick={() => {
                const generated = assistantTaskPrompt
                  .split(/[\n,.!?;:]/)
                  .map((line) => line.trim())
                  .filter((line) => line.length > 18)
                  .slice(0, 4)
                  .map((line) => ({ id: createId(), text: line, done: false }));
                setTasks((prev) => [...prev, ...generated]);
                setAssistantTaskPrompt("");
              }}
              type="button"
              variant="outline"
            >
              <SparklesIcon className="mr-2 size-4" />
              Générer des tâches
            </Button>
          </div>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune tâche pour ce projet.
              </p>
            ) : (
              tasks.map((task) => (
                <button
                  className="liquid-glass flex w-full items-center gap-3 rounded-xl border border-border/40 px-3 py-2 text-left"
                  key={task.id}
                  onClick={() =>
                    setTasks((prev) =>
                      prev.map((t) =>
                        t.id === task.id ? { ...t, done: !t.done } : t
                      )
                    )
                  }
                  type="button"
                >
                  <span
                    className={`h-3.5 w-3.5 rounded-full border ${task.done ? "border-primary bg-primary" : "border-muted-foreground/50"}`}
                  />
                  <span
                    className={
                      task.done ? "line-through text-muted-foreground" : ""
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

      <Dialog onOpenChange={setIsSettingsOpen} open={isSettingsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white text-black dark:bg-white dark:text-black">
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
            <DialogDescription>
              Modifiez le titre, la description, les instructions, les sources
              ou le logo.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                const res = await fetch(`/api/projects/${params.id}`, {
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
                mutate();
              } catch {
                toast.error("Impossible de modifier le projet");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
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
            <input
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }
                setImage(await readFileAsDataUrl(file));
                toast.success("Logo importé");
              }}
              ref={logoRef}
              type="file"
            />
            <Button
              onClick={() => logoRef.current?.click()}
              type="button"
              variant="outline"
            >
              <UploadIcon className="mr-2 size-4" />
              Importer un logo
            </Button>
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
                onClick={async () => {
                  const res = await fetch(`/api/projects/${params.id}`, {
                    method: "DELETE",
                  });
                  if (res.ok) {
                    window.location.href = "/projects";
                  }
                }}
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
