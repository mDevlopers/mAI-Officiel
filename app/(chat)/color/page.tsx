import { Clock3, Sparkles } from "lucide-react";

export default function ColorPage() {
  return (
    <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-center p-4 md:p-8">
      <section className="w-full rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 text-primary backdrop-blur-md">
          <Sparkles className="size-7" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Color</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Cette extension est en <span className="font-semibold">accès anticipé</span>.
          L&apos;équipe finalise l&apos;expérience de génération de palettes avant ouverture
          générale.
        </p>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur-md">
          <Clock3 className="size-4" />
          Ouverture progressive prochainement
        </div>
      </section>
    </div>
  );
}
