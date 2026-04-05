const fs = require("node:fs");

const file = "components/chat/suggested-actions.tsx";
let code = fs.readFileSync(file, "utf8");

const importLine = `import { useMemo } from "react";`;
code = code.replace('import { memo } from "react";', importLine + '\nimport { memo } from "react";');

const suggestionLogic = `
function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  const suggestedActions = useMemo(() => {
    const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, []);
`;

code = code.replace('function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {\n  const suggestedActions = suggestions;', suggestionLogic);

fs.writeFileSync(file, code);

// Ajout des suggestions aléatoires dans news, coder, health.
const newsFile = "app/(chat)/news/page.tsx";
let newsCode = fs.readFileSync(newsFile, "utf8");

const suggestionsSection = `
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  useEffect(() => {
    const suggestions = ["Résumé tech", "IA actualités", "Politique fr", "Économie", "Sports"];
    setCurrentSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  }, []);

  const handleSuggestionClick = () => {
    setQuery(currentSuggestion);
  };
`;

newsCode = newsCode.replace('  const [importSource, setImportSource] = useState<"device" | "mai-library">(\n    "device"\n  );', '  const [importSource, setImportSource] = useState<"device" | "mai-library">(\n    "device"\n  );\n' + suggestionsSection);

const renderSuggestion = `
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

newsCode = newsCode.replace('              </div>\n            </div>', renderSuggestion);
fs.writeFileSync(newsFile, newsCode);
