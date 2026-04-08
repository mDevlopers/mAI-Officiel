"use client";

import { Bot, SearchIcon, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildAiCopilotNote,
  defaultExtensionAiModel,
  type ExtensionAiModel,
  extensionAiModels,
} from "@/lib/ai/extension-models";

export default function AuthenticPage() {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState<ExtensionAiModel>(
    defaultExtensionAiModel
  );
  const [result, setResult] = useState<{ score: number; label: string } | null>(
    null
  );

  const modelNote = useMemo(
    () => buildAiCopilotNote(selectedModel, "détection IA", text),
    [selectedModel, text]
  );

  const handleAnalyze = () => {
    if (!text.trim()) {
      return;
    }

    const score = Math.floor(Math.random() * 101);
    let label = "";

    if (score === 100) {
      label = "Texte généré pur.";
    } else if (score >= 76) {
      label = "Travail d'IA amélioré/édité par l'humain.";
    } else if (score >= 51) {
      label = "IA avec retouches humaines significatives.";
    } else if (score >= 21) {
      label = "Humain avec assistance IA légère.";
    } else {
      label = "Travail humain.";
    }

    setResult({ score, label });
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-6 overflow-y-auto p-6 md:p-10">
      <header className="liquid-glass rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Authentic</h1>
            <p className="text-sm text-muted-foreground">
              Détectez le contenu généré par IA et analysez l'origine de vos
              textes.
            </p>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-4 md:flex-row">
        <div className="liquid-glass flex flex-1 flex-col gap-4 rounded-2xl p-5">
          <h2 className="text-lg font-semibold">Analyseur de texte</h2>
          <label className="text-xs text-muted-foreground">
            Modèle IA
            <select
              className="mt-1 w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2"
              onChange={(event) =>
                setSelectedModel(event.target.value as ExtensionAiModel)
              }
              value={selectedModel}
            >
              {extensionAiModels.map((entry) => (
                <option key={entry}>{entry}</option>
              ))}
            </select>
          </label>
          <p className="flex items-center gap-2 rounded-xl bg-background/50 p-2 text-xs text-muted-foreground">
            <Bot className="size-3.5 text-primary" />
            {modelNote}
          </p>
          <textarea
            className="min-h-[200px] flex-1 resize-none rounded-xl border border-border/50 bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            onChange={(event) => setText(event.target.value)}
            placeholder="Collez le texte à analyser ici..."
            value={text}
          />
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            disabled={!text.trim()}
            onClick={handleAnalyze}
            type="button"
          >
            <SearchIcon className="size-4" />
            Lancer l'analyse
          </button>
        </div>

        {result && (
          <div className="liquid-glass flex w-full flex-col items-center justify-center gap-4 rounded-2xl p-5 md:w-[350px]">
            <h2 className="text-lg font-semibold">Résultat</h2>
            <div className="flex size-32 items-center justify-center rounded-full border-8 border-primary/20 bg-background text-4xl font-bold text-primary">
              {result.score}%
            </div>
            <p className="text-center font-medium">IA détectée</p>
            <p className="text-center text-sm text-muted-foreground">
              {result.label}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
