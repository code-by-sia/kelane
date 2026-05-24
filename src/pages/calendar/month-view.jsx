import * as React from "react";
import { isSameMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { MealDayButton } from "./meal-day-button";

export function MonthView({ anchorDate, onDayClick }) {
  const [month, setMonth] = React.useState(anchorDate);

  React.useEffect(() => {
    if (!isSameMonth(anchorDate, month)) setMonth(anchorDate);
  }, [anchorDate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Calendar
      mode="single"
      month={month}
      onMonthChange={setMonth}
      className="flex-1 m-4 [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
      components={{ DayButton: MealDayButton }}
      onDayClick={onDayClick}
    />
  );
}
