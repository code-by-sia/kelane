import { useRef, useState } from "react";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRecipeStore from "@/store/recipe";
import useHistoryStore from "@/store/history";
import useCalendarStore from "@/store/calendar";
import useGroceriesStore from "@/store/groceries";

const BACKUP_VERSION = 1;

export function DataTab() {
  const recipes    = useRecipeStore((s) => s.recipes);
  const categories = useRecipeStore((s) => s.categories);
  const mergeRecipes   = useRecipeStore((s) => s.mergeRecipes);
  const replaceRecipes = useRecipeStore((s) => s.replaceRecipes);

  const historyEntries = useHistoryStore((s) => s.entries);
  const calendarMeals  = useCalendarStore((s) => s.meals);
  const fridgeItems    = useGroceriesStore((s) => s.fridgeItems);
  const toBuyItems     = useGroceriesStore((s) => s.toBuyItems);

  const fileRef = useRef(null);
  const [preview, setPreview]   = useState(null);
  const [importing, setImporting] = useState(false);

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

  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
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
    e.target.value = "";
  };

  const handleImport = (mode) => {
    if (!preview) return;
    setImporting(true);
    try {
      if (mode === "replace") {
        replaceRecipes(preview.recipes, preview.categories ?? []);
      } else {
        mergeRecipes(preview.recipes);
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
              <Button variant="outline" onClick={() => handleImport("merge")} disabled={importing}>
                Merge
              </Button>
              <Button variant="destructive" onClick={() => handleImport("replace")} disabled={importing}>
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
