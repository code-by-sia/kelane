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
  FlameIcon,
  PanelRightIcon,
  PlusIcon,
  Repeat2Icon,
  ShoppingCartIcon,
  Trash2Icon,
  UtensilsIcon,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import SidebarPage from "@/pages/sidebar-page";
import useCalendarStore from "@/store/calendar";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";
import "./calendar.css";

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
const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  const searchRef = React.useRef(null);

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

  const openDropdown = () => {
    setOpen(true);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  return (
    <div className="flex flex-col gap-2 pt-3 border-t">
      <div className="flex gap-2">
        <select
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className="border rounded-md px-2 text-sm bg-card h-9 shrink-0"
        >
          {SLOTS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <div className="flex-1 relative min-w-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-sm font-normal truncate"
            onClick={openDropdown}
          >
            {selected ? selected.name : "Search recipe…"}
          </Button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-40"
                onMouseDown={() => setOpen(false)}
              />
              <div className="absolute bottom-full left-0 right-0 z-50 mb-1 rounded-md border bg-popover shadow-lg overflow-hidden">
                <div className="border-b px-3 py-2">
                  <input
                    ref={searchRef}
                    className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    placeholder="Search recipes…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                  />
                </div>
                <ul className="max-h-52 overflow-y-auto py-1">
                  {filtered.length === 0 ? (
                    <li className="px-3 py-4 text-sm text-center text-muted-foreground">
                      No recipes found.
                    </li>
                  ) : (
                    filtered.map((r) => (
                      <li
                        key={r.code}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelected(r);
                          setSearch("");
                          setOpen(false);
                        }}
                      >
                        {r.name}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}
        </div>

        <Button size="sm" disabled={!selected} onClick={handleAdd}>
          <PlusIcon size={14} />
        </Button>
      </div>
    </div>
  );
}

// ── Repeat meal popover ────────────────────────────────────────────────────
function RepeatMealPopover({ meal, dateKey }) {
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

// ── DaySheet ───────────────────────────────────────────────────────────────
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
                      {/* Repeat button */}
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

// ── Month view ─────────────────────────────────────────────────────────────
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

// ── Week view droppable cell ───────────────────────────────────────────────
function DroppableCell({ id, isToday, onClick, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <td
      ref={setNodeRef}
      className={[
        "cal-td-cell group",
        isToday ? "cal-td-cell--today" : "cal-td-cell--normal",
        isOver ? "cal-td-cell--over" : "hover:bg-muted/50",
      ].join(" ")}
      onClick={onClick}
    >
      {children}
    </td>
  );
}

// ── Week view ──────────────────────────────────────────────────────────────
function WeekView({ anchorDate, onDayClick }) {
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

// ── Recipe picker panel (draggable recipes) ────────────────────────────────
function DraggableRecipeCard({ recipe }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `recipe|${recipe.code}`,
    data: { recipeCode: recipe.code },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`cal-picker__recipe ${isDragging ? "cal-picker__recipe--dragging" : ""}`}
    >
      {recipe.image ? (
        <img src={recipe.image} alt="" className="cal-picker__thumb" />
      ) : (
        <div className="cal-picker__thumb-placeholder">
          <FlameIcon size={14} className="text-muted-foreground/40" strokeWidth={1} />
        </div>
      )}
      <span className="text-xs font-medium leading-tight line-clamp-2 flex-1 min-w-0">
        {recipe.name}
      </span>
    </div>
  );
}

function RecipePickerPanel({ onClose }) {
  const recipes = useRecipeStore((s) => s.recipes);
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(
    () =>
      recipes.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [recipes, search],
  );

  return (
    <div className="cal-picker">
      <div className="cal-picker__header">
        <span className="cal-picker__title">Recipes</span>
        <Button variant="ghost" size="icon-sm" onClick={onClose} title="Close picker">
          <PanelRightIcon size={14} />
        </Button>
      </div>

      <div className="cal-picker__search">
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs"
        />
      </div>

      <p className="px-3 py-1.5 text-[10px] text-muted-foreground border-b">
        Drag a recipe onto a slot to add it
      </p>

      <div className="cal-picker__list">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No recipes found.
          </p>
        ) : (
          filtered.map((r) => <DraggableRecipeCard key={r.code} recipe={r} />)
        )}
      </div>
    </div>
  );
}

// ── Day view ───────────────────────────────────────────────────────────────
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
  const [showPicker, setShowPicker] = React.useState(false);
  const [activeDragRecipe, setActiveDragRecipe] = React.useState(null);

  const meals = useCalendarStore((s) => s.meals);
  const addMeal = useCalendarStore((s) => s.addMeal);
  const getRecipe = useRecipeStore((s) => s.getRecipe);
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const toBuyItems = useGroceriesStore((s) => s.toBuyItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);

  const changeView = (v) => {
    setView(v);
    localStorage.setItem("calendar.view", v);
    if (v !== "week") setShowPicker(false);
  };

  // ── DnD sensors ────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragStart = ({ active }) => {
    const code = active.data.current?.recipeCode;
    if (code) setActiveDragRecipe(getRecipe(code));
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveDragRecipe(null);
    if (!over) return;
    const [dateKey, slot] = over.id.split("|");
    const recipeCode = active.data.current?.recipeCode;
    if (!dateKey || !slot || !recipeCode) return;
    addMeal(dateKey, recipeCode, slot);
    toast.success(
      `Added ${activeDragRecipe?.name ?? "recipe"} to ${slot} on ${format(new Date(dateKey + "T00:00:00"), "EEE d MMM")}`,
    );
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
        <>
          <Button size="sm" variant="outline" onClick={generateShoppingList} className="hidden sm:flex">
            <ShoppingCartIcon size={14} />
            Shopping list (7 days)
          </Button>
          <Button size="icon-sm" variant="outline" onClick={generateShoppingList} className="sm:hidden" title="Generate shopping list">
            <ShoppingCartIcon size={15} />
          </Button>
        </>
      }
    >
      {/* ── Sub-toolbar ─────────────────────────────────────────────── */}
      <div className="cal-toolbar">
        <Button variant="ghost" size="icon-sm" onClick={goBack}>
          <ChevronLeftIcon size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={goToday} disabled={isAtToday} className="text-xs hidden sm:inline-flex">
          Today
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={goForward}>
          <ChevronRightIcon size={16} />
        </Button>

        <span className="flex-1 text-xs sm:text-sm font-medium text-center px-1 truncate">
          {periodLabel}
        </span>

        {/* Recipe picker toggle — only visible in week view */}
        {view === "week" && (
          <Button
            variant={showPicker ? "default" : "outline"}
            size="icon-sm"
            onClick={() => setShowPicker((v) => !v)}
            title={showPicker ? "Hide recipe picker" : "Show recipe picker"}
          >
            <PanelRightIcon size={14} />
          </Button>
        )}

        <ButtonGroup>
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="outline"
              size="sm"
              className={`gap-1.5 cursor-pointer ${view === id ? "view-btn--active" : ""}`}
              onClick={() => changeView(id)}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* ── View content ────────────────────────────────────────────── */}
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {view === "day" && <DayView anchorDate={anchorDate} />}
          {view === "week" && <WeekView anchorDate={anchorDate} onDayClick={handleDayClick} />}
          {view === "month" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <MonthView anchorDate={anchorDate} onDayClick={handleDayClick} />
            </div>
          )}

          {/* Recipe picker panel */}
          {showPicker && view === "week" && (
            <RecipePickerPanel onClose={() => setShowPicker(false)} />
          )}
        </div>

        {/* Drag overlay — shows a chip while dragging */}
        <DragOverlay dropAnimation={null}>
          {activeDragRecipe && (
            <div className="cal-drag-chip">
              {activeDragRecipe.image && (
                <img
                  src={activeDragRecipe.image}
                  alt=""
                  className="w-6 h-6 rounded object-cover shrink-0"
                />
              )}
              <span className="max-w-[160px] truncate">{activeDragRecipe.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

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
