import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { SearchIcon } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Button } from "./ui/button";
import useRecipeStore from "@/store/recipe";

function matchesQuery(recipe, q) {
  const lower = q.toLowerCase();
  return (
    recipe.name.toLowerCase().includes(lower) ||
    (recipe.summary ?? "").toLowerCase().includes(lower) ||
    (recipe.ingredients ?? []).some((ing) =>
      ing.toLowerCase().includes(lower),
    )
  );
}

export function RecipeSearchDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const recipes = useRecipeStore((s) => s.recipes);
  const [query, setQuery] = useState("");

  const results = query.trim()
    ? recipes.filter((r) => matchesQuery(r, query.trim()))
    : recipes.slice(0, 8);

  const select = (recipe) => {
    const cat = recipe.categories?.[0];
    const path = cat
      ? `/categories/${cat}/${recipe.code}`
      : `/uncategorized/${recipe.code}`;
    navigate(path);
    onOpenChange(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search recipes by name, ingredient…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No recipes found.</CommandEmpty>
        <CommandGroup heading={query ? "Results" : "All recipes"}>
          {results.map((r) => (
            <CommandItem key={r.code} onSelect={() => select(r)}>
              <span className="flex-1">{r.name}</span>
              {r.categories?.length > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  {r.categories[0]}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground font-normal"
        onClick={() => setOpen(true)}
      >
        <SearchIcon size={14} />
        Search recipes…
        <kbd className="ml-auto text-xs opacity-50 hidden sm:block">⌘K</kbd>
      </Button>
      <RecipeSearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
