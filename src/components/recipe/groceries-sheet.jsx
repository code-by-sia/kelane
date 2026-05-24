import { useMemo, useState, useCallback } from "react";
import { CheckCircle2Icon, CitrusIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { SmartExpiryPicker } from "../smart-expiry-picker";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import useGroceriesStore from "@/store/groceries";

function parseIngredient(str) {
  const match = str.match(/^(\d+\.?\d*)\s*(g|kg|ml|l|tbsp|tsp|cup)?\s*(.+)$/i);
  if (!match) return { name: str.trim(), quantity: null, unit: "pcs" };
  const [, qty, unit, name] = match;
  return { name: name.trim(), quantity: Number(qty), unit: unit?.toLowerCase() || "pcs" };
}

function isInStock(ingredient, fridgeItems) {
  return fridgeItems.some((item) =>
    ingredient.toLowerCase().includes(item.name.toLowerCase()),
  );
}

function findStockMatch(ingredient, fridgeItems) {
  return fridgeItems.find((item) =>
    ingredient.toLowerCase().includes(item.name.toLowerCase()),
  );
}

export function GroceriesSheet({ recipe }) {
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const toBuyItems = useGroceriesStore((s) => s.toBuyItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);

  const { inStock, missing } = useMemo(() => {
    const ingredients = recipe.ingredients || [];
    return {
      inStock: ingredients.filter((ing) => isInStock(ing, fridgeItems)),
      missing: ingredients.filter((ing) => !isInStock(ing, fridgeItems)),
    };
  }, [recipe.ingredients, fridgeItems]);

  const [expandedIng, setExpandedIng] = useState(null);
  const [expiryDates, setExpiryDates] = useState({});
  const [onlyNew, setOnlyNew] = useState(true);
  const [addedAll, setAddedAll] = useState(false);

  const isAlreadyInList = useCallback(
    (ingredient) =>
      toBuyItems.some((t) =>
        parseIngredient(ingredient).name.toLowerCase() === t.name.toLowerCase(),
      ),
    [toBuyItems],
  );

  const effectiveMissing = useMemo(
    () => (onlyNew ? missing.filter((ing) => !isAlreadyInList(ing)) : missing),
    [missing, onlyNew, isAlreadyInList],
  );

  const setExpiry = (ing, val) =>
    setExpiryDates((d) => ({ ...d, [ing]: val }));

  const addOne = (ingredient) => {
    const parsed = parseIngredient(ingredient);
    addToBuyItem({ ...parsed, expiresAt: expiryDates[ingredient] || null });
    toast.success(`Added "${parsed.name}" to buy list`);
    setExpandedIng(null);
  };

  const addAllMissing = () => {
    effectiveMissing.forEach((ing) => {
      addToBuyItem({
        ...parseIngredient(ing),
        expiresAt: expiryDates[ing] || null,
      });
    });
    const n = effectiveMissing.length;
    toast.success(`Added ${n} item${n !== 1 ? "s" : ""} to buy list`);
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <CitrusIcon className="text-primary" size={18} />
          Grocories
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Groceries</SheetTitle>
          <SheetDescription>
            {recipe.name} · {inStock.length}/{recipe.ingredients?.length ?? 0}{" "}
            ingredients in stock
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-6">
          {inStock.length > 0 && (
            <section className="flex flex-col gap-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                In stock
              </h3>
              {inStock.map((ing) => {
                const match = findStockMatch(ing, fridgeItems);
                return (
                  <div key={ing} className="flex items-center gap-2 py-1">
                    <CheckCircle2Icon
                      size={16}
                      className="shrink-0 text-green-500"
                    />
                    <span className="flex-1 text-sm">{ing}</span>
                    {match && (
                      <span className="text-xs text-muted-foreground">
                        via "{match.name}"
                      </span>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {missing.length > 0 && (
            <section className="flex flex-col gap-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Missing
                </h3>
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id="only-new"
                    checked={onlyNew}
                    onCheckedChange={(v) => setOnlyNew(!!v)}
                  />
                  <Label htmlFor="only-new" className="text-xs text-muted-foreground cursor-pointer">
                    Skip already in list
                  </Label>
                </div>
              </div>
              {effectiveMissing.map((ing) =>
                expandedIng === ing ? (
                  <div key={ing} className="flex flex-col gap-2 py-2 pl-6">
                    <span className="text-sm font-medium">{ing}</span>
                    <div className="border rounded-lg p-2 bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1.5">Expiry date (optional)</p>
                      <SmartExpiryPicker
                        value={expiryDates[ing] ?? null}
                        onChange={(val) => setExpiry(ing, val)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="xs" onClick={() => addOne(ing)}>
                        Add to list
                      </Button>
                      <Button size="xs" variant="ghost" onClick={() => setExpandedIng(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div key={ing} className="flex items-center gap-2 py-1">
                    <XCircleIcon
                      size={16}
                      className="shrink-0 text-amber-400"
                    />
                    <span className="flex-1 text-sm">{ing}</span>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setExpandedIng(ing)}
                    >
                      Add
                    </Button>
                  </div>
                ),
              )}
              {onlyNew && missing.length > effectiveMissing.length && (
                <p className="text-xs text-muted-foreground mt-1">
                  {missing.length - effectiveMissing.length} already in your buy list
                </p>
              )}
            </section>
          )}

          {missing.length === 0 && inStock.length > 0 && (
            <p className="text-sm text-center text-muted-foreground py-4">
              All ingredients are in stock.
            </p>
          )}
        </div>

        {effectiveMissing.length > 0 && (
          <SheetFooter>
            <Button
              className={`w-full transition-colors ${addedAll ? "bg-green-600 hover:bg-green-600" : ""}`}
              onClick={addAllMissing}
              disabled={addedAll}
            >
              {addedAll
                ? `Added ${effectiveMissing.length} item${effectiveMissing.length !== 1 ? "s" : ""}!`
                : `Add ${effectiveMissing.length} missing to buy list`}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
