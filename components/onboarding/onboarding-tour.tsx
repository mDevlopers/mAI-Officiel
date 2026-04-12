"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  icon?: React.ReactNode;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bienvenue 👋",
    description: "Découvrez l'assistant IA qui vous accompagne dans tous vos projets de développement. Poser des questions, générer du code, déboguer en temps réel.",
    icon: <Sparkles className="w-8 h-8 text-blue-500" />,
  },
  {
    id: "chat",
    title: "Zone de discussion",
    description: "C'est ici que vous échangez avec l'IA. Écrivez votre demande, collez du code, ou glissez-déposez des fichiers pour commencer.",
    target: "prompt-input",
  },
  {
    id: "sidebar",
    title: "Historique et projets",
    description: "Retrouvez toutes vos conversations précédentes et gérez vos projets dans le menu latéral. Utilisez le bouton hamburger pour l'afficher/masquer.",
    target: "sidebar-trigger",
  },
  {
    id: "finish",
    title: "Prêt !",
    description: "Vous êtes maintenant prêt à utiliser toutes les fonctionnalités. N'hésitez pas à explorer et à expérimenter !",
  },
];

const ONBOARDING_COMPLETED_KEY = "onboarding_completed_v090";

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTooltips, setShowTooltips] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (!completed) {
      setTimeout(() => setIsOpen(true), 800);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const step = ONBOARDING_STEPS[currentStep];

  useEffect(() => {
    setShowTooltips(!!step.target);
  }, [step.target]);

  if (!isOpen) return null;

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {step.icon}
              {step.title}
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              {step.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2 py-2">
            {ONBOARDING_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentStep
                    ? "w-6 bg-primary"
                    : idx < currentStep
                    ? "w-3 bg-primary/60"
                    : "w-3 bg-muted"
                }`}
              />
            ))}
          </div>

          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleClose}>
                Passer
              </Button>
              <Button onClick={handleNext} className="gap-1">
                {currentStep === ONBOARDING_STEPS.length - 1 ? (
                  "Commencer"
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showTooltips && step.target && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Tooltip open={true}>
            <TooltipTrigger asChild>
              <div
                className="absolute w-16 h-16 rounded-full bg-primary/20 animate-pulse"
                style={{
                  top: "12px",
                  left: "12px",
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p>{step.description}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </TooltipProvider>
  );
}
