/**
 * RecipeShoppingSheet — pick a recipe and add its missing ingredients to the
 * to-buy list (ingredients already in the fridge or already on the list are
 * skipped automatically).
 */
import { useState } from "react";
import { FlameIcon, ShoppingCartIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";

// Strip leading quantity + unit from an ingredient string and return just the
// ingredient name, e.g. "250g fresh mozzarella (drained)" → "fresh mozzarella"
function parseIngredientName(str) {
  return str
    .replace(/^[\d./\s½¼¾⅓⅔]+\s*(g|kg|ml|l|tbsp|tsp|cup|cups|oz|lb|lbs|pcs|cloves?|large|small|medium|bunch|handful|pinch|slices?|can|cans|jar|jars?)?\s*/i, "")
    .replace(/\s*\(.*?\)/g, "") // strip parenthetical notes
    .trim();
}

// Rough name match: check if two ingredient strings refer to the same thing
function nameMatches(a, b) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const na = norm(a);
  const nb = norm(b);
  const wa = na.split(" ")[0];
  const wb = nb.split(" ")[0];
  return na.includes(nb) || nb.includes(na) || wa === wb;
}

export function RecipeShoppingSheet({ open, onClose }) {
  const [selectedCode, setSelectedCode] = useState(null);

  const recipes = useRecipeStore((s) => s.recipes);
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const toBuyItems = useGroceriesStore((s) => s.toBuyItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);

  const selectedRecipe = recipes.find((r) => r.code === selectedCode) ?? null;

  // Compute which recipe ingredients are missing from fridge + buy list
  const missingIngredients = (() => {
    if (!selectedRecipe?.ingredients?.length) return [];
    const fridgeNames = fridgeItems.map((f) => f.name);
    const buyNames = toBuyItems.map((t) => t.name);
    return selectedRecipe.ingredients.filter((ing) => {
      const name = parseIngredientName(ing);
      return (
        !fridgeNames.some((f) => nameMatches(f, name)) &&
        !buyNames.some((b) => nameMatches(b, name))
      );
    });
  })();

  const handleAdd = () => {
    for (const ing of missingIngredients) {
      // Try to pull a leading quantity out of the original string
      const match = ing.match(/^([\d./½¼¾⅓⅔]+)\s*(g|kg|ml|l|tbsp|tsp|cup|cups|oz|lb|lbs)?\s*/i);
      const name = parseIngredientName(ing);
      addToBuyItem({
        name,
        quantity: match ? parseFloat(match[1]) || null : null,
        unit: match?.[2]?.toLowerCase() || "pcs",
      });
    }
    toast.success(
      `Added ${missingIngredients.length} missing ingredient${missingIngredients.length !== 1 ? "s" : ""} to your buy list`,
    );
    setSelectedCode(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedCode(null);
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

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
          {recipes.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <FlameIcon size={32} strokeWidth={0.8} />
              <p className="text-sm">No recipes yet.</p>
            </div>
          )}
          {recipes.map((r) => {
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
                    <FlameIcon size={14} className="text-muted-foreground" strokeWidth={1.2} />
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
            {missingIngredients.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-1">
                ✓ You already have everything for <strong>{selectedRecipe.name}</strong>!
              </p>
            ) : (
              <>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    {missingIngredients.length} ingredient{missingIngredients.length !== 1 ? "s" : ""} to buy:
                  </p>
                  <ul className="flex flex-col gap-0.5 max-h-40 overflow-y-auto">
                    {missingIngredients.map((ing, i) => (
                      <li key={i} className="text-sm flex items-start gap-1.5">
                        <span className="text-muted-foreground shrink-0 mt-0.5">·</span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button onClick={handleAdd} className="w-full">
                  <ShoppingCartIcon size={14} />
                  Add {missingIngredients.length} to buy list
                </Button>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
