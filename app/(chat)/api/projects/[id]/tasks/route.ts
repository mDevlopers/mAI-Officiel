import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  createTask,
  getProjectById,
  getTasksByProject,
} from "@/lib/db/queries";

const taskSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().max(1000).optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await getProjectById(id);

  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tasks = await getTasksByProject(id);
  return NextResponse.json(tasks);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await getProjectById(id);

  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = taskSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [created] = await createTask({
    projectId: id,
    title: parsed.data.title,
    description: parsed.data.description,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    status: parsed.data.status,
    priority: parsed.data.priority,
  });

  return NextResponse.json(created, { status: 201 });
}
