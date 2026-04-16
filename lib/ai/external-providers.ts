// lib/api/aiClient.ts

const FS_API_BASE_URL =
  process.env.FS_API_BASE_URL ?? "https://api.francestudent.org/v1";

const FS_TIMEOUT_MS = Number.parseInt(
  process.env.FS_API_TIMEOUT_MS ?? "10000",
  10
);

const FS_MAX_RETRIES = Number.parseInt(
  process.env.FS_API_MAX_RETRIES ?? "2",
  10
);

const FS_KEYS = [
  process.env.FS_API_KEY_1,
  process.env.FS_API_KEY_2,
  process.env.FS_API_KEY_3,
].filter(Boolean) as string[];

const RETRYABLE_STATUS = new Set([408, 409, 429]);

// 🔥 mapping propre
const fsModelMapping: Record<string, string> = {
  "openai/gpt-5.4": "gpt-5.4",
  "openai/gpt-5.4-mini": "gpt-5.4-mini",
  "openai/gpt-5.4-nano": "gpt-5.4-nano",
  "openai/gpt-5.2": "gpt-5.2",
  "openai/gpt-5.1": "gpt-5.1",
  "openai/gpt-5": "gpt-5",
  "openai/gpt-oss-120b": "gpt-oss-120b",
  "azure/deepseek-v3.2": "DeepSeek-V3.2",
  "azure/kimi-k2.5": "Kimi-K2.5",
  "azure/mistral-large-3": "Mistral-Large-3",
};

export const fsTextModels = new Set(Object.keys(fsModelMapping));

// 🧠 utils
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// 🔥 extraction clean
function extractText(data: any): string {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content.map((c) => c?.text ?? "").join("\n").trim();
  }

  return (data?.output_text ?? "").trim();
}

// 🚀 CORE
export async function generateResponse(input: {
  model: string;
  prompt: string;
  systemInstruction?: string;
}) {
  if (FS_KEYS.length === 0) {
    throw new Error("Missing FS API keys");
  }

  const model = fsModelMapping[input.model] ?? input.model;

  const url = `${FS_API_BASE_URL}/chat/completions`; // ✅ SAFE URL

  let lastError: any = null;

  for (let keyIndex = 0; keyIndex < FS_KEYS.length; keyIndex++) {
    const apiKey = FS_KEYS[keyIndex];

    for (let attempt = 0; attempt <= FS_MAX_RETRIES; attempt++) {
      try {
        console.log(`🟢 KEY ${keyIndex + 1} | Attempt ${attempt + 1}`);

        const res = await fetchWithTimeout(
          url,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                ...(input.systemInstruction
                  ? [{ role: "system", content: input.systemInstruction }]
                  : []),
                { role: "user", content: input.prompt },
              ],
            }),
          },
          FS_TIMEOUT_MS
        );

        // 🔴 gestion erreurs HTTP
        if (!res.ok) {
          const text = await res.text();

          console.warn(`⚠️ KEY ${keyIndex + 1} → ${res.status}`);

          // ❌ 401 / 403 → skip direct (clé morte)
          if (res.status === 401 || res.status === 403) {
            throw new Error(`INVALID_KEY_${keyIndex + 1}`);
          }

          // 🔁 retryable
          if (RETRYABLE_STATUS.has(res.status) || res.status >= 500) {
            throw new Error(`RETRY_${res.status}`);
          }

          throw new Error(text);
        }

        const data = await res.json();
        const output = extractText(data);

        if (!output) throw new Error("EMPTY_RESPONSE");

        console.log(`✅ SUCCESS KEY ${keyIndex + 1}`);

        return {
          provider: `francestudent-${keyIndex + 1}`,
          text: output,
        };

      } catch (err: any) {
        lastError = err;

        console.error(
          `❌ KEY ${keyIndex + 1} attempt ${attempt + 1}`,
          err.message
        );

        // 🔥 skip direct si clé invalide
        if (err.message.includes("INVALID_KEY")) break;

        const isRetry =
          err.message.includes("RETRY") ||
          err.name === "AbortError" ||
          err.message.toLowerCase().includes("timeout");

        if (isRetry && attempt < FS_MAX_RETRIES) {
          const delay = 500 * 2 ** attempt;
          console.log(`⏳ retry in ${delay}ms`);
          await sleep(delay);
          continue;
        }

        break;
      }
    }

    console.warn(`🔁 Switching to next key...`);
  }

  throw new Error(`All API keys failed: ${lastError?.message}`);
}

// 🔌 wrapper
export async function runExternalTextModel(
  modelId: string,
  prompt: string,
  options?: { systemInstruction?: string }
) {
  if (!fsModelMapping[modelId]) {
    throw new Error("Unsupported model");
  }

  return generateResponse({
    model: modelId,
    prompt,
    systemInstruction: options?.systemInstruction,
  });
}