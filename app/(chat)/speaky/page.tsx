"use client";

import {
  Download,
  LibraryBig,
  Loader2,
  Pause,
  Play,
  Sparkles,
  Square,
  Waves,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type VoiceGender = "male" | "female";

type SpeakyResponse = {
  audioBase64: string;
  contentType: string;
  durationEstimateSec: number;
  provider: string;
};

function generateWaveBars(seed = 24) {
  return Array.from({ length: seed }, (_, index) => index);
}

export default function SpeakyPage() {
  const [text, setText] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [useCloudVoice, setUseCloudVoice] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const refreshVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
    };
  }, []);

  const browserVoices = useMemo(() => {
    return availableVoices.filter((voice) => {
      const voiceName = voice.name.toLowerCase();
      return voiceGender === "female"
        ? /(female|woman|femme|sophie|claire|celine|marie)/i.test(voiceName)
        : /(male|man|homme|thomas|daniel|paul|henri)/i.test(voiceName);
    });
  }, [availableVoices, voiceGender]);

  const bars = useMemo(() => generateWaveBars(), []);
  const cloudTextLength = text.trim().length;

  const playBrowserSpeech = () => {
    if (typeof window === "undefined" || !text.trim()) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (browserVoices[0]) {
      utterance.voice = browserVoices[0];
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const generateCloudAudio = async () => {
    if (!text.trim()) {
      toast.error("Ajoutez un texte avant de générer l'audio.");
      return;
    }

    if (cloudTextLength > 220) {
      toast.error("Mode cloud limité à 220 caractères par génération.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/speaky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language: "fr",
        }),
      });

      const payload = (await response.json()) as SpeakyResponse & { error?: string };
      if (!response.ok || !payload.audioBase64) {
        throw new Error(payload.error ?? "Génération audio impossible");
      }

      const bytes = Uint8Array.from(atob(payload.audioBase64), (char) =>
        char.charCodeAt(0)
      );
      const blob = new Blob([bytes], { type: payload.contentType || "audio/mpeg" });
      const nextUrl = URL.createObjectURL(blob);

      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
      currentAudioUrlRef.current = nextUrl;

      setAudioUrl(nextUrl);
      setEstimatedDuration(payload.durationEstimateSec);
      toast.success("Audio généré avec succès (sans clé API). ");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de génération audio");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) {
      toast.error("Aucun audio à télécharger.");
      return;
    }

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `speaky-${Date.now()}.mp3`;
    document.body.append(link);
    link.click();
    link.remove();
  };

  const saveToLibrary = async () => {
    if (!audioUrl) {
      toast.error("Générez d'abord un audio.");
      return;
    }

    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const file = new File([blob], `speaky-${Date.now()}.mp3`, {
      type: "audio/mpeg",
    });

    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const payload = (await uploadResponse.json()) as { error?: string };
      toast.error(payload.error ?? "Échec de l'ajout à la bibliothèque");
      return;
    }

    toast.success("Audio ajouté à la bibliothèque.");
  };

  return (
    <div className="liquid-glass flex h-full flex-col gap-4 overflow-auto p-4 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Speaky</h1>
          <p className="text-sm text-muted-foreground">
            Studio vocal Liquid Glass: animation, export MP3, ajout bibliothèque, sans OpenAI key.
          </p>
        </div>
        <div className="liquid-panel rounded-xl px-3 py-2 text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-2">
            <Sparkles className="size-3.5" />
            Mode {useCloudVoice ? "Cloud public" : "Web Speech local"}
          </p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <section className="liquid-panel space-y-3 rounded-2xl p-4">
          <textarea
            className="min-h-[280px] w-full rounded-xl border border-border/40 bg-background/70 p-3 text-sm"
            onChange={(event) => setText(event.target.value)}
            placeholder="Collez le texte à transformer en audio..."
            value={text}
          />

          {useCloudVoice && (
            <p className="text-[11px] text-muted-foreground">
              Limite cloud: 220 caractères par génération ({cloudTextLength}/220).
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs">
              Vitesse ({rate.toFixed(1)}x)
              <input
                className="mt-1 w-full"
                max={1.8}
                min={0.6}
                onChange={(event) => setRate(Number(event.target.value))}
                step={0.1}
                type="range"
                value={rate}
              />
            </label>

            <label className="text-xs">
              Tonalité ({pitch.toFixed(1)})
              <input
                className="mt-1 w-full"
                max={1.8}
                min={0.4}
                onChange={(event) => setPitch(Number(event.target.value))}
                step={0.1}
                type="range"
                value={pitch}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-lg border px-3 py-1 text-xs ${useCloudVoice ? "bg-black text-white" : "text-muted-foreground"}`}
              onClick={() => setUseCloudVoice(true)}
              type="button"
            >
              Cloud public
            </button>
            <button
              className={`rounded-lg border px-3 py-1 text-xs ${!useCloudVoice ? "bg-black text-white" : "text-muted-foreground"}`}
              onClick={() => setUseCloudVoice(false)}
              type="button"
            >
              Web Speech local
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              ["female", "Voix femme"],
              ["male", "Voix homme"],
            ] as const).map(([value, label]) => (
              <button
                className={`rounded-lg border px-3 py-1 text-xs ${
                  voiceGender === value ? "bg-black text-white" : "text-muted-foreground"
                }`}
                key={value}
                onClick={() => setVoiceGender(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {!useCloudVoice && (
            <p className="text-xs text-muted-foreground">
              Voix locale détectée : {browserVoices[0]?.name ?? "par défaut navigateur"}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-xs text-white"
              onClick={useCloudVoice ? generateCloudAudio : playBrowserSpeech}
              type="button"
            >
              {isGenerating ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
              {useCloudVoice ? "Générer audio" : "Lire"}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
              onClick={() => {
                window.speechSynthesis.pause();
                audioRef.current?.pause();
                setIsPlaying(false);
              }}
              type="button"
            >
              <Pause className="size-3.5" />
              Pause
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
              onClick={() => {
                window.speechSynthesis.cancel();
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                setIsPlaying(false);
              }}
              type="button"
            >
              <Square className="size-3.5" />
              Stop
            </button>
          </div>
        </section>

        <aside className="liquid-panel rounded-2xl p-4 text-xs text-muted-foreground">
          <p className="mb-2 inline-flex items-center gap-2 font-medium text-foreground">
            <Waves className="size-4" />
            Animation audio
          </p>

          <div className="mb-4 flex h-16 items-end gap-1 rounded-xl border border-border/40 bg-background/60 p-2">
            {bars.map((bar) => (
              <span
                className={`w-1.5 rounded-full bg-cyan-500/70 ${isPlaying || isGenerating ? "animate-pulse" : "opacity-40"}`}
                key={bar}
                style={{
                  height: `${25 + ((bar * 17) % 65)}%`,
                  animationDelay: `${bar * 45}ms`,
                }}
              />
            ))}
          </div>

          <p>{isGenerating ? "Génération en cours..." : isPlaying ? "Lecture en cours" : "Prêt"}</p>
          {estimatedDuration ? (
            <p className="mt-1 text-[11px]">Durée estimée : ~{estimatedDuration}s</p>
          ) : null}

          {audioUrl ? (
            <>
              <audio
                className="mt-3 w-full"
                controls
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                ref={audioRef}
                src={audioUrl}
              />

              <div className="mt-3 grid gap-2">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2"
                  onClick={handleDownload}
                  type="button"
                >
                  <Download className="size-3.5" />
                  Télécharger MP3
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2"
                  onClick={saveToLibrary}
                  type="button"
                >
                  <LibraryBig className="size-3.5" />
                  Ajouter à la bibliothèque
                </button>
              </div>
            </>
          ) : (
            <p className="mt-3 text-[11px]">Générez un audio pour activer l'aperçu et le téléchargement.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
