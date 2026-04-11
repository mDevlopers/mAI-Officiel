"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type ProjectCardProps = {
  project: {
    id: string;
    name: string;
    instructions: string | null;
    createdAt: string;
  };
};

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  const onDelete = async () => {
    const isConfirmed = window.confirm(
      "Supprimer ce projet ? Cette action est irréversible."
    );

    if (!isConfirmed) {
      return;
    }

    const response = await fetch(`/api/projects/${project.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <article className="liquid-panel flex flex-col gap-3 rounded-2xl border border-white/30 bg-white/85 p-5 text-black backdrop-blur-2xl">
      <header>
        <h3 className="text-base font-semibold text-black">
          <Link className="hover:underline" href={`/projects/${project.id}`}>
            {project.name}
          </Link>
        </h3>
        <p className="text-xs text-black/60">
          Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </header>

      <p className="line-clamp-4 text-sm text-black/75">
        {project.instructions?.trim() || "Aucune instruction globale définie."}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <Link
          className="rounded-lg border border-cyan-400/40 bg-cyan-200/70 px-3 py-1.5 text-xs font-medium text-black"
          href={`/projects/${project.id}/edit`}
        >
          Éditer
        </Link>
        <button
          className="rounded-lg border border-red-400/40 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800"
          onClick={onDelete}
          type="button"
        >
          Supprimer
        </button>
      </div>
    </article>
  );
}
