"use client";

import { BookOpen, Languages, RefreshCcw, Loader2 } from "lucide-react";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function TranslationPage() {
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [sourceText, setSourceText] = useState("");

  const { messages, append, isLoading } = useChat({




  }) as any;

  // Get the latest assistant message as the translation result
  const translatedText = messages
    .filter((m: any) => m.role === "assistant")
    .pop()?.content || "";

  const handleTranslate = () => {
    if (!sourceText.trim()) return;

    append({
      role: "user",
      content: `Translate the following text from ${sourceLang === 'auto' ? 'detect language' : sourceLang} to ${targetLang}. Only return the translated text, without any additional explanations: \n\n${sourceText}`,
    });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Languages className="size-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Traduction</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Language Area */}
        <div className="flex flex-col space-y-3 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-background text-sm font-medium border border-border rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="auto">Détecter la langue</option>
              <option value="French">Français</option>
              <option value="English">Anglais</option>
              <option value="Spanish">Espagnol</option>
              {/* > 100 languages will be supported */}
              <option value="etc">Plus de 100 langues supportées...</option>
            </select>
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            onBlur={handleTranslate}
            className="w-full h-48 md:h-64 bg-transparent border-none outline-none resize-none text-base placeholder:text-muted-foreground p-2"
            placeholder="Saisissez le texte à traduire..."
          />
        </div>

        {/* Target Language Area */}
        <div className="flex flex-col space-y-3 bg-card p-4 rounded-xl border border-border shadow-sm bg-muted/20 relative">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <select
              value={targetLang}
              onChange={(e) => {
                setTargetLang(e.target.value);
                if (sourceText.trim()) {
                  append({
                    role: "user",
                    content: `Translate the following text from ${sourceLang === 'auto' ? 'detect language' : sourceLang} to ${e.target.value}. Only return the translated text, without any additional explanations: \n\n${sourceText}`,
                  });
                }
              }}
              className="bg-background text-sm font-medium border border-border rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="English">Anglais</option>
              <option value="French">Français</option>
              <option value="Spanish">Espagnol</option>
              {/* > 100 languages will be supported */}
              <option value="etc">Plus de 100 langues supportées...</option>
            </select>
          </div>
          <div className="w-full h-48 md:h-64 bg-transparent text-base p-2 overflow-y-auto relative">
            {isLoading && (
              <div className="absolute top-2 right-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {translatedText ? (
              <span className="whitespace-pre-wrap">{translatedText}</span>
            ) : (
              <span className="text-muted-foreground italic">
                La traduction s'affichera ici...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lexical Analysis & Synonyms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="flex flex-col bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <BookOpen className="size-5 text-primary/70" />
            <h3 className="text-lg font-semibold">Analyse Lexicale</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sélectionnez un mot dans le texte source pour voir son analyse
            complète, sa nature grammaticale et son étymologie.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 min-h-24 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              En attente de sélection...
            </span>
          </div>
        </div>

        <div className="flex flex-col bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <RefreshCcw className="size-5 text-primary/70" />
            <h3 className="text-lg font-semibold">Synonymes & Alternatives</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Explorez les différentes nuances et formulations possibles pour le
            terme ou la phrase sélectionnée.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 min-h-24 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              En attente de sélection...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
