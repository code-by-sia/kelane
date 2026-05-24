import { useRef, useState } from "react";
import { BrainCircuitIcon, CheckIcon, DatabaseIcon, DownloadIcon, GlobeIcon, PaletteIcon, SaladIcon, UploadIcon, ZapIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SidebarPage from "@/pages/sidebar-page";
import { ThemePicker } from "@/components/theme-picker";
import useSetupStore from "@/store/setup";
import useSettingsStore, { PROXY_PRESETS } from "@/store/settings";
import useRecipeStore from "@/store/recipe";
import useHistoryStore from "@/store/history";
import useCalendarStore from "@/store/calendar";
import useGroceriesStore from "@/store/groceries";
import { LLM_MODELS } from "@/data/llm-models";
import { toast } from "sonner";
import "./preferences.css";

const DIETARY_OPTIONS = [
  { id: "vegan",       label: "Vegan" },
  { id: "vegetarian",  label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free",  label: "Dairy-free" },
  { id: "low-carb",    label: "Low-carb" },
  { id: "nut-free",    label: "Nut-free" },
  { id: "halal",       label: "Halal" },
  { id: "kosher",      label: "Kosher" },
];

const SPEED_LABELS = { fast: "Fast", medium: "Medium", slow: "Slower" };

const BACKUP_VERSION = 1;

// ── Data tab ──────────────────────────────────────────────────────────────────
function DataTab() {
  const recipes    = useRecipeStore((s) => s.recipes);
  const categories = useRecipeStore((s) => s.categories);
  const mergeRecipes   = useRecipeStore((s) => s.mergeRecipes);
  const replaceRecipes = useRecipeStore((s) => s.replaceRecipes);

  const historyEntries = useHistoryStore((s) => s.entries);
  const calendarMeals  = useCalendarStore((s) => s.meals);
  const fridgeItems    = useGroceriesStore((s) => s.fridgeItems);
  const toBuyItems     = useGroceriesStore((s) => s.toBuyItems);

  const fileRef = useRef(null);
  const [preview, setPreview]   = useState(null); // parsed backup waiting for mode choice
  const [importing, setImporting] = useState(false);

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const backup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      recipes,
      categories,
      history: historyEntries,
      calendar: calendarMeals,
      groceries: { fridgeItems, toBuyItems },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `kelane-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  // ── Import — file picked ────────────────────────────────────────────────────
  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        // Validate minimal structure
        if (!Array.isArray(data.recipes)) {
          toast.error("Invalid backup: missing recipes array");
          return;
        }
        setPreview(data);
      } catch {
        toast.error("Could not parse file — make sure it is a valid Kelane backup JSON");
      }
    };
    reader.readAsText(file);
    // reset so the same file can be re-picked
    e.target.value = "";
  };

  // ── Import — confirm ────────────────────────────────────────────────────────
  const handleImport = (mode) => {
    if (!preview) return;
    setImporting(true);
    try {
      if (mode === "replace") {
        replaceRecipes(preview.recipes, preview.categories ?? []);
      } else {
        mergeRecipes(preview.recipes);
        // Merge categories too (add missing ones)
        if (Array.isArray(preview.categories)) {
          const addCat = useRecipeStore.getState().addCategory;
          preview.categories.forEach((c) => addCat(c));
        }
      }
      const n = preview.recipes.length;
      toast.success(`${mode === "replace" ? "Replaced" : "Merged"} ${n} recipe${n !== 1 ? "s" : ""}`);
      setPreview(null);
    } catch {
      toast.error("Import failed — please try again");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="prefs-tab-inner--gap">
      {/* Export */}
      <section className="prefs-data-section">
        <div>
          <p className="text-sm font-medium">Export backup</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Downloads your entire library — recipes, categories, cooking history,
            calendar meals, and grocery lists — as a single JSON file.
          </p>
        </div>
        <div className="prefs-data-stat-row">
          <span className="prefs-data-stat"><strong>{recipes.length}</strong> recipes</span>
          <span className="prefs-data-stat"><strong>{categories.length}</strong> categories</span>
          <span className="prefs-data-stat"><strong>{historyEntries.length}</strong> history entries</span>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <DownloadIcon size={15} />
          Export all
        </Button>
      </section>

      <div className="prefs-data-divider" />

      {/* Import */}
      <section className="prefs-data-section">
        <div>
          <p className="text-sm font-medium">Import backup</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Restore from a previously exported Kelane backup file.
            Choose <strong>Merge</strong> to keep existing data and add new
            recipes, or <strong>Replace</strong> to wipe and restore everything.
          </p>
        </div>

        {!preview ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFilePicked}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <UploadIcon size={15} />
              Choose backup file…
            </Button>
          </>
        ) : (
          <div className="prefs-import-preview">
            <div className="prefs-import-preview__counts">
              <p className="text-sm font-medium">Ready to import</p>
              <div className="prefs-data-stat-row">
                <span className="prefs-data-stat"><strong>{preview.recipes.length}</strong> recipes</span>
                <span className="prefs-data-stat"><strong>{(preview.categories ?? []).length}</strong> categories</span>
                {preview.history && (
                  <span className="prefs-data-stat"><strong>{preview.history.length}</strong> history entries</span>
                )}
              </div>
              {preview.exportedAt && (
                <p className="text-xs text-muted-foreground">
                  Exported {new Date(preview.exportedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => handleImport("merge")}
                disabled={importing}
              >
                Merge
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleImport("replace")}
                disabled={importing}
              >
                Replace all
              </Button>
              <Button variant="ghost" onClick={() => setPreview(null)} disabled={importing}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PreferencesPage() {
  const dietaryTags = useSetupStore((s) => s.preferences.dietaryTags);
  const setDietaryTags = useSetupStore((s) => s.setDietaryTags);
  const modelId = useSettingsStore((s) => s.modelId);
  const setModel = useSettingsStore((s) => s.setModel);
  const proxyPresetId = useSettingsStore((s) => s.proxyPresetId);
  const customProxyPrefix = useSettingsStore((s) => s.customProxyPrefix);
  const setProxyPreset = useSettingsStore((s) => s.setProxyPreset);
  const setCustomProxyPrefix = useSettingsStore((s) => s.setCustomProxyPrefix);

  const toggleTag = (id) =>
    setDietaryTags(
      dietaryTags.includes(id)
        ? dietaryTags.filter((t) => t !== id)
        : [...dietaryTags, id],
    );

  return (
    <SidebarPage title="Preferences">
      <Tabs defaultValue="appearance" className="flex flex-col flex-1 min-h-0">

        {/* ── Tab bar ── */}
        <TabsList className="prefs-tab-list">
          <TabsTrigger value="appearance" className="prefs-tab-trigger">
            <PaletteIcon size={13} />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="ai" className="prefs-tab-trigger">
            <BrainCircuitIcon size={13} />
            AI Model
          </TabsTrigger>
          <TabsTrigger value="dietary" className="prefs-tab-trigger">
            <SaladIcon size={13} />
            Dietary
          </TabsTrigger>
          <TabsTrigger value="network" className="prefs-tab-trigger">
            <GlobeIcon size={13} />
            Network
          </TabsTrigger>
          <TabsTrigger value="data" className="prefs-tab-trigger">
            <DatabaseIcon size={13} />
            Data
          </TabsTrigger>
        </TabsList>

        {/* ── Appearance ── */}
        <TabsContent value="appearance" className="prefs-tab-content">
          <div className="prefs-tab-inner">
            <ThemePicker />
          </div>
        </TabsContent>

        {/* ── AI Model ── */}
        <TabsContent value="ai" className="prefs-tab-content">
          <div className="prefs-tab-inner--gap">
            <p className="text-sm text-muted-foreground">
              Used by the recipe scanner to extract recipes from text. Models run
              entirely on your device — nothing is sent to the cloud. The first
              use downloads and caches the model locally.
            </p>
            <div className="flex flex-col gap-2">
              {LLM_MODELS.map((model) => {
                const active = modelId === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setModel(model.id)}
                    className={`prefs-model-card ${active ? "prefs-model-card--active" : "prefs-model-card--idle"}`}
                  >
                    <div className={`prefs-model-radio ${active ? "prefs-model-radio--active" : "prefs-model-radio--idle"}`}>
                      {active && <CheckIcon size={12} className="text-primary-foreground" strokeWidth={3} />}
                    </div>

                    <div className="prefs-model-meta">
                      <div className="prefs-model-name-row">
                        <span className="prefs-model-name">{model.name}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">
                          {model.size}
                        </Badge>
                      </div>
                      <span className="prefs-model-desc">{model.description}</span>
                    </div>

                    <div className="prefs-model-speed">
                      <ZapIcon size={12} className={
                        model.speed === "fast"   ? "text-green-500" :
                        model.speed === "medium" ? "text-amber-500" :
                                                   "text-muted-foreground"
                      } />
                      <span className="text-xs text-muted-foreground">{SPEED_LABELS[model.speed]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── Dietary preferences ── */}
        <TabsContent value="dietary" className="prefs-tab-content">
          <div className="prefs-tab-inner--gap">
            <p className="text-sm text-muted-foreground">
              Kelane uses these to highlight suitable recipes.
            </p>
            <div className="prefs-dietary-grid">
              {DIETARY_OPTIONS.map(({ id, label }) => (
                <label
                  key={id}
                  className={`prefs-dietary-label ${dietaryTags.includes(id) ? "prefs-dietary-label--active" : "prefs-dietary-label--idle"}`}
                >
                  <Checkbox
                    checked={dietaryTags.includes(id)}
                    onCheckedChange={() => toggleTag(id)}
                  />
                  <Label className="cursor-pointer font-normal">{label}</Label>
                </label>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Network / proxy ── */}
        <TabsContent value="network" className="prefs-tab-content">
          <div className="prefs-tab-inner--gap">
            <div>
              <p className="text-sm font-medium mb-0.5">CORS Proxy</p>
              <p className="text-sm text-muted-foreground">
                Used when fetching RSS feeds or recipe pages that block direct browser access.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {PROXY_PRESETS.map((preset) => {
                const active = proxyPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setProxyPreset(preset.id)}
                    className={`prefs-model-card ${active ? "prefs-model-card--active" : "prefs-model-card--idle"}`}
                  >
                    <div className={`prefs-model-radio ${active ? "prefs-model-radio--active" : "prefs-model-radio--idle"}`}>
                      {active && <CheckIcon size={12} className="text-primary-foreground" strokeWidth={3} />}
                    </div>
                    <div className="prefs-model-meta">
                      <div className="prefs-model-name-row">
                        <span className="prefs-model-name">{preset.label}</span>
                        {preset.id === "allorigins" && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">default</Badge>
                        )}
                      </div>
                      {preset.hint && (
                        <span className="prefs-model-desc">{preset.hint}</span>
                      )}
                      {preset.prefix && (
                        <span className="prefs-model-desc font-mono">{preset.prefix}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {proxyPresetId === "custom" && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Proxy prefix URL</Label>
                <Input
                  placeholder="https://my-proxy.example.com/?url="
                  value={customProxyPrefix}
                  onChange={(e) => setCustomProxyPrefix(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The target URL will be appended (URL-encoded) to this prefix.
                </p>
              </div>
            )}

            {proxyPresetId === "local" && (
              <div className="prefs-proxy-hint">
                <p className="text-xs text-muted-foreground">Start the local proxy in a terminal:</p>
                <code className="prefs-proxy-code">npm run proxy</code>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Data ── */}
        <TabsContent value="data" className="prefs-tab-content">
          <DataTab />
        </TabsContent>

      </Tabs>
    </SidebarPage>
  );
}
