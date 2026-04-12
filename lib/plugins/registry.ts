export type PluginField = {
  key: string;
  label: string;
  type: "number" | "select" | "text";
  options?: string[];
  placeholder?: string;
};

export type MaiPlugin = {
  description: string;
  fields: PluginField[];
  id: string;
  name: string;
};

export const pluginRegistry: MaiPlugin[] = [
  {
    id: "audio-generator",
    name: "Audio Generator",
    description: "Synthèse audio depuis un script texte.",
    fields: [
      { key: "text", label: "Texte", type: "text", placeholder: "Votre script" },
      { key: "voice", label: "Voix", type: "select", options: ["femme", "homme"] },
    ],
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Génère des mots de passe robustes.",
    fields: [
      { key: "length", label: "Longueur", type: "number", placeholder: "16" },
      {
        key: "charset",
        label: "Jeu de caractères",
        type: "select",
        options: ["alpha", "alphanum", "alphanum+symboles"],
      },
    ],
  },
];
