import { Trash2Icon, UtensilsIcon } from "lucide-react";
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
import { AddMealRow } from "./add-meal-row";
import { RepeatMealPopover } from "./repeat-meal-popover";

export function DaySheet({ dateKey, onClose }) {
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
      <SheetContent className="flex flex-col gap-0">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <UtensilsIcon size={16} />
            {displayDate}
          </SheetTitle>
          <SheetDescription>Meal plan for this day</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto flex flex-col gap-5 px-5 py-4">
          {SLOTS.map((slot) => (
            <section key={slot}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${SLOT_COLORS[slot]}`} />
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
                      {recipe?.image && (
                        <img
                          src={recipe.image}
                          alt=""
                          className="w-8 h-8 rounded object-cover shrink-0"
                        />
                      )}
                      <span className="flex-1 text-sm">
                        {recipe?.name ?? `Recipe #${m.recipeCode}`}
                      </span>
                      {recipe?.calories > 0 && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {recipe.calories} kcal
                        </span>
                      )}
                      <RepeatMealPopover meal={m} dateKey={dateKey} />
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

        <div className="px-5 pb-5 border-t pt-3">
          <AddMealRow dateKey={dateKey} onAdd={addMeal} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
