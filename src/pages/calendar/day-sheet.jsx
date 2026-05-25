import { useState, useRef } from "react";
import { Trash2Icon, UtensilsIcon, PlusIcon, PencilIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import useCalendarStore from "@/store/calendar";
import useRecipeStore from "@/store/recipe";
import { SLOTS, SLOT_COLORS } from "./constants";
import { RepeatMealPopover } from "./repeat-meal-popover";

// ── Inline recipe picker ──────────────────────────────────────────────────────

function RecipePicker({ onSelect, onCancel }) {
  const recipes = useRecipeStore((s) => s.recipes);
  const [search, setSearch] = useState("");

  const refCallback = (el) => {
    if (el) setTimeout(() => el.focus(), 0);
  };

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col rounded-lg border bg-popover shadow-md overflow-hidden">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <input
          ref={refCallback}
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          placeholder="Search recipes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter" && filtered.length === 1) onSelect(filtered[0]);
          }}
        />
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-foreground shrink-0"
        >
          Cancel
        </button>
      </div>
      <ul className="max-h-48 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <li className="px-3 py-4 text-sm text-center text-muted-foreground">
            No recipes found.
          </li>
        ) : (
          filtered.map((r) => (
            <li
              key={r.code}
              className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors"
              onMouseDown={(e) => { e.preventDefault(); onSelect(r); }}
            >
              {r.image
                ? <img src={r.image} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                : <div className="w-7 h-7 rounded bg-muted shrink-0" />}
              <span className="flex-1 truncate">{r.name}</span>
              {r.calories > 0 && (
                <span className="text-xs text-muted-foreground shrink-0">{r.calories} kcal</span>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// ── Single meal row ───────────────────────────────────────────────────────────

function MealRow({ meal, dateKey }) {
  const getRecipe  = useRecipeStore((s) => s.getRecipe);
  const addMeal    = useCalendarStore((s) => s.addMeal);
  const removeMeal = useCalendarStore((s) => s.removeMeal);
  const [editing, setEditing] = useState(false);

  const recipe = getRecipe(meal.recipeCode);

  const handleChange = (newRecipe) => {
    removeMeal(dateKey, meal.recipeCode, meal.slot);
    addMeal(dateKey, newRecipe.code, meal.slot);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 group">
        {recipe?.image && (
          <img src={recipe.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
        )}
        <span className="flex-1 text-sm font-medium truncate">
          {recipe?.name ?? `Recipe #${meal.recipeCode}`}
        </span>
        {recipe?.calories > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">{recipe.calories} kcal</span>
        )}
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
          title="Change recipe"
        >
          <PencilIcon size={13} />
        </button>
        <RepeatMealPopover meal={meal} dateKey={dateKey} />
        <Button variant="ghost" size="icon-sm" onClick={() => removeMeal(dateKey, meal.recipeCode, meal.slot)} title="Remove">
          <Trash2Icon size={14} />
        </Button>
      </div>
      {editing && (
        <RecipePicker onSelect={handleChange} onCancel={() => setEditing(false)} />
      )}
    </div>
  );
}

// ── Slot section ─────────────────────────────────────────────────────────────

function SlotSection({ slot, meals, dateKey }) {
  const addMeal = useCalendarStore((s) => s.addMeal);
  const [adding, setAdding] = useState(false);

  const handleAdd = (recipe) => {
    addMeal(dateKey, recipe.code, slot);
    setAdding(false);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${SLOT_COLORS[slot]}`} />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {slot}
          </h3>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent px-2 py-0.5 rounded transition-colors"
          >
            <PlusIcon size={12} /> Add
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 pl-4">
        {meals.length === 0 && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-left text-xs text-muted-foreground hover:text-foreground py-1 transition-colors"
          >
            + Add {slot} recipe
          </button>
        )}
        {meals.map((m) => (
          <MealRow
            key={`${m.recipeCode}-${m.slot}`}
            meal={m}
            dateKey={dateKey}
          />
        ))}
      </div>

      {adding && (
        <div className="pl-4 mt-1">
          <RecipePicker onSelect={handleAdd} onCancel={() => setAdding(false)} />
        </div>
      )}
    </section>
  );
}

// ── Main sheet ────────────────────────────────────────────────────────────────

export function DaySheet({ dateKey, onClose }) {
  const getMealsForDate = useCalendarStore((s) => s.getMealsForDate);
  const dayMeals = getMealsForDate(dateKey);

  const grouped = SLOTS.reduce((acc, slot) => {
    acc[slot] = dayMeals.filter((m) => m.slot === slot);
    return acc;
  }, {});

  const displayDate = dateKey
    ? format(new Date(dateKey + "T00:00:00"), "EEEE, MMMM d")
    : "";

  return (
    <Sheet open={!!dateKey} onOpenChange={onClose}>
      <SheetContent className="flex flex-col gap-0 w-80 sm:w-96">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <UtensilsIcon size={16} />
            {displayDate}
          </SheetTitle>
          <SheetDescription>Meal plan for this day</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto flex flex-col gap-5 px-5 py-4">
          {SLOTS.map((slot) => (
            <SlotSection
              key={slot}
              slot={slot}
              meals={grouped[slot]}
              dateKey={dateKey}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
