"use client";

import { BookOpen, Languages, RefreshCcw, SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const languageOptions = [
  { code: "auto", label: "Détecter la langue" },
  { code: "fr", label: "Français" },
  { code: "en", label: "Anglais" },
  { code: "es", label: "Espagnol" },
  { code: "de", label: "Allemand" },
  { code: "ar", label: "Arabe" },
  { code: "it", label: "Italien" },
  { code: "pt", label: "Portugais" },
];

export default function TranslationPage() {
  const [sourceText, setSourceText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText("");
      return;
    }

    const timer = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const langPair = `${sourceLanguage === "auto" ? "fr" : sourceLanguage}|${targetLanguage}`;
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${langPair}`
        );
        const payload = await response.json();
        setTranslatedText(payload?.responseData?.translatedText ?? "");
      } catch {
        setTranslatedText("La traduction a échoué. Vérifiez votre connexion.");
      } finally {
        setIsTranslating(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [sourceLanguage, sourceText, targetLanguage]);

  const lexicalHint = useMemo(() => {
    const clean = sourceText.trim();
    if (!clean) {
      return "En attente de sélection...";
    }
    const words = clean.split(/\s+/);
    const longest = words.sort((a, b) => b.length - a.length)[0];
    return `Mot-clé détecté: ${longest}`;
  }, [sourceText]);

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
            <select
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium"
              onChange={(e) => setSourceLanguage(e.target.value)}
              value={sourceLanguage}
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
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
            <select
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium"
              onChange={(e) => setTargetLanguage(e.target.value)}
              value={targetLanguage}
            >
              {languageOptions
                .filter((lang) => lang.code !== "auto")
                .map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
            </select>
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
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
            <span className="text-sm text-muted-foreground">{lexicalHint}</span>
          </div>
        </div>
        <div className="liquid-glass rounded-xl border border-border p-5">
          <div className="mb-3 flex items-center space-x-2">
            <RefreshCcw className="size-5 text-primary/70" />
            <h3 className="text-lg font-semibold">Synonymes & Alternatives</h3>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
            {translatedText
              ? "Essayez des variantes en ajustant la langue cible."
              : "En attente de traduction..."}
          </div>
        </div>
      </div>
    </div>
  );
}
