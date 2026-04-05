import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [u] = await db.select({ globalTags: user.globalTags }).from(user).where(eq(user.id, session.user.id));
  return NextResponse.json(u?.globalTags || []);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tags } = await req.json();
  await db.update(user).set({ globalTags: tags }).where(eq(user.id, session.user.id));
  return NextResponse.json({ success: true });
}
