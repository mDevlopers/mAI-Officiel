"use client";

import {
  Bell,
  CalendarClock,
  Camera,
  Clock3,
  Database,
  Download,
  FileText,
  Gauge,
  KeyRound,
  ListPlus,
  Lock,
  Mail,
  MessageCircle,
  PencilLine,
  PlusCircle,
  Puzzle,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  TimerReset,
  Trash2,
  UserCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import {
  getTierRemaining,
  getTierUsage,
  type ModelTier,
} from "@/lib/ai/credits";
import { APP_VERSION } from "@/lib/app-version";
import { LANGUAGE_STORAGE_KEY, resolveLanguage, setLanguageInStorage } from "@/lib/i18n";
import {
  CHAT_TAGS_STORAGE_KEY,
  TAG_DEFINITIONS_STORAGE_KEY,
  TAG_PALETTE,
  type TagDefinition,
} from "@/lib/chat-preferences";
import { createNotification } from "@/lib/notifications";
import {
  defaultSecuritySettings,
  hashPinCode,
  parseSecuritySettings,
  SECURITY_LOCKED_FLAG_KEY,
  SECURITY_SETTINGS_STORAGE_KEY,
  type SecuritySettings,
} from "@/lib/security-settings";
import { planDefinitions } from "@/lib/subscription";
import { getNextResetDate, getUsageCount } from "@/lib/usage-limits";
import { cn } from "@/lib/utils";

const TASKS_STORAGE_KEY = "mai.settings.automated-tasks.v018";
const PROFILE_SETTINGS_STORAGE_KEY = "mai.profile.settings.v2";
const NOTIFICATIONS_SETTINGS_STORAGE_KEY = "mai.settings.notifications.v1";
const PARENTAL_SETTINGS_STORAGE_KEY = "mai.settings.parental.v1";
const POSITION_SETTINGS_STORAGE_KEY = "mai.settings.position.v1";
const TOKEN_USAGE_STORAGE_KEY = "mai.token-usage.v1";
const MAX_MEMORY_ENTRY_LENGTH = 500;
const ABSOLUTE_MAX_MEMORY_ENTRIES = 200;
const schedulerModels = [
  "openai/gpt-5.4",
  "openai/gpt-5.4-mini",
  "openai/gpt-5.4-nano",
  "openai/gpt-5.2",
  "openai/gpt-5.1",
  "openai/gpt-5",
  "openai/gpt-oss-120b",
  "azure/deepseek-v3.2",
  "azure/kimi-k2.5",
  "azure/mistral-large-3",
] as const;
const schedulerFrequencies = [
  "quotidienne",
  "hebdomadaire",
  "mensuelle",
  "ponctuelle",
] as const;

type ScheduledTask = {
  createdAt: string;
  frequency: (typeof schedulerFrequencies)[number];
  id: string;
  isEnabled: boolean;
  lastRunAt?: string;
  model: (typeof schedulerModels)[number];
  notes?: string;
  nextRunAt: string;
  title: string;
};

type CreditMetric = {
  key: string;
  limit: number;
  period: "hour" | "day" | "week" | "month";
  title: string;
  used: number;
};

type ProfileSettingsShape = {
  aiMemory: string;
  aiMemoryEntries?: string[];
  aiBehavior?: {
    concision: number;
    register: number;
    tone: number;
  };
  aiName: string;
  aiPersonality: string;
  avatarDataUrl?: string;
  avatarId: string;
  displayName: string;
  personalContext: string;
  profession: string;
  projectDescription: string;
  projectIconColor: string;
  projectTitle: string;
  stylisticDirectives: string;
};

type ReasoningPreference = "none" | "light" | "medium" | "high";

type PersistedMemoryEntry = {
  content: string;
  createdAt: string;
  id: string;
  type: "auto" | "manual";
};

type ExtensionKey = "projects" | "library" | "translation";
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type ParentalSettings = {
  advancedSettingsLocked: boolean;
  bedtimeMode: boolean;
  bedtimeWindowEndHour: number;
  bedtimeWindowStartHour: number;
  weekendBonusMinutes: number;
  dailyLimitMinutes: number;
  enabled: boolean;
  extensions: Record<ExtensionKey, boolean>;
  lockCodeHash: string;
  sessionUnlockedUntil: number;
  usageMinutes: number;
};

const defaultParentalSettings: ParentalSettings = {
  advancedSettingsLocked: true,
  bedtimeMode: false,
  bedtimeWindowEndHour: 7,
  bedtimeWindowStartHour: 21,
  weekendBonusMinutes: 20,
  dailyLimitMinutes: 90,
  enabled: false,
  extensions: {
    library: true,
    projects: true,
    translation: true,
  },
  lockCodeHash: "",
  sessionUnlockedUntil: 0,
  usageMinutes: 0,
};

const extensionLabels: Record<ExtensionKey, string> = {
  library: "Bibliothèque",
  projects: "Projets",
  translation: "Traduction",
};

function hashLockCode(code: string): string {
  let hash = 5381;
  for (let index = 0; index < code.length; index += 1) {
    hash = (hash * 33) ^ code.charCodeAt(index);
  }
  return (hash >>> 0).toString(16);
}

const defaultProfileSettings: ProfileSettingsShape = {
  aiMemory: "",
  aiName: "mAI",
  aiPersonality: "",
  avatarDataUrl: undefined,
  avatarId: "aurora",
  displayName: "",
  personalContext: "",
  profession: "",
  projectDescription: "",
  projectIconColor: "#60a5fa",
  projectTitle: "",
  stylisticDirectives: "",
};

const reasoningLevelByPreference: Record<
  Exclude<ReasoningPreference, "none">,
  "light" | "moderate" | "deep"
> = {
  light: "light",
  medium: "moderate",
  high: "deep",
};

function resolveReasoningPreferenceFromStorage(
  enabled: string | null,
  level: string | null
): ReasoningPreference {
  if (enabled !== "true") {
    return "none";
  }

  // Compat: "very-deep" hérité doit rester mappé au niveau le plus proche.
  if (level === "deep" || level === "very-deep") {
    return "high";
  }
  if (level === "moderate") {
    return "medium";
  }
  return "light";
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function isNowWithinBedtimeWindow(startHour: number, endHour: number): boolean {
  const currentHour = new Date().getHours();
  if (startHour === endHour) {
    return true;
  }
  if (startHour < endHour) {
    return currentHour >= startHour && currentHour < endHour;
  }
  return currentHour >= startHour || currentHour < endHour;
}

function getCreditBadgeColor(remainingRatio: number): string {
  if (remainingRatio > 0.4) {
    return "text-emerald-600 dark:text-emerald-400";
  }

  if (remainingRatio > 0.3) {
    return "text-orange-500 dark:text-orange-300";
  }

  if (remainingRatio > 0.15) {
    return "text-rose-500 dark:text-rose-300";
  }

  return "text-rose-700 dark:text-rose-200";
}

function formatDateTimeLocalInput(now = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function getMemoryEntriesLimitForPlan(planKey: string): number {
  if (planKey === "free") {
    return 50;
  }
  if (planKey === "plus") {
    return 75;
  }
  if (planKey === "pro") {
    return 100;
  }
  return 200;
}

function sanitizeMemoryEntries(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((value): value is string => typeof value === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => entry.slice(0, MAX_MEMORY_ENTRY_LENGTH))
    .slice(0, ABSOLUTE_MAX_MEMORY_ENTRIES);
}

function sanitizeScheduledTasks(input: unknown): ScheduledTask[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((task): task is Partial<ScheduledTask> => {
      if (!task || typeof task !== "object") {
        return false;
      }

      return true;
    })
    .filter(
      (task): task is ScheduledTask =>
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.createdAt === "string" &&
        typeof task.nextRunAt === "string" &&
        schedulerFrequencies.includes(
          task.frequency as ScheduledTask["frequency"]
        ) &&
        schedulerModels.includes(task.model as ScheduledTask["model"])
    )
    .map((task) => ({
      ...task,
      isEnabled:
        typeof task.isEnabled === "boolean" ? task.isEnabled : true,
      notes: typeof task.notes === "string" ? task.notes.trim() : "",
      title: task.title.trim(),
    }))
    .filter((task) => task.title.length > 0);
}

function parseTaskCommand(command: string): {
  date?: string;
  frequency: ScheduledTask["frequency"];
  title: string;
} | null {
  const normalized = command.trim();
  if (!normalized) {
    return null;
  }

  const lower = normalized.toLowerCase();
  const title = normalized
    .replace(/^(créer|cree|ajoute[rz]?)( une)? tâche planifiée\s*[:-]?\s*/i, "")
    .trim();
  const nextDate = new Date();

  if (lower.includes("demain")) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  const timeMatch = lower.match(/(\d{1,2})h(?:(\d{2}))?/);
  if (timeMatch) {
    nextDate.setHours(
      Number(timeMatch[1] ?? 9),
      Number(timeMatch[2] ?? 0),
      0,
      0
    );
  } else {
    nextDate.setHours(9, 0, 0, 0);
  }

  let frequency: ScheduledTask["frequency"] = "ponctuelle";
  if (lower.includes("chaque jour") || lower.includes("quotid")) {
    frequency = "quotidienne";
  } else if (lower.includes("chaque semaine") || lower.includes("hebdo")) {
    frequency = "hebdomadaire";
  } else if (lower.includes("chaque mois") || lower.includes("mensuel")) {
    frequency = "mensuelle";
  }

  return {
    date: nextDate.toISOString().slice(0, 16),
    frequency,
    title: title || "Tâche planifiée",
  };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const { isHydrated, plan } = useSubscriptionPlan();
  const currentPlanDefinition = planDefinitions[plan];

  const [activeSettingsSection, setActiveSettingsSection] =
    useState<string>("compte");
  const [profileName, setProfileName] = useState("");
  const [profileLogoDataUrl, setProfileLogoDataUrl] = useState<
    string | undefined
  >(undefined);
  const [profession, setProfession] = useState("");
  const [aiBehavior, setAiBehavior] = useState({
    concision: 50,
    register: 50,
    tone: 50,
  });
  const [aiPersonality, setAiPersonality] = useState("");
  const [personalContext, setPersonalContext] = useState("");
  const [aiMemoryEntries, setAiMemoryEntries] = useState<string[]>([]);
  const [memoryEntryIds, setMemoryEntryIds] = useState<string[]>([]);
  const [aiName, setAiName] = useState("mAI");

  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [memoryDraft, setMemoryDraft] = useState("");
  const [memoryEditingIndex, setMemoryEditingIndex] = useState<number | null>(
    null
  );
  const [isMemoryLoading, setIsMemoryLoading] = useState(false);
  const [memoryError, setMemoryError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [tasksHydrated, setTasksHydrated] = useState(false);
  const [taskCommand, setTaskCommand] = useState("");
  const [taskForm, setTaskForm] = useState<
    Omit<ScheduledTask, "createdAt" | "id" | "isEnabled" | "lastRunAt">
  >({
    frequency: "ponctuelle",
    model: "openai/gpt-5.4-mini",
    nextRunAt: formatDateTimeLocalInput(),
    notes: "",
    title: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    usageAlerts: true,
  });

  const [parentalSettings, setParentalSettings] = useState<ParentalSettings>(
    defaultParentalSettings
  );
  const [newLockCode, setNewLockCode] = useState("");
  const [confirmLockCode, setConfirmLockCode] = useState("");
  const [unlockCode, setUnlockCode] = useState("");
  const [parentalFeedback, setParentalFeedback] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    defaultSecuritySettings
  );
  const [securityPinDraft, setSecurityPinDraft] = useState("");
  const [securityPinConfirmDraft, setSecurityPinConfirmDraft] = useState("");
  const [securityFeedback, setSecurityFeedback] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const [tokenUsage, setTokenUsage] = useState({
    inputTokens: 0,
    outputTokens: 0,
  });

  const [conversationTags, setConversationTags] = useState<TagDefinition[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_PALETTE[0]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [editingTagColor, setEditingTagColor] = useState(TAG_PALETTE[0]);

  const [activationCode, setActivationCode] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [activationMessage, setActivationMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const [interfaceLanguage, setInterfaceLanguage] = useState("fr");
  const [fileUsageToday, setFileUsageToday] = useState(0);
  const [tierUsage, setTierUsage] = useState({
    tier1: 0,
    tier2: 0,
    tier3: 0,
  });

  const [pwaInstallPrompt, setPwaInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const maxMemoryEntries = getMemoryEntriesLimitForPlan(plan);
  const maxScheduledTasks = currentPlanDefinition.limits.taskSchedules;

  const allowedReasoningPreferences = useMemo<ReasoningPreference[]>(() => {
    if (plan === "max") {
      return ["none", "light", "medium", "high"];
    }
    if (plan === "pro") {
      return ["none", "light", "medium"];
    }
    return ["none", "light"];
  }, [plan]);

  useEffect(() => {
    try {
      const rawTasks = window.localStorage.getItem(TASKS_STORAGE_KEY);
      if (!rawTasks) {
        setTasksHydrated(true);
        return;
      }

      const parsed = JSON.parse(rawTasks) as unknown;
      const sanitizedTasks = sanitizeScheduledTasks(parsed);
      if (sanitizedTasks.length === 0) {
        setTasksHydrated(true);
        return;
      }

      setTasks(sanitizedTasks);
      setTasksHydrated(true);
    } catch {
      setTaskError(
        "Impossible de charger les tâches automatiques sauvegardées."
      );
      setTasksHydrated(true);
    }
  }, []);

  useEffect(() => {
    const refreshUsage = () => {
      setFileUsageToday(getUsageCount("files", "day"));
      setTierUsage({
        tier1: getTierUsage("tier1"),
        tier2: getTierUsage("tier2"),
        tier3: getTierUsage("tier3"),
      });
    };
    refreshUsage();
    window.addEventListener("storage", refreshUsage);
    window.addEventListener("mai:websearch-usage-updated", refreshUsage);
    window.addEventListener("mai:usage-updated", refreshUsage);
    return () => {
      window.removeEventListener("storage", refreshUsage);
      window.removeEventListener(
        "mai:websearch-usage-updated",
        refreshUsage
      );
      window.removeEventListener("mai:usage-updated", refreshUsage);
    };
  }, []);

  useEffect(() => {
    const rawTags = window.localStorage.getItem(TAG_DEFINITIONS_STORAGE_KEY);
    if (!rawTags) {
      return;
    }
    try {
      const parsed = JSON.parse(rawTags) as TagDefinition[];
      if (Array.isArray(parsed)) {
        setConversationTags(parsed);
      }
    } catch {
      setConversationTags([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      TAG_DEFINITIONS_STORAGE_KEY,
      JSON.stringify(conversationTags)
    );

    const rawAssignments = window.localStorage.getItem(CHAT_TAGS_STORAGE_KEY);
    if (rawAssignments) {
      try {
        const parsedAssignments = JSON.parse(rawAssignments) as Record<
          string,
          string[]
        >;
        const allowedIds = new Set(conversationTags.map((tag) => tag.id));
        const sanitizedAssignments = Object.fromEntries(
          Object.entries(parsedAssignments).map(([chatId, tagIds]) => [
            chatId,
            (Array.isArray(tagIds) ? tagIds : []).filter((tagId) =>
              allowedIds.has(tagId)
            ),
          ])
        );
        window.localStorage.setItem(
          CHAT_TAGS_STORAGE_KEY,
          JSON.stringify(sanitizedAssignments)
        );
      } catch {
        // ignore invalid payload
      }
    }

    window.dispatchEvent(new CustomEvent("mai:tags-updated"));
  }, [conversationTags]);

  useEffect(() => {
    const savedProfile = window.localStorage.getItem(
      PROFILE_SETTINGS_STORAGE_KEY
    );
    if (!savedProfile) {
      setProfileName(defaultProfileSettings.displayName);
      setProfileLogoDataUrl(defaultProfileSettings.avatarDataUrl);
      setProfession(defaultProfileSettings.profession);
      setAiBehavior({ concision: 50, register: 50, tone: 50 });
      setAiPersonality(defaultProfileSettings.aiPersonality);
      setPersonalContext(defaultProfileSettings.personalContext);
      setAiMemoryEntries([]);
      setMemoryEntryIds([]);
      setAiName(defaultProfileSettings.aiName);
      return;
    }

    try {
      const parsed = JSON.parse(savedProfile) as Partial<ProfileSettingsShape>;
      const legacyResponseStyle = (parsed as Record<string, unknown>)
        .responseStyle;
      const parsedMemoryEntries = sanitizeMemoryEntries(parsed.aiMemoryEntries);
      const fallbackEntries = parsed.aiMemory
        ? sanitizeMemoryEntries(
            parsed.aiMemory
              .split("\n")
              .map((entry) => entry.replace(/^[-*]\s*/, ""))
          )
        : [];
      const nextMemoryEntries =
        parsedMemoryEntries.length > 0 ? parsedMemoryEntries : fallbackEntries;
      setProfileName(parsed.displayName?.trim() ?? "");
      setProfileLogoDataUrl(parsed.avatarDataUrl);
      setProfession(parsed.profession ?? "");
      setAiBehavior({
        concision: clampPercentage(
          typeof parsed.aiBehavior?.concision === "number"
            ? parsed.aiBehavior.concision
            : 50
        ),
        register: clampPercentage(
          typeof parsed.aiBehavior?.register === "number"
            ? parsed.aiBehavior.register
            : 50
        ),
        tone: clampPercentage(
          typeof parsed.aiBehavior?.tone === "number"
            ? parsed.aiBehavior.tone
            : legacyResponseStyle === "allonge"
              ? 80
              : legacyResponseStyle === "concis"
                ? 20
                : 50
        ),
      });
      setAiPersonality(parsed.aiPersonality ?? "");
      setPersonalContext(parsed.personalContext ?? "");
      setAiMemoryEntries(nextMemoryEntries);
      setMemoryEntryIds(
        nextMemoryEntries.map((_, index) => `local-memory-${index}`)
      );
      setAiName(parsed.aiName ?? "mAI");
    } catch {
      setProfileName(defaultProfileSettings.displayName);
      setProfileLogoDataUrl(defaultProfileSettings.avatarDataUrl);
      setProfession(defaultProfileSettings.profession);
      setAiBehavior({ concision: 50, register: 50, tone: 50 });
      setAiPersonality(defaultProfileSettings.aiPersonality);
      setPersonalContext(defaultProfileSettings.personalContext);
      setAiMemoryEntries([]);
      setMemoryEntryIds([]);
      setAiName(defaultProfileSettings.aiName);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    const loadMemoryEntries = async () => {
      setIsMemoryLoading(true);
      setMemoryError(null);

      try {
        const response = await fetch("/api/memory", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Chargement mémoire impossible");
        }

        const payload = (await response.json()) as PersistedMemoryEntry[];
        if (!isMounted) {
          return;
        }

        setAiMemoryEntries(payload.map((entry) => entry.content));
        setMemoryEntryIds(payload.map((entry) => entry.id));
      } catch {
        if (!isMounted) {
          return;
        }
        setMemoryError(
          "Impossible de charger la mémoire cloud. Mode local actif."
        );
      } finally {
        if (isMounted) {
          setIsMemoryLoading(false);
        }
      }
    };

    loadMemoryEntries();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const rawSecurity = window.localStorage.getItem(
      SECURITY_SETTINGS_STORAGE_KEY
    );
    if (rawSecurity) {
      setSecuritySettings(parseSecuritySettings(rawSecurity));
    }

    const rawNotifications = window.localStorage.getItem(
      NOTIFICATIONS_SETTINGS_STORAGE_KEY
    );
    if (rawNotifications) {
      try {
        setNotificationSettings(JSON.parse(rawNotifications));
      } catch {
        // ignore
      }
    }

    const rawParental = window.localStorage.getItem(
      PARENTAL_SETTINGS_STORAGE_KEY
    );
    if (rawParental) {
      try {
        setParentalSettings(JSON.parse(rawParental));
      } catch {
        // ignore
      }
    }

    const rawTokens = window.localStorage.getItem(TOKEN_USAGE_STORAGE_KEY);
    if (rawTokens) {
      try {
        setTokenUsage(JSON.parse(rawTokens));
      } catch {
        // ignore
      }
    }

    const rawLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (rawLanguage) {
      setInterfaceLanguage(resolveLanguage(rawLanguage));
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPwaInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    if (tasksHydrated) {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, tasksHydrated]);

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      createNotification({
        level: "error",
        message: "L'image ne doit pas dépasser 2 Mo.",
        title: "Avatar",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const result = readerEvent.target?.result;
      if (typeof result === "string") {
        setProfileLogoDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const payload: ProfileSettingsShape = {
      aiBehavior,
      aiMemory: "",
      aiMemoryEntries,
      aiName: aiName.trim() || "mAI",
      aiPersonality,
      avatarDataUrl: profileLogoDataUrl,
      avatarId: "custom",
      displayName: profileName.trim(),
      personalContext,
      profession,
      projectDescription: "",
      projectIconColor: "#60a5fa",
      projectTitle: "",
      stylisticDirectives: "",
    };

    window.localStorage.setItem(
      PROFILE_SETTINGS_STORAGE_KEY,
      JSON.stringify(payload)
    );
    window.localStorage.setItem(NOTIFICATIONS_SETTINGS_STORAGE_KEY, JSON.stringify(notificationSettings));
    window.localStorage.setItem(PARENTAL_SETTINGS_STORAGE_KEY, JSON.stringify(parentalSettings));
    window.localStorage.setItem(SECURITY_SETTINGS_STORAGE_KEY, JSON.stringify(securitySettings));

    createNotification({
      level: "success",
      message: "Vos paramètres ont été enregistrés localement.",
      title: "Paramètres",
    });
    window.dispatchEvent(new CustomEvent("mai:profile-updated"));
  };

  const handleActivation = async () => {
    const code = activationCode.trim();
    if (!code) {
      return;
    }

    setIsActivating(true);
    setActivationMessage(null);

    try {
      const response = await fetch("/api/subscription/activate", {
        body: JSON.stringify({ code }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();
      if (response.ok) {
        setActivationMessage({
          text: `Forfait ${data.plan.toUpperCase()} activé avec succès !`,
          type: "success",
        });
        setActivationCode("");
        window.location.reload();
      } else {
        setActivationMessage({
          text: data.error || "Code invalide ou déjà utilisé.",
          type: "error",
        });
      }
    } catch {
      setActivationMessage({
        text: "Erreur lors de l'activation. Vérifiez votre connexion.",
        type: "error",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleTaskCommand = () => {
    const parsed = parseTaskCommand(taskCommand);
    if (!parsed) {
      return;
    }

    setTaskForm((prev) => ({
      ...prev,
      frequency: parsed.frequency,
      nextRunAt: parsed.date || prev.nextRunAt,
      title: parsed.title,
    }));
    setTaskCommand("");
  };

  const handleCreateTask = () => {
    if (!taskForm.title.trim()) {
      setTaskError("Le titre de la tâche est requis.");
      return;
    }

    if (tasks.length >= maxScheduledTasks) {
      setTaskError(`Limite de tâches atteinte (${maxScheduledTasks}).`);
      return;
    }

    const newTask: ScheduledTask = {
      ...taskForm,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      isEnabled: true,
      title: taskForm.title.trim(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setTaskForm({
      frequency: "ponctuelle",
      model: "openai/gpt-5.4-mini",
      nextRunAt: formatDateTimeLocalInput(),
      notes: "",
      title: "",
    });
    setTaskError(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleToggleTaskEnabled = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isEnabled: !task.isEnabled } : task
      )
    );
  };

  const handleRunTaskNow = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      return;
    }

    createNotification({
      level: "info",
      message: `Exécution manuelle de "${task.title}" lancée...`,
      title: "Tâches",
    });

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, lastRunAt: new Date().toISOString() } : t
      )
    );
  };

  const handleSaveMemoryEntry = async () => {
    const content = memoryDraft.trim();
    if (!content) {
      return;
    }

    setMemoryError(null);

    if (isAuthenticated) {
      try {
        const isEditing = memoryEditingIndex !== null;
        const memoryId = isEditing ? memoryEntryIds[memoryEditingIndex] : null;

        const response = await fetch(
          isEditing ? `/api/memory/${memoryId}` : "/api/memory",
          {
            body: JSON.stringify({ content }),
            headers: { "Content-Type": "application/json" },
            method: isEditing ? "PATCH" : "POST",
          }
        );

        if (!response.ok) {
          throw new Error("Erreur serveur mémoire");
        }

        const savedEntry = (await response.json()) as PersistedMemoryEntry;

        if (isEditing) {
          setAiMemoryEntries((prev) =>
            prev.map((entry, index) =>
              index === memoryEditingIndex ? savedEntry.content : entry
            )
          );
        } else {
          setAiMemoryEntries((prev) => [savedEntry.content, ...prev]);
          setMemoryEntryIds((prev) => [savedEntry.id, ...prev]);
        }

        resetMemoryEditor();
      } catch {
        setMemoryError("Impossible de sauvegarder sur le serveur.");
      }
    } else {
      if (memoryEditingIndex !== null) {
        setAiMemoryEntries((prev) =>
          prev.map((entry, index) =>
            index === memoryEditingIndex ? content : entry
          )
        );
      } else {
        setAiMemoryEntries((prev) => [content, ...prev]);
        setMemoryEntryIds((prev) => [
          `local-${crypto.randomUUID()}`,
          ...prev,
        ]);
      }
      resetMemoryEditor();
    }
  };

  const handleEditMemoryEntry = (index: number) => {
    setMemoryEditingIndex(index);
    setMemoryDraft(aiMemoryEntries[index]);
  };

  const resetMemoryEditor = () => {
    setMemoryEditingIndex(null);
    setMemoryDraft("");
  };

  const handleDeleteMemoryEntry = async (index: number) => {
    if (!isAuthenticated) {
      setAiMemoryEntries((prev) =>
        prev.filter((_, current) => current !== index)
      );
      setMemoryEntryIds((prev) =>
        prev.filter((_, current) => current !== index)
      );
      if (memoryEditingIndex === index) {
        resetMemoryEditor();
      }
      return;
    }

    const memoryId = memoryEntryIds[index];
    if (!memoryId) {
      return;
    }

    setMemoryError(null);
    const response = await fetch(`/api/memory/${memoryId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMemoryError(
        "Impossible de supprimer sur le serveur. Réessayez dans quelques instants."
      );
      return;
    }

    setAiMemoryEntries((prev) =>
      prev.filter((_, current) => current !== index)
    );
    setMemoryEntryIds((prev) => prev.filter((_, current) => current !== index));
    if (memoryEditingIndex === index) {
      resetMemoryEditor();
    } else if (memoryEditingIndex !== null && memoryEditingIndex > index) {
      setMemoryEditingIndex(memoryEditingIndex - 1);
    }
  };

  const creditMetrics = useMemo<CreditMetric[]>(() => {
    if (!isHydrated) {
      return [];
    }

    const tier1 = getTierRemaining("tier1", plan, isAuthenticated);
    const tier2 = getTierRemaining("tier2", plan, isAuthenticated);
    const tier3 = getTierRemaining("tier3", plan, isAuthenticated);

    return [
      {
        key: "tier1",
        limit: tier1.limit,
        period: "day",
        title: "Tier 1",
        used: tierUsage.tier1,
      },
      {
        key: "tier2",
        limit: tier2.limit,
        period: "day",
        title: "Tier 2",
        used: tierUsage.tier2,
      },
      {
        key: "tier3",
        limit: tier3.limit,
        period: "day",
        title: "Tier 3",
        used: tierUsage.tier3,
      },
      {
        key: "files",
        limit: currentPlanDefinition.limits.filesPerDay,
        period: "day",
        title: "Fichiers",
        used: fileUsageToday,
      },
      {
        key: "tasks",
        limit: currentPlanDefinition.limits.taskSchedules,
        period: "month",
        title: "Tâches",
        used: tasks.length,
      },
    ];
  }, [
    currentPlanDefinition,
    fileUsageToday,
    isAuthenticated,
    isHydrated,
    plan,
    tasks.length,
    tierUsage.tier1,
    tierUsage.tier2,
    tierUsage.tier3,
  ]);

  const settingsSections = [
    { href: "#compte", key: "compte", label: "Compte" },
    { href: "#notifications", key: "notifications", label: "Notifications" },
    {
      href: "#personnalisation",
      key: "personnalisation",
      label: "Personnalisation IA",
    },
    { href: "#parental", key: "parental", label: "Contrôle parental" },
    { href: "#donnees", key: "donnees", label: "Données" },
    { href: "#credits", key: "credits", label: "Crédits" },
    { href: "#taches", key: "taches", label: "Tâches" },
    { href: "#apropos", key: "apropos", label: "À propos" },
  ] as const;
  const sectionVisibility = (key: (typeof settingsSections)[number]["key"]) =>
    activeSettingsSection === key ? "block" : "hidden";
  const isParentalSessionUnlocked =
    parentalSettings.sessionUnlockedUntil > Date.now();
  const isAdvancedAccessRestricted =
    parentalSettings.enabled &&
    parentalSettings.advancedSettingsLocked &&
    !isParentalSessionUnlocked;
  const isUsageLimitReached =
    parentalSettings.enabled &&
    parentalSettings.dailyLimitMinutes > 0 &&
    parentalSettings.usageMinutes >= parentalSettings.dailyLimitMinutes;
  const isBedtimeRestrictionActive =
    parentalSettings.enabled &&
    parentalSettings.bedtimeMode &&
    isNowWithinBedtimeWindow(
      parentalSettings.bedtimeWindowStartHour,
      parentalSettings.bedtimeWindowEndHour
    ) &&
    !isParentalSessionUnlocked;
  const isDataAccessRestricted =
    isAdvancedAccessRestricted || isUsageLimitReached || isBedtimeRestrictionActive;

  const handleSetLockCode = () => {
    const normalizedNewCode = newLockCode.trim();
    const normalizedConfirmCode = confirmLockCode.trim();

    if (normalizedNewCode.length < 4 || normalizedNewCode.length > 8) {
      setParentalFeedback({
        text: "Le code doit contenir entre 4 et 8 caractères.",
        type: "error",
      });
      return;
    }

    if (normalizedNewCode !== normalizedConfirmCode) {
      setParentalFeedback({
        text: "Les deux codes ne correspondent pas.",
        type: "error",
      });
      return;
    }

    setParentalSettings((prev) => ({
      ...prev,
      enabled: true,
      lockCodeHash: hashLockCode(normalizedNewCode),
      sessionUnlockedUntil: 0,
    }));
    setNewLockCode("");
    setConfirmLockCode("");
    setParentalFeedback({
      text: "Code parental enregistré. La protection est active.",
      type: "success",
    });
  };

  const handleUnlockParentalSection = () => {
    if (!parentalSettings.lockCodeHash) {
      setParentalFeedback({
        text: "Aucun code défini. Configurez un code parental d'abord.",
        type: "error",
      });
      return;
    }

    if (hashLockCode(unlockCode.trim()) !== parentalSettings.lockCodeHash) {
      setParentalFeedback({
        text: "Code invalide. Déverrouillage refusé.",
        type: "error",
      });
      return;
    }

    setParentalSettings((prev) => ({
      ...prev,
      sessionUnlockedUntil: Date.now() + 15 * 60_000,
    }));
    setUnlockCode("");
    setParentalFeedback({
      text: "Section avancée déverrouillée pour 15 minutes.",
      type: "success",
    });
  };

  const handleSaveSecurityPin = () => {
    const nextPin = securityPinDraft.trim();
    const confirmPin = securityPinConfirmDraft.trim();

    if (!/^\d{4,8}$/.test(nextPin)) {
      setSecurityFeedback({
        type: "error",
        text: "Le PIN doit contenir entre 4 et 8 chiffres.",
      });
      return;
    }

    if (nextPin !== confirmPin) {
      setSecurityFeedback({
        type: "error",
        text: "Les deux codes PIN ne correspondent pas.",
      });
      return;
    }

    setSecuritySettings((current) => ({
      ...current,
      enablePinLock: true,
      lockOnReturn: true,
      pinCodeHash: hashPinCode(nextPin),
    }));
    setSecurityPinDraft("");
    setSecurityPinConfirmDraft("");
    setSecurityFeedback({
      type: "success",
      text: "PIN enregistré. Le verrouillage à la reprise est actif.",
    });
  };

  const handleDisableSecurityPin = () => {
    setSecuritySettings((current) => ({
      ...current,
      enablePinLock: false,
      lockOnReturn: false,
      pinCodeHash: "",
    }));
    setSecurityPinDraft("");
    setSecurityPinConfirmDraft("");
    setSecurityFeedback({
      type: "success",
      text: "Verrouillage PIN désactivé.",
    });
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-6 overflow-y-auto p-4 md:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <Settings2 className="size-8 text-primary" />
          Paramètres
        </h1>
        <p className="text-muted-foreground">
          Personnalisez votre expérience mAI, gérez vos crédits et vos données.
        </p>
      </header>

      <nav className="sticky top-0 z-50 flex flex-wrap gap-2 rounded-2xl border border-border/50 bg-background/60 p-1.5 backdrop-blur-2xl">
        {settingsSections.map((section) => (
          <button
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-all",
              activeSettingsSection === section.key
                ? "bg-primary text-primary-foreground shadow-lg"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            key={section.key}
            onClick={() => setActiveSettingsSection(section.key)}
            type="button"
          >
            {section.label}
          </button>
        ))}
      </nav>

      <section
        className={cn(
          "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
          sectionVisibility("compte")
        )}
        id="compte"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <UserCircle2 className="size-5" />
          Compte & Profil
        </h2>
        <div className="mt-6 flex flex-col gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-4">
            <div className="group relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-background shadow-2xl">
              {profileLogoDataUrl ? (
                <img
                  alt="Avatar"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  src={profileLogoDataUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <UserCircle2 className="size-12 text-primary/40" />
                </div>
              )}
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => logoInputRef.current?.click()}
                type="button"
              >
                <Camera className="size-6 text-white" />
              </button>
            </div>
            <input
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              ref={logoInputRef}
              type="file"
            />
            <Button
              onClick={() => logoInputRef.current?.click()}
              size="sm"
              variant="outline"
            >
              Changer l&apos;avatar
            </Button>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="display-name">
                  Nom d&apos;affichage
                </label>
                <Input
                  id="display-name"
                  onChange={(event) => setProfileName(event.target.value)}
                  placeholder="Votre nom"
                  value={profileName}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="profession">
                  Profession / Études
                </label>
                <Input
                  id="profession"
                  onChange={(event) => setProfession(event.target.value)}
                  placeholder="Ex: Développeur Fullstack"
                  value={profession}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Forfait actuel</label>
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Badge className="capitalize" variant="secondary">
                    {plan}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold capitalize">{plan}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentPlanDefinition.description}
                  </p>
                </div>
              </div>
            </div>

            {pwaInstallPrompt && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Application disponible
                </p>
                <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">
                  Installez mAI sur votre écran d&apos;accueil pour un accès rapide.
                </p>
                <Button
                  className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                  onClick={async () => {
                    if (!pwaInstallPrompt) return;
                    await pwaInstallPrompt.prompt();
                    const { outcome } = await pwaInstallPrompt.userChoice;
                    if (outcome === "accepted") setPwaInstallPrompt(null);
                  }}
                  size="sm"
                >
                  Installer l&apos;application
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-border/50 pt-6">
          <Button onClick={handleSaveProfile} size="lg">
            Enregistrer les modifications
          </Button>
        </div>
      </section>

      <section
        className={cn(
          "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
          sectionVisibility("notifications")
        )}
        id="notifications"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="size-5" />
          Notifications
        </h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Alertes par email</p>
              <p className="text-xs text-muted-foreground">
                Recevez des récapitulatifs et des alertes importantes.
              </p>
            </div>
            <input
              checked={notificationSettings.email}
              className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
              onChange={(event) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  email: event.target.checked,
                }))
              }
              type="checkbox"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Notifications Push</p>
              <p className="text-xs text-muted-foreground">
                Notifications en temps réel sur votre navigateur ou mobile.
              </p>
            </div>
            <input
              checked={notificationSettings.push}
              className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
              onChange={(event) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  push: event.target.checked,
                }))
              }
              type="checkbox"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Alertes de consommation</p>
              <p className="text-xs text-muted-foreground">
                Prévenir quand j&apos;approche de la limite de mes crédits.
              </p>
            </div>
            <input
              checked={notificationSettings.usageAlerts}
              className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
              onChange={(event) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  usageAlerts: event.target.checked,
                }))
              }
              type="checkbox"
            />
          </div>
        </div>
      </section>

      <section
        className={cn(
          "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
          sectionVisibility("personnalisation")
        )}
        id="personnalisation"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <SlidersHorizontal className="size-5" />
          Personnalisation de mAI
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajustez le comportement, le ton et les connaissances de votre IA.
        </p>

        <div className="mt-6 space-y-8">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Badge variant="outline">Comportement</Badge>
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span>Détaillé</span>
                  <span>Concis</span>
                </div>
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/20 accent-primary"
                  max="100"
                  min="0"
                  onChange={(event) =>
                    setAiBehavior((prev) => ({
                      ...prev,
                      concision: Number(event.target.value),
                    }))
                  }
                  type="range"
                  value={aiBehavior.concision}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span>Familier</span>
                  <span>Soutenu</span>
                </div>
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/20 accent-primary"
                  max="100"
                  min="0"
                  onChange={(event) =>
                    setAiBehavior((prev) => ({
                      ...prev,
                      register: Number(event.target.value),
                    }))
                  }
                  type="range"
                  value={aiBehavior.register}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span>Sérieux</span>
                  <span>Créatif</span>
                </div>
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/20 accent-primary"
                  max="100"
                  min="0"
                  onChange={(event) =>
                    setAiBehavior((prev) => ({
                      ...prev,
                      tone: Number(event.target.value),
                    }))
                  }
                  type="range"
                  value={aiBehavior.tone}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="ai-name">
                Nom de l&apos;IA
              </label>
              <Input
                id="ai-name"
                onChange={(event) => setAiName(event.target.value)}
                placeholder="mAI"
                value={aiName}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="ai-personality">
                Personnalité / Rôle
              </label>
              <Input
                id="ai-personality"
                onChange={(event) => setAiPersonality(event.target.value)}
                placeholder="Ex: Un mentor bienveillant et expert en tech"
                value={aiPersonality}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Mémoire de l&apos;IA
              <Badge className="ml-2" variant="secondary">
                {aiMemoryEntries.length} / {maxMemoryEntries}
              </Badge>
            </label>
            <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">
                La mémoire permet à mAI de se souvenir d&apos;informations clés sur
                vous au fil des conversations.
              </p>
              <Button
                className="w-fit"
                onClick={() => setIsMemoryModalOpen(true)}
                variant="outline"
              >
                <Database className="mr-2 size-4" />
                Gérer la mémoire
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="personal-context">
              Contexte personnel (Instructions personnalisées)
            </label>
            <textarea
              className="min-h-32 w-full rounded-2xl border border-border/50 bg-background/40 p-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
              id="personal-context"
              onChange={(event) => setPersonalContext(event.target.value)}
              placeholder="Ex: Je travaille principalement sur des projets React. J'aime que les explications soient accompagnées d'exemples de code."
              value={personalContext}
            />
          </div>
        </div>
      </section>

      <section
        className={cn(
          "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
          sectionVisibility("parental")
        )}
        id="parental"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShieldAlert className="size-5 text-rose-500" />
            Contrôle parental
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">
              {parentalSettings.enabled ? "Activé" : "Désactivé"}
            </span>
            <button
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                parentalSettings.enabled ? "bg-primary" : "bg-muted"
              )}
              disabled={isAdvancedAccessRestricted}
              onClick={() =>
                setParentalSettings((prev) => ({
                  ...prev,
                  enabled: !prev.enabled,
                }))
              }
              type="button"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  parentalSettings.enabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Sécurité & Accès</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  {parentalSettings.lockCodeHash
                    ? "Changer le code parental (4-8 chiffres)"
                    : "Définir un code parental (4-8 chiffres)"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    maxLength={8}
                    onChange={(event) =>
                      setNewLockCode(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Nouveau code"
                    type="password"
                    value={newLockCode}
                  />
                  <Input
                    maxLength={8}
                    onChange={(event) =>
                      setConfirmLockCode(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Confirmer"
                    type="password"
                    value={confirmLockCode}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSetLockCode}
                  size="sm"
                  variant="outline"
                >
                  Enregistrer le code
                </Button>
              </div>

              {isAdvancedAccessRestricted && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    Section verrouillée
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Input
                      className="h-8"
                      onChange={(event) =>
                        setUnlockCode(event.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Code"
                      type="password"
                      value={unlockCode}
                    />
                    <Button
                      className="h-8"
                      onClick={handleUnlockParentalSection}
                      size="sm"
                    >
                      Déverrouiller
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Limites de temps</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs">Limite quotidienne (minutes)</label>
                <Input
                  className="h-8 w-20"
                  disabled={isAdvancedAccessRestricted}
                  min={0}
                  onChange={(event) =>
                    setParentalSettings((prev) => ({
                      ...prev,
                      dailyLimitMinutes: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  type="number"
                  value={parentalSettings.dailyLimitMinutes}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs">Bonus week-end (minutes)</label>
                <Input
                  className="h-8 w-20"
                  disabled={isAdvancedAccessRestricted}
                  min={0}
                  onChange={(event) =>
                    setParentalSettings((prev) => ({
                      ...prev,
                      weekendBonusMinutes: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  type="number"
                  value={parentalSettings.weekendBonusMinutes}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4 border-t border-border/50 pt-4">
          <h3 className="text-sm font-medium">Mode Coucher</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs">
              <input
                checked={parentalSettings.bedtimeMode}
                disabled={isAdvancedAccessRestricted}
                onChange={(event) =>
                  setParentalSettings((prev) => ({
                    ...prev,
                    bedtimeMode: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Activer le mode coucher
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs">De</span>
              <Input
                className="h-8 w-16"
                disabled={isAdvancedAccessRestricted}
                max={23}
                min={0}
                onChange={(event) =>
                  setParentalSettings((prev) => ({
                    ...prev,
                    bedtimeWindowStartHour: Math.max(
                      0,
                      Math.min(23, Number(event.target.value) || 0)
                    ),
                  }))
                }
                type="number"
                value={parentalSettings.bedtimeWindowStartHour}
              />
              <span className="text-xs">à</span>
              <Input
                className="h-8 w-16"
                disabled={isAdvancedAccessRestricted}
                max={23}
                min={0}
                onChange={(event) =>
                  setParentalSettings((prev) => ({
                    ...prev,
                    bedtimeWindowEndHour: Math.max(
                      0,
                      Math.min(23, Number(event.target.value) || 0)
                    ),
                  }))
                }
                type="number"
                value={parentalSettings.bedtimeWindowEndHour}
              />
            </div>
          </div>
        </div>

        {parentalFeedback && (
          <p
            className={cn(
              "mt-3 text-sm",
              parentalFeedback.type === "success"
                ? "text-emerald-600"
                : "text-rose-600"
            )}
          >
            {parentalFeedback.text}
          </p>
        )}
      </section>

      <section
        className={cn(
          "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
          sectionVisibility("donnees")
        )}
        id="donnees"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Database className="size-4 text-primary" />
          Données
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gérez vos données, vos identifiants de compte et vos accès premium.
        </p>
        {isUsageLimitReached && (
          <p className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            Limite quotidienne atteinte ({parentalSettings.usageMinutes}/
            {parentalSettings.dailyLimitMinutes} min). Les actions sensibles
            restent désactivées jusqu&apos;à réinitialisation.
          </p>
        )}
        {isAdvancedAccessRestricted && (
          <p className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            Accès restreint : entrez le code parental dans la section "Contrôle
            parental" pour autoriser temporairement ces actions.
          </p>
        )}
        {isBedtimeRestrictionActive && (
          <p className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            Mode coucher actif ({parentalSettings.bedtimeWindowStartHour}h-
            {parentalSettings.bedtimeWindowEndHour}h) : les actions sensibles
            sont temporairement bloquées.
          </p>
        )}
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <Button
            className="justify-start"
            disabled={isDataAccessRestricted}
            type="button"
            variant="outline"
          >
            <Mail className="mr-2 size-4" />
            Modifier l&apos;adresse mail
          </Button>
          <Button
            className="justify-start"
            disabled={isDataAccessRestricted}
            type="button"
            variant="outline"
          >
            <ShieldCheck className="mr-2 size-4" />
            Changer le mot de passe
          </Button>
          {isDataAccessRestricted ? (
            <Button
              className="justify-start"
              disabled
              type="button"
              variant="outline"
            >
              <FileText className="mr-2 size-4" />
              Exporter mes données
            </Button>
          ) : (
            <Button asChild className="justify-start" variant="outline">
              <a download href="/api/export">
                <FileText className="mr-2 size-4" />
                Exporter mes données
              </a>
            </Button>
          )}
        </div>

        <div className="liquid-glass mt-4 rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur-2xl">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="size-4 text-cyan-400" />
            Sécurité de session
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Protégez votre session sans vous reconnecter : vérification au chargement, PIN de reprise et déconnexion régulière.
          </p>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-xs">
              <input
                checked={securitySettings.securityCheckOnLoad}
                onChange={(event) =>
                  setSecuritySettings((current) => ({
                    ...current,
                    securityCheckOnLoad: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Vérification de sécurité au chargement
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-xs">
              <input
                checked={securitySettings.lockOnReturn}
                disabled={!securitySettings.enablePinLock}
                onChange={(event) =>
                  setSecuritySettings((current) => ({
                    ...current,
                    lockOnReturn: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Verrouiller la session au retour sur le site
            </label>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <Input
              inputMode="numeric"
              maxLength={8}
              onChange={(event) =>
                setSecurityPinDraft(event.target.value.replace(/\D+/g, "").slice(0, 8))
              }
              placeholder="Nouveau PIN (4-8)"
              type="password"
              value={securityPinDraft}
            />
            <Input
              inputMode="numeric"
              maxLength={8}
              onChange={(event) =>
                setSecurityPinConfirmDraft(event.target.value.replace(/\D+/g, "").slice(0, 8))
              }
              placeholder="Confirmer PIN"
              type="password"
              value={securityPinConfirmDraft}
            />
            <Button onClick={handleSaveSecurityPin} type="button" variant="outline">
              Enregistrer PIN
            </Button>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
            <label className="rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-xs">
              Déconnexion régulière automatique (minutes, 0 = désactivée)
              <Input
                className="mt-2"
                min={0}
                onChange={(event) =>
                  setSecuritySettings((current) => ({
                    ...current,
                    autoLogoutMinutes: Math.max(
                      0,
                      Math.min(1440, Number(event.target.value) || 0)
                    ),
                  }))
                }
                type="number"
                value={securitySettings.autoLogoutMinutes}
              />
            </label>
            <Button onClick={handleDisableSecurityPin} type="button" variant="ghost">
              Désactiver PIN
            </Button>
          </div>

          {securityFeedback ? (
            <p
              className={cn(
                "mt-2 text-xs",
                securityFeedback.type === "success"
                  ? "text-emerald-500"
                  : "text-rose-500"
              )}
            >
              {securityFeedback.text}
            </p>
          ) : null}
        </div>

        <div className="liquid-panel mt-4 rounded-xl border border-border/60 bg-background/60 p-4">
          <h3 className="text-sm font-semibold">Compteur de tokens (hors chat fantôme)</h3>
          <p className="mt-1 text-xs text-muted-foreground">Consommation cumulée sur cet appareil.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <div className="rounded-lg border border-border/50 bg-card/70 p-3">
              <p className="text-xs text-muted-foreground">Tokens entrée</p>
              <p className="text-lg font-semibold tabular-nums">
                {tokenUsage.inputTokens.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/70 p-3">
              <p className="text-xs text-muted-foreground">Tokens sortie</p>
              <p className="text-lg font-semibold tabular-nums">
                {tokenUsage.outputTokens.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/70 p-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold tabular-nums">
                {(tokenUsage.inputTokens + tokenUsage.outputTokens).toLocaleString("fr-FR")}
              </p>
            </div>
          </div>
        </div>

        <div className="liquid-panel mt-6 rounded-2xl border border-white/30 bg-white/80 p-4 text-black backdrop-blur-2xl">
          <h3 className="text-base font-semibold">Tags de conversations</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Créez vos tags (max 20), nom limité à 20 caractères, avec couleur
            personnalisée.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {conversationTags.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                Aucun tag créé pour le moment.
              </span>
            ) : (
              conversationTags.map((tag) => (
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs"
                  key={tag.id}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                  <button
                    className="rounded-full p-0.5 text-muted-foreground transition hover:bg-black/10 hover:text-foreground"
                    onClick={() => {
                      setEditingTagId(tag.id);
                      setEditingTagName(tag.name);
                      setEditingTagColor(tag.color);
                    }}
                    type="button"
                  >
                    <PencilLine className="size-3" />
                  </button>
                  <button
                    className="rounded-full p-0.5 text-muted-foreground transition hover:bg-black/10 hover:text-foreground"
                    onClick={() =>
                      setConversationTags((current) =>
                        current.filter((item) => item.id !== tag.id)
                      )
                    }
                    type="button"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {editingTagId && (
            <div className="liquid-panel mt-3 rounded-xl border border-white/30 bg-white/70 p-3">
              <p className="text-xs font-medium text-foreground">
                Modifier le tag
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                <Input
                  maxLength={20}
                  onChange={(event) => setEditingTagName(event.target.value)}
                  value={editingTagName}
                />
                <Button
                  onClick={() => {
                    const safeName = editingTagName.trim().slice(0, 20);
                    if (!safeName) {
                      return;
                    }
                    setConversationTags((current) =>
                      current.map((tag) =>
                        tag.id === editingTagId
                          ? {
                              ...tag,
                              color: editingTagColor,
                              name: safeName,
                            }
                          : tag
                      )
                    );
                    setEditingTagId(null);
                    setEditingTagName("");
                  }}
                  type="button"
                  variant="outline"
                >
                  Enregistrer
                </Button>
                <Button
                  onClick={() => setEditingTagId(null)}
                  type="button"
                  variant="ghost"
                >
                  Annuler
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TAG_PALETTE.map((color) => (
                  <button
                    className={cn(
                      "h-5 w-5 rounded-full ring-1 ring-border/50 transition",
                      editingTagColor === color && "ring-2 ring-primary"
                    )}
                    key={`edit-${color}`}
                    onClick={() => setEditingTagColor(color)}
                    style={{ backgroundColor: color }}
                    type="button"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
            <Input
              maxLength={20}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="Nom du tag"
              value={newTagName}
            />
            <Button
              disabled={
                newTagName.trim().length === 0 || conversationTags.length >= 20
              }
              onClick={() => {
                const safeName = newTagName.trim().slice(0, 20);
                if (!safeName) {
                  return;
                }
                if (
                  conversationTags.some(
                    (tag) => tag.name.toLowerCase() === safeName.toLowerCase()
                  )
                ) {
                  return;
                }
                setConversationTags((current) => [
                  ...current,
                  {
                    id: crypto.randomUUID(),
                    name: safeName,
                    color: newTagColor,
                  },
                ]);
                setNewTagName("");
              }}
              type="button"
              variant="outline"
            >
              Créer le tag
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {TAG_PALETTE.map((color) => (
              <button
                className={cn(
                  "h-5 w-5 rounded-full ring-1 ring-border/50 transition",
                  newTagColor === color && "ring-2 ring-primary"
                )}
                key={color}
                onClick={() => setNewTagColor(color)}
                style={{ backgroundColor: color }}
                type="button"
              />
            ))}
          </div>
        </div>

        <h3 className="mt-6 text-base font-semibold">
          Activation Premium par code
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Aucune transaction financière directe n&apos;est traitée. Les forfaits
          premium sont débloqués uniquement via un code officiel.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full">
            <KeyRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => setActivationCode(event.target.value)}
              placeholder="Entrez votre code officiel"
              value={activationCode}
            />
          </div>
          <Button
            className="sm:w-fit"
            disabled={isActivating || activationCode.trim().length === 0}
            onClick={handleActivation}
            type="button"
          >
            {isActivating ? "Activation..." : "Activer le forfait"}
          </Button>
        </div>

        {activationMessage && (
          <p
            className={cn(
              "mt-3 text-sm",
              activationMessage.type === "success"
                ? "text-emerald-600"
                : "text-rose-600"
            )}
          >
            {activationMessage.text}
          </p>
        )}

        <div className="mt-6 rounded-xl border border-border/60 bg-background/60 p-3">
          <p className="text-sm font-medium">
            Position (localisation optionnelle)
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Personnalise certains contenus selon votre position.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              className="h-8"
              onClick={() => {
                navigator.geolocation.getCurrentPosition((pos) => {
                  window.localStorage.setItem(
                    POSITION_SETTINGS_STORAGE_KEY,
                    JSON.stringify({
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                      updatedAt: new Date().toISOString(),
                    })
                  );
                  createNotification({
                    level: "success",
                    message: "Position mise à jour.",
                    title: "Localisation",
                  });
                });
              }}
              size="sm"
              variant="outline"
            >
              Mettre à jour ma position
            </Button>
            <Button
              className="h-8"
              onClick={() => {
                window.localStorage.removeItem(POSITION_SETTINGS_STORAGE_KEY);
                createNotification({
                  level: "info",
                  message: "Données de position supprimées.",
                  title: "Localisation",
                });
              }}
              size="sm"
              variant="ghost"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "liquid-glass rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
          sectionVisibility("credits")
        )}
        id="credits"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Gauge className="size-5" />
          Crédits
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Suivi des crédits IA par tier, des tâches et des fichiers. Quiz illimités.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {creditMetrics.map((metric) => {
            const isUnlimited = metric.limit < 0;
            const consumed = isUnlimited
              ? 0
              : Math.min(metric.used, metric.limit);
            const remaining = isUnlimited ? Number.POSITIVE_INFINITY : Math.max(metric.limit - consumed, 0);
            const remainingRatio =
              metric.limit <= 0 || !Number.isFinite(remaining)
                ? 1
                : remaining / metric.limit;
            const resetDate = formatDateTime(getNextResetDate(metric.period));

            return (
              <article
                className="rounded-xl border border-border/50 bg-background/60 p-4"
                key={metric.key}
              >
                <p className="text-sm font-semibold">{metric.title}</p>
                <p
                  className={cn(
                    "mt-2 text-lg font-bold tabular-nums",
                    getCreditBadgeColor(remainingRatio)
                  )}
                >
                  {isUnlimited ? "Illimité" : `${remaining}/${metric.limit}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isUnlimited
                    ? "Accès sans limite"
                    : `Consommé: ${consumed} • Réinitialisation: ${resetDate}`}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-border/50 bg-background/60 p-4">
          <h3 className="text-sm font-semibold">Infos</h3>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            Les crédits du Tier 1 regroupent les modèles GPT-5.4, GPT-5.2,
            Mistral Large 3 tandis que le Tier 2 comporte GPT-5.1, GPT-5,
            Claude Sonnet 4.6, Claude Sonnet 4, DeepSeek 3.2, Kimi K2.5 et que
            le Tier 3 ont les modèles les moins performants, GPT-5.4 Mini,
            GPT-5.4 Nano, Claude Haïku 4.5.
          </p>
        </div>
      </section>

      <section
        className={cn(
          "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
          sectionVisibility("taches")
        )}
        id="taches"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <CalendarClock className="size-5" />
          Tâches — Programmateur de prompts automatiques
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Planifiez des prompts récurrents avec fréquence, date, titre et modèle
          IA. Quota : {tasks.length}/{maxScheduledTasks} tâche
          {maxScheduledTasks > 1 ? "s" : ""}.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input
            onChange={(event) => setTaskCommand(event.target.value)}
            placeholder='Commande IA (ex: "créer une tâche planifiée : réviser la physique demain à 18h")'
            value={taskCommand}
          />
          <Button onClick={handleTaskCommand} type="button" variant="outline">
            Pré-remplir via IA
          </Button>
          <Input
            onChange={(event) =>
              setTaskForm((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="Titre de la tâche (ex: Veille IA hebdomadaire)"
            value={taskForm.title}
          />
          <Input
            min={formatDateTimeLocalInput()}
            onChange={(event) =>
              setTaskForm((prev) => ({
                ...prev,
                nextRunAt: event.target.value,
              }))
            }
            type="datetime-local"
            value={taskForm.nextRunAt}
          />
          <select
            className="h-10 rounded-md border border-border/50 bg-background/80 px-3 text-sm"
            onChange={(event) =>
              setTaskForm((prev) => ({
                ...prev,
                frequency: event.target.value as ScheduledTask["frequency"],
              }))
            }
            value={taskForm.frequency}
          >
            {schedulerFrequencies.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-border/50 bg-background/80 px-3 text-sm"
            onChange={(event) =>
              setTaskForm((prev) => ({
                ...prev,
                model: event.target.value as ScheduledTask["model"],
              }))
            }
            value={taskForm.model}
          >
            {schedulerModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <Input
            onChange={(event) =>
              setTaskForm((prev) => ({ ...prev, notes: event.target.value }))
            }
            placeholder="Notes d'exécution (optionnel)"
            value={taskForm.notes}
          />
        </div>

        <Button className="mt-3" onClick={handleCreateTask} type="button">
          <PlusCircle className="mr-2 size-4" />
          Créer la tâche automatique
        </Button>

        {taskError && (
          <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
            {taskError}
          </p>
        )}

        <div className="mt-4 space-y-2">
          {tasks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">
              Aucune tâche planifiée. Créez votre premier programmateur
              automatique.
            </p>
          ) : (
            tasks.map((task) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 p-3"
                key={task.id}
              >
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-muted-foreground">
                    {task.frequency} • {task.model} • prochain lancement :{" "}
                    {new Date(task.nextRunAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Statut : {task.isEnabled ? "Actif" : "En pause"}
                  </p>
                  {task.notes ? (
                    <p className="text-xs text-muted-foreground">{task.notes}</p>
                  ) : null}
                  {task.lastRunAt ? (
                    <p className="text-xs text-muted-foreground">
                      Dernière exécution :{" "}
                      {new Date(task.lastRunAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleToggleTaskEnabled(task.id)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {task.isEnabled ? "Mettre en pause" : "Réactiver"}
                  </Button>
                  <Button
                    onClick={() => handleRunTaskNow(task.id)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Exécuter maintenant
                  </Button>
                  <Button
                    onClick={() => handleDeleteTask(task.id)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="mr-1 size-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section
        className={cn(
          "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
          sectionVisibility("apropos")
        )}
        id="apropos"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="size-5" />
          Communauté & support
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
            onChange={(event) => {
              const nextLanguage = resolveLanguage(event.target.value);
              setInterfaceLanguage(nextLanguage);
              setLanguageInStorage(nextLanguage);
              createNotification({
                level: "success",
                message: `Langue appliquée: ${nextLanguage.toUpperCase()}`,
                title: "Préférences",
              });
            }}
            value={interfaceLanguage}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Rejoignez le serveur Discord officiel pour poser vos questions,
          remonter des bugs et suivre les nouveautés.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            className="inline-flex rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
            href="https://discord.gg/fV7zwdGPpY"
            rel="noreferrer"
            target="_blank"
          >
            Ouvrir Discord mAI
          </a>
          <a
            className="inline-flex rounded-xl border border-indigo-600 bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            href="https://discord.com/oauth2/authorize?client_id=1494660523688591510&permissions=8&integration_type=0&scope=bot+applications.commands"
            rel="noreferrer"
            target="_blank"
          >
            Discuter avec mAI dans Discord
          </a>
        </div>
      </section>

      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md">
          <div className="liquid-glass w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 text-black shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-black">
                  Mémoire de l&apos;IA
                </h3>
                <p className="mt-1 text-xs text-black/65">
                  Ajoutez, modifiez et supprimez des mémoires (max{" "}
                  {maxMemoryEntries} selon votre forfait, plafond technique:{" "}
                  {ABSOLUTE_MAX_MEMORY_ENTRIES}).
                </p>
                <p className="mt-1 text-[11px] text-black/55">
                  Mode : {isAuthenticated ? "Synchronisation serveur" : "Local"}
                </p>
              </div>
              <button
                className="rounded-full border border-black/15 bg-white/70 p-1 text-black/55 transition hover:bg-white hover:text-black"
                onClick={() => {
                  setIsMemoryModalOpen(false);
                  resetMemoryEditor();
                }}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="memory-draft"
              >
                {memoryEditingIndex === null
                  ? "Nouvelle entrée"
                  : "Modifier l'entrée"}
              </label>
              <textarea
                className="min-h-28 w-full rounded-xl border border-black/15 bg-white p-3 text-sm text-black outline-none"
                id="memory-draft"
                maxLength={MAX_MEMORY_ENTRY_LENGTH}
                onChange={(event) => setMemoryDraft(event.target.value)}
                placeholder="Ex: Prioriser les plans d'action avec checklists et deadlines."
                value={memoryDraft}
              />
              <p className="text-right text-xs text-black/55">
                {memoryDraft.length}/{MAX_MEMORY_ENTRY_LENGTH}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={
                    memoryDraft.trim().length === 0 ||
                    (memoryEditingIndex === null &&
                      aiMemoryEntries.length >= maxMemoryEntries)
                  }
                  onClick={handleSaveMemoryEntry}
                  size="sm"
                  type="button"
                >
                  {memoryEditingIndex === null ? "Ajouter" : "Enregistrer"}
                </Button>
                {memoryEditingIndex !== null && (
                  <Button
                    onClick={resetMemoryEditor}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {isMemoryLoading ? (
                <p className="rounded-xl border border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">
                  Synchronisation de la mémoire...
                </p>
              ) : null}
              {memoryError ? (
                <p className="rounded-xl border border-red-500/30 bg-red-100 p-3 text-sm text-red-700">
                  {memoryError}
                </p>
              ) : null}
              {aiMemoryEntries.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">
                  Aucune mémoire enregistrée.
                </p>
              ) : (
                aiMemoryEntries.map((entry, index) => (
                  <div
                    className="rounded-xl border border-border/50 bg-background/60 p-3"
                    key={memoryEntryIds[index] ?? `memory-${index}`}
                  >
                    <p className="line-clamp-3 whitespace-pre-wrap text-sm">
                      {entry}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        onClick={() => handleEditMemoryEntry(index)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <PencilLine className="mr-1 size-4" />
                        Modifier
                      </Button>
                      <Button
                        onClick={() => handleDeleteMemoryEntry(index)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Trash2 className="mr-1 size-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="liquid-glass rounded-2xl border border-border/50 bg-card/70 p-4 text-center text-xs text-muted-foreground backdrop-blur-xl">
        <div className="flex flex-col items-center gap-3">
          <p>
            Version active : <strong>{APP_VERSION}</strong>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/privacy-policy">Politique de confidentialité</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/terms-of-use">Conditions d&apos;utilisation</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}