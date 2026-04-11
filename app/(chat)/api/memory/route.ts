import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { createMemoryEntry, getMemoryEntriesByUser } from "@/lib/db/queries";

const memorySchema = z.object({
  content: z.string().trim().min(1).max(2000),
  type: z.enum(["auto", "manual"]).default("manual"),
  projectId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const memory = await getMemoryEntriesByUser(session.user.id, projectId);

  return NextResponse.json(memory);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = memorySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [created] = await createMemoryEntry({
    userId: session.user.id,
    projectId: parsed.data.projectId,
    content: parsed.data.content,
    type: parsed.data.type,
  });

  return NextResponse.json(created, { status: 201 });
}
