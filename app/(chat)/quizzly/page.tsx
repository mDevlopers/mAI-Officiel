"use client";

import { Crown, Heart, Sparkles, Star, Trophy } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuizzlyState } from "@/hooks/use-quizzly-state";
import { chatModels } from "@/lib/ai/models";

type ParsedQuestion = {
  answer: string;
  choices: string[];
  explanation?: string;
  question: string;
};

const classes = ["CE1", "CE2", "CM1", "CM2", "6e", "5e", "4e", "3e", "2nde", "1ère", "Terminale"];
const matieres = ["Mathématiques", "Français", "Histoire", "SVT", "Physique", "Anglais", "Philosophie"];

function parseQuestions(raw: string): ParsedQuestion[] {
  try {
    const maybeJson = JSON.parse(raw) as { questions?: ParsedQuestion[] };
    if (!Array.isArray(maybeJson.questions)) return [];
    return maybeJson.questions.filter((item) => item?.question && Array.isArray(item.choices) && item.answer);
  } catch {
    return [];
  }
}

export default function QuizzlyPage() {
  const { setState, state } = useQuizzlyState();
  const [matiere, setMatiere] = useState(matieres[0]);
  const [classe, setClasse] = useState(classes[0]);
  const [difficulty, setDifficulty] = useState<"facile" | "moyen" | "difficile">("moyen");
  const [modelId, setModelId] = useState(() =>
    typeof window === "undefined"
      ? "gpt-5.4-mini"
      : window.localStorage.getItem("mai.settings.default.quizzly-model.v1") ?? "gpt-5.4-mini"
  );
  const [quizRaw, setQuizRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{ goodAnswers: number; xpGained: number } | null>(null);

  const questions = useMemo(() => parseQuestions(quizRaw), [quizRaw]);

  const multiplier = state.inventory["boost-2"] ? 2 : state.inventory["boost-15"] ? 1.5 : 1;

  const generateQuiz = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});

    try {
      const response = await fetch("/api/quizzly/generate", {
        body: JSON.stringify({ matiere, classe, difficulty, modelId, questionCount: 10 }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as { raw?: string };
      if (!response.ok) return;
      setQuizRaw(payload.raw ?? "");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = () => {
    if (!questions.length) return;

    const goodAnswers = questions.reduce((sum, question, index) => {
      return answers[index] === question.answer ? sum + 1 : sum;
    }, 0);

    const xpGained = Math.round(goodAnswers * 10 * multiplier);
    setResult({ goodAnswers, xpGained });

    setState((previous) => {
      const nextXp = previous.xp + xpGained;
      const nextLevel = 1 + Math.floor(nextXp / 120);
      const baseDiamonds = Math.max(2, Math.floor(goodAnswers / 2));
      const starsLost = goodAnswers >= 6 ? 0 : 1;
      return {
        ...previous,
        diamonds: previous.diamonds + baseDiamonds,
        level: nextLevel,
        stars: Math.max(0, previous.stars - starsLost),
        streak: goodAnswers >= 7 ? previous.streak + 1 : 0,
        xp: nextXp,
      };
    });
  };

  const useShield = () => {
    if (!state.inventory["shield-1"]) return;
    setState((previous) => ({
      ...previous,
      inventory: {
        ...previous.inventory,
        "shield-1": Math.max(0, (previous.inventory["shield-1"] ?? 0) - 1),
      },
      stars: Math.min(5, previous.stars + 1),
    }));
  };

  return (
    <div className="quizzly-fun space-y-4">
      <section className="rounded-3xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-100 to-cyan-100 p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image alt="Quizzly" className="size-10 rounded-xl" height={40} src="/logo.png" width={40} />
            <div>
              <h1 className="text-3xl font-black text-violet-700">Arène Quiz</h1>
              <p className="text-sm text-violet-600">Missions fun, progression réelle et récompenses.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm md:flex md:items-center">
            <div className="rounded-xl bg-white/80 px-3 py-2 font-bold text-violet-700">Niv. {state.level}</div>
            <div className="rounded-xl bg-white/80 px-3 py-2 font-bold text-amber-600">💎 {state.diamonds}</div>
            <div className="rounded-xl bg-white/80 px-3 py-2 font-bold text-sky-700">XP {state.xp}</div>
            <div className="rounded-xl bg-white/80 px-3 py-2 font-bold text-rose-600">⭐ {state.stars}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="text-xs font-semibold text-violet-700">Matière<select className="mt-1 h-10 w-full rounded-lg border border-violet-200 bg-white px-2" onChange={(e) => setMatiere(e.target.value)} value={matiere}>{matieres.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label className="text-xs font-semibold text-violet-700">Classe<select className="mt-1 h-10 w-full rounded-lg border border-violet-200 bg-white px-2" onChange={(e) => setClasse(e.target.value)} value={classe}>{classes.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label className="text-xs font-semibold text-violet-700">Difficulté<select className="mt-1 h-10 w-full rounded-lg border border-violet-200 bg-white px-2" onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} value={difficulty}><option value="facile">Facile</option><option value="moyen">Moyen</option><option value="difficile">Difficile</option></select></label>
          <label className="text-xs font-semibold text-violet-700">Modèle<select className="mt-1 h-10 w-full rounded-lg border border-violet-200 bg-white px-2" onChange={(e) => setModelId(e.target.value)} value={modelId}>{chatModels.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={generateQuiz} type="button"><Sparkles className="mr-2 size-4" />{loading ? "Génération..." : "Lancer un quiz"}</Button>
          <Button onClick={useShield} type="button" variant="outline"><Heart className="mr-2 size-4 text-rose-500" />Utiliser 1 bouclier</Button>
          <span className="rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-violet-600">Multiplicateur XP: x{multiplier}</span>
        </div>
      </section>

      <section className="rounded-3xl border border-cyan-200 bg-white/90 p-5 shadow-lg">
        <h2 className="mb-3 flex items-center gap-2 text-xl font-black text-violet-700"><Trophy className="size-5 text-amber-500" />Défi en cours</h2>
        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.slice(0, 10).map((q, index) => (
              <article className="rounded-xl border border-violet-100 bg-violet-50/60 p-3" key={`q-${index}`}>
                <p className="font-semibold text-violet-900">{index + 1}. {q.question}</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {q.choices.map((choice) => {
                    const isSelected = answers[index] === choice;
                    return (
                      <button
                        className={`rounded-lg border px-3 py-2 text-left text-sm transition ${isSelected ? "border-violet-400 bg-violet-600 text-white" : "border-violet-200 bg-white hover:bg-violet-100"}`}
                        key={`${index}-${choice}`}
                        onClick={() => setAnswers((previous) => ({ ...previous, [index]: choice }))}
                        type="button"
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={submitQuiz} type="button"><Crown className="mr-2 size-4" />Valider mes réponses</Button>
          </div>
        ) : (
          <pre className="rounded-xl bg-slate-50 p-3 text-xs text-muted-foreground">{quizRaw || "Choisis une matière puis lance un quiz."}</pre>
        )}

        {result ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="font-black text-emerald-700">Bravo {state.pseudo} !</p>
            <p>{result.goodAnswers}/{questions.length} bonnes réponses • +{result.xpGained} XP</p>
            <p className="mt-1"><Star className="mr-1 inline size-4 text-amber-500" />Série actuelle: {state.streak} quiz réussis</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
