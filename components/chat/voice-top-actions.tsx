"use client";

import { AudioLines, Captions, Ghost } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
  stop: () => void;
};

type VoiceSettings = {
  captionsEnabled: boolean;
  interfaceMode: "liquid" | "minimal";
  pitch: number;
  rate: number;
  voiceURI: string;
};

const VOICE_SETTINGS_STORAGE_KEY = "mai.voice.settings.v1";
const GHOST_MODE_STORAGE_KEY = "mai.ghost-mode";

const defaultVoiceSettings: VoiceSettings = {
  captionsEnabled: true,
  interfaceMode: "liquid",
  pitch: 1,
  rate: 1,
  voiceURI: "",
};

function parseVoiceSettings(): VoiceSettings {
  if (typeof window === "undefined") {
    return defaultVoiceSettings;
  }

  try {
    const raw = window.localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return defaultVoiceSettings;
    }
    const parsed = JSON.parse(raw) as Partial<VoiceSettings>;
    return {
      captionsEnabled: parsed.captionsEnabled ?? true,
      interfaceMode: parsed.interfaceMode === "minimal" ? "minimal" : "liquid",
      pitch: Math.min(2, Math.max(0.5, Number(parsed.pitch ?? 1))),
      rate: Math.min(2, Math.max(0.6, Number(parsed.rate ?? 1))),
      voiceURI: typeof parsed.voiceURI === "string" ? parsed.voiceURI : "",
    };
  } catch {
    return defaultVoiceSettings;
  }
}

function launchSound() {
  if (typeof window === "undefined") {
    return;
  }

  const context = new window.AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    880,
    context.currentTime + 0.16
  );

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.09, context.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.21);
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor })
      .SpeechRecognition ||
    // webkit fallback pour Safari/iOS.
    (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor })
      .webkitSpeechRecognition ||
    null
  );
}

export function VoiceTopActions({
  chatId,
  messages,
}: {
  chatId: string;
  messages: ChatMessage[];
}) {
  const { language } = useLanguage();
  const [isGhostModeEnabled, setIsGhostModeEnabled] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [voiceSettings, setVoiceSettings] =
    useState<VoiceSettings>(defaultVoiceSettings);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionConstructor> | null>(null);
  const spokenAssistantIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const syncGhostState = () => {
      setIsGhostModeEnabled(
        window.localStorage.getItem(GHOST_MODE_STORAGE_KEY) === "true"
      );
    };

    const syncVoiceSettings = () => {
      setVoiceSettings(parseVoiceSettings());
    };

    syncGhostState();
    syncVoiceSettings();
    window.addEventListener("storage", syncGhostState);
    window.addEventListener("focus", syncGhostState);
    window.addEventListener("mai:voice-settings-updated", syncVoiceSettings);

    return () => {
      window.removeEventListener("storage", syncGhostState);
      window.removeEventListener("focus", syncGhostState);
      window.removeEventListener("mai:voice-settings-updated", syncVoiceSettings);
    };
  }, []);

  useEffect(() => {
    if (!voiceOpen) {
      return;
    }

    const lastAssistantMessage = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");

    if (!lastAssistantMessage?.id) {
      return;
    }

    if (spokenAssistantIdsRef.current.has(lastAssistantMessage.id)) {
      return;
    }

    const text = lastAssistantMessage.parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();

    if (!text || typeof window === "undefined") {
      return;
    }

    spokenAssistantIdsRef.current.add(lastAssistantMessage.id);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;

    const selectedVoice = window
      .speechSynthesis
      .getVoices()
      .find((voice) => voice.voiceURI === voiceSettings.voiceURI);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    if (voiceSettings.captionsEnabled) {
      setSubtitle(text);
      window.dispatchEvent(
        new CustomEvent("mai:voice-caption", {
          detail: { chatId, text },
        })
      );
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [chatId, messages, voiceOpen, voiceSettings]);

  const voiceBadge = useMemo(
    () => (voiceSettings.interfaceMode === "liquid" ? "liquid-glass" : ""),
    [voiceSettings.interfaceMode]
  );

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const startRecognition = () => {
    const SpeechRecognitionApi = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionApi) {
      setSubtitle("Web Speech API n'est pas disponible sur ce navigateur.");
      return;
    }

    if (!voiceOpen) {
      setVoiceOpen(true);
    }

    launchSound();
    const recognition = new SpeechRecognitionApi();
    recognition.lang = language === "en" ? "en-US" : language === "es" ? "es-ES" : "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: {
      resultIndex: number;
      results: ArrayLike<ArrayLike<{ transcript: string }>>;
    }) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        finalText += event.results[i]?.[0]?.transcript ?? "";
      }
      setTranscript(finalText.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
      setSubtitle("Micro indisponible ou permission refusée.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="pointer-events-none fixed top-3 right-3 z-40 flex items-start gap-2">
      <div className="pointer-events-auto inline-flex items-center gap-2">
        <button
          className={cn(
            "liquid-glass inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] shadow-[var(--shadow-float)] transition",
            isGhostModeEnabled
              ? "border-purple-500/40 bg-purple-500/20 text-purple-100"
              : "border-border/40 bg-card/70 text-muted-foreground hover:border-border/70"
          )}
          onClick={() => {
            const nextValue = !isGhostModeEnabled;
            setIsGhostModeEnabled(nextValue);
            localStorage.setItem(GHOST_MODE_STORAGE_KEY, String(nextValue));
          }}
          type="button"
        >
          <Ghost className="size-3.5" />
          {isGhostModeEnabled ? t("ghostModeActive", language) : t("ghostMode", language)}
        </button>

        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] shadow-[var(--shadow-float)] transition",
            voiceBadge,
            voiceOpen
              ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-50"
              : "border-border/40 bg-card/70 text-muted-foreground hover:border-border/70"
          )}
          onClick={() => {
            const next = !voiceOpen;
            setVoiceOpen(next);
            if (!next) {
              stopRecognition();
              window.speechSynthesis.cancel();
            } else {
              launchSound();
            }
          }}
          type="button"
        >
          <AudioLines className="size-3.5" />
          {t("voiceMode", language)}
        </button>
      </div>

      {voiceOpen && (
        <div
          className={cn(
            "pointer-events-auto mt-11 w-[min(92vw,420px)] rounded-2xl border border-border/50 bg-card/80 p-4 shadow-[var(--shadow-float)] backdrop-blur-2xl",
            voiceBadge
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">{t("voiceModeLabel", language)}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Captions className="size-3.5" />
              {t("voiceCaptions", language)} {voiceSettings.captionsEnabled ? "ON" : "OFF"}
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <button
              className="rounded-xl border border-border/60 bg-background/70 px-3 py-1.5 text-xs"
              onClick={() => {
                if (isListening) {
                  stopRecognition();
                } else {
                  startRecognition();
                }
              }}
              type="button"
            >
              {isListening ? t("voiceStop", language) : t("voiceStart", language)}
            </button>
            {isListening ? (
              <span className="text-xs text-cyan-300">{t("voiceListening", language)}</span>
            ) : null}
          </div>

          <div className="rounded-xl border border-border/50 bg-background/60 p-3">
            <p className="mb-1 text-xs text-muted-foreground">{t("voiceTranscript", language)}</p>
            <p className="min-h-12 text-sm">{transcript || "…"}</p>
          </div>

          {voiceSettings.captionsEnabled && subtitle ? (
            <div className="mt-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-2 text-xs text-cyan-100">
              {subtitle}
            </div>
          ) : null}

          <button
            className="mt-3 rounded-xl border border-border/60 bg-background/70 px-3 py-1.5 text-xs"
            disabled={!transcript}
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("mai:voice-submit", {
                  detail: {
                    chatId,
                    text: transcript,
                  },
                })
              );
              setTranscript("");
            }}
            type="button"
          >
            {t("voiceSend", language)}
          </button>
        </div>
      )}
    </div>
  );
}
