import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  deleteAgentByUser,
  getAgentById,
  updateAgentByUser,
} from "@/lib/db/queries";

const updateAgentSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  instructions: z.string().trim().max(8000).optional(),
  model: z.string().trim().min(1).max(120).optional(),
  avatarUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
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
  const agent = await getAgentById(id);

  if (!agent || agent.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: agent.id,
    userId: agent.userId,
    name: agent.name,
    description: agent.description,
    instructions: agent.systemPrompt,
    model: agent.baseModel,
    avatarUrl: agent.image,
    createdAt: agent.createdAt,
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = updateAgentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const [updated] = await updateAgentByUser(id, session.user.id, {
    name: parsed.data.name,
    description: parsed.data.description,
    systemPrompt: parsed.data.instructions,
    baseModel: parsed.data.model,
    image: parsed.data.avatarUrl || null,
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: updated.id,
    userId: updated.userId,
    name: updated.name,
    description: updated.description,
    instructions: updated.systemPrompt,
    model: updated.baseModel,
    avatarUrl: updated.image,
    createdAt: updated.createdAt,
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteAgentByUser(id, session.user.id);

  return NextResponse.json({ success: true });
}
