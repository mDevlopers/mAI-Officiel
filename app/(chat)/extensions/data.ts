import type { LucideIcon } from "lucide-react";
import {
  BrainCircuit,
  FileSearch,
  PenLine,
  Sparkles,
  Store,
} from "lucide-react";

export type StoreExtension = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  emoji: string;
  route: string;
  premium?: boolean;
  beta?: boolean;
  featured?: boolean;
};

export const extensionCatalog: StoreExtension[] = [
  {
    id: "manalyse",
    title: "mAnalyse",
    description:
      "Analyse URL, PDF, DOCX, TXT et image avec extraction multi-source puis rapport structuré prêt à partager.",
    icon: FileSearch,
    emoji: "🔎",
    route: "/extensions/manalyse",
    featured: true,
  },
  {
    id: "ecri20",
    title: "Ecri20",
    description:
      "Rédaction augmentée avec ton, format intelligent et export instantané TXT, JSON, DOCX et PDF.",
    icon: PenLine,
    emoji: "✍️",
    route: "/extensions/ecri20",
    featured: true,
  },
  {
    id: "brainstorming",
    title: "Brainstorming",
    description:
      "Partenaire de réflexion en mode Socrate avec relances guidées, plans clairs et options actionnables.",
    icon: BrainCircuit,
    emoji: "🧠",
    route: "/extensions/brainstorming",
    featured: true,
  },
  {
    id: "studio",
    title: "Studio",
    description:
      "Générez et itérez vos visuels avec styles prédéfinis dans un espace créatif optimisé.",
    icon: Sparkles,
    emoji: "🎨",
    route: "/studio",
    premium: true,
  },
  {
    id: "store",
    title: "Store mAI",
    description:
      "Centre de découverte et gestion de vos extensions disponibles en un seul endroit.",
    icon: Store,
    emoji: "🛍️",
    route: "/extensions",
  },
];
