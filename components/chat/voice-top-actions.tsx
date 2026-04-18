"use client";

import { Bell, Ghost } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type AppNotification,
  getNotificationHistory,
  subscribeNotifications,
} from "@/lib/notifications";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const GHOST_MODE_STORAGE_KEY = "mai.ghost-mode";
const GHOST_MODE_UPDATED_EVENT = "mai:ghost-mode-updated";

export function VoiceTopActions({
  chatId: _chatId,
  messages: _messages,
}: {
  chatId: string;
  messages: ChatMessage[];
}) {
  const [isGhostModeEnabled, setIsGhostModeEnabled] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncGhostState = () => {
      setIsGhostModeEnabled(
        window.localStorage.getItem(GHOST_MODE_STORAGE_KEY) === "true"
      );
    };

    syncGhostState();
    window.addEventListener("storage", syncGhostState);
    window.addEventListener("focus", syncGhostState);
    window.addEventListener(GHOST_MODE_UPDATED_EVENT, syncGhostState);

    return () => {
      window.removeEventListener("storage", syncGhostState);
      window.removeEventListener("focus", syncGhostState);
      window.removeEventListener(GHOST_MODE_UPDATED_EVENT, syncGhostState);
    };
  }, []);

  useEffect(() => {
    setNotifications(getNotificationHistory());
    return subscribeNotifications(() => setNotifications(getNotificationHistory()));
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  return (
    <div
      className="pointer-events-none fixed top-3 right-3 z-40 flex items-center gap-2"
      ref={containerRef}
    >
      <button
        aria-label="Mode Fantôme"
        className={cn(
          "pointer-events-auto liquid-glass inline-flex items-center justify-center rounded-full border p-2 text-[11px] shadow-[var(--shadow-float)] transition",
          isGhostModeEnabled
            ? "border-purple-500/40 bg-purple-500/20 text-purple-100"
            : "border-border/40 bg-card/70 text-muted-foreground hover:border-border/70"
        )}
        onClick={() => {
          const nextValue = !isGhostModeEnabled;
          setIsGhostModeEnabled(nextValue);
          localStorage.setItem(GHOST_MODE_STORAGE_KEY, String(nextValue));
          window.dispatchEvent(new Event(GHOST_MODE_UPDATED_EVENT));
        }}
        type="button"
      >
        <Ghost className="size-4" />
      </button>
      <button
        aria-expanded={isNotificationsOpen}
        aria-label="Notifications"
        className="pointer-events-auto relative liquid-glass inline-flex items-center justify-center rounded-full border border-border/40 bg-card/70 p-2 text-muted-foreground shadow-[var(--shadow-float)] transition hover:border-border/70"
        onClick={() => setIsNotificationsOpen((prev) => !prev)}
        type="button"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-4 rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">
            {Math.min(99, unreadCount)}
          </span>
        ) : null}
      </button>
      {isNotificationsOpen && (
        <div className="pointer-events-auto absolute top-11 right-0 w-72 rounded-xl border border-border/60 bg-card/90 p-3 text-xs shadow-[var(--shadow-float)] backdrop-blur-xl">
          <p className="font-medium">Notifications</p>
          <p className="mt-1 text-muted-foreground">
            {notifications[0]?.message ?? "Aucune notification pour le moment."}
          </p>
        </div>
      )}
    </div>
  );
}
