import type { LucideIcon } from "lucide-react";
import {
  BrainCircuit,
  FileSearch,
  Globe,
  GraduationCap,
  HeartPulse,
  LibraryBig,
  Newspaper,
  PenLine,
  Salad,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export type ExtensionStatus = "beta" | "stable";

export type StoreExtension = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  category: "Productivité" | "Création" | "Analyse" | "Learning";
  status: ExtensionStatus;
  popularity: number;
  lastUsedAt: string;
  permissions: string[];
  useCases: string[];
  examples: string[];
  limits: string[];
  changelog: string[];
  demoPrompt: string;
  premium?: boolean;
  featured?: boolean;
};

/**
 * Répertoire Extensions : centralise toutes les mini-apps accessibles
 * depuis la sidebar (hors Projets et Mes mAIs, gardés en accès direct).
 */
export const extensionCatalog: StoreExtension[] = [
  {
    id: "manalyse",
    title: "mAnalyse",
    description:
      "Analyse URL, PDF, DOCX, TXT et image avec extraction multi-source puis rapport structuré prêt à partager.",
    icon: FileSearch,
    route: "/extensions/manalyse",
    category: "Analyse",
    status: "stable",
    popularity: 93,
    lastUsedAt: "2026-04-06",
    permissions: ["Accès fichiers", "Accès URL"],
    useCases: ["Audit documentaire", "Comparaison de sources"],
    examples: ["Comparer 2 contrats", "Extraire un résumé de PDF"],
    limits: ["OCR local limité", "Analyses longues plus lentes"],
    changelog: ["v0.7.1: extraction image améliorée"],
    demoPrompt: "Analyse ce PDF et donne-moi un plan d'action en 5 points.",
    featured: true,
  },
  {
    id: "ecri20",
    title: "Ecri20",
    description:
      "Rédaction augmentée avec ton, format intelligent et export instantané TXT, JSON, DOCX et PDF.",
    icon: PenLine,
    route: "/extensions/ecri20",
    category: "Productivité",
    status: "stable",
    popularity: 88,
    lastUsedAt: "2026-04-05",
    permissions: ["Accès éditeur", "Export fichiers"],
    useCases: ["Rédaction marketing", "Mise en forme de comptes-rendus"],
    examples: ["Transformer un brouillon en post LinkedIn"],
    limits: ["Nécessite une relecture humaine"],
    changelog: ["v0.7.1: nouveaux templates d'export"],
    demoPrompt: "Réécris ce texte en version email professionnel.",
    featured: true,
  },
  {
    id: "brainstorming",
    title: "Brainstorming",
    description:
      "Partenaire de réflexion en mode Socrate avec relances guidées, plans clairs et options actionnables.",
    icon: BrainCircuit,
    route: "/extensions/brainstorming",
    category: "Productivité",
    status: "stable",
    popularity: 81,
    lastUsedAt: "2026-04-07",
    permissions: ["Accès chat"],
    useCases: ["Roadmap produit", "Préparation entretien"],
    examples: ["Trouver 10 angles pour une campagne"],
    limits: ["Ne remplace pas la validation métier"],
    changelog: ["v0.7.1: relances contextuelles plus précises"],
    demoPrompt: "Aide-moi à brainstormer 5 idées d'offre premium.",
    featured: true,
  },
  {
    id: "authentic",
    title: "Authentic",
    description:
      "Détectez le contenu IA et analysez la fiabilité globale de vos textes rapidement.",
    icon: ShieldCheck,
    route: "/authentic",
    category: "Analyse",
    status: "stable",
    popularity: 84,
    lastUsedAt: "2026-04-04",
    permissions: ["Accès texte"],
    useCases: ["Vérifier une copie", "Contrôle qualité éditorial"],
    examples: ["Score par phrase + explication du verdict"],
    limits: ["Anti-plagiat léger"],
    changelog: ["v0.7.1: avant/après réécriture"],
    demoPrompt: "Analyse ce texte et donne un score de fiabilité par phrase.",
    premium: true,
  },
  {
    id: "news",
    title: "Actualités",
    description:
      "Veille intelligente avec synthèse rapide et suivi des sujets stratégiques en temps réel.",
    icon: Newspaper,
    route: "/news",
    category: "Analyse",
    status: "beta",
    popularity: 90,
    lastUsedAt: "2026-04-07",
    permissions: ["Accès web", "Alertes"],
    useCases: ["Timeline d'actualité", "Comparaison de sources"],
    examples: ["Résumé 30 sec + score de fiabilité"],
    limits: ["Dépend de la disponibilité des sources"],
    changelog: ["v0.7.1: alertes + mode résumé 30 sec"],
    demoPrompt: "Fais un brief actualité tech des 24 dernières heures.",
    premium: true,
  },
  {
    id: "translation",
    title: "Traduction",
    description:
      "Traduction multilingue contextuelle avec reformulation adaptée à votre audience.",
    icon: Globe,
    route: "/translation",
    category: "Productivité",
    status: "stable",
    popularity: 76,
    lastUsedAt: "2026-04-03",
    permissions: ["Accès texte"],
    useCases: ["Localisation de contenus", "Support client multilingue"],
    examples: ["Adapter un email en EN/ES/DE"],
    limits: ["Conserver les noms propres manuellement"],
    changelog: ["v0.7.1: contexte métier amélioré"],
    demoPrompt: "Traduire ce message en anglais avec ton courtois.",
  },
  {
    id: "health",
    title: "mAIHealth",
    description:
      "Pré-analyse de documents santé avec alertes de prudence et points de vigilance.",
    icon: HeartPulse,
    route: "/Health",
    category: "Analyse",
    status: "beta",
    popularity: 79,
    lastUsedAt: "2026-04-02",
    permissions: ["Accès texte", "Historique santé local"],
    useCases: ["Suivi hydratation", "Routine sommeil/sport"],
    examples: ["Conseils non médicaux personnalisés"],
    limits: ["Ne remplace pas un médecin"],
    changelog: ["v0.7.1: suivi historique consolidé"],
    demoPrompt: "Fais-moi un plan bien-être sur 7 jours.",
  },
  {
    id: "cookai",
    title: "CookAI",
    description:
      "Planifiez vos repas avec des idées personnalisées selon vos objectifs, allergies et contraintes alimentaires.",
    icon: Salad,
    route: "/meals",
    category: "Learning",
    status: "beta",
    popularity: 83,
    lastUsedAt: "2026-04-06",
    permissions: ["Préférences alimentaires"],
    useCases: ["Menu hebdomadaire", "Mode il manque quoi"],
    examples: ["Recette selon budget + temps"],
    limits: ["Pas de commande intégrée"],
    changelog: ["v0.7.1: gestion allergies/portions enrichie"],
    demoPrompt: "Propose 3 recettes avec œufs, tomate et 20 min max.",
  },
  {
    id: "learnup",
    title: "LearnUp",
    description:
      "Révision intelligente: quiz IA, exercices ciblés, fiches de révision et cours structurés en quelques secondes.",
    icon: GraduationCap,
    route: "/extensions/learnup",
    category: "Learning",
    status: "stable",
    popularity: 91,
    lastUsedAt: "2026-04-07",
    permissions: ["Accès notes", "Historique progression"],
    useCases: ["Mode Brevet/Bac", "Quiz adaptatifs"],
    examples: ["Planning + progression"],
    limits: ["Nécessite saisie d'objectifs"],
    changelog: ["v0.7.1: fiches automatiques améliorées"],
    demoPrompt: "Crée un quiz adaptatif de maths niveau brevet.",
    featured: true,
  },
  {
    id: "shopper",
    title: "Shopper",
    description:
      "Assistant shopping IA avec recherche multi-plateformes, preuves visuelles et optimisation du budget selon vos critères.",
    icon: ShoppingBag,
    route: "/extensions/shopper",
    category: "Productivité",
    status: "stable",
    popularity: 86,
    lastUsedAt: "2026-04-05",
    permissions: ["Accès web", "Comparateur prix"],
    useCases: ["Comparer prix/design", "Alertes de baisse"],
    examples: ["Suivi de stock"],
    limits: ["Disponibilités variables"],
    changelog: ["v0.7.1: meilleur choix/prix/design"],
    demoPrompt: "Compare 3 laptops à moins de 900€.",
    featured: true,
  },
  {
    id: "studio",
    title: "Studio",
    description:
      "Générez et itérez vos visuels dans un espace créatif optimisé et moderne.",
    icon: Sparkles,
    route: "/studio",
    category: "Création",
    status: "stable",
    popularity: 87,
    lastUsedAt: "2026-04-04",
    permissions: ["Génération image"],
    useCases: ["Moodboard", "Variations visuelles"],
    examples: ["Créer un visuel social media"],
    limits: ["Qualité dépend du prompt"],
    changelog: ["v0.7.1: itérations plus fluides"],
    premium: true,
  },
  {
    id: "library",
    title: "Bibliothèque",
    description:
      "Centralisez, organisez et prévisualisez vos assets et fichiers de travail.",
    icon: LibraryBig,
    route: "/library",
    category: "Productivité",
    status: "stable",
    popularity: 72,
    lastUsedAt: "2026-03-29",
    permissions: ["Accès fichiers"],
    useCases: ["Classement d'assets", "Prévisualisation rapide"],
    examples: ["Retrouver un document par tags"],
    limits: ["Pas d'édition avancée"],
    changelog: ["v0.7.1: performances de chargement"],
  },
];
