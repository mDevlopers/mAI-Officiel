const fs = require("node:fs");

const file = "components/chat/multimodal-input.tsx";
let code = fs.readFileSync(file, "utf8");

// Ajouter `useMemo` pour les modèles groupés pour éviter de recalculer à chaque render (optimisation réactivité de v0.4.0)
const modelSelectorRender = `
  const capabilities: Record<string, ModelCapabilities> | undefined = modelsData?.capabilities ?? modelsData;
  const dynamicModels: ChatModel[] | undefined = modelsData?.models;
  const activeModels = dynamicModels ?? chatModels;

  const selectedModel =
    activeModels.find((m: ChatModel) => m.id === selectedModelId) ??
    activeModels.find((m: ChatModel) => m.id === DEFAULT_CHAT_MODEL) ??
    activeModels[0] ??
    chatModels[0];

  const { data: agents } = useSWR("/api/agents", (url: string) => fetch(url).then(r => r.json()), { revalidateOnFocus: false, dedupingInterval: 3600000 });

  const groupedModels = useMemo(() => {
    const defaultOrder = ["mistral", "openai", "anthropic", "google", "meta"];
    return activeModels.reduce((acc: Record<string, ChatModel[]>, model: ChatModel) => {
      const provider = model.provider || "autres";
      if (!acc[provider]) acc[provider] = [];
      acc[provider].push(model);
      return acc;
    }, {});
  }, [activeModels]);

  const providerKeys = useMemo(() => {
    const defaultOrder = ["mistral", "openai", "anthropic", "google", "meta"];
    return Object.keys(groupedModels).sort((a, b) => {
      const idxA = defaultOrder.indexOf(a);
      const idxB = defaultOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedModels]);

  return (
    <ModelSelector onOpenChange={setOpen} open={open}>
      <ModelSelectorTrigger asChild>
        <Button
          className="h-7 max-w-[200px] justify-between gap-1.5 rounded-lg px-2 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          data-testid="model-selector"
          variant="ghost"
        >
          <ModelSelectorLogo provider={getModelLogoProvider(selectedModel)} />
          <ModelSelectorName>{selectedModel.name}</ModelSelectorName>
        </Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Rechercher un modèle..." />
        <ModelSelectorList>
          {agents && agents.length > 0 && (
            <ModelSelectorGroup heading="Mes mAIs">
              {agents.map((agent: any) => (
                <ModelSelectorItem
                  key={\`agent-\${agent.id}\`}
                  onSelect={() => {
                    onModelChange?.(\`agent-\${agent.id}\`);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ModelSelectorLogo provider="custom" />
                    <ModelSelectorName>{agent.name}</ModelSelectorName>
                  </div>
                  {selectedModelId === \`agent-\${agent.id}\` && <CheckCircle2 className="size-4" />}
                </ModelSelectorItem>
              ))}
            </ModelSelectorGroup>
          )}

          {providerKeys.map((provider) => (
            <ModelSelectorGroup
              heading={provider.charAt(0).toUpperCase() + provider.slice(1)}
              key={provider}
            >
              {groupedModels[provider].map((model: ChatModel) => {
                const logoProvider = getModelLogoProvider(model);
                const hasTools = capabilities?.[model.id]?.tools;
                const hasReasoning = capabilities?.[model.id]?.reasoning;
                const hasVision = capabilities?.[model.id]?.vision;

                return (
                  <ModelSelectorItem
                    key={model.id}
                    onSelect={() => {
                      onModelChange?.(model.id);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <ModelSelectorLogo provider={logoProvider} />
                        <ModelSelectorName>{model.name}</ModelSelectorName>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-muted-foreground opacity-50">
                        {hasTools && <WrenchIcon className="size-3" />}
                        {hasVision && <ImageIcon className="size-3" />}
                        {hasReasoning && <BrainIcon className="size-3" />}
                      </div>
                    </div>
                    {selectedModelId === model.id && <CheckCircle2 className="size-4" />}
                  </ModelSelectorItem>
                );
              })}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
`;

code = code.replace(/  const capabilities: Record<string, ModelCapabilities> \| undefined =[\s\S]*\}\n\nconst ModelSelectorCompact = memo\(PureModelSelectorCompact\);/g, modelSelectorRender + '\nconst ModelSelectorCompact = memo(PureModelSelectorCompact);');

fs.writeFileSync(file, code);
