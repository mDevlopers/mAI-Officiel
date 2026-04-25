"use client";

import { useState } from "react";

const items = [
  { id: "star-1", label: "1 Étoile", cost: 50 },
  { id: "star-5", label: "Pack 5 Étoiles", cost: 200 },
  { id: "boost-15", label: "Booster x1.5", cost: 100 },
  { id: "shield-1", label: "Bouclier 1j", cost: 25 },
];

export default function QuizzlyShopPage() {
  const [diamonds, setDiamonds] = useState(0);
  const [lastClaimDay, setLastClaimDay] = useState("");

  const claimDaily = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (today === lastClaimDay) return;
    setLastClaimDay(today);
    setDiamonds((current) => current + 5);
  };

  return (
    <section className="space-y-4">
      <div className="liquid-glass rounded-2xl p-5">
        <h1 className="text-4xl font-black text-violet-600">BOUTIQUE 💎</h1>
        <p className="mt-1">Diamants: <strong>{diamonds}</strong></p>
        <button className="mt-3 rounded-xl bg-amber-400 px-4 py-2 font-semibold" onClick={claimDaily} type="button">Récompense quotidienne +5 💎</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article className="liquid-glass rounded-xl border p-4" key={item.id}>
            <p className="font-semibold">{item.label}</p>
            <p className="text-sm text-muted-foreground">Coût: {item.cost} 💎</p>
            <button className="mt-3 rounded-lg border px-3 py-1 text-sm" disabled={diamonds < item.cost} onClick={() => setDiamonds((current) => current - item.cost)} type="button">Acheter</button>
          </article>
        ))}
      </div>
    </section>
  );
}
