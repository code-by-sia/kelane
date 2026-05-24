import { Trash2Icon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import useCalendarStore from "@/store/calendar";
import useRecipeStore from "@/store/recipe";
import { SLOTS, SLOT_COLORS } from "./constants";
import { AddMealRow } from "./add-meal-row";
import { RepeatMealPopover } from "./repeat-meal-popover";

export function DayView({ anchorDate }) {
  const dateKey = format(anchorDate, "yyyy-MM-dd");
  const getMealsForDate = useCalendarStore((s) => s.getMealsForDate);
  const addMeal = useCalendarStore((s) => s.addMeal);
  const removeMeal = useCalendarStore((s) => s.removeMeal);
  const getRecipe = useRecipeStore((s) => s.getRecipe);

  const dayMeals = getMealsForDate(dateKey);
  const grouped = SLOTS.reduce((acc, slot) => {
    acc[slot] = dayMeals.filter((m) => m.slot === slot);
    return acc;
  }, {});

  const totalCalories = dayMeals.reduce((sum, m) => {
    const r = getRecipe(m.recipeCode);
    return sum + (r?.calories ?? 0);
  }, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto w-full px-6 py-4 flex flex-col gap-5">
        {totalCalories > 0 && (
          <p className="text-sm text-muted-foreground text-right">
            Total: <strong>{totalCalories} kcal</strong>
          </p>
        )}

        {SLOTS.map((slot) => (
          <section key={slot}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${SLOT_COLORS[slot]}`} />
              <h3 className="text-sm font-semibold capitalize">{slot}</h3>
            </div>

            {grouped[slot].length === 0 ? (
              <p className="text-sm text-muted-foreground pl-5">No meal planned</p>
            ) : (
              <div className="flex flex-col gap-1">
                {grouped[slot].map((m) => {
                  const recipe = getRecipe(m.recipeCode);
                  return (
                    <div
                      key={`${m.recipeCode}-${m.slot}`}
                      className="flex items-center gap-3 pl-5"
                    >
                      {recipe?.image && (
                        <img
                          src={recipe.image}
                          alt=""
                          className="w-10 h-10 rounded-md object-cover shrink-0"
                        />
                      )}
                      <span className="flex-1 text-sm font-medium">
                        {recipe?.name ?? `Recipe #${m.recipeCode}`}
                      </span>
                      {recipe?.calories > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {recipe.calories} kcal
                        </span>
                      )}
                      <RepeatMealPopover meal={m} dateKey={dateKey} />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeMeal(dateKey, m.recipeCode, m.slot)}
                      >
                        <Trash2Icon size={13} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}

        <div className="border-t pt-4">
          <AddMealRow dateKey={dateKey} onAdd={addMeal} />
        </div>
      </div>
    </div>
  );
}
