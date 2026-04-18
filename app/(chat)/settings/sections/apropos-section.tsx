import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AproposSectionProps = {
  className?: string;
  interfaceLanguage: string;
  onLanguageChange: (value: string) => void;
};

const DISCORD_OAUTH_URL =
  "https://discord.com/oauth2/authorize?client_id=1494660523688591510&permissions=8&integration_type=0&scope=bot+applications.commands";

export function AproposSection({
  className,
  interfaceLanguage,
  onLanguageChange,
}: AproposSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
        className
      )}
      id="apropos"
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <MessageCircle className="size-5" />
        Discord & Support
      </h2>
      <div className="mt-4 rounded-xl border border-border/60 bg-background/60 p-3">
        <label className="text-sm font-medium" htmlFor="language-selector">
          Langue
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Langue d&apos;interface par défaut: Français.
        </p>
        <select
          className="mt-2 w-full rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm"
          id="language-selector"
          onChange={(event) => onLanguageChange(event.target.value)}
          value={interfaceLanguage}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <a
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
          href={DISCORD_OAUTH_URL}
          rel="noreferrer"
          target="_blank"
        >
          <Image alt="Discord" className="size-5" height={20} src="/icons/discord.svg" width={20} />
          Discuter avec mAI dans Discord
        </a>
        <a
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
          href="https://discord.gg/fV7zwdGPpY"
          rel="noreferrer"
          target="_blank"
        >
          <Image alt="Discord" className="size-5" height={20} src="/icons/discord.svg" width={20} />
          Rejoindre le serveur Discord
        </a>
        <button
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-sky-400/40 bg-slate-200/70 px-3 py-2 text-sm font-medium text-sky-400 opacity-80"
          title="Bientôt..."
          type="button"
        >
          <Image
            alt="Telegram"
            className="size-5 opacity-60"
            height={20}
            src="/icons/telegram.svg"
            width={20}
          />
          Discuter avec mAI dans Telegram
        </button>
      </div>
    </section>
  );
}
