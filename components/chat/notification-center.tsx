"use client";

import { Bell, CheckCheck, Circle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  clearNotifications,
  type AppNotification,
  getNotificationHistory,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

function levelBadge(level: AppNotification["level"]) {
  if (level === "error") return "bg-rose-500/15 text-rose-700";
  if (level === "warning") return "bg-amber-500/15 text-amber-700";
  if (level === "success") return "bg-emerald-500/15 text-emerald-700";
  return "bg-sky-500/15 text-sky-700";
}

export function NotificationCenter() {
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    setItems(getNotificationHistory());
    return subscribeNotifications(() => {
      setItems(getNotificationHistory());
    });
  }, []);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  return (
    <div className="liquid-panel mx-2 mt-2 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/20 p-2 group-data-[collapsible=icon]:hidden">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1 text-xs font-semibold text-sidebar-foreground/90">
          <Bell className="size-3.5" />
          Notifications
          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
            {unreadCount}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <Button
            className="h-6 px-2 text-[10px]"
            onClick={() => markAllNotificationsRead(true)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <CheckCheck className="size-3" />
          </Button>
          <Button
            className="h-6 px-2 text-[10px]"
            onClick={clearNotifications}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
      <div className="max-h-52 space-y-1 overflow-auto pr-1">
        {items.length === 0 ? (
          <p className="text-[11px] text-sidebar-foreground/60">
            Aucune notification.
          </p>
        ) : (
          items.map((item) => (
            <button
              className={cn(
                "w-full rounded-lg border px-2 py-1.5 text-left",
                item.read
                  ? "border-sidebar-border/40 bg-sidebar/20 opacity-75"
                  : "border-sidebar-border/70 bg-sidebar/50"
              )}
              key={item.id}
              onClick={() => markNotificationRead(item.id, !item.read)}
              type="button"
            >
              <p className="flex items-center gap-1 text-[11px] font-medium text-sidebar-foreground">
                <Circle className={cn("size-2.5", !item.read && "fill-current")} />
                {item.title}
                <span className={cn("rounded px-1", levelBadge(item.level))}>
                  {item.level}
                </span>
              </p>
              <p className="line-clamp-2 text-[10px] text-sidebar-foreground/70">
                {item.message}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
