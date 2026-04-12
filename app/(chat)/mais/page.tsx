"use client";

import {
  Bot,
  Languages,
  Pin,
  PinOff,
  Plus,
  Sparkles,
  SquarePen,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatModels } from "@/lib/ai/models";

type MaiAgent = {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  instructions?: string | null;
  model?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  usageCount: number;
  shareToken?: string | null;
};

type MaiDraft = {
  name: string;
  description: string;
  instructions: string;
  model: string;
  avatarUrl: string;
};

const MAI_PINNED_STORAGE_KEY = "mai.pinned.mai.ids";

const presets: MaiDraft[] = [
  {
    name: "🌍 Traducteur Universel",
    description: "Traduction fluide et naturelle dans toutes les langues.",
    instructions:
      "Tu es un traducteur expert. Rends le texte aussi naturel que possible, conserve le ton original, et précise les nuances culturelles. Ne traduis pas les noms propres.",
    model: "openai/gpt-5.4-mini",
    avatarUrl: "",
  },
  {
    name: "💪 Coach Sportif",
    description: "Programmes personnalisés et motivation quotidienne.",
    instructions:
      "Tu es un coach sportif certifié. Propose des exercices adaptés, explique la bonne posture, et reste encourageant mais réaliste. Demande toujours le niveau et les objectifs de l'utilisateur.",
    model: "openai/gpt-5.4-mini",
    avatarUrl: "",
  },
  {
    name: "📐 Professeur Mathématiques",
    description: "Explique les concepts pas à pas, tous niveaux.",
    instructions:
      "Tu es professeur de mathématiques. Découpe les problèmes en étapes simples, utilise des analogies, et vérifie la compréhension à chaque étape. Ne donne jamais la réponse directement.",
    model: "openai/gpt-5.4",
    avatarUrl: "",
  },
  {
    name: "📝 Résumeur Intelligent",
    description: "Synthétise documents, articles et conversations.",
    instructions:
      "Tu es un expert en synthèse. Extrais les points clés, organise-les logiquement, et conserve les chiffres et dates importants. Propose systématiquement une version courte et une version détaillée.",
    model: "openai/gpt-5.4",
    avatarUrl: "",
  },
  {
    name: "🎨 Coach Créatif",
    description: "Brainstorming et idées originales pour tous projets.",
    instructions:
      "Tu es un directeur créatif. Propose des idées audacieuses, hors des sentiers battus, et explique comment les mettre en œuvre. Génére toujours minimum 5 propositions différentes.",
    model: "openai/gpt-5.4",
    avatarUrl: "",
  },
  {
    name: "👨‍💻 Développeur Senior",
    description: "Aide au code, débogage et bonnes pratiques.",
    instructions:
      "Tu es un ingénieur logiciel senior. Explique les concepts simplement, explique pourquoi le code fonctionne, et propose systématiquement des améliorations. Priorise la lisibilité et la maintenabilité.",
    model: "openai/gpt-5.4",
    avatarUrl: "",
  },
  {
    name: "🧘 Méditation & Calme",
    description: "Exercices de respiration et gestion du stress.",
    instructions:
      "Tu es un thérapeute spécialisé dans la gestion du stress. Parle doucement, propose des exercices de respiration guidée, et aide à prendre du recul. Ne donne jamais de conseils médicaux.",
    model: "openai/gpt-5.4-mini",
    avatarUrl: "",
  },
  {
    name: "✍️ Rédacteur Professionnel",
    description: "Mails, rapports, lettres : textes clairs et impactants.",
    instructions:
      "Tu es un rédacteur professionnel. Adapte le ton au contexte, corrige les fautes, améliore la clarté et propose toujours 2 versions : formelle et naturelle.",
    model: "openai/gpt-5.4-mini",
    avatarUrl: "",
  },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const emptyDraft: MaiDraft = {
  name: "",
  description: "",
  instructions: "",
  model: "openai/gpt-5.4",
  avatarUrl: "",
};

function getPinnedIdsFromStorage(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(MAI_PINNED_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export default function MaisPage() {
  const router = useRouter();
  const {
    data: agents,
    mutate,
    isLoading,
  } = useSWR<MaiAgent[]>("/api/agents", fetcher);

  const [draft, setDraft] = useState<MaiDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>(getPinnedIdsFromStorage);

  const availableModels = useMemo(
    () =>
      chatModels.map((model) => ({
        id: model.id,
        label: `${model.name} · ${model.provider}`,
      })),
    []
  );

  const sortedAgents = useMemo(() => {
    const source = agents ?? [];
    return [...source].sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id) ? 1 : 0;
      const bPinned = pinnedIds.includes(b.id) ? 1 : 0;
      return bPinned - aPinned || a.name.localeCompare(b.name, "fr");
    });
  }, [agents, pinnedIds]);

  const resetForm = () => {
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (agent: MaiAgent) => {
    setEditingId(agent.id);
    setDraft({
      name: agent.name,
      description: agent.description ?? "",
      instructions: agent.instructions ?? "",
      model: agent.model ?? "openai/gpt-5.4",
      avatarUrl: agent.avatarUrl ?? "",
    });
    setIsDialogOpen(true);
  };

  const submit = async () => {
    if (!draft.name.trim()) {
      toast.error("Le nom du mAI est obligatoire.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        editingId ? `/api/agents/${editingId}` : "/api/agents",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        }
      );

      if (!response.ok) {
        throw new Error("save_failed");
      }

      toast.success(editingId ? "mAI mis à jour" : "mAI créé");
      setIsDialogOpen(false);
      resetForm();
      mutate();
    } catch {
      toast.error("Impossible d'enregistrer ce mAI.");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const response = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("delete_failed");
      }
      const nextPinned = pinnedIds.filter((pinnedId) => pinnedId !== id);
      setPinnedIds(nextPinned);
      localStorage.setItem(MAI_PINNED_STORAGE_KEY, JSON.stringify(nextPinned));
      toast.success("mAI supprimé");
      mutate();
    } catch {
      toast.error("La suppression a échoué.");
    }
  };

  const togglePin = (id: string) => {
    const nextPinned = pinnedIds.includes(id)
      ? pinnedIds.filter((pinnedId) => pinnedId !== id)
      : [id, ...pinnedIds];
    setPinnedIds(nextPinned);
    localStorage.setItem(MAI_PINNED_STORAGE_KEY, JSON.stringify(nextPinned));
  };

  const connectMaiToChat = (agent: MaiAgent) => {
    const mention = `@${agent.name.replace(/\s+/g, "_")} `;
    localStorage.setItem("input", mention);
    router.push("/");
    toast.success(
      `Connexion au mAI « ${agent.name} » prête dans la barre de chat.`
    );
  };

  const uploadLogoToBlob = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("upload_failed");
    }

    const payload = (await response.json()) as { url?: string };
    if (!payload.url) {
      throw new Error("upload_missing_url");
    }

    setDraft((current) => ({ ...current, avatarUrl: payload.url ?? "" }));
    toast.success("Logo importé depuis Vercel Blob.");
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-5 overflow-y-auto p-6 md:p-10">
      <header className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Bot className="size-7 text-primary" /> mAIs personnalisés
            </h1>
            <p className="text-sm text-muted-foreground">
              Créez vos assistants à la manière des GPTs/Gems, connectez-les au
              chat via @NomDuMAI et épinglez vos favoris.
            </p>
          </div>
          <Button className="rounded-xl" onClick={openCreateDialog}>
            <Plus className="mr-2 size-4" /> Nouveau mAI
          </Button>
        </div>
      </header>

      <section className="liquid-glass rounded-2xl border border-border/60 bg-background/50 p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Sparkles className="size-4" /> Presets rapides
        </h2>
        <div className="grid gap-2 md:grid-cols-3">
          {presets.map((preset) => (
            <button
              className="rounded-xl border border-border/50 bg-background/60 px-3 py-2 text-left text-sm hover:border-primary/40"
              key={preset.name}
              onClick={() => {
                setDraft(preset);
                setEditingId(null);
                setIsDialogOpen(true);
              }}
              type="button"
            >
              <p className="font-medium">{preset.name}</p>
              <p className="text-xs text-muted-foreground">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/65 p-4 backdrop-blur-xl">
        <h2 className="mb-3 text-lg font-semibold">Liste des mAIs</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          {sortedAgents.map((agent) => {
            const isPinned = pinnedIds.includes(agent.id);

            return (
              <div
                className="liquid-glass rounded-2xl border border-border/50 bg-background/45 p-3"
                key={agent.id}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <button
                    className="flex items-center gap-2 rounded-md p-1 text-left transition hover:bg-muted/40"
                    onClick={() => connectMaiToChat(agent)}
                    type="button"
                  >
                    {agent.avatarUrl ? (
                      <Image
                        alt={agent.name}
                        className="size-9 rounded-full border border-border/60 object-cover"
                        height={36}
                        src={agent.avatarUrl}
                        width={36}
                      />
                    ) : (
                      <span className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-muted/60">
                        <UserRound className="size-4" />
                      </span>
                    )}
                     <div>
                       <p className="text-sm font-semibold">{agent.name}</p>
                       <p className="text-xs text-muted-foreground flex items-center gap-2">
                         {agent.model || "openai/gpt-5.4"}
                         <span className="inline-flex items-center gap-1">
                           <span className="size-1 rounded-full bg-primary/40"></span>
                           {agent.usageCount} utilisations
                         </span>
                       </p>
                     </div>
                  </button>
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      togglePin(agent.id);
                    }}
                    size="icon"
                    title={isPinned ? "Désépingler" : "Épingler"}
                    variant="ghost"
                  >
                    {isPinned ? (
                      <PinOff className="size-4 text-amber-500" />
                    ) : (
                      <Pin className="size-4" />
                    )}
                  </Button>
                </div>

                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {agent.description || "Aucune description"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      connectMaiToChat(agent);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Languages className="mr-1 size-3.5" /> Connecter au chat
                  </Button>
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditDialog(agent);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <SquarePen className="mr-1 size-3.5" /> Éditer
                  </Button>
                  <Button
                    className="text-destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      remove(agent.id);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="mr-1 size-3.5" /> Supprimer
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        {sortedAgents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun mAI pour le moment.
          </p>
        ) : null}
      </section>

      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="border border-slate-200 bg-white text-slate-900 shadow-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier le mAI" : "Créer un nouveau mAI"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Nom du mAI"
              value={draft.name}
            />
            <Input
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Description"
              value={draft.description}
            />
            <Textarea
              className="min-h-28"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  instructions: event.target.value,
                }))
              }
              placeholder="Instructions système"
              value={draft.instructions}
            />
            <select
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  model: event.target.value,
                }))
              }
              value={draft.model}
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <p className="mb-2 text-xs text-slate-600">Logo du mAI</p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  className="bg-white"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      avatarUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  value={draft.avatarUrl}
                />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-100">
                  <UploadCloud className="size-3.5" /> Importer depuis Blob
                  <input
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        return;
                      }

                      try {
                        await uploadLogoToBlob(file);
                      } catch {
                        toast.error("Échec de l'upload du logo.");
                      } finally {
                        event.target.value = "";
                      }
                    }}
                    type="file"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
              variant="outline"
            >
              Annuler
            </Button>
            <Button disabled={isSaving} onClick={submit}>
              {isSaving
                ? "Enregistrement..."
                : editingId
                  ? "Mettre à jour"
                  : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
