type ExtensionKey = "projects" | "library" | "translation";

import {
  Clock3,
  Lock,
  Puzzle,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ParentalSection(props: any) {
  const {
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
    creditMetrics,
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
    isParentalSessionUnlocked,
    setParentalSettings,
    extensionLabels,
    isAdvancedAccessRestricted,
  } = props; // Placeholder for destructuring
  return (
    <section
      className={cn(
        "liquid-glass rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
        sectionVisibility("parental")
      )}
      id="parental"
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <ShieldAlert className="size-4 text-primary" />
        Contrôle parental
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Définissez un code de verrouillage, contrôlez le temps
        d&apos;utilisation et limitez les options avancées.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Sécurisation
          </p>
          <div className="mt-2 space-y-2">
            <Input
              maxLength={8}
              onChange={(event) => setNewLockCode(event.target.value)}
              placeholder="Nouveau code (4 à 8 caractères)"
              type="password"
              value={newLockCode}
            />
            <Input
              maxLength={8}
              onChange={(event) => setConfirmLockCode(event.target.value)}
              placeholder="Confirmer le code"
              type="password"
              value={confirmLockCode}
            />
            <Button onClick={handleSetLockCode} type="button" variant="outline">
              <Lock className="mr-2 size-4" />
              Enregistrer le code
            </Button>
            <p className="text-xs text-muted-foreground">
              Protection active : {parentalSettings.enabled ? "Oui" : "Non"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Déverrouillage temporaire
          </p>
          <div className="mt-2 space-y-2">
            <Input
              maxLength={8}
              onChange={(event) => setUnlockCode(event.target.value)}
              placeholder="Entrer le code"
              type="password"
              value={unlockCode}
            />
            <Button
              onClick={handleUnlockParentalSection}
              type="button"
              variant="outline"
            >
              <ShieldCheck className="mr-2 size-4" />
              Déverrouiller 15 min
            </Button>
            <p className="text-xs text-muted-foreground">
              Session avancée :{" "}
              {isParentalSessionUnlocked
                ? `active jusqu'à ${formatDateTime(
                    new Date(parentalSettings.sessionUnlockedUntil)
                  )}`
                : "verrouillée"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Clock3 className="size-4" />
            Temps d&apos;utilisation
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Input
              min={15}
              onChange={(event) =>
                setParentalSettings((prev: any) => ({
                  ...prev,
                  dailyLimitMinutes: Math.max(
                    15,
                    Math.min(720, Number(event.target.value) || 15)
                  ),
                }))
              }
              type="number"
              value={parentalSettings.dailyLimitMinutes}
            />
            <span className="text-xs text-muted-foreground">min/jour</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Utilisé aujourd&apos;hui : {parentalSettings.usageMinutes} min
          </p>
          <Button
            className="mt-2"
            onClick={() =>
              setParentalSettings((prev: any) => ({ ...prev, usageMinutes: 0 }))
            }
            size="sm"
            type="button"
            variant="outline"
          >
            <TimerReset className="mr-2 size-4" />
            Réinitialiser le compteur
          </Button>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Puzzle className="size-4" />
            Modules actifs
          </p>
          <div className="mt-2 grid gap-2">
            {(Object.keys(extensionLabels) as ExtensionKey[]).map(
              (extensionKey) => (
                <button
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                    parentalSettings.extensions[extensionKey]
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/50 bg-background/60"
                  )}
                  disabled={isAdvancedAccessRestricted}
                  key={extensionKey}
                  onClick={() =>
                    setParentalSettings((prev: any) => ({
                      ...prev,
                      extensions: {
                        ...prev.extensions,
                        [extensionKey]: !prev.extensions[extensionKey],
                      },
                    }))
                  }
                  type="button"
                >
                  <span>{extensionLabels[extensionKey]}</span>
                  <span className="text-xs text-muted-foreground">
                    {parentalSettings.extensions[extensionKey]
                      ? "Activée"
                      : "Bloquée"}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border/60 bg-background/60 p-3">
        <button
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() =>
            setParentalSettings((prev: any) => ({
              ...prev,
              advancedSettingsLocked: !prev.advancedSettingsLocked,
            }))
          }
          type="button"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Settings2 className="size-4" />
            Limiter les paramètres avancés
          </span>
          <Badge variant="secondary">
            {parentalSettings.advancedSettingsLocked ? "Actif" : "Inactif"}
          </Badge>
        </button>
        <p className="mt-2 text-xs text-muted-foreground">
          Quand cette option est active, les actions sensibles sont bloquées
          tant qu&apos;un déverrouillage parental n&apos;est pas validé.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <button
          className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-3 text-left"
          onClick={() =>
            setParentalSettings((prev: any) => ({
              ...prev,
              bedtimeMode: !prev.bedtimeMode,
            }))
          }
          type="button"
        >
          <span className="text-sm font-medium">
            Mode coucher ({parentalSettings.bedtimeWindowStartHour}h-
            {parentalSettings.bedtimeWindowEndHour}h)
          </span>
          <Badge variant="secondary">
            {parentalSettings.bedtimeMode ? "Actif" : "Inactif"}
          </Badge>
        </button>
        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <p className="text-sm font-medium">Bonus week-end</p>
          <div className="mt-2 flex items-center gap-2">
            <Input
              min={0}
              onChange={(event) =>
                setParentalSettings((prev: any) => ({
                  ...prev,
                  weekendBonusMinutes: Math.max(
                    0,
                    Math.min(180, Number(event.target.value) || 0)
                  ),
                }))
              }
              type="number"
              value={parentalSettings.weekendBonusMinutes}
            />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <p className="text-sm font-medium">Début du mode coucher</p>
          <Input
            max={23}
            min={0}
            onChange={(event) =>
              setParentalSettings((prev: any) => ({
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
        </div>
        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <p className="text-sm font-medium">Fin du mode coucher</p>
          <Input
            max={23}
            min={0}
            onChange={(event) =>
              setParentalSettings((prev: any) => ({
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
  );
}
