import { Copyright, Cpu, FileText, Info, Layers } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4 py-8 mb-4 border-b border-border/50">
        <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
          <Info className="size-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">À Propos de mAI</h1>
        <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-muted-foreground">
            Version
          </span>
          <span className="text-sm font-bold bg-background px-2 py-0.5 rounded-full border border-border shadow-sm">
            v0.1.2
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Documentation */}
        <div className="flex flex-col space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="size-6 text-primary/80" />
            <h2 className="text-2xl font-semibold">Documentation Système</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            mAI (mon Assistant Intelligent) est une plateforme conversationnelle
            avancée conçue pour faciliter l'interaction avec divers modèles
            d'intelligence artificielle.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            La version{" "}
            <strong className="text-foreground font-medium">0.1.2</strong>{" "}
            introduit de nouvelles fonctionnalités d'expertise traductologique,
            avec le support de plus de 100 langues, ainsi que des outils
            intégrés d'analyse lexicale et de suggestions de synonymes.
          </p>
        </div>

        {/* Technical Specs */}
        <div className="flex flex-col space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <Cpu className="size-6 text-primary/80" />
            <h2 className="text-2xl font-semibold">Descriptifs Techniques</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <Layers className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <strong className="block text-foreground text-sm">
                  Architecture
                </strong>
                <span className="text-sm text-muted-foreground">
                  Next.js App Router (React Server Components)
                </span>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <Layers className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <strong className="block text-foreground text-sm">
                  Intégration Modèles
                </strong>
                <span className="text-sm text-muted-foreground">
                  Vercel AI SDK avec support multi-fournisseurs (OpenAI,
                  Anthropic, Mistral, Llama, etc.)
                </span>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <Layers className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <strong className="block text-foreground text-sm">
                  Base de données
                </strong>
                <span className="text-sm text-muted-foreground">
                  Neon Serverless Postgres via Drizzle ORM
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer / Copyright */}
      <div className="mt-12 pt-8 border-t border-border/50 flex flex-col items-center justify-center space-y-2 pb-8">
        <div className="flex items-center space-x-2 text-muted-foreground font-medium">
          <Copyright className="size-4" />
          <span>2026 All rights reserved</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">mAI</span>
          <span>|</span>
          <span>Official AI App</span>
        </div>
      </div>
    </div>
  );
}
