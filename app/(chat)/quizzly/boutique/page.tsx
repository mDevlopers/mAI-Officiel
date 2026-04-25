"use client";

import { Gift, Rocket, ShieldPlus, Star } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { useQuizzlyState } from "@/hooks/use-quizzly-state";

type ShopItem = {
  category: "boosters" | "stars" | "shields";
  cost: number;
  effect: string;
  id: string;
  label: string;
  useAction?: "addStar" | "addShield" | "xpBoost";
};

const items: ShopItem[] = [
  { category: "stars", cost: 40, effect: "+1 vie", id: "star-1", label: "1 Étoile", useAction: "addStar" },
  { category: "stars", cost: 180, effect: "+5 vies", id: "star-5", label: "Pack 5 Étoiles", useAction: "addStar" },
  { category: "boosters", cost: 120, effect: "XP x1.5", id: "boost-15", label: "Booster x1.5", useAction: "xpBoost" },
  { category: "boosters", cost: 220, effect: "XP x2", id: "boost-2", label: "Booster x2", useAction: "xpBoost" },
  { category: "shields", cost: 60, effect: "Protège 1 échec", id: "shield-1", label: "Bouclier", useAction: "addShield" },
];

export default function QuizzlyShopPage() {
  const { setState, state } = useQuizzlyState();

  const grouped = useMemo(
    () => ({
      boosters: items.filter((item) => item.category === "boosters"),
      shields: items.filter((item) => item.category === "shields"),
      stars: items.filter((item) => item.category === "stars"),
    }),
    []
  );

  const claimDaily = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (today === state.lastClaimDay) return;

    setState((previous) => ({
      ...previous,
      diamonds: previous.diamonds + 12,
      lastClaimDay: today,
    }));
  };

  const buy = (item: ShopItem) => {
    if (state.diamonds < item.cost) return;
    setState((previous) => ({
      ...previous,
      diamonds: previous.diamonds - item.cost,
      inventory: {
        ...previous.inventory,
        [item.id]: (previous.inventory[item.id] ?? 0) + 1,
      },
    }));
  };

  const useItem = (item: ShopItem) => {
    if ((state.inventory[item.id] ?? 0) <= 0) return;

    setState((previous) => {
      const remaining = Math.max(0, (previous.inventory[item.id] ?? 0) - 1);
      const nextInventory = { ...previous.inventory, [item.id]: remaining };

      if (item.useAction === "addStar") {
        const extra = item.id === "star-5" ? 5 : 1;
        return { ...previous, inventory: nextInventory, stars: Math.min(15, previous.stars + extra) };
      }

      if (item.useAction === "addShield") {
        return {
          ...previous,
          inventory: nextInventory,
          stars: Math.min(15, previous.stars + 1),
        };
      }

      return { ...previous, inventory: nextInventory };
    });
  };

  return (
    <section className="quizzly-fun space-y-4">
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-100 to-pink-100 p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-4xl font-black text-violet-700">BOUTIQUE QUIZZLY</h1>
          <div className="rounded-2xl border border-amber-300 bg-white px-4 py-2 text-2xl font-black text-amber-600">💎 {state.diamonds}</div>
        </div>
        <p className="mt-1 text-violet-700">Achète, utilise et améliore réellement ton expérience de jeu.</p>
        <button className="mt-4 inline-flex items-center rounded-xl bg-amber-400 px-4 py-2 font-semibold text-amber-950 hover:bg-amber-500" onClick={claimDaily} type="button"><Gift className="mr-2 size-4" />Réclamer +12 💎 (quotidien)</button>
      </div>

      {(["stars", "boosters", "shields"] as const).map((category) => (
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm" key={category}>
          <h2 className="mb-3 text-xl font-black capitalize text-violet-700">{category === "stars" ? "Étoiles" : category === "boosters" ? "Boosters" : "Boucliers"}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {grouped[category].map((item) => (
              <article className="rounded-xl border border-violet-100 bg-violet-50/40 p-4" key={item.id}>
                <div className="mb-3 flex items-center gap-2">
                  <Image alt="Quizzly" className="size-8 rounded" height={32} src="/logo.png" width={32} />
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.effect}</p>
                  </div>
                </div>
                <p className="text-sm">Prix: {item.cost} 💎</p>
                <p className="text-xs text-muted-foreground">Possédé: {state.inventory[item.id] ?? 0}</p>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-lg border border-violet-200 bg-white px-3 py-1 text-sm disabled:opacity-50" disabled={state.diamonds < item.cost} onClick={() => buy(item)} type="button">Acheter</button>
                  <button className="rounded-lg bg-violet-600 px-3 py-1 text-sm text-white disabled:opacity-50" disabled={(state.inventory[item.id] ?? 0) <= 0} onClick={() => useItem(item)} type="button">Utiliser</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm">
        <p><Star className="mr-1 inline size-4 text-amber-500" />Étoiles actuelles: {state.stars}</p>
        <p><ShieldPlus className="mr-1 inline size-4 text-cyan-700" />Boucliers: {state.inventory["shield-1"] ?? 0}</p>
        <p><Rocket className="mr-1 inline size-4 text-violet-700" />Boosters XP x2: {state.inventory["boost-2"] ?? 0}</p>
      </div>
    </section>
  );
}
