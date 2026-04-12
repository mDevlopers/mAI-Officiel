"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Zap, Bug, CheckCircle2, ExternalLink } from "lucide-react";

const CURRENT_VERSION = "0.9.0";
const VERSION_SEEN_KEY = `whats_new_seen_${CURRENT_VERSION.replace(/\./g, "_")}`;

interface ReleaseNote {
  type: "feature" | "improvement" | "fix";
  title: string;
  description: string;
}

const RELEASE_NOTES: ReleaseNote[] = [
  {
    type: "feature",
    title: "Onboarding interactif",
    description: "Nouveau tutoriel pour les nouveaux utilisateurs avec tooltips sur les fonctionnalités principales.",
  },
  {
    type: "feature",
    title: "Support PWA complet",
    description: "Installez l'application sur votre écran d'accueil pour une expérience native.",
  },
  {
    type: "feature",
    title: "Gestionnaire de projets",
    description: "Organisez vos conversations par projet avec onglets et sauvegarde automatique.",
  },
  {
    type: "improvement",
    title: "Performance améliorée",
    description: "Chargement initial réduit de 40% et interactions plus fluides.",
  },
  {
    type: "improvement",
    title: "Nouveaux modèles IA",
    description: "Support des derniers modèles avec meilleure qualité de code et réponse plus rapide.",
  },
  {
    type: "improvement",
    title: "Mode hors ligne",
    description: "Accédez à votre historique même sans connexion internet.",
  },
  {
    type: "fix",
    title: "Corrections générales",
    description: "Plus de 30 bugs corrigés, amélioration de la stabilité et de l'éditeur de code.",
  },
];

export function WhatsNewPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(VERSION_SEEN_KEY);
    if (!seen) {
      setTimeout(() => setIsOpen(true), 1500);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(VERSION_SEEN_KEY, "true");
  };

  const getTypeIcon = (type: ReleaseNote["type"]) => {
    switch (type) {
      case "feature":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case "improvement":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "fix":
        return <Bug className="w-4 h-4 text-green-500" />;
    }
  };

  const getTypeBadge = (type: ReleaseNote["type"]) => {
    switch (type) {
      case "feature":
        return <Badge variant="secondary">Nouveau</Badge>;
      case "improvement":
        return <Badge variant="outline">Amélioration</Badge>;
      case "fix":
        return <Badge variant="default" className="bg-green-500">Correction</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Mise à jour terminée
            </div>
            <Badge variant="default" className="ml-auto">
              v{CURRENT_VERSION}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Découvrez les nouveautés de cette version
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-4">
          <div className="space-y-4 py-2">
            {RELEASE_NOTES.map((note, index) => (
              <div key={index}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getTypeIcon(note.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{note.title}</span>
                      {getTypeBadge(note.type)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {note.description}
                    </p>
                  </div>
                </div>
                {index < RELEASE_NOTES.length - 1 && (
                  <Separator className="my-3" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" className="gap-1.5">
            Voir les notes complètes
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button onClick={handleClose}>
            Compris !
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
