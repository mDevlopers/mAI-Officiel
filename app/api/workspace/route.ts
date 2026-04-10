import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  createCoderProject,
  createMemoryEntry,
  createProject,
  createProjectTask,
  deleteCoderProject,
  deleteMemoryEntry,
  deleteProject,
  deleteProjectTask,
  getCoderProjectsByUser,
  getMemoryEntriesByUser,
  getProjectsByUser,
  getProjectTasksByUser,
  updateCoderProject,
  updateMemoryEntry,
  updateProject,
  updateProjectTask,
} from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return NextResponse.json({ error: "guest" }, { status: 401 });
  }

  const userId = session.user.id;
  const [projects, tasks, memories, coderProjects] = await Promise.all([
    getProjectsByUser(userId),
    getProjectTasksByUser(userId),
    getMemoryEntriesByUser(userId),
    getCoderProjectsByUser(userId),
  ]);

  return NextResponse.json({ projects, tasks, memories, coderProjects });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return NextResponse.json({ error: "guest" }, { status: 401 });
  }

  const body = (await request.json()) as {
    type: "project" | "task" | "memory" | "coder";
    payload: Record<string, unknown>;
  };

  const userId = session.user.id;

  switch (body.type) {
    case "project":
      return NextResponse.json(
        await createProject({
          userId,
          name: String(body.payload.name ?? "Projet"),
          ...body.payload,
        })
      );
    case "task":
      return NextResponse.json(
        await createProjectTask({
          userId,
          projectId: String(body.payload.projectId),
          title: String(body.payload.title ?? "Tâche"),
          ...body.payload,
        })
      );
    case "memory":
      return NextResponse.json(
        await createMemoryEntry({
          userId,
          content: String(body.payload.content ?? ""),
          ...body.payload,
        })
      );
    case "coder":
      return NextResponse.json(
        await createCoderProject({
          userId,
          name: String(body.payload.name ?? "Nouveau projet Coder"),
          ...body.payload,
        })
      );
    default:
      return NextResponse.json({ error: "type non supporté" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return NextResponse.json({ error: "guest" }, { status: 401 });
  }

  const body = (await request.json()) as {
    type: "project" | "task" | "memory" | "coder";
    id: string;
    payload: Record<string, unknown>;
  };

  switch (body.type) {
    case "project":
      return NextResponse.json(await updateProject(body.id, body.payload));
    case "task":
      return NextResponse.json(await updateProjectTask(body.id, body.payload));
    case "memory":
      return NextResponse.json(await updateMemoryEntry(body.id, body.payload));
    case "coder":
      return NextResponse.json(await updateCoderProject(body.id, body.payload));
    default:
      return NextResponse.json({ error: "type non supporté" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return NextResponse.json({ error: "guest" }, { status: 401 });
  }

  const body = (await request.json()) as {
    type: "project" | "task" | "memory" | "coder";
    id: string;
  };

  switch (body.type) {
    case "project":
      return NextResponse.json(await deleteProject(body.id));
    case "task":
      return NextResponse.json(await deleteProjectTask(body.id));
    case "memory":
      return NextResponse.json(await deleteMemoryEntry(body.id));
    case "coder":
      return NextResponse.json(await deleteCoderProject(body.id));
    default:
      return NextResponse.json({ error: "type non supporté" }, { status: 400 });
  }
}
