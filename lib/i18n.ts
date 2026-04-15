"use client";

export const LANGUAGE_STORAGE_KEY = "mai.language.v1";

export const SUPPORTED_LANGUAGES = ["fr", "en", "es"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const fallbackLanguage: AppLanguage = "fr";

export const dictionary = {
  en: {
    notifications: "Notifications",
    noNotifications: "No notifications.",
    showNotifications: "Show notifications",
    ghostMode: "Ghost mode",
    ghostModeActive: "Ghost mode active",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Pure voice mode (Experimental)",
    voiceListening: "Listening...",
    voiceStart: "Start voice mode",
    voiceStop: "Stop",
    voiceTranscript: "Transcript",
    voiceSend: "Send to chat",
    voiceCaptions: "Subtitles",
  },
  es: {
    notifications: "Notificaciones",
    noNotifications: "Sin notificaciones.",
    showNotifications: "Mostrar notificaciones",
    ghostMode: "Modo Fantasma",
    ghostModeActive: "Modo Fantasma activo",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Modo voz pura (Experimental)",
    voiceListening: "Escuchando...",
    voiceStart: "Iniciar modo voz",
    voiceStop: "Detener",
    voiceTranscript: "Transcripción",
    voiceSend: "Enviar al chat",
    voiceCaptions: "Subtítulos",
  },
  fr: {
    notifications: "Notifications",
    noNotifications: "Aucune notification.",
    showNotifications: "Afficher les notifications",
    ghostMode: "Mode Fantôme",
    ghostModeActive: "Mode Fantôme actif",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Mode vocal pur (Expérimental)",
    voiceListening: "Écoute en cours…",
    voiceStart: "Lancer le mode vocal",
    voiceStop: "Arrêter",
    voiceTranscript: "Transcription",
    voiceSend: "Envoyer au chat",
    voiceCaptions: "Sous-titres",
  },
} as const;

export type TranslationKey = keyof (typeof dictionary)["fr"];

export function resolveLanguage(value: string | null | undefined): AppLanguage {
  if (!value) {
    return fallbackLanguage;
  }

  return SUPPORTED_LANGUAGES.includes(value as AppLanguage)
    ? (value as AppLanguage)
    : fallbackLanguage;
}

export function getLanguageFromStorage(): AppLanguage {
  if (typeof window === "undefined") {
    return fallbackLanguage;
  }

  return resolveLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function setLanguageInStorage(language: AppLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  window.dispatchEvent(
    new CustomEvent("mai:language-updated", { detail: { language } })
  );
}

export function t(key: TranslationKey, language: AppLanguage): string {
  return dictionary[language][key] ?? dictionary.fr[key];
}
