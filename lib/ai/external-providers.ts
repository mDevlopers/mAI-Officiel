import OpenAI from "openai";

// 1. Configuration des constantes avec valeurs par défaut robustes
const FS_API_BASE_URL = process.env.FS_API_BASE_URL || "https://api.francestudent.org/v1";
const FS_TIMEOUT_MS = Number.parseInt(process.env.FS_API_TIMEOUT_MS || "15000", 10);
const FS_MAX_RETRIES = Number.parseInt(process.env.FS_API_MAX_RETRIES || "2", 10);

const RETRYABLE_FS_STATUS_CODES = new Set([401, 403, 408, 409, 429]);

// Mapping des modèles : assure-toi que la partie droite correspond exactement à ce que l'API accepte
const fsModelMapping: Record<string, string> = {
  "openai/gpt-5.4": "gpt-5.4",
  "openai/gpt-5.4-mini": "gpt-5.4-mini",
  "openai/gpt-5.4-nano": "gpt-5.4-nano",
  "openai/gpt-5.2": "gpt-5.2",
  "openai/gpt-5.1": "gpt-5.1",
  "openai/gpt-5": "gpt-5", // Modèle de repli conseillé si gpt-5.4 renvoie une 404
  "openai/gpt-oss-120b": "gpt-oss-120b",
  "azure/deepseek-v3.2": "DeepSeek-V3.2",
  "azure/kimi-k2.5": "Kimi-K2.5",
  "azure/mistral-large-3": "Mistral-Large-3",
};

export const fsTextModels = new Set(Object.keys(fsModelMapping));

// Récupération des clés API
const fsKeys = [
  process.env.FS_API_KEY_1,
  process.env.FS_API_KEY_2,
  process.env.FS_API_KEY_3,
].filter(Boolean) as string[];

// --- Fonctions Utilitaires ---

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null) {
    if ("status" in error && typeof (error as any).status === "number") return (error as any).status;
    if ("cause" in error && (error as any).cause?.status) return (error as any).cause.status;
  }
  return undefined;
}

function isRetryableFsError(error: unknown): boolean {
  const status = extractErrorStatus(error);
  if (typeof status === "number") {
    return RETRYABLE_FS_STATUS_CODES.has(status) || status >= 500;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return error.name === "AbortError" || msg.includes("timeout") || msg.includes("network");
  }
  return false;
}

// --- Logique d'exécution avec Fallback ---

export function createClientWithFallback(options?: { timeoutMs?: number; maxRetries?: number }) {
  const timeoutMs = options?.timeoutMs ?? FS_TIMEOUT_MS;
  const maxRetries = options?.maxRetries ?? FS_MAX_RETRIES;

  if (fsKeys.length === 0) {
    throw new Error("Missing API keys: define FS_API_KEY_1, FS_API_KEY_2, or FS_API_KEY_3 in .env");
  }

  const clients = fsKeys.map((apiKey, index) => ({
    keyIndex: index + 1,
    client: new OpenAI({
      apiKey,
      baseURL: FS_API_BASE_URL,
    }),
  }));

  return {
    async execute<T>(
      operation: (client: OpenAI, context: { keyIndex: number; signal: AbortSignal }) => Promise<T>
    ): Promise<T> {
      let lastError: any = null;

      for (const { client, keyIndex } of clients) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          try {
            const result = await operation(client, { keyIndex, signal: controller.signal });
            clearTimeout(timer);
            return result;
          } catch (error: any) {
            clearTimeout(timer);
            lastError = error;

            if (isRetryableFsError(error) && attempt < maxRetries) {
              const delay = 500 * 2 ** attempt;
              console.warn(`API KEY ${keyIndex} attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
              await sleep(delay);
              continue;
            }
            
            // Si on arrive ici, on change de clé
            if (keyIndex < clients.length) {
              console.warn(`API KEY ${keyIndex} failed (${error.message}), switching to next key...`);
            }
            break; 
          }
        }
      }

      throw new Error(`All API keys failed. Last error: ${lastError?.message || "Unknown"}`);
    },
  };
}

export async function generateResponse(input: {
  model: string;
  prompt: string;
  systemInstruction?: string;
  timeoutMs?: number;
}): Promise<{ provider: string; text: string }> {
  const fallbackClient = createClientWithFallback({ timeoutMs: input.timeoutMs });

  return fallbackClient.execute(async (client, { keyIndex, signal }) => {
    const completion = await client.chat.completions.create(
      {
        model: input.model,
        messages: [
          // ✅ Correction : Utilisation de "system" au lieu de "developer"
          ...(input.systemInstruction
            ? [{ role: "system" as const, content: input.systemInstruction }]
            : []),
          { role: "user" as const, content: input.prompt },
        ],
      },
      { signal }
    );

    const text = completion.choices?.[0]?.message?.content?.trim() || "";

    if (!text) {
      throw new Error(`FranceStudent key ${keyIndex} returned an empty response`);
    }

    return { provider: `francestudent-${keyIndex}`, text };
  });
}

// Helper pour lancer un modèle par son ID interne (ex: "openai/gpt-5.4")
export async function runExternalTextModel(
  modelId: string,
  prompt: string,
  options?: { systemInstruction?: string }
): Promise<{ provider: string; text: string }> {
  const providerModelId = fsModelMapping[modelId];

  if (!providerModelId) {
    throw new Error(`Unsupported model ID: ${modelId}`);
  }

  return generateResponse({
    model: providerModelId,
    prompt,
    systemInstruction: options?.systemInstruction?.trim(),
  });
}
