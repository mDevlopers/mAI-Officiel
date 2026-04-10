"use client";

import { useEffect, useState } from "react";
import type { UserType } from "@/app/(auth)/auth";

export type WorkspaceProject = {
  id: string;
  name: string;
  description?: string | null;
  instructions?: string | null;
  files?: unknown[] | null;
  createdAt: string;
};

export type WorkspaceTask = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "normal" | "high";
  createdByAi?: boolean;
};

export type WorkspaceMemory = {
  id: string;
  projectId?: string | null;
  content: string;
  source: "auto_silent" | "auto_confirmed" | "manual";
  ignored?: boolean;
  createdAt: string;
};

export type WorkspaceCoder = {
  id: string;
  name: string;
  projectId?: string | null;
  language: string;
  files: Record<string, string>;
  updatedAt?: string;
};

type WorkspaceState = {
  projects: WorkspaceProject[];
  tasks: WorkspaceTask[];
  memories: WorkspaceMemory[];
  coderProjects: WorkspaceCoder[];
};

const KEY = "mai.workspace.v080";
const initialState: WorkspaceState = {
  projects: [],
  tasks: [],
  memories: [],
  coderProjects: [],
};

export function useWorkspace(userType: UserType | undefined) {
  const [state, setState] = useState<WorkspaceState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (userType === "regular") {
        const response = await fetch("/api/workspace", { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json();
          setState(payload);
        }
      } else {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          setState(JSON.parse(raw));
        }
      }
      setHydrated(true);
    };

    load();
  }, [userType]);

  const persistLocal = (nextState: WorkspaceState) => {
    setState(nextState);
    if (userType !== "regular") {
      localStorage.setItem(KEY, JSON.stringify(nextState));
    }
  };

  const syncRemote = async (
    method: "POST" | "PATCH" | "DELETE",
    body: Record<string, unknown>
  ) => {
    if (userType !== "regular") {
      return;
    }
    await fetch("/api/workspace", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  return { state, setState: persistLocal, syncRemote, hydrated };
}
