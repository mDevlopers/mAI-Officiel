// Text Analysis Plugin Implementation
export const analyzeText = (text: string, language: string = 'français') => {
  if (!text?.trim()) return null;

  const charsTotal = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  const readingWpm = language === 'français' ? 210 : language === 'english' ? 238 : 220;
  const readingTimeMinutes = Math.ceil(wordCount / readingWpm);
  const speakingWpm = 130;
  const speakingTimeMinutes = Math.ceil(wordCount / speakingWpm);

  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const lexicalDensity = wordCount > 0 ? Math.round((uniqueWords.size / wordCount) * 100) : 0;
  const avgWordLength = wordCount > 0 ? Math.round((charsNoSpaces / wordCount) * 10) / 10 : 0;
  const avgSentenceLength = sentenceCount > 0 ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0;

  return {
    counts: {
      characters: charsTotal,
      charactersNoSpaces: charsNoSpaces,
      words: wordCount,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
      uniqueWords: uniqueWords.size,
    },
    time: {
      reading: readingTimeMinutes,
      speaking: speakingTimeMinutes,
    },
    metrics: {
      lexicalDensity,
      averageWordLength: avgWordLength,
      averageSentenceLength: avgSentenceLength,
    }
  };
};

// Utilities Plugin Implementation
export const runUtility = (operation: string, input?: string): string => {
  switch (operation) {
    case 'Majuscule':
      return input?.toUpperCase() || '';
    case 'Minuscule':
      return input?.toLowerCase() || '';
    case 'Capitalize':
      return input?.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase()) || '';

    case 'Base64 Encoder':
      return btoa(unescape(encodeURIComponent(input || '')));
    case 'Base64 Decoder':
      try { return decodeURIComponent(escape(atob(input || ''))); }
      catch { return 'Erreur: contenu Base64 invalide'; }

    case 'URL Encode':
      return encodeURIComponent(input || '');
    case 'URL Decode':
      try { return decodeURIComponent(input || ''); }
      catch { return 'Erreur: URL invalide'; }

    case 'Générer UUID':
      return crypto.randomUUID();

    case 'Générer Mot de passe':
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      let password = '';
      for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;

    default:
      return input || '';
  }
};
