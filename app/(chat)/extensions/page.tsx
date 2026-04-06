"use client";

import { ArrowUpRight, PuzzleIcon, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { extensionCatalog } from "./data";

export default function ExtensionsPage() {
  const router = useRouter();

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-6 overflow-y-auto p-6 md:p-10">
      <header className="liquid-glass rounded-2xl border border-border/50 p-5">
        <div className="flex items-center gap-3">
          <PuzzleIcon className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mini-Store : Extensions</h1>
            <p className="text-sm text-muted-foreground">
              Installez et lancez vos extensions IA avec une interface Liquid
              Glass moderne.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {extensionCatalog.map((extension) => (
          <button
            className="liquid-glass group rounded-2xl border border-border/50 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
            key={extension.id}
            onClick={() => router.push(extension.route)}
            type="button"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xl font-semibold">
                <span>{extension.emoji}</span>
                <extension.icon className="size-5 text-primary/90" />
                <h2 className="text-lg font-bold">{extension.title}</h2>
              </div>
              {extension.premium ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  <Star className="size-3" /> Premium
                </span>
              ) : (
                <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                  Standard
                </span>
              )}
            </div>
            <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
              {extension.description}
            </p>
            <p className="mt-4 inline-flex items-center gap-1 text-xs text-primary">
              Ouvrir l&apos;extension
              <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </p>
          </button>
        ))}
      </section>
    </div>
  );
}
