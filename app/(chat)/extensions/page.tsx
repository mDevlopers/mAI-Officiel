"use client";

import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  EyeOff,
  FolderPlus,
  Pin,
  PinOff,
  PuzzleIcon,
  Search,
  Share2,
  Sparkles,
  Star,
  StarOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type ExtensionStatus, extensionCatalog } from "./data";

type ExtensionPreferences = {
  favorites: string[];
  hidden: string[];
  pinned: string[];
  customNames: Record<string, string>;
};

type ExtensionFilter = "all" | "favorites" | "pinned" | "hidden";
type SortKey = "popularity" | "lastUsed" | "name";

const STORAGE_KEY = "mai-extensions-preferences-v2";

const defaultPreferences: ExtensionPreferences = {
  favorites: [],
  hidden: [],
  pinned: [],
  customNames: {},
};

export default function ExtensionsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<ExtensionFilter>("all");
  const [preferences, setPreferences] =
    useState<ExtensionPreferences>(defaultPreferences);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ExtensionStatus>(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("popularity");
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [selectedExtensionId, setSelectedExtensionId] = useState<string | null>(
    null
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setIsHydrated(true);
        return;
      }

      const parsed = JSON.parse(stored) as Partial<ExtensionPreferences>;

      setPreferences({
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
        pinned: Array.isArray(parsed.pinned) ? parsed.pinned : [],
        customNames:
          parsed.customNames && typeof parsed.customNames === "object"
            ? parsed.customNames
            : {},
      });
    } catch {
      setPreferences(defaultPreferences);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [isHydrated, preferences]);

  const categories = useMemo(() => {
    return ["all", ...new Set(extensionCatalog.map((ext) => ext.category))];
  }, []);

  const visibleExtensions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const hiddenSet = new Set(preferences.hidden);
    const favoriteSet = new Set(preferences.favorites);
    const pinnedSet = new Set(preferences.pinned);

    const withMeta = extensionCatalog.map((extension) => ({
      ...extension,
      displayName: preferences.customNames[extension.id] || extension.title,
      isHidden: hiddenSet.has(extension.id),
      isFavorite: favoriteSet.has(extension.id),
      isPinned: pinnedSet.has(extension.id),
    }));

    const filtered = withMeta.filter((extension) => {
      if (filter === "all" && extension.isHidden) {
        return false;
      }
      if (
        filter === "favorites" &&
        (!extension.isFavorite || extension.isHidden)
      ) {
        return false;
      }
      if (filter === "pinned" && (!extension.isPinned || extension.isHidden)) {
        return false;
      }
      if (filter === "hidden" && !extension.isHidden) {
        return false;
      }

      if (statusFilter !== "all" && extension.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== "all" && extension.category !== categoryFilter) {
        return false;
      }

      if (normalizedQuery.length > 0) {
        const haystack = [
          extension.displayName,
          extension.description,
          extension.category,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }

      if (sortBy === "popularity") {
        return b.popularity - a.popularity;
      }

      if (sortBy === "lastUsed") {
        return Date.parse(b.lastUsedAt) - Date.parse(a.lastUsedAt);
      }

      return a.displayName.localeCompare(b.displayName, "fr");
    });
  }, [
    categoryFilter,
    filter,
    preferences.customNames,
    preferences.favorites,
    preferences.hidden,
    preferences.pinned,
    query,
    sortBy,
    statusFilter,
  ]);

  const selectedExtension = useMemo(
    () =>
      visibleExtensions.find(
        (extension) => extension.id === selectedExtensionId
      ) ?? null,
    [selectedExtensionId, visibleExtensions]
  );

  const togglePreference = (
    key: keyof Pick<ExtensionPreferences, "favorites" | "hidden" | "pinned">,
    extensionId: string,
    forceValue?: boolean
  ) => {
    setPreferences((previous) => {
      const currentSet = new Set(previous[key]);
      const nextValue = forceValue ?? !currentSet.has(extensionId);

      if (nextValue) {
        currentSet.add(extensionId);
      } else {
        currentSet.delete(extensionId);
      }

      const next: ExtensionPreferences = {
        ...previous,
        [key]: [...currentSet],
      };

      if (key === "hidden" && nextValue) {
        next.pinned = next.pinned.filter((id) => id !== extensionId);
      }

      return next;
    });
  };

  const filters: Array<{ id: ExtensionFilter; label: string }> = [
    { id: "all", label: "Toutes" },
    { id: "favorites", label: "Favoris" },
    { id: "pinned", label: "Épinglées" },
    { id: "hidden", label: "Masquées" },
  ];

  const handleOpenExtension = (route: string) => {
    router.push(route);
  };

  const handleRename = (id: string, defaultName: string) => {
    const candidate = renameDraft.trim() || defaultName;
    if (!candidate.trim()) {
      return;
    }
    setPreferences((previous) => ({
      ...previous,
      customNames: {
        ...previous.customNames,
        [id]: candidate,
      },
    }));
    setActionMessage(`Extension renommée en « ${candidate} ».`);
    setRenameTarget(null);
    setRenameDraft("");
  };

  return (
    <div className="liquid-glass flex h-full w-full flex-col gap-6 overflow-y-auto p-6 md:p-10">
      <header className="liquid-glass rounded-2xl border border-border/50 p-5">
        <div className="flex items-center gap-3">
          <PuzzleIcon className="size-8 text-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Extensions</h1>
              <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                v0.7.1
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Hub avancé: recherche multi-critères, tri par popularité/usage,
              fiches détaillées et actions rapides sur chaque carte.
            </p>
          </div>
        </div>
      </header>

      <section className="liquid-glass rounded-2xl border border-border/50 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="col-span-2 flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom, catégorie, description..."
              value={query}
            />
          </label>

          <select
            className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm"
            onChange={(event) => setCategoryFilter(event.target.value)}
            value={categoryFilter}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "Toutes catégories" : category}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm"
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | ExtensionStatus)
            }
            value={statusFilter}
          >
            <option value="all">Tous statuts</option>
            <option value="stable">Stable</option>
            <option value="beta">Bêta</option>
          </select>

          <select
            className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm"
            onChange={(event) => setSortBy(event.target.value as SortKey)}
            value={sortBy}
          >
            <option value="popularity">Popularité</option>
            <option value="lastUsed">Dernier usage</option>
            <option value="name">Nom</option>
          </select>
        </div>
      </section>

      <section className="liquid-glass flex flex-wrap gap-2 rounded-2xl border border-border/50 p-3">
        {filters.map((item) => {
          const active = filter === item.id;

          return (
            <button
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-foreground/40 bg-foreground/10 text-foreground"
                  : "border-border/60 bg-background/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              }`}
              key={item.id}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </section>

      {actionMessage ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
          {actionMessage}
        </p>
      ) : null}

      {renameTarget ? (
        <section className="liquid-glass rounded-2xl border border-border/50 p-4">
          <p className="text-sm font-medium">Renommer l&apos;extension</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              className="min-w-60 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm"
              onChange={(event) => setRenameDraft(event.target.value)}
              placeholder="Nouveau nom"
              value={renameDraft}
            />
            <button
              className="rounded-xl border border-border/60 px-3 py-2 text-xs"
              onClick={() =>
                handleRename(
                  renameTarget,
                  extensionCatalog.find((item) => item.id === renameTarget)
                    ?.title || "Extension"
                )
              }
              type="button"
            >
              Enregistrer
            </button>
            <button
              className="rounded-xl border border-border/60 px-3 py-2 text-xs"
              onClick={() => {
                setRenameTarget(null);
                setRenameDraft("");
              }}
              type="button"
            >
              Annuler
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleExtensions.map((extension) => (
          <div
            className="liquid-glass group rounded-2xl border border-border/50 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-[var(--shadow-card)]"
            key={extension.id}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xl font-semibold">
                <span className="inline-flex size-8 items-center justify-center rounded-xl border border-black/20 bg-white text-black shadow-sm dark:border-white/20 dark:bg-black dark:text-white">
                  <extension.icon
                    className="size-4 stroke-[2.2]"
                    stroke="currentColor"
                  />
                </span>
                <h2 className="text-lg font-bold text-foreground">
                  {extension.displayName}
                </h2>
              </div>
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                {extension.status === "beta" ? "Bêta" : "Stable"}
              </span>
            </div>

            <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
              {extension.description}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Popularité: {extension.popularity}% · Dernier usage:{" "}
              {extension.lastUsedAt}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                aria-pressed={extension.isFavorite}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition ${
                  extension.isFavorite
                    ? "border-foreground/40 bg-foreground/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  togglePreference("favorites", extension.id);
                }}
                type="button"
              >
                {extension.isFavorite ? (
                  <StarOff className="size-3" />
                ) : (
                  <Star className="size-3" />
                )}
                {extension.isFavorite ? "Retirer favori" : "Favori"}
              </button>

              <button
                aria-pressed={extension.isPinned}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition ${
                  extension.isPinned
                    ? "border-foreground/40 bg-foreground/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }`}
                disabled={extension.isHidden}
                onClick={(event) => {
                  event.stopPropagation();
                  togglePreference("pinned", extension.id);
                }}
                type="button"
              >
                {extension.isPinned ? (
                  <PinOff className="size-3" />
                ) : (
                  <Pin className="size-3" />
                )}
                {extension.isPinned ? "Désépingler" : "Épingler"}
              </button>

              <button
                aria-pressed={extension.isHidden}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition ${
                  extension.isHidden
                    ? "border-foreground/40 bg-foreground/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  togglePreference("hidden", extension.id);
                }}
                type="button"
              >
                <EyeOff className="size-3" />
                {extension.isHidden ? "Afficher" : "Masquer"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <button
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setRenameTarget(extension.id);
                  setRenameDraft(extension.displayName);
                }}
                type="button"
              >
                ✏️ Renommer
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  setActionMessage(
                    `« ${extension.displayName} » ajouté à un groupe.`
                  )
                }
                type="button"
              >
                <FolderPlus className="size-3" /> Grouper
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  setActionMessage(
                    `Copie locale de « ${extension.displayName} » créée.`
                  )
                }
                type="button"
              >
                <Copy className="size-3" /> Dupliquer
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(`${window.location.origin}${extension.route}`)
                    .catch(() => undefined);
                  setActionMessage(
                    `Lien copié pour « ${extension.displayName} ».`
                  );
                }}
                type="button"
              >
                <Share2 className="size-3" /> Partager
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  window.open(extension.route, "_blank", "noopener,noreferrer")
                }
                type="button"
              >
                <ExternalLink className="size-3" /> Nouvel onglet
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedExtensionId(extension.id)}
                type="button"
              >
                <Sparkles className="size-3" /> Voir données liées
              </button>
            </div>

            <button
              className="mt-4 inline-flex items-center gap-1 text-xs text-foreground"
              onClick={() => handleOpenExtension(extension.route)}
              type="button"
            >
              Ouvrir l&apos;extension
              <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        ))}
      </section>

      {selectedExtension ? (
        <section className="liquid-glass rounded-2xl border border-border/50 p-5">
          <h3 className="text-lg font-semibold">
            Fiche détaillée · {selectedExtension.displayName}
          </h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Cas d'usage</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {selectedExtension.useCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Exemples</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {selectedExtension.examples.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Limites</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {selectedExtension.limits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Permissions</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {selectedExtension.permissions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Historique: {selectedExtension.changelog.join(" · ")}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(selectedExtension.demoPrompt)
                  .catch(() => undefined);
                setActionMessage(
                  "Prompt de démo copié dans le presse-papiers."
                );
              }}
              type="button"
            >
              🎯 Essayer avec démo
            </button>
            <button
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs"
              onClick={() => setSelectedExtensionId(null)}
              type="button"
            >
              Fermer la fiche
            </button>
          </div>
        </section>
      ) : null}

      {visibleExtensions.length === 0 ? (
        <p className="liquid-glass rounded-2xl border border-border/50 p-4 text-sm text-muted-foreground">
          Aucune extension dans ce filtre pour le moment.
        </p>
      ) : null}
    </div>
  );
}
