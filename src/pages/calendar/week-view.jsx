import * as React from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { PlusIcon } from "lucide-react";
import useCalendarStore from "@/store/calendar";
import useRecipeStore from "@/store/recipe";
import { SLOTS, SLOT_COLORS, SLOT_CHIP } from "./constants";
import { DroppableCell } from "./droppable-cell";

export function WeekView({ anchorDate, onDayClick }) {
  const meals = useCalendarStore((s) => s.meals);
  const getRecipe = useRecipeStore((s) => s.getRecipe);

  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const dayCalories = React.useMemo(
    () =>
      days.reduce((acc, day) => {
        const dk = format(day, "yyyy-MM-dd");
        const total = (meals[dk] ?? []).reduce((sum, m) => {
          const r = getRecipe(m.recipeCode);
          return sum + (r?.calories ?? 0);
        }, 0);
        acc[dk] = total;
        return acc;
      }, {}),
    [meals, days, getRecipe],
  );

  return (
    <div className="cal-week-scroll">
      <table className="cal-table">
        <colgroup>
          <col className="w-24" />
          {days.map((d) => (
            <col key={format(d, "yyyy-MM-dd")} />
          ))}
        </colgroup>

        <thead>
          <tr>
            <th className="cal-th-slot">
              <span className="text-xs text-muted-foreground font-normal">
                Slot
              </span>
            </th>
            {days.map((day) => {
              const dk = format(day, "yyyy-MM-dd");
              const isToday = isSameDay(day, today);
              const cals = dayCalories[dk];
              return (
                <th
                  key={dk}
                  className={`cal-th-day ${isToday ? "cal-th-day--today" : "cal-th-day--normal"}`}
                  onClick={() => onDayClick(dk)}
                >
                  <p className="text-xs text-muted-foreground font-normal">
                    {format(day, "EEE")}
                  </p>
                  <p className={`text-base font-semibold leading-tight ${isToday ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </p>
                  {cals > 0 && (
                    <p className="text-xs text-muted-foreground font-normal">
                      {cals} kcal
                    </p>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {SLOTS.map((slot) => (
            <tr key={slot} className="h-[80px]">
              <td className="cal-td-label">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${SLOT_COLORS[slot]}`} />
                  <span className="text-xs font-medium capitalize text-muted-foreground">
                    {slot}
                  </span>
                </div>
              </td>

              {days.map((day) => {
                const dk = format(day, "yyyy-MM-dd");
                const isToday = isSameDay(day, today);
                const cellMeals = (meals[dk] ?? []).filter((m) => m.slot === slot);
                const dropId = `${dk}|${slot}`;

                return (
                  <DroppableCell
                    key={dk}
                    id={dropId}
                    isToday={isToday}
                    onClick={() => onDayClick(dk)}
                  >
                    <div className="flex flex-col gap-0.5">
                      {cellMeals.map((m) => {
                        const recipe = getRecipe(m.recipeCode);
                        return (
                          <div
                            key={`${m.recipeCode}-${slot}`}
                            className={`rounded px-1.5 py-0.5 text-xs leading-tight ${SLOT_CHIP[slot]}`}
                          >
                            <span className="line-clamp-2">
                              {recipe?.name ?? `#${m.recipeCode}`}
                            </span>
                          </div>
                        );
                      })}
                      {cellMeals.length === 0 && (
                        <div className="flex items-center justify-center h-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlusIcon size={14} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </DroppableCell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
