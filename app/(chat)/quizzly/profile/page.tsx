"use client";

import { Camera, Medal, UserRound } from "lucide-react";
import Image from "next/image";
import { useQuizzlyState } from "@/hooks/use-quizzly-state";

export default function QuizzlyProfilePage() {
  const { setPartial, state } = useQuizzlyState();

  return (
    <section className="quizzly-fun space-y-4">
      <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-100 to-fuchsia-100 p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <Image alt="Quizzly" className="size-10 rounded-lg" height={40} src="/logo.png" width={40} />
          <h1 className="text-3xl font-black text-violet-700">Mon Profil</h1>
        </div>
        <p className="mt-1 text-sm text-violet-600">Personnalise ton avatar et ton identité de champion.</p>
      </div>

      <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow">
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-violet-300 bg-violet-50 text-4xl">
            {state.avatarDataUrl ? <img alt="Avatar" className="size-full object-cover" src={state.avatarDataUrl} /> : state.emoji}
          </div>

          <div className="grid min-w-[260px] flex-1 gap-2 md:grid-cols-2">
            <label className="text-xs font-semibold text-violet-700">Pseudo
              <input className="mt-1 h-10 w-full rounded-lg border border-violet-200 px-2" onChange={(e) => setPartial({ pseudo: e.target.value })} value={state.pseudo} />
            </label>
            <label className="text-xs font-semibold text-violet-700">Emoji
              <input className="mt-1 h-10 w-full rounded-lg border border-violet-200 px-2" maxLength={2} onChange={(e) => setPartial({ emoji: e.target.value })} value={state.emoji} />
            </label>
            <label className="text-xs font-semibold text-violet-700 md:col-span-2">Bio
              <input className="mt-1 h-10 w-full rounded-lg border border-violet-200 px-2" onChange={(e) => setPartial({ bio: e.target.value })} value={state.bio} />
            </label>
            <label className="flex h-10 items-center gap-2 rounded-lg border border-violet-200 px-3 text-xs font-semibold text-violet-700 md:col-span-2">
              <Camera className="size-4" /> Importer un avatar
              <input
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setPartial({ avatarDataUrl: String(reader.result) });
                  reader.readAsDataURL(file);
                }}
                type="file"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
        <h2 className="flex items-center gap-2 text-xl font-black text-amber-700"><UserRound className="size-5" />Identité joueur</h2>
        <p className="mt-2 text-sm">{state.pseudo} • "{state.bio}"</p>
        <p className="mt-2 text-sm">Niveau {state.level} • Série {state.streak} • XP {state.xp}</p>
      </div>

      <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
        <h2 className="flex items-center gap-2 text-xl font-black text-cyan-700"><Medal className="size-5" />Badges généraux</h2>
        <p className="mt-2 text-sm text-cyan-800">
          Les 3 badges mAI généraux (Plus, Pro, Max) sont désormais dans l'onglet <strong>Statistiques</strong>, pas dans le profil Quizzly.
        </p>
      </div>
    </section>
  );
}
