import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeSearchDialog } from "./recipe-search-dialog";

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
