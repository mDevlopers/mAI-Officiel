import { BadgeCheck, CalendarClock, FileText, Layers, Sparkles } from "lucide-react";

const changelog = [
  {
    version: "0.1.9",
    date: "2026-04-05",
    items: [
      "Interface institutionnelle en français uniquement.",
      "Barre de dialogue compacte par défaut avec redimensionnement dans Paramètres.",
      "Menu (+) optimisé: option active affichée sur la barre et typographie plus compacte.",
      "Renommage du modèle Codestral en Mistral Codestral.",
      "Révision de la page À propos avec la liste officielle des technologies intégrées.",
    ],
  },
  {
    version: "0.1.8",
    date: "2026-04-05",
    items: [
      "Régulation des ressources mAINews par quota journalier selon le forfait.",
      "Régulation des ressources mAIHealth par quota mensuel selon le forfait.",
      "Affichage des compteurs de consommation directement dans chaque module.",
    ],
  },
];

const officialTechnologies = [
  "Next.js App Router",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "Vercel AI SDK",
  "Drizzle ORM",
  "PostgreSQL",
  "NextAuth.js",
];

export default function AboutPage() {
  return (
    <div className="liquid-glass mx-auto flex h-full w-full max-w-5xl flex-col gap-6 overflow-y-auto p-6 md:p-10">
      <div className="rounded-2xl border border-border/50 bg-card/70 p-5">
        <div className="flex items-center gap-3">
          <BadgeCheck className="size-7 text-primary" />
          <h1 className="text-3xl font-bold">À propos de mAI</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Répertoire officiel des versions et technologies intégrées à la plateforme.
        </p>
      </div>

      <section className="rounded-2xl border border-border/50 bg-card/70 p-5">
        <p className="mb-2 flex items-center gap-2 font-semibold">
          <Layers className="size-4" /> Technologies officielles intégrées
        </p>
        <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          {officialTechnologies.map((technology) => (
            <li
              className="rounded-xl border border-border/40 bg-background/60 px-3 py-2"
              key={technology}
            >
              {technology}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border/50 bg-card/70 p-5">
        <p className="mb-3 flex items-center gap-2 font-semibold">
          <CalendarClock className="size-4" /> Changelog
        </p>
        <div className="space-y-3">
          {changelog.map((entry) => (
            <div
              className="rounded-xl border border-border/40 bg-background/60 p-3"
              key={entry.version}
            >
              <p className="font-medium">
                v{entry.version} • {entry.date}
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/50 bg-card/70 p-5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <Sparkles className="size-4" /> Version active: 0.1.9
        </p>
        <p className="mt-1 flex items-center gap-2">
          <FileText className="size-4" /> Document orienté catalogue officiel (sans fiche descriptive détaillée des modèles).
        </p>
      </section>
    </div>
  );
}
