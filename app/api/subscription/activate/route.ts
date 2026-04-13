import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { type PlanKey, parsePlanKey } from "@/lib/subscription";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 8;
const attemptsByIp = new Map<string, number[]>();

const activationBodySchema = z.object({
  code: z.string().trim().min(1).max(128),
});

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = (attemptsByIp.get(ip) ?? []).filter(
    (attempt) => now - attempt < RATE_LIMIT_WINDOW_MS
  );

  attemptsByIp.set(ip, attempts);
  return attempts.length >= RATE_LIMIT_MAX_ATTEMPTS;
}

function registerAttempt(ip: string) {
  const attempts = attemptsByIp.get(ip) ?? [];
  attempts.push(Date.now());
  attemptsByIp.set(ip, attempts);
}

function safeCompareCode(input: string, expected: string | undefined): boolean {
  if (!expected) {
    return false;
  }

  const normalizedInput = Buffer.from(input.trim());
  const normalizedExpected = Buffer.from(expected.trim());

  if (normalizedInput.length !== normalizedExpected.length) {
    return false;
  }

  return timingSafeEqual(normalizedInput, normalizedExpected);
}

function getPlanFromEnvCode(code: string): PlanKey | null {
  const normalizedCode = code.trim();

  if (safeCompareCode(normalizedCode, process.env.MAI_PLUS)) {
    return "plus";
  }

  if (safeCompareCode(normalizedCode, process.env.MAI_PRO)) {
    return "pro";
  }

  if (safeCompareCode(normalizedCode, process.env.MAI_MAX)) {
    return "max";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      return Response.json(
        { error: "Trop de tentatives. Réessayez dans 1 minute." },
        { status: 429 }
      );
    }

    const json = await request.json();
    const parsedPayload = activationBodySchema.safeParse(json);

    if (!parsedPayload.success) {
      registerAttempt(clientIp);
      return Response.json({ error: "Code invalide" }, { status: 400 });
    }

    const plan = getPlanFromEnvCode(parsedPayload.data.code);

    if (!plan) {
      registerAttempt(clientIp);
      return Response.json({ error: "Code invalide" }, { status: 401 });
    }

    return Response.json({ plan: parsePlanKey(plan) });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
