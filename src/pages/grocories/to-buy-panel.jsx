import { useState } from "react";
import { PlusIcon, Trash2Icon, RefrigeratorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import useGroceriesStore from "@/store/groceries";

const UNITS = ["pcs", "g", "kg", "ml", "L", "tbsp", "tsp", "cup"];

const EMPTY = { name: "", quantity: "", unit: "pcs" };

export default function ToBuyPanel() {
  const toBuyItems = useGroceriesStore((s) => s.toBuyItems);
  const addToBuyItem = useGroceriesStore((s) => s.addToBuyItem);
  const removeToBuyItem = useGroceriesStore((s) => s.removeToBuyItem);
  const toggleToBuyItem = useGroceriesStore((s) => s.toggleToBuyItem);
  const clearCheckedToBuyItems = useGroceriesStore((s) => s.clearCheckedToBuyItems);
  const moveToFridge = useGroceriesStore((s) => s.moveToFridge);

  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addToBuyItem({
      name: form.name.trim(),
      quantity: form.quantity ? Number(form.quantity) : null,
      unit: form.unit,
    });
    setForm(EMPTY);
    setOpen(false);
  };

  const checkedCount = toBuyItems.filter((i) => i.checked).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto divide-y">
        {toBuyItems.length === 0 && (
          <p className="text-sm text-muted-foreground p-4">Nothing to buy.</p>
        )}
        {toBuyItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-2 group"
          >
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => toggleToBuyItem(item.id)}
            />
            <span className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : "font-medium"}`}>
              {item.name}
            </span>
            {item.quantity && (
              <span className="text-xs text-muted-foreground">
                {item.quantity} {item.unit}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              title="Move to fridge"
              onClick={() => moveToFridge(item.id)}
            >
              <RefrigeratorIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeToBuyItem(item.id)}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>

      <div className="border-t p-4 flex flex-col gap-2">
        {checkedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground self-end"
            onClick={clearCheckedToBuyItems}
          >
            Clear {checkedCount} checked
          </Button>
        )}
        {open ? (
          <form onSubmit={submit} className="flex flex-col gap-2">
            <Input placeholder="Item name" autoFocus {...field("name")} />
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Qty"
                className="w-20"
                {...field("quantity")}
              />
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="border rounded-md px-2 text-sm bg-background"
              >
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">Add</Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen(true)}>
            <PlusIcon /> Add item
          </Button>
        )}
      </div>
    </div>
  );
}
