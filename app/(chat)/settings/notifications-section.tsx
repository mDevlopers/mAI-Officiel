import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationsSection(props: any) {
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
  } = props; // Placeholder for destructuring
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
        sectionVisibility("notifications")
      )}
      id="notifications"
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Bell className="size-4 text-primary" />
        Notifications
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Choisissez les alertes que vous souhaitez recevoir dans l&apos;app.
      </p>

      <div className="mt-4 mb-4 flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium">Notifications système (PWA)</p>
        <p className="text-xs text-muted-foreground">
          Souhaitez-vous recevoir des notifications natives de l'application sur
          votre appareil ?
        </p>
        <button
          className="mt-2 w-fit rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={async () => {
            if ("Notification" in window) {
              const permission = await Notification.requestPermission();
              if (permission === "granted") {
                createNotification({
                  level: "success",
                  message: "Notifications activées avec succès !",
                });
              } else {
                createNotification({
                  level: "error",
                  message: "Permission refusée ou ignorée.",
                });
              }
            }
          }}
          type="button"
        >
          Activer les notifications système
        </button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {[
          {
            description: "Être alerté quand une réponse IA est prête.",
            key: "responseReady" as const,
            label: "Réponses",
          },
          {
            description: "Recevoir les rappels des tâches automatiques.",
            key: "scheduledTasks" as const,
            label: "Tâches",
          },
          {
            description: "Être notifié des mises à jour de la plateforme.",
            key: "projectUpdates" as const,
            label: "Plateforme",
          },
        ].map((notificationItem) => (
          <button
            className={cn(
              "rounded-xl border p-3 text-left text-sm transition-colors",
              notifications[notificationItem.key]
                ? "border-primary/40 bg-primary/10"
                : "border-border/50 bg-background/50"
            )}
            key={notificationItem.key}
            onClick={() =>
              handleNotificationToggle(
                notificationItem.key,
                !notifications[notificationItem.key]
              )
            }
            type="button"
          >
            <p className="font-medium">{notificationItem.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {notificationItem.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
