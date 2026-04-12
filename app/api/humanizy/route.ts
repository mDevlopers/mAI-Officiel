import { NextResponse } from "next/server";
import { z } from "zod";

const HumanizyRequestSchema = z.object({
  text: z.string()
    .min(50, "Le texte doit contenir au moins 50 caractères")
    .max(50000, "Le texte ne peut pas dépasser 50000 caractères")
    .trim()
});

interface AnalysisIndicator {
  name: string;
  type: "ai" | "human" | "neutral";
  explanation: string;
  weight: number;
}

interface AnalysisResult {
  aiProbability: number;
  humanProbability: number;
  indicators: AnalysisIndicator[];
  overallScore: number;
  conclusion: string;
  confidence: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = HumanizyRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Sanitize input: remove control characters and normalize
    const sanitizedText = validation.data.text
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .normalize('NFKC');

    const result = analyzeText(sanitizedText);
    return NextResponse.json(result);
    
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de l'analyse du texte" },
      { status: 500 }
    );
  }
}

function analyzeText(text: string): AnalysisResult {
  const indicators: AnalysisIndicator[] = [];
  let aiScore = 0;
  let totalWeight = 0;

  // Normalize text
  const normalizedText = text.normalize("NFKC");
  const sentences = normalizedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = normalizedText.split(/\s+/).filter(w => w.length > 0);
  const paragraphs = normalizedText.split(/\n\n+/).filter(p => p.trim().length > 0);

  // --- 1. Analyse de la longueur moyenne des phrases ---
  const avgSentenceLength = words.length / sentences.length;
  if (avgSentenceLength > 25) {
    indicators.push({
      name: "Phrases longues et structurées",
      type: "ai",
      explanation: "Les IA ont tendance à produire des phrases uniformément longues et bien structurées",
      weight: 0.15
    });
    aiScore += 15;
  } else if (avgSentenceLength < 12) {
    indicators.push({
      name: "Phrases courtes et variées",
      type: "human",
      explanation: "Les humains utilisent plus souvent des phrases courtes et de longueur variable",
      weight: 0.12
    });
    aiScore -= 12;
  }
  totalWeight += 0.15;

  // --- 2. Variance de la longueur des phrases ---
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const meanLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - meanLength, 2), 0) / sentenceLengths.length;
  
  if (variance < 30) {
    indicators.push({
      name: "Uniformité des longueurs de phrases",
      type: "ai",
      explanation: "Très faible variation dans la longueur des phrases, typique des générateurs IA",
      weight: 0.20
    });
    aiScore += 20;
  } else if (variance > 80) {
    indicators.push({
      name: "Grande variété de longueurs de phrases",
      type: "human",
      explanation: "Variation naturelle typique de l'écriture humaine",
      weight: 0.18
    });
    aiScore -= 18;
  }
  totalWeight += 0.20;

  // --- 3. Ponctuation et marqueurs de discours ---
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const ellipsisCount = (text.match(/\.\.\./g) || []).length;
  const interjectionCount = (text.match(/\b(bon|bref|enfin|donc|mais|or|ni|car)\b/gi) || []).length;

  const discourseMarkers = exclamationCount + questionCount + ellipsisCount + interjectionCount;
  const markerRatio = discourseMarkers / sentences.length;

  if (markerRatio < 0.05) {
    indicators.push({
      name: "Absence de marqueurs discursifs",
      type: "ai",
      explanation: "Les IA utilisent rarement des exclamations, ellipses ou connecteurs conversationnels",
      weight: 0.14
    });
    aiScore += 14;
  } else if (markerRatio > 0.15) {
    indicators.push({
      name: "Présence de marqueurs conversationnels",
      type: "human",
      explanation: "Utilisation naturelle de ponctuations et connecteurs typique des humains",
      weight: 0.12
    });
    aiScore -= 12;
  }
  totalWeight += 0.14;

  // --- 4. Répétitions lexicales ---
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    const lowerWord = word.toLowerCase().replace(/[^\wàâäéèêëîïôöùûüÿç]/g, '');
    if (lowerWord.length > 3) {
      wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1;
    }
  });

  const repeatedWords = Object.values(wordFrequency).filter(count => count > 3).length;
  const repetitionRatio = repeatedWords / Object.keys(wordFrequency).length;

  if (repetitionRatio > 0.08) {
    indicators.push({
      name: "Répétitions lexicales inhabituelles",
      type: "ai",
      explanation: "Les modèles IA ont tendance à répéter des mots ou tournures de phrase",
      weight: 0.13
    });
    aiScore += 13;
  }
  totalWeight += 0.13;

  // --- 5. Utilisation d'adverbes et qualificatifs ---
  const adverbCount = (text.match(/\b(très|beaucoup|peu|assez|tout|trop|aussi|même|encore|déjà|toujours|jamais|souvent|parfois)\b/gi) || []).length;
  const adjectiveCount = (text.match(/\b(beau|bon|grand|petit|nouveau|vieux|bon|mauvais|jeune|vrai|faux|seul|même)\b/gi) || []).length;

  const qualifierRatio = (adverbCount + adjectiveCount) / words.length;
  
  if (qualifierRatio < 0.02) {
    indicators.push({
      name: "Style neutre et factuel",
      type: "ai",
      explanation: "Les IA produisent souvent un texte sobre sans qualificatifs subjectifs",
      weight: 0.11
    });
    aiScore += 11;
  } else if (qualifierRatio > 0.06) {
    indicators.push({
      name: "Présence de qualificatifs subjectifs",
      type: "human",
      explanation: "Les humains ajoutent naturellement des adverbes et adjectifs dans leur écriture",
      weight: 0.10
    });
    aiScore -= 10;
  }
  totalWeight += 0.11;

  // --- 6. Erreurs et imperfections ---
  const typoIndicators = [
    /\b[bcdfghjklmnpqrstvwxz]{4,}\b/i, // Suite de consonnes improbable
    /\s[.,;:]/, // Espace avant ponctuation
    /\w{25,}/, // Mot anormalement long
    /[a-zàâäéèêëîïôöùûüÿç][A-Z]/, // Majuscule en milieu de mot
  ];

  let hasImperfections = false;
  for (const pattern of typoIndicators) {
    if (pattern.test(text)) {
      hasImperfections = true;
      break;
    }
  }

  if (!hasImperfections && text.length > 500) {
    indicators.push({
      name: "Texte trop parfait",
      type: "ai",
      explanation: "Absence totale d'imperfections, fautes de frappe ou erreurs mineures",
      weight: 0.12
    });
    aiScore += 12;
  } else if (hasImperfections) {
    indicators.push({
      name: "Imperfections naturelles",
      type: "human",
      explanation: "Présence de petites erreurs typiques de l'écriture humaine",
      weight: 0.10
    });
    aiScore -= 10;
  }
  totalWeight += 0.12;

  // --- 7. Structure des paragraphes ---
  const avgParagraphLength = words.length / Math.max(1, paragraphs.length);
  if (avgParagraphLength > 150) {
    indicators.push({
      name: "Paragraphes uniformément longs",
      type: "ai",
      explanation: "Les IA génèrent souvent des paragraphes de taille très régulière",
      weight: 0.08
    });
    aiScore += 8;
  }
  totalWeight += 0.08;

  // Normalize score between 0 and 100
  aiScore = Math.max(0, Math.min(100, aiScore + 50));
  
  // Adjust confidence based on text length
  const confidence = Math.min(100, 40 + Math.floor(text.length / 20));

  // Determine conclusion
  let conclusion = "";
  if (aiScore >= 85) {
    conclusion = "Très probablement généré par IA";
  } else if (aiScore >= 70) {
    conclusion = "Probablement généré par IA";
  } else if (aiScore >= 55) {
    conclusion = "Possibilité de génération IA";
  } else if (aiScore >= 40) {
    conclusion = "Probablement écrit par un humain";
  } else if (aiScore >= 25) {
    conclusion = "Très probablement écrit par un humain";
  } else {
    conclusion = "Écrit par un humain";
  }

  return {
    aiProbability: Math.round(aiScore),
    humanProbability: Math.round(100 - aiScore),
    indicators,
    overallScore: Math.round(aiScore),
    conclusion,
    confidence
  };
}
