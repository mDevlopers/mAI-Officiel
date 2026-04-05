const fs = require("node:fs");

const file = "app/(chat)/settings/page.tsx";
let code = fs.readFileSync(file, "utf8");

const shortcutSection = `
  const [shortcuts, setShortcuts] = useState<{name: string, url: string, icon: string}[]>([]);
  const [newScName, setNewScName] = useState("");
  const [newScUrl, setNewScUrl] = useState("");
  const [newScIcon, setNewScIcon] = useState("⭐");

  useEffect(() => {
    fetch("/api/user/shortcuts").then(r => r.json()).then(data => {
      if(Array.isArray(data)) setShortcuts(data);
    }).catch(console.error);
  }, []);

  const handleAddShortcut = async () => {
    if(shortcuts.length >= 5 || !newScName.trim() || !newScUrl.trim()) return;
    const sc = { name: newScName.trim(), url: newScUrl.trim(), icon: newScIcon };
    const updated = [...shortcuts, sc];
    setShortcuts(updated);
    setNewScName(""); setNewScUrl(""); setNewScIcon("⭐");
    await fetch("/api/user/shortcuts", { method: "POST", body: JSON.stringify({ shortcuts: updated }) });
    toast.success("Raccourci ajouté !");
  };

  const handleRemoveShortcut = async (index: number) => {
    const updated = shortcuts.filter((_, i) => i !== index);
    setShortcuts(updated);
    await fetch("/api/user/shortcuts", { method: "POST", body: JSON.stringify({ shortcuts: updated }) });
  };
`;

code = code.replace('const [defaultModel, setDefaultModel] = useState("");', shortcutSection + '\n  const [defaultModel, setDefaultModel] = useState("");');

const renderShortcuts = `
          {/* Raccourcis Home Page */}
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold">Raccourcis Home Page</h2>
            <div className="flex flex-col gap-2 rounded-xl border border-border/40 p-4">
              <p className="text-sm text-muted-foreground">
                Personnalisez les raccourcis affichés sur la page d'accueil (5 maximum).
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {shortcuts.map((sc, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1 p-2 text-sm">
                    {sc.icon} {sc.name}
                    <XIcon className="size-4 cursor-pointer ml-2 text-red-500" onClick={() => handleRemoveShortcut(i)} />
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div className="space-y-1">
                  <Label>Icône (Emoji)</Label>
                  <Input value={newScIcon} onChange={e => setNewScIcon(e.target.value)} maxLength={2} disabled={shortcuts.length >= 5} />
                </div>
                <div className="space-y-1">
                  <Label>Nom</Label>
                  <Input value={newScName} onChange={e => setNewScName(e.target.value)} disabled={shortcuts.length >= 5} />
                </div>
                <div className="space-y-1">
                  <Label>URL (/page)</Label>
                  <Input value={newScUrl} onChange={e => setNewScUrl(e.target.value)} placeholder="/news" disabled={shortcuts.length >= 5} />
                </div>
                <Button onClick={handleAddShortcut} disabled={shortcuts.length >= 5 || !newScName || !newScUrl}>
                  Ajouter
                </Button>
              </div>
              {shortcuts.length >= 5 && <p className="text-xs text-red-500">Limite de 5 raccourcis atteinte.</p>}
            </div>
          </div>
`;

code = code.replace('{/* Modèle par Défaut */}', renderShortcuts + '\n          {/* Modèle par Défaut */}');

fs.writeFileSync(file, code);
