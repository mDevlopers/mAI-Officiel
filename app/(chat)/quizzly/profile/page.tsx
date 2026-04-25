"use client";

import { useState } from "react";

export default function QuizzlyProfilePage() {
  const [pseudo, setPseudo] = useState("Player");
  const [bio, setBio] = useState("J'adore les quiz.");
  const [emoji, setEmoji] = useState("🧠");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

  return (
    <section className="liquid-glass rounded-2xl p-5">
      <h1 className="text-3xl font-bold">Profil</h1>
      <p className="mt-1 text-sm text-muted-foreground">Date de création: {new Date().toLocaleDateString("fr-FR")}</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex size-20 items-center justify-center rounded-full border text-4xl" style={avatarDataUrl ? { backgroundImage: `url(${avatarDataUrl})`, backgroundSize: "cover" } : undefined}>{avatarDataUrl ? "" : emoji}</div>
        <div className="space-y-2">
          <input className="h-9 rounded-lg border px-2" onChange={(e) => setPseudo(e.target.value)} value={pseudo} />
          <input className="h-9 rounded-lg border px-2" onChange={(e) => setBio(e.target.value)} value={bio} />
          <input className="h-9 rounded-lg border px-2" maxLength={2} onChange={(e) => setEmoji(e.target.value)} value={emoji} />
          <label className="block text-xs">Importer image avatar<input className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setAvatarDataUrl(String(reader.result)); reader.readAsDataURL(file); }} type="file" /></label>
        </div>
      </div>
      <p className="mt-3 text-sm">{pseudo}</p>
      <p className="text-xs text-muted-foreground">{bio}</p>
    </section>
  );
}
