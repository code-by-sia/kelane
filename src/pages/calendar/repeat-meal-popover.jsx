import * as React from "react";
import { Repeat2Icon } from "lucide-react";
import { addDays, addWeeks, format, startOfWeek } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useCalendarStore from "@/store/calendar";
import { DOW_LABELS } from "./constants";

export function RepeatMealPopover({ meal, dateKey }) {
  const addMealToMultipleDays = useCalendarStore((s) => s.addMealToMultipleDays);
  const [open, setOpen] = React.useState(false);
  // Mon=0 … Sun=6 in our Mon-anchored week
  const [selectedDows, setSelectedDows] = React.useState(new Set([0, 1, 2, 3, 4]));
  const [weeks, setWeeks] = React.useState(1);

  const weekStart = startOfWeek(new Date(dateKey + "T12:00:00"), {
    weekStartsOn: 1,
  });

  const computeDates = React.useCallback(() => {
    const dates = [];
    for (let w = 0; w < weeks; w++) {
      for (const dow of selectedDows) {
        dates.push(format(addDays(addWeeks(weekStart, w), dow), "yyyy-MM-dd"));
      }
    }
    return dates;
  }, [weekStart, weeks, selectedDows]);

  const handleApply = () => {
    const dates = computeDates();
    if (dates.length === 0) return;
    addMealToMultipleDays(dates, meal.recipeCode, meal.slot);
    toast.success(
      `Repeated to ${dates.length} day${dates.length !== 1 ? "s" : ""}`,
    );
    setOpen(false);
  };

  const toggleDow = (i) =>
    setSelectedDows((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const dateCount = computeDates().length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="Repeat this meal">
          <Repeat2Icon size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="left" className="w-60 p-3 flex flex-col gap-3">
        <p className="text-sm font-semibold">Repeat meal</p>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Days of week</p>
          <div className="flex flex-wrap gap-1">
            {DOW_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => toggleDow(i)}
                className={`cal-dow-btn ${selectedDows.has(i) ? "cal-dow-btn--active" : "cal-dow-btn--idle"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex-1">Weeks</span>
          <div className="flex items-center gap-1">
            <button
              className="scale-counter-btn"
              onClick={() => setWeeks((w) => Math.max(1, w - 1))}
            >
              −
            </button>
            <span className="w-5 text-center text-sm tabular-nums">{weeks}</span>
            <button
              className="scale-counter-btn"
              onClick={() => setWeeks((w) => Math.min(8, w + 1))}
            >
              +
            </button>
          </div>
        </div>

        {dateCount > 0 && (
          <p className="text-xs text-muted-foreground">
            Will add to{" "}
            <strong className="text-foreground">
              {dateCount} day{dateCount !== 1 ? "s" : ""}
            </strong>
          </p>
        )}

        <Button
          size="sm"
          className="w-full"
          onClick={handleApply}
          disabled={selectedDows.size === 0}
        >
          Apply
        </Button>
      </PopoverContent>
    </Popover>
  );
}
