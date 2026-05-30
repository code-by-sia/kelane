/**
 * RecipeShoppingSheet — pick a recipe and add its missing ingredients to the
 * to-buy list (ingredients already in the fridge or already on the list are
 * skipped automatically).
 */
import { useMemo, useState } from "react";
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

// ── Fraction helpers ────────────────────────────────────────────────────────

/** Replace unicode fraction chars with decimal strings before calling parseFloat. */
function normalizeFractions(str) {
  return str
    .replace(/½/g, "0.5")
    .replace(/¼/g, "0.25")
    .replace(/¾/g, "0.75")
    .replace(/⅓/g, "0.333")
    .replace(/⅔/g, "0.667")
    .replace(/⅛/g, "0.125")
    .replace(/⅜/g, "0.375")
    .replace(/⅝/g, "0.625")
    .replace(/⅞/g, "0.875");
}

// ── Ingredient parsing ──────────────────────────────────────────────────────

const UNIT_RE =
  /^(g|kg|ml|l|tbsp|tsp|cup|cups|oz|lb|lbs|pcs|cloves?|large|small|medium|bunch|handful|pinch|slices?|can|cans|jar|jars?)\b/i;

/**
 * Parse a raw ingredient string into { name, quantity, unit }.
 * e.g. "250g fresh mozzarella (drained)" → { name: "fresh mozzarella", quantity: 250, unit: "g" }
 */
function parseIngredient(raw) {
  const s = normalizeFractions(raw).trim();

  // Match leading number (int, decimal, fraction like "1/2")
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

  // Match optional unit after the number
  const unitMatch = rest.match(UNIT_RE);
  let unit = "pcs";
  if (unitMatch) {
    unit = unitMatch[1].toLowerCase();
    rest = rest.slice(unitMatch[0].length).trim();
  }

  // Strip parenthetical notes, leading/trailing punctuation
  const name = rest
    .replace(/\s*\(.*?\)/g, "")
    .replace(/^[,;–—-]+\s*/, "")
    .trim();

  return { name: name || raw, quantity, unit };
}

// ── Name matching ────────────────────────────────────────────────────────────

/** Normalize to a comparable lowercase, stripped string. */
function normName(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(
      /\b(fresh|dried|diced|chopped|sliced|minced|whole|ripe|frozen|cooked|raw|organic|extra|virgin|ground|grated|shredded|canned|crushed)\b/g,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function nameMatches(a, b) {
  const na = normName(a);
  const nb = normName(b);
  if (!na || !nb) return false;
  if (na.includes(nb) || nb.includes(na)) return true;
  const wa = na.split(" ")[0];
  const wb = nb.split(" ")[0];
  if (wa && wb && (wa.startsWith(wb) || wb.startsWith(wa))) return true;
  return false;
}

// ── Component ────────────────────────────────────────────────────────────────

export function RecipeShoppingSheet({ open, onClose }) {
  const [selectedCode, setSelectedCode] = useState(null);
  const [search, setSearch] = useState("");

  const recipes = useRecipeStore((s) => s.recipes);
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const toBuyItems = useGroceriesStore((s) => s.toBuyItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.code === selectedCode) ?? null,
    [recipes, selectedCode],
  );

  // Filter recipe list by search query — memoized so typing doesn't re-render the whole list
  const filteredRecipes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? recipes.filter((r) => r.name.toLowerCase().includes(q)) : recipes;
  }, [recipes, search]);

  /**
   * Parse + filter ingredients in one pass.
   * Result: [{ raw, name, quantity, unit }, ...] for ingredients that are missing.
   * Memoized — only recomputes when the selected recipe or pantry changes.
   */
  const missingParsed = useMemo(() => {
    if (!selectedRecipe?.ingredients?.length) return [];
    const fridgeNames = fridgeItems.map((f) => f.name);
    const buyNames = toBuyItems.map((t) => t.name);
    return selectedRecipe.ingredients
      .map((raw) => ({ raw, ...parseIngredient(raw) }))
      .filter(
        ({ name }) =>
          !fridgeNames.some((f) => nameMatches(f, name)) &&
          !buyNames.some((b) => nameMatches(b, name)),
      );
  }, [selectedRecipe, fridgeItems, toBuyItems]);

  const handleAdd = () => {
    for (const { name, quantity, unit } of missingParsed) {
      addToBuyItem({ name, quantity, unit });
    }
    toast.success(
      `Added ${missingParsed.length} missing ingredient${
        missingParsed.length !== 1 ? "s" : ""
      } to your buy list`,
    );
    setSelectedCode(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedCode(null);
    setSearch("");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-80 sm:w-96 flex flex-col p-0">
        <SheetHeader className="px-4 pt-5 pb-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCartIcon size={16} />
            Cook from Recipe
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Pick a recipe — ingredients you already have or are buying will be
            skipped, the rest go straight to your buy list.
          </p>
        </SheetHeader>

        {/* Search */}
        <div className="px-3 pt-2 pb-1 shrink-0">
          <div className="relative">
            <SearchIcon
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="Search recipes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
          {filteredRecipes.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <FlameIcon size={32} strokeWidth={0.8} />
              <p className="text-sm">
                {recipes.length === 0 ? "No recipes yet." : "No matches found."}
              </p>
            </div>
          )}
          {filteredRecipes.map((r) => {
            const active = selectedCode === r.code;
            return (
              <button
                key={r.code}
                type="button"
                onClick={() => setSelectedCode(active ? null : r.code)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors w-full ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                {r.image ? (
                  <img
                    src={r.image}
                    className="w-8 h-8 rounded-md object-cover shrink-0"
                    alt=""
                  />
                ) : (
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <FlameIcon
                      size={14}
                      className="text-muted-foreground"
                      strokeWidth={1.2}
                    />
                  </div>
                )}
                <span className="text-sm font-medium truncate">{r.name}</span>
              </button>
            );
          })}
        </div>

        {/* Footer — shown once a recipe is selected */}
        {selectedRecipe && (
          <div className="border-t p-4 flex flex-col gap-3 shrink-0">
            {missingParsed.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-1">
                ✓ You already have everything for{" "}
                <strong>{selectedRecipe.name}</strong>!
              </p>
            ) : (
              <>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    {missingParsed.length} ingredient
                    {missingParsed.length !== 1 ? "s" : ""} to buy:
                  </p>
                  <ul className="flex flex-col gap-0.5 max-h-40 overflow-y-auto">
                    {missingParsed.map(({ name, quantity, unit }, i) => (
                      <li key={i} className="text-sm flex items-center gap-1.5">
                        <span className="text-muted-foreground shrink-0">·</span>
                        <span className="flex-1">{name}</span>
                        {quantity != null && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {quantity} {unit}
                          </span>
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
