
export interface Language {
  code: string;
  label: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const supportedLanguages: Language[] = [
  { code: "auto", label: "Détecter la langue", nativeName: "Auto Detect", flag: "🔍" },
  { code: "fr", label: "Français", nativeName: "Français", flag: "🇫🇷" },
  { code: "en", label: "Anglais", nativeName: "English", flag: "🇬🇧" },
  { code: "es", label: "Espagnol", nativeName: "Español", flag: "🇪🇸" },
  { code: "de", label: "Allemand", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italien", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Portugais", nativeName: "Português", flag: "🇵🇹" },
  { code: "nl", label: "Néerlandais", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "ru", label: "Russe", nativeName: "Русский", flag: "🇷🇺" },
  { code: "zh", label: "Chinois", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", label: "Japonais", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ar", label: "Arabe", nativeName: "العربية", flag: "🇸🇦", rtl: true },
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return supportedLanguages.find(lang => lang.code === code);
};

export const languageCodeMap: Record<string, string> = {
  "auto": "auto",
  "fr": "fr-FR", "en": "en-US", "es": "es-ES", "de": "de-DE",
  "it": "it-IT", "pt": "pt-PT", "nl": "nl-NL", "ru": "ru-RU",
  "zh": "zh-CN", "ja": "ja-JP", "ar": "ar-SA"
};

// Detection confidence thresholds
export const DETECTION_THRESHOLD = 0.75;
export const MIN_TEXT_LENGTH_FOR_DETECTION = 15;
