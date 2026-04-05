const fs = require("node:fs");

const file = "app/(chat)/projects/[id]/page.tsx";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
  '          name,\n          description,\n          instructions,\n          memory,\n          agentIds,\n        }),',
  '          name,\n          description,\n          instructions,\n          memory,\n          agentIds,\n          defaultModel,\n        }),'
);

const renderDefaultModel = `
            <div className="grid gap-2 mt-4">
              <Label>Modèle par Défaut</Label>
              <p className="text-sm text-muted-foreground">
                Définissez le modèle mAI qui s'ouvrira par défaut pour ce projet.
              </p>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={defaultModel}
                onChange={handleUpdateDefaultModel}
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
`;

code = code.replace('{/* Sélecteur d\'Agents multiples */}', renderDefaultModel + '\n            {/* Sélecteur d\'Agents multiples */}');

fs.writeFileSync(file, code);
