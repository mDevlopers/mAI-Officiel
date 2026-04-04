"use client";

import { NewspaperIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function NewsPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <NewspaperIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Actualités</h1>
      </div>

      <div className="flex flex-col bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Recherche assistée par IA</h2>
        <p className="text-muted-foreground text-sm">
          Saisissez un sujet pour générer une synthèse complète basée sur les dernières actualités (via SerpAPI).
        </p>

        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 bg-background border border-border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Ex: Dernières avancées en intelligence artificielle..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={() => {}}>Rechercher</Button>
        </div>
      </div>

      <div className="flex-1 bg-card rounded-xl border border-border shadow-sm p-6 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
          <NewspaperIcon className="size-12 opacity-50" />
          <p>Les rapports générés apparaîtront ici.</p>
        </div>
      </div>
    </div>
  );
}
