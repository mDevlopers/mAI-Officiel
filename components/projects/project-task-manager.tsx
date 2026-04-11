"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type TaskStatus = "todo" | "doing" | "done";
type TaskPriority = "low" | "medium" | "high";
type TaskRepeat = "none" | "daily" | "weekly" | "monthly" | "custom";

type Subtask = {
  id: string;
  taskId: string;
  title: string;
  status: "todo" | "done";
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  repeatType: TaskRepeat;
  repeatInterval: number | null;
  progression: number;
  isOverdue: boolean;
  subtasks: Subtask[];
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Impossible de charger les tâches");
  }
  return response.json() as Promise<Task[]>;
};

export function ProjectTaskManager({ projectId }: { projectId: string }) {
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "status">(
    "dueDate"
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [repeatType, setRepeatType] = useState<TaskRepeat>("none");
  const [repeatInterval, setRepeatInterval] = useState("1");
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const endpoint = `/api/projects/${projectId}/tasks?sortBy=${sortBy}&order=asc`;
  const { data: tasks = [], isLoading, mutate } = useSWR(endpoint, fetcher);

  const hasOverdue = useMemo(() => tasks.some((task) => task.isOverdue), [tasks]);

  const createTask = async () => {
    if (!title.trim()) {
      setError("Le titre de la tâche est obligatoire.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          status,
          priority,
          repeatType,
          repeatInterval: repeatType === "custom" ? Number(repeatInterval) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Création impossible");
      }

      setTitle("");
      setDescription("");
      setDueDate("");
      setStatus("todo");
      setPriority("medium");
      setRepeatType("none");
      setRepeatInterval("1");
      await mutate();
    } catch {
      setError("Impossible de créer la tâche.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateTask = async (taskId: string, payload: Partial<Task>) => {
    const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Mise à jour impossible");
    }
  };

  const deleteTask = async (taskId: string) => {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
    await mutate();
  };

  const addSubtask = async (taskId: string) => {
    const value = subtaskDrafts[taskId]?.trim();
    if (!value) {
      return;
    }

    await fetch(`/api/projects/${projectId}/tasks/${taskId}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: value }),
    });

    setSubtaskDrafts((previous) => ({ ...previous, [taskId]: "" }));
    await mutate();
  };

  const toggleSubtask = async (taskId: string, subtask: Subtask) => {
    await fetch(
      `/api/projects/${projectId}/tasks/${taskId}/subtasks/${subtask.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: subtask.status === "done" ? "todo" : "done" }),
      }
    );

    await mutate();
  };

  return (
    <article className="liquid-panel rounded-2xl border border-white/30 bg-white/80 p-5 text-black shadow-xl backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Tâches du projet</h2>
          <p className="text-sm text-black/70">
            Gestion complète des tâches, sous-tâches et récurrences.
          </p>
        </div>
        <select
          className="rounded-lg border border-black/20 bg-white/80 px-3 py-2 text-sm"
          onChange={(event) =>
            setSortBy(event.target.value as "dueDate" | "priority" | "status")
          }
          value={sortBy}
        >
          <option value="dueDate">Tri par date</option>
          <option value="priority">Tri par priorité</option>
          <option value="status">Tri par statut</option>
        </select>
      </div>

      {hasOverdue ? (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-100/60 px-3 py-2 text-xs text-red-700">
          Certaines tâches sont en retard (date d'échéance dépassée).
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <input
          className="rounded-lg border border-black/20 bg-white/90 px-3 py-2 text-sm"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Titre de la tâche"
          value={title}
        />
        <input
          className="rounded-lg border border-black/20 bg-white/90 px-3 py-2 text-sm"
          onChange={(event) => setDueDate(event.target.value)}
          type="datetime-local"
          value={dueDate}
        />
        <textarea
          className="rounded-lg border border-black/20 bg-white/90 px-3 py-2 text-sm md:col-span-2"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          value={description}
        />
        <select
          className="rounded-lg border border-black/20 bg-white/90 px-3 py-2 text-sm"
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
          value={status}
        >
          <option value="todo">À faire</option>
          <option value="doing">En cours</option>
          <option value="done">Terminée</option>
        </select>
        <select
          className="rounded-lg border border-black/20 bg-white/90 px-3 py-2 text-sm"
          onChange={(event) => setPriority(event.target.value as TaskPriority)}
          value={priority}
        >
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
        </select>
        <select
          className="rounded-lg border border-black/20 bg-white/90 px-3 py-2 text-sm"
          onChange={(event) => setRepeatType(event.target.value as TaskRepeat)}
          value={repeatType}
        >
          <option value="none">Pas de répétition</option>
          <option value="daily">Quotidienne</option>
          <option value="weekly">Hebdomadaire</option>
          <option value="monthly">Mensuelle</option>
          <option value="custom">Personnalisée</option>
        </select>
        {repeatType === "custom" ? (
          <input
            className="rounded-lg border border-black/20 bg-white/90 px-3 py-2 text-sm"
            min={1}
            onChange={(event) => setRepeatInterval(event.target.value)}
            placeholder="Intervalle (jours)"
            type="number"
            value={repeatInterval}
          />
        ) : null}
      </div>

      <Button
        className="mt-3 border border-black/20 bg-cyan-200 text-black hover:bg-cyan-300"
        disabled={isSaving}
        onClick={createTask}
        type="button"
      >
        {isSaving ? "Création..." : "Créer la tâche"}
      </Button>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 space-y-3">
        {isLoading ? <p className="text-sm text-black/70">Chargement...</p> : null}
        {tasks.map((task) => (
          <div
            className="rounded-xl border border-black/15 bg-white/85 p-3"
            key={task.id}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-black/60">
                  {task.priority.toUpperCase()} • {task.status.toUpperCase()} • {task.repeatType.toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="h-8 border border-black/20 bg-white px-2 text-xs text-black hover:bg-black/5"
                  onClick={async () => {
                    await updateTask(task.id, {
                      status:
                        task.status === "todo"
                          ? "doing"
                          : task.status === "doing"
                            ? "done"
                            : "todo",
                    });
                    await mutate();
                  }}
                  type="button"
                >
                  Changer statut
                </Button>
                <Button
                  className="h-8 border border-red-500/40 bg-red-100 px-2 text-xs text-red-700 hover:bg-red-200"
                  onClick={() => deleteTask(task.id)}
                  type="button"
                >
                  Supprimer
                </Button>
              </div>
            </div>

            {task.description ? (
              <p className="mt-2 text-sm text-black/80">{task.description}</p>
            ) : null}

            <p className="mt-2 text-xs text-black/70">
              Échéance : {task.dueDate ? new Date(task.dueDate).toLocaleString("fr-FR") : "Aucune"}
              {task.isOverdue ? " • En retard" : ""}
            </p>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full bg-cyan-500"
                style={{ width: `${Math.round(task.progression * 100)}%` }}
              />
            </div>

            <div className="mt-3 space-y-2">
              {task.subtasks.map((subtask) => (
                <label className="flex items-center gap-2 text-sm" key={subtask.id}>
                  <input
                    checked={subtask.status === "done"}
                    onChange={() => toggleSubtask(task.id, subtask)}
                    type="checkbox"
                  />
                  <span
                    className={
                      subtask.status === "done" ? "text-black/50 line-through" : "text-black"
                    }
                  >
                    {subtask.title}
                  </span>
                </label>
              ))}
              <div className="flex gap-2">
                <input
                  className="w-full rounded-lg border border-black/20 bg-white/90 px-2 py-1 text-xs"
                  onChange={(event) =>
                    setSubtaskDrafts((previous) => ({
                      ...previous,
                      [task.id]: event.target.value,
                    }))
                  }
                  placeholder="Nouvelle sous-tâche"
                  value={subtaskDrafts[task.id] ?? ""}
                />
                <Button
                  className="h-8 border border-black/20 bg-white px-2 text-xs text-black"
                  onClick={() => addSubtask(task.id)}
                  type="button"
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
