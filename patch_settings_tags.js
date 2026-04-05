const fs = require("node:fs");

const file = "app/(chat)/settings/page.tsx";
let code = fs.readFileSync(file, "utf8");

const importTags = `import { Badge } from "@/components/ui/badge";
import { XIcon } from "lucide-react";`;
code = code.replace('import { Badge } from "@/components/ui/badge";', importTags);

const tagsSection = `
  const maxTags = currentPlanDefinition.limits.maxTags || 5;
  const [globalTags, setGlobalTags] = useState<{id: string, name: string, color: string}[]>([]);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    fetch("/api/user/tags").then(r => r.json()).then(data => {
       if(Array.isArray(data)) setGlobalTags(data);
    }).catch(console.error);
  }, []);

  const handleAddTag = async () => {
    if(!newTagName.trim() || globalTags.length >= maxTags) return;
    const newTag = { id: crypto.randomUUID(), name: newTagName.trim(), color: "#4f46e5" };
    const updated = [...globalTags, newTag];
    setGlobalTags(updated);
    setNewTagName("");
    await fetch("/api/user/tags", { method: "POST", body: JSON.stringify({ tags: updated }) });
  };

  const handleRemoveTag = async (id: string) => {
    const updated = globalTags.filter(t => t.id !== id);
    setGlobalTags(updated);
    await fetch("/api/user/tags", { method: "POST", body: JSON.stringify({ tags: updated }) });
  };
`;

code = code.replace('const [activationCode, setActivationCode] = useState("");', 'const [activationCode, setActivationCode] = useState("");\n' + tagsSection);

const renderTags = `
          {/* Tags */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Vos Tags de Conversation</h2>
            <div className="flex flex-col gap-2 rounded-xl border border-border/40 p-4">
              <p className="text-sm text-muted-foreground">
                Organisez vos conversations en créant des tags. Vous avez droit à {maxTags} tags au maximum avec votre forfait.
              </p>

              <div className="flex flex-wrap gap-2 mb-2">
                {globalTags.map(tag => (
                  <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                    {tag.name}
                    <XIcon className="size-3 cursor-pointer" onClick={() => handleRemoveTag(tag.id)} />
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-sm">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Nouveau tag..."
                  disabled={globalTags.length >= maxTags}
                />
                <Button onClick={handleAddTag} disabled={globalTags.length >= maxTags || !newTagName.trim()}>
                  Ajouter
                </Button>
              </div>
              {globalTags.length >= maxTags && <p className="text-xs text-red-500">Limite de tags atteinte.</p>}
            </div>
          </div>
`;

code = code.replace('{/* Plan d\'abonnement */}', renderTags + '\n{/* Plan d\'abonnement */}');

fs.writeFileSync(file, code);
