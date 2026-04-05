import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { type PlanKey, parsePlanKey } from "@/lib/subscription";

const activationBodySchema = z.object({
  code: z.string().trim().min(1).max(128),
});

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
    const json = await request.json();
    const parsedPayload = activationBodySchema.safeParse(json);

    if (!parsedPayload.success) {
      return Response.json({ error: "Code invalide" }, { status: 400 });
    }

    const plan = getPlanFromEnvCode(parsedPayload.data.code);

    if (!plan) {
      return Response.json({ error: "Code invalide" }, { status: 401 });
    }

    return Response.json({ plan: parsePlanKey(plan) });
  } catch {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
