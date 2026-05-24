import * as React from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  startOfWeek,
  subWeeks,
  subMonths,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PanelRightIcon,
  ShoppingCartIcon,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import SidebarPage from "@/pages/sidebar-page";
import useCalendarStore from "@/store/calendar";
import useRecipeStore from "@/store/recipe";
import useGroceriesStore from "@/store/groceries";
import { VIEWS } from "./constants";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { RecipePickerPanel } from "./recipe-picker-panel";
import { DaySheet } from "./day-sheet";
import "./calendar.css";

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
