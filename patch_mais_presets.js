const fs = require("fs");

const file = "app/(chat)/mais/page.tsx";
let code = fs.readFileSync(file, "utf8");

const presetsSection = `
const PRESETS = [
  { name: "🎓 Enseignant", description: "Pédagogie et explications claires.", systemPrompt: "Tu es un enseignant patient et clair. Explique les concepts de manière simple et pédagogique.", baseModel: "deepseek/deepseek-r1", tone: 70, conciseness: 40, languageRegister: 80 },
  { name: "💻 Développeur", description: "Optimisation de code et debug.", systemPrompt: "Tu es un développeur expert. Aide à optimiser le code, corriger les bugs et expliquer les architectures logicielles avec précision.", baseModel: "openai/gpt-4o", tone: 40, conciseness: 70, languageRegister: 90 },
  { name: "✍️ Écrivain", description: "Créativité et structure narrative.", systemPrompt: "Tu es un écrivain créatif. Aide à structurer des histoires, améliorer le style et trouver l'inspiration.", baseModel: "anthropic/claude-3.5-sonnet", tone: 80, conciseness: 30, languageRegister: 60 },
  { name: "🏃‍♂️ Coach", description: "Motivation et programmes personnalisés.", systemPrompt: "Tu es un coach sportif et de vie ultra motivant. Propose des programmes clairs, motive et donne des conseils pratiques.", baseModel: "openai/gpt-4o-mini", tone: 90, conciseness: 50, languageRegister: 30 },
  { name: "✈️ Guide Voyage", description: "Itinéraires et conseils locaux.", systemPrompt: "Tu es un guide de voyage passionné. Donne des conseils sur les itinéraires, les lieux locaux à voir et la culture locale.", baseModel: "google/gemini-2.5-flash", tone: 80, conciseness: 50, languageRegister: 50 },
  { name: "🍳 Chef Cuisinier", description: "Recettes et astuces culinaires.", systemPrompt: "Tu es un chef cuisinier renommé. Propose des recettes délicieuses, des astuces de cuisson et d'accords mets-vins.", baseModel: "openai/gpt-4o-mini", tone: 70, conciseness: 60, languageRegister: 60 },
  { name: "⚖️ Conseiller Juridique", description: "Analyse et structure juridique.", systemPrompt: "Tu es un assistant en analyse juridique. Reste factuel, précis et rappelle toujours que tes conseils ne remplacent pas un avocat. Explique les termes complexes.", baseModel: "openai/gpt-4o", tone: 20, conciseness: 80, languageRegister: 100 },
  { name: "🧘‍♀️ Bien-être", description: "Méditation et relaxation.", systemPrompt: "Tu es un guide de bien-être. Parle de manière très apaisante, donne des conseils de respiration et de méditation.", baseModel: "anthropic/claude-3.5-haiku", tone: 80, conciseness: 40, languageRegister: 70 },
  { name: "📈 Analyste Financier", description: "Bourse et stratégies.", systemPrompt: "Tu es un analyste financier expert. Donne des analyses de marché structurées. Précise que tu ne donnes pas de conseils en investissement garantis.", baseModel: "deepseek/deepseek-r1", tone: 30, conciseness: 90, languageRegister: 90 },
  { name: "🎮 Gamer", description: "Astuces et optimisation jeux.", systemPrompt: "Tu es un gamer pro. Donne des conseils sur les meta, les builds et les stratégies de jeux vidéo.", baseModel: "google/gemini-2.5-flash", tone: 90, conciseness: 50, languageRegister: 20 },
  { name: "🌐 Traducteur Expert", description: "Nuances et localisation.", systemPrompt: "Tu es un traducteur natif bilingue. Traduis avec une grammaire parfaite en conservant les nuances et expressions idiomatiques.", baseModel: "anthropic/claude-3.5-sonnet", tone: 50, conciseness: 80, languageRegister: 80 },
  { name: "🔬 Chercheur", description: "Analyse d'études et vulgarisation.", systemPrompt: "Tu es un chercheur académique. Résume les études scientifiques en vulgarisant sans perdre l'exactitude des données.", baseModel: "openai/gpt-4o", tone: 40, conciseness: 50, languageRegister: 90 },
  { name: "🎸 Musicien", description: "Théorie musicale et composition.", systemPrompt: "Tu es un professeur de musique et compositeur. Aide sur les accords, les partitions et la théorie musicale.", baseModel: "openai/gpt-4o-mini", tone: 80, conciseness: 50, languageRegister: 60 },
  { name: "🛠️ Bricoleur", description: "Tutoriels et réparations DIY.", systemPrompt: "Tu es un expert en bricolage et DIY. Donne des instructions pas-à-pas pour les réparations et la menuiserie.", baseModel: "google/gemini-2.5-flash", tone: 60, conciseness: 70, languageRegister: 50 },
];

export default function MaisPage() {
`;

code = code.replace("export default function MaisPage() {", presetsSection);

const createPresetFn = `
  const handleAddPreset = async (preset: typeof PRESETS[0]) => {
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: preset.name,
          description: preset.description,
          systemPrompt: preset.systemPrompt,
          baseModel: preset.baseModel,
          tone: preset.tone,
          conciseness: preset.conciseness,
          languageRegister: preset.languageRegister,
        }),
      });

      if (!response.ok) throw new Error("Failed to create preset");

      toast.success(\`\${preset.name} ajouté !\`);
      mutate();
    } catch (error) {
      toast.error("Erreur lors de l'ajout du préréglage.");
    }
  };

  // Form state
`;

code = code.replace("// Form state", createPresetFn);

const uiSection = `
        <Dialog onOpenChange={setIsOpen} open={isOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Créer un mAI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
`;

const presetUI = `
        <Dialog onOpenChange={setIsOpen} open={isOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Créer un mAI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle IA (mAI)</DialogTitle>
            </DialogHeader>
`;

const presetRender = `
      {/* SECTION PRÉRÉGLAGES */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Préréglages (Presets)</h2>
        <p className="text-sm text-muted-foreground mb-4">Ajoutez un modèle d'IA pré-conçu en un clic.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map((preset) => (
            <div key={preset.name} className="flex flex-col gap-2 p-4 rounded-xl border border-border/40 bg-secondary/20 relative">
              <h3 className="font-medium text-lg">{preset.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
              <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => handleAddPreset(preset)}>
                <PlusIcon className="mr-2 size-3" /> Ajouter
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
`;

code = code.replace('<div className="mt-8">', presetRender);

fs.writeFileSync(file, code);
