"use client";

import { useBrandLogo, DEFAULT_BRAND_LOGO } from "@/hooks/use-brand-logo";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { cn } from "@/lib/utils";
import Image from "next/image";

const BRAND_LOGOS = [
  { id: "default", src: "/images/logo.png", label: "Défaut", color: "blue", requiresMax: true },
  { id: "bleu-blanc", src: "/images/logo-bleu-blanc.png", label: "Bleu & Blanc", color: "blue", requiresMax: true },
  { id: "bleu-noir", src: "/images/logo-bleu-noir.png", label: "Bleu & Noir", color: "blue", requiresMax: true },
  { id: "bleudegrade-blanc", src: "/images/logo-bleudégradé-blanc.png", label: "Bleu Dégradé & Blanc", color: "blue", requiresMax: true },
  { id: "bleudegrade-noir", src: "/images/logo-bleudégradé-noir.png", label: "Bleu Dégradé & Noir", color: "blue", requiresMax: true },

  { id: "noir", src: "/images/logo-noir.png", label: "Noir", color: "black", requiresMax: false },
  { id: "noir-blanc", src: "/images/logo-noir-blanc.png", label: "Noir & Blanc", color: "black", requiresMax: false },
  { id: "ai-star-black", src: "/images/ai-star-black.png", label: "Star Noir", color: "black", requiresMax: false },

  { id: "red-blanc", src: "/images/logo-red-blanc.png", label: "Rouge & Blanc", color: "red", requiresMax: false },
  { id: "red-noir", src: "/images/logo-red-noir.png", label: "Rouge & Noir", color: "red", requiresMax: false },
  { id: "reddegrade-blanc", src: "/images/logo-reddégradé-blanc.png", label: "Rouge Dégradé & Blanc", color: "red", requiresMax: false },
  { id: "reddegrade-noir", src: "/images/logo-reddégradé-noir.png", label: "Rouge Dégradé & Noir", color: "red", requiresMax: false },

  { id: "vert-blanc", src: "/images/logo-vert-blanc.png", label: "Vert & Blanc", color: "green", requiresMax: false },
  { id: "vert-noir", src: "/images/logo-vert-noir.png", label: "Vert & Noir", color: "green", requiresMax: false },

  { id: "violet-blanc", src: "/images/logo-violet-blanc.png", label: "Violet & Blanc", color: "purple", requiresMax: false },
  { id: "violet-noir", src: "/images/logo-violet-noir.png", label: "Violet & Noir", color: "purple", requiresMax: false },

  { id: "beta", src: "/images/logo-betamodels.png", label: "Beta", color: "other", requiresMax: false },
];

export function BrandLogoSelector() {
  const { logoUrl, updateLogo, isHydrated: isLogoHydrated } = useBrandLogo();
  const { plan, isHydrated: isPlanHydrated } = useSubscriptionPlan();

  if (!isLogoHydrated || !isPlanHydrated) {
    return <div className="mt-6 flex flex-col gap-2 opacity-50"><p className="text-sm font-medium">Chargement des logos...</p></div>;
  }

  const isMaxPlan = plan === "max";

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium">Logo de l&apos;application</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Choisissez le logo et favicon global de l&apos;application. Les logos bleus sont exclusifs au forfait Max.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {BRAND_LOGOS.map((logo) => {
          const isSelected = logoUrl === logo.src;
          const isDisabled = logo.requiresMax && !isMaxPlan;

          return (
            <button
              key={logo.id}
              onClick={() => {
                if (!isDisabled) {
                  updateLogo(logo.src);
                }
              }}
              disabled={isDisabled}
              title={isDisabled ? "Réservé au forfait Max" : logo.label}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-xl border p-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border/50 hover:border-primary/50 hover:bg-accent/50",
                isDisabled && "opacity-40 grayscale cursor-not-allowed"
              )}
            >
              <div className="relative size-10 rounded-lg overflow-hidden bg-white/10 p-1 flex items-center justify-center">
                <Image
                  src={logo.src}
                  alt={logo.label}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-[10px] text-center font-medium leading-tight line-clamp-2">
                {logo.label}
              </span>
              {isDisabled && (
                <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white shadow-sm">
                  MAX
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
