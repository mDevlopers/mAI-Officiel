"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type QuizzlyInventory = Record<string, number>;

export type QuizzlyFriend = {
  id: string;
  joinedAt: string;
  level: number;
  name: string;
  status: "online" | "idle" | "offline";
};

export type QuizzlyMessage = {
  at: string;
  from: string;
  id: string;
  text: string;
};

export type QuizzlyState = {
  avatarDataUrl: string | null;
  bio: string;
  chatMessages: QuizzlyMessage[];
  diamonds: number;
  emoji: string;
  friends: QuizzlyFriend[];
  inventory: QuizzlyInventory;
  lastClaimDay: string;
  level: number;
  pseudo: string;
  stars: number;
  streak: number;
  xp: number;
};

const STORAGE_KEY = "mai.quizzly.state.v2";

const defaultState: QuizzlyState = {
  avatarDataUrl: null,
  bio: "Prêt(e) à apprendre en m'amusant 🎯",
  chatMessages: [
    {
      at: new Date().toISOString(),
      from: "Coach Quizzly",
      id: "welcome",
      text: "Bienvenue ! Invite des amis et lance un défi quiz.",
    },
  ],
  diamonds: 150,
  emoji: "🧠",
  friends: [],
  inventory: {},
  lastClaimDay: "",
  level: 1,
  pseudo: "Player",
  stars: 3,
  streak: 0,
  xp: 0,
};

function parseState(value: string | null): QuizzlyState {
  if (!value) return defaultState;

  try {
    const parsed = JSON.parse(value) as Partial<QuizzlyState>;
    return {
      ...defaultState,
      ...parsed,
      chatMessages: Array.isArray(parsed.chatMessages) ? parsed.chatMessages : defaultState.chatMessages,
      friends: Array.isArray(parsed.friends) ? parsed.friends : [],
      inventory: parsed.inventory && typeof parsed.inventory === "object" ? parsed.inventory : {},
    };
  } catch {
    return defaultState;
  }
}

export function useQuizzlyState() {
  const [state, setState] = useState<QuizzlyState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const next = parseState(window.localStorage.getItem(STORAGE_KEY));
    setState(next);
    setIsHydrated(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setState(parseState(event.newValue));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateState = useCallback((updater: (previous: QuizzlyState) => QuizzlyState) => {
    setState((previous) => {
      const next = updater(previous);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setPartial = useCallback((patch: Partial<QuizzlyState>) => {
    updateState((previous) => ({ ...previous, ...patch }));
  }, [updateState]);

  const totalOwnedItems = useMemo(
    () => Object.values(state.inventory).reduce((sum, count) => sum + count, 0),
    [state.inventory]
  );

  return {
    isHydrated,
    setPartial,
    setState: updateState,
    state,
    totalOwnedItems,
  };
}
