import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ACCESS_HASH =
  "0a05d7b27cc7a2b1ca704adcbd1d6e3ab2c19ece000586f03bceeabf24547e43";

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function isValid(code: string) {
  const incoming = Buffer.from(hashCode(code), "utf8");
  const expected = Buffer.from(ACCESS_HASH, "utf8");
  return timingSafeEqual(incoming, expected);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") ?? "";
  const store = await cookies();
  const unlocked = store.get(`mai_restricted_${area}`)?.value === "1";
  return NextResponse.json({ unlocked });
}

export async function POST(request: Request) {
  const { area, code } = (await request.json()) as {
    area?: "coder" | "news";
    code?: string;
  };

  if (!area || !code || !isValid(code)) {
    return NextResponse.json({ error: "Code invalide" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(`mai_restricted_${area}`, "1", {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
