import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ProjectCard } from "@/components/projects/project-card";
import { getProjects } from "@/lib/db/queries";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const projects = await getProjects(session.user.id);
  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 text-black md:px-6">
      <section className="liquid-panel rounded-3xl border border-white/30 bg-white/80 p-6 text-black backdrop-blur-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Projets</h1>
            <p className="text-sm text-black/70">
              Isolez conversations, sources, mémoire et tâches par contexte.
            </p>
          </div>

          <Link
            className="rounded-xl border border-cyan-400/40 bg-cyan-200/70 px-4 py-2 text-sm font-medium text-black"
            href="/projects/new"
          >
            Nouveau projet
          </Link>
        </div>
      </section>

      {activeProjects.length > 0 && (
        <>
          <h2 className="text-lg font-semibold">Projets actifs</h2>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={{
                  id: project.id,
                  name: project.name,
                  instructions: project.instructions,
                  createdAt: project.createdAt.toISOString(),
                  color: project.color,
                  icon: project.icon,
                  archived: project.archived,
                }}
              />
            ))}
          </section>
        </>
      )}

      {archivedProjects.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-4">Projets archivés</h2>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {archivedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={{
                  id: project.id,
                  name: project.name,
                  instructions: project.instructions,
                  createdAt: project.createdAt.toISOString(),
                  color: project.color,
                  icon: project.icon,
                  archived: project.archived,
                }}
              />
            ))}
          </section>
        </>
      )}

      {projects.length === 0 && (
        <section className="liquid-panel rounded-2xl border border-white/30 bg-white/80 p-8 text-sm text-black/75 backdrop-blur-2xl">
          Aucun projet pour le moment. Créez votre premier projet pour
          structurer vos données.
        </section>
      )}
    </main>
  );
}
