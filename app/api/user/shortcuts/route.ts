import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [u] = await db.select({ shortcuts: user.shortcuts }).from(user).where(eq(user.id, session.user.id));
  return NextResponse.json(u?.shortcuts || []);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shortcuts } = await req.json();
  await db.update(user).set({ shortcuts }).where(eq(user.id, session.user.id));
  return NextResponse.json({ success: true });
}
