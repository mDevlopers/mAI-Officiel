import { generateDummyPassword } from "./db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export const GUEST_PSEUDONYMS = [
  "Supporter",
  "Fan",
  "Apprenti",
  "Explorateur",
  "Novice",
  "Voyageur",
  "Chercheur",
  "Curieux",
  "Aventurier",
  "Pionnier"
];

export const greetingPrompts = [
  "Comment puis-je vous aider aujourd'hui ?",
  "Que voulez-vous construire avec mAI ?",
  "Par quoi commençons-nous aujourd'hui ?",
  "Quelle idée voulez-vous explorer maintenant ?",
  "De quoi voulez-vous parler ?",
] as const;
