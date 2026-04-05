const fs = require("node:fs");

// Coder
const coderFile = "app/(chat)/coder/page.tsx";
let coderCode = fs.readFileSync(coderFile, "utf8");

const suggestionCoder = `
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  useEffect(() => {
    const suggestions = ["Créer un script de scraping", "Optimiser le composant Button", "Ajouter l'authentification", "Déboguer l'erreur CORS"];
    setCurrentSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  }, []);

  const handleSuggestionClick = () => {
    setPrompt(currentSuggestion);
  };
`;

coderCode = coderCode.replace('  const [logs, setLogs] = useState<string[]>([]);', '  const [logs, setLogs] = useState<string[]>([]);\n' + suggestionCoder);

const renderCoder = `
            <Textarea
              className="min-h-32 resize-none"
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Écrivez votre demande..."
              value={prompt}
            />
            {currentSuggestion && (
              <div
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={handleSuggestionClick}
              >
                <span className="font-semibold">Suggestion :</span>
                <span>{currentSuggestion}</span>
              </div>
            )}
`;

coderCode = coderCode.replace('            <Textarea\n              className="min-h-32 resize-none"\n              onChange={(e) => setPrompt(e.target.value)}\n              placeholder="Écrivez votre demande..."\n              value={prompt}\n            />', renderCoder);
fs.writeFileSync(coderFile, coderCode);


// Health
const healthFile = "app/(chat)/Health/page.tsx";
if (fs.existsSync(healthFile)) {
  let healthCode = fs.readFileSync(healthFile, "utf8");

  const suggestionHealth = `
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  useEffect(() => {
    const suggestions = ["Maux de tête fréquents", "Conseils pour mieux dormir", "Programme de récupération sportive", "Symptômes de l'anémie"];
    setCurrentSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  }, []);

  const handleSuggestionClick = () => {
    setQuery(currentSuggestion);
  };
  `;

  healthCode = healthCode.replace('  const [importSource, setImportSource] = useState<"device" | "mai-library">(\n    "device"\n  );', '  const [importSource, setImportSource] = useState<"device" | "mai-library">(\n    "device"\n  );\n' + suggestionHealth);

  const renderHealth = `
              </div>
              {currentSuggestion && (
                <div
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={handleSuggestionClick}
                >
                  <span className="font-semibold">Suggestion :</span>
                  <span>{currentSuggestion}</span>
                </div>
              )}
            </div>
  `;

  healthCode = healthCode.replace('              </div>\n            </div>', renderHealth);
  fs.writeFileSync(healthFile, healthCode);
}
