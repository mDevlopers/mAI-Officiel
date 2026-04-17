"use client";

import { PencilLine, Settings2, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import {
  getTierRemaining,
  getTierUsage,
  type ModelTier,
} from "@/lib/ai/credits";
import { APP_VERSION } from "@/lib/app-version";
import {
  CHAT_TAGS_STORAGE_KEY,
  TAG_DEFINITIONS_STORAGE_KEY,
  TAG_PALETTE,
  type TagDefinition,
} from "@/lib/chat-preferences";
import {
  LANGUAGE_STORAGE_KEY,
  resolveLanguage,
  setLanguageInStorage,
} from "@/lib/i18n";
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
import { AproposSection } from "./apropos-section";
import { CompteSection } from "./compte-section";
import { CreditsSection } from "./credits-section";
import { DonneesSection } from "./donnees-section";
import { NotificationsSection } from "./notifications-section";
import { ParentalSection } from "./parental-section";
import { PersonnalisationSection } from "./personnalisation-section";
import { TachesSection } from "./taches-section";

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
      isEnabled: typeof task.isEnabled === "boolean" ? task.isEnabled : true,
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
  const { data, status } = useSession();
  const {
    activateByCode,
    currentPlanDefinition,
    isActivating,
    isHydrated,
    plan,
  } = useSubscriptionPlan();

  const [activationCode, setActivationCode] = useState("");
  const [conversationTags, setConversationTags] = useState<TagDefinition[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState<string>(TAG_PALETTE[0]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [editingTagColor, setEditingTagColor] = useState<string>(
    TAG_PALETTE[0]
  );
  const [activationMessage, setActivationMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [taskCommand, setTaskCommand] = useState("");
  const [tasksHydrated, setTasksHydrated] = useState(false);
  const [taskForm, setTaskForm] = useState<{
    frequency: ScheduledTask["frequency"];
    model: ScheduledTask["model"];
    nextRunAt: string;
    notes: string;
    title: string;
  }>({
    frequency: "quotidienne",
    model: "openai/gpt-5.4",
    nextRunAt: "",
    notes: "",
    title: "",
  });
  const [chatBarSize, setChatBarSize] = useState<
    "compact" | "standard" | "large"
  >("compact");
  const [showWordCounter, setShowWordCounter] = useState(false);
  const [interfaceLanguage, setInterfaceLanguage] = useState("fr");
  const [profileName, setProfileName] = useState("");
  const [profileLogoDataUrl, setProfileLogoDataUrl] = useState<
    string | undefined
  >();
  const [profession, setProfession] = useState("");
  const [aiBehavior, setAiBehavior] = useState({
    concision: 50,
    register: 50,
    tone: 50,
  });
  const [aiPersonality, setAiPersonality] = useState("");
  const [personalContext, setPersonalContext] = useState("");
  const [reasoningPreference, setReasoningPreference] =
    useState<ReasoningPreference>("none");
  const [isReasoningPreferenceHydrated, setIsReasoningPreferenceHydrated] =
    useState(false);
  const [aiMemoryEntries, setAiMemoryEntries] = useState<string[]>([]);
  const [memoryEntryIds, setMemoryEntryIds] = useState<string[]>([]);
  const [isMemoryLoading, setIsMemoryLoading] = useState(false);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [memoryDraft, setMemoryDraft] = useState("");
  const [memoryEditingIndex, setMemoryEditingIndex] = useState<number | null>(
    null
  );
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [aiName, setAiName] = useState("mAI");
  const [activeSettingsSection, setActiveSettingsSection] = useState("compte");
  const [positionEnabled, setPositionEnabled] = useState(false);
  const [positionLabel, setPositionLabel] = useState("");
  const [isResolvingPosition, setIsResolvingPosition] = useState(false);
  const [notifications, setNotifications] = useState({
    projectUpdates: true,
    responseReady: true,
    scheduledTasks: true,
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
  const [tokenUsage, setTokenUsage] = useState({
    inputTokens: 0,
    outputTokens: 0,
  });
  const [fileUsageToday, setFileUsageToday] = useState(0);
  const [tierUsage, setTierUsage] = useState<Record<ModelTier, number>>({
    tier1: 0,
    tier2: 0,
    tier3: 0,
  });
  const [deferredPwaPrompt, setDeferredPwaPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    defaultSecuritySettings
  );
  const [securityPinDraft, setSecurityPinDraft] = useState("");
  const [securityPinConfirmDraft, setSecurityPinConfirmDraft] = useState("");
  const [securityFeedback, setSecurityFeedback] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const maxScheduledTasks = currentPlanDefinition.limits.taskSchedules;
  const maxMemoryEntries = getMemoryEntriesLimitForPlan(plan);
  const isAuthenticated = status === "authenticated" && Boolean(data?.user?.id);
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
    // Request notification permission if running as PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

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

    const sectionVisibility = (key: string) =>
      activeSettingsSection === key ? "block" : "hidden";
    return () => {
      window.removeEventListener("storage", refreshUsage);
      window.removeEventListener("mai:websearch-usage-updated", refreshUsage);
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

    // Synchronise les références de tags dans les conversations pour éviter
    // les IDs orphelins après suppression/édition.
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
      // Ignore un éventuel JSON invalide pour ne pas bloquer l'écran.
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
        setMemoryError("Impossible de synchroniser la mémoire serveur.");
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
    if (!isHydrated) {
      return;
    }
    const savedProfile = window.localStorage.getItem(
      PROFILE_SETTINGS_STORAGE_KEY
    );
    try {
      const parsed = savedProfile
        ? (JSON.parse(savedProfile) as Record<string, unknown>)
        : {};
      const toneDirective =
        aiBehavior.tone < 35
          ? "Ton créatif et libre."
          : aiBehavior.tone > 65
            ? "Ton strict et professionnel."
            : "Ton équilibré.";
      const concisionDirective =
        aiBehavior.concision < 35
          ? "Réponses très détaillées."
          : aiBehavior.concision > 65
            ? "Réponses ultra concises."
            : "Réponses de longueur équilibrée.";
      const registerDirective =
        aiBehavior.register < 35
          ? "Registre familier."
          : aiBehavior.register > 65
            ? "Registre soutenu."
            : "Registre linguistique neutre.";
      const behaviorDirective = [
        toneDirective,
        concisionDirective,
        registerDirective,
      ].join(" ");
      const nextSettings: ProfileSettingsShape = {
        ...(defaultProfileSettings as unknown as Record<string, unknown>),
        ...(parsed as Record<string, unknown>),
        aiMemory: aiMemoryEntries.join("\n"),
        aiMemoryEntries,
        aiBehavior,
        aiName: aiName.trim() || "mAI",
        aiPersonality,
        avatarDataUrl: profileLogoDataUrl,
        avatarId:
          typeof parsed.avatarId === "string" && parsed.avatarId.length > 0
            ? parsed.avatarId
            : defaultProfileSettings.avatarId,
        displayName: profileName.trim(),
        personalContext,
        profession,
        stylisticDirectives: [aiPersonality.trim(), behaviorDirective]
          .filter(Boolean)
          .join(" "),
        projectDescription:
          typeof parsed.projectDescription === "string"
            ? parsed.projectDescription
            : "",
        projectIconColor:
          typeof parsed.projectIconColor === "string"
            ? parsed.projectIconColor
            : "#60a5fa",
        projectTitle:
          typeof parsed.projectTitle === "string" ? parsed.projectTitle : "",
      };
      window.localStorage.setItem(
        PROFILE_SETTINGS_STORAGE_KEY,
        JSON.stringify(nextSettings)
      );
    } catch {
      // Si le stockage est corrompu, on le régénère proprement.
      window.localStorage.setItem(
        PROFILE_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          ...defaultProfileSettings,
          aiMemory: aiMemoryEntries.join("\n"),
          aiMemoryEntries,
          aiBehavior,
          aiName: aiName.trim() || "mAI",
          aiPersonality,
          avatarDataUrl: profileLogoDataUrl,
          displayName: profileName.trim(),
          personalContext,
          profession,
          stylisticDirectives: aiPersonality.trim(),
        })
      );
    }
  }, [
    aiMemoryEntries,
    aiBehavior,
    aiName,
    aiPersonality,
    isHydrated,
    personalContext,
    profession,
    profileLogoDataUrl,
    profileName,
  ]);

  useEffect(() => {
    const rawNotificationSettings = window.localStorage.getItem(
      NOTIFICATIONS_SETTINGS_STORAGE_KEY
    );
    if (!rawNotificationSettings) {
      return;
    }
    try {
      const parsed = JSON.parse(rawNotificationSettings) as Partial<
        typeof notifications
      >;
      setNotifications((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Silence: on conserve les valeurs par défaut.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      NOTIFICATIONS_SETTINGS_STORAGE_KEY,
      JSON.stringify(notifications)
    );
  }, [notifications]);

  useEffect(() => {
    setInterfaceLanguage(
      resolveLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
    );

    const syncLanguage = () => {
      setInterfaceLanguage(
        resolveLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
      );
    };

    window.addEventListener("storage", syncLanguage);
    window.addEventListener("mai:language-updated", syncLanguage);
    return () => {
      window.removeEventListener("storage", syncLanguage);
      window.removeEventListener("mai:language-updated", syncLanguage);
    };
  }, []);

  useEffect(() => {
    const parsed = parseSecuritySettings(
      window.localStorage.getItem(SECURITY_SETTINGS_STORAGE_KEY)
    );
    setSecuritySettings(parsed);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      SECURITY_SETTINGS_STORAGE_KEY,
      JSON.stringify(securitySettings)
    );
    window.dispatchEvent(
      new CustomEvent("mai:security-settings-updated", {
        detail: securitySettings,
      })
    );

    if (!securitySettings.enablePinLock) {
      window.localStorage.removeItem(SECURITY_LOCKED_FLAG_KEY);
    }
  }, [securitySettings]);

  useEffect(() => {
    const rawParentalSettings = window.localStorage.getItem(
      PARENTAL_SETTINGS_STORAGE_KEY
    );
    if (!rawParentalSettings) {
      return;
    }

    try {
      const parsed = JSON.parse(
        rawParentalSettings
      ) as Partial<ParentalSettings>;
      const parsedExtensions =
        (parsed.extensions as Partial<Record<ExtensionKey, boolean>>) ?? {};
      setParentalSettings({
        advancedSettingsLocked:
          typeof parsed.advancedSettingsLocked === "boolean"
            ? parsed.advancedSettingsLocked
            : defaultParentalSettings.advancedSettingsLocked,
        bedtimeMode:
          typeof parsed.bedtimeMode === "boolean"
            ? parsed.bedtimeMode
            : defaultParentalSettings.bedtimeMode,
        bedtimeWindowEndHour:
          typeof parsed.bedtimeWindowEndHour === "number" &&
          Number.isFinite(parsed.bedtimeWindowEndHour)
            ? Math.max(0, Math.min(23, Math.round(parsed.bedtimeWindowEndHour)))
            : defaultParentalSettings.bedtimeWindowEndHour,
        bedtimeWindowStartHour:
          typeof parsed.bedtimeWindowStartHour === "number" &&
          Number.isFinite(parsed.bedtimeWindowStartHour)
            ? Math.max(
                0,
                Math.min(23, Math.round(parsed.bedtimeWindowStartHour))
              )
            : defaultParentalSettings.bedtimeWindowStartHour,
        dailyLimitMinutes:
          typeof parsed.dailyLimitMinutes === "number" &&
          Number.isFinite(parsed.dailyLimitMinutes)
            ? Math.max(15, Math.min(720, Math.round(parsed.dailyLimitMinutes)))
            : defaultParentalSettings.dailyLimitMinutes,
        enabled:
          typeof parsed.enabled === "boolean"
            ? parsed.enabled
            : defaultParentalSettings.enabled,
        extensions: {
          library:
            typeof parsedExtensions.library === "boolean"
              ? parsedExtensions.library
              : defaultParentalSettings.extensions.library,
          projects:
            typeof parsedExtensions.projects === "boolean"
              ? parsedExtensions.projects
              : defaultParentalSettings.extensions.projects,
          translation:
            typeof parsedExtensions.translation === "boolean"
              ? parsedExtensions.translation
              : defaultParentalSettings.extensions.translation,
        },
        lockCodeHash:
          typeof parsed.lockCodeHash === "string" ? parsed.lockCodeHash : "",
        sessionUnlockedUntil:
          typeof parsed.sessionUnlockedUntil === "number"
            ? parsed.sessionUnlockedUntil
            : 0,
        usageMinutes:
          typeof parsed.usageMinutes === "number"
            ? Math.max(0, Math.round(parsed.usageMinutes))
            : 0,
        weekendBonusMinutes:
          typeof parsed.weekendBonusMinutes === "number" &&
          Number.isFinite(parsed.weekendBonusMinutes)
            ? Math.max(0, Math.min(180, Math.round(parsed.weekendBonusMinutes)))
            : defaultParentalSettings.weekendBonusMinutes,
      });
    } catch {
      // Fallback: on garde les paramètres parentaux par défaut en cas de JSON corrompu.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      PARENTAL_SETTINGS_STORAGE_KEY,
      JSON.stringify(parentalSettings)
    );
  }, [parentalSettings]);

  useEffect(() => {
    const raw = window.localStorage.getItem(POSITION_SETTINGS_STORAGE_KEY);
    if (!raw) {
      setPositionEnabled(
        localStorage.getItem("mai.geolocation-enabled") === "true"
      );
      setPositionLabel(localStorage.getItem("mai.geolocation-label") ?? "");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { enabled?: boolean; label?: string };
      setPositionEnabled(Boolean(parsed.enabled));
      setPositionLabel(typeof parsed.label === "string" ? parsed.label : "");
    } catch {
      setPositionEnabled(false);
      setPositionLabel("");
    }
  }, []);

  useEffect(() => {
    const refreshTokenUsage = () => {
      const raw = window.localStorage.getItem(TOKEN_USAGE_STORAGE_KEY);
      if (!raw) {
        setTokenUsage({ inputTokens: 0, outputTokens: 0 });
        return;
      }
      try {
        const parsed = JSON.parse(raw) as {
          inputTokens?: number;
          outputTokens?: number;
        };
        setTokenUsage({
          inputTokens: Math.max(0, Math.floor(parsed.inputTokens ?? 0)),
          outputTokens: Math.max(0, Math.floor(parsed.outputTokens ?? 0)),
        });
      } catch {
        setTokenUsage({ inputTokens: 0, outputTokens: 0 });
      }
    };

    refreshTokenUsage();
    window.addEventListener("storage", refreshTokenUsage);
    window.addEventListener("mai:token-usage-updated", refreshTokenUsage);
    return () => {
      window.removeEventListener("storage", refreshTokenUsage);
      window.removeEventListener("mai:token-usage-updated", refreshTokenUsage);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      POSITION_SETTINGS_STORAGE_KEY,
      JSON.stringify({ enabled: positionEnabled, label: positionLabel.trim() })
    );
    window.localStorage.setItem(
      "mai.geolocation-enabled",
      String(positionEnabled)
    );
    window.localStorage.setItem("mai.geolocation-label", positionLabel.trim());
  }, [positionEnabled, positionLabel]);

  const resolveBrowserLocation = async () => {
    if (!navigator.geolocation) {
      createNotification({
        level: "warning",
        message: "La géolocalisation n'est pas disponible sur ce navigateur.",
        source: "system",
        title: "Position",
      });
      return null;
    }

    return new Promise<{ latitude: number; longitude: number } | null>(
      (resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) =>
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10_000 }
        );
      }
    );
  };

  const handleTogglePosition = async () => {
    if (positionEnabled) {
      setPositionEnabled(false);
      setPositionLabel("");
      return;
    }

    setIsResolvingPosition(true);
    const position = await resolveBrowserLocation();
    setIsResolvingPosition(false);

    if (!position) {
      createNotification({
        level: "error",
        message:
          "Accès à la position refusé ou indisponible. Autorisez la localisation dans le navigateur.",
        source: "system",
        title: "Position",
      });
      return;
    }

    const nextLabel = `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;
    setPositionEnabled(true);
    setPositionLabel(nextLabel);
    createNotification({
      level: "success",
      message: `Position activée: ${nextLabel}`,
      source: "system",
      title: "Position",
    });
  };

  useEffect(() => {
    const storedChatBarSize = window.localStorage.getItem("mai.chatbar.size");
    if (
      storedChatBarSize === "compact" ||
      storedChatBarSize === "standard" ||
      storedChatBarSize === "large"
    ) {
      setChatBarSize(storedChatBarSize);
    }
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem("mai.show-word-counter");
    if (raw === "true") {
      setShowWordCounter(true);
      return;
    }
    if (raw === "false") {
      setShowWordCounter(false);
      return;
    }
    setShowWordCounter(false);
  }, []);

  useEffect(() => {
    const enabled = window.localStorage.getItem("mai-reasoning-enabled");
    const level = window.localStorage.getItem("mai-reasoning-level");
    setReasoningPreference(
      resolveReasoningPreferenceFromStorage(enabled, level)
    );
    setIsReasoningPreferenceHydrated(true);
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPwaPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!isReasoningPreferenceHydrated) {
      return;
    }

    if (!allowedReasoningPreferences.includes(reasoningPreference)) {
      setReasoningPreference(
        allowedReasoningPreferences[allowedReasoningPreferences.length - 1] ??
          "none"
      );
      return;
    }

    if (reasoningPreference === "none") {
      window.localStorage.setItem("mai-reasoning-enabled", "false");
      return;
    }

    window.localStorage.setItem("mai-reasoning-enabled", "true");
    window.localStorage.setItem(
      "mai-reasoning-level",
      reasoningLevelByPreference[reasoningPreference]
    );
  }, [
    allowedReasoningPreferences,
    isReasoningPreferenceHydrated,
    reasoningPreference,
  ]);

  useEffect(() => {
    // Évite d'écraser le stockage avant la première lecture locale.
    if (!tasksHydrated) {
      return;
    }
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, tasksHydrated]);

  useEffect(() => {
    if (!parentalSettings.enabled) {
      return;
    }

    // Incrément local du temps d'usage pour le contrôle parental (1 minute = 60_000 ms).
    const timerId = window.setInterval(() => {
      setParentalSettings((prev) => ({
        ...prev,
        usageMinutes: prev.usageMinutes + 1,
      }));
    }, 60_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [parentalSettings.enabled]);

  const handleActivation = async () => {
    const nextPlan = await activateByCode(activationCode);

    if (!nextPlan) {
      setActivationMessage({
        type: "error",
        text: "Code invalide. Utilisez un code officiel mAI (MAIPLUS26, MAIPRO26 ou MAIMAX26).",
      });
      return;
    }

    setActivationMessage({
      type: "success",
      text: `Activation réussie : vous êtes maintenant sur le forfait ${planDefinitions[nextPlan].label}.`,
    });
    setActivationCode("");
  };

  const handleCreateTask = () => {
    if (tasks.length >= maxScheduledTasks) {
      setTaskError(
        `Limite atteinte (${maxScheduledTasks} tâches) pour votre forfait ${currentPlanDefinition.label}.`
      );
      return;
    }

    if (!taskForm.title.trim()) {
      setTaskError("Ajoutez un titre avant de créer la tâche.");
      return;
    }

    if (!taskForm.nextRunAt) {
      setTaskError("Choisissez la date du prochain déclenchement.");
      return;
    }

    const taskDate = new Date(taskForm.nextRunAt);
    if (Number.isNaN(taskDate.getTime())) {
      setTaskError("Date invalide pour le programmateur.");
      return;
    }

    const nextTask: ScheduledTask = {
      createdAt: new Date().toISOString(),
      frequency: taskForm.frequency,
      id: crypto.randomUUID(),
      isEnabled: true,
      notes: taskForm.notes.trim(),
      model: taskForm.model,
      nextRunAt: taskForm.nextRunAt,
      title: taskForm.title.trim(),
    };

    setTasks((prev) =>
      [nextTask, ...prev].sort(
        (a, b) => +new Date(a.nextRunAt) - +new Date(b.nextRunAt)
      )
    );
    setTaskForm((prev) => ({ ...prev, notes: "", title: "" }));
    setTaskError(null);
    createNotification({
      level: "success",
      message: `Tâche planifiée créée: ${nextTask.title}`,
      source: "user",
      title: "Tâches",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    createNotification({
      level: "info",
      message: "Tâche planifiée supprimée.",
      source: "user",
      title: "Tâches",
    });
  };

  const computeNextRun = (
    sourceDateIso: string,
    frequency: ScheduledTask["frequency"]
  ): string => {
    const nextDate = new Date(sourceDateIso);
    if (frequency === "quotidienne") {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (frequency === "hebdomadaire") {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (frequency === "mensuelle") {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate.toISOString().slice(0, 16);
  };

  const handleRunTaskNow = (taskId: string) => {
    const nowIso = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              lastRunAt: nowIso,
              nextRunAt:
                task.frequency === "ponctuelle"
                  ? task.nextRunAt
                  : computeNextRun(task.nextRunAt, task.frequency),
            }
          : task
      )
    );
  };

  const handleToggleTaskEnabled = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isEnabled: !task.isEnabled } : task
      )
    );
  };

  const handleTaskCommand = () => {
    const parsed = parseTaskCommand(taskCommand);
    if (!parsed) {
      setTaskError(
        "Commande vide. Essayez : créer une tâche planifiée demain à 18h."
      );
      return;
    }

    setTaskForm((prev) => ({
      ...prev,
      frequency: parsed.frequency,
      nextRunAt: parsed.date ?? prev.nextRunAt,
      title: parsed.title,
    }));
    setTaskCommand("");
    setTaskError(null);
  };

  const handleChatBarSizeChange = (size: "compact" | "standard" | "large") => {
    setChatBarSize(size);
    window.localStorage.setItem("mai.chatbar.size", size);
  };

  const handleWordCounterVisibility = (nextValue: boolean) => {
    setShowWordCounter(nextValue);
    window.localStorage.setItem("mai.show-word-counter", String(nextValue));
  };

  const handleInstallPwa = async () => {
    if (!deferredPwaPrompt) {
      return;
    }
    await deferredPwaPrompt.prompt();
    await deferredPwaPrompt.userChoice;
    setDeferredPwaPrompt(null);
  };

  const handleProfileLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (typeof fileReader.result === "string") {
        setProfileLogoDataUrl(fileReader.result);
      }
    };
    fileReader.readAsDataURL(selectedFile);
  };

  const handleNotificationToggle = (
    key: keyof typeof notifications,
    value: boolean
  ) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const resetMemoryEditor = () => {
    setMemoryDraft("");
    setMemoryEditingIndex(null);
  };

  const handleSaveMemoryEntry = async () => {
    const sanitizedDraft = memoryDraft.trim().slice(0, MAX_MEMORY_ENTRY_LENGTH);
    if (!sanitizedDraft) {
      return;
    }

    setMemoryError(null);

    if (!isAuthenticated) {
      if (memoryEditingIndex !== null) {
        setAiMemoryEntries((prev) =>
          prev.map((entry, index) =>
            index === memoryEditingIndex ? sanitizedDraft : entry
          )
        );
        resetMemoryEditor();
        return;
      }

      if (aiMemoryEntries.length >= maxMemoryEntries) {
        return;
      }

      setAiMemoryEntries((prev) => [...prev, sanitizedDraft]);
      setMemoryEntryIds((prev) => [...prev, `local-memory-${Date.now()}`]);
      resetMemoryEditor();
      return;
    }

    if (memoryEditingIndex !== null) {
      const memoryId = memoryEntryIds[memoryEditingIndex];
      if (!memoryId) {
        return;
      }

      const response = await fetch(`/api/memory/${memoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: sanitizedDraft,
          type: "manual",
        }),
      });

      if (!response.ok) {
        // Fallback local pour éviter de bloquer l'utilisateur si l'API échoue.
        setAiMemoryEntries((prev) =>
          prev.map((entry, index) =>
            index === memoryEditingIndex ? sanitizedDraft : entry
          )
        );
        setMemoryError(
          "API indisponible : modification enregistrée localement uniquement."
        );
        return;
      }

      setAiMemoryEntries((prev) =>
        prev.map((entry, index) =>
          index === memoryEditingIndex ? sanitizedDraft : entry
        )
      );
      resetMemoryEditor();
      return;
    }

    if (aiMemoryEntries.length >= maxMemoryEntries) {
      return;
    }

    const response = await fetch("/api/memory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: sanitizedDraft,
        type: "manual",
      }),
    });

    if (!response.ok) {
      // Fallback local pour continuer à utiliser la mémoire même en cas d'erreur API.
      setAiMemoryEntries((prev) => [...prev, sanitizedDraft]);
      setMemoryEntryIds((prev) => [...prev, `local-memory-${Date.now()}`]);
      setMemoryError("API indisponible : entrée sauvegardée localement.");
      resetMemoryEditor();
      return;
    }

    const created = (await response.json()) as PersistedMemoryEntry;
    setAiMemoryEntries((prev) => [...prev, created.content]);
    setMemoryEntryIds((prev) => [...prev, created.id]);
    resetMemoryEditor();
  };

  const handleEditMemoryEntry = (index: number) => {
    setMemoryEditingIndex(index);
    setMemoryDraft(aiMemoryEntries[index] ?? "");
  };

  const handleDeleteMemoryEntry = async (index: number) => {
    const memoryId = memoryEntryIds[index];
    if (!memoryId) {
      return;
    }

    if (!isAuthenticated || memoryId.startsWith("local-memory-")) {
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
    isAdvancedAccessRestricted ||
    isUsageLimitReached ||
    isBedtimeRestrictionActive;

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

  const allProps = {
    sectionVisibility,
    handleProfileLogoUpload,
    profileLogoDataUrl,
    profileName,
    setProfileName,
    profession,
    setProfession,
    aiBehavior,
    setAiBehavior,
    aiPersonality,
    setAiPersonality,
    personalContext,
    setPersonalContext,
    isMemoryLoading,
    memoryError,
    memoryEntryIds,
    handleEditMemoryEntry,
    handleDeleteMemoryEntry,
    maxMemoryEntries,
    memoryDraft,
    setMemoryDraft,
    handleSaveMemoryEntry,
    setMemoryEditingIndex,
    memoryEditingIndex,
    isMemoryModalOpen,
    setIsMemoryModalOpen,
    aiName,
    setAiName,
    positionEnabled,
    handleTogglePosition,
    positionLabel,
    isResolvingPosition,
    notifications,
    handleNotificationToggle,
    deferredPwaPrompt,
    handleInstallPwa,
    parentalSettings,
    parentalFeedback,
    handleUnlockParentalSection,
    unlockCode,
    setUnlockCode,
    newLockCode,
    setNewLockCode,
    confirmLockCode,
    setConfirmLockCode,
    handleSetLockCode,
    tokenUsage,
    fileUsageToday,
    tierUsage,
    formatDateTime,
    getNextResetDate,
    getCreditBadgeColor,
    tasks,
    maxScheduledTasks,
    taskCommand,
    setTaskCommand,
    handleTaskCommand,
    taskForm,
    setTaskForm,
    formatDateTimeLocalInput,
    schedulerFrequencies,
    schedulerModels,
    handleCreateTask,
    taskError,
    handleToggleTaskEnabled,
    handleRunTaskNow,
    handleDeleteTask,
    chatBarSize,
    handleChatBarSizeChange,
    showWordCounter,
    handleWordCounterVisibility,
    resolveLanguage,
    setInterfaceLanguage,
    setLanguageInStorage,
    createNotification,
    interfaceLanguage,
    APP_VERSION,
    data,
    isHydrated,
    currentPlanDefinition,
    plan,
    isActivating,
    activationCode,
    setActivationCode,
    handleActivation,
    activationMessage,
    isReasoningPreferenceHydrated,
    reasoningPreference,
    setReasoningPreference,
    isAuthenticated,
    setDeferredPwaPrompt,
    isUsageLimitReached,
    isAdvancedAccessRestricted,
    securitySettings,
    handleDisableSecurityPin,
    securityPinDraft,
    setSecurityPinDraft,
    securityPinConfirmDraft,
    setSecurityPinConfirmDraft,
    handleSaveSecurityPin,
    securityFeedback,
    isBedtimeRestrictionActive,
    isDataAccessRestricted,
    setSecuritySettings,
    conversationTags,
    editingTagId,
    editingTagName,
    setEditingTagName,
    editingTagColor,
    setEditingTagColor,
    TAG_PALETTE,
    newTagName,
    setNewTagName,
    newTagColor,
    setNewTagColor,
    setEditingTagId,
    setConversationTags,
    setPositionLabel,
    isParentalSessionUnlocked,
    setParentalSettings,
    extensionLabels,
    allowedReasoningPreferences,
    clampPercentage,
    aiMemoryEntries,
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-6 overflow-y-auto p-6 md:p-10">
      <div className="flex items-center gap-3">
        <Settings2 className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </div>

      <CompteSection {...allProps} />
      <NotificationsSection {...allProps} />
      <PersonnalisationSection {...allProps} />
      <ParentalSection {...allProps} />
      <DonneesSection {...allProps} />
      <CreditsSection {...allProps} />
      <TachesSection {...allProps} />
      <AproposSection {...allProps} />

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
