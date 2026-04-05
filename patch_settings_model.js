const fs = require("node:fs");

const file = "app/(chat)/settings/page.tsx";
let code = fs.readFileSync(file, "utf8");

const importLine = `import { chatModels } from "@/lib/ai/models";\nimport useSWR from "swr";`;
code = code.replace('import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";', importLine + '\nimport { useSubscriptionPlan } from "@/hooks/use-subscription-plan";');

const defaultModelSection = `
  const [defaultModel, setDefaultModel] = useState("");
  const { data: agents } = useSWR("/api/agents", url => fetch(url).then(r => r.json()));

  useEffect(() => {
    fetch("/api/user/default-model").then(r => r.json()).then(model => setDefaultModel(model)).catch(console.error);
  }, []);

  const handleUpdateDefaultModel = async (modelId: string) => {
    setDefaultModel(modelId);
    await fetch("/api/user/default-model", { method: "POST", body: JSON.stringify({ defaultModel: modelId }) });
    toast.success("Modèle par défaut mis à jour");
  };
`;

code = code.replace('const [globalTags, setGlobalTags] = useState<{id: string, name: string, color: string}[]>([]);', defaultModelSection + '\n  const [globalTags, setGlobalTags] = useState<{id: string, name: string, color: string}[]>([]);');

const renderDefaultModel = `
          {/* Modèle par Défaut */}
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">Modèle par Défaut</h2>
            <div className="flex flex-col gap-2 rounded-xl border border-border/40 p-4">
              <p className="text-sm text-muted-foreground">
                Définissez le modèle mAI qui s'ouvrira par défaut pour chaque nouvelle session.
              </p>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={defaultModel}
                onChange={(e) => handleUpdateDefaultModel(e.target.value)}
              >
                <optgroup label="Modèles">
                  {chatModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </optgroup>
                {agents && agents.length > 0 && (
                  <optgroup label="Vos mAIs">
                    {agents.map((agent: any) => (
                      <option key={\`agent-\${agent.id}\`} value={\`agent-\${agent.id}\`}>
                        {agent.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
`;

code = code.replace('{/* Tags */}', renderDefaultModel + '\n          {/* Tags */}');

fs.writeFileSync(file, code);
