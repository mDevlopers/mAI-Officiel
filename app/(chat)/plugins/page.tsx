"use client";

import { PlugZap, FileText, Wrench, Volume2, Key, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { pluginRegistry, PluginCategory } from "@/lib/plugins/registry";

const categoryIcons: Record<PluginCategory, React.ReactNode> = {
  analysis: <FileText className="size-4" />,
  utilities: <Wrench className="size-4" />,
  generation: <Volume2 className="size-4" />,
  tools: <Key className="size-4" />,
};

const categoryLabels: Record<PluginCategory, string> = {
  analysis: "Analyse",
  utilities: "Utilitaires",
  generation: "Génération",
  tools: "Outils",
};

export default function PluginsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<PluginCategory, boolean>>({
    analysis: true,
    utilities: true,
    generation: true,
    tools: true,
  });

  const activeCount = useMemo(
    () => Object.values(enabled).filter(Boolean).length,
    [enabled]
  );

  const groupedPlugins = useMemo(() => {
    return pluginRegistry.reduce((acc, plugin) => {
      if (!acc[plugin.category]) acc[plugin.category] = [];
      acc[plugin.category].push(plugin);
      return acc;
    }, {} as Record<PluginCategory, typeof pluginRegistry>);
  }, []);

  const toggleCategory = (category: PluginCategory) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="liquid-glass flex h-full flex-col gap-4 overflow-auto p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold inline-flex items-center gap-2">
          <PlugZap className="size-6" />
          Plugins mAI
        </h1>
        <p className="text-sm text-muted-foreground">
          Architecture modulaire: activez/désactivez les modules et configurez leurs formulaires dynamiques.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Plugins actifs: <span className="font-semibold">{activeCount}</span> / {pluginRegistry.length}
        </p>
      </header>

      <div className="space-y-6">
        {Object.entries(groupedPlugins).map(([category, plugins]) => (
          <div key={category} className="space-y-3">
            <button
              onClick={() => toggleCategory(category as PluginCategory)}
              className="flex w-full items-center justify-between text-sm font-medium hover:opacity-80 transition-opacity"
              type="button"
            >
              <div className="flex items-center gap-2">
                {categoryIcons[category as PluginCategory]}
                {categoryLabels[category as PluginCategory]}
                <span className="text-xs text-muted-foreground">({plugins.length})</span>
              </div>
              <ChevronDown
                className={`size-4 transition-transform ${expandedCategories[category as PluginCategory] ? '' : '-rotate-90'}`}
              />
            </button>

            {expandedCategories[category as PluginCategory] && (
              <div className="grid gap-4 md:grid-cols-2">
                {plugins.map((plugin) => {
                  const isEnabled = Boolean(enabled[plugin.id]);

                  return (
                    <section
                      className={`liquid-panel rounded-2xl p-4 transition-all ${isEnabled ? 'ring-1 ring-primary/20' : 'opacity-85'}`}
                      key={plugin.id}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="inline-flex items-center gap-2 text-sm font-medium">
                            {plugin.name}
                            {plugin.version && (
                              <span className="text-xs text-muted-foreground font-normal">v{plugin.version}</span>
                            )}
                          </p>
                        </div>
                        <button
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${isEnabled ? "bg-primary text-primary-foreground" : "border hover:bg-accent"}`}
                          onClick={() =>
                            setEnabled((current) => ({ ...current, [plugin.id]: !current[plugin.id] }))
                          }
                          type="button"
                        >
                          {isEnabled ? "Activé" : "Désactivé"}
                        </button>
                      </div>
                      <p className="mb-3 text-xs text-muted-foreground">{plugin.description}</p>

                      <div className="space-y-2">
                        {plugin.fields.map((field) => (
                          <label className="block text-xs" key={field.key}>
                            <div className="flex items-center justify-between mb-1">
                              <span>{field.label}</span>
                              {field.required && <span className="text-xs text-destructive">* obligatoire</span>}
                            </div>

                            {field.type === "select" ? (
                              <select
                                className="mt-1 h-9 w-full rounded-lg border bg-background px-2 text-xs"
                                defaultValue={field.default as string}
                              >
                                {field.options?.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : field.type === "textarea" ? (
                              <textarea
                                className="mt-1 w-full min-h-[70px] rounded-lg border bg-background px-2 py-1.5 text-xs resize-y"
                                placeholder={field.placeholder}
                              />
                            ) : field.type === "toggle" ? (
                              <div className="mt-1">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" defaultChecked={field.default as boolean} className="sr-only peer" />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                              </div>
                            ) : (
                              <input
                                className="mt-1 h-9 w-full rounded-lg border bg-background px-2 text-xs"
                                placeholder={field.placeholder}
                                type={field.type}
                                defaultValue={field.default as string | number}
                              />
                            )}
                          </label>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
