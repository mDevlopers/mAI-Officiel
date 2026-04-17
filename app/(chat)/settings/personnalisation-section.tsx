import { ListPlus, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PersonnalisationSection(props: any) {
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
    allowedReasoningPreferences,
    clampPercentage,
    aiMemoryEntries,
  } = props; // Placeholder for destructuring
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
        sectionVisibility("personnalisation")
      )}
      id="personnalisation"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <UserCircle2 className="size-4 text-primary" />
          Personnalisation
        </h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Personnalisez l&apos;IA et vos informations pour adapter ses réponses.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground" htmlFor="ai-name">
            Nom de l&apos;assistant IA
          </label>
          <Input
            id="ai-name"
            onChange={(event) => setAiName(event.target.value)}
            placeholder="Ex: mAI Copilot"
            value={aiName}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label
            className="text-xs text-muted-foreground"
            htmlFor="personality"
          >
            Personnalité (champ libre)
          </label>
          <textarea
            className="min-h-24 w-full rounded-md border border-border/50 bg-background/80 p-3 text-sm outline-none"
            id="personality"
            onChange={(event) => setAiPersonality(event.target.value)}
            placeholder="Ex: Ton rassurant, structuré, orienté solution et pédagogie."
            value={aiPersonality}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <p className="text-xs text-muted-foreground">Réflexion</p>
          <div className="rounded-xl border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">
              Disponible selon votre forfait : Free/Plus (Aucun, Léger), Pro (+
              Moyen), Max (+ Approfondi).
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  id: "none" as const,
                  label: "Aucun",
                  helper: "Par défaut",
                },
                {
                  id: "light" as const,
                  label: "Léger",
                  helper: "Forfaits Free et +",
                },
                {
                  id: "medium" as const,
                  label: "Moyen",
                  helper: "Forfaits Pro et Max",
                },
                {
                  id: "high" as const,
                  label: "Approfondi",
                  helper: "Forfait Max",
                },
              ].map((option) => {
                const isActive = reasoningPreference === option.id;
                const disabled = !allowedReasoningPreferences.includes(
                  option.id
                );

                return (
                  <button
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-xs transition",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/50 bg-background/60",
                      disabled && "cursor-not-allowed border-dashed opacity-60"
                    )}
                    disabled={disabled}
                    key={option.id}
                    onClick={() => setReasoningPreference(option.id)}
                    type="button"
                  >
                    <p className="font-medium">{option.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {option.helper}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="liquid-glass space-y-4 rounded-2xl border border-border/60 bg-background/70 p-4 md:col-span-2">
          <h3 className="text-base font-semibold">
            Personnalisation du comportement
          </h3>
          {[
            {
              id: "tone",
              label: "Ton",
              left: "Créatif / Libre",
              right: "Strict / Pro",
              value: aiBehavior.tone,
            },
            {
              id: "concision",
              label: "Concision",
              left: "Très détaillé",
              right: "Ultra concis",
              value: aiBehavior.concision,
            },
            {
              id: "register",
              label: "Registre Linguistique",
              left: "Familier",
              right: "Soutenu",
              value: aiBehavior.register,
            },
          ].map((behaviorItem) => (
            <div className="space-y-2" key={behaviorItem.id}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm text-muted-foreground">
                <span>{behaviorItem.left}</span>
                <span className="text-center">
                  {behaviorItem.label} ({behaviorItem.value}%)
                </span>
                <span className="text-right">{behaviorItem.right}</span>
              </div>
              <input
                className="w-full accent-foreground"
                max={100}
                min={0}
                onChange={(event) =>
                  setAiBehavior((prev: any) => ({
                    ...prev,
                    [behaviorItem.id]: clampPercentage(
                      Number(event.target.value)
                    ),
                  }))
                }
                step={1}
                type="range"
                value={behaviorItem.value}
              />
            </div>
          ))}
        </div>
        <div className="space-y-2 md:col-span-2">
          <label
            className="text-xs text-muted-foreground"
            htmlFor="personal-context"
          >
            Informations personnelles (champ libre)
          </label>
          <textarea
            className="min-h-24 w-full rounded-md border border-border/50 bg-background/80 p-3 text-sm outline-none"
            id="personal-context"
            onChange={(event) => setPersonalContext(event.target.value)}
            placeholder="Ex: 34 ans, passionné de randonnée, préfère des plans d'action concrets."
            value={personalContext}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <p className="text-xs text-muted-foreground">Mémoire IA</p>
          <div className="rounded-xl border border-border/60 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">
              {aiMemoryEntries.length}/{maxMemoryEntries} entrée
              {maxMemoryEntries > 1 ? "s" : ""} utilisée
              {maxMemoryEntries > 1 ? "s" : ""}. 500 caractères max par entrée.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                onClick={() => setIsMemoryModalOpen(true)}
                size="sm"
                type="button"
                variant="outline"
              >
                <ListPlus className="mr-1 size-4" />
                Ouvrir la mémoire
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
