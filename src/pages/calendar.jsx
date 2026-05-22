import * as React from "react";
import { addDays, format } from "date-fns";
import { PlusIcon, ShoppingCartIcon, Trash2Icon, UtensilsIcon } from "lucide-react";
import { toast } from "sonner";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import SidebarPage from "@/pages/sidebar-page";
import useCalendarStore from "@/store/calendar";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";

const SLOTS = ["breakfast", "lunch", "dinner", "snack"];
const SLOT_COLORS = {
  breakfast: "bg-amber-400",
  lunch: "bg-green-500",
  dinner: "bg-blue-500",
  snack: "bg-purple-400",
};

function MealDayButton({ day, modifiers, ...props }) {
  const meals = useCalendarStore((s) => s.meals);
  const dateKey = format(day.date, "yyyy-MM-dd");
  const dayMeals = meals[dateKey] ?? [];

  const dots = [...new Set(dayMeals.map((m) => m.slot))];

  return (
    <CalendarDayButton day={day} modifiers={modifiers} {...props}>
      {day.date.getDate()}
      {dots.length > 0 && (
        <span className="flex gap-0.5 justify-center mt-0.5">
          {dots.slice(0, 3).map((slot) => (
            <span
              key={slot}
              className={`w-1 h-1 rounded-full ${SLOT_COLORS[slot] ?? "bg-gray-400"}`}
            />
          ))}
        </span>
      )}
    </CalendarDayButton>
  );
}

function AddMealRow({ dateKey, onAdd }) {
  const recipes = useRecipeStore((s) => s.recipes);
  const [slot, setSlot] = React.useState("dinner");
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(null);

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    if (!selected) return;
    onAdd(dateKey, selected.code, slot);
    setSelected(null);
    setSearch("");
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 pt-2 border-t mt-2">
      <div className="flex gap-2">
        <select
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className="border rounded-md px-2 text-sm bg-background h-9"
        >
          {SLOTS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <div className="flex-1 relative">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-sm font-normal"
            onClick={() => setOpen((o) => !o)}
          >
            {selected ? selected.name : "Search recipe…"}
          </Button>
          {open && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md">
              <Command>
                <CommandInput
                  placeholder="Search…"
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No recipes found.</CommandEmpty>
                  <CommandGroup>
                    {filtered.map((r) => (
                      <CommandItem
                        key={r.code}
                        onSelect={() => {
                          setSelected(r);
                          setOpen(false);
                        }}
                      >
                        {r.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
        <Button size="sm" disabled={!selected} onClick={handleAdd}>
          <PlusIcon size={14} />
        </Button>
      </div>
    </div>
  );
}

function DaySheet({ dateKey, onClose }) {
  const getMealsForDate = useCalendarStore((s) => s.getMealsForDate);
  const addMeal = useCalendarStore((s) => s.addMeal);
  const removeMeal = useCalendarStore((s) => s.removeMeal);
  const getRecipe = useRecipeStore((s) => s.getRecipe);

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
      <SheetContent className="flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UtensilsIcon size={16} />
            {displayDate}
          </SheetTitle>
          <SheetDescription>Meal plan for this day</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
          {SLOTS.map((slot) => (
            <section key={slot}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-2 h-2 rounded-full ${SLOT_COLORS[slot]}`}
                />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {slot}
                </h3>
              </div>
              {grouped[slot].length === 0 ? (
                <p className="text-xs text-muted-foreground pl-4">—</p>
              ) : (
                grouped[slot].map((m) => {
                  const recipe = getRecipe(m.recipeCode);
                  return (
                    <div
                      key={`${m.recipeCode}-${m.slot}`}
                      className="flex items-center gap-2 pl-4 py-1"
                    >
                      <span className="flex-1 text-sm">
                        {recipe?.name ?? `Recipe #${m.recipeCode}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeMeal(dateKey, m.recipeCode, m.slot)}
                      >
                        <Trash2Icon size={14} />
                      </Button>
                    </div>
                  );
                })
              )}
            </section>
          ))}
        </div>

        <AddMealRow dateKey={dateKey} onAdd={addMeal} />
      </SheetContent>
    </Sheet>
  );
}

function isInStock(ingredient, fridgeItems) {
  return fridgeItems.some((item) =>
    ingredient.toLowerCase().includes(item.name.toLowerCase()),
  );
}

function parseIngredient(str) {
  const match = str.match(/^(\d+\.?\d*)\s*(g|kg|ml|l|tbsp|tsp|cup)?\s*(.+)$/i);
  if (!match) return { name: str.trim(), quantity: null, unit: "pcs" };
  const [, qty, unit, name] = match;
  return { name: name.trim(), quantity: Number(qty), unit: unit?.toLowerCase() || "pcs" };
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = React.useState(null);
  const meals = useCalendarStore((s) => s.meals);
  const getRecipe = useRecipeStore((s) => s.getRecipe);
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const toBuyItems = useGroceriesStore((s) => s.toBuyItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);

  const generateShoppingList = () => {
    const today = new Date();
    const nextSevenDays = Array.from({ length: 7 }, (_, i) =>
      format(addDays(today, i), "yyyy-MM-dd"),
    );

    const allRecipeCodes = new Set(
      nextSevenDays.flatMap((d) => (meals[d] ?? []).map((m) => m.recipeCode)),
    );

    let added = 0;
    for (const code of allRecipeCodes) {
      const recipe = getRecipe(code);
      if (!recipe?.ingredients) continue;
      for (const ing of recipe.ingredients) {
        if (isInStock(ing, fridgeItems)) continue;
        const parsed = parseIngredient(ing);
        const alreadyInList = toBuyItems.some(
          (t) => t.name.toLowerCase() === parsed.name.toLowerCase(),
        );
        if (alreadyInList) continue;
        addToBuyItem(parsed);
        added++;
      }
    }

    if (added === 0) {
      toast.info("Nothing to add — all ingredients are in stock or already in your list.");
    } else {
      toast.success(`Added ${added} item${added !== 1 ? "s" : ""} to your buy list.`);
    }
  };

  const handleDayClick = (date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
  };

  return (
    <SidebarPage
      title="Meal Calendar"
      header={
        <Button size="sm" variant="outline" onClick={generateShoppingList}>
          <ShoppingCartIcon size={14} />
          Generate shopping list (7 days)
        </Button>
      }
    >
      <Calendar
        mode="single"
        numberOfMonths={6}
        className="flex-1 m-3 [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
        classNames={{
          months: "grid grid-cols-3 gap-2",
        }}
        components={{ DayButton: MealDayButton }}
        onDayClick={handleDayClick}
      />
      <DaySheet
        dateKey={selectedDate}
        onClose={() => setSelectedDate(null)}
      />
    </SidebarPage>
  );
}
