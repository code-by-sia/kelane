import { format, formatDistanceToNow, differenceInMinutes } from "date-fns";
import { Trash2Icon, UtensilsIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useHistoryStore from "@/store/history";
import useRecipeStore from "@/store/recipe";

export function HistoryEntry({ entry }) {
  const getRecipe = useRecipeStore((s) => s.getRecipe);
  const removeEntry = useHistoryStore((s) => s.removeEntry);
  const recipe = getRecipe(entry.recipeCode);

  const duration =
    entry.completedAt
      ? differenceInMinutes(new Date(entry.completedAt), new Date(entry.startedAt))
      : null;

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b hover:bg-accent/30 transition-colors">
      {recipe?.image ? (
        <img
          src={recipe.image}
          alt={entry.recipeName}
          className="w-14 h-14 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <UtensilsIcon size={20} className="text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{entry.recipeName}</p>
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(entry.startedAt), { addSuffix: true })}
          {" · "}
          {format(new Date(entry.startedAt), "MMM d, yyyy")}
        </p>
        {entry.completedAt ? (
          <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
            <ClockIcon size={11} />
            Completed in {duration ?? 0} min
          </p>
        ) : (
          <p className="text-xs text-amber-500 mt-0.5">In progress / not finished</p>
        )}
      </div>

      <Button variant="ghost" size="icon-sm" onClick={() => removeEntry(entry.id)}>
        <Trash2Icon size={14} />
      </Button>
    </div>
  );
}
