export type PluginField = {
  key: string;
  label: string;
  type: "number" | "select" | "text";
  options?: string[];
  placeholder?: string;
};

export type MaiPlugin = {
  category: "texte" | "utilitaire" | "voix";
  description: string;
  fields: PluginField[];
  id: string;
  name: string;
};

export const pluginRegistry: MaiPlugin[] = [
  {
    id: "audio-generator",
    name: "Audio Generator",
    category: "voix",
    description: "Synthèse audio depuis un script texte.",
    fields: [
      {
        key: "text",
        label: "Texte",
        type: "text",
        placeholder: "Votre script",
      },
      {
        key: "voice",
        label: "Voix",
        type: "select",
        options: ["femme", "homme"],
      },
    ],
  },
  {
    id: "password-generator",
    name: "Password Generator",
    category: "utilitaire",
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
  {
    id: "tone-rewriter",
    name: "Tone Rewriter",
    category: "texte",
    description:
      "Réécrit un texte avec un ton spécifique pour email, social ou pro.",
    fields: [
      {
        key: "input",
        label: "Texte source",
        type: "text",
        placeholder: "Texte à adapter",
      },
      {
        key: "tone",
        label: "Ton cible",
        type: "select",
        options: ["professionnel", "simple", "impactant"],
      },
    ],
  },
  {
    id: "text-utilities",
    name: "Text Utilities",
    category: "utilitaire",
    description: "Nettoie, résume ou extrait les mots-clés d'un texte long.",
    fields: [
      {
        key: "content",
        label: "Contenu",
        type: "text",
        placeholder: "Texte à traiter",
      },
      {
        key: "action",
        label: "Action",
        type: "select",
        options: ["résumer", "mots-clés", "corriger"],
      },
    ],
  },
];
