/**
 * /import — landing page for the Chrome extension recipe importer.
 *
 * URL: /import?r=<base64url(JSON.stringify(recipe))>
 *
 * The `r` param is base64url encoded (URL-safe, no padding) so non-ASCII
 * characters in names/ingredients survive the round-trip without bloating the URL.
 *
 * Parses the payload, lets the user confirm name and categories, then saves
 * to the recipe store with an "imported-*" code and importedFrom field so the
 * My Recipes page can filter imported recipes.
 */
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  CheckCircle2Icon,
  ExternalLinkIcon,
  FlameIcon,
  ImportIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SidebarPage from "@/pages/sidebar-page";
import useRecipeStore from "@/store/recipe";

/* ── Base64url decode → JSON ─────────────────────────────────────────────── */
function parseImportParam(raw) {
  if (!raw) return null;
  try {
    // Restore standard base64 padding then decode UTF-8 bytes
    const padded = raw.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const obj  = JSON.parse(json);
    if (!obj || typeof obj !== "object" || !obj.name) return null;
    return obj;
  } catch {
    return null;
  }
}

/* ── Unique "imported-*" code ────────────────────────────────────────────── */
function generateCode() {
  return `imported-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function ImportPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const addRecipe   = useRecipeStore((s) => s.addRecipe);
  const categories  = useRecipeStore((s) => s.categories);
  const addCategory = useRecipeStore((s) => s.addCategory);

  const recipe = useMemo(() => parseImportParam(searchParams.get("r")), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [name,        setName]       = useState(recipe?.name ?? "");
  const [selectedCats, setSelectedCats] = useState(new Set());
  const [newCatInput, setNewCatInput]   = useState("");
  const [savedCode,   setSavedCode]     = useState(null); // code of saved recipe

  /* ── Empty / error state ──────────────────────────────────────────────── */
  if (!recipe) {
    return (
      <SidebarPage title="Import Recipe">
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground px-6 text-center">
          <FlameIcon size={40} strokeWidth={0.8} />
          <p className="font-semibold text-base text-foreground">No recipe data found</p>
          <p className="text-sm max-w-sm">
            This page is opened by the Kelane Chrome extension. Install the
            extension and click the import button on a recipe page.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>Go home</Button>
        </div>
      </SidebarPage>
    );
  }

  /* ── Success state ────────────────────────────────────────────────────── */
  if (savedCode) {
    return (
      <SidebarPage title="Import Recipe">
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center px-6">
          <CheckCircle2Icon size={44} className="text-green-500" strokeWidth={1.5} />
          <p className="font-bold text-lg">{name}</p>
          <p className="text-sm text-muted-foreground">Recipe saved to your library.</p>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => navigate("/my-recipes")}>
              My Recipes
            </Button>
            <Button onClick={() => navigate(`/my-recipes/${savedCode}`)}>
              View recipe
            </Button>
          </div>
        </div>
      </SidebarPage>
    );
  }

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const toggleCat = (cat) =>
    setSelectedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const addNewCategory = () => {
    const cat = newCatInput.trim();
    if (!cat) return;
    addCategory(cat);
    setSelectedCats((prev) => new Set([...prev, cat]));
    setNewCatInput("");
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Recipe name is required"); return; }

    const code = generateCode();
    addRecipe({
      code,
      name:         name.trim(),
      summary:      recipe.summary      || "",
      image:        recipe.image        || "",
      images:       recipe.images       || (recipe.image ? [recipe.image] : []),
      date:         new Date().toISOString(),
      prepTime:     recipe.prepTime     || 0,
      servings:     recipe.servings     || 4,
      calories:     recipe.calories     || 0,
      ingredients:  recipe.ingredients  || [],
      steps:        recipe.steps        || [],
      tools:        recipe.tools        || [],
      categories:   [...selectedCats],
      tags:         recipe.tags         || [],
      flagged:      false,
      liked:        false,
      variants:     [],
      // ↓ marks this as an imported recipe — used by My Recipes "Imported" filter
      importedFrom: recipe.source       || null,
    });

    setSavedCode(code);
    toast.success(`"${name.trim()}" added to your library!`);
  };

  /* ── UI ───────────────────────────────────────────────────────────────── */
  const hostname = (() => {
    try { return new URL(recipe.source).hostname.replace(/^www\./, ""); }
    catch { return recipe.source; }
  })();

  return (
    <SidebarPage title="Import Recipe">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">

        {/* Source link */}
        {recipe.source && (
          <a
            href={recipe.source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ExternalLinkIcon size={11} />
            {hostname}
          </a>
        )}

        {/* Hero image */}
        {recipe.image && (
          <div className="rounded-xl overflow-hidden aspect-video bg-muted">
            <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Editable name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="recipe-name" className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            Recipe name
          </Label>
          <Input
            id="recipe-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-base font-semibold h-11"
            placeholder="Recipe name"
          />
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2">
          {recipe.prepTime > 0 && (
            <Badge variant="secondary">
              ⏱ {recipe.prepTime < 60
                ? `${recipe.prepTime} min`
                : `${Math.floor(recipe.prepTime / 60)}h${recipe.prepTime % 60 > 0 ? ` ${recipe.prepTime % 60}m` : ""}`}
            </Badge>
          )}
          {recipe.servings > 0   && <Badge variant="secondary">🍽 {recipe.servings} servings</Badge>}
          {recipe.calories > 0   && <Badge variant="secondary">🔥 {recipe.calories} kcal</Badge>}
          {recipe.ingredients?.length > 0 && <Badge variant="secondary">🧂 {recipe.ingredients.length} ingredients</Badge>}
          {recipe.steps?.length  > 0 && <Badge variant="secondary">📋 {recipe.steps.length} steps</Badge>}
          {/* Always show "Imported" badge so the user knows the origin */}
          <Badge variant="outline" className="gap-1">
            <ImportIcon size={10} />
            Imported
          </Badge>
        </div>

        <Separator />

        {/* Ingredients preview */}
        {recipe.ingredients?.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ingredients ({recipe.ingredients.length})
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {recipe.ingredients.slice(0, 12).map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground shrink-0 mt-0.5">·</span>
                  <span className="text-foreground/80">{ing}</span>
                </li>
              ))}
              {recipe.ingredients.length > 12 && (
                <li className="text-xs text-muted-foreground col-span-full pt-1">
                  +{recipe.ingredients.length - 12} more ingredients
                </li>
              )}
            </ul>
          </div>
        )}

        <Separator />

        {/* Category picker */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCat(cat)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedCats.has(cat)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-accent"
                }`}
              >
                {selectedCats.has(cat) && <XIcon size={11} />}
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="New category…"
              value={newCatInput}
              className="h-8 text-sm"
              onChange={(e) => setNewCatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewCategory()}
            />
            <Button variant="outline" size="sm" onClick={addNewCategory} disabled={!newCatInput.trim()}>
              Add
            </Button>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map((t) => (
              <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate("/")}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={handleSave}>
            <ImportIcon size={15} />
            Save recipe
          </Button>
        </div>

      </div>
    </SidebarPage>
  );
}
