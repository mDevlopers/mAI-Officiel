"use client";

export const LANGUAGE_STORAGE_KEY = "mai.language.v1";

export const SUPPORTED_LANGUAGES = ["fr", "en", "es", "de", "it"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const fallbackLanguage: AppLanguage = "fr";

export const dictionary = {
  en: {
    notifications: "Notifications",
    noNotifications: "No notifications.",
    showNotifications: "Show notifications",
    ghostMode: "Ghost mode",
    ghostModeActive: "Ghost mode active",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Pure voice mode (Experimental)",
    voiceListening: "Listening...",
    voiceStart: "Start voice mode",
    voiceStop: "Stop",
    voiceTranscript: "Transcript",
    voiceSend: "Send to chat",
    voiceCaptions: "Subtitles",
    "errors.database": "An error occurred while executing a database query.",
    "errors.badRequestApi":
      "The request couldn't be processed. Please check your input and try again.",
    "errors.gateway":
      "AI Gateway requires a valid credit card on file to service requests.",
    "errors.authRequired": "You need to sign in before continuing.",
    "errors.authForbidden":
      "Your account does not have access to this feature.",
    "errors.rateLimit":
      "You've reached the message limit. Come back in 1 hour to continue chatting.",
    "errors.chatNotFound":
      "The requested chat was not found. Please check the chat ID and try again.",
    "errors.chatForbidden":
      "This chat belongs to another user. Please check the chat ID and try again.",
    "errors.chatUnauthorized":
      "You need to sign in to view this chat. Please sign in and try again.",
    "errors.offline":
      "We're having trouble sending your message. Please check your internet connection and try again.",
    "errors.documentNotFound":
      "The requested document was not found. Please check the document ID and try again.",
    "errors.documentForbidden":
      "This document belongs to another user. Please check the document ID and try again.",
    "errors.documentUnauthorized":
      "You need to sign in to view this document. Please sign in and try again.",
    "errors.documentBadRequest":
      "The request to create or update the document was invalid. Please check your input and try again.",
    "errors.default": "Something went wrong. Please try again later.",
  },
  es: {
    notifications: "Notificaciones",
    noNotifications: "Sin notificaciones.",
    showNotifications: "Mostrar notificaciones",
    ghostMode: "Modo Fantasma",
    ghostModeActive: "Modo Fantasma activo",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Modo voz pura (Experimental)",
    voiceListening: "Escuchando...",
    voiceStart: "Iniciar modo voz",
    voiceStop: "Detener",
    voiceTranscript: "Transcripción",
    voiceSend: "Enviar al chat",
    voiceCaptions: "Subtítulos",
    "errors.database":
      "Se ha producido un error al ejecutar una consulta en la base de datos.",
    "errors.badRequestApi":
      "No se ha podido procesar la solicitud. Por favor, comprueba tu entrada e inténtalo de nuevo.",
    "errors.gateway":
      "AI Gateway requiere una tarjeta de crédito válida para procesar solicitudes.",
    "errors.authRequired": "Debes iniciar sesión antes de continuar.",
    "errors.authForbidden": "Tu cuenta no tiene acceso a esta función.",
    "errors.rateLimit":
      "Has alcanzado el límite de mensajes. Vuelve en 1 hora para seguir chateando.",
    "errors.chatNotFound":
      "No se ha encontrado el chat solicitado. Por favor, comprueba el ID del chat e inténtalo de nuevo.",
    "errors.chatForbidden":
      "Este chat pertenece a otro usuario. Por favor, comprueba el ID del chat e inténtalo de nuevo.",
    "errors.chatUnauthorized":
      "Debes iniciar sesión para ver este chat. Por favor, inicia sesión e inténtalo de nuevo.",
    "errors.offline":
      "Tenemos problemas para enviar tu mensaje. Por favor, comprueba tu conexión a internet e inténtalo de nuevo.",
    "errors.documentNotFound":
      "No se ha encontrado el documento solicitado. Por favor, comprueba el ID del documento e inténtalo de nuevo.",
    "errors.documentForbidden":
      "Este documento pertenece a otro usuario. Por favor, comprueba el ID del documento e inténtalo de nuevo.",
    "errors.documentUnauthorized":
      "Debes iniciar sesión para ver este documento. Por favor, inicia sesión e inténtalo de nuevo.",
    "errors.documentBadRequest":
      "La solicitud para crear o actualizar el documento no es válida. Por favor, comprueba tu entrada e inténtalo de nuevo.",
    "errors.default":
      "Algo ha ido mal. Por favor, inténtalo de nuevo más tarde.",
  },
  fr: {
    notifications: "Notifications",
    noNotifications: "Aucune notification.",
    showNotifications: "Afficher les notifications",
    ghostMode: "Mode Fantôme",
    ghostModeActive: "Mode Fantôme actif",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Mode vocal pur (Expérimental)",
    voiceListening: "Écoute en cours…",
    voiceStart: "Lancer le mode vocal",
    voiceStop: "Arrêter",
    voiceTranscript: "Transcription",
    voiceSend: "Envoyer au chat",
    voiceCaptions: "Sous-titres",
    "errors.database":
      "Une erreur est survenue lors de l'exécution d'une requête dans la base de données.",
    "errors.badRequestApi":
      "La requête n'a pas pu être traitée. Veuillez vérifier votre saisie et réessayer.",
    "errors.gateway":
      "AI Gateway nécessite une carte de crédit valide pour traiter les requêtes.",
    "errors.authRequired": "Vous devez vous connecter avant de continuer.",
    "errors.authForbidden":
      "Votre compte n'a pas accès à cette fonctionnalité.",
    "errors.rateLimit":
      "Vous avez atteint la limite de messages. Revenez dans 1 heure pour continuer.",
    "errors.chatNotFound":
      "Le chat demandé est introuvable. Veuillez vérifier l'identifiant du chat et réessayer.",
    "errors.chatForbidden":
      "Ce chat appartient à un autre utilisateur. Veuillez vérifier l'identifiant du chat et réessayer.",
    "errors.chatUnauthorized":
      "Vous devez vous connecter pour voir ce chat. Veuillez vous connecter et réessayer.",
    "errors.offline":
      "Nous rencontrons des problèmes pour envoyer votre message. Veuillez vérifier votre connexion Internet et réessayer.",
    "errors.documentNotFound":
      "Le document demandé est introuvable. Veuillez vérifier l'identifiant du document et réessayer.",
    "errors.documentForbidden":
      "Ce document appartient à un autre utilisateur. Veuillez vérifier l'identifiant du document et réessayer.",
    "errors.documentUnauthorized":
      "Vous devez vous connecter pour voir ce document. Veuillez vous connecter et réessayer.",
    "errors.documentBadRequest":
      "La requête pour créer ou mettre à jour le document est invalide. Veuillez vérifier votre saisie et réessayer.",
    "errors.default": "Un problème est survenu. Veuillez réessayer plus tard.",
  },
  de: {
    notifications: "Benachrichtigungen",
    noNotifications: "Keine Benachrichtigungen.",
    showNotifications: "Benachrichtigungen anzeigen",
    ghostMode: "Geist-Modus",
    ghostModeActive: "Geist-Modus aktiv",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Reiner Sprachmodus (Experimentell)",
    voiceListening: "Zuhören...",
    voiceStart: "Sprachmodus starten",
    voiceStop: "Halt",
    voiceTranscript: "Transkript",
    voiceSend: "An Chat senden",
    voiceCaptions: "Untertitel",
    "errors.database": "Beim Ausführen einer Datenbankabfrage ist ein Fehler aufgetreten.",
    "errors.badRequestApi":
      "Die Anfrage konnte nicht verarbeitet werden. Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.",
    "errors.gateway":
      "AI Gateway erfordert eine gültige Kreditkarte, um Anfragen zu bearbeiten.",
    "errors.authRequired": "Sie müssen sich anmelden, bevor Sie fortfahren können.",
    "errors.authForbidden":
      "Ihr Konto hat keinen Zugriff auf diese Funktion.",
    "errors.rateLimit":
      "Sie haben das Nachrichtenlimit erreicht. Kommen Sie in 1 Stunde zurück, um weiter zu chatten.",
    "errors.chatNotFound":
      "Der angeforderte Chat wurde nicht gefunden. Bitte überprüfen Sie die Chat-ID und versuchen Sie es erneut.",
    "errors.chatForbidden":
      "Dieser Chat gehört einem anderen Benutzer. Bitte überprüfen Sie die Chat-ID und versuchen Sie es erneut.",
    "errors.chatUnauthorized":
      "Sie müssen sich anmelden, um diesen Chat anzuzeigen. Bitte melden Sie sich an und versuchen Sie es erneut.",
    "errors.offline":
      "Wir haben Probleme beim Senden Ihrer Nachricht. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.",
    "errors.documentNotFound":
      "Das angeforderte Dokument wurde nicht gefunden. Bitte überprüfen Sie die Dokument-ID und versuchen Sie es erneut.",
    "errors.documentForbidden":
      "Dieses Dokument gehört einem anderen Benutzer. Bitte überprüfen Sie die Dokument-ID und versuchen Sie es erneut.",
    "errors.documentUnauthorized":
      "Sie müssen sich anmelden, um dieses Dokument anzuzeigen. Bitte melden Sie sich an und versuchen Sie es erneut.",
    "errors.documentBadRequest":
      "Die Anfrage zum Erstellen oder Aktualisieren des Dokuments war ungültig. Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.",
    "errors.default": "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
  },
  it: {
    notifications: "Notifiche",
    noNotifications: "Nessuna notifica.",
    showNotifications: "Mostra notifiche",
    ghostMode: "Modalità fantasma",
    ghostModeActive: "Modalità fantasma attiva",
    voiceMode: "mAI Voice",
    voiceModeLabel: "Modalità voce pura (Sperimentale)",
    voiceListening: "In ascolto...",
    voiceStart: "Avvia modalità voce",
    voiceStop: "Ferma",
    voiceTranscript: "Trascrizione",
    voiceSend: "Invia alla chat",
    voiceCaptions: "Sottotitoli",
    "errors.database": "Si è verificato un errore durante l'esecuzione di una query nel database.",
    "errors.badRequestApi":
      "Impossibile elaborare la richiesta. Controlla l'input e riprova.",
    "errors.gateway":
      "AI Gateway richiede una carta di credito valida per elaborare le richieste.",
    "errors.authRequired": "Devi accedere prima di continuare.",
    "errors.authForbidden":
      "Il tuo account non ha accesso a questa funzione.",
    "errors.rateLimit":
      "Hai raggiunto il limite di messaggi. Torna tra 1 ora per continuare a chattare.",
    "errors.chatNotFound":
      "La chat richiesta non è stata trovata. Controlla l'ID della chat e riprova.",
    "errors.chatForbidden":
      "Questa chat appartiene a un altro utente. Controlla l'ID della chat e riprova.",
    "errors.chatUnauthorized":
      "Devi accedere per visualizzare questa chat. Accedi e riprova.",
    "errors.offline":
      "Abbiamo problemi a inviare il tuo messaggio. Controlla la tua connessione Internet e riprova.",
    "errors.documentNotFound":
      "Il documento richiesto non è stato trovato. Controlla l'ID del documento e riprova.",
    "errors.documentForbidden":
      "Questo documento appartiene a un altro utente. Controlla l'ID del documento e riprova.",
    "errors.documentUnauthorized":
      "Devi accedere per visualizzare questo documento. Accedi e riprova.",
    "errors.documentBadRequest":
      "La richiesta di creazione o aggiornamento del documento non è valida. Controlla l'input e riprova.",
    "errors.default": "Qualcosa è andato storto. Riprova più tardi.",
  },
} as const;

export type TranslationKey = keyof (typeof dictionary)["fr"];

export function resolveLanguage(value: string | null | undefined): AppLanguage {
  if (!value) {
    return fallbackLanguage;
  }

  return SUPPORTED_LANGUAGES.includes(value as AppLanguage)
    ? (value as AppLanguage)
    : fallbackLanguage;
}

export function getLanguageFromStorage(): AppLanguage {
  if (typeof window === "undefined") {
    return fallbackLanguage;
  }

  return resolveLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function setLanguageInStorage(language: AppLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  window.dispatchEvent(
    new CustomEvent("mai:language-updated", { detail: { language } })
  );
}

export function t(key: TranslationKey, language: AppLanguage): string {
  return dictionary[language][key] ?? dictionary.fr[key];
}
