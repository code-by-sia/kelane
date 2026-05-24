import { FlameIcon } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

export function DraggableRecipeCard({ recipe }) {
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
