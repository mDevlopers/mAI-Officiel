"use client";

import { BookOpen, Languages, RefreshCcw, SendHorizonal, Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supportedLanguages, getLanguageByCode } from "@/lib/i18n/languages";
import { detectLanguage } from "@/lib/i18n/detection";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const synonymsMap: Record<string, string[]> = {
  bug: ["anomalie", "défaut", "erreur"],
  rapide: ["vite", "prompt", "expéditif"],
  code: ["script", "source", "implémentation"],
  sécurité: ["protection", "fiabilité", "robustesse"],
};

const translationCache = new Map<string, string>();

export default function TranslationPage() {
  const [sourceText, setSourceText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [aiLexicalAnalysis, setAiLexicalAnalysis] = useState("");
  const [isGeneratingLexicalAnalysis, setIsGeneratingLexicalAnalysis] =
    useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef("");

  useEffect(() => {
    const trimmedText = sourceText.trim();
    if (!trimmedText) {
      setTranslatedText("");
      return;
    }

    const cacheKey = `${trimmedText}:${sourceLanguage}:${targetLanguage}`;
    
    if (translationCache.has(cacheKey)) {
      setTranslatedText(translationCache.get(cacheKey)!);
      setIsTranslating(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const timer = setTimeout(async () => {
      if (lastRequestRef.current === cacheKey) return;
      lastRequestRef.current = cacheKey;

      setIsTranslating(true);
      abortControllerRef.current = new AbortController();

      try {
        let effectiveSourceLang = sourceLanguage;

        if (sourceLanguage === "auto") {
          const detection = detectLanguage(trimmedText);
          if (detection.reliable) {
            effectiveSourceLang = detection.detectedLanguage;
          }
        }

        const langPair = `${effectiveSourceLang === "auto" ? "fr" : effectiveSourceLang}|${targetLanguage}`;
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmedText)}&langpair=${langPair}&de=contact@example.com`,
          { signal: abortControllerRef.current.signal }
        );
        const payload = await response.json();

        let translated = payload?.responseData?.translatedText ?? "";

        // Contextual improvements
        const targetLang = getLanguageByCode(targetLanguage);
        if (targetLang?.rtl) {
          translated = `\u200F${translated}\u200E`;
        }

        // Remove common translation artifacts
        translated = translated.replace(/\[.*?\]/g, "").trim();

        translationCache.set(cacheKey, translated);
        if (translationCache.size > 100) {
          const firstKey = translationCache.keys().next().value;
          if (firstKey) translationCache.delete(firstKey);
        }

        setTranslatedText(translated);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setTranslatedText("La traduction a échoué. Vérifiez votre connexion.");
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsTranslating(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      abortControllerRef.current?.abort();
    };
  }, [sourceLanguage, sourceText, targetLanguage]);

  const lexicalAnalysis = useMemo(() => {
    const textToAnalyze = translatedText.trim() || sourceText.trim();
    const clean = textToAnalyze
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .trim();

    if (!clean) {
      return {
        keyWord: "En attente de sélection...",
        totalWords: 0,
        totalCharactersWithSpaces: 0,
        totalCharactersWithoutSpaces: 0,
      };
    }

    const words = clean.split(/\s+/).filter(Boolean);
    const frequency = new Map<string, number>();
    for (const word of words) {
      frequency.set(word, (frequency.get(word) ?? 0) + 1);
    }

    const keyWord = [...frequency.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    return {
      keyWord: keyWord ?? words[0],
      totalWords: words.length,
      totalCharactersWithSpaces: textToAnalyze.length,
      totalCharactersWithoutSpaces: textToAnalyze.replace(/\s/g, "").length,
    };
  }, [sourceText, translatedText]);

  const handleGenerateLexicalAnalysis = async () => {
    if (!translatedText.trim()) {
      setAiLexicalAnalysis("Traduisez d'abord un texte pour lancer l'analyse IA.");
      return;
    }

    setIsGeneratingLexicalAnalysis(true);

    try {
      const response = await fetch("/api/translation/lexical-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translatedText }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const payload = (await response.json()) as { analysis?: string };
      setAiLexicalAnalysis(payload.analysis ?? "Analyse indisponible.");
    } catch {
      setAiLexicalAnalysis(
        "Impossible de générer l'analyse IA pour le moment."
      );
    } finally {
      setIsGeneratingLexicalAnalysis(false);
    }
  };

  const synonyms = useMemo(() => {
    const list = synonymsMap[lexicalAnalysis.keyWord] ?? [];
    return list.length > 0 ? list : ["Aucun synonyme suggéré pour ce terme."];
  }, [lexicalAnalysis.keyWord]);

  return (
    <div className="liquid-glass flex h-full w-full max-w-6xl flex-col gap-6 overflow-y-auto p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Languages className="size-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Traduction</h1>
        </div>
        <Button size="sm" variant="outline">
          <SendHorizonal className="mr-2 size-4" /> Exporter
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="liquid-glass flex flex-col space-y-3 rounded-xl border border-border p-4">
           <div className="border-b border-border pb-3">
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant="ghost"
                   className="w-full justify-between rounded-full border border-border/40 bg-background/50 h-8 px-3 text-xs text-muted-foreground font-normal"
                 >
                   <span className="flex items-center gap-2">
                     <span className="text-base">{getLanguageByCode(sourceLanguage)?.flag}</span>
                     {getLanguageByCode(sourceLanguage)?.label}
                   </span>
                   <ChevronDown className="size-3 opacity-50" />
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-64 p-0" align="start">
                 <Command>
                   <CommandInput placeholder="Rechercher une langue..." />
                   <CommandList>
                     <CommandEmpty>Aucune langue trouvée</CommandEmpty>
                     <CommandGroup>
                       {supportedLanguages.map((lang) => (
                         <CommandItem
                           key={lang.code}
                           value={lang.code}
                           onSelect={() => setSourceLanguage(lang.code)}
                           className="text-sm"
                         >
                           <span className="mr-2 text-base">{lang.flag}</span>
                           <span>{lang.label}</span>
                           <span className="ml-auto text-xs text-muted-foreground">{lang.nativeName}</span>
                           {sourceLanguage === lang.code && <Check className="ml-2 size-3" />}
                         </CommandItem>
                       ))}
                     </CommandGroup>
                   </CommandList>
                 </Command>
               </PopoverContent>
             </Popover>
           </div>
          <textarea
            className="h-48 resize-none bg-transparent p-2 text-base outline-none md:h-64"
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Saisissez le texte à traduire..."
            value={sourceText}
          />
        </div>

        <div className="liquid-glass flex flex-col space-y-3 rounded-xl border border-border bg-muted/20 p-4">
           <div className="border-b border-border pb-3">
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant="ghost"
                   className="w-full justify-between rounded-full border border-border/40 bg-background/50 h-8 px-3 text-xs text-muted-foreground font-normal"
                 >
                   <span className="flex items-center gap-2">
                     <span className="text-base">{getLanguageByCode(targetLanguage)?.flag}</span>
                     {getLanguageByCode(targetLanguage)?.label}
                   </span>
                   <ChevronDown className="size-3 opacity-50" />
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-64 p-0" align="start">
                 <Command>
                   <CommandInput placeholder="Rechercher une langue..." />
                   <CommandList>
                     <CommandEmpty>Aucune langue trouvée</CommandEmpty>
                     <CommandGroup>
                       {supportedLanguages.filter(lang => lang.code !== "auto").map((lang) => (
                         <CommandItem
                           key={lang.code}
                           value={lang.code}
                           onSelect={() => setTargetLanguage(lang.code)}
                           className="text-sm"
                         >
                           <span className="mr-2 text-base">{lang.flag}</span>
                           <span>{lang.label}</span>
                           <span className="ml-auto text-xs text-muted-foreground">{lang.nativeName}</span>
                           {targetLanguage === lang.code && <Check className="ml-2 size-3" />}
                         </CommandItem>
                       ))}
                     </CommandGroup>
                   </CommandList>
                 </Command>
               </PopoverContent>
             </Popover>
           </div>
          <div className="h-48 overflow-y-auto p-2 text-base md:h-64">
            {isTranslating ? (
              <span className="text-muted-foreground italic">
                Traduction en cours...
              </span>
            ) : translatedText ? (
              translatedText
            ) : (
              <span className="text-muted-foreground italic">
                La traduction s'affichera ici...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="liquid-glass rounded-xl border border-border p-5">
          <div className="mb-3 flex items-center space-x-2">
            <BookOpen className="size-5 text-primary/70" />
            <h3 className="text-lg font-semibold">Analyse Lexicale</h3>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p>Mot-clé détecté : {lexicalAnalysis.keyWord}</p>
            <p>Total mots : {lexicalAnalysis.totalWords}</p>
            <p>
              Caractères (espaces inclus) :{" "}
              {lexicalAnalysis.totalCharactersWithSpaces}
            </p>
            <p>
              Caractères (sans espaces) :{" "}
              {lexicalAnalysis.totalCharactersWithoutSpaces}
            </p>
            <div className="mt-3 rounded-lg border border-border/60 bg-background/70 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">
                  Analyse IA (GPT-5.4 Nano)
                </p>
                <Button
                  className="h-7 rounded-full px-3 text-xs"
                  disabled={isGeneratingLexicalAnalysis || !translatedText.trim()}
                  onClick={handleGenerateLexicalAnalysis}
                  type="button"
                  variant="outline"
                >
                  {isGeneratingLexicalAnalysis ? "Génération..." : "Générer"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {aiLexicalAnalysis || "Cliquez sur Générer pour une analyse courte."}
              </p>
            </div>
          </div>
        </div>

        <div className="liquid-glass rounded-xl border border-border p-5">
          <div className="mb-3 flex items-center space-x-2">
            <RefreshCcw className="size-5 text-primary/70" />
            <h3 className="text-lg font-semibold">Synonymes & Alternatives</h3>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
            <ul className="list-disc pl-5">
              {synonyms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
