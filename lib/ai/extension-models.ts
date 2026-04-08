export type ExtensionModelOption = {
  id: string;
  label: string;
  monthlyCostProfile: "très-faible" | "faible";
  strengths: string;
};

/**
 * Modèles orientés coût faible + polyvalence pour les extensions grand public.
 */
export const extensionAiModelOptions: ExtensionModelOption[] = [
  {
    id: "gpt-5.4-nano",
    label: "GPT-5.4 Nano",
    monthlyCostProfile: "très-faible",
    strengths: "Rapide, économique, idéal pour assistants quotidiens.",
  },
  {
    id: "gpt-4.1-mini",
    label: "GPT-4.1 Mini",
    monthlyCostProfile: "faible",
    strengths: "Bon équilibre qualité/prix pour rédaction et analyse légère.",
  },
  {
    id: "o4-mini",
    label: "o4 Mini",
    monthlyCostProfile: "faible",
    strengths: "Polyvalent sur raisonnement, résumé et structuration.",
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    monthlyCostProfile: "très-faible",
    strengths: "Coût minimal pour extraction d'idées et tâches répétitives.",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    monthlyCostProfile: "faible",
    strengths: "Très bon pour synthèses rapides et flux volumineux.",
  },
  {
    id: "mistral-small-latest",
    label: "Mistral Small Latest",
    monthlyCostProfile: "faible",
    strengths: "Rapide, compact, efficace pour productivité multi-usages.",
  },
] as const;

export type ExtensionAiModel = (typeof extensionAiModelOptions)[number]["id"];

export const extensionAiModels: ExtensionAiModel[] =
  extensionAiModelOptions.map((option) => option.id);

export const defaultExtensionAiModel: ExtensionAiModel = "gpt-5.4-nano";

export function buildAiCopilotNote(
  model: ExtensionAiModel,
  scope: string,
  context: string
): string {
  const safeContext = context.trim() || "contexte par défaut";

  return `[${model}] Suggestion ${scope} : priorisez un résultat mesurable, expliquez les hypothèses et validez avec le contexte « ${safeContext} ».`;
}
