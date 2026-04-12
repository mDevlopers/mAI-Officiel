export type PluginField = {
  key: string;
  label: string;
  type: "number" | "select" | "text" | "textarea" | "toggle";
  options?: string[];
  placeholder?: string;
  default?: string | number | boolean;
  required?: boolean;
};

export type PluginCategory = "tools" | "analysis" | "generation" | "utilities";

export type MaiPlugin = {
  id: string;
  name: string;
  description: string;
  category: PluginCategory;
  fields: PluginField[];
  icon?: string;
  version?: string;
  author?: string;
};

export const pluginRegistry: MaiPlugin[] = [
  {
    id: "audio-generator",
    name: "Audio Generator",
    description: "Synthèse audio depuis un script texte.",
    category: "generation",
    icon: "volume2",
    version: "1.0.0",
    fields: [
      { key: "text", label: "Texte", type: "textarea", placeholder: "Votre script", required: true },
      { key: "voice", label: "Voix", type: "select", options: ["femme", "homme"], default: "femme" },
    ],
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Génère des mots de passe robustes.",
    category: "utilities",
    icon: "key",
    version: "1.0.0",
    fields: [
      { key: "length", label: "Longueur", type: "number", placeholder: "16", default: 16, required: true },
      {
        key: "charset",
        label: "Jeu de caractères",
        type: "select",
        options: ["alpha", "alphanum", "alphanum+symboles"],
        default: "alphanum+symboles",
      },
    ],
  },
  {
    id: "text-analysis",
    name: "Text Analysis",
    description: "Analyse complète de texte : comptage, temps de lecture, densité lexicale.",
    category: "analysis",
    icon: "file-text",
    version: "1.0.0",
    fields: [
      { key: "text", label: "Texte à analyser", type: "textarea", placeholder: "Collez votre texte ici...", required: true },
      { key: "language", label: "Langue", type: "select", options: ["français", "english", "espagnol"], default: "français" },
    ],
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "Boîte à outils : convertisseurs, encodeurs et générateurs variés.",
    category: "utilities",
    icon: "wrench",
    version: "1.0.0",
    fields: [
      { key: "operation", label: "Opération", type: "select", options: [
        "Majuscule", "Minuscule", "Capitalize",
        "Base64 Encoder", "Base64 Decoder",
        "URL Encode", "URL Decode",
        "Générer UUID", "Générer Mot de passe"
      ], required: true },
      { key: "input", label: "Entrée", type: "textarea", placeholder: "Valeur à traiter" },
    ],
  },
];

// Helper utilities for plugins
export const getPluginById = (id: string): MaiPlugin | undefined =>
  pluginRegistry.find(p => p.id === id);

export const getPluginsByCategory = (category: PluginCategory): MaiPlugin[] =>
  pluginRegistry.filter(p => p.category === category);

export const validatePluginField = (field: PluginField, value: unknown): boolean => {
  if (field.required && !value) return false;
  if (field.type === "number" && typeof value !== "number") return false;
  if (field.type === "select" && field.options && !field.options.includes(String(value))) return false;
  return true;
};
