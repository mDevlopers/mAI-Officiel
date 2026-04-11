import { tool } from "ai";
import { z } from "zod";
import { createTask, getProjectsByUser } from "@/lib/db/queries";

export function createProjectTaskTool(userId: string) {
  return tool({
    description:
      "Créer une tâche dans un projet utilisateur. Si les informations sont incomplètes, demander des précisions.",
    inputSchema: z.object({
      projectName: z
        .string()
        .min(1)
        .describe("Nom exact (ou quasi exact) du projet cible"),
      title: z.string().min(1).describe("Titre clair de la tâche"),
      description: z.string().optional(),
      dueDate: z
        .string()
        .optional()
        .describe("Date ISO facultative, ex: 2026-05-01T10:00:00.000Z"),
      priority: z.enum(["low", "medium", "high"]).optional(),
      subtasks: z.array(z.string().min(1)).optional(),
    }),
    execute: async ({
      projectName,
      title,
      description,
      dueDate,
      priority,
      subtasks,
    }) => {
      const normalizedProjectName = projectName.trim().toLowerCase();
      const normalizedTitle = title.trim();

      if (!normalizedProjectName || !normalizedTitle) {
        return {
          needsClarification: true,
          message:
            "J'ai besoin du nom du projet et d'un titre de tâche pour continuer.",
        };
      }

      const projects = await getProjectsByUser(userId);
      const targetProject = projects.find(
        (project) => project.name.trim().toLowerCase() === normalizedProjectName
      );

      if (!targetProject) {
        return {
          needsClarification: true,
          message:
            "Je ne trouve pas ce projet. Peux-tu préciser le nom exact du projet ?",
          availableProjects: projects.map((project) => project.name),
        };
      }

      const sanitizedSubtasks = (subtasks ?? [])
        .map((subtask) => subtask.trim())
        .filter(Boolean)
        .slice(0, 20);

      const mergedDescription = [
        description?.trim(),
        sanitizedSubtasks.length > 0
          ? `Sous-tâches:\n${sanitizedSubtasks.map((subtask) => `- ${subtask}`).join("\n")}`
          : undefined,
      ]
        .filter(Boolean)
        .join("\n\n");

      const [createdTask] = await createTask({
        projectId: targetProject.id,
        title: normalizedTitle,
        description: mergedDescription || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
      });

      return {
        success: true,
        task: createdTask,
        project: {
          id: targetProject.id,
          name: targetProject.name,
        },
      };
    },
  });
}
