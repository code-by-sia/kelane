import { format } from "date-fns";
import { CalendarDayButton } from "@/components/ui/calendar";
import useCalendarStore from "@/store/calendar";
import { SLOT_COLORS } from "./constants";

export function MealDayButton({ day, modifiers, ...props }) {
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
