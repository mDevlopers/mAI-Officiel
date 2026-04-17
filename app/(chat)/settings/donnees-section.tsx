import {
  Database,
  FileText,
  KeyRound,
  Lock,
  Mail,
  PencilLine,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DonneesSection(props: any) {
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
  } = props; // Placeholder for destructuring
  return (
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
          {parentalSettings.bedtimeWindowEndHour}h) : les actions sensibles sont
          temporairement bloquées.
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
          Protégez votre session sans vous reconnecter : vérification au
          chargement, PIN de reprise et déconnexion régulière.
        </p>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-xs">
            <input
              checked={securitySettings.securityCheckOnLoad}
              onChange={(event) =>
                setSecuritySettings((current: any) => ({
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
                setSecuritySettings((current: any) => ({
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
              setSecurityPinDraft(
                event.target.value.replace(/\D+/g, "").slice(0, 8)
              )
            }
            placeholder="Nouveau PIN (4-8)"
            type="password"
            value={securityPinDraft}
          />
          <Input
            inputMode="numeric"
            maxLength={8}
            onChange={(event) =>
              setSecurityPinConfirmDraft(
                event.target.value.replace(/\D+/g, "").slice(0, 8)
              )
            }
            placeholder="Confirmer PIN"
            type="password"
            value={securityPinConfirmDraft}
          />
          <Button
            onClick={handleSaveSecurityPin}
            type="button"
            variant="outline"
          >
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
                setSecuritySettings((current: any) => ({
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
          <Button
            onClick={handleDisableSecurityPin}
            type="button"
            variant="ghost"
          >
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
        <h3 className="text-sm font-semibold">
          Compteur de tokens (hors chat fantôme)
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Compte cumulatif de tous les échanges non fantômes (entrée/sortie).
        </p>
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
              {(
                tokenUsage.inputTokens + tokenUsage.outputTokens
              ).toLocaleString("fr-FR")}
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
            conversationTags.map((tag: any) => (
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
                    setConversationTags((current: any) =>
                      current.filter((item: any) => item.id !== tag.id)
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
                  setConversationTags((current: any) =>
                    current.map((tag: any) =>
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
              {TAG_PALETTE.map((color: any) => (
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
                  (tag: any) =>
                    tag.name.toLowerCase() === safeName.toLowerCase()
                )
              ) {
                return;
              }
              setConversationTags((current: any) => [
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
          {TAG_PALETTE.map((color: any) => (
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
            onClick={handleTogglePosition}
            size="sm"
            type="button"
            variant="outline"
          >
            {isResolvingPosition
              ? "Localisation..."
              : positionEnabled
                ? "Désactiver"
                : "Activer"}
          </Button>
          <Input
            className="max-w-xs"
            disabled={!positionEnabled}
            onChange={(event) => setPositionLabel(event.target.value)}
            placeholder="Coordonnées détectées"
            readOnly
            value={positionLabel}
          />
        </div>
      </div>
    </section>
  );
}
