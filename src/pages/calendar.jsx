import * as React from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  isSameMonth,
  startOfWeek,
  subWeeks,
  subMonths,
} from "date-fns";
import {
  CalendarDaysIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
  UtensilsIcon,
} from "lucide-react";
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
import { ButtonGroup } from "@/components/ui/button-group";
import SidebarPage from "@/pages/sidebar-page";
import useCalendarStore from "@/store/calendar";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";

// ── Constants ──────────────────────────────────────────────────────────────
const SLOTS = ["breakfast", "lunch", "dinner", "snack"];
const SLOT_COLORS = {
  breakfast: "bg-amber-400",
  lunch: "bg-green-500",
  dinner: "bg-blue-500",
  snack: "bg-purple-400",
};
const SLOT_CHIP = {
  breakfast: "bg-amber-100 text-amber-800",
  lunch: "bg-green-100 text-green-800",
  dinner: "bg-blue-100 text-blue-800",
  snack: "bg-purple-100 text-purple-800",
};

const VIEWS = [
  { id: "day", label: "Day", icon: ClockIcon },
  { id: "week", label: "Week", icon: CalendarDaysIcon },
  { id: "month", label: "Month", icon: CalendarIcon },
];

// ── Shared: add-meal form ──────────────────────────────────────────────────
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

// ── Shared: DaySheet (slide-over) ──────────────────────────────────────────
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
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          removeMeal(dateKey, m.recipeCode, m.slot)
                        }
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

// ── Month view: existing calendar grid (1 month, navigable) ───────────────
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

function MonthView({ anchorDate, onDayClick }) {
  const [month, setMonth] = React.useState(anchorDate);

  // Keep month in sync if anchorDate jumps (e.g. Today button)
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

// ── Week view: Mon–Sun columns × slot rows ─────────────────────────────────
function WeekView({ anchorDate, onDayClick }) {
  const meals = useCalendarStore((s) => s.meals);
  const getRecipe = useRecipeStore((s) => s.getRecipe);

  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  // Per-day calorie totals
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
    <div className="flex-1 overflow-auto">
      <table className="w-full h-full border-collapse table-fixed min-w-[600px]">
        <colgroup>
          <col className="w-24" />
          {days.map((d) => (
            <col key={format(d, "yyyy-MM-dd")} />
          ))}
        </colgroup>

        {/* Header: day names + dates */}
        <thead>
          <tr>
            {/* Slot label column header */}
            <th className="border-b border-r p-2 text-left">
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
                  className={`border-b border-r p-2 text-center cursor-pointer hover:bg-accent/40 transition-colors ${
                    isToday ? "bg-primary/5" : ""
                  }`}
                  onClick={() => onDayClick(dk)}
                >
                  <p className="text-xs text-muted-foreground font-normal">
                    {format(day, "EEE")}
                  </p>
                  <p
                    className={`text-base font-semibold leading-tight ${
                      isToday ? "text-primary" : ""
                    }`}
                  >
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

        {/* Slot rows */}
        <tbody>
          {SLOTS.map((slot) => (
            <tr key={slot} className="h-[80px]">
              {/* Slot label */}
              <td className="border-b border-r p-2 align-middle">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${SLOT_COLORS[slot]}`}
                  />
                  <span className="text-xs font-medium capitalize text-muted-foreground">
                    {slot}
                  </span>
                </div>
              </td>

              {/* Day × slot cells */}
              {days.map((day) => {
                const dk = format(day, "yyyy-MM-dd");
                const isToday = isSameDay(day, today);
                const cellMeals = (meals[dk] ?? []).filter(
                  (m) => m.slot === slot,
                );

                return (
                  <td
                    key={dk}
                    className={`border-b border-r p-1 align-top cursor-pointer hover:bg-accent/30 transition-colors group ${
                      isToday ? "bg-primary/5" : ""
                    }`}
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
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Day view: inline single-day panel ─────────────────────────────────────
function DayView({ anchorDate }) {
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
              <p className="text-sm text-muted-foreground pl-5">
                No meal planned
              </p>
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
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          removeMeal(dateKey, m.recipeCode, m.slot)
                        }
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

// ── Utilities ──────────────────────────────────────────────────────────────
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

// ── Page ───────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const today = React.useMemo(() => new Date(), []);

  const [view, setView] = React.useState(
    () => localStorage.getItem("calendar.view") || "week",
  );
  const [anchorDate, setAnchorDate] = React.useState(today);
  const [sheetDateKey, setSheetDateKey] = React.useState(null);

  const meals = useCalendarStore((s) => s.meals);
  const getRecipe = useRecipeStore((s) => s.getRecipe);
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const toBuyItems = useGroceriesStore((s) => s.toBuyItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);

  const changeView = (v) => {
    setView(v);
    localStorage.setItem("calendar.view", v);
  };

  // ── Navigation ─────────────────────────────────────────────────────────
  const goBack = () => {
    if (view === "day") setAnchorDate((d) => addDays(d, -1));
    else if (view === "week") setAnchorDate((d) => subWeeks(d, 1));
    else setAnchorDate((d) => subMonths(d, 1));
  };

  const goForward = () => {
    if (view === "day") setAnchorDate((d) => addDays(d, 1));
    else if (view === "week") setAnchorDate((d) => addWeeks(d, 1));
    else setAnchorDate((d) => addMonths(d, 1));
  };

  const goToday = () => setAnchorDate(new Date());

  // Keyboard navigation
  React.useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") goBack();
      if (e.key === "ArrowRight") goForward();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Period label ───────────────────────────────────────────────────────
  const periodLabel = React.useMemo(() => {
    if (view === "day") return format(anchorDate, "EEEE, MMMM d, yyyy");
    if (view === "week") {
      const ws = startOfWeek(anchorDate, { weekStartsOn: 1 });
      const we = addDays(ws, 6);
      if (ws.getMonth() === we.getMonth())
        return `${format(ws, "MMM d")} – ${format(we, "d, yyyy")}`;
      return `${format(ws, "MMM d")} – ${format(we, "MMM d, yyyy")}`;
    }
    return format(anchorDate, "MMMM yyyy");
  }, [view, anchorDate]);

  // ── Day click handler ──────────────────────────────────────────────────
  const handleDayClick = (dateOrKey) => {
    const dk =
      typeof dateOrKey === "string"
        ? dateOrKey
        : format(dateOrKey, "yyyy-MM-dd");
    if (view === "day") {
      setAnchorDate(new Date(dk + "T12:00:00"));
    } else {
      setSheetDateKey(dk);
    }
  };

  // ── Shopping list generator ────────────────────────────────────────────
  const generateShoppingList = () => {
    const nextSevenDays = Array.from({ length: 7 }, (_, i) =>
      format(addDays(today, i), "yyyy-MM-dd"),
    );
    const allCodes = new Set(
      nextSevenDays.flatMap((d) => (meals[d] ?? []).map((m) => m.recipeCode)),
    );
    let added = 0;
    for (const code of allCodes) {
      const recipe = getRecipe(code);
      if (!recipe?.ingredients) continue;
      for (const ing of recipe.ingredients) {
        if (isInStock(ing, fridgeItems)) continue;
        const parsed = parseIngredient(ing);
        if (toBuyItems.some((t) => t.name.toLowerCase() === parsed.name.toLowerCase())) continue;
        addToBuyItem(parsed);
        added++;
      }
    }
    if (added === 0)
      toast.info("Nothing to add — all ingredients are in stock or already in your list.");
    else
      toast.success(`Added ${added} item${added !== 1 ? "s" : ""} to your buy list.`);
  };

  const isAtToday =
    view === "day"
      ? isSameDay(anchorDate, today)
      : view === "week"
      ? isSameDay(
          startOfWeek(anchorDate, { weekStartsOn: 1 }),
          startOfWeek(today, { weekStartsOn: 1 }),
        )
      : anchorDate.getMonth() === today.getMonth() &&
        anchorDate.getFullYear() === today.getFullYear();

  return (
    <SidebarPage
      title="Meal Calendar"
      header={
        <Button size="sm" variant="outline" onClick={generateShoppingList}>
          <ShoppingCartIcon size={14} />
          Shopping list (7 days)
        </Button>
      }
    >
      {/* ── Sub-toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-background shrink-0">
        {/* Nav arrows */}
        <Button variant="ghost" size="icon-sm" onClick={goBack}>
          <ChevronLeftIcon size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToday}
          disabled={isAtToday}
          className="text-xs"
        >
          Today
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={goForward}>
          <ChevronRightIcon size={16} />
        </Button>

        {/* Period label */}
        <span className="flex-1 text-sm font-medium text-center px-2">
          {periodLabel}
        </span>

        {/* View toggle */}
        <ButtonGroup>
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="outline"
              size="sm"
              className={`gap-1.5 cursor-pointer ${
                view === id
                  ? "bg-gray-600 text-white hover:bg-gray-700 hover:text-white"
                  : ""
              }`}
              onClick={() => changeView(id)}
            >
              <Icon size={13} />
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* ── View content ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {view === "day" && <DayView anchorDate={anchorDate} />}
        {view === "week" && (
          <WeekView anchorDate={anchorDate} onDayClick={handleDayClick} />
        )}
        {view === "month" && (
          <MonthView anchorDate={anchorDate} onDayClick={handleDayClick} />
        )}
      </div>

      {/* DaySheet — used for week and month views */}
      {view !== "day" && (
        <DaySheet
          dateKey={sheetDateKey}
          onClose={() => setSheetDateKey(null)}
        />
      )}
    </SidebarPage>
  );
}
