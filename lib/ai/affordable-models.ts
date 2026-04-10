export type AffordableModelOption = {
  id: string;
  label: string;
};

export const affordableTextModels: AffordableModelOption[] = [
  { id: "openai/gpt-5.4", label: "GPT-5.4 (FranceStudent)" },
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4 Mini (FranceStudent)" },
  { id: "openai/gpt-5.2", label: "GPT-5.2 (FranceStudent)" },
  { id: "openai/gpt-5.1", label: "GPT-5.1 (FranceStudent)" },
  { id: "openai/gpt-5", label: "GPT-5 (FranceStudent)" },
  { id: "azure/deepseek-v3.2", label: "DeepSeek-V3.2 (FranceStudent)" },
  { id: "azure/kimi-k2.5", label: "Kimi-K2.5 (FranceStudent)" },
  { id: "azure/mistral-large-3", label: "Mistral-Large-3 (FranceStudent)" },
  {
    id: "anthropic/claude-opus-4-6",
    label: "Claude Opus 4.6 (FranceStudent)",
  },
  {
    id: "anthropic/claude-sonnet-4-20250514",
    label: "Claude Sonnet 4 (20250514) (FranceStudent)",
  },
  {
    id: "anthropic/claude-sonnet-4-6",
    label: "Claude Sonnet 4.6 (FranceStudent)",
  },
  {
    id: "anthropic/claude-haiku-4-5",
    label: "Claude Haiku 4.5 (FranceStudent)",
  },
];

export const affordableImageModels: AffordableModelOption[] = [
  { id: "flux-2-max", label: "Flux 2 Max" },
  { id: "kling-image", label: "Kling Image" },
  { id: "flux-2-pro", label: "Flux 2 Pro" },
  { id: "flux-2-flex", label: "Flux 2 Flex" },
];
