const fs = require("fs");
let code = fs.readFileSync("app/(chat)/coder/page.tsx", "utf8");

// The main layout refactoring
code = code.replace(
  'className="grid min-h-[560px] grid-cols-1 gap-3 lg:grid-cols-[300px_1fr_360px]"',
  'className="grid min-h-[560px] grid-cols-1 gap-3 lg:grid-cols-[400px_1fr]"'
);

// We need to move the 'Messages/Modes' stuff into a new column, and the 'Files/Folders' into the right column.

// Let's rewrite the entire return block for the 2 columns.
// Column 1: Messages/Terminal/Preview/Modes/Input
// Column 2: Files list / Editor

const startOfReturn = code.indexOf("return (");
const endOfReturn = code.lastIndexOf(");") + 2;

const originalReturn = code.slice(startOfReturn, endOfReturn);

const newReturn = `return (
    <div className="liquid-glass flex h-full w-full flex-col gap-3 overflow-y-auto p-4 md:p-6">
      <div className="grid min-h-[560px] grid-cols-1 gap-4 lg:grid-cols-[400px_1fr]">

        {/* Left Column: Messages, Terminal, Preview, Input */}
        <div className="flex flex-col gap-3">
          <section className="flex flex-1 flex-col rounded-2xl border border-border/50 bg-card/70 p-3">
            <div className="mb-2 flex items-center gap-2">
              <button
                className={\`rounded-full border px-3 py-1 text-[11px] \${activeTab === "messages" ? "bg-primary/10 border-primary/30" : "border-border/40"}\`}
                onClick={() => setActiveTab("messages")}
                type="button"
              >
                Messages
              </button>
              <button
                className={\`rounded-full border px-3 py-1 text-[11px] \${activeTab === "terminal" ? "bg-primary/10 border-primary/30" : "border-border/40"}\`}
                onClick={() => setActiveTab("terminal")}
                type="button"
              >
                Terminal
              </button>
              <button
                className={\`rounded-full border px-3 py-1 text-[11px] \${activeTab === "preview" ? "bg-primary/10 border-primary/30" : "border-border/40"}\`}
                onClick={() => setActiveTab("preview")}
                type="button"
              >
                Preview
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "messages" && (
                <pre className="whitespace-pre-wrap rounded-xl border border-border/40 bg-background/70 p-3 text-xs min-h-[300px]">
                  {plan || logs.join("\\n") || "Aucun message."}
                </pre>
              )}
              {activeTab === "terminal" && (
                <pre className="whitespace-pre-wrap rounded-xl border border-border/40 bg-background/70 p-3 text-xs min-h-[300px]">
                  {logs.join("\\n") || "Terminal inactif."}
                </pre>
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
              <Button disabled={isRunning} onClick={launchTask} size="icon" className="h-10 w-10 shrink-0 rounded-xl">
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
                  <Button onClick={createFile} size="sm" variant="outline" className="h-8 px-2">
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
                  <Button onClick={createFolder} size="sm" variant="outline" className="h-8 px-2">
                    <FolderPlus className="size-3.5" />
                  </Button>
                </div>
                <Button onClick={exportAllCode} size="sm" variant="outline" className="h-8 gap-1">
                   <Download className="size-3.5" /> Export
                </Button>
              </div>
            </div>

            <div className="mt-3 flex gap-4 overflow-x-auto pb-1 text-sm">
              {folders.map(([folder, folderFiles]) => (
                <div key={folder} className="min-w-fit pr-4 border-r border-border/30 last:border-0">
                  <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                    📁 {folder}
                  </p>
                  <div className="space-y-1">
                    {folderFiles.map((file) => (
                      <div
                        className={\`flex items-center justify-between gap-3 rounded-lg border px-2 py-1 \${selectedFilePath === file.path ? "border-primary/50 bg-primary/5" : "border-border/30 hover:bg-muted/40"}\`}
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
                          onClick={() => deleteFile(file.path)}
                          type="button"
                          className="text-muted-foreground hover:text-red-500"
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
                <Button onClick={renameFile} size="sm" variant="outline" className="h-8">
                  <Pencil className="mr-1 size-3.5" />
                  Renommer
                </Button>
              </div>
            </div>
            <textarea
              className="flex-1 w-full resize-none rounded-xl border border-border/40 bg-background/70 p-3 text-sm font-mono focus:outline-none"
              onChange={(event) => {
                const content = event.target.value;
                setFiles((current) =>
                  current.map((file) =>
                    file.path === selectedFilePath ? { ...file, content } : file
                  )
                );
              }}
              value={selectedFile?.content ?? ""}
              disabled={!selectedFilePath}
              placeholder={selectedFilePath ? "Code ici..." : "Sélectionnez ou créez un fichier pour commencer..."}
            />
          </section>
        </div>
      </div>
    </div>
  );`;

code = code.replace(originalReturn, newReturn);
fs.writeFileSync("app/(chat)/coder/page.tsx", code);
