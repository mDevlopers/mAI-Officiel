"use client";

import {
  Bot,
  Plus,
  Sparkles,
  SquarePen,
  Trash2,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
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
};

type MaiDraft = {
  name: string;
  description: string;
  instructions: string;
  model: string;
  avatarUrl: string;
};

const presets: MaiDraft[] = [
  {
    name: "Coach Produit",
    description: "Transforme les idées en roadmap actionnable.",
    instructions:
      "Tu es un PM senior. Fournis une analyse concise, priorisée et orientée impact business.",
    model: "openai/gpt-5.4-mini",
    avatarUrl: "",
  },
  {
    name: "Relecteur Copywriting",
    description: "Améliore messages marketing et pages de vente.",
    instructions:
      "Tu optimises la clarté, l'émotion et la conversion. Propose 3 variantes avec justification.",
    model: "openai/gpt-5.4",
    avatarUrl: "",
  },
  {
    name: "Analyste Support",
    description: "Rédige des réponses SAV empathiques et structurées.",
    instructions:
      "Tu réponds poliment, diagnostiques les causes racines et proposes des next steps précis.",
    model: "azure/deepseek-v3.2",
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

export default function MaisPage() {
  const {
    data: agents,
    mutate,
    isLoading,
  } = useSWR<MaiAgent[]>("/api/agents", fetcher);
  const [draft, setDraft] = useState<MaiDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const availableModels = useMemo(
    () =>
      chatModels.map((model) => ({
        id: model.id,
        label: `${model.name} · ${model.provider}`,
      })),
    []
  );

  const resetForm = () => {
    setDraft(emptyDraft);
    setEditingId(null);
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
      toast.success("mAI supprimé");
      mutate();
    } catch {
      toast.error("La suppression a échoué.");
    }
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
              Créez vos assistants à la manière des GPTs/Gems, avec modèle et
              instructions dédiés.
            </p>
          </div>
          <Button className="rounded-xl" onClick={resetForm} variant="outline">
            <Plus className="mr-2 size-4" /> Nouveau mAI
          </Button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.1fr,1.9fr]">
        <article className="liquid-glass rounded-2xl border border-border/60 bg-background/50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <SquarePen className="size-4" />{" "}
            {editingId ? "Édition du mAI" : "Créer un mAI"}
          </h2>
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
              className="h-10 w-full rounded-xl border border-border/60 bg-background/60 px-3 text-sm"
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
            <Input
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  avatarUrl: event.target.value,
                }))
              }
              placeholder="URL d'avatar (optionnel)"
              value={draft.avatarUrl}
            />
          </div>

          <div className="mt-4 flex gap-2">
            <Button className="rounded-xl" disabled={isSaving} onClick={submit}>
              {isSaving
                ? "Enregistrement..."
                : editingId
                  ? "Mettre à jour"
                  : "Créer"}
            </Button>
            {editingId ? (
              <Button onClick={resetForm} variant="ghost">
                Annuler
              </Button>
            ) : null}
          </div>

          <div className="mt-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="size-4" /> Presets rapides
            </h3>
            <div className="grid gap-2">
              {presets.map((preset) => (
                <button
                  className="rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-left text-sm hover:border-primary/40"
                  key={preset.name}
                  onClick={() => setDraft(preset)}
                  type="button"
                >
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border/60 bg-card/65 p-4 backdrop-blur-xl">
          <h2 className="mb-3 text-lg font-semibold">Liste des mAIs</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            {agents?.map((agent) => (
              <div
                className="liquid-glass rounded-2xl border border-border/50 bg-background/45 p-3"
                key={agent.id}
              >
                <div className="mb-2 flex items-center gap-2">
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
                    <p className="text-xs text-muted-foreground">
                      {agent.model || "openai/gpt-5.4"}
                    </p>
                  </div>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {agent.description || "Aucune description"}
                </p>

                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingId(agent.id);
                      setDraft({
                        name: agent.name,
                        description: agent.description ?? "",
                        instructions: agent.instructions ?? "",
                        model: agent.model ?? "openai/gpt-5.4",
                        avatarUrl: agent.avatarUrl ?? "",
                      });
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <SquarePen className="mr-1 size-3.5" /> Éditer
                  </Button>
                  <Button
                    className="text-destructive"
                    onClick={() => remove(agent.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="mr-1 size-3.5" /> Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {agents?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun mAI pour le moment.
            </p>
          ) : null}
        </article>
      </section>
    </div>
  );
}
