"use client";

import { useEffect, useState } from "react";
import { getQuizzlyProfile, updateQuizzlyProfile } from "@/lib/quizzly/actions";
import { toast } from "sonner";
import { User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function QuizzlyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [pseudo, setPseudo] = useState("");
  const [bio, setBio] = useState("");
  const [emoji, setEmoji] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getQuizzlyProfile().then((p) => {
      setProfile(p);
      setPseudo(p.pseudo);
      setBio(p.bio);
      setEmoji(p.emoji);
    });
  }, []);

  const handleSave = async () => {
    if (!pseudo.trim() || !emoji.trim()) return toast.error("Le pseudo et l'emoji sont requis.");

    setSaving(true);
    try {
      await updateQuizzlyProfile({ pseudo, bio, emoji });
      toast.success("Profil mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div className="p-10 text-center animate-pulse">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-slate-800">Mon Profil</h1>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl border-4 border-violet-100">
            {emoji}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{pseudo}</h2>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <Calendar className="w-4 h-4" />
              <span>Inscrit(e) le {format(new Date(profile.createdAt), "dd MMMM yyyy", { locale: fr })}</span>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Emoji / Avatar</label>
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none"
              maxLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Pseudo</label>
            <input
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Biographie</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none resize-none"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
