import { CalendarDaysIcon, CalendarIcon, ClockIcon } from "lucide-react";

export const SLOTS = ["breakfast", "lunch", "dinner", "snack"];

export const SLOT_COLORS = {
  breakfast: "bg-amber-400",
  lunch: "bg-green-500",
  dinner: "bg-blue-500",
  snack: "bg-purple-400",
};

export const SLOT_CHIP = {
  breakfast: "bg-amber-100 text-amber-800",
  lunch: "bg-green-100 text-green-800",
  dinner: "bg-blue-100 text-blue-800",
  snack: "bg-purple-100 text-purple-800",
};

export const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const VIEWS = [
  { id: "day", label: "Day", icon: ClockIcon },
  { id: "week", label: "Week", icon: CalendarDaysIcon },
  { id: "month", label: "Month", icon: CalendarIcon },
];
