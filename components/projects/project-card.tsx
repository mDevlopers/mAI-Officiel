"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type ProjectCardProps = {
  project: {
    id: string;
    name: string;
    instructions: string | null;
    createdAt: string;
    color: string;
    icon: string;
    archived: boolean;
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

  const onToggleArchive = async () => {
    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ archived: !project.archived }),
    });

    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <article className={`liquid-panel flex flex-col gap-3 rounded-2xl border border-white/30 bg-white/85 p-5 text-black backdrop-blur-2xl ${project.archived ? 'opacity-70' : ''}`}>
      <header>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ color: project.color }}>{project.icon}</span>
            <h3 className="text-base font-semibold text-black">
              <Link className="hover:underline" href={`/projects/${project.id}`}>
                {project.name}
              </Link>
            </h3>
          </div>
          {project.archived && (
            <span className="rounded-lg bg-black/10 px-2 py-0.5 text-xs font-medium text-black/60">
              Archivé
            </span>
          )}
        </div>
        <p className="text-xs text-black/60">
          Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </header>

      <p className="line-clamp-4 text-sm text-black/75">
        {project.instructions?.trim() || "Aucune instruction globale définie."}
      </p>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <Link
          className="rounded-lg border border-cyan-400/40 bg-cyan-200/70 px-3 py-1.5 text-xs font-medium text-black"
          href={`/projects/${project.id}/edit`}
        >
          Éditer
        </Link>
        <button
          className="rounded-lg border border-gray-400/40 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800"
          onClick={onToggleArchive}
          type="button"
        >
          {project.archived ? "Désarchiver" : "Archiver"}
        </button>
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
