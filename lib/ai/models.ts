export const DEFAULT_CHAT_MODEL = "moonshotai/kimi-k2-0905";

export const titleModel = {
  id: "mistral/mistral-small",
  name: "Mistral Small",
  provider: "mistral",
  description: "Modèle rapide pour les titres",
  gatewayOrder: ["mistral"],
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  gatewayOrder?: string[];
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  // --- MODELES ORIGINAUX (GATEWAY) ---
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "deepseek",
    description: "Rapide et capable (Tools)",
    gatewayOrder: ["bedrock", "deepinfra"],
  },
  {
    id: "mistral/codestral",
    name: "Codestral",
    provider: "mistral",
    description: "Le spécialiste du code",
    gatewayOrder: ["mistral"],
  },
  {
    id: "mistral/mistral-small",
    name: "Mistral Small",
    provider: "mistral",
    description: "Vision et rapidité",
    gatewayOrder: ["mistral"],
  },
  {
    id: "moonshotai/kimi-k2-0905",
    name: "Kimi K2 0905",
    provider: "moonshotai",
    description: "Polyvalent et efficace",
    gatewayOrder: ["baseten", "fireworks"],
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT OSS 20B",
    provider: "openai",
    description: "Petit raisonnement",
    reasoningEffort: "low",
    gatewayOrder: ["groq", "bedrock"],
  },

  // --- COMETAPI + GEMINI (TEXTE GLOBAL) ---
  {
    id: "gpt-5.4-nano",
    name: "GPT-5.4 Nano",
    provider: "cometapi",
    description: "CometAPI low-cost, rapide",
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    provider: "cometapi",
    description: "CometAPI équilibré",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "google",
    description: "Google AI Studio économique",
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    provider: "google",
    description: "Flash Lite ultra cheap",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Flash polyvalent",
  },

  // --- CEREBRAS LOW-COST ---
  {
    id: "cerebras/llama3.1-8b",
    name: "Cerebras Llama 3.1 8B",
    provider: "cerebras",
    description: "Ultra économique et très rapide",
  },
  {
    id: "cerebras/qwen-3-32b",
    name: "Cerebras Qwen 3 32B",
    provider: "cerebras",
    description: "Bon raisonnement à coût maîtrisé",
  },

  // --- MISTRAL API LOW-COST ---
  {
    id: "mistral-api/ministral-3b-latest",
    name: "Ministral 3B",
    provider: "mistral",
    description: "Le modèle Mistral le plus économique",
  },
  {
    id: "mistral-api/ministral-8b-latest",
    name: "Ministral 8B",
    provider: "mistral",
    description: "Rapide et abordable pour la prod",
  },

  // --- OPENROUTER GRATUITS & LOW-COST ---
  {
    id: "openrouter/stepfun/step-1-flash:free",
    name: "Step 1 Flash (Free)",
    provider: "openrouter",
    description: "L'alternative Step 3.5 Flash",
  },
  {
    id: "openrouter/liquid/lfm-40b:free",
    name: "LFM 40B Trinity (Free)",
    provider: "openrouter",
    description: "Modèle Trinity / LFM 2.5",
  },
  {
    id: "openrouter/zhipu/glm-4-9b-chat:free",
    name: "GLM-4 9B (Free)",
    provider: "openrouter",
    description: "Le fleuron Zhipu AI",
  },
  {
    id: "openrouter/meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "openrouter",
    description: "Performances GPT-4 ultra-cheap",
  },
  {
    id: "openrouter/nvidia/llama-3.1-nemotron-70b-instruct",
    name: "Nemotron 70B",
    provider: "openrouter",
    description: "Optimisé par NVIDIA",
  },
  {
    id: "openrouter/google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash (Free)",
    provider: "openrouter",
    description: "Vision ultra-rapide",
  },

  // --- OPENROUTER CHEAP PREMIUM ---
  {
    id: "openrouter/deepseek/deepseek-chat",
    name: "DeepSeek V3 (OR)",
    provider: "openrouter",
    description: "Le génie du rapport qualité/prix",
  },

  // --- OLLAMA (LOCAUX) ---
  {
    id: "ollama/llama3.1",
    name: "Llama 3.1 (Ollama)",
    provider: "ollama",
    description: "Local et sécurisé",
  },
  {
    id: "ollama/mistral-nemo",
    name: "Mistral Nemo (Ollama)",
    provider: "ollama",
    description: "12B de puissance locale",
  },
  {
    id: "ollama/deepseek-coder-v2",
    name: "DeepSeek Coder V2",
    provider: "ollama",
    description: "Code expert local",
  },
];

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  const customModelsCapabilities = Object.fromEntries(
    chatModels
      .filter(
        (m) =>
          m.provider === "openrouter" ||
          m.provider === "ollama" ||
          m.provider === "cometapi" ||
          m.provider === "google" ||
          m.provider === "cerebras" ||
          m.id.startsWith("mistral-api/")
      )
      .map((m) => [
        m.id,
        {
          tools: !m.id.includes(":free"),
          vision:
            m.id.includes("vision") ||
            m.id.includes("flash") ||
            m.id.includes("4o") ||
            m.id.includes("mistral-small") ||
            m.id.includes("gemini"),
          reasoning: m.id.includes("oss") || m.id.includes("reasoning"),
        },
      ])
  );

  const gatewayModelsCapabilitiesArray = await Promise.all(
    chatModels
      .filter(
        (m) =>
          m.provider !== "openrouter" &&
          m.provider !== "ollama" &&
          m.provider !== "cometapi" &&
          m.provider !== "google" &&
          m.provider !== "cerebras" &&
          !m.id.startsWith("mistral-api/")
      )
      .map(async (model) => {
        try {
          const res = await fetch(
            `https://ai-gateway.vercel.sh/v1/models/${model.id}/endpoints`,
            { next: { revalidate: 86_400 } }
          );
          if (!res.ok) {
            return [
              model.id,
              { tools: false, vision: false, reasoning: false },
            ] as const;
          }

          const json = await res.json();
          const endpoints = json.data?.endpoints ?? [];
          const params = new Set(
            endpoints.flatMap(
              (e: { supported_parameters?: string[] }) =>
                e.supported_parameters ?? []
            )
          );
          const inputModalities = new Set(
            json.data?.architecture?.input_modalities ?? []
          );

          return [
            model.id,
            {
              tools: params.has("tools"),
              vision: inputModalities.has("image"),
              reasoning: params.has("reasoning"),
            },
          ] as const;
        } catch {
          return [
            model.id,
            { tools: false, vision: false, reasoning: false },
          ] as const;
        }
      })
  );

  return {
    ...customModelsCapabilities,
    ...Object.fromEntries(gatewayModelsCapabilitiesArray),
  };
}

export const isDemo = process.env.IS_DEMO === "1";

type GatewayModel = {
  id: string;
  name: string;
  type?: string;
  tags?: string[];
};

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  try {
    const res = await fetch("https://ai-gateway.vercel.sh/v1/models", {
      next: { revalidate: 86_400 },
    });
    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return (json.data ?? [])
      .filter((m: GatewayModel) => m.type === "language")
      .map((m: GatewayModel) => ({
        id: m.id,
        name: m.name,
        provider: m.id.split("/")[0],
        description: "",
        capabilities: {
          tools: m.tags?.includes("tool-use") ?? false,
          vision: m.tags?.includes("vision") ?? false,
          reasoning: m.tags?.includes("reasoning") ?? false,
        },
      }));
  } catch {
    return [];
  }
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
