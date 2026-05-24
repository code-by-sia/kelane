import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useRecipeStore from "@/store/recipe";
import { CategoryRow } from "./category-row";

export function CategoryManagerDialog({ open, onOpenChange }) {
  const getCategoriesWithCounts = useRecipeStore((s) => s.getCategoriesWithCounts);
  const addCategory = useRecipeStore((s) => s.addCategory);

  const categories = getCategoriesWithCounts();
  const [newName, setNewName] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setNewName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage categories</DialogTitle>
          <DialogDescription>
            Rename or delete categories. Deleting moves recipes to Uncategorized.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto divide-y">
          {categories.map(({ name, recipes }) => (
            <CategoryRow key={name} name={name} recipeCount={recipes} />
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No categories yet.</p>
          )}
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 pt-2 border-t">
          <Input
            placeholder="New category name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={!newName.trim()}>
            <PlusIcon size={14} /> Add
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
