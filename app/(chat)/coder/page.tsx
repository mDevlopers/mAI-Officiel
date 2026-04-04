"use client";

import { Code2, PlayCircle, TerminalSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const modes = ["Planification", "Investigation", "Exécution"] as const;

export default function CoderPage() {
  const [mode, setMode] = useState<(typeof modes)[number]>("Exécution");
  const [prompt, setPrompt] = useState("");

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-6 overflow-y-auto p-6 md:p-10">
      <div className="flex items-center gap-3">
        <Code2 className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">Coder</h1>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border/50 bg-card/70 p-4 md:grid-cols-3">
        {modes.map((item) => (
          <button
            className={`rounded-xl border px-4 py-3 text-left text-sm transition ${mode === item ? "border-primary bg-primary/10" : "border-border bg-background/60"}`}
            key={item}
            onClick={() => setMode(item)}
            type="button"
          >
            <div className="font-semibold">{item}</div>
            <p className="text-xs text-muted-foreground">
              Mode disponible uniquement dans Coder.
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <TerminalSquare className="size-4" /> Prompt de code
        </div>
        <textarea
          className="h-44 w-full resize-none rounded-xl border border-border/50 bg-background/70 p-3 outline-none"
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Décrivez la fonctionnalité à coder…"
          value={prompt}
        />
        <div className="mt-3 flex justify-end">
          <Button>
            <PlayCircle className="mr-2 size-4" /> Lancer {mode}
          </Button>
        </div>
      </div>
    </div>
  );
}
