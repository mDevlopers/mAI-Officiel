import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { createProject, getProjects } from "@/lib/db/queries";

const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/).optional(),
  icon: z.string().max(4).optional(),
  archived: z.boolean().optional(),
  pinnedNote: z.string().max(2000).optional(),
  instructions: z.string().trim().max(5000).optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getProjects(session.user.id);
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = projectSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [created] = await createProject({
    userId: session.user.id,
    name: parsed.data.name,
    instructions: parsed.data.instructions,
  });

  return NextResponse.json(created, { status: 201 });
}
