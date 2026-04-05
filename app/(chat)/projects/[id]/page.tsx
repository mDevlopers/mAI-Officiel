"use client";

import {
  ArrowLeftIcon,
  BotIcon,
  FileTextIcon,
  Loader2Icon,
  SaveIcon,
  TrashIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erreur serveur");
    return res.json();
  });

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const {
    data: project,
    error,
    isLoading,
    mutate,
  } = useSWR(`/api/projects/${id}`, fetcher);
  const { data: agents } = useSWR("/api/agents", fetcher);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [memory, setMemory] = useState("");
  const [agentIds, setAgentIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setInstructions(project.instructions || "");
      setMemory(project.memory || "");
      setAgentIds(project.agentIds || []);
    }
  }, [project]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Erreur: {error.message}</p>
      </div>
    );
  }

  if (isLoading || !project) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          instructions,
          memory,
          agentIds,
        }),
      });

      if (!res.ok) throw new Error("Erreur de sauvegarde");

      toast.success("Projet mis à jour avec succès");
      mutate();
    } catch (_err) {
      toast.error("Impossible de mettre à jour le projet");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce projet ? Les conversations et fichiers associés seront conservés dans votre espace de travail général."
      )
    )
      return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur de suppression");

      toast.success("Projet supprimé avec succès");
      router.push("/projects");
    } catch (_err) {
      toast.error("Impossible de supprimer le projet");
      setIsDeleting(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    setAgentIds((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col overflow-y-auto p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="flex items-center gap-4">
          <Button
            className="shrink-0"
            onClick={() => router.push("/projects")}
            size="icon"
            variant="ghost"
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Paramètres du Projet
            </h1>
            <p className="text-muted-foreground">
              Gérez les informations, les connaissances et les mAIs associés à
              ce projet.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">
                Informations générales
              </h2>
              <form className="space-y-4" onSubmit={handleSave}>
                <div className="space-y-2">
                  <Label htmlFor="name">Titre</Label>
                  <Input
                    id="name"
                    onChange={(e) => setName(e.target.value)}
                    required
                    value={name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    value={description}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">
                    Instructions globales du projet
                  </Label>
                  <Textarea
                    id="instructions"
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Instructions qui seront partagées avec tous les mAIs et tâches de ce projet..."
                    rows={4}
                    value={instructions}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button disabled={isSaving} type="submit">
                    {isSaving && (
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                    )}
                    <SaveIcon className="mr-2 size-4" />
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                <FileTextIcon className="size-5" />
                Sources et Connaissances
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="memory">Base de connaissances (Texte)</Label>
                  <Textarea
                    id="memory"
                    onChange={(e) => setMemory(e.target.value)}
                    placeholder="Ajoutez ici des informations de contexte qui seront utilisées par les mAIs..."
                    rows={6}
                    value={memory}
                  />
                  <p className="text-xs text-muted-foreground">
                    Vous pourrez également lier des documents depuis la
                    Bibliothèque. N'oubliez pas d'enregistrer après
                    modification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <BotIcon className="size-5" />
                mAIs Intégrés
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Sélectionnez les mAIs qui auront accès au contexte de ce projet.
              </p>

              {agents ? (
                agents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun mAI disponible.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {agents.map((agent: any) => (
                      <label
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                          agentIds.includes(agent.id)
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted"
                        }`}
                        key={agent.id}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                            {agent.image ? (
                              <img
                                alt=""
                                className="h-full w-full rounded-md object-cover"
                                src={agent.image}
                              />
                            ) : (
                              <BotIcon className="size-4" />
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {agent.name}
                          </span>
                        </div>
                        <input
                          checked={agentIds.includes(agent.id)}
                          className="size-4"
                          onChange={() => toggleAgent(agent.id)}
                          type="checkbox"
                        />
                      </label>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex justify-center p-4">
                  <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-destructive">
                Zone de danger
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                La suppression de ce projet n'effacera pas les conversations et
                fichiers qui y sont liés.
              </p>
              <Button
                className="w-full"
                disabled={isDeleting}
                onClick={handleDelete}
                variant="destructive"
              >
                {isDeleting ? (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                ) : (
                  <TrashIcon className="mr-2 size-4" />
                )}
                Supprimer le projet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
