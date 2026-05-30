/**
 * RecipeShoppingSheet — search for a recipe and add its missing ingredients
 * to the to-buy list.
 *
 * Performance design: nothing renders until the user types. Results are capped
 * at 5 so no bulk image loading happens on open.
 */
import { useMemo, useRef, useState, useEffect } from "react";
import { FlameIcon, SearchIcon, ShoppingCartIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";

const MAX_RESULTS = 5;

// ── Fraction helpers ────────────────────────────────────────────────────────

function normalizeFractions(str) {
  return str
    .replace(/½/g, "0.5").replace(/¼/g, "0.25").replace(/¾/g, "0.75")
    .replace(/⅓/g, "0.333").replace(/⅔/g, "0.667").replace(/⅛/g, "0.125")
    .replace(/⅜/g, "0.375").replace(/⅝/g, "0.625").replace(/⅞/g, "0.875");
}

// ── Ingredient parsing ──────────────────────────────────────────────────────

const UNIT_RE =
  /^(g|kg|ml|l|tbsp|tsp|cup|cups|oz|lb|lbs|pcs|cloves?|large|small|medium|bunch|handful|pinch|slices?|can|cans|jar|jars?)\b/i;

function parseIngredient(raw) {
  const s = normalizeFractions(raw).trim();
  const numMatch = s.match(/^([\d]+(?:[./][\d]+)?(?:\s[\d]+\/[\d]+)?)\s*/);
  let rest = s;
  let quantity = null;
  if (numMatch) {
    const numStr = numMatch[1];
    if (numStr.includes("/")) {
      const [num, den] = numStr.split("/").map(Number);
      quantity = num / den;
    } else {
      quantity = parseFloat(numStr);
    }
    rest = s.slice(numMatch[0].length);
  }
  const unitMatch = rest.match(UNIT_RE);
  let unit = "pcs";
  if (unitMatch) { unit = unitMatch[1].toLowerCase(); rest = rest.slice(unitMatch[0].length).trim(); }
  const name = rest.replace(/\s*\(.*?\)/g, "").replace(/^[,;–—-]+\s*/, "").trim();
  return { name: name || raw, quantity, unit };
}

// ── Name matching ────────────────────────────────────────────────────────────

function normName(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\b(fresh|dried|diced|chopped|sliced|minced|whole|ripe|frozen|cooked|raw|organic|extra|virgin|ground|grated|shredded|canned|crushed)\b/g, "")
    .replace(/\s+/g, " ").trim();
}

function nameMatches(a, b) {
  const na = normName(a), nb = normName(b);
  if (!na || !nb) return false;
  if (na.includes(nb) || nb.includes(na)) return true;
  const wa = na.split(" ")[0], wb = nb.split(" ")[0];
  return !!(wa && wb && (wa.startsWith(wb) || wb.startsWith(wa)));
}

// ── Component ────────────────────────────────────────────────────────────────

export function RecipeShoppingSheet({ open, onClose }) {
  const [selectedCode, setSelectedCode] = useState(null);
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);

  const recipes      = useRecipeStore((s) => s.recipes);
  const fridgeItems  = useGroceriesStore((s) => s.fridgeItems);
  const toBuyItems   = useGroceriesStore((s) => s.toBuyItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);

  // Auto-focus search when sheet opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 80);
    else { setSearch(""); setSelectedCode(null); }
  }, [open]);

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.code === selectedCode) ?? null,
    [recipes, selectedCode],
  );

  // Only compute results when the user has typed something
  const query = search.trim().toLowerCase();
  const matchedRecipes = useMemo(() => {
    if (!query) return [];
    return recipes.filter((r) => r.name.toLowerCase().includes(query));
  }, [recipes, query]);

  const visibleRecipes = matchedRecipes.slice(0, MAX_RESULTS);
  const overflow = matchedRecipes.length - MAX_RESULTS; // how many are hidden

  const missingParsed = useMemo(() => {
    if (!selectedRecipe?.ingredients?.length) return [];
    const fridgeNames = fridgeItems.map((f) => f.name);
    const buyNames    = toBuyItems.map((t) => t.name);
    return selectedRecipe.ingredients
      .map((raw) => ({ raw, ...parseIngredient(raw) }))
      .filter(({ name }) =>
        !fridgeNames.some((f) => nameMatches(f, name)) &&
        !buyNames.some((b)   => nameMatches(b, name)),
      );
  }, [selectedRecipe, fridgeItems, toBuyItems]);

  const handleAdd = () => {
    for (const { name, quantity, unit } of missingParsed) addToBuyItem({ name, quantity, unit });
    toast.success(`Added ${missingParsed.length} ingredient${missingParsed.length !== 1 ? "s" : ""} to your buy list`);
    setSelectedCode(null);
    onClose();
  };

  const handleClose = () => { setSelectedCode(null); setSearch(""); onClose(); };

  const clearSelected = () => setSelectedCode(null);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-80 sm:w-96 flex flex-col p-0">

        <SheetHeader className="px-4 pt-5 pb-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCartIcon size={16} />
            Cook from Recipe
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Search a recipe — ingredients you already have are skipped automatically.
          </p>
        </SheetHeader>

        {/* ── Search box ─────────────────────────────────────────────────── */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="relative">
            <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchRef}
              placeholder={`Search ${recipes.length} recipes…`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedCode(null); }}
              className="pl-8 h-9 text-sm"
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setSelectedCode(null); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Results / empty states ──────────────────────────────────────── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

          {/* No query yet */}
          {!query && !selectedRecipe && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground px-6 text-center">
              <SearchIcon size={32} strokeWidth={0.8} />
              <p className="text-sm">Type to search your recipes</p>
            </div>
          )}

          {/* Query with no results */}
          {query && matchedRecipes.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <FlameIcon size={28} strokeWidth={0.8} />
              <p className="text-sm">No matches for "{search}"</p>
            </div>
          )}

          {/* Result list (max 5) */}
          {visibleRecipes.length > 0 && (
            <div className="flex flex-col gap-0.5 px-2 pt-1 overflow-y-auto">
              {visibleRecipes.map((r) => {
                const active = selectedCode === r.code;
                return (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() => setSelectedCode(active ? null : r.code)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors w-full ${
                      active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                  >
                    {r.image ? (
                      <img
                        src={r.image}
                        loading="lazy"
                        className="w-8 h-8 rounded-md object-cover shrink-0"
                        alt=""
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <FlameIcon size={14} className="text-muted-foreground" strokeWidth={1.2} />
                      </div>
                    )}
                    <span className="text-sm font-medium truncate">{r.name}</span>
                  </button>
                );
              })}

              {/* "X more" hint when results are capped */}
              {overflow > 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{overflow} more — refine your search
                </p>
              )}
            </div>
          )}

          {/* Selected recipe info when no search query */}
          {!query && selectedRecipe && (
            <div className="px-4 py-3 flex items-center gap-2">
              {selectedRecipe.image && (
                <img src={selectedRecipe.image} className="w-9 h-9 rounded-md object-cover shrink-0" alt="" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{selectedRecipe.name}</p>
              </div>
              <button type="button" onClick={clearSelected} className="text-muted-foreground hover:text-foreground shrink-0">
                <XIcon size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Footer — missing ingredients + action ──────────────────────── */}
        {selectedRecipe && (
          <div className="border-t p-4 flex flex-col gap-3 shrink-0">
            {missingParsed.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-1">
                ✓ You already have everything for <strong>{selectedRecipe.name}</strong>!
              </p>
            ) : (
              <>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    {missingParsed.length} ingredient{missingParsed.length !== 1 ? "s" : ""} to buy:
                  </p>
                  <ul className="flex flex-col gap-0.5 max-h-36 overflow-y-auto">
                    {missingParsed.map(({ name, quantity, unit }, i) => (
                      <li key={i} className="text-sm flex items-center gap-1.5">
                        <span className="text-muted-foreground shrink-0">·</span>
                        <span className="flex-1">{name}</span>
                        {quantity != null && (
                          <span className="text-xs text-muted-foreground shrink-0">{quantity} {unit}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button onClick={handleAdd} className="w-full">
                  <ShoppingCartIcon size={14} />
                  Add {missingParsed.length} to buy list
                </Button>
              </>
            )}
          </div>
        )}

      </SheetContent>
    </Sheet>
  );
}
