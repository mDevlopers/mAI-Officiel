import { Camera, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTierRemaining } from "@/lib/ai/credits";
import { cn } from "@/lib/utils";

export function CompteSection(props: any) {
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
  } = props; // Placeholder for destructuring
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-xl",
        sectionVisibility("compte")
      )}
      id="compte"
    >
      <h2 className="text-lg font-semibold">Compte</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Connecté en tant que : {data?.user?.email ?? "Invité"}
      </p>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background/60 to-primary/5 p-4 shadow-sm backdrop-blur-xl">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Forfait actuel
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-primary/90 px-3 py-1 text-white hover:bg-primary/90">
            {isHydrated ? currentPlanDefinition.label : "Chargement..."}
          </Badge>
          {currentPlanDefinition.recommended && (
            <Badge className="rounded-full bg-violet-500/90 px-3 py-1 text-white hover:bg-violet-500/90">
              Recommandé
            </Badge>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {isHydrated
            ? `${getTierRemaining("tier1", plan, isAuthenticated).limit} Tier 1/j • ${getTierRemaining("tier2", plan, isAuthenticated).limit} Tier 2/j • ${getTierRemaining("tier3", plan, isAuthenticated).limit} Tier 3/j • Quiz illimités`
            : "Chargement du forfait..."}
        </p>

        {isHydrated && plan !== "max" && (
          <div className="mt-4 flex justify-center">
            <Button asChild className="rounded-full" variant="outline">
              <a href="/pricing">
                {plan === "free"
                  ? "Obtenir Plus"
                  : plan === "plus"
                    ? "Obtenir Pro"
                    : "Obtenir Max"}
              </a>
            </Button>
          </div>
        )}
      </div>

      <div className="liquid-panel mt-4 rounded-xl border border-border/60 bg-white p-3 text-black">
        <p className="text-sm font-medium">Installation PWA</p>
        <p className="mt-1 text-xs text-black/70">
          Installez mAI sur l&apos;écran d&apos;accueil pour un usage natif.
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            disabled={!deferredPwaPrompt}
            onClick={handleInstallPwa}
            size="sm"
            type="button"
            variant="outline"
          >
            <Download className="mr-2 size-4" />
            Installer mAI en PWA
          </Button>
          {deferredPwaPrompt ? (
            <Button
              onClick={() => setDeferredPwaPrompt(null)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Fermer
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-2">
          <div
            className="size-16 rounded-full border border-border/50 bg-cover bg-center shadow-sm"
            style={{
              backgroundImage: profileLogoDataUrl
                ? `url(${profileLogoDataUrl})`
                : "linear-gradient(135deg, oklch(0.72 0.19 248), oklch(0.66 0.15 168))",
            }}
          />
          <label
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-1 text-xs"
            htmlFor="profile-logo-input"
          >
            <Camera className="size-3.5" />
            Changer le logo
          </label>
          <input
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            id="profile-logo-input"
            onChange={handleProfileLogoUpload}
            type="file"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-xs text-muted-foreground"
            htmlFor="profile-name-input"
          >
            Nom de profil
          </label>
          <Input
            id="profile-name-input"
            maxLength={40}
            onChange={(event) => setProfileName(event.target.value)}
            placeholder="Ex: Dr. Lemaire"
            value={profileName}
          />
          <p className="text-xs text-muted-foreground">
            Ce nom est utilisé dans les en-têtes et interactions personnalisées.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-xs text-muted-foreground"
            htmlFor="ai-call-name"
          >
            Nom (comment l&apos;IA doit vous appeler)
          </label>
          <Input
            id="ai-call-name"
            onChange={(event) => setProfileName(event.target.value)}
            placeholder="Ex: Alex"
            value={profileName}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground" htmlFor="profession">
            Profession
          </label>
          <Input
            id="profession"
            onChange={(event) => setProfession(event.target.value)}
            placeholder="Ex: Product Designer"
            value={profession}
          />
        </div>
      </div>

      <div className="liquid-panel mt-4 rounded-xl border border-border/60 bg-background/60 p-3">
        <p className="text-sm font-medium">Affichage du compteur de saisie</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Affiche/masque les mots et caractères dans la barre de chat.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            onClick={() => handleWordCounterVisibility(true)}
            size="sm"
            type="button"
            variant={showWordCounter ? "default" : "outline"}
          >
            Afficher
          </Button>
          <Button
            onClick={() => handleWordCounterVisibility(false)}
            size="sm"
            type="button"
            variant={showWordCounter ? "outline" : "default"}
          >
            Masquer
          </Button>
        </div>
      </div>
    </section>
  );
}
