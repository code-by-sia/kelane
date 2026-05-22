import { useMemo, useState } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { CalendarOffIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import useGroceriesStore from "@/store/groceries";

const UNITS = ["pcs", "g", "kg", "ml", "L", "tbsp", "tsp", "cup"];

function expiryDisplay(expiresAt) {
  if (!expiresAt)
    return (
      <CalendarOffIcon
        size={14}
        className="text-muted-foreground/50"
        title="No expiry date set"
      />
    );
  const days = differenceInDays(parseISO(expiresAt), new Date());
  if (days < 0) return <Badge variant="destructive">Expired</Badge>;
  if (days === 0) return <Badge variant="destructive">Today</Badge>;
  if (days === 1)
    return (
      <Badge className="bg-orange-400 text-white border-transparent">
        Tomorrow
      </Badge>
    );
  if (days < 7)
    return (
      <Badge className="bg-orange-400 text-white border-transparent">
        {days}d
      </Badge>
    );
  if (days < 30)
    return (
      <Badge variant="outline">{Math.round(days / 7)}w</Badge>
    );
  return <Badge variant="outline">{Math.round(days / 30)}mo</Badge>;
}

// Group items by name (case-insensitive), summing quantities, using earliest expiry
function groupFridgeItems(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.name.toLowerCase();
    if (map.has(key)) {
      const g = map.get(key);
      g.ids.push(item.id);
      if (item.quantity != null) g.quantity = (g.quantity ?? 0) + item.quantity;
      // earliest non-null expiry
      if (item.expiresAt) {
        if (!g.expiresAt || item.expiresAt < g.expiresAt) g.expiresAt = item.expiresAt;
      }
    } else {
      map.set(key, {
        ids: [item.id],
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiresAt: item.expiresAt,
      });
    }
  }
  return [...map.values()];
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

  const grouped = useMemo(() => groupFridgeItems(fridgeItems), [fridgeItems]);

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

  // Selection operates on group keys (first id in group)
  const toggleSelect = (groupKey) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(groupKey) ? next.delete(groupKey) : next.add(groupKey);
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const batchDelete = () => {
    const idsToDelete = new Set(
      grouped
        .filter((g) => selected.has(g.ids[0]))
        .flatMap((g) => g.ids),
    );
    removeFridgeItems(idsToDelete);
    clearSelection();
  };

  const allSelected =
    grouped.length > 0 && selected.size === grouped.length;

  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(grouped.map((g) => g.ids[0])),
    );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto divide-y">
        {grouped.length === 0 && (
          <p className="text-sm text-muted-foreground p-4">
            No items in fridge.
          </p>
        )}
        {grouped.map((group) => (
          <div key={group.ids[0]} className="flex items-center gap-3 px-4 py-2">
            <Checkbox
              checked={selected.has(group.ids[0])}
              onCheckedChange={() => toggleSelect(group.ids[0])}
            />
            <span className="flex-1 text-sm font-medium">{group.name}</span>
            {group.quantity != null && (
              <span className="text-xs text-muted-foreground">
                {group.quantity} {group.unit}
              </span>
            )}
            {expiryDisplay(group.expiresAt)}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeFridgeItems(new Set(group.ids))}
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
