import * as React from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useRecipeStore from "@/store/recipe";
import { SLOTS } from "./constants";

export function AddMealRow({ dateKey, onAdd }) {
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
