"use client";

import { useEffect, useState } from "react";
import { getQuizzlyProfile, claimDailyReward } from "@/lib/quizzly/actions";
import { toast } from "sonner";
import { Flame, Star, Diamond, Trophy } from "lucide-react";
import Link from "next/link";

export default function QuizzlyDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizzlyProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  const handleClaim = async () => {
    try {
      const res = await claimDailyReward();
      if (res.success) {
        toast.success(`Récompense réclamée : +${res.reward} Diamants !`);
        const p = await getQuizzlyProfile();
        setProfile(p);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-slate-500">
        Chargement de Quizzly...
      </div>
    );

  const xpForNextLevel = profile.level * 100;
  const progress = (profile.xp / xpForNextLevel) * 100;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Salut, {profile.pseudo} {profile.emoji}
          </h1>
          <p className="text-slate-500 mt-1">{profile.bio}</p>
        </div>
        <button
          onClick={handleClaim}
          className="bg-gradient-to-r from-orange-400 to-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          Récompense Quotidienne
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
            Niveau
          </span>
          <span className="text-3xl font-black text-slate-800">
            {profile.level}
          </span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <Flame className="w-8 h-8 text-orange-500 mb-2" />
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
            Série
          </span>
          <span className="text-3xl font-black text-slate-800">
            {profile.streak} <span className="text-lg">J</span>
          </span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <Diamond className="w-8 h-8 text-cyan-500 mb-2" />
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
            Diamants
          </span>
          <span className="text-3xl font-black text-slate-800">
            {profile.diamonds}
          </span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <Star className="w-8 h-8 text-yellow-400 mb-2" />
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
            Étoiles
          </span>
          <span className="text-3xl font-black text-slate-800">
            {profile.stars}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              Progression vers le niveau {profile.level + 1}
            </h3>
            <p className="text-slate-500 text-sm">
              {profile.xp} / {xpForNextLevel} XP
            </p>
          </div>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-violet-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-violet-200">
        <h2 className="text-2xl font-black mb-4">Prêt à faire un Quiz ?</h2>
        <p className="text-violet-200 mb-8 max-w-lg mx-auto">
          Gagne de l'XP en répondant correctement aux questions et grimpe les
          niveaux !
        </p>
        <Link
          href="/quizzly/play"
          className="inline-block bg-white text-violet-700 px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-lg"
        >
          Lancer une partie
        </Link>
      </div>
    </div>
  );
}
