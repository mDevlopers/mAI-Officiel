"use client";

import { BarChart3, Gem, Medal, Shield, Star, Users } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { useQuizzlyState } from "@/hooks/use-quizzly-state";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";

const planBadges = [
  { id: "plus", label: "Un petit Plus", rarity: "Peu commun" },
  { id: "pro", label: "Je suis Pro", rarity: "Rare" },
  { id: "max", label: "Productivité Maximale", rarity: "Légendaire" },
] as const;

export default function QuizzlyDataPage() {
  const { state, totalOwnedItems } = useQuizzlyState();
  const { plan } = useSubscriptionPlan();

  const unlocked = useMemo(() => {
    if (plan === "max") return new Set(["plus", "pro", "max"]);
    if (plan === "pro") return new Set(["plus", "pro"]);
    if (plan === "plus") return new Set(["plus"]);
    return new Set<string>();
  }, [plan]);

  return (
    <section className="quizzly-fun space-y-4">
      <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-100 to-cyan-100 p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <Image alt="Quizzly" className="size-10 rounded-lg" height={40} src="/logo.png" width={40} />
          <h1 className="text-3xl font-black text-violet-700">Statistiques Quizzly</h1>
        </div>
        <p className="mt-1 text-sm text-violet-600">Ton tableau de progression et tes badges mAI généraux.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-violet-100 bg-white p-4"><p className="text-xs text-muted-foreground">Niveau</p><p className="text-2xl font-black text-violet-700">{state.level}</p></article>
        <article className="rounded-2xl border border-violet-100 bg-white p-4"><p className="text-xs text-muted-foreground">XP total</p><p className="text-2xl font-black text-sky-700">{state.xp}</p></article>
        <article className="rounded-2xl border border-violet-100 bg-white p-4"><p className="text-xs text-muted-foreground">Diamants</p><p className="text-2xl font-black text-amber-600">{state.diamonds}</p></article>
        <article className="rounded-2xl border border-violet-100 bg-white p-4"><p className="text-xs text-muted-foreground">Inventaire</p><p className="text-2xl font-black text-emerald-600">{totalOwnedItems}</p></article>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-4">
          <h2 className="flex items-center gap-2 text-lg font-black text-fuchsia-700"><BarChart3 className="size-4" />Progression</h2>
          <p className="mt-2 text-sm">⭐ Étoiles: {state.stars}</p>
          <p className="text-sm">🔥 Série: {state.streak}</p>
          <p className="text-sm"><Users className="mr-1 inline size-4" />Amis: {state.friends.length}</p>
        </article>
        <article className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
          <h2 className="flex items-center gap-2 text-lg font-black text-cyan-700"><Gem className="size-4" />Objets actifs</h2>
          <p className="mt-2 text-sm"><Shield className="mr-1 inline size-4" />Bouclier: {state.inventory["shield-1"] ?? 0}</p>
          <p className="text-sm"><Star className="mr-1 inline size-4" />Boost x2: {state.inventory["boost-2"] ?? 0}</p>
        </article>
      </div>

      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
        <h2 className="flex items-center gap-2 text-xl font-black text-amber-700"><Medal className="size-5" />Badges généraux mAI</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {planBadges.map((badge) => {
            const isUnlocked = unlocked.has(badge.id);
            return (
              <article className="rounded-xl border border-amber-200 bg-white p-3" key={badge.id}>
                <p className="font-semibold">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.rarity}</p>
                <p className="mt-2 text-xs font-semibold">{isUnlocked ? "Débloqué" : "Verrouillé"}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
