import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  deleteMemoryEntryByUser,
  updateMemoryEntryByUser,
} from "@/lib/db/queries";

const updateMemorySchema = z.object({
  content: z.string().trim().min(1).max(2000),
  type: z.enum(["auto", "manual"]).optional(),
  projectId: z.string().uuid().nullable().optional(),
});

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = updateMemorySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const [updated] = await updateMemoryEntryByUser(id, session.user.id, {
    content: parsed.data.content,
    type: parsed.data.type,
    projectId: parsed.data.projectId ?? undefined,
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
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
  const [deleted] = await deleteMemoryEntryByUser(id, session.user.id);

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
