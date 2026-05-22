import { useState } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import useGroceriesStore from "@/store/groceries";

const UNITS = ["pcs", "g", "kg", "ml", "L", "tbsp", "tsp", "cup"];

function expiryBadge(expiresAt) {
  if (!expiresAt) return null;
  const days = differenceInDays(parseISO(expiresAt), new Date());
  if (days < 0) return <Badge variant="destructive">Expired</Badge>;
  if (days === 0) return <Badge variant="destructive">Today</Badge>;
  if (days <= 3)
    return (
      <Badge className="bg-orange-400 text-white border-transparent">
        {days}d left
      </Badge>
    );
  return <Badge variant="outline">{days}d left</Badge>;
}

const EMPTY = { name: "", quantity: "", unit: "pcs", expiresAt: "" };

export default function FridgePanel() {
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const addFridgeItem = useGroceriesStore((s) => s.addFridgeItem);
  const removeFridgeItem = useGroceriesStore((s) => s.removeFridgeItem);
  const removeFridgeItems = useGroceriesStore((s) => s.removeFridgeItems);

  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addFridgeItem({
      name: form.name.trim(),
      quantity: form.quantity ? Number(form.quantity) : null,
      unit: form.unit,
      expiresAt: form.expiresAt || null,
    });
    setForm(EMPTY);
    setOpen(false);
  };

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const batchDelete = () => {
    removeFridgeItems(selected);
    clearSelection();
  };

  const allSelected =
    fridgeItems.length > 0 && selected.size === fridgeItems.length;

  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(fridgeItems.map((i) => i.id)),
    );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto divide-y">
        {fridgeItems.length === 0 && (
          <p className="text-sm text-muted-foreground p-4">
            No items in fridge.
          </p>
        )}
        {fridgeItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-2">
            <Checkbox
              checked={selected.has(item.id)}
              onCheckedChange={() => toggleSelect(item.id)}
            />
            <span className="flex-1 text-sm font-medium">{item.name}</span>
            {item.quantity && (
              <span className="text-xs text-muted-foreground">
                {item.quantity} {item.unit}
              </span>
            )}
            {expiryBadge(item.expiresAt)}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeFridgeItem(item.id)}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="border-t px-4 py-2 flex items-center gap-2 bg-accent">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
          <span className="text-sm flex-1">{selected.size} selected</span>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            Cancel
          </Button>
          <Button size="sm" variant="destructive" onClick={batchDelete}>
            <Trash2Icon /> Delete
          </Button>
        </div>
      )}

      <div className="border-t p-4">
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit: e.target.value }))
                }
                className="border rounded-md px-2 text-sm bg-background"
              >
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
              <Input type="date" className="flex-1" {...field("expiresAt")} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Add
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setOpen(true)}
          >
            <PlusIcon /> Add item
          </Button>
        )}
      </div>
    </div>
  );
}
