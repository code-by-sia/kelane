import * as React from "react";
import { PanelRightIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useRecipeStore from "@/store/recipe";
import { DraggableRecipeCard } from "./draggable-recipe-card";

export function RecipePickerPanel({ onClose }) {
  const recipes = useRecipeStore((s) => s.recipes);
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(
    () =>
      recipes.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [recipes, search],
  );

  return (
    <div className="cal-picker">
      <div className="cal-picker__header">
        <span className="cal-picker__title">Recipes</span>
        <Button variant="ghost" size="icon-sm" onClick={onClose} title="Close picker">
          <PanelRightIcon size={14} />
        </Button>
      </div>

      <div className="cal-picker__search">
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs"
        />
      </div>

      <p className="px-3 py-1.5 text-[10px] text-muted-foreground border-b">
        Drag a recipe onto a slot to add it
      </p>

      <div className="cal-picker__list">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No recipes found.
          </p>
        ) : (
          filtered.map((r) => <DraggableRecipeCard key={r.code} recipe={r} />)
        )}
      </div>
    </div>
  );
}
