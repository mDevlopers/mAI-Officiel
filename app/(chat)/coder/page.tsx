"use client";

import JSZip from "jszip";
import { Download,
  CheckCircle2,
  Code2,
  FilePlus2,
  FolderPlus,
  Pencil,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { chatModels } from "@/lib/ai/models";

type CoderMode = "Planification" | "Investigation" | "Exécution";
type WorkspaceTab = "preview" | "terminal" | "messages";
type FileEntry = { content: string; path: string };

const modeDescriptions: Record<CoderMode, string> = {
  Planification: "Créer un plan avant les modifications.",
  Investigation: "Corrections des bugs et failles de sécurité.",
  Exécution: "Modifications sans plan d'action.",
};

function getFolder(path: string) {
  const parts = path.split("/");
  return parts.length > 1 ? parts.slice(0, -1).join("/") : "racine";
}

export default function CoderPage() {
  const [mode, setMode] = useState<CoderMode>("Exécution");
  const [selectedModel, setSelectedModel] = useState(chatModels[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("preview");
  const [plan, setPlan] = useState("");
  const [isPlanApproved, setIsPlanApproved] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([
    {
      path: "src/App.tsx",
      content: "export default function App(){ return <main>Bonjour</main>; }",
    },
  ]);
  const [selectedFilePath, setSelectedFilePath] = useState("src/App.tsx");
  const [newFilePath, setNewFilePath] = useState("");
  const [newFolderPath, setNewFolderPath] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    fetch("/api/restricted-access?area=coder")
      .then((res) => res.json())
      .then((payload) => setIsUnlocked(payload.unlocked === true));
  }, []);

  const selectedFile = files.find((file) => file.path === selectedFilePath);

  useEffect(() => {
    if (!selectedFilePath && files[0]?.path) {
      setSelectedFilePath(files[0].path);
      return;
    }
    if (
      selectedFilePath &&
      !files.some((file) => file.path === selectedFilePath)
    ) {
      setSelectedFilePath(files[0]?.path ?? "");
    }
  }, [files, selectedFilePath]);

  useEffect(() => {
    setRenameValue(selectedFilePath);
  }, [selectedFilePath]);

  const folders = useMemo(() => {
    const grouped = new Map<string, FileEntry[]>();
    for (const file of files) {
      const folder = getFolder(file.path);
      const current = grouped.get(folder) ?? [];
      current.push(file);
      grouped.set(folder, current);
    }
    return [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [files]);

  const launchTask = async () => {
    if (!prompt.trim()) {
      setLogs(["Veuillez décrire une tâche avant de lancer."]);
      return;
    }

    if (mode === "Planification" && !isPlanApproved) {
      setPlan(
        [
          `1. Auditer les fichiers concernés par: ${prompt}`,
          "2. Détailler les patchs et impacts.",
          "3. Valider puis exécuter.",
        ].join("\n")
      );
      setLogs(["Plan généré. Validation requise."]);
      setActiveTab("messages");
      return;
    }

    setIsRunning(true);
    try {
      const response = await fetch("/api/coder/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, mode, modelId: selectedModel, prompt }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setLogs([payload?.error ?? "Échec de la tâche."]);
        return;
      }
      setLogs(payload.history ?? []);
      setFiles(payload.updatedFiles ?? files);
      setActiveTab("terminal");
    } finally {
      setIsRunning(false);
    }
  };

  const createFile = () => {
    const path = newFilePath.trim();
    if (!path || files.some((file) => file.path === path)) {
      return;
    }
    const next = { path, content: "" };
    setFiles((current) => [...current, next]);
    setSelectedFilePath(path);
    setNewFilePath("");
  };

  const createFolder = () => {
    const path = newFolderPath.trim().replace(/\/$/, "");
    if (!path) {
      return;
    }
    const keepPath = `${path}/.keep`;
    if (files.some((file) => file.path === keepPath)) {
      return;
    }
    setFiles((current) => [...current, { path: keepPath, content: "" }]);
    setNewFolderPath("");
  };

  const renameFile = () => {
    const target = renameValue.trim();
    if (
      !selectedFilePath ||
      !target ||
      files.some((file) => file.path === target)
    ) {
      return;
    }
    setFiles((current) =>
      current.map((file) =>
        file.path === selectedFilePath ? { ...file, path: target } : file
      )
    );
    setSelectedFilePath(target);
  };

  const deleteFile = (path: string) => {
    setFiles((current) => current.filter((file) => file.path !== path));
  };

  const exportAllCode = async () => {
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.path, file.content || "");
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "projet-code.zip";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!isUnlocked) {
    return (
    <div className="liquid-glass flex h-full w-full flex-col gap-3 overflow-y-auto p-4 md:p-6">
      <div className="grid min-h-[560px] grid-cols-1 gap-4 lg:grid-cols-[400px_1fr]">

        {/* Left Column: Messages, Terminal, Preview, Input */}
        <div className="flex flex-col gap-3">
          <section className="flex flex-1 flex-col rounded-2xl border border-border/50 bg-card/70 p-3">
            <div className="mb-2 flex items-center gap-2">
              <button
                className={`rounded-full border px-3 py-1 text-[11px] ${activeTab === "messages" ? "bg-primary/10 border-primary/30" : "border-border/40"}`}
                onClick={() => setActiveTab("messages")}
                type="button"
              >
                Messages
              </button>
              <button
                className={`rounded-full border px-3 py-1 text-[11px] ${activeTab === "terminal" ? "bg-primary/10 border-primary/30" : "border-border/40"}`}
                onClick={() => setActiveTab("terminal")}
                type="button"
              >
                Terminal
              </button>
              <button
                className={`rounded-full border px-3 py-1 text-[11px] ${activeTab === "preview" ? "bg-primary/10 border-primary/30" : "border-border/40"}`}
                onClick={() => setActiveTab("preview")}
                type="button"
              >
                Preview
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "messages" && (
                <pre className="whitespace-pre-wrap rounded-xl border border-border/40 bg-background/70 p-3 text-xs min-h-[300px]">
                  {plan || logs.join("\n") || "Aucun message."}
                </pre>
              )}
              {activeTab === "terminal" && (
                <div className="flex flex-col h-full gap-2">
                  <pre className="whitespace-pre-wrap rounded-xl border border-border/40 bg-background/70 p-3 text-xs flex-1 overflow-y-auto min-h-[260px]">
                    {logs.join("\n") || "Terminal inactif."}
                  </pre>
                  <div className="flex gap-2">
                    <input
                      className="h-8 flex-1 rounded-lg border border-border/40 bg-background/70 px-2 text-xs font-mono"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const cmd = e.currentTarget.value;
                          if (!cmd) return;
                          e.currentTarget.value = '';
                          setLogs(prev => [...prev, `$ ${cmd}`]);
                          try {
                            const res = await fetch('/api/terminal', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ command: cmd })
                            });
                            const data = await res.json();
                            setLogs(prev => [...prev, data.output || data.error]);
                          } catch (err) {
                            setLogs(prev => [...prev, "Erreur d'exécution de la commande."]);
                          }
                        }
                      }}
                      placeholder="Exécuter une commande..."
                    />
                  </div>
                </div>
              )}
              {activeTab === "preview" && (
                <pre className="whitespace-pre-wrap rounded-xl border border-border/40 bg-background/70 p-3 text-xs min-h-[300px]">
                  {selectedFile?.content ?? "Aucun fichier à prévisualiser."}
                </pre>
              )}
            </div>
          </section>

          {/* Controls and Input Area */}
          <div className="rounded-2xl border border-border/50 bg-card/80 p-3 shadow-sm backdrop-blur-xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <select
                className="h-8 rounded-full border border-border/40 bg-background/50 px-2.5 text-xs text-muted-foreground"
                onChange={(event) => setMode(event.target.value as CoderMode)}
                value={mode}
              >
                {(Object.keys(modeDescriptions) as CoderMode[]).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                className="h-8 max-w-[140px] truncate rounded-full border border-border/40 bg-background/50 px-2.5 text-xs text-muted-foreground"
                onChange={(event) => setSelectedModel(event.target.value)}
                value={selectedModel}
              >
                {chatModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground">
              {modeDescriptions[mode]}
            </p>

            {mode === "Planification" && plan && !isPlanApproved && (
              <div className="mb-2 rounded-lg border border-primary/30 bg-primary/10 p-2 text-xs">
                <pre className="whitespace-pre-wrap">{plan}</pre>
                <Button
                  className="mt-2 w-full"
                  onClick={() => setIsPlanApproved(true)}
                  size="sm"
                  variant="outline"
                >
                  <CheckCircle2 className="mr-1 size-3.5" />
                  Valider le plan
                </Button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <textarea
                className="h-20 flex-1 resize-none rounded-xl border border-border/40 bg-background/70 p-2 text-sm"
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Envoyer un message ou demander une modification..."
                value={prompt}
              />
              <Button className="h-10 w-10 shrink-0 rounded-xl"disabled={isRunning} onClick={launchTask} size="icon" >
                <PlayCircle className="size-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Files & Code Editor */}
        <div className="grid grid-rows-[auto_1fr] gap-3">
          {/* File Manager Bar */}
          <aside className="rounded-2xl border border-border/50 bg-card/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-muted-foreground">FILES</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <input
                    className="h-8 w-28 rounded-lg border border-border/40 bg-background/70 px-2 text-xs"
                    onChange={(e) => setNewFilePath(e.target.value)}
                    placeholder="Fichier"
                    value={newFilePath}
                  />
                  <Button className="h-8 px-2"onClick={createFile} size="sm" variant="outline" >
                    <FilePlus2 className="size-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    className="h-8 w-28 rounded-lg border border-border/40 bg-background/70 px-2 text-xs"
                    onChange={(e) => setNewFolderPath(e.target.value)}
                    placeholder="Dossier"
                    value={newFolderPath}
                  />
                  <Button className="h-8 px-2"onClick={createFolder} size="sm" variant="outline" >
                    <FolderPlus className="size-3.5" />
                  </Button>
                </div>
                <Button className="h-8 gap-1"onClick={exportAllCode} size="sm" variant="outline" >
                   <Download className="size-3.5" /> Export
                </Button>
              </div>
            </div>

            <div className="mt-3 flex gap-4 overflow-x-auto pb-1 text-sm">
              {folders.map(([folder, folderFiles]) => (
                <div className="min-w-fit pr-4 border-r border-border/30 last:border-0"key={folder} >
                  <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                    📁 {folder}
                  </p>
                  <div className="space-y-1">
                    {folderFiles.map((file) => (
                      <div
                        className={`flex items-center justify-between gap-3 rounded-lg border px-2 py-1 ${selectedFilePath === file.path ? "border-primary/50 bg-primary/5" : "border-border/30 hover:bg-muted/40"}`}
                        key={file.path}
                      >
                        <button
                          className="truncate text-xs max-w-[120px]"
                          onClick={() => setSelectedFilePath(file.path)}
                          type="button"
                        >
                          {file.path.split("/").at(-1)}
                        </button>
                        <button
                          className="text-muted-foreground hover:text-red-500"
                          onClick={() => deleteFile(file.path)}
                          type="button"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Editor */}
          <section className="flex flex-col rounded-2xl border border-border/50 bg-card/70 p-3 h-full min-h-[400px]">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <p className="text-sm font-medium">
                  {selectedFilePath || "Aucun fichier sélectionné"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="h-8 w-40 rounded-lg border border-border/40 bg-background/70 px-2 text-xs"
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="Nouveau nom..."
                  value={renameValue}
                />
                <Button className="h-8"onClick={renameFile} size="sm" variant="outline" >
                  <Pencil className="mr-1 size-3.5" />
                  Renommer
                </Button>
              </div>
            </div>
            <textarea
              className="flex-1 w-full resize-none rounded-xl border border-border/40 bg-background/70 p-3 text-sm font-mono focus:outline-none"
              disabled={!selectedFilePath}
              onChange={(event) => {
                const content = event.target.value;
                setFiles((current) =>
                  current.map((file) =>
                    file.path === selectedFilePath ? { ...file, content } : file
                  )
                );
              }}
              placeholder={selectedFilePath ? "Code ici..." : "Sélectionnez ou créez un fichier pour commencer..."}
              value={selectedFile?.content ?? ""}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
}
