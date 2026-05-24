import { useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRecipeStore from "@/store/recipe";

export function CategoryRow({ name, recipeCount }) {
  const updateCategory = useRecipeStore((s) => s.updateCategory);
  const removeCategory = useRecipeStore((s) => s.removeCategory);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) updateCategory(name, trimmed);
    setEditing(false);
    setDraft(trimmed || name);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") { setEditing(false); setDraft(name); }
  };

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-2 py-2 px-1 rounded-lg bg-destructive/5 border border-destructive/20">
        <span className="flex-1 text-sm">
          Delete <strong>{name}</strong>
          {recipeCount > 0 && (
            <span className="text-muted-foreground">
              {" "}({recipeCount} recipe{recipeCount !== 1 ? "s" : ""} will be uncategorized)
            </span>
          )}?
        </span>
        <Button size="xs" variant="destructive" onClick={() => { removeCategory(name); setConfirmDelete(false); }}>
          Delete
        </Button>
        <Button size="xs" variant="ghost" onClick={() => setConfirmDelete(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1.5">
      {editing ? (
        <>
          <Input
            className="flex-1 h-8 text-sm"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
          />
          <Button size="xs" onClick={save}>Save</Button>
          <Button size="xs" variant="ghost" onClick={() => { setEditing(false); setDraft(name); }}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground mr-1">
            {recipeCount} recipe{recipeCount !== 1 ? "s" : ""}
          </span>
          <Button size="icon-sm" variant="ghost" onClick={() => setEditing(true)}>
            <PencilIcon size={13} />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
            <Trash2Icon size={13} />
          </Button>
        </>
      )}
    </div>
  );
}
