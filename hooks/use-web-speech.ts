"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export type VoiceSettings = {
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
};

export type WebSpeechState = {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  availableVoices: SpeechSynthesisVoice[];
  error: string | null;
};

export function useWebSpeech() {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mountedRef = useRef(false);
  const voicesLoadedRef = useRef(false);

  const [state, setState] = useState<WebSpeechState>({
    isSupported: false,
    isSpeaking: false,
    isPaused: false,
    voices: [],
    availableVoices: [],
    error: null,
  });

  useEffect(() => {
    mountedRef.current = true;
    
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    synthRef.current = window.speechSynthesis;
    setState((prev) => mountedRef.current ? ({ ...prev, isSupported: true }) : prev);

    const loadVoices = () => {
      if (!mountedRef.current || !synthRef.current || voicesLoadedRef.current) return;
      
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        voicesLoadedRef.current = true;
        setState((prev) => ({
          ...prev,
          voices,
          availableVoices: voices.sort((a, b) =>
            a.localService === b.localService ? 0 : a.localService ? -1 : 1
          ),
        }));
      }
    };

    loadVoices();
    synthRef.current.addEventListener('voiceschanged', loadVoices, { passive: true });

    return () => {
      mountedRef.current = false;
      if (synthRef.current) {
        synthRef.current.cancel();
        synthRef.current.removeEventListener('voiceschanged', loadVoices);
      }
      if (utteranceRef.current) {
        utteranceRef.current.onstart = null;
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
        utteranceRef.current.onpause = null;
        utteranceRef.current.onresume = null;
        utteranceRef.current = null;
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, settings: Partial<VoiceSettings> = {}) => {
      if (!synthRef.current || !text.trim() || !mountedRef.current) return;

      try {
        synthRef.current.cancel();
        if (utteranceRef.current) {
          utteranceRef.current.onstart = null;
          utteranceRef.current.onend = null;
          utteranceRef.current.onerror = null;
          utteranceRef.current.onpause = null;
          utteranceRef.current.onresume = null;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.5, Math.min(2, settings.rate ?? 1));
        utterance.pitch = Math.max(0.5, Math.min(2, settings.pitch ?? 1));
        utterance.volume = Math.max(0.1, Math.min(1, settings.volume ?? 1));
        
        if (settings.voice) {
          utterance.voice = settings.voice;
        }

        utterance.onstart = () => mountedRef.current && setState((prev) => ({ ...prev, isSpeaking: true, isPaused: false, error: null }));
        utterance.onend = () => mountedRef.current && setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }));
        utterance.onerror = (event) => mountedRef.current && setState((prev) => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
          error: `Erreur synthèse vocale: ${event.error}`,
        }));
        utterance.onpause = () => mountedRef.current && setState((prev) => ({ ...prev, isPaused: true }));
        utterance.onresume = () => mountedRef.current && setState((prev) => ({ ...prev, isPaused: false }));

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
      } catch (error) {
        mountedRef.current && setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Erreur inconnue",
        }));
      }
    },
    []
  );

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      mountedRef.current && setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }));
    }
  }, []);

  const pause = useCallback(() => {
    if (synthRef.current && state.isSpeaking) {
      synthRef.current.pause();
    }
  }, [state.isSpeaking]);

  const resume = useCallback(() => {
    if (synthRef.current && state.isPaused) {
      synthRef.current.resume();
    }
  }, [state.isPaused]);

  const getVoicesByLanguage = useCallback(
    (langCode: string) => {
      const lowerCode = langCode.toLowerCase();
      return state.voices.filter((v) => v.lang.toLowerCase().startsWith(lowerCode));
    },
    [state.voices]
  );

  return {
    state,
    speak,
    stop,
    pause,
    resume,
    getVoicesByLanguage,
  };
}
