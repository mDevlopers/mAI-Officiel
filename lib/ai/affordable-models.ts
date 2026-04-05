export type AffordableModelOption = {
  id: string;
  label: string;
};

export const affordableTextModels: AffordableModelOption[] = [
  { id: "gpt-5.4-nano", label: "GPT-5.4 Nano (CometAPI)" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 Mini (CometAPI)" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
];

export const affordableImageModels: AffordableModelOption[] = [
  { id: "flux-2-max", label: "Flux 2 Max" },
  { id: "kling-image", label: "Kling Image" },
  { id: "flux-2-pro", label: "Flux 2 Pro" },
  { id: "flux-2-flex", label: "Flux 2 Flex" },
];
