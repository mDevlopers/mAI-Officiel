
import { franc } from 'franc-min';
import { supportedLanguages, DETECTION_THRESHOLD, MIN_TEXT_LENGTH_FOR_DETECTION } from './languages';

const francLangMapping: Record<string, string> = {
  'fra': 'fr', 'eng': 'en', 'spa': 'es', 'deu': 'de',
  'ita': 'it', 'por': 'pt', 'nld': 'nl', 'rus': 'ru',
  'zho': 'zh', 'jpn': 'ja', 'ara': 'ar'
};

interface DetectionResult {
  detectedLanguage: string;
  confidence: number;
  reliable: boolean;
}

export const detectLanguage = (text: string): DetectionResult => {
  const cleanText = text.trim();

  if (cleanText.length < MIN_TEXT_LENGTH_FOR_DETECTION) {
    return {
      detectedLanguage: 'auto',
      confidence: 0,
      reliable: false
    };
  }

  try {
    const francResult = franc(cleanText, { minLength: MIN_TEXT_LENGTH_FOR_DETECTION });
    const languageCode = francLangMapping[francResult];

    if (!languageCode || !supportedLanguages.find(l => l.code === languageCode)) {
      return {
        detectedLanguage: 'auto',
        confidence: 0,
        reliable: false
      };
    }

    // Calculate approximate confidence based on franc accuracy
    const confidence = francResult === 'und' ? 0 : Math.min(0.95, 0.5 + (cleanText.length * 0.005));

    return {
      detectedLanguage: languageCode,
      confidence,
      reliable: confidence >= DETECTION_THRESHOLD
    };

  } catch {
    return {
      detectedLanguage: 'auto',
      confidence: 0,
      reliable: false
    };
  }
};

export const detectMultipleLanguages = (text: string): Array<{ code: string; confidence: number }> => {
  const results: Array<{ code: string; confidence: number }> = [];
  const cleanText = text.trim();

  if (cleanText.length < MIN_TEXT_LENGTH_FOR_DETECTION) return results;

  try {
    // Primary detection first
    const primary = detectLanguage(cleanText);
    if (primary.reliable) {
      results.push({ code: primary.detectedLanguage, confidence: primary.confidence });
    }
  } catch {
    // Fail silently
  }

  return results;
};
