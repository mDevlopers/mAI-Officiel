const fs = require("fs");
let code = fs.readFileSync("app/(chat)/studio/page.tsx", "utf8");

// Styles presets
const stylesCode = `
const predefinedStyles = [
  { id: "none", label: "Aucun", prompt: "" },
  { id: "gothic", label: "Gothique", prompt: ", in dark gothic style, dramatic lighting, highly detailed, moody atmosphere" },
  { id: "sunset", label: "Coucher de soleil", prompt: ", at sunset, golden hour lighting, warm colors, cinematic" },
  { id: "cyberpunk", label: "Cyberpunk", prompt: ", in neon cyberpunk style, futuristic city background, glowing lights, high contrast" },
  { id: "watercolor", label: "Aquarelle", prompt: ", watercolor painting style, soft edges, pastel colors, artistic" },
  { id: "anime", label: "Anime", prompt: ", anime art style, studio ghibli inspired, vibrant colors, clear outlines" }
];
`;

if (!code.includes("const predefinedStyles")) {
  code = code.replace(
    "const imageModels = affordableImageModels;",
    "const imageModels = affordableImageModels;\n" + stylesCode
  );
}

// Add state for style
if (!code.includes("const [selectedStyle, setSelectedStyle]")) {
  code = code.replace(
    'const [importSource, setImportSource] = useState<"device" | "mai-library">(',
    'const [selectedStyle, setSelectedStyle] = useState("none");\n  const [importSource, setImportSource] = useState<"device" | "mai-library">('
  );
}

// Update runStudio to append style
const appendStyleCode = `
    let finalPrompt = prompt;
    if (mode === "edit-image" && selectedStyle !== "none") {
      const styleObj = predefinedStyles.find(s => s.id === selectedStyle);
      if (styleObj) {
        finalPrompt += styleObj.prompt;
      }
    }
`;

if (!code.includes("let finalPrompt = prompt;")) {
  code = code.replace(
    "setIsLoading(true);",
    appendStyleCode + "\n    setIsLoading(true);"
  );
  code = code.replace("prompt,", "prompt: finalPrompt,");
}

// Add UI for style selector in edit mode
const styleSelectorUI = `
              <label className="mt-4 mb-2 block text-xs font-medium text-muted-foreground">
                Style de rendu (Optionnel)
              </label>
              <div className="mb-4 flex flex-wrap gap-2">
                {predefinedStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={\`rounded-lg border px-3 py-1.5 text-xs transition-colors \${
                      selectedStyle === style.id
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border/40 bg-background/50 text-muted-foreground hover:bg-background/80"
                    }\`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
`;

if (!code.includes("Style de rendu (Optionnel)")) {
  code = code.replace(
    /<label className="mt-4 mb-2 block text-xs font-medium text-muted-foreground">\s*Image source \(import conseillé\)/,
    styleSelectorUI +
      '\n              <label className="mt-4 mb-2 block text-xs font-medium text-muted-foreground">\n                Image source (import conseillé)'
  );
}

fs.writeFileSync("app/(chat)/studio/page.tsx", code);
