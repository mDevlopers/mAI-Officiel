"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProjectFormProps = {
  mode: "create" | "edit";
  initialValues?: {
    id: string;
    name: string;
    instructions: string | null;
    color: string;
    icon: string;
    archived: boolean;
    pinnedNote: string | null;
  };
};

const DEFAULT_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#78716c", "#171717"
];

const DEFAULT_ICONS = ["📁", "🚀", "💡", "🎯", "⚡", "📝", "🔧", "🎨", "📊", "💻", "🏗️", "📦"];

export function ProjectForm({ mode, initialValues }: ProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [instructions, setInstructions] = useState(
    initialValues?.instructions ?? ""
  );
  const [color, setColor] = useState(initialValues?.color ?? "#3b82f6");
  const [icon, setIcon] = useState(initialValues?.icon ?? "📁");
  const [archived, setArchived] = useState(initialValues?.archived ?? false);
  const [pinnedNote, setPinnedNote] = useState(initialValues?.pinnedNote ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Le nom du projet est obligatoire.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const endpoint =
      mode === "create"
        ? "/api/projects"
        : `/api/projects/${initialValues?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        instructions,
        color,
        icon,
        archived,
        pinnedNote
      }),
    });

    if (!response.ok) {
      setIsSaving(false);
      setError("Impossible d'enregistrer le projet.");
      return;
    }

    router.push("/projects");
    router.refresh();
  };

  return (
    <form
      className="liquid-panel mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-white/30 bg-white/85 p-6 text-black backdrop-blur-2xl"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="project-name">
          Nom du projet
        </label>
        <input
          className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-cyan-500"
          id="project-name"
          maxLength={120}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex: Refonte produit Q3"
          required
          value={name}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Couleur du projet
          </label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`h-8 w-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-cyan-500 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Icône du projet
          </label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                className={`h-8 w-8 rounded-xl border border-black/15 bg-white text-xl transition-all ${icon === i ? 'ring-2 ring-offset-2 ring-cyan-500 bg-cyan-100' : 'hover:bg-black/5'}`}
                onClick={() => setIcon(i)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="project-instructions">
          Instructions globales
        </label>
        <textarea
          className="min-h-40 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-cyan-500"
          id="project-instructions"
          maxLength={5000}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder="Contexte, ton et contraintes du projet..."
          value={instructions}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="project-pinned-note">
          Note épinglée
        </label>
        <textarea
          className="min-h-24 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-cyan-500"
          id="project-pinned-note"
          maxLength={1000}
          onChange={(event) => setPinnedNote(event.target.value)}
          placeholder="Note rapide visible en haut de l'espace projet..."
          value={pinnedNote}
        />
      </div>

      {mode === "edit" && (
        <div className="flex items-center gap-3 rounded-xl border border-black/15 bg-white/70 p-3">
          <input
            type="checkbox"
            id="project-archived"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <label className="text-sm font-medium" htmlFor="project-archived">
            Marquer ce projet comme archivé
          </label>
        </div>
      )}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        className="rounded-xl border border-cyan-400/40 bg-cyan-200/80 px-4 py-2 text-sm font-medium text-black transition hover:bg-cyan-300/80 disabled:opacity-50"
        disabled={isSaving}
        type="submit"
      >
        {isSaving
          ? "Enregistrement..."
          : mode === "create"
            ? "Créer le projet"
            : "Mettre à jour"}
      </button>
    </form>
  );
}
