"use client";

import { Brain, User, SearchIcon, AlertCircle, CheckCircle2, Clock, BarChart3 } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisResult {
  aiProbability: number;
  humanProbability: number;
  indicators: {
    name: string;
    type: "ai" | "human" | "neutral";
    explanation: string;
    weight: number;
  }[];
  overallScore: number;
  conclusion: string;
  confidence: number;
}

interface HistoryItem {
  id: string;
  text: string;
  result: AnalysisResult;
  date: Date;
}

export default function HumanizyPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() || text.length < 50) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/humanizy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setResult(data);
      
      // Add to history
      setHistory(prev => [{
        id: Math.random().toString(36).substring(2, 9),
        text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
        result: data,
        date: new Date()
      }, ...prev].slice(0, 10));
      
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-amber-500";
    if (score >= 25) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getIndicatorIcon = (type: "ai" | "human" | "neutral") => {
    switch (type) {
      case "ai": return <Brain className="size-4" />;
      case "human": return <User className="size-4" />;
      case "neutral": return <AlertCircle className="size-4" />;
    }
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-6 overflow-y-auto p-6 md:p-10">
      <header className="liquid-glass rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <Brain className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Humanizy</h1>
            <p className="text-sm text-muted-foreground">
              Détectez si un texte a été généré par une intelligence artificielle ou écrit par un humain.
            </p>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-4 lg:flex-row">
        <div className="liquid-glass flex flex-1 flex-col gap-4 rounded-2xl p-5">
          <h2 className="text-lg font-semibold">Texte à analyser</h2>
          <p className="text-xs text-muted-foreground">
            Pour une analyse précise, collez au moins 50 mots. Plus le texte est long, plus les résultats seront fiables.
          </p>
          
          <Textarea
            className="min-h-[280px] resize-none rounded-xl border-border/50 bg-background p-4 text-sm focus:ring-2 focus:ring-primary/50"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Collez votre texte ici pour analyser l'origine..."
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {text.length} caractères
            </span>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !text.trim() || text.length < 50}
              className="inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Clock className="size-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <SearchIcon className="size-4" />
                  Analyser le texte
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-[420px]">
          <Card className="liquid-glass flex flex-col items-center justify-center gap-4 rounded-2xl p-5">
            <h2 className="text-lg font-semibold">Résultat de l'analyse</h2>
            
            {isLoading ? (
              <div className="flex w-full flex-col gap-4">
                <Skeleton className="h-32 w-full rounded-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ) : result ? (
              <>
                <div className="relative size-36">
                  <svg className="size-full" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke={result.aiProbability > 50 ? "hsl(var(--destructive))" : "hsl(var(--success))"}
                      strokeWidth="8"
                      strokeDasharray={`${result.overallScore * 3.39} 339`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">
                      {result.overallScore}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Probabilité IA
                    </span>
                  </div>
                </div>

                <div className="flex w-full gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>IA</span>
                      <span>{result.aiProbability}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-red-200 dark:bg-red-950 overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full transition-all duration-500" 
                        style={{ width: `${result.aiProbability}%` }} 
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Humain</span>
                      <span>{result.humanProbability}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-green-200 dark:bg-green-950 overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-500" 
                        style={{ width: `${result.humanProbability}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl w-full justify-center ${
                  result.aiProbability > 50 
                    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" 
                    : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                }`}>
                  {result.aiProbability > 50 ? <Brain className="size-5" /> : <User className="size-5" />}
                  <span className="font-medium">{result.conclusion}</span>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Confiance: {result.confidence}%
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <BarChart3 className="size-12 opacity-30 mb-2" />
                <p className="text-sm text-center">
                  Collez un texte et cliquez sur Analyser pour voir les résultats
                </p>
              </div>
            )}
          </Card>

          {result && (
            <Card className="liquid-glass flex flex-col gap-3 rounded-2xl p-5">
              <h3 className="text-sm font-semibold">Indicateurs détectés</h3>
              <div className="flex flex-col gap-2">
                {result.indicators.map((indicator, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                      indicator.type === "ai" 
                        ? "bg-red-50 dark:bg-red-950/30" 
                        : indicator.type === "human" 
                        ? "bg-green-50 dark:bg-green-950/30" 
                        : "bg-muted/50"
                    }`}
                  >
                    {getIndicatorIcon(indicator.type)}
                    <div>
                      <p className="font-medium">{indicator.name}</p>
                      <p className="text-muted-foreground">{indicator.explanation}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {Math.round(indicator.weight * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>

      {history.length > 0 && (
        <section className="liquid-glass rounded-2xl p-5">
          <h2 className="text-lg font-semibold mb-3">Historique des analyses</h2>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <Card 
                key={item.id} 
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setResult(item.result)}
              >
                <div className="flex justify-between items-start">
                  <p className="text-xs line-clamp-2 flex-1">{item.text}</p>
                  <Badge className={`ml-2 ${getScoreColor(item.result.aiProbability)}`}>
                    {item.result.overallScore}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.date.toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
