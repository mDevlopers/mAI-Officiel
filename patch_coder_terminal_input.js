const fs = require("fs");
let code = fs.readFileSync("app/(chat)/coder/page.tsx", "utf8");

// Replace the terminal preview block to include an input for executing commands

const oldTerminal = `{activeTab === "terminal" && (
                <pre className="whitespace-pre-wrap rounded-xl border border-border/40 bg-background/70 p-3 text-xs min-h-[300px]">
                  {logs.join("\\n") || "Terminal inactif."}
                </pre>
              )}`;

const newTerminal = `{activeTab === "terminal" && (
                <div className="flex flex-col h-full gap-2">
                  <pre className="whitespace-pre-wrap rounded-xl border border-border/40 bg-background/70 p-3 text-xs flex-1 overflow-y-auto min-h-[260px]">
                    {logs.join("\\n") || "Terminal inactif."}
                  </pre>
                  <div className="flex gap-2">
                    <input
                      className="h-8 flex-1 rounded-lg border border-border/40 bg-background/70 px-2 text-xs font-mono"
                      placeholder="Exécuter une commande..."
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const cmd = e.currentTarget.value;
                          if (!cmd) return;
                          e.currentTarget.value = '';
                          setLogs(prev => [...prev, \`$ \${cmd}\`]);
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
                    />
                  </div>
                </div>
              )}`;

code = code.replace(oldTerminal, newTerminal);
fs.writeFileSync("app/(chat)/coder/page.tsx", code);
