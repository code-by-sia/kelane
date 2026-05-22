import { useMemo, useState } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { CalendarOffIcon, ListTodoIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SmartExpiryPicker } from "@/components/smart-expiry-picker";
import useGroceriesStore from "@/store/groceries";

const UNITS = ["pcs", "g", "kg", "ml", "L", "tbsp", "tsp", "cup"];

function expiryDisplay(expiresAt) {
  if (!expiresAt)
    return (
      <CalendarOffIcon
        size={14}
        className="text-muted-foreground/40"
        title="No expiry date — click to set"
      />
    );
  const days = differenceInDays(parseISO(expiresAt), new Date());
  if (days < 0) return <Badge variant="destructive">Expired</Badge>;
  if (days === 0) return <Badge variant="destructive">Today</Badge>;
  if (days === 1)
    return <Badge className="bg-orange-400 text-white border-transparent">Tomorrow</Badge>;
  if (days < 7)
    return <Badge className="bg-orange-400 text-white border-transparent">{days}d</Badge>;
  if (days < 30)
    return <Badge variant="outline">{Math.round(days / 7)}w</Badge>;
  return <Badge variant="outline">{Math.round(days / 30)}mo</Badge>;
}

function groupFridgeItems(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.name.toLowerCase();
    if (map.has(key)) {
      const g = map.get(key);
      g.ids.push(item.id);
      if (item.quantity != null) g.quantity = (g.quantity ?? 0) + item.quantity;
      if (item.expiresAt && (!g.expiresAt || item.expiresAt < g.expiresAt))
        g.expiresAt = item.expiresAt;
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

const EMPTY = { name: "", quantity: "", unit: "pcs", expiresAt: null };

export default function FridgePanel() {
  const fridgeItems = useGroceriesStore((s) => s.fridgeItems);
  const addFridgeItem = useGroceriesStore((s) => s.addFridgeItem);
  const removeFridgeItems = useGroceriesStore((s) => s.removeFridgeItems);
  const updateFridgeItemsExpiry = useGroceriesStore((s) => s.updateFridgeItemsExpiry);
  const moveFridgeToBuy = useGroceriesStore((s) => s.moveFridgeToBuy);

  const [form, setForm] = useState(EMPTY);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  // key = group.ids[0] of the row whose expiry is being edited
  const [editingExpiry, setEditingExpiry] = useState(null);

  const grouped = useMemo(() => groupFridgeItems(fridgeItems), [fridgeItems]);

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
    setAddOpen(false);
  };

  const toggleSelect = (key) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const batchDelete = () => {
    const ids = new Set(
      grouped.filter((g) => selected.has(g.ids[0])).flatMap((g) => g.ids),
    );
    removeFridgeItems(ids);
    clearSelection();
  };

  const batchMoveToList = () => {
    for (const g of grouped.filter((g) => selected.has(g.ids[0]))) {
      moveFridgeToBuy(new Set(g.ids));
    }
    clearSelection();
  };

  const allSelected = grouped.length > 0 && selected.size === grouped.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(grouped.map((g) => g.ids[0])));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto divide-y">
        {grouped.length === 0 && (
          <p className="text-sm text-muted-foreground p-4">No items in fridge.</p>
        )}

        {grouped.map((group) => {
          const groupKey = group.ids[0];
          const isEditingThis = editingExpiry === groupKey;

          return (
            <div key={groupKey} className="flex flex-col">
              {/* Main row */}
              <div className="flex items-center gap-3 px-4 py-2">
                <Checkbox
                  checked={selected.has(groupKey)}
                  onCheckedChange={() => toggleSelect(groupKey)}
                />
                <span className="flex-1 text-sm font-medium">{group.name}</span>
                {group.quantity != null && (
                  <span className="text-xs text-muted-foreground">
                    {group.quantity} {group.unit}
                  </span>
                )}

                {/* Expiry — click to edit */}
                <button
                  type="button"
                  title={isEditingThis ? "Close expiry editor" : "Set or change expiry date"}
                  onClick={() => setEditingExpiry(isEditingThis ? null : groupKey)}
                  className="cursor-pointer hover:opacity-70 transition-opacity"
                >
                  {expiryDisplay(group.expiresAt)}
                </button>

                {/* Move back to buy list */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Move back to buy list"
                  onClick={() => moveFridgeToBuy(new Set(group.ids))}
                >
                  <ListTodoIcon size={14} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Remove from fridge"
                  onClick={() => removeFridgeItems(new Set(group.ids))}
                >
                  <Trash2Icon size={14} />
                </Button>
              </div>

              {/* Inline expiry editor */}
              {isEditingThis && (
                <div className="px-11 pb-3 pt-1 bg-accent/30">
                  <p className="text-xs text-muted-foreground mb-1.5">Set expiry date</p>
                  <SmartExpiryPicker
                    value={group.expiresAt}
                    onChange={(val) => {
                      updateFridgeItemsExpiry(new Set(group.ids), val);
                      setEditingExpiry(null);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Batch action bar */}
      {selected.size > 0 && (
        <div className="border-t px-4 py-2 flex items-center gap-2 bg-accent">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
          <span className="text-sm flex-1">{selected.size} selected</span>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            Cancel
          </Button>
          <Button size="sm" variant="outline" onClick={batchMoveToList}>
            <ListTodoIcon size={14} /> To buy list
          </Button>
          <Button size="sm" variant="destructive" onClick={batchDelete}>
            <Trash2Icon size={14} /> Delete
          </Button>
        </div>
      )}

      {/* Add form */}
      <div className="border-t p-4">
        {addOpen ? (
          <form onSubmit={submit} className="flex flex-col gap-2">
            <Input
              placeholder="Item name"
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Qty"
                className="w-20"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="border rounded-md px-2 text-sm bg-background"
              >
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>

            <div className="border rounded-lg p-2.5 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1.5">Expiry date (optional)</p>
              <SmartExpiryPicker
                value={form.expiresAt}
                onChange={(val) => setForm((f) => ({ ...f, expiresAt: val }))}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">Add</Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setAddOpen(true)}>
            <PlusIcon /> Add item
          </Button>
        )}
      </div>
    </div>
  );
}
