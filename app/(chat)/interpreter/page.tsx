"use client";

import {
  BarChart3,
  FileSpreadsheet,
  Play,
  SquareTerminal,
  Table,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

type Runtime =
  | "python"
  | "javascript"
  | "typescript"
  | "bash"
  | "html"
  | "c"
  | "cpp"
  | "go"
  | "ruby"
  | "php";

type RuntimeFile = {
  contentBase64: string;
  name: string;
};

type ExecutionResponse = {
  error?: string;
  exitCode?: number | null;
  logs?: string[];
  output?: string;
  success?: boolean;
};

const runtimeSnippets: Record<Runtime, string> = {
  python: `import csv\nfrom pathlib import Path\n\nrows = []\nfile = Path("data.csv")\nif file.exists():\n    with file.open() as f:\n        reader = csv.DictReader(f)\n        rows = list(reader)\n    print(f"Rows: {len(rows)}")\n    print(rows[:3])\nelse:\n    values = [2, 4, 6, 8]\n    print("Mean:", sum(values) / len(values))`,
  javascript: `import fs from "node:fs";\n\nif (fs.existsSync("data.csv")) {\n  const raw = fs.readFileSync("data.csv", "utf8");\n  const lines = raw.trim().split("\\n");\n  console.log("Rows:", Math.max(lines.length - 1, 0));\n  console.log(lines.slice(0, 3));\n} else {\n  const values = [2, 4, 6, 8];\n  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;\n  console.log("Mean:", mean);\n}`,
  typescript: `import fs from "node:fs";\n\nconst values = [2, 4, 6, 8];\nconst mean = values.reduce((acc, value) => acc + value, 0) / values.length;\nconsole.log("Mean:", mean);\n\nif (fs.existsSync("data.csv")) {\n  const rows = fs.readFileSync("data.csv", "utf8").trim().split("\\n").length - 1;\n  console.log("Rows:", Math.max(rows, 0));\n}`,
  bash: `#!/usr/bin/env bash\nset -euo pipefail\n\necho "Sandbox ready"\nif [[ -f "data.csv" ]]; then\n  echo "File data.csv detected"\n  head -n 5 data.csv\nelse\n  echo "No data.csv file found"\n  printf "2\\n4\\n6\\n8\\n" | awk '{sum+=$1; count+=1} END {printf "Mean: %.2f\\n", sum/count}'\nfi`,
  html: `<!doctype html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Preview</title>\n  </head>\n  <body>\n    <h1>Hello Interpreter</h1>\n    <p>Ce runtime valide et prévisualise votre HTML.</p>\n  </body>\n</html>`,
  c: `#include <stdio.h>\n\nint main(void) {\n  int values[] = {2, 4, 6, 8};\n  int total = 0;\n\n  for (int i = 0; i < 4; ++i) total += values[i];\n  printf("Mean: %.2f\\n", total / 4.0);\n  return 0;\n}`,
  cpp: `#include <iostream>\n#include <vector>\n\nint main() {\n  std::vector<int> values{2, 4, 6, 8};\n  int total = 0;\n  for (const int value : values) total += value;\n  std::cout << "Mean: " << (total / static_cast<double>(values.size())) << "\\n";\n  return 0;\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n  values := []int{2, 4, 6, 8}\n  total := 0\n  for _, value := range values {\n    total += value\n  }\n\n  fmt.Printf("Mean: %.2f\\n", float64(total)/float64(len(values)))\n}`,
  ruby: `values = [2, 4, 6, 8]\nmean = values.sum.to_f / values.length\nputs "Mean: #{mean}"`,
  php: `<?php\n$values = [2, 4, 6, 8];\n$mean = array_sum($values) / count($values);\necho "Mean: {$mean}\\n";\n`,
};

const runtimeLabels: Record<Runtime, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  bash: "Bash",
  html: "HTML",
  c: "C",
  cpp: "C++",
  go: "Go",
  ruby: "Ruby",
  php: "PHP",
};

const runtimeOrder: Runtime[] = [
  "python",
  "javascript",
  "typescript",
  "bash",
  "html",
  "c",
  "cpp",
  "go",
  "ruby",
  "php",
];

async function toRuntimeFile(file: File): Promise<RuntimeFile> {
  const buffer = await file.arrayBuffer();
  const contentBase64 = btoa(
    new Uint8Array(buffer).reduce(
      (acc, byte) => acc + String.fromCharCode(byte),
      ""
    )
  );

  return {
    contentBase64,
    name: file.name,
  };
}

export default function InterpreterPage() {
  const [runtime, setRuntime] = useState<Runtime>("python");
  const [code, setCode] = useState(runtimeSnippets.python);
  const [files, setFiles] = useState<File[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResponse | null>(null);

  const features = useMemo(
    () => [
      { icon: Table, label: "Analyse DataFrame / CSV" },
      { icon: FileSpreadsheet, label: "Import CSV / Excel" },
      { icon: BarChart3, label: "Génération de graphiques" },
      { icon: SquareTerminal, label: "Logs & erreurs structurés" },
    ],
    []
  );

  const onRun = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const payloadFiles = await Promise.all(files.map(toRuntimeFile));
      const response = await fetch("/api/code-interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, files: payloadFiles, runtime }),
      });

      const payload = (await response.json()) as ExecutionResponse;
      setResult(payload);
    } catch (error) {
      setResult({
        error:
          error instanceof Error
            ? error.message
            : "Erreur inconnue pendant l'exécution",
        success: false,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="liquid-glass flex h-full flex-col gap-4 overflow-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Code Interpreter</h1>
          <p className="text-sm text-muted-foreground">
            Sandbox multi-langages: Python, JavaScript, TypeScript, Bash, HTML,
            C, C++, Go, Ruby et PHP.
          </p>
        </div>

        <div className="liquid-panel rounded-xl px-3 py-2">
          <label className="text-xs text-muted-foreground">
            Runtime
            <select
              className="ml-2 rounded-lg border border-border/50 bg-background px-2 py-1 text-xs text-foreground"
              onChange={(event) => {
                const nextRuntime = event.target.value as Runtime;
                setRuntime(nextRuntime);
                setCode(runtimeSnippets[nextRuntime]);
              }}
              value={runtime}
            >
              {runtimeOrder.map((item) => (
                <option key={item} value={item}>
                  {runtimeLabels[item]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="liquid-panel space-y-3 rounded-2xl p-4">
          <textarea
            className="min-h-[360px] w-full rounded-xl border border-border/40 bg-background/70 p-3 font-mono text-xs"
            onChange={(event) => setCode(event.target.value)}
            value={code}
          />

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border/50 px-3 py-2 text-xs text-muted-foreground">
            <Upload className="size-3.5" />
            Ajouter CSV / Excel / TXT / JSON (copiés dans le sandbox)
            <input
              accept=".csv,.xlsx,.xls,.txt,.json"
              className="hidden"
              multiple
              onChange={(event) =>
                setFiles(Array.from(event.target.files ?? []))
              }
              type="file"
            />
          </label>

          {files.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Fichiers: {files.map((item) => item.name).join(", ")}
            </p>
          ) : null}

          <button
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            disabled={isRunning}
            onClick={onRun}
            type="button"
          >
            <Play className="size-4" />
            {isRunning ? "Exécution..." : "Run"}
          </button>
        </section>

        <section className="liquid-panel rounded-2xl p-4">
          <h2 className="mb-2 text-sm font-medium">Output</h2>
          <div className="space-y-2 text-xs">
            {result?.logs?.length ? (
              <pre className="rounded-xl bg-background/80 p-2">
                {result.logs.join("\n")}
              </pre>
            ) : null}
            {result?.output ? (
              <pre className="rounded-xl bg-emerald-500/10 p-2">
                {result.output}
              </pre>
            ) : null}
            {result?.error ? (
              <pre className="rounded-xl bg-red-500/10 p-2 text-red-700">
                {result.error}
              </pre>
            ) : null}
            {typeof result?.exitCode !== "undefined" ? (
              <p>Code retour: {String(result.exitCode)}</p>
            ) : null}
            {result ? null : (
              <p className="text-muted-foreground">
                Aucun résultat pour le moment.
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-2">
            {features.map((item) => (
              <div
                className="flex items-center gap-2 text-xs text-muted-foreground"
                key={item.label}
              >
                <item.icon className="size-3.5" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
