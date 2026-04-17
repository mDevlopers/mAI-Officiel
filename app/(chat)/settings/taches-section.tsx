import { CalendarClock, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ScheduledTask = {
  createdAt: string;
  frequency: "quotidienne" | "hebdomadaire" | "mensuelle" | "ponctuelle";
  id: string;
  isEnabled: boolean;
  lastRunAt?: string;
  model: string;
  notes?: string;
  nextRunAt: string;
  title: string;
};

export function TachesSection(props: any) {
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
            setTaskForm((prev: any) => ({ ...prev, title: event.target.value }))
          }
          placeholder="Titre de la tâche (ex: Veille IA hebdomadaire)"
          value={taskForm.title}
        />
        <Input
          min={formatDateTimeLocalInput()}
          onChange={(event) =>
            setTaskForm((prev: any) => ({
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
            setTaskForm((prev: any) => ({
              ...prev,
              frequency: event.target.value as ScheduledTask["frequency"],
            }))
          }
          value={taskForm.frequency}
        >
          {schedulerFrequencies.map((frequency: any) => (
            <option key={frequency} value={frequency}>
              {frequency}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-border/50 bg-background/80 px-3 text-sm"
          onChange={(event) =>
            setTaskForm((prev: any) => ({
              ...prev,
              model: event.target.value as ScheduledTask["model"],
            }))
          }
          value={taskForm.model}
        >
          {schedulerModels.map((model: any) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
        <Input
          onChange={(event) =>
            setTaskForm((prev: any) => ({ ...prev, notes: event.target.value }))
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
          tasks.map((task: any) => (
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
  );
}
