import { getDailyQuests, getWeeklyQuests } from "@/lib/quizzly/quests";

export default function QuizzlyQuestsPage() {
  const daily = getDailyQuests(new Date(), 5);
  const weekly = getWeeklyQuests(new Date(), 5);

  return (
    <section className="space-y-4">
      <div className="liquid-glass rounded-2xl p-5">
        <h1 className="text-4xl font-black text-violet-600">TES QUÊTES</h1>
        <p className="text-muted-foreground">200 quêtes quotidiennes alternées + 200 hebdo réinitialisées le lundi.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-3">
          {daily.map((quest) => (
            <article className="liquid-glass rounded-xl border p-4" key={quest.id}><p className="font-semibold">{quest.label}</p><p className="text-sm text-violet-600">+{quest.xp} XP</p></article>
          ))}
        </div>
        <div className="space-y-3">
          {weekly.map((quest) => (
            <article className="liquid-glass rounded-xl border p-4" key={quest.id}><p className="font-semibold">{quest.label}</p><p className="text-sm text-violet-600">+{quest.xp} XP</p></article>
          ))}
        </div>
      </div>
    </section>
  );
}
