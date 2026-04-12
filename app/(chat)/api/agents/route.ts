import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { createAgent, getAgentsByUser } from "@/lib/db/queries";

const createAgentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  instructions: z.string().trim().max(8000).optional(),
  model: z.string().trim().min(1).max(120).optional(),
  avatarUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agents = await getAgentsByUser(session.user.id);

  const normalized = agents.map((agent) => ({
    id: agent.id,
    userId: agent.userId,
    name: agent.name,
    description: agent.description,
    instructions: agent.systemPrompt,
    model: agent.baseModel,
    avatarUrl: agent.image,
    createdAt: agent.createdAt,
    usageCount: agent.usageCount,
    shareToken: agent.shareToken,
  }));

  return NextResponse.json(normalized);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = createAgentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [created] = await createAgent({
    userId: session.user.id,
    name: parsed.data.name,
    description: parsed.data.description,
    systemPrompt: parsed.data.instructions,
    baseModel: parsed.data.model,
    image: parsed.data.avatarUrl || null,
  });

  return NextResponse.json(
    {
      id: created.id,
      userId: created.userId,
      name: created.name,
      description: created.description,
      instructions: created.systemPrompt,
      model: created.baseModel,
      avatarUrl: created.image,
      createdAt: created.createdAt,
    },
    { status: 201 }
  );
}
