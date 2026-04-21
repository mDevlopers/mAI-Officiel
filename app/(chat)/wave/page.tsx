"use client";

import {
  Copy,
  Download,
  Heart,
  Library,
  Music2,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { canConsumeUsage, consumeUsage, getUsageCount } from "@/lib/usage-limits";

type WaveModel = "V5_5" | "V5" | "V4_5PLUS" | "V4_5ALL" | "V4_5" | "V4";
type Gender = "m" | "f" | "n";
type ViewMode = "create" | "history";

type WaveTrack = {
  id: string;
  createdAt: string;
  title: string;
  prompt: string;
  style: string;
  model: WaveModel;
  instrumental: boolean;
  apiResponse: unknown;
  favorite: boolean;
  pinned: boolean;
  inLibrary: boolean;
  audioUrl?: string;
};

const HISTORY_KEY = "mai.wave.history.v2";
const LEGACY_HISTORY_KEY = "mai.wave.history.v1";
const LIBRARY_KEY = "mai.library.assets";
const WAVE_DRAFTS_KEY = "mai.wave.prefill.prompts.v1";

const modelDescriptions: Record<WaveModel, string> = {
  V5_5:
    "Libérez votre voix : des modèles personnalisés adaptés à vos goûts uniques.",
  V5: "Expression musicale supérieure, génération plus rapide.",
  V4_5PLUS:
    "V4.5+ est un son plus riche, de nouvelles façons de créer, max 8 minutes.",
  V4_5ALL:
    "V4.5 All - tout est une meilleure structure de chanson, max 8 min.",
  V4_5:
    "Mélange de genres supérieur avec des prompts plus intelligents et une production plus rapide, jusqu’à 8 minutes.",
  V4: "Meilleure qualité audio avec une structure de chanson raffinée, jusqu’à 4 minutes.",
};

function parseJsonSafe<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function WavePage() {
  const { currentPlanDefinition } = useSubscriptionPlan();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [viewMode, setViewMode] = useState<ViewMode>("create");
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("");
  const [negativeTags, setNegativeTags] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [model, setModel] = useState<WaveModel>("V4_5ALL");
  const [instrumental, setInstrumental] = useState(true);
  const [vocalGender, setVocalGender] = useState<Gender>("n");
  const [styleWeight, setStyleWeight] = useState(0.65);
  const [weirdnessConstraint, setWeirdnessConstraint] = useState(0.65);
  const [audioWeight, setAudioWeight] = useState(0.65);
  const [isLoading, setIsLoading] = useState(false);
  const [lyricsPrompt, setLyricsPrompt] = useState("");
  const [generatedLyrics, setGeneratedLyrics] = useState("");
  const [history, setHistory] = useState<WaveTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const weeklyLimit = currentPlanDefinition.limits.musicGenerationsPerWeek;
  const [weeklyUsed, setWeeklyUsed] = useState(0);

  useEffect(() => {
    const refresh = () => setWeeklyUsed(getUsageCount("wave", "week"));
    refresh();
    window.addEventListener("mai:usage-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("mai:usage-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const current = parseJsonSafe<WaveTrack[]>(
      localStorage.getItem(HISTORY_KEY),
      []
    );
    if (current.length > 0) {
      setHistory(current);
      return;
    }

    const legacy = parseJsonSafe<WaveTrack[]>(
      localStorage.getItem(LEGACY_HISTORY_KEY),
      []
    );
    if (legacy.length > 0) {
      setHistory(legacy);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(legacy));
    }

    const drafts = parseJsonSafe<string[]>(localStorage.getItem(WAVE_DRAFTS_KEY), []);
    if (drafts[0]) {
      setPrompt(drafts[0]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const weeklyRemaining = Math.max(0, weeklyLimit - weeklyUsed);

  const sortedHistory = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return [...history]
      .filter((track) => {
        if (!showFavoritesOnly) {
          return true;
        }

        return track.favorite;
      })
      .filter((track) => {
        if (!normalizedQuery) {
          return true;
        }

        const haystack = `${track.title} ${track.prompt} ${track.style} ${track.model}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort(
        (a, b) =>
          Number(b.pinned) - Number(a.pinned) ||
          +new Date(b.createdAt) - +new Date(a.createdAt)
      );
  }, [history, searchQuery, showFavoritesOnly]);

  const extractAudioUrl = (payload: unknown): string | undefined => {
    if (!payload || typeof payload !== "object") {
      return undefined;
    }

    for (const value of Object.values(payload as Record<string, unknown>)) {
      if (typeof value === "string") {
        if (value.startsWith("http") && /(mp3|wav|ogg|m4a)/i.test(value)) {
          return value;
        }
      } else if (Array.isArray(value)) {
        for (const item of value) {
          const nested = extractAudioUrl(item);
          if (nested) {
            return nested;
          }
        }
      } else if (typeof value === "object" && value) {
        const nested = extractAudioUrl(value);
        if (nested) {
          return nested;
        }
      }
    }

    return undefined;
  };

  const updateTrack = (id: string, updater: (track: WaveTrack) => WaveTrack) => {
    setHistory((prev) => prev.map((track) => (track.id === id ? updater(track) : track)));
  };

  const handleGenerateLyrics = async () => {
    if (!lyricsPrompt.trim()) {
      toast.error("Ajoutez un brief pour générer les paroles.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/wave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lyrics",
          prompt: lyricsPrompt,
          style,
          mood: negativeTags,
          language: "français",
        }),
      });
      const payload = (await response.json()) as { error?: string; text?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Erreur lors de la génération des paroles.");
      }

      const text = payload.text ?? "";
      setGeneratedLyrics(text);
      toast.success("Paroles générées avec GPT-5.4 Nano.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lyrics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour générer de la musique.");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Le prompt musical est requis.");
      return;
    }

    if (!canConsumeUsage("wave", "week", weeklyLimit, 1)) {
      toast.error("Quota hebdomadaire atteint pour votre forfait.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/wave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          customMode: true,
          instrumental,
          model,
          callBackUrl: callbackUrl,
          prompt,
          style,
          title,
          negativeTags,
          vocalGender,
          styleWeight,
          weirdnessConstraint,
          audioWeight,
        }),
      });

      const payload = (await response.json()) as {
        data?: unknown;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Erreur de génération musicale.");
      }

      consumeUsage("wave", "week");
      setWeeklyUsed((prev) => prev + 1);

      const entry: WaveTrack = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        title: title.trim() || `Morceau du ${new Date().toLocaleString("fr-FR")}`,
        prompt,
        style,
        model,
        instrumental,
        apiResponse: payload.data,
        favorite: false,
        pinned: false,
        inLibrary: false,
        audioUrl: extractAudioUrl(payload.data),
      };

      setHistory((prev) => [entry, ...prev]);
      setViewMode("history");
      toast.success("Musique générée et ajoutée à votre historique Wave.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur Wave");
    } finally {
      setIsLoading(false);
    }
  };

  const addToLibrary = (track: WaveTrack) => {
    const current = parseJsonSafe<Array<Record<string, unknown>>>(
      localStorage.getItem(LIBRARY_KEY),
      []
    );

    if (current.some((item) => item.id === track.id)) {
      updateTrack(track.id, (value) => ({ ...value, inLibrary: true }));
      toast.success("Déjà présent dans la bibliothèque.");
      return;
    }

    current.unshift({
      id: track.id,
      name: track.title,
      type: "document",
      pinned: track.pinned,
      favorite: track.favorite,
      url: track.audioUrl ?? `data:text/plain,${encodeURIComponent(track.prompt)}`,
      createdAt: track.createdAt,
      source: "wave",
    });

    localStorage.setItem(LIBRARY_KEY, JSON.stringify(current));
    updateTrack(track.id, (value) => ({ ...value, inLibrary: true }));
    toast.success("Ajouté à la bibliothèque.");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast.success("Historique Wave vidé.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <header className="rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Music2 className="size-6 text-primary" /> Wave
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Générez des musiques avec SUNO, créez vos paroles, et gérez une vraie
          bibliothèque créative (favoris, épingles, renommage, téléchargement, historique).
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Crédits hebdomadaires Wave : {weeklyUsed}/{weeklyLimit} utilisés ({weeklyRemaining} restants)
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => setViewMode("create")}
            size="sm"
            variant={viewMode === "create" ? "default" : "outline"}
          >
            Créer
          </Button>
          <Button
            onClick={() => setViewMode("history")}
            size="sm"
            variant={viewMode === "history" ? "default" : "outline"}
          >
            Historique
          </Button>
        </div>
      </header>

      {viewMode === "create" ? (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <h2 className="text-lg font-semibold">Génération musicale</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                className="rounded-md border bg-background/70 p-2"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Titre du morceau"
                value={title}
              />

              <select
                className="rounded-md border bg-background/70 p-2"
                onChange={(event) => setModel(event.target.value as WaveModel)}
                value={model}
              >
                {(Object.keys(modelDescriptions) as WaveModel[]).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <input
                className="rounded-md border bg-background/70 p-2 md:col-span-2"
                onChange={(event) => setStyle(event.target.value)}
                placeholder="Style musical"
                value={style}
              />

              <textarea
                className="min-h-24 rounded-md border bg-background/70 p-2 md:col-span-2"
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Prompt musical détaillé"
                value={prompt}
              />

              <textarea
                className="min-h-20 rounded-md border bg-background/70 p-2 md:col-span-2"
                onChange={(event) => setNegativeTags(event.target.value)}
                placeholder="Tags à éviter (negative tags)"
                value={negativeTags}
              />

              <input
                className="rounded-md border bg-background/70 p-2 md:col-span-2"
                onChange={(event) => setCallbackUrl(event.target.value)}
                placeholder="Callback URL (optionnel)"
                value={callbackUrl}
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={instrumental}
                  onChange={(event) => setInstrumental(event.target.checked)}
                  type="checkbox"
                />
                Instrumental
              </label>

              <select
                className="rounded-md border bg-background/70 p-2"
                onChange={(event) => setVocalGender(event.target.value as Gender)}
                value={vocalGender}
              >
                <option value="n">Neutre</option>
                <option value="m">Voix masculine</option>
                <option value="f">Voix féminine</option>
              </select>

              <label className="text-xs">
                Poids du style : {styleWeight.toFixed(2)}
                <input
                  className="w-full"
                  max={1}
                  min={0}
                  onChange={(event) => setStyleWeight(Number(event.target.value))}
                  step={0.01}
                  type="range"
                  value={styleWeight}
                />
              </label>

              <label className="text-xs">
                Étrangeté : {weirdnessConstraint.toFixed(2)}
                <input
                  className="w-full"
                  max={1}
                  min={0}
                  onChange={(event) =>
                    setWeirdnessConstraint(Number(event.target.value))
                  }
                  step={0.01}
                  type="range"
                  value={weirdnessConstraint}
                />
              </label>

              <label className="text-xs md:col-span-2">
                Poids audio : {audioWeight.toFixed(2)}
                <input
                  className="w-full"
                  max={1}
                  min={0}
                  onChange={(event) => setAudioWeight(Number(event.target.value))}
                  step={0.01}
                  type="range"
                  value={audioWeight}
                />
              </label>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">{modelDescriptions[model]}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Persona appliquée automatiquement en arrière-plan.
            </p>

            <Button className="mt-4" disabled={isLoading} onClick={handleGenerateMusic}>
              <Sparkles className="mr-2 size-4" />
              {isLoading ? "Génération..." : "Générer la musique"}
            </Button>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <h2 className="text-lg font-semibold">Assistant de paroles</h2>
            <textarea
              className="mt-3 min-h-24 w-full rounded-md border bg-background/70 p-2"
              onChange={(event) => setLyricsPrompt(event.target.value)}
              placeholder="Sujet, émotion, structure..."
              value={lyricsPrompt}
            />
            <Button
              className="mt-3"
              disabled={isLoading}
              onClick={handleGenerateLyrics}
              variant="outline"
            >
              <WandSparkles className="mr-2 size-4" />
              Générer les paroles (GPT-5.4 Nano)
            </Button>
            <textarea
              className="mt-3 min-h-52 w-full rounded-md border bg-background/70 p-2"
              onChange={(event) => setGeneratedLyrics(event.target.value)}
              placeholder="Paroles générées"
              value={generatedLyrics}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  setPrompt((prev) => `${prev}\n\n${generatedLyrics}`.trim())
                }
                variant="ghost"
              >
                <Plus className="mr-2 size-4" />
                Ajouter au prompt musical
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLyrics);
                  toast.success("Paroles copiées.");
                }}
                variant="outline"
              >
                <Copy className="mr-2 size-4" /> Copier
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Historique Wave</h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowFavoritesOnly((prev) => !prev)} size="sm" variant="outline">
                <Heart className="mr-2 size-4" />
                {showFavoritesOnly ? "Tous" : "Favoris"}
              </Button>
              <Button onClick={clearHistory} size="sm" variant="outline">
                <Trash2 className="mr-2 size-4" /> Vider
              </Button>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
            <input
              className="w-full rounded-md border bg-background/70 py-2 pr-3 pl-8"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher dans l'historique..."
              value={searchQuery}
            />
          </div>

          <div className="mt-4 space-y-3">
            {sortedHistory.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">
                Aucune musique trouvée.
              </p>
            ) : (
              sortedHistory.map((track) => (
                <article
                  className="rounded-xl border border-border/50 bg-background/60 p-3"
                  key={track.id}
                >
                  <input
                    className="w-full rounded-md border border-transparent bg-transparent px-1 text-sm font-semibold hover:border-border/50"
                    onChange={(event) =>
                      updateTrack(track.id, (current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    value={track.title}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {track.model} • {new Date(track.createdAt).toLocaleString("fr-FR")}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm">{track.prompt}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        updateTrack(track.id, (current) => ({
                          ...current,
                          favorite: !current.favorite,
                        }))
                      }
                      size="sm"
                      variant="outline"
                    >
                      <Heart className="mr-1 size-4" />
                      {track.favorite ? "Retirer favori" : "Favori"}
                    </Button>

                    <Button
                      onClick={() =>
                        updateTrack(track.id, (current) => ({
                          ...current,
                          pinned: !current.pinned,
                        }))
                      }
                      size="sm"
                      variant="outline"
                    >
                      <Pin className="mr-1 size-4" />
                      {track.pinned ? "Désépingler" : "Épingler"}
                    </Button>

                    <Button onClick={() => addToLibrary(track)} size="sm" variant="outline">
                      <Library className="mr-1 size-4" />
                      {track.inLibrary ? "En bibliothèque" : "Ajouter à la bibliothèque"}
                    </Button>

                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(track.prompt);
                        toast.success("Prompt copié.");
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="mr-1 size-4" /> Copier prompt
                    </Button>

                    <Button
                      onClick={() => {
                        const duplicate = {
                          ...track,
                          id: crypto.randomUUID(),
                          createdAt: new Date().toISOString(),
                          title: `${track.title} (copie)`,
                        };
                        setHistory((prev) => [duplicate, ...prev]);
                        toast.success("Morceau dupliqué.");
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className="mr-1 size-4" /> Dupliquer
                    </Button>

                    <Button
                      onClick={() =>
                        setHistory((prev) => prev.filter((item) => item.id !== track.id))
                      }
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="mr-1 size-4" /> Supprimer
                    </Button>

                    {track.audioUrl ? (
                      <a download href={track.audioUrl} rel="noreferrer" target="_blank">
                        <Button size="sm" variant="outline">
                          <Download className="mr-1 size-4" /> Télécharger
                        </Button>
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
