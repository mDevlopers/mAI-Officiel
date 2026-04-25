"use client";

import { Flame, Gem, Zap } from "lucide-react";
import { useMemo } from "react";
import { useQuizzlyState } from "@/hooks/use-quizzly-state";
import { getDailyQuests, getWeeklyQuests } from "@/lib/quizzly/quests";

export default function QuizzlyQuestsPage() {
  const { state } = useQuizzlyState();
  const daily = useMemo(() => getDailyQuests(new Date(), 5), []);
  const weekly = useMemo(() => getWeeklyQuests(new Date(), 5), []);

  return (
    <section className="quizzly-fun space-y-4">
      <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-100 to-orange-100 p-5 text-center shadow-lg">
        <h1 className="text-4xl font-black text-violet-700">TES QUÊTES</h1>
        <p className="mt-1 text-violet-600">Accomplis des missions pour booster ton apprentissage.</p>
        <p className="mt-2 text-sm">Niveau {state.level} • XP {state.xp} • 💎 {state.diamonds}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
          <h2 className="flex items-center gap-2 text-2xl font-black text-orange-700"><Flame className="size-5" />Quotidiennes</h2>
          {daily.map((quest, index) => {
            const progress = Math.min(quest.target, Math.floor((state.streak + index) % (quest.target + 1)));
            const percent = Math.round((progress / quest.target) * 100);
            return (
              <article className="rounded-2xl border border-orange-100 bg-white p-4" key={quest.id}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{quest.label}</p>
                  <p className="font-bold text-violet-600">+{quest.xp} XP</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Progression {progress}/{quest.target}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-orange-400" style={{ width: `${percent}%` }} /></div>
                <div className="mt-3 rounded-lg bg-orange-100 px-3 py-2 text-center text-sm">{percent >= 100 ? "Terminé" : "En cours"}</div>
              </article>
            );
          })}
        </div>

        <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <h2 className="flex items-center gap-2 text-2xl font-black text-amber-700"><Zap className="size-5" />Hebdomadaires</h2>
          {weekly.map((quest, index) => {
            const progress = Math.min(quest.target, Math.floor((state.level + state.streak + index) % (quest.target + 1)));
            const percent = Math.round((progress / quest.target) * 100);
            return (
              <article className="rounded-2xl border border-amber-100 bg-white p-4" key={quest.id}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{quest.label}</p>
                  <p className="font-bold text-violet-600">+{quest.xp} XP</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Progression {progress}/{quest.target}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-amber-400" style={{ width: `${percent}%` }} /></div>
                <div className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-center text-sm">{percent >= 100 ? "Terminé" : "En cours"}</div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-800">
        <Gem className="mr-1 inline size-4" />Astuce: cumule des quêtes et utilise les boosters de la boutique pour accélérer ta progression.
      </div>
    </section>
  );
}
