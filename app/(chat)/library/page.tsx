"use client";

import {
  Copy,
  Download,
  Eye,
  Heart,
  Pencil,
  Pin,
  PinOff,
  Search,
  ShieldAlert,
  Trash2,
  UploadCloud,
  Grid3X3,
  List,
  Settings2,
  FolderPlus,
  Tag,
  ChevronDown,
  SortAsc,
  GripVertical,
  X,
  Check,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type LibraryAssetType = "image" | "document";
type LibraryAssetSource = "device" | "mai-library";
type FilterMode = "all" | "favorites" | "recent";
type ViewMode = "grid" | "list";
type SortField = "date" | "name" | "size";
type SortOrder = "asc" | "desc";

interface LibraryAsset {
  id: string;
  name: string;
  type: LibraryAssetType;
  source: LibraryAssetSource;
  createdAt: string;
  pinned: boolean;
  favorite: boolean;
  url: string;
  tags: string[];
  folderId: string | null;
  size: number;
}

interface Folder {
  id: string;
  name: string;
  color?: string;
}

const STORAGE_KEY = "mai.library.assets";
const VIEW_STORAGE_KEY = "mai.library.view";
const SORT_STORAGE_KEY = "mai.library.sort";
const FOLDERS_STORAGE_KEY = "mai.library.folders";
const TAGS_STORAGE_KEY = "mai.library.tags";

const initialAssets: LibraryAsset[] = [
  {
    id: "sample-image-1",
    name: "Inspiration studio.png",
    type: "image",
    source: "mai-library",
    createdAt: new Date().toISOString(),
    pinned: true,
    favorite: true,
    url: "/images/demo-thumbnail.png",
    tags: ["design", "inspiration"],
    folderId: null,
    size: 245000,
  },
  {
    id: "sample-doc-1",
    name: "Plan produit Q2.txt",
    type: "document",
    source: "mai-library",
    createdAt: new Date().toISOString(),
    pinned: false,
    favorite: false,
    url: "",
    tags: ["product", "roadmap"],
    folderId: null,
    size: 12000,
  },
];

export default function LibraryPage() {
  const { plan } = useSubscriptionPlan();
  const router = useRouter();
  const [assets, setAssets] = useState<LibraryAsset[]>(initialAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [renamingAssetId, setRenamingAssetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [previewAsset, setPreviewAsset] = useState<LibraryAsset | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const storageLimit = useMemo(() => {
    if (plan === "max") return 100;
    if (plan === "pro") return 70;
    if (plan === "plus") return 50;
    return 30;
  }, [plan]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const viewRaw = localStorage.getItem(VIEW_STORAGE_KEY);
      const sortRaw = localStorage.getItem(SORT_STORAGE_KEY);
      const foldersRaw = localStorage.getItem(FOLDERS_STORAGE_KEY);
      const tagsRaw = localStorage.getItem(TAGS_STORAGE_KEY);

      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAssets));
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setAssets(parsed.map((asset) => ({
            ...asset,
            favorite: Boolean(asset.favorite),
            pinned: Boolean(asset.pinned),
            tags: asset.tags || [],
            size: asset.size || 0,
          })));
        }
      }

      if (viewRaw) setViewMode(viewRaw as ViewMode);
      if (sortRaw) {
        const s = JSON.parse(sortRaw);
        setSortField(s.field);
        setSortOrder(s.order);
      }
      if (foldersRaw) setFolders(JSON.parse(foldersRaw));
      if (tagsRaw) setTags(JSON.parse(tagsRaw));

    } catch {
      setAssets(initialAssets);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify({ field: sortField, order: sortOrder }));
  }, [sortField, sortOrder]);

  useEffect(() => {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    return () => {
      for (const asset of assets) {
        if (asset.url.startsWith("blob:")) {
          URL.revokeObjectURL(asset.url);
        }
      }
    };
  }, [assets]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const sortedAssets = useMemo(() => {
    const result = [...assets];

    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "size":
          comparison = b.size - a.size;
          break;
      }

      return sortOrder === "asc" ? -comparison : comparison;
    });

    return result;
  }, [assets, sortField, sortOrder]);

  const filteredAssets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return sortedAssets.filter((asset) => {
      if (selectedFolder && asset.folderId !== selectedFolder) return false;
      if (filterMode === "favorites" && !asset.favorite) return false;
      if (filterMode === "recent") {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (new Date(asset.createdAt).getTime() < weekAgo) return false;
      }

      if (normalizedSearch) {
        const searchable = `${asset.name} ${asset.type} ${asset.source} ${asset.tags.join(" ")}`.toLowerCase();
        if (!searchable.includes(normalizedSearch)) return false;
      }

      return true;
    });
  }, [sortedAssets, selectedFolder, filterMode, searchTerm]);

  const stats = useMemo(() => {
    const totalSize = assets.reduce((sum, a) => sum + a.size, 0);
    return { total: assets.length, size: totalSize, images: assets.filter(a => a.type === "image").length };
  }, [assets]);

  const handleImport = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (assets.length >= storageLimit) {
      toast.error(`Limite atteinte pour ${plan.toUpperCase()} : ${storageLimit} fichiers maximum.`);
      event.target.value = "";
      return;
    }

    const url = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";

    setAssets((current) => [
      {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "document",
        source: "device",
        createdAt: new Date().toISOString(),
        pinned: false,
        favorite: false,
        url,
        tags: [],
        folderId: selectedFolder,
        size: file.size,
      },
      ...current,
    ]);

    event.target.value = "";
    toast.success("Fichier importé avec succès");
  }, [assets.length, storageLimit, plan, selectedFolder]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    if (assets.length + files.length > storageLimit) {
      toast.error(`Limite de stockage dépassée`);
      return;
    }

    for (const file of files) {
      const url = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";

      setAssets((current) => [
        {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type.startsWith("image/") ? "image" : "document",
          source: "device",
          createdAt: new Date().toISOString(),
          pinned: false,
          favorite: false,
          url,
          tags: [],
          folderId: selectedFolder,
          size: file.size,
        },
        ...current,
      ]);
    }

    toast.success(`${files.length} fichier(s) importé(s)`);
  }, [assets.length, storageLimit, selectedFolder]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const duplicateAsset = (asset: LibraryAsset) => {
    if (assets.length >= storageLimit) {
      toast.error("Duplication impossible : quota atteint.");
      return;
    }

    setAssets((current) => [
      {
        ...asset,
        id: crypto.randomUUID(),
        name: `${asset.name} (copie)`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  const openRenameEditor = (asset: LibraryAsset) => {
    setRenamingAssetId(asset.id);
    setRenameValue(asset.name);
  };

  const commitRename = () => {
    if (!renamingAssetId || !renameValue.trim()) return;

    setAssets((current) =>
      current.map((asset) =>
        asset.id === renamingAssetId
          ? { ...asset, name: renameValue.trim() }
          : asset
      )
    );
    setRenamingAssetId(null);
    setRenameValue("");
  };

  const handleDelete = () => {
    if (!assetToDelete) return;

    setAssets((current) => {
      const asset = current.find((candidate) => candidate.id === assetToDelete);
      if (asset?.url.startsWith("blob:")) {
        URL.revokeObjectURL(asset.url);
      }
      return current.filter((candidate) => candidate.id !== assetToDelete);
    });

    setAssetToDelete(null);
    toast.success("Fichier supprimé");
  };

  const handleOpenAsset = (asset: LibraryAsset) => {
    if (previewAsset?.id === asset.id) {
      setPreviewAsset(null);
      return;
    }

    const pendingKey = "mai.chat.pending-library-attachments";
    const existingRaw = localStorage.getItem(pendingKey);
    const existing = existingRaw ? (JSON.parse(existingRaw) as unknown[]) : [];
    const contentType = asset.type === "image" ? "image/*" : "text/plain";

    localStorage.setItem(
      pendingKey,
      JSON.stringify([
        {
          url: asset.url || `data:text/plain,${encodeURIComponent(asset.name)}`,
          name: asset.name,
          contentType,
          fromLibrary: true,
        },
        ...existing,
      ])
    );

    setPreviewAsset(asset);
    router.push("/");
    toast.success("Fichier prêt à être utilisé dans le chat.");
  };

  const addTag = (name: string) => {
    if (!name.trim() || tags.includes(name.trim())) return;
    setTags([...tags, name.trim()]);
    setNewTagName("");
  };

  const deleteTag = (name: string) => {
    setTags(tags.filter(t => t !== name));
    setAssets(assets.map(a => ({ ...a, tags: a.tags.filter(t => t !== name) })));
  };

  const renameTag = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName.trim()) return;
    setTags(tags.map(t => t === oldName ? newName.trim() : t));
    setAssets(assets.map(a => ({ ...a, tags: a.tags.map(t => t === oldName ? newName.trim() : t) })));
  };

  const toggleAssetTag = (assetId: string, tag: string) => {
    setAssets(assets.map(a => 
      a.id === assetId 
        ? { ...a, tags: a.tags.includes(tag) ? a.tags.filter(t => t !== tag) : [...a.tags, tag] }
        : a
    ));
  };

  const addFolder = (name: string) => {
    if (!name.trim()) return;
    setFolders([...folders, { id: crypto.randomUUID(), name: name.trim() }]);
    setNewFolderName("");
  };

  const deleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
    setAssets(assets.map(a => a.folderId === id ? { ...a, folderId: null } : a));
    if (selectedFolder === id) setSelectedFolder(null);
  };

  return (
    <div 
      className="liquid-glass flex h-full w-full flex-col gap-5 overflow-y-auto p-6 md:p-10"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-primary/10 flex items-center justify-center pointer-events-none">
          <div className="liquid-glass p-8 rounded-3xl border-2 border-dashed border-primary text-center">
            <UploadCloud className="size-12 mx-auto mb-2 text-primary" />
            <p className="text-lg font-medium">Déposez vos fichiers ici</p>
          </div>
        </div>
      )}

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Bibliothèque</h1>
          <p className="text-sm text-muted-foreground">
            Répertoire centralisé de vos photos, documents et créations Studio.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Stockage {plan.toUpperCase()} : {assets.length}/{storageLimit} fichiers · {stats.images} images · {formatSize(stats.size)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-background/50 p-2 backdrop-blur-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="h-9 w-9 p-0"
          >
            {viewMode === "grid" ? <List className="size-4" /> : <Grid3X3 className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <SortAsc className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortField("date")}>
                {sortField === "date" && <Check className="size-4 mr-2" />} Trier par date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortField("name")}>
                {sortField === "name" && <Check className="size-4 mr-2" />} Trier par nom
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortField("size")}>
                {sortField === "size" && <Check className="size-4 mr-2" />} Trier par taille
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <SortAsc className="size-4 mr-2" /> : <ChevronDown className="size-4 mr-2" />}
                {sortOrder === "asc" ? "Croissant" : "Décroissant"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => setShowSettings(true)}>
            <Settings2 className="size-4" />
          </Button>

          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border/60 px-3 text-xs hover:bg-muted/40">
            <UploadCloud className="size-4" /> Importer
            <input className="hidden" onChange={handleImport} type="file" multiple />
          </label>
        </div>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card/65 p-4 backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button
            variant={selectedFolder === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFolder(null)}
            className="text-xs h-7"
          >
            Tous les fichiers
          </Button>
          {folders.map(folder => (
            <Button
              key={folder.id}
              variant={selectedFolder === folder.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFolder(folder.id)}
              className="text-xs h-7"
            >
              📁 {folder.name}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => addFolder("Nouveau dossier")}>
            <FolderPlus className="size-3 mr-1" /> Nouveau
          </Button>
        </div>

        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Recherche instantanée</span>
          <div className="flex items-center gap-2">
            <select
              className="h-7 rounded-lg border border-border/60 bg-background/60 px-2 text-[11px]"
              onChange={(event) => setFilterMode(event.target.value as FilterMode)}
              value={filterMode}
            >
              <option value="all">Tous</option>
              <option value="favorites">Favoris</option>
              <option value="recent">Ajouts 7 jours</option>
            </select>
            {searchTerm.trim() && (
              <button
                className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[11px] transition-colors hover:border-primary/40 hover:text-foreground"
                onClick={() => setSearchTerm("")}
                type="button"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 flex min-h-11 items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <Search className="size-4 text-muted-foreground" />
          <input
            className="w-full bg-transparent text-sm focus:outline-none"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nom, type, étiquette ou source…"
            type="search"
            value={searchTerm}
          />
        </div>

        <div className={viewMode === "grid" 
          ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" 
          : "flex flex-col gap-2"}
        >
          {filteredAssets.map((asset) => (
            <article
              className={`liquid-glass rounded-2xl border border-border/50 bg-background/45 p-3 transition-all
                ${hoveredAssetId === asset.id ? "ring-2 ring-primary/30 scale-[1.01]" : ""}
                ${viewMode === "list" ? "flex items-center gap-3 py-2" : ""}`}
              key={asset.id}
              onMouseEnter={() => setHoveredAssetId(asset.id)}
              onMouseLeave={() => setHoveredAssetId(null)}
            >
              {viewMode === "list" ? (
                <>
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    {asset.url ? (
                      <Image
                        alt={asset.name}
                        className="h-full w-full object-cover"
                        height={48}
                        src={asset.url}
                        unoptimized={asset.url.startsWith("blob:")}
                        width={48}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted/50 text-xs">📄</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString()} · {formatSize(asset.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {asset.pinned && <Pin className="size-3 text-amber-500" />}
                    {asset.favorite && <Heart className="size-3 text-rose-500 fill-current" />}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      {asset.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1">{tag}</Badge>
                      ))}
                    </div>
                    <button
                      className="rounded-md p-1 hover:bg-muted"
                      onClick={() =>
                        setAssets((current) =>
                          current.map((currentAsset) =>
                            currentAsset.id === asset.id
                              ? { ...currentAsset, pinned: !currentAsset.pinned }
                              : currentAsset
                          )
                        )
                      }
                      type="button"
                    >
                      {asset.pinned ? (
                        <PinOff className="size-4 text-amber-500" />
                      ) : (
                        <Pin className="size-4" />
                      )}
                    </button>
                  </div>

                  {asset.url ? (
                    <Image
                      alt={asset.name}
                      className="mb-3 h-36 w-full rounded-xl border border-border/50 object-cover transition-transform"
                      height={144}
                      src={asset.url}
                      unoptimized={asset.url.startsWith("blob:")}
                      width={320}
                    />
                  ) : (
                    <div className="mb-3 flex h-36 items-center justify-center rounded-xl border border-dashed border-border/50 text-xs text-muted-foreground">
                      Aperçu non disponible
                    </div>
                  )}

                  {renamingAssetId === asset.id ? (
                    <div className="space-y-2">
                      <input
                        className="h-8 w-full rounded-lg border border-border/60 bg-background/70 px-2 text-sm"
                        onChange={(event) => setRenameValue(event.target.value)}
                        value={renameValue}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button onClick={commitRename} size="sm" variant="outline">
                          Valider
                        </Button>
                        <Button
                          onClick={() => setRenamingAssetId(null)}
                          size="sm"
                          variant="ghost"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="line-clamp-2 text-sm font-medium">{asset.name}</p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(asset.createdAt).toLocaleString()} · {formatSize(asset.size)}
                  </p>
                </>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Button
                  onClick={() => handleOpenAsset(asset)}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                >
                  <Eye className="mr-1 size-3" /> Ouvrir
                </Button>
                <Button
                  onClick={() =>
                    setAssets((current) =>
                      current.map((item) =>
                        item.id === asset.id
                          ? { ...item, favorite: !item.favorite }
                          : item
                      )
                    )
                  }
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                >
                  <Heart
                    className={`mr-1 size-3 ${asset.favorite ? "fill-current text-rose-500" : ""}`}
                  />
                </Button>
                <Button
                  onClick={() => duplicateAsset(asset)}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                >
                  <Copy className="mr-1 size-3" />
                </Button>
                <Button
                  onClick={() => openRenameEditor(asset)}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                >
                  <Pencil className="mr-1 size-3" />
                </Button>
                <Button
                  className="h-7 px-2 text-[11px] text-red-500 hover:text-red-500"
                  onClick={() => setAssetToDelete(asset.id)}
                  size="sm"
                  variant="outline"
                >
                  <Trash2 className="mr-1 size-3" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]">
                      <Tag className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {tags.map(tag => (
                      <DropdownMenuItem 
                        key={tag} 
                        onClick={() => toggleAssetTag(asset.id, tag)}
                      >
                        {asset.tags.includes(tag) && <Check className="size-3 mr-2" />}
                        {tag}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </article>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground text-center">
            Aucun média trouvé. Essayez une autre recherche ou importez un fichier.
          </div>
        )}
      </section>

      {previewAsset && (
        <section className="liquid-glass rounded-2xl border border-border/60 bg-card/70 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Aperçu instantané</h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleOpenAsset(previewAsset)}
                size="sm"
                variant="outline"
              >
                <Download className="mr-1 size-3.5" />
                Ajouter au chat
              </Button>
              <Button
                onClick={() => setPreviewAsset(null)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          {previewAsset.url ? (
            <Image
              alt={previewAsset.name}
              className="max-h-56 w-full rounded-xl border border-border/50 object-contain"
              height={240}
              src={previewAsset.url}
              unoptimized={previewAsset.url.startsWith("blob:")}
              width={480}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
              Document sélectionné : {previewAsset.name}
            </p>
          )}
        </section>
      )}

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Paramètres avancés</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Étiquettes</h4>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Nouvelle étiquette..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag(newTagName)}
                />
                <Button size="sm" onClick={() => addTag(newTagName)}>Ajouter</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => deleteTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Dossiers</h4>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Nouveau dossier..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFolder(newFolderName)}
                />
                <Button size="sm" onClick={() => addFolder(newFolderName)}>Ajouter</Button>
              </div>
              <div className="space-y-1">
                {folders.map(folder => (
                  <div key={folder.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span>📁 {folder.name}</span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => deleteFolder(folder.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Statistiques</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-md bg-muted/50">
                  <p className="text-lg font-semibold">{stats.total}</p>
                  <p className="text-[11px] text-muted-foreground">Fichiers</p>
                </div>
                <div className="p-2 rounded-md bg-muted/50">
                  <p className="text-lg font-semibold">{stats.images}</p>
                  <p className="text-[11px] text-muted-foreground">Images</p>
                </div>
                <div className="p-2 rounded-md bg-muted/50">
                  <p className="text-lg font-semibold">{formatSize(stats.size)}</p>
                  <p className="text-[11px] text-muted-foreground">Espace</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
          <ShieldAlert className="size-4" />
          <p className="text-xs font-medium">Suppression sécurisée activée</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Les suppressions demandent une confirmation pour éviter les pertes
          accidentelles.
        </p>
      </section>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setAssetToDelete(null);
        }}
        open={Boolean(assetToDelete)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce fichier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Suppression sécurisée : cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
